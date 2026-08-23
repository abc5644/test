import { Link } from "react-router-dom";

const TAGLINES = [
  "\"kaha hai?\" \"aa raha hu\" \"bas 2 min\" — skip it. Open the map.",
  "Stop texting the group chat. Start reading the campus.",
  "Every crowded room, quiet corner, and free bench — live.",
];

export default function Intro() {
  return (
    <div className="landing">
      <div className="radar">
        <span className="ring r1" />
        <span className="ring r2" />
        <span className="ring r3" />
      </div>

      <div className="landing-content">
        <div className="badge">📍 LIVE · NSUT CAMPUS</div>

        <h1 className="hero-title">
          Campus<span className="accent">Pulse</span>
        </h1>

        <p className="hero-tag">{TAGLINES[0]}</p>
        <p className="hero-sub">
          Real-time study spots, crowd levels, silent zones, and campus vibes —
          verified by the people actually there. No admins guessing for you.
        </p>

        <div className="cta-row">
          <Link to="/login" className="btn btn-ghost cta">
            Continue as User
          </Link>
          <Link to="/login?admin=1" className="btn btn-primary cta">
            Continue as Admin
          </Link>
        </div>

        <Link to="/signup" className="signup-link">
          New here? Create an account →
        </Link>

        <div className="pin-strip">
          <span className="chip" style={{ "--c": "#5EEAD4" }}>📚 Study</span>
          <span className="chip" style={{ "--c": "#FB7185" }}>🔥 Crowded</span>
          <span className="chip" style={{ "--c": "#A78BFA" }}>🤫 Silent</span>
          <span className="chip" style={{ "--c": "#FBBF24" }}>🎉 Event</span>
          <span className="chip" style={{ "--c": "#38BDF8" }}>🔊 Vibe</span>
        </div>
      </div>

      <style>{`
        .landing {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: var(--color-bg);
          padding: 2rem 1.25rem;
        }

        .radar {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 10px;
          height: 10px;
          pointer-events: none;
        }

        .ring {
          position: absolute;
          top: 50%;
          left: 50%;
          border: 2px solid var(--color-accent);
          border-radius: 50%;
          transform: translate(-50%, -50%) scale(0);
          opacity: 0;
          animation: radarPulse 4.5s ease-out infinite;
        }

        .r1 { width: 300px; height: 300px; animation-delay: 0s; }
        .r2 { width: 300px; height: 300px; animation-delay: 1.5s; }
        .r3 { width: 300px; height: 300px; animation-delay: 3s; }

        @keyframes radarPulse {
          0% { transform: translate(-50%, -50%) scale(0.3); opacity: 0.5; }
          100% { transform: translate(-50%, -50%) scale(4.5); opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .ring { animation: none; display: none; }
        }

        .landing-content {
          position: relative;
          z-index: 2;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.9rem;
        }

        .badge {
          font-family: var(--font-pixel);
          font-size: 0.55rem;
          color: var(--color-sound);
          border: 2px solid var(--color-sound);
          border-radius: var(--radius-pill);
          padding: 0.35rem 0.7rem;
          background: rgba(56, 189, 248, 0.08);
        }

        .hero-title {
          font-family: var(--font-pixel);
          font-size: 1.8rem;
          line-height: 1.4;
          margin: 0.5rem 0 0;
          text-shadow: 3px 3px 0 #000;
        }

        .accent { color: var(--color-accent); }

        .hero-tag {
          font-family: var(--font-display);
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--color-text);
          margin: 0;
          line-height: 1.4;
        }

        .hero-sub {
          font-family: var(--font-body);
          font-size: 0.9rem;
          color: var(--color-text-muted);
          margin: 0;
          line-height: 1.5;
        }

        .cta-row {
          display: flex;
          gap: 0.75rem;
          margin-top: 0.75rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .cta {
          text-decoration: none;
        }

        .signup-link {
          font-family: var(--font-display);
          font-size: 0.75rem;
          color: var(--color-text-muted);
          text-decoration: none;
          margin-top: 0.25rem;
        }

        .signup-link:hover {
          color: var(--color-accent);
        }

        .pin-strip {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 1.75rem;
        }

        .chip {
          font-family: var(--font-pixel);
          font-size: 0.5rem;
          color: var(--c);
          border: 2px solid var(--c);
          border-radius: var(--radius-pill);
          padding: 0.4rem 0.55rem;
          background: color-mix(in srgb, var(--c) 12%, transparent);
        }
      `}</style>
    </div>
  );
}