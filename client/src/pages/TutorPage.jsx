import { useState, useRef, useEffect } from 'react';
import { Character } from '../components/Character.jsx';
import { api } from '../lib/api.js';

export default function TutorPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Assalamu Alaikum! I'm your Quran learning helper. I can answer questions about what you've learned in your lessons — vocabulary, meanings, and stories. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState(null);
  const [lessonContext, setLessonContext] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.aiStatus().then(d => setConfigured(d.configured)).catch(() => setConfigured(false));
    // Pick up a quran.ai-grounded lesson context written by QuestPage on
    // lesson completion. If present, prepend a one-line system-style
    // greeting so the child sees the tutor knows which lesson they're on.
    try {
      const raw = localStorage.getItem('aq_last_lesson_context');
      if (raw) {
        const ctx = JSON.parse(raw);
        if (ctx?.source?.generatedWith === 'quran.ai') {
          setLessonContext(ctx);
          setMessages((m) => [
            ...m,
            {
              role: 'assistant',
              text: `I'll answer using the ayah and lesson sources in this quest (${ctx.title} · ${ctx.verseKey}). For rulings, please ask a qualified scholar.`,
              grounded: true,
            },
          ]);
        }
      }
    } catch { /* non-fatal */ }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const userMsg = { role: 'user', text };
    setMessages(m => [...m, userMsg]);
    setLoading(true);
    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const res = await api.tutorAsk(text, history, lessonContext);
      setMessages(m => [...m, { role: 'assistant', text: res.text, refused: res.refused }]);
    } catch (err) {
      setMessages(m => [...m, {
        role: 'assistant',
        text: "I'm having trouble connecting right now. Please try again in a moment.",
        error: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="flex flex-col h-screen bg-paper pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <Character emotion="quran_reading" size={48} />
        <div>
          <div className="font-extrabold text-ink">Quran Learning Helper</div>
          <div className="text-xs text-ink-soft">
            {configured === null
              ? 'Checking…'
              : configured
              ? 'AI-powered · asks only about lesson content'
              : 'Basic mode — AI not configured'}
          </div>
        </div>
      </div>

      {/* Not-configured banner */}
      {configured === false && (
        <div className="bg-accent-orange/10 border-b border-accent-orange/30 px-4 py-2 text-xs text-ink text-center">
          Add <code className="bg-white px-1 rounded">GEMINI_API_KEY</code> to your <code>.env</code> to enable the AI tutor.
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 max-w-screen-md mx-auto w-full">
        {messages.map((msg, i) => (
          <Bubble key={i} msg={msg} />
        ))}
        {loading && (
          <div className="flex items-end gap-2">
            <Character emotion="think" size={40} />
            <div className="bg-white border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm text-ink-soft animate-pulse">
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3"
        style={{ paddingBottom: 'calc(0.75rem + var(--safe-bottom))' }}>
        <div className="flex gap-2 max-w-screen-md mx-auto">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask a question about the lesson…"
            rows={1}
            className="flex-1 rounded-2xl border-2 border-gray-200 px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-brand-500 resize-none"
          />
          <button
            type="button"
            onClick={send}
            disabled={!input.trim() || loading}
            className="duo-btn-primary px-5 py-2.5 text-sm"
          >
            Ask
          </button>
        </div>
        <div className="text-center text-[10px] text-ink-faint mt-1 max-w-screen-md mx-auto">
          This helper answers questions about lesson content only. For fatwas or rulings, please ask a qualified scholar.
        </div>
      </div>
    </div>
  );
}

function Bubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && <Character emotion={msg.refused ? 'think' : 'smile'} size={40} />}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
          isUser
            ? 'bg-brand-500 text-white rounded-br-sm'
            : msg.refused
            ? 'bg-accent-orange/10 border-2 border-accent-orange/30 text-ink rounded-bl-sm'
            : msg.error
            ? 'bg-accent-pink/10 border-2 border-accent-pink/20 text-ink rounded-bl-sm'
            : 'bg-white border-2 border-gray-100 text-ink rounded-bl-sm'
        }`}
      >
        {msg.refused && (
          <div className="text-xs uppercase font-extrabold text-accent-orange mb-1">Fatwa question</div>
        )}
        <div className="leading-relaxed whitespace-pre-wrap">{msg.text}</div>
      </div>
    </div>
  );
}
