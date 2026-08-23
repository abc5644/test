import { Link, useNavigate, useLocation } from "react-router-dom";
import { logout } from "../api.js";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function isActive(path) {
    return location.pathname === path;
  }

  return (
    <nav className="hud-nav">
      <strong className="hud-brand">
        Campus<span className="accent">Pulse</span>
      </strong>

      <Link to="/home" className={`hud-link ${isActive("/home") ? "active" : ""}`}>
        Map
      </Link>
      <Link to="/community" className={`hud-link ${isActive("/community") ? "active" : ""}`}>
        Communities
      </Link>
      <Link to="/profile" className={`hud-link ${isActive("/profile") ? "active" : ""}`}>
        Profile
      </Link>

      <button onClick={handleLogout} className="hud-logout">
        Log out
      </button>

      <style>{`
        .hud-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 48px;
          background: var(--color-surface);
          border-bottom: 3px solid var(--color-border);
          color: var(--color-text);
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 0 1rem;
          z-index: 2000;
          box-sizing: border-box;
          box-shadow: 0 3px 0 rgba(0,0,0,0.4);
          overflow-x: auto;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .hud-nav::-webkit-scrollbar {
          display: none;
        }
        .hud-brand {
          font-family: var(--font-pixel);
          font-size: 0.65rem;
          flex-shrink: 0;
        }
        .accent { color: var(--color-accent); }
        .hud-link {
          font-family: var(--font-pixel);
          font-size: 0.55rem;
          color: var(--color-text-muted);
          text-decoration: none;
          padding: 0.35rem 0.5rem;
          border-radius: var(--radius-md);
          flex-shrink: 0;
          white-space: nowrap;
        }
        .hud-link:hover {
          color: var(--color-text);
        }
        .hud-link.active {
          color: var(--color-accent);
          background: var(--color-accent-soft);
          border: 1px solid var(--color-accent);
        }
        .hud-logout {
          margin-left: auto;
          flex-shrink: 0;
          white-space: nowrap;
          font-family: var(--font-pixel);
          font-size: 0.55rem;
          background: var(--color-surface-2);
          color: var(--color-text);
          border: 2px solid #000;
          border-radius: var(--radius-pill);
          padding: 0.45rem 0.75rem;
          cursor: pointer;
          box-shadow: 2px 2px 0 #000;
        }
        .hud-logout:active {
          transform: translate(2px, 2px);
          box-shadow: 0 0 0 #000;
        }
        .hud-logout:hover {
          border-color: var(--color-crowded);
          color: var(--color-crowded);
        }
      `}</style>
    </nav>
  );
}