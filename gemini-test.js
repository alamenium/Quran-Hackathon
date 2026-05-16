// test-gemini.js
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const model = process.env.GEMINI_MODEL;

async function main() {
  const response = await ai.models.generateContent({
    model,
    contents: "Reply with: Gemini API is working.",
  });

  console.log(response.text);
}

main().catch(console.error);