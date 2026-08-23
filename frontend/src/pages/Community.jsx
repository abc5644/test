import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createCommunity, joinCommunity, getMyCommunities } from "../api.js";

export default function Community() {
  const [communities, setCommunities] = useState([]);
  const [newName, setNewName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");

  async function refresh() {
    try {
      setCommunities(await getMyCommunities());
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await createCommunity(newName);
      setNewName("");
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleJoin(e) {
    e.preventDefault();
    try {
      await joinCommunity(joinCode);
      setJoinCode("");
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page" style={{ maxWidth: 560 }}>
      <h2>Communities</h2>
      {error && <p className="error-text">{error}</p>}

      <div className="card stack" style={{ marginBottom: "1.25rem" }}>
        <h4 style={{ margin: 0 }}>Create a community</h4>
        <form onSubmit={handleCreate} className="row">
          <input
            className="input"
            placeholder="Community name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary">
            Create
          </button>
        </form>
      </div>

      <div className="card stack" style={{ marginBottom: "1.25rem" }}>
        <h4 style={{ margin: 0 }}>Join with a code</h4>
        <form onSubmit={handleJoin} className="row">
          <input
            className="input"
            placeholder="Join code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary">
            Join
          </button>
        </form>
      </div>

      <h4>Your communities</h4>
      <div className="stack">
        {communities.map((c) => (
          <div key={c.id} className="card row" style={{ justifyContent: "space-between" }}>
            <div>
              <strong style={{ fontFamily: "var(--font-display)" }}>{c.name}</strong>
              <p className="muted" style={{ margin: "0.2rem 0 0" }}>
                Code: <strong style={{ color: "var(--color-text)" }}>{c.join_code}</strong> ·{" "}
                {c.members.length}/10 members
              </p>
            </div>
            <Link
              to={`/home?community=${c.id}&name=${encodeURIComponent(c.name)}`}
              className="btn btn-ghost"
              style={{ textDecoration: "none", whiteSpace: "nowrap" }}
            >
              View on map
            </Link>
          </div>
        ))}
        {communities.length === 0 && <p className="muted">You haven't joined any communities yet.</p>}
      </div>
    </div>
  );
}