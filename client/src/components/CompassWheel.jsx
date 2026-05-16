// CompassWheel — circular SVG with 6 wedges, one per Compass lens.
//
// Props:
//   lenses    [{id, emoji, title}]   — the six lenses (in order).
//   unlocked  number                 — index up to which wedges are lit (0..6).
//   active    number | null          — index of the wedge to highlight.
//
// Visual:
//   - Locked wedges: faint grey outline.
//   - Unlocked wedges: filled with the brand colour, gold ring around them.
//   - Active wedge: brighter pulsing gold.
//   - Centre: a small Quran icon (📖) plus a label "Compass".

import React from 'react';

const SIZE = 240;
const CENTRE = SIZE / 2;
const OUTER = 100;
const INNER = 40;

function polar(r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: CENTRE + r * Math.cos(rad), y: CENTRE + r * Math.sin(rad) };
}

function wedgePath(startDeg, endDeg) {
  const o1 = polar(OUTER, startDeg);
  const o2 = polar(OUTER, endDeg);
  const i1 = polar(INNER, endDeg);
  const i2 = polar(INNER, startDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${o1.x} ${o1.y}`,
    `A ${OUTER} ${OUTER} 0 ${large} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${INNER} ${INNER} 0 ${large} 0 ${i2.x} ${i2.y}`,
    'Z',
  ].join(' ');
}

export function CompassWheel({ lenses = [], unlocked = 0, active = null }) {
  const n = lenses.length || 6;
  const step = 360 / n;
  return (
    <div className="flex justify-center">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width={SIZE}
        height={SIZE}
        aria-label="Quran Compass progress"
      >
        {/* Outer ring */}
        <circle
          cx={CENTRE}
          cy={CENTRE}
          r={OUTER + 6}
          fill="none"
          stroke="#E5DCC2"
          strokeWidth="2"
        />

        {/* Wedges */}
        {lenses.map((lens, i) => {
          const start = i * step;
          const end = (i + 1) * step;
          const isUnlocked = i < unlocked;
          const isActive = active === i;
          const fill = isActive
            ? '#FFC400'
            : isUnlocked
            ? '#58CC02'
            : '#F1EAD2';
          const stroke = isActive ? '#FFB300' : '#E5DCC2';
          return (
            <g key={lens.id || i}>
              <path
                d={wedgePath(start + 1, end - 1)}
                fill={fill}
                stroke={stroke}
                strokeWidth="2"
                className={isActive ? 'animate-pulse-soft' : ''}
                opacity={isUnlocked || isActive ? 1 : 0.55}
              />
              {(() => {
                const mid = (start + end) / 2;
                const labelPos = polar((OUTER + INNER) / 2, mid);
                return (
                  <text
                    x={labelPos.x}
                    y={labelPos.y + 6}
                    textAnchor="middle"
                    fontSize="20"
                    opacity={isUnlocked || isActive ? 1 : 0.4}
                  >
                    {lens.emoji || '•'}
                  </text>
                );
              })()}
            </g>
          );
        })}

        {/* Centre disc */}
        <circle
          cx={CENTRE}
          cy={CENTRE}
          r={INNER - 4}
          fill="#FFFAF0"
          stroke="#E5DCC2"
          strokeWidth="2"
        />
        <text
          x={CENTRE}
          y={CENTRE - 2}
          textAnchor="middle"
          fontSize="20"
        >
          🧭
        </text>
        <text
          x={CENTRE}
          y={CENTRE + 14}
          textAnchor="middle"
          fontSize="9"
          fontWeight="800"
          fill="#7A7563"
        >
          {unlocked}/{n}
        </text>
      </svg>
    </div>
  );
}
