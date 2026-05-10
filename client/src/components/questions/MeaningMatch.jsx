import { useEffect, useMemo, useState } from 'react';

// Pair Arabic words with their English meanings. Tap an Arabic word, then
// tap its meaning. Pairs that match flash green and lock; mismatches flash
// red and reset.
export function MeaningMatch({ question, onAnswer, locked }) {
  const pairs = question.pairs;

  const arabicCards = useMemo(
    () => pairs.map((p, i) => ({ id: 'a' + i, text: p.arabic, key: p.arabic })),
    [pairs]
  );
  const meaningCards = useMemo(() => {
    const arr = pairs.map((p, i) => ({ id: 'm' + i, text: p.meaning, key: p.arabic }));
    // shuffle once on mount
    return [...arr].sort(() => Math.random() - 0.5);
  }, [pairs]);

  const [matched, setMatched] = useState(new Set()); // pair keys solved
  const [pickArabic, setPickArabic] = useState(null);
  const [pickMeaning, setPickMeaning] = useState(null);
  const [flash, setFlash] = useState(null); // { kind: 'good'|'bad', keys: [] }
  const [mistakes, setMistakes] = useState(0);

  useEffect(() => {
    if (pickArabic && pickMeaning) {
      const a = arabicCards.find((c) => c.id === pickArabic);
      const m = meaningCards.find((c) => c.id === pickMeaning);
      if (a && m && a.key === m.key) {
        setFlash({ kind: 'good', keys: [a.key] });
        setTimeout(() => {
          setMatched((prev) => new Set([...prev, a.key]));
          setFlash(null);
          setPickArabic(null);
          setPickMeaning(null);
        }, 350);
      } else {
        setFlash({ kind: 'bad', keys: [a?.key, m?.key] });
        setMistakes((n) => n + 1);
        setTimeout(() => {
          setFlash(null);
          setPickArabic(null);
          setPickMeaning(null);
        }, 500);
      }
    }
  }, [pickArabic, pickMeaning, arabicCards, meaningCards]);

  useEffect(() => {
    if (matched.size === pairs.length && !locked) {
      // Done. Considered correct if no more than 1 mismatch.
      onAnswer({
        correct: mistakes <= 1,
        mistakes,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matched]);

  const cardClass = (card, side) => {
    const isMatched = matched.has(card.key);
    const isPicked =
      (side === 'a' && pickArabic === card.id) ||
      (side === 'm' && pickMeaning === card.id);
    const isFlashing = flash?.keys?.includes(card.key);
    let extra = '';
    if (isMatched) extra = 'opacity-30 pointer-events-none';
    else if (isFlashing && flash.kind === 'good') extra = 'correct';
    else if (isFlashing && flash.kind === 'bad') extra = 'incorrect animate-shake';
    else if (isPicked) extra = 'selected';
    return `answer-card text-center ${extra}`;
  };

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-extrabold text-ink">{question.prompt}</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-3">
          {arabicCards.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => !locked && !matched.has(card.key) && setPickArabic(card.id)}
              className={cardClass(card, 'a')}
            >
              <span className="font-arabic text-2xl">{card.text}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {meaningCards.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => !locked && !matched.has(card.key) && setPickMeaning(card.id)}
              className={cardClass(card, 'm')}
            >
              <span className="text-sm font-bold">{card.text}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="text-xs text-ink-soft text-center">
        Tap an Arabic word, then tap its meaning.
      </div>
    </div>
  );
}
