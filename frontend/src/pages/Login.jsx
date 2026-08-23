import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { login, logout, isAdmin } from "../api.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const wantsAdmin = searchParams.get("admin") === "1";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await login({ email, password });
      if (wantsAdmin && !isAdmin()) {
        logout();
        setError("This account isn't an admin account.");
        return;
      }
      navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <div className="card stack">
        <h2>{wantsAdmin ? "Admin Login" : "Log in"}</h2>
        <form onSubmit={handleSubmit} className="stack">
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
            {wantsAdmin ? "Log in as Admin" : "Log in"}
          </button>
        </form>
        {!wantsAdmin && (
          <p className="muted">
            No account? <Link to="/signup">Sign up</Link>
          </p>
        )}
      </div>
    </div>
  );
}