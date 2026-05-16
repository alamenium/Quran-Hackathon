// Heart Lab — sort each action into the right Heart bucket.
//
// Shape:
//   question = {
//     type: 'heart_lab_sort',
//     prompt,
//     buckets: [{id, label, emoji}, ...]   // usually two: thankful / forgetful
//     items:   [{text, bucket}, ...]       // canonical bucket = the right answer
//   }
//
// UX:
//   - Items start in a centre pile.
//   - The child taps an item, then taps the bucket they think it belongs in.
//     (Tap-to-place is simpler and more accessible than drag-and-drop, and
//     works just as well on phones.)
//   - Correct placements lock in (green border, ✓). Wrong placements bounce
//     back to the pile with a gentle red flash so the child can try again.
//   - When every item is correctly placed, the Continue button enables.

import { useMemo, useState } from 'react';

export function HeartLabSort({ question, onAnswer, locked }) {
  const buckets = question.buckets || [];
  const items = useMemo(
    () => (question.items || []).map((it, i) => ({ ...it, _id: i })),
    [question]
  );

  // placed[itemId] = bucketId. Only correct placements end up here.
  const [placed, setPlaced] = useState({});
  const [picked, setPicked] = useState(null);   // item _id currently selected
  const [flash, setFlash] = useState(null);     // item _id flashing red

  const allDone = items.every((it) => placed[it._id]);

  const pileItems = items.filter((it) => !placed[it._id]);

  const handleBucketTap = (bucketId) => {
    if (locked || picked == null) return;
    const item = items.find((it) => it._id === picked);
    if (!item) return;

    if (item.bucket === bucketId) {
      setPlaced((p) => ({ ...p, [item._id]: bucketId }));
      setPicked(null);
    } else {
      setFlash(item._id);
      setPicked(null);
      setTimeout(() => setFlash((f) => (f === item._id ? null : f)), 500);
    }
  };

  const submit = () => {
    if (!allDone || locked) return;
    onAnswer({
      correct: true,
      noFeedback: true,
      // Pickedtext for the mistakes log if any single placement failed —
      // we don't currently track wrong attempts, so leave blank.
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-extrabold text-ink">{question.prompt}</h2>

      {/* Buckets at the top so they're always visible on a phone */}
      <div className="grid grid-cols-2 gap-3">
        {buckets.map((b) => {
          const inBucket = items.filter((it) => placed[it._id] === b.id);
          const isThankful = b.id === 'thankful';
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => handleBucketTap(b.id)}
              disabled={locked || picked == null}
              className={`text-left rounded-3xl p-3 border-2 transition min-h-[140px] flex flex-col ${
                isThankful
                  ? 'bg-[#FFF8E7] border-[#F9C74F]'
                  : 'bg-gray-100 border-gray-300'
              } ${picked != null && !locked ? 'ring-2 ring-accent-blue/40' : ''}`}
            >
              <div className="flex items-baseline justify-between mb-2">
                <div className="font-extrabold text-ink text-sm">
                  <span className="mr-1" aria-hidden>{b.emoji}</span>
                  {b.label}
                </div>
                <div className="text-[10px] uppercase font-bold text-ink-faint">
                  {inBucket.length}
                </div>
              </div>
              <ul className="space-y-1.5">
                {inBucket.map((it) => (
                  <li
                    key={it._id}
                    className={`text-xs rounded-xl px-2 py-1.5 border ${
                      isThankful
                        ? 'bg-white border-brand-500/30 text-ink'
                        : 'bg-white border-gray-300 text-ink-soft line-through opacity-70'
                    }`}
                  >
                    {isThankful ? '✓ ' : '✗ '}
                    {it.text}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <div className="text-xs text-ink-soft text-center">
        {picked != null
          ? 'Now tap the heart this action belongs to.'
          : pileItems.length > 0
          ? 'Tap an action below, then tap the heart it belongs to.'
          : 'All sorted — beautiful work!'}
      </div>

      {/* The centre pile of un-placed actions */}
      <ul className="grid gap-2">
        {pileItems.map((it) => {
          const isPicked = picked === it._id;
          const isFlashing = flash === it._id;
          return (
            <li key={it._id}>
              <button
                type="button"
                onClick={() => setPicked(isPicked ? null : it._id)}
                disabled={locked}
                className={`w-full text-left rounded-2xl border-2 px-3 py-3 text-sm transition ${
                  isFlashing
                    ? 'border-accent-pink bg-accent-pink/10'
                    : isPicked
                    ? 'border-accent-blue bg-accent-blue/10'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {it.text}
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={submit}
        disabled={!allDone || locked}
        className="duo-btn-primary"
      >
        {allDone ? 'Continue →' : `Sort all actions to continue (${Object.keys(placed).length}/${items.length})`}
      </button>
    </div>
  );
}
