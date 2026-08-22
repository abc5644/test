import { useState } from "react";
import { uploadToCloudinary } from "../api.js";

export default function UploadPhoto({ onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const url = await uploadToCloudinary(file);
      onUploaded(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleChange} disabled={uploading} />
      {uploading && <p>Uploading…</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}
    </div>
  );
}
