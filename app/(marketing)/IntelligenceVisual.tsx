/**
 * Code-native artwork for the hero: the shape of the work itself.
 *
 * Left   — a ragged edge of inputs. Real businesses arrive unaligned.
 * Middle — one system, always turning, that takes them all in the same way.
 * Right  — what comes back: fewer lines, flush at both ends, certain.
 */

const CORE = 280;
const CYCLE_BEAT = 1.5;

/* Only the starting point varies. The rag is the point: the tools and data a
   business already has are never tidy, and every one gets the same treatment. */
const inputs = [
  { y: 120, x: 84, dot: 2.4, beat: 0 },
  { y: 166, x: 56, dot: 3.1, beat: 5 },
  { y: 211, x: 96, dot: 2.2, beat: 2 },
  { y: 257, x: 66, dot: 2.8, beat: 7 },
  { y: 303, x: 74, dot: 3.3, beat: 1 },
  { y: 349, x: 52, dot: 2.5, beat: 6 },
  { y: 394, x: 90, dot: 2.2, beat: 3 },
  { y: 440, x: 70, dot: 2.9, beat: 4 },
];

/* Three lines out, flush left and right, the middle one carrying the weight. */
const outputs = [
  { enter: 272, settle: 242, weight: 1.5, beat: 1.4 },
  { enter: 280, settle: 280, weight: 2.3, beat: 5.4 },
  { enter: 288, settle: 318, weight: 1.5, beat: 3.4 },
];

/** Level lead-in, one bend, level arrival — the same curve for every input. */
function feed(x: number, y: number) {
  const settled = (CORE + (y - CORE) * 0.2).toFixed(1);
  return `M${x} ${y}H118C180 ${y} 214 ${settled} 252 ${settled}`;
}

/** The feed run in reverse: out of the core and into alignment. */
function result(enter: number, settle: number) {
  return `M268 ${enter}H358C392 ${enter} 404 ${settle} 438 ${settle}H496`;
}

const offset = (beat: number) => ({ animationDelay: `${-beat * CYCLE_BEAT}s` });

