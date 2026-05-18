import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// loads Quran-Hackathon/.env
const envPath = path.resolve(__dirname, "../../../.env");
const envResult = dotenv.config({ path: envPath });

console.log("ENV path:", envPath);
console.log("ENV loaded:", !envResult.error);

const router = express.Router();

const voiceMap = {
  girl: process.env.ELEVENLABS_GIRL_VOICE_ID || "XJ2fW4ybq7HouelYYGcL",
  boy: process.env.ELEVENLABS_BOY_VOICE_ID || "4NJLA7OQNVkeKe4jVdHw",
  teacher: process.env.ELEVENLABS_TEACHER_VOICE_ID || "g14YnDYCsy3k7XLlcKlO",
};

router.post("/speak", async (req, res) => {
  try {
    const { text, voice = "girl", mode = "lesson" } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text is required." });
    }

    const voiceId = voiceMap[voice];

    if (!voiceId) {
      return res.status(400).json({ error: "Invalid voice." });
    }

    const modelId = mode === "story" ? "eleven_v3" : "eleven_flash_v2_5";

    const apiKey = process.env.ELEVENLABS_API_KEY;

console.log("ElevenLabs key loaded:", Boolean(apiKey));
console.log("ElevenLabs key length:", apiKey?.length); 

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
        }),
      }
    );

   if (!response.ok) {
  const errorText = await response.text();
  console.error("ElevenLabs error:", response.status, errorText);
  return res.status(response.status).json({ error: errorText });
}

    const audioBuffer = Buffer.from(await response.arrayBuffer());

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    return res.send(audioBuffer);
  } catch (error) {
    console.error("ElevenLabs TTS error:", error);
    return res.status(500).json({ error: "Text-to-speech failed." });
  }
});

export default router;