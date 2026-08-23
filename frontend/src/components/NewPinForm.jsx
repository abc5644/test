import { useState } from "react";
import { PIN_TYPE_META, PIN_TYPES } from "../pinTypes.js";

export default function NewPinForm({ position, onSubmit, onCancel, onMediaSelect }) {
  const [type, setType] = useState(PIN_TYPES[0]);
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ type, label, note, lat: position.lat, lng: position.lng });
  }

  return (
    <form onSubmit={handleSubmit} className="stack">
      <div>
        <label className="field-label">Type</label>
        <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
          {PIN_TYPES.map((t) => (
            <option key={t} value={t}>
              {PIN_TYPE_META[t].label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="field-label">Label</label>
        <input
          className="input"
          placeholder="e.g. 3rd floor library corner"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="field-label">Note (optional)</label>
        <textarea
          className="input"
          placeholder="Anything else worth knowing"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
        />
      </div>

      <div>
        <label className="field-label">Photo / Video (optional)</label>
        <input
          className="input"
          type="file"
          accept="image/*,video/*"
          onChange={(e) => onMediaSelect(e.target.files[0] || null)}
        />
      </div>

      <div className="row">
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
          Drop pin
        </button>
        <button type="button" onClick={onCancel} className="btn btn-ghost">
          Cancel
        </button>
      </div>
    </form>
  );
}