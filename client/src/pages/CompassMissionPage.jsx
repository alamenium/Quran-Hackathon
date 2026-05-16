// /compass/:id — the Compass Mission player.
//
// Stages, in order:
//   1. opening — child sees the real-life problem and picks an answer
//                (any answer; this is BEFORE the lenses).
//   2. lens-0 .. lens-(N-1) — each lens shows content + a quick check.
//                The compass wheel shows progress. When a lens passes,
//                its wedge lights up.
//   3. closing — same scene returns; child picks the Quran Compass answer.
//   4. card — the saved "My Quran Compass" card. Saved to localStorage so
//                it shows up on the Toolkit page.

import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { CompassWheel } from '../components/CompassWheel.jsx';

export default function CompassMissionPage() {
  const { id } = useParams();
  const [mission, setMission] = useState(null);
  const [loadError, setLoadError] = useState(null);

  // Stage = 'opening' | { kind: 'lens', i: number } | 'closing' | 'card'
  const [stage, setStage] = useState('opening');
  const [openingChoice, setOpeningChoice] = useState(null);
  const [unlocked, setUnlocked] = useState(0);
  const [closingChoice, setClosingChoice] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .compassMission(id)
      .then((d) => !cancelled && setMission(d))
      .catch((e) => !cancelled && setLoadError(e.message || 'Failed to load mission'));
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loadError) {
    return (
      <div className="max-w-screen-md mx-auto px-4 pt-6">
        <div className="text-sm text-accent-pink bg-accent-pink/10 border-2 border-accent-pink/30 rounded-2xl p-3">
          {loadError}
        </div>
        <Link to="/compass" className="duo-btn-ghost mt-4 inline-block">← Back</Link>
      </div>
    );
  }
  if (!mission) {
    return <div className="max-w-screen-md mx-auto px-4 pt-6 text-ink-soft">Loading…</div>;
  }

  const lensIndex = stage?.kind === 'lens' ? stage.i : null;
  const wheelLenses = mission.lenses.map((l) => ({
    id: l.id,
    emoji: l.emoji,
    title: l.title,
  }));

  const goToFirstLens = () => setStage({ kind: 'lens', i: 0 });
  const advanceFromLens = () => {
    const next = lensIndex + 1;
    setUnlocked((u) => Math.max(u, next));
    if (next >= mission.lenses.length) setStage('closing');
    else setStage({ kind: 'lens', i: next });
  };

  // Save the final card to localStorage when the user reaches it.
  const saveCard = () => {
    try {
      const key = 'aq_compass_cards';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const without = existing.filter((c) => c.missionId !== mission.id);
      const entry = {
        missionId: mission.id,
        missionTitle: mission.title,
        emoji: mission.emoji,
        savedAt: new Date().toISOString(),
        card: mission.card,
      };
      localStorage.setItem(key, JSON.stringify([...without, entry]));
    } catch {
      /* localStorage unavailable — not critical */
    }
  };

  return (
    <div className="max-w-screen-md mx-auto px-4 pt-4 pb-28">
      <Breadcrumb mission={mission} />

      <div className="my-3">
        <CompassWheel
          lenses={wheelLenses}
          unlocked={unlocked}
          active={lensIndex}
        />
      </div>

      {stage === 'opening' && (
        <ProblemScene
          mission={mission}
          scene={mission.opening}
          phase="opening"
          chosen={openingChoice}
          onChoose={setOpeningChoice}
          onContinue={goToFirstLens}
        />
      )}

      {stage?.kind === 'lens' && (
        <LensCard
          // key on lens.id so the local `chosen` state resets between lenses
          // — otherwise the previously-selected option index stays applied.
          key={mission.lenses[lensIndex].id}
          mission={mission}
          lens={mission.lenses[lensIndex]}
          index={lensIndex}
          total={mission.lenses.length}
          onPass={advanceFromLens}
        />
      )}

      {stage === 'closing' && (
        <ProblemScene
          mission={mission}
          scene={mission.closing}
          phase="closing"
          chosen={closingChoice}
          onChoose={setClosingChoice}
          onContinue={() => {
            saveCard();
            setStage('card');
          }}
        />
      )}

      {stage === 'card' && <CompassCard mission={mission} />}
    </div>
  );
}

