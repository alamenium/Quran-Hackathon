// Subtle "Verified with quran.ai" badge used wherever source-grounded content
// from the quran.ai content pack is shown (quest cards, word cards, lesson
// completion). Kept small and tasteful so it doesn't clutter the UI.

export function SourceBadge({ source, variant = 'inline', className = '' }) {
  if (!source || source.generatedWith !== 'quran.ai') return null;

  const tooltip = [
    `Quran text: ${source.quranEdition || 'ar-simple-clean'}`,
    `Translation: ${source.translationEdition || 'en-abdel-haleem'}`,
    source.tafsirSources?.length
      ? `Tafsir: ${source.tafsirSources.join(', ')}`
      : null,
  ]
    .filter(Boolean)
    .join('\n');

  if (variant === 'card') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-600 ${className}`}
        title={tooltip}
      >
        <span aria-hidden>✦</span>
        Source-grounded · quran.ai
      </div>
    );
  }

  // inline (default)
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-600 border border-brand-500/20 ${className}`}
      title={tooltip}
    >
      <span aria-hidden>✦</span>
      Verified · quran.ai
    </span>
  );
}

// A small expandable "source card" for the end of a quran.ai-powered lesson.
export function SourceCard({ source, primaryAyah, theme }) {
  if (!source || source.generatedWith !== 'quran.ai') return null;
  return (
    <div className="bg-cream border-2 border-brand-500/30 rounded-2xl p-4 text-left max-w-sm w-full">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-brand-600 text-lg" aria-hidden>✦</span>
        <div className="text-xs uppercase font-extrabold text-brand-600 tracking-wide">
          Source-grounded Quran content
        </div>
      </div>
      {primaryAyah && (
        <div className="text-sm text-ink mb-1">
          <span className="font-bold">Today's ayah:</span> {primaryAyah}
        </div>
      )}
      {theme && (
        <div className="text-sm text-ink mb-1">
          <span className="font-bold">Theme:</span> {theme}
        </div>
      )}
      <div className="text-xs text-ink-soft mt-2 leading-relaxed">
        Quran text from <span className="font-bold">{source.quranEdition}</span>.
        Translation from <span className="font-bold">{source.translationEdition}</span>.
        {source.tafsirSources?.length ? (
          <>
            {' '}
            Child-friendly explanation derived from tafsir editions{' '}
            <span className="font-bold">{source.tafsirSources.join(', ')}</span>.
          </>
        ) : null}
      </div>
      <div className="text-[10px] text-ink-faint mt-2">
        Verified with quran.ai · cached locally for demo reliability
      </div>
    </div>
  );
}
