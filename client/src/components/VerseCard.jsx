import { AudioButton } from './AudioButton.jsx';

// Reusable verse card showing Arabic text, optional translation, and audio.
export function VerseCard({
  verse,
  showTranslation = true,
  showAudio = true,
  showTafsir = false,
  compact = false,
}) {
  if (!verse) return null;
  return (
    <div
      className={`bg-cream border-2 border-accent-gold/40 rounded-3xl ${
        compact ? 'p-4' : 'p-5 sm:p-6'
      } shadow-card`}
    >
      <div
        className={`font-arabic text-right ${
          compact ? 'text-2xl' : 'text-3xl sm:text-4xl'
        } text-ink leading-loose mb-3`}
      >
        {verse.text_uthmani}
      </div>
      {showTranslation && verse.translation && (
        <div className="text-ink-soft text-base font-semibold mb-3">
          {verse.translation}
        </div>
      )}
      {showTafsir && verse.tafsir_simple && (
        <div className="bg-white rounded-2xl p-3 border border-gray-100 mb-3">
          <div className="text-xs font-extrabold uppercase text-accent-purple mb-1">
            Simple Meaning
          </div>
          <div className="text-sm text-ink">{verse.tafsir_simple}</div>
        </div>
      )}
      <div className="flex items-center justify-between">
        {showAudio && verse.audio_url && (
          <AudioButton src={verse.audio_url} label="Listen" />
        )}
        <div className="text-xs font-bold text-ink-faint">{verse.verse_key}</div>
      </div>
    </div>
  );
}
