import { useState } from "react";

const PIN_TYPES = ["study", "crowded", "silent", "event", "sound"];

export default function NewPinForm({ position, onSubmit, onCancel }) {
  const [type, setType] = useState("study");
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ type, label, note, lat: position.lat, lng: position.lng });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", minWidth: 220 }}>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        {PIN_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <input placeholder="Label" value={label} onChange={(e) => setLabel(e.target.value)} required />
      <textarea placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
      {/* VoiceRecorder for the vibe clip gets wired in here in step 4 of the build plan */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button type="submit">Drop pin</button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
