import { useMemo, useState } from 'react';

// Tap-to-arrange ordering. Mobile-friendly alternative to drag-and-drop:
// users tap items in the order they should appear; a numbered slot tracks
// the choice. Easier to do correctly on touch screens than HTML5 DnD.
export function OrderEvents({ question, onAnswer, locked }) {
  const initialItems = useMemo(
    () => [...question.items].sort(() => Math.random() - 0.5),
    [question]
  );
  const [order, setOrder] = useState([]); // array of item ids

  const remaining = initialItems.filter((it) => !order.includes(it.id));

  const pick = (id) => {
    if (locked) return;
    setOrder((o) => [...o, id]);
  };
  const undo = (idx) => {
    if (locked) return;
    setOrder((o) => o.filter((_, i) => i !== idx));
  };

  const submit = () => {
    if (order.length !== question.items.length || locked) return;
    const correctOrder = question.items.map((it) => it.id);
    const correct = order.every((id, i) => id === correctOrder[i]);
    onAnswer({
      correct,
      pickedText: order
        .map((id) => question.items.find((it) => it.id === id)?.display || question.items.find((it) => it.id === id)?.text)
        .join(' → '),
      correctText: correctOrder
        .map((id) => question.items.find((it) => it.id === id)?.display || question.items.find((it) => it.id === id)?.text)
        .join(' → '),
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-extrabold text-ink">{question.prompt}</h2>

      <div className="bg-paper border-2 border-dashed border-gray-300 rounded-2xl p-3 min-h-[120px]">
        {order.length === 0 && (
          <div className="text-sm text-ink-faint text-center py-6">
            Tap items below in the right order
          </div>
        )}
        <ol className="flex flex-col gap-2">
          {order.map((id, idx) => {
            const item = question.items.find((it) => it.id === id);
            const label = item?.display || item?.text;
            return (
              <li key={id + idx}>
                <button
                  type="button"
                  onClick={() => undo(idx)}
                  className="answer-card w-full text-left selected"
                >
                  <span className="font-bold mr-2">{idx + 1}.</span>
                  <span dir="auto">{label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="flex flex-col gap-2">
        {remaining.map((it) => (
          <button
            key={it.id}
            type="button"
            onClick={() => pick(it.id)}
            className="answer-card text-left"
          >
            <span dir="auto">{it.display || it.text}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={order.length !== question.items.length || locked}
        className="duo-btn-primary"
      >
        Check
      </button>
    </div>
  );
}
