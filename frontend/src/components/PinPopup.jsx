export default function PinPopup({ pin, onUpvote }) {
  return (
    <div>
      <strong>{pin.label}</strong>
      <p style={{ margin: "0.25rem 0", fontSize: "0.85rem", color: "#475569" }}>{pin.type}</p>
      {pin.note && <p>{pin.note}</p>}
      {pin.media_url && (
        <div style={{ marginTop: "0.5rem" }}>
          {pin.media_url.match(/\.(mp4|webm|mov)$/i) ? (
            <video src={pin.media_url} controls style={{ width: "100%" }} />
          ) : (
            <audio src={pin.media_url} controls style={{ width: "100%" }} />
          )}
        </div>
      )}
      <button onClick={() => onUpvote(pin.id)} style={{ marginTop: "0.5rem" }}>
        👍 {pin.votes}
      </button>
    </div>
  );
}
