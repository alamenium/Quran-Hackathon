import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Character } from '../components/Character.jsx';
import { SpeechBubble } from '../components/SpeechBubble.jsx';
import { useProgress } from '../context/ProgressContext.jsx';
import { listCharacters, characterImage } from '../lib/characters.js';

const STEPS = ['intro', 'character', 'ready'];

export default function WelcomePage() {
  const navigate = useNavigate();
  const { setCharacter, user } = useProgress();
  const [step, setStep] = useState(0);
  const [pickedId, setPickedId] = useState(user?.character || 'boy1');

  const next = async () => {
    if (step === 1) {
      // commit character choice
      await setCharacter(pickedId);
    }
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      navigate('/diagnostic');
    }
  };

  const characters = listCharacters();

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-6 max-w-screen-md mx-auto">
      {step === 0 && (
        <div className="flex flex-col items-center text-center gap-5 flex-1 justify-center">
          <Character emotion="happy" size={220} />
          <h1 className="text-3xl font-extrabold text-ink">
            Welcome to AyahQuest!
          </h1>
          <p className="text-ink-soft max-w-sm">
            Learn the Quran through short, friendly quests. Listen, understand
            words, and reflect — one ayah at a time.
          </p>
          <button onClick={next} className="duo-btn-primary w-full max-w-sm">
            Let's Begin
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-4 w-full flex-1">
          <div className="flex items-end gap-3 mb-2">
            <Character emotion="smile" size={120} />
            <SpeechBubble>
              <div className="font-bold text-ink">
                Pick your learning friend!
              </div>
            </SpeechBubble>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {characters.map((char) => (
              <button
                key={char.id}
                type="button"
                onClick={() => setPickedId(char.id)}
                className={`rounded-3xl border-2 p-3 text-center bg-white transition ${
                  pickedId === char.id
                    ? 'border-brand-500 shadow-card'
                    : 'border-gray-200'
                }`}
              >
                <img
                  src={characterImage(char.id, 'smile')}
                  alt={char.name}
                  className="w-32 h-32 mx-auto object-contain"
                />
                <div className="font-extrabold text-ink mt-2">{char.name}</div>
                <div className="text-xs text-ink-soft">{char.description}</div>
              </button>
            ))}
          </div>

          {characters.length === 1 && (
            <div className="text-xs text-ink-faint text-center mt-2">
              More characters coming soon — drop a folder in
              <code className="mx-1 bg-paper px-1 rounded">/characters/</code>
              to add your own.
            </div>
          )}

          <button onClick={next} className="duo-btn-primary mt-4">
            That's me!
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col items-center text-center gap-5 flex-1 justify-center">
          <Character emotion="star" size={220} />
          <h2 className="text-2xl font-extrabold text-ink">
            One quick check-in
          </h2>
          <p className="text-ink-soft max-w-sm">
            Six fast questions help us start you in the right place. There's no
            wrong answer — every level is welcome here.
          </p>
          <button onClick={next} className="duo-btn-primary w-full max-w-sm">
            Start the Quick Test
          </button>
        </div>
      )}
    </div>
  );
}
