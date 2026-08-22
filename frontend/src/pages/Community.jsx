import { useEffect, useState } from "react";
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
    <div style={{ maxWidth: 480, margin: "3rem auto", padding: "0 1rem" }}>
      <h2>Communities</h2>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <h3>Create</h3>
      <form onSubmit={handleCreate} style={{ display: "flex", gap: "0.5rem" }}>
        <input placeholder="Community name" value={newName} onChange={(e) => setNewName(e.target.value)} required />
        <button type="submit">Create</button>
      </form>

      <h3>Join</h3>
      <form onSubmit={handleJoin} style={{ display: "flex", gap: "0.5rem" }}>
        <input placeholder="Join code" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} required />
        <button type="submit">Join</button>
      </form>

      <h3>Your communities</h3>
      <ul>
        {communities.map((c) => (
          <li key={c.id}>
            {c.name} — code: <strong>{c.join_code}</strong> ({c.members.length}/10 members)
          </li>
        ))}
      </ul>
    </div>
  );
}
