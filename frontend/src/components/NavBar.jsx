import { Link, useNavigate } from "react-router-dom";
import { logout } from "../api.js";

const barStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  height: 48,
  background: "#1e293b",
  color: "white",
  display: "flex",
  alignItems: "center",
  gap: "1.5rem",
  padding: "0 1rem",
  zIndex: 2000,
  fontSize: "0.9rem",
  boxSizing: "border-box",
};

const linkStyle = { color: "white", textDecoration: "none" };

export default function NavBar() {
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav style={barStyle}>
      <strong>CampusPulse</strong>
      <Link to="/home" style={linkStyle}>
        Map
      </Link>
      <Link to="/community" style={linkStyle}>
        Communities
      </Link>
      <Link to="/profile" style={linkStyle}>
        Profile
      </Link>
      <button
        onClick={handleLogout}
        style={{
          marginLeft: "auto",
          background: "transparent",
          color: "white",
          border: "1px solid white",
          borderRadius: 4,
          padding: "0.25rem 0.75rem",
          cursor: "pointer",
        }}
      >
        Log out
      </button>
    </nav>
  );
}