// ---------------------------------------------------------------------------

function Breadcrumb({ mission }) {
  return (
    <div className="flex items-center gap-2 text-xs text-ink-faint">
      <Link to="/compass" className="hover:underline">Compass</Link>
      <span>›</span>
      <span className="font-bold text-ink-soft">{mission.title}</span>
    </div>
  );
}

function ProblemScene({ mission, scene, phase, chosen, onChoose, onContinue }) {
  const isClosing = phase === 'closing';
  const correctChosen = chosen != null && scene.options[chosen].correct;
  return (
    <section className="bg-paper border-2 border-gray-100 rounded-3xl p-5 mt-3">
      <div className="text-xs uppercase font-extrabold text-accent-gold mb-1">
        {isClosing ? 'Same problem — open compass' : 'Real-life problem'}
      </div>
      <p className="text-lg text-ink leading-relaxed">{scene.scene}</p>
      <p className="text-base font-bold text-ink mt-3">{scene.prompt}</p>

      <div className="grid gap-2 mt-4">
        {scene.options.map((opt, i) => {
          const isChosen = chosen === i;
          const showResult = chosen != null;
          let cls = 'duo-btn-ghost text-left';
          if (showResult && opt.correct) cls = 'duo-btn-primary text-left';
          else if (isChosen && !opt.correct) cls = 'duo-btn-ghost text-left border-accent-pink text-accent-pink';
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChoose(i)}
              disabled={chosen != null}
              className={cls}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {chosen != null && (
        <div className="mt-3 text-sm text-ink bg-cream border-2 border-accent-gold/40 rounded-2xl p-3">
          {scene.options[chosen].feedback}
        </div>
      )}

      {chosen != null && (
        <div className="mt-4 flex justify-end">
          {isClosing && !correctChosen ? (
            <button
              type="button"
              onClick={() => onChoose(null)}
              className="duo-btn-ghost"
            >
              Try the compass again
            </button>
          ) : (
            <button type="button" onClick={onContinue} className="duo-btn-primary">
              {isClosing ? 'See my Compass card →' : 'Open the Compass →'}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function LensCard({ mission, lens, index, total, onPass }) {
  const [chosen, setChosen] = useState(null);
  const correct = chosen != null && lens.check?.options[chosen]?.correct;
  const wrong = chosen != null && !correct;

  return (
    <section className="bg-paper border-2 border-gray-100 rounded-3xl p-5 mt-3">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-xs uppercase font-extrabold text-accent-purple">
            Lens {index + 1} of {total}
          </div>
          <h2 className="text-xl font-extrabold text-ink mt-1">
            <span className="mr-2" aria-hidden>{lens.emoji}</span>
            {lens.title}
          </h2>
        </div>
      </div>

      {lens.intro && (
        <p className="text-sm text-ink-soft font-semibold mt-2">{lens.intro}</p>
      )}

      <div className="mt-3 text-ink leading-relaxed">{lens.content}</div>

      {/* Optional rich content per lens type */}
      {Array.isArray(lens.words) && (
        <ul className="grid sm:grid-cols-2 gap-2 mt-4">
          {lens.words.map((w, i) => (
            <li
              key={i}
              className="bg-cream border-2 border-accent-gold/40 rounded-2xl p-3"
            >
              <div className="font-arabic text-2xl text-ink text-right" dir="rtl">
                {w.ar}
              </div>
              <div className="text-sm text-ink-soft mt-1">{w.en}</div>
            </li>
          ))}
        </ul>
      )}

      {lens.nameAr && (
        <div className="bg-cream border-2 border-accent-gold/40 rounded-2xl p-4 mt-4 text-center">
          <div className="font-arabic text-4xl text-ink" dir="rtl">{lens.nameAr}</div>
          <div className="text-sm font-bold text-ink-soft mt-1">{lens.nameEn}</div>
        </div>
      )}

      {lens.verse && (
        <div className="bg-cream border-2 border-accent-gold/40 rounded-2xl p-4 mt-4">
          <div
            className="font-arabic text-2xl text-ink text-right leading-loose"
            dir="rtl"
          >
            {lens.verse.text_uthmani}
          </div>
          {lens.verse.translation && (
            <div className="text-sm text-ink-soft mt-2">
              {lens.verse.translation}
            </div>
          )}
          <div className="text-xs font-bold text-ink-faint mt-2">
            {lens.verse.verse_key}
          </div>
        </div>
      )}

      {Array.isArray(lens.sortItems) && (
        <ul className="grid gap-2 mt-4">
          {lens.sortItems.map((it, i) => (
            <li
              key={i}
              className={`bg-white border-2 rounded-2xl p-3 text-sm ${
                it.shukr ? 'border-brand-500/40' : 'border-accent-pink/40'
              }`}
            >
              <span className="mr-2 font-extrabold">
                {it.shukr ? '✓ Shukr' : '✗ Showing off'}
              </span>
              {it.text}
            </li>
          ))}
        </ul>
      )}

      {/* Quick check */}
      {lens.check && (
        <div className="mt-5 border-t border-gray-100 pt-4">
          <div className="text-xs font-extrabold uppercase text-ink-faint mb-2">
            Quick check
          </div>
          <p className="font-bold text-ink mb-2">{lens.check.prompt}</p>
          <div className="grid gap-2">
            {lens.check.options.map((opt, i) => {
              const isChosen = chosen === i;
              const showResult = chosen != null;
              let cls = 'duo-btn-ghost text-left';
              if (showResult && opt.correct) cls = 'duo-btn-primary text-left';
              else if (isChosen && !opt.correct)
                cls = 'duo-btn-ghost text-left border-accent-pink text-accent-pink';
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setChosen(i)}
                  disabled={chosen != null}
                  className={cls}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          {wrong && (
            <div className="text-sm text-accent-pink mt-2">
              Not quite — re-read the lens above and try again.
              <button
                type="button"
                onClick={() => setChosen(null)}
                className="ml-2 underline font-bold"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onPass}
          disabled={lens.check ? !correct : false}
          className="duo-btn-primary"
        >
          {index + 1 >= total ? 'Return to the problem →' : 'Unlock next lens →'}
        </button>
      </div>
    </section>
  );
}

function CompassCard({ mission }) {
  const card = mission.card;
  const lines = card?.lines || [];
  return (
    <section className="mt-4">
      <div className="text-center mb-3">
        <div className="text-5xl">🌟</div>
        <h2 className="text-2xl font-extrabold text-ink mt-2">
          You earned your Compass card
        </h2>
        <p className="text-ink-soft text-sm">
          Saved to your Toolkit so you can open it again any time.
        </p>
      </div>
      <div className="bg-gradient-to-br from-cream to-paper border-2 border-accent-gold rounded-3xl p-6 shadow-card">
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-lg font-extrabold text-ink">
            <span className="mr-2" aria-hidden>{mission.emoji}</span>
            {card.title}
          </h3>
        </div>
        <ol className="list-none space-y-2">
          {lines.map((line, i) => (
            <li key={i} className="text-ink leading-relaxed">
              {line}
            </li>
          ))}
        </ol>
        {card.ayah && (
          <div className="mt-5 border-t border-accent-gold/40 pt-4 text-right">
            <div
              className="font-arabic text-2xl text-ink leading-loose"
              dir="rtl"
            >
              {card.ayah}
            </div>
            {card.ayahEn && (
              <div className="text-sm text-ink-soft mt-1 text-left">
                "{card.ayahEn}"
              </div>
            )}
            {card.ayahRef && (
              <div className="text-xs font-bold text-ink-faint mt-1 text-left">
                {card.ayahRef}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-5">
        <Link to="/toolkit" className="duo-btn-primary">Open Toolkit</Link>
        <Link to="/compass" className="duo-btn-ghost">More missions</Link>
      </div>
    </section>
  );
}
