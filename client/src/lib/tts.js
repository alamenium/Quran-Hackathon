export async function playVoice(text, voice = "girl", mode = "lesson") {
  const response = await fetch("/api/tts/speak", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, voice, mode }),
  });

  if (!response.ok) {
    console.error("Voice playback failed");
    return;
  }

  const blob = await response.blob();
  const audioUrl = URL.createObjectURL(blob);
  const audio = new Audio(audioUrl);

  audio.onended = () => URL.revokeObjectURL(audioUrl);

  await audio.play();
}