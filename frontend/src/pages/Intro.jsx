import { Link } from "react-router-dom";

export default function Intro() {
  return (
    <div style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
      <h1>CampusPulse</h1>
      <p>The live, crowd-verified pulse of NSUT — where to study, what's on, what's crowded.</p>
      <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", justifyContent: "center" }}>
        <Link to="/login">Log in</Link>
        <Link to="/signup">Sign up</Link>
      </div>
    </div>
  );
}