export default function IntelligenceVisual() {
  return (
    <div className="intelligence-visual" aria-hidden="true">
      <div className="intelligence-halo" />
      <svg className="intelligence-sculpture" viewBox="0 0 560 560" fill="none">
        <defs>
          {/* Raw and various on the left, dissolving as the system takes it in. */}
          <linearGradient
            id="feed-colour"
            x1="52"
            x2="232"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#a2ad9c" stopOpacity=".5" />
            <stop offset=".35" stopColor="#7e9279" stopOpacity=".9" />
            <stop offset=".77" stopColor="#46765c" stopOpacity=".85" />
            <stop offset="1" stopColor="#1e4a3c" stopOpacity="0" />
          </linearGradient>
          {/* A denser packet riding the same path, so the threads read as live. */}
          <linearGradient
            id="feed-pulse"
            x1="52"
            x2="232"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#2f6b4c" stopOpacity="0" />
            <stop offset=".3" stopColor="#2f6b4c" stopOpacity=".95" />
            <stop offset=".8" stopColor="#1f5543" stopOpacity=".85" />
            <stop offset="1" stopColor="#1e4a3c" stopOpacity="0" />
          </linearGradient>
          {/* Emerging from the core: fewer, heavier, resolved. */}
          <linearGradient
            id="result-colour"
            x1="276"
            x2="396"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#1e4a3c" stopOpacity="0" />
            <stop offset=".5" stopColor="#25543f" stopOpacity=".88" />
            <stop offset="1" stopColor="#1e4a3c" />
          </linearGradient>
          <linearGradient
            id="result-pulse"
            x1="276"
            x2="506"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#83b291" stopOpacity="0" />
            <stop offset=".4" stopColor="#a4cbac" stopOpacity=".95" />
            <stop offset=".78" stopColor="#b6c98c" stopOpacity=".8" />
            <stop offset="1" stopColor="#b6c98c" stopOpacity="0" />
          </linearGradient>
          {/* The original thread palette, kept: sage into pine and back. */}
          <linearGradient
            id="thread-colour"
            x1="200"
            y1="196"
            x2="360"
            y2="364"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#b6c98c" />
            <stop offset=".35" stopColor="#487e62" />
            <stop offset=".7" stopColor="#1f5543" />
            <stop offset="1" stopColor="#9bb686" />
          </linearGradient>
        </defs>

        {/* What you already have, gathered in. */}
        <g strokeLinecap="round">
          <g stroke="url(#feed-colour)" strokeWidth="1">
            {inputs.map((input) => (
              <path key={input.y} d={feed(input.x, input.y)} />
            ))}
          </g>
          <g stroke="url(#feed-pulse)" strokeWidth="1.5">
            {inputs.map((input) => (
              <path
                key={input.y}
                className="intelligence-pulse"
                style={offset(input.beat)}
                pathLength={100}
                d={feed(input.x, input.y)}
              />
            ))}
          </g>
        </g>
        <g fill="#8e9c88">
          {inputs.map((input) => (
            <circle key={input.y} cx={input.x} cy={input.y} r={input.dot} />
          ))}
        </g>

        {/* What comes back out. Drawn before the weave, so it reads as through. */}
        <g strokeLinecap="round">
          {outputs.map((line) => (
            <path
              key={line.settle}
              stroke="url(#result-colour)"
              strokeWidth={line.weight}
              d={result(line.enter, line.settle)}
            />
          ))}
          {outputs.map((line) => (
            <path
              key={line.settle}
              className="intelligence-pulse"
              style={offset(line.beat)}
              pathLength={100}
              stroke="url(#result-pulse)"
              strokeWidth={line.weight + 0.2}
              d={result(line.enter, line.settle)}
            />
          ))}
        </g>

        {/* The system: rotated ellipses leaving an open iris at the centre. */}
        <g
          className="intelligence-threads"
          stroke="url(#thread-colour)"
          strokeWidth=".7"
        >
          {Array.from({ length: 24 }, (_, i) => (
            <ellipse
              key={i}
              cx={CORE}
              cy={CORE}
              rx="48"
              ry="96"
              transform={`rotate(${i * 7.5} ${CORE} ${CORE})`}
            />
          ))}
        </g>
        {/* Opaque: the lines behind it must not ghost across the mark. */}
        <circle cx={CORE} cy={CORE} r="44" fill="#f6f5f0" />

        {/* Judgement at the centre — the part that stays still. */}
        <g stroke="#1e4a3c">
          <circle cx={CORE} cy={CORE} r="30" strokeWidth=".8" opacity=".45" />
          <g strokeWidth="1.1" strokeLinecap="round">
            {Array.from({ length: 8 }, (_, i) => {
              const angle = (i * Math.PI) / 4;
              const cos = Math.cos(angle);
              const sin = Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={(CORE + cos * 9.5).toFixed(1)}
                  y1={(CORE + sin * 9.5).toFixed(1)}
                  x2={(CORE + cos * 20).toFixed(1)}
                  y2={(CORE + sin * 20).toFixed(1)}
                />
              );
            })}
          </g>
        </g>
        <circle cx={CORE} cy={CORE} r="4.6" fill="#1e4a3c" />

        {/* Terminus: the one figure the three lines add up to, and the margin
            they all stop against — set to the exact height of the stack. */}
        <circle
          cx="496"
          cy={CORE}
          r="4.6"
          fill="#1e4a3c"
          stroke="#f6f5f0"
          strokeWidth="2.4"
        />
        <path d="M512 242V318" stroke="#b9c1b0" />

        {/* Set to the exact width of the weave it names. */}
        <text className="intelligence-tag" x={CORE} y="150" textAnchor="middle">
          APPLIED INTELLIGENCE
        </text>
        <path d={`M${CORE} 158V182`} stroke="#b9c1b0" strokeWidth=".8" />
      </svg>
      <span className="visual-note visual-note-top">
        <span className="status-dot" /> Your people, tools &amp; data
      </span>
      <span className="visual-note visual-note-bottom">
        <span className="visual-spark">✳</span> A better working day
      </span>
      <div className="visual-caption">
        <span>Many moving parts. One clear way forward.</span>
        <span>01 — M&amp;Co.</span>
      </div>
    </div>
  );
}
