/** Lightweight, code-native artwork: individual threads forming one system. */
export default function IntelligenceVisual() {
  return (
    <div className="intelligence-visual" aria-hidden="true">
      <div className="intelligence-halo" />
      <svg className="intelligence-sculpture" viewBox="0 0 560 560" fill="none">
        <defs>
          <linearGradient
            id="thread-colour"
            x1="100"
            y1="100"
            x2="440"
            y2="440"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#b6c98c" />
            <stop offset=".35" stopColor="#487e62" />
            <stop offset=".7" stopColor="#1f5543" />
            <stop offset="1" stopColor="#9bb686" />
          </linearGradient>
        </defs>
        <g
          className="intelligence-threads"
          stroke="url(#thread-colour)"
          strokeWidth=".85"
        >
          {Array.from({ length: 72 }, (_, i) => (
            <ellipse
              key={i}
              cx="280"
              cy="280"
              rx="108"
              ry="219"
              transform={`rotate(${i * 2.5} 280 280)`}
            />
          ))}
        </g>
        <circle cx="280" cy="280" r="58" fill="#f6f5f0" fillOpacity=".85" />
        <g stroke="#355c46" strokeWidth="1.2">
          <path d="M280 259v42m-21-21h42m-36-15 30 30m-30 0 30-30" />
          <circle cx="280" cy="280" r="12" fill="#f6f5f0" />
        </g>
      </svg>
      <span className="visual-note visual-note-top">
        <span className="status-dot" /> Human insight
      </span>
      <span className="visual-note visual-note-bottom">
        <span className="visual-spark">✳</span> Applied intelligence
      </span>
      <div className="visual-caption">
        <span>Many moving parts. One thoughtful system.</span>
        <span>01 — M&amp;Co.</span>
      </div>
    </div>
  );
}
