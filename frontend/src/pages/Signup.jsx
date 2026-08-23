import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../api.js";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await signup({ name, email, password });
      navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <div className="card stack">
        <h2>Sign up</h2>
        <form onSubmit={handleSubmit} className="stack">
          <div>
            <label className="field-label">Name</label>
            <input className="input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="field-label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="you@nsut.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="field-label">Password</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn btn-primary">
            Sign up
          </button>
        </form>
        <p className="muted">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}