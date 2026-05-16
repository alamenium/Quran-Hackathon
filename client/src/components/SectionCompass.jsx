// SectionCompass — a small N-petal compass used inside a section that has
// a "Quran Compass Mission". One petal lights up per completed lens-quest.
//
// Props:
//   lenses        [{id, name, emoji}]
//   unlockedIds   string[]   ids of lenses already earned
//   activeId      string|null  id of the lens for the current quest (pulses)
//   size          number     pixel size of the SVG (default 200)

import React from 'react';

function polar(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function wedgePath(cx, cy, outer, inner, startDeg, endDeg) {
  const o1 = polar(cx, cy, outer, startDeg);
  const o2 = polar(cx, cy, outer, endDeg);
  const i1 = polar(cx, cy, inner, endDeg);
  const i2 = polar(cx, cy, inner, startDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${o1.x} ${o1.y}`,
    `A ${outer} ${outer} 0 ${large} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${inner} ${inner} 0 ${large} 0 ${i2.x} ${i2.y}`,
    'Z',
  ].join(' ');
}

export function SectionCompass({
  lenses = [],
  unlockedIds = [],
  activeId = null,
  size = 200,
}) {
  const n = lenses.length || 8;
  const step = 360 / n;
  const c = size / 2;
  const outer = size * 0.42;
  const inner = size * 0.16;

  const unlockedSet = new Set(unlockedIds);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      role="img"
      aria-label={`Quran Compass — ${unlockedIds.length} of ${n} lenses unlocked`}
    >
      <circle cx={c} cy={c} r={outer + size * 0.025} fill="none" stroke="#E5DCC2" strokeWidth="2" />

      {lenses.map((lens, i) => {
        const start = i * step;
        const end = (i + 1) * step;
        const isUnlocked = unlockedSet.has(lens.id);
        const isActive = activeId === lens.id;
        const fill = isActive ? '#F9C74F' : isUnlocked ? '#B8EBD0' : '#FFF8E7';
        const stroke = isActive ? '#F4A7B9' : isUnlocked ? '#58CC02' : '#E5DCC2';
        const mid = (start + end) / 2;
        const labelPos = polar(c, c, (outer + inner) / 2, mid);
        return (
          <g key={lens.id || i}>
            <path
              d={wedgePath(c, c, outer - 1, inner + 1, start + 1, end - 1)}
              fill={fill}
              stroke={stroke}
              strokeWidth="2"
              opacity={isUnlocked || isActive ? 1 : 0.7}
              className={isActive ? 'animate-pulse-soft' : ''}
            />
            <text
              x={labelPos.x}
              y={labelPos.y + size * 0.025}
              textAnchor="middle"
              fontSize={size * 0.075}
              opacity={isUnlocked || isActive ? 1 : 0.5}
            >
              {lens.emoji || '•'}
            </text>
          </g>
        );
      })}

      <circle cx={c} cy={c} r={inner - 2} fill="#FFFAF0" stroke="#F9C74F" strokeWidth="2" />
      <text x={c} y={c - 2} textAnchor="middle" fontSize={size * 0.09}>🧭</text>
      <text
        x={c}
        y={c + size * 0.06}
        textAnchor="middle"
        fontSize={size * 0.04}
        fontWeight="800"
        fill="#7A7563"
      >
        {unlockedIds.length}/{n}
      </text>
    </svg>
  );
}
