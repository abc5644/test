import { PIN_TYPE_META } from "../pinTypes.js";

export default function PinPopup({ pin, onUpvote, onDelete, canDelete }) {
  const meta = PIN_TYPE_META[pin.type] || { label: pin.type, color: "#9C9AB8" };

  return (
    <div className="stack" style={{ minWidth: 180 }}>
      <div className="type-chip" style={{ background: `${meta.color}22`, color: meta.color }}>
        <span className="type-dot" style={{ background: meta.color }} />
        {meta.label}
      </div>

      <strong style={{ fontFamily: "var(--font-display)" }}>{pin.label}</strong>
      {pin.note && <p className="muted" style={{ margin: 0 }}>{pin.note}</p>}

      {pin.media_url && (
        <div>
          {pin.media_url.match(/\.(mp4|webm|mov)$/i) ? (
            <video src={pin.media_url} controls style={{ width: "100%", borderRadius: 8 }} />
          ) : pin.media_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
            <img src={pin.media_url} alt={pin.label} style={{ width: "100%", borderRadius: 8 }} />
          ) : (
            <audio src={pin.media_url} controls style={{ width: "100%" }} />
          )}
        </div>
      )}

      <div className="row">
        <button onClick={() => onUpvote(pin.id)} className="btn btn-ghost" style={{ alignSelf: "flex-start" }}>
          👍 {pin.votes}
        </button>
        {canDelete && (
          <button
            onClick={() => onDelete(pin.id)}
            className="btn btn-ghost"
            style={{ color: "#FB7185", alignSelf: "flex-start" }}
          >
            🗑 Delete
          </button>
        )}
      </div>
    </div>
  );
}