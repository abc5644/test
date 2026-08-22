import { useState } from "react";
import { getCurrentUser, uploadToCloudinary, logout } from "../api.js";
import { useNavigate } from "react-router-dom";
import UploadPhoto from "../components/UploadPhoto.jsx";

export default function Profile() {
  const user = getCurrentUser();
  const [photoUrl, setPhotoUrl] = useState(null);
  const navigate = useNavigate();

  // TODO: wire this up to a PATCH /users/me backend route once auth core is solid.
  function handlePhotoUploaded(url) {
    setPhotoUrl(url);
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div style={{ maxWidth: 360, margin: "3rem auto", padding: "0 1rem" }}>
      <h2>Profile</h2>
      {photoUrl && <img src={photoUrl} alt="Profile" style={{ width: 96, height: 96, borderRadius: "50%" }} />}
      <p>
        <strong>Name:</strong> {user?.name}
      </p>
      <p>
        <strong>Email:</strong> {user?.email}
      </p>
      <UploadPhoto onUploaded={handlePhotoUploaded} />
      <button onClick={handleLogout} style={{ marginTop: "1rem" }}>
        Log out
      </button>
    </div>
  );
}
