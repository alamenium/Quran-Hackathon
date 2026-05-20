// client/src/components/ProphetSceneSvg.jsx
//
// Symbolic SVG illustrations for the "Guess the Prophet" game.
//
// STRICT VISUAL SAFETY RULES (per the brief):
//   ✗ NO Prophet depicted in any way
//   ✗ NO faces
//   ✗ NO human bodies, silhouettes, hands, or robes
//   ✗ NO glowing figures or back-view human shapes
//   ✓ Objects only
//
// Each scene is composed entirely of inanimate objects + nature symbols.

export function ProphetSceneSvg({ type, alt = '', className = '' }) {
  const Scene = SCENES[type] || DefaultScene;
  return (
    <div className={`relative ${className}`} role="img" aria-label={alt}>
      <Scene />
    </div>
  );
}

// ── Common SVG wrapper ──────────────────────────────────────────────────────
function Frame({ children, bg = '#E8F4FF' }) {
  return (
    <svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
      <rect width="320" height="200" rx="20" fill={bg} />
      {children}
    </svg>
  );
}

// ── 1. Nuh — ark, rain clouds, animal pairs ────────────────────────────────
function ArkScene() {
  return (
    <Frame bg="#D6EBFF">
      {/* Rain clouds */}
      <g fill="#B8C5D6">
        <ellipse cx="70" cy="40" rx="32" ry="14" />
        <ellipse cx="100" cy="35" rx="28" ry="12" />
        <ellipse cx="240" cy="45" rx="30" ry="13" />
        <ellipse cx="270" cy="38" rx="26" ry="11" />
      </g>
      {/* Rain */}
      <g stroke="#7FB4E6" strokeWidth="2" strokeLinecap="round" opacity="0.7">
        <line x1="60" y1="60" x2="55" y2="75" />
        <line x1="80" y1="65" x2="75" y2="80" />
        <line x1="100" y1="60" x2="95" y2="75" />
        <line x1="230" y1="65" x2="225" y2="80" />
        <line x1="250" y1="60" x2="245" y2="75" />
        <line x1="270" y1="65" x2="265" y2="80" />
      </g>
      {/* Sea */}
      <path d="M0 150 Q40 140 80 150 T160 150 T240 150 T320 150 V200 H0 Z" fill="#7FB4E6" />
      <path d="M0 160 Q40 152 80 160 T160 160 T240 160 T320 160 V200 H0 Z" fill="#5B9BD5" opacity="0.7" />
      {/* Ark hull */}
      <path d="M70 130 L250 130 L230 155 L90 155 Z" fill="#8B5A3C" />
      <rect x="100" y="100" width="120" height="30" fill="#A56C45" />
      <rect x="115" y="108" width="20" height="14" fill="#5C3A22" />
      <rect x="150" y="108" width="20" height="14" fill="#5C3A22" />
      <rect x="185" y="108" width="20" height="14" fill="#5C3A22" />
      {/* Mast */}
      <line x1="160" y1="65" x2="160" y2="100" stroke="#5C3A22" strokeWidth="3" />
      <path d="M160 70 L195 90 L160 100 Z" fill="#F4D58D" />
    </Frame>
  );
}

// ── 2. Musa — split sea, dry path, staff ────────────────────────────────────
function SplitSeaScene() {
  return (
    <Frame bg="#FFF4D6">
      {/* Sky */}
      <circle cx="270" cy="40" r="20" fill="#F9C74F" />
      {/* Left water wall */}
      <path d="M0 80 L110 80 L110 180 L0 180 Z" fill="#5B9BD5" />
      <path d="M40 80 Q50 90 40 100 Q50 110 40 120 Q50 130 40 140 Q50 150 40 160" stroke="#3D7DB8" strokeWidth="2" fill="none" />
      <path d="M75 80 Q85 90 75 100 Q85 110 75 120" stroke="#3D7DB8" strokeWidth="2" fill="none" />
      {/* Right water wall */}
      <path d="M210 80 L320 80 L320 180 L210 180 Z" fill="#5B9BD5" />
      <path d="M250 80 Q260 90 250 100 Q260 110 250 120 Q260 130 250 140" stroke="#3D7DB8" strokeWidth="2" fill="none" />
      <path d="M285 80 Q295 90 285 100 Q295 110 285 120" stroke="#3D7DB8" strokeWidth="2" fill="none" />
      {/* Dry path */}
      <path d="M110 180 L210 180 L210 140 Q160 130 110 140 Z" fill="#D4A574" />
      <ellipse cx="160" cy="165" rx="35" ry="6" fill="#B8895C" opacity="0.4" />
      {/* Staff in foreground (object only — no hands) */}
      <rect x="155" y="50" width="6" height="80" rx="3" fill="#8B5A3C" transform="rotate(15 158 90)" />
      <circle cx="172" cy="48" r="6" fill="#D4A574" />
    </Frame>
  );
}

