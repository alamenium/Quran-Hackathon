// Gemini AI service.
//
// ALL calls are constrained: input is approved Quran content only.
// Gemini never invents tafsir, never issues fatwas, always cites sources.
// Uses Gemini 1.5 Flash via the REST API (no SDK needed).
//
// Set GEMINI_API_KEY in .env to enable. When absent, every function
// returns a graceful fallback so the rest of the app keeps working.

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const GEMINI_BASE = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Shared safety settings — block anything harmful.
const SAFETY = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
];

function configured() {
  return Boolean(GEMINI_API_KEY);
}

async function callGemini(systemInstruction, userText, maxTokens = 512) {
  if (!configured()) {
    return null; // caller handles fallback
  }
  const body = {
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents: [{ role: 'user', parts: [{ text: userText }] }],
    safetySettings: SAFETY,
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.3,
    },
  };
  const res = await fetch(`${GEMINI_BASE}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

// ---------------------------------------------------------------------------
// 1. Simplify tafsir to child-friendly language.
// ---------------------------------------------------------------------------
export async function simplifyTafsir({ verseKey, verseText, translation, tafsirText, targetAge = 12, source = 'Ibn Kathir' }) {
  const system = `You are an Islamic educational assistant for children.
Your ONLY job is to rewrite the provided tafsir text at a child-friendly level (age ${targetAge}).
Rules you must follow without exception:
- Use only the tafsir text provided. Do not add any interpretation of your own.
- Do not issue fatwas or religious rulings.
- Do not make up hadith, stories, or explanations not in the source text.
- Keep the explanation to 2–3 short sentences.
- End with: (Simplified from ${source})
- Write in warm, clear English suitable for children.`;

  const user = `Ayah ${verseKey}: "${verseText}"
Translation: "${translation}"
Tafsir source text: """${tafsirText}"""
Please simplify this tafsir for a child aged ${targetAge}.`;

  const result = await callGemini(system, user, 300);
  return result ?? `${tafsirText.slice(0, 200)}… (Simplified from ${source})`;
}

// ---------------------------------------------------------------------------
// 2. Generate quiz questions from lesson content.
// ---------------------------------------------------------------------------
export async function generateQuiz({ verseKey, verseText, translation, simpleTafsir, words }) {
  const system = `You are an Islamic education quiz generator for children.
Generate exactly 3 multiple-choice questions based ONLY on the provided ayah, translation, and explanation.
Rules:
- Questions must test understanding of meaning, vocabulary, or lesson theme only.
- Do not ask about fiqh, rulings, or contested interpretations.
- Each question has exactly 4 options with exactly one correct answer.
- Correct answers must come directly from the provided text.
- Output valid JSON only: { "questions": [ { "prompt": "...", "options": ["A","B","C","D"], "correctIndex": 0, "hint": "..." } ] }
- No markdown fences, no preamble.`;

  const wordList = (words || []).map(w => `${w.arabic} = ${w.meaning}`).join(', ');
  const user = `Ayah ${verseKey}: "${verseText}"
Translation: "${translation}"
Explanation: "${simpleTafsir}"
Key words: ${wordList}`;

  const raw = await callGemini(system, user, 600);
  if (!raw) return null;
  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// 3. AI Tutor — safe, source-grounded, fatwa-refusing.
// ---------------------------------------------------------------------------

const TUTOR_SYSTEM = `You are a safe, kind Islamic learning assistant for children and teens.
You help users understand Quran lessons, Arabic words, and Islamic stories.

STRICT RULES — you must follow these without exception:
1. Answer questions ONLY about what is in the lesson context provided.
2. If asked about something outside the lesson, say you don't know and suggest a qualified teacher.
3. NEVER issue fatwas, religious rulings, or legal opinions. If asked, say: "This is a question for a qualified Islamic scholar. I am only able to help with understanding this lesson."
4. NEVER invent tafsir, hadith, or Quranic interpretations not in the provided context.
5. NEVER claim to know a user's spiritual state or give personal religious verdicts.
6. If asked about Asbab an-Nuzul not in the lesson, say: "I don't have verified information about that. Please check a trusted tafsir source or ask a qualified teacher."
7. Keep answers short (2–4 sentences), warm, and age-appropriate.
8. Always cite the source when you use tafsir content (e.g., "According to the lesson explanation based on Ibn Kathir...").`;

export async function tutorAnswer({ userMessage, lessonContext, conversationHistory = [] }) {
  if (!configured()) {
    return {
      text: "The AI tutor is not available right now. Please ask your teacher for help with this question.",
      refused: false,
    };
  }

  // Detect fatwa-style questions before sending to Gemini.
  const fatwaTriggers = [
    'is it haram', 'is it halal', 'is it allowed', 'is it permitted',
    'fatwa', 'ruling on', 'what is the ruling', 'can i', 'am i allowed',
    'is this sin', 'is this a sin', 'permissible',
  ];
  const lower = userMessage.toLowerCase();
  if (fatwaTriggers.some(t => lower.includes(t))) {
    return {
      text: "That's a question about Islamic rulings (fatwa), and I'm not qualified to answer it. For questions like this, please ask a qualified Islamic scholar or a trusted teacher.",
      refused: true,
    };
  }

  const contextBlock = lessonContext
    ? `Current lesson context:\n${JSON.stringify(lessonContext, null, 2)}`
    : 'No specific lesson context provided.';

  // Build conversation history for Gemini multi-turn.
  const contents = [];
  for (const turn of conversationHistory.slice(-6)) { // last 6 turns only
    contents.push({ role: turn.role, parts: [{ text: turn.text }] });
  }
  contents.push({ role: 'user', parts: [{ text: `${contextBlock}\n\nStudent question: ${userMessage}` }] });

  const body = {
    systemInstruction: { parts: [{ text: TUTOR_SYSTEM }] },
    contents,
    safetySettings: SAFETY,
    generationConfig: { maxOutputTokens: 300, temperature: 0.2 },
  };

  const res = await fetch(`${GEMINI_BASE}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) throw new Error(`Gemini tutor ${res.status}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    || "I'm not sure about that. Please ask your teacher for help.";

  return { text, refused: false };
}

// ---------------------------------------------------------------------------
// 4. Lesson completion summary.
// ---------------------------------------------------------------------------
export async function lessonSummary({ verseKey, theme, wordsLearned, reflectionText }) {
  const system = `You are a warm Islamic learning companion for children.
Write a short, encouraging 2-sentence lesson completion message.
Rules:
- Mention what the child just learned (the ayah theme and words).
- Be warm and personal, not generic ("Great job!").
- Do NOT say things like "You are becoming a better Muslim" — do not judge spiritual state.
- Do NOT use exclamation marks more than once.
- End with an encouraging sentence about tomorrow's lesson.`;

  const user = `The child just completed a lesson on ayah ${verseKey} (theme: ${theme}).
They learned these words: ${(wordsLearned || []).join(', ')}.
Their reflection: "${reflectionText || 'not provided'}"`;

  const result = await callGemini(system, user, 150);
  return result ?? `You spent time with the Quran today learning about ${theme}. That is something worth continuing — see you tomorrow, in sha Allah.`;
}

export const gemini = { configured, simplifyTafsir, generateQuiz, tutorAnswer, lessonSummary };