// ── 3. Yunus — large fish, dark sea, small boat ────────────────────────────
function FishScene() {
  return (
    <Frame bg="#1E3A5F">
      {/* Stars */}
      <g fill="#FFF" opacity="0.6">
        <circle cx="40" cy="30" r="1.5" />
        <circle cx="80" cy="20" r="1" />
        <circle cx="280" cy="25" r="1.5" />
        <circle cx="250" cy="35" r="1" />
      </g>
      {/* Moon */}
      <circle cx="275" cy="50" r="14" fill="#F4E5A8" opacity="0.85" />
      {/* Sea */}
      <path d="M0 110 Q40 105 80 110 T160 110 T240 110 T320 110 V200 H0 Z" fill="#0F2540" />
      <path d="M0 120 Q40 115 80 120 T160 120 T240 120 T320 120 V200 H0 Z" fill="#1E3A5F" opacity="0.8" />
      {/* Small boat in distance */}
      <path d="M40 100 L70 100 L65 110 L45 110 Z" fill="#8B5A3C" />
      <line x1="55" y1="85" x2="55" y2="100" stroke="#5C3A22" strokeWidth="1.5" />
      <path d="M55 88 L65 98 L55 100 Z" fill="#FAFAFA" opacity="0.9" />
      {/* Large fish */}
      <g>
        <ellipse cx="200" cy="155" rx="70" ry="28" fill="#3D7DB8" />
        <path d="M270 155 L295 135 L295 175 Z" fill="#3D7DB8" />
        <circle cx="170" cy="148" r="3" fill="#FFF" />
        <circle cx="170" cy="148" r="1.5" fill="#0F2540" />
        <path d="M155 155 Q170 162 185 155" stroke="#0F2540" strokeWidth="1.5" fill="none" />
        <path d="M200 130 Q210 122 220 130" stroke="#2C5A85" strokeWidth="2" fill="none" />
        <ellipse cx="215" cy="155" rx="6" ry="4" fill="#5B9BD5" opacity="0.5" />
      </g>
    </Frame>
  );
}

// ── 4. Yusuf — stars, well bucket, shirt ───────────────────────────────────
function StarsWellScene() {
  return (
    <Frame bg="#1E2A4A">
      {/* Eleven stars + sun + moon — symbolic of his dream, but ONLY objects */}
      <g fill="#FFC800">
        <Star cx={40}  cy={30} r={6} />
        <Star cx={80}  cy={20} r={5} />
        <Star cx={120} cy={35} r={6} />
        <Star cx={160} cy={18} r={7} />
        <Star cx={200} cy={32} r={5} />
        <Star cx={240} cy={22} r={6} />
        <Star cx={280} cy={36} r={5} />
        <Star cx={60}  cy={60} r={4} />
        <Star cx={140} cy={55} r={5} />
        <Star cx={220} cy={58} r={4} />
        <Star cx={260} cy={62} r={5} />
      </g>
      <circle cx="160" cy="90" r="18" fill="#F9C74F" opacity="0.85" />
      <circle cx="200" cy="85" r="12" fill="#E8E8E8" opacity="0.85" />
      {/* Ground */}
      <rect x="0" y="150" width="320" height="50" fill="#8B6F47" />
      {/* Well */}
      <g transform="translate(60 130)">
        <rect x="0" y="10" width="50" height="40" rx="4" fill="#6B6B6B" />
        <ellipse cx="25" cy="10" rx="25" ry="6" fill="#0F2540" />
        <rect x="-2" y="-15" width="5" height="25" fill="#5C3A22" />
        <rect x="47" y="-15" width="5" height="25" fill="#5C3A22" />
        <line x1="0" y1="-15" x2="52" y2="-15" stroke="#5C3A22" strokeWidth="3" />
        <line x1="25" y1="-13" x2="25" y2="0" stroke="#3C3C3C" strokeWidth="1" />
        <rect x="20" y="0" width="10" height="8" rx="1" fill="#8B5A3C" />
      </g>
      {/* Shirt (folded, no body) */}
      <g transform="translate(220 145)">
        <path d="M0 0 L40 0 L50 10 L40 14 L40 35 L0 35 L0 14 L-10 10 Z" fill="#FFFFFF" stroke="#D6D6D6" strokeWidth="1" />
        <line x1="20" y1="0" x2="20" y2="14" stroke="#D6D6D6" strokeWidth="1" />
      </g>
    </Frame>
  );
}
function Star({ cx, cy, r }) {
  const points = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI * i) / 5 - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r / 2.3;
    points.push(`${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`);
  }
  return <polygon points={points.join(' ')} />;
}

// ── 5. Sulayman — ants, hoopoe, valley ─────────────────────────────────────
function ValleyScene() {
  return (
    <Frame bg="#D4F1D4">
      {/* Distant mountains */}
      <path d="M0 110 L60 70 L120 100 L180 60 L240 95 L320 75 L320 130 L0 130 Z" fill="#A8D5A8" />
      <path d="M0 130 L80 105 L160 125 L240 110 L320 130 Z" fill="#7FB87F" />
      {/* Sun */}
      <circle cx="270" cy="45" r="16" fill="#FFE66D" />
      {/* Ground */}
      <rect x="0" y="140" width="320" height="60" fill="#8B6F47" />
      <ellipse cx="160" cy="142" rx="200" ry="10" fill="#A0855C" />
      {/* Tree branch */}
      <g transform="translate(40 80)">
        <path d="M0 0 Q15 -5 30 -2 Q45 0 60 -8" stroke="#5C3A22" strokeWidth="4" fill="none" />
        <g fill="#7FB87F">
          <ellipse cx="10" cy="-8" rx="6" ry="3" />
          <ellipse cx="25" cy="-12" rx="5" ry="3" />
          <ellipse cx="45" cy="-12" rx="5" ry="3" />
        </g>
        {/* Hoopoe bird perched */}
        <g transform="translate(35 -10)">
          <ellipse cx="0" cy="0" rx="10" ry="6" fill="#D2691E" />
          <circle cx="-8" cy="-2" r="4" fill="#D2691E" />
          <path d="M-10 -5 L-13 -10 L-9 -7 L-12 -12 L-8 -8 L-11 -14 L-7 -9 Z" fill="#FF8C42" />
          <path d="M-12 -1 L-16 0 L-12 1 Z" fill="#3C3C3C" />
          <circle cx="-8" cy="-2" r="0.8" fill="#FFF" />
          <path d="M5 4 L8 9 L3 7 Z" fill="#3C3C3C" />
        </g>
      </g>
      {/* Ant line */}
      <g fill="#3C3C3C">
        {Array.from({ length: 8 }).map((_, i) => {
          const x = 150 + i * 18;
          const y = 165 + Math.sin(i) * 2;
          return (
            <g key={i} transform={`translate(${x} ${y})`}>
              <ellipse cx="-3" cy="0" rx="2" ry="1.5" />
              <ellipse cx="0" cy="0" rx="2.5" ry="2" />
              <ellipse cx="4" cy="0" rx="3" ry="2" />
              <line x1="-3" y1="0" x2="-6" y2="-2" stroke="#3C3C3C" strokeWidth="0.5" />
            </g>
          );
        })}
      </g>
    </Frame>
  );
}

// ── 6. Ibrahim — gentle flame with cool blue glow, green leaves ────────────
function CoolFlameScene() {
  return (
    <Frame bg="#E6F4FF">
      {/* Outer cool glow */}
      <circle cx="160" cy="120" r="80" fill="#A8D5FF" opacity="0.4" />
      <circle cx="160" cy="120" r="60" fill="#7FBFE6" opacity="0.5" />
      {/* Flame — gentle, blue-tipped */}
      <g transform="translate(160 120)">
        <path d="M0 -50 Q-15 -30 -10 -10 Q-20 0 -15 20 Q-5 35 0 30 Q5 35 15 20 Q20 0 10 -10 Q15 -30 0 -50 Z" fill="#7FBFE6" />
        <path d="M0 -35 Q-10 -20 -7 -5 Q-13 5 -10 15 Q-3 25 0 22 Q3 25 10 15 Q13 5 7 -5 Q10 -20 0 -35 Z" fill="#A8D5FF" />
        <path d="M0 -25 Q-6 -15 -4 -5 Q-8 5 -6 12 Q-2 18 0 16 Q2 18 6 12 Q8 5 4 -5 Q6 -15 0 -25 Z" fill="#FFFFFF" opacity="0.8" />
      </g>
      {/* Green leaves around the base */}
      <g fill="#7FB87F">
        <ellipse cx="80"  cy="160" rx="12" ry="5" transform="rotate(-30 80 160)" />
        <ellipse cx="110" cy="170" rx="14" ry="6" transform="rotate(-15 110 170)" />
        <ellipse cx="210" cy="170" rx="14" ry="6" transform="rotate(15 210 170)" />
        <ellipse cx="240" cy="160" rx="12" ry="5" transform="rotate(30 240 160)" />
        <ellipse cx="150" cy="178" rx="10" ry="4" />
        <ellipse cx="170" cy="178" rx="10" ry="4" />
      </g>
      <g fill="#5BA85B">
        <ellipse cx="85"  cy="165" rx="6" ry="2.5" transform="rotate(-30 85 165)" />
        <ellipse cx="235" cy="165" rx="6" ry="2.5" transform="rotate(30 235 165)" />
      </g>
    </Frame>
  );
}

function DefaultScene() {
  return (
    <Frame bg="#F0F0F0">
      <text x="160" y="105" textAnchor="middle" fontSize="16" fill="#777777" fontWeight="bold">
        Clue
      </text>
    </Frame>
  );
}

const SCENES = {
  ark_scene:        ArkScene,
  split_sea_scene:  SplitSeaScene,
  fish_scene:       FishScene,
  stars_well_scene: StarsWellScene,
  valley_scene:     ValleyScene,
  cool_flame_scene: CoolFlameScene,
};
