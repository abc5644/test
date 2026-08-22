import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { getPins, createPin, upvotePin, uploadToCloudinary } from "../api.js";
import PinPopup from "../components/PinPopup.jsx";
import NewPinForm from "../components/NewPinForm.jsx";
import VoiceRecorder from "../components/VoiceRecorder.jsx";

// NSUT, Dwarka Sector 3, Delhi
const NSUT_CENTER = [28.6096, 77.0378];

function ClickCatcher({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

export default function HomeMap() {
  const [pins, setPins] = useState([]);
  const [pendingPosition, setPendingPosition] = useState(null);
  const [pendingClip, setPendingClip] = useState(null);

  async function refreshPins() {
    try {
      const data = await getPins();
      setPins(data);
    } catch (err) {
      console.error("Failed to load pins", err);
    }
  }

  useEffect(() => {
    refreshPins();
    // Simple polling for the hackathon demo — re-fetch every 7s.
    const interval = setInterval(refreshPins, 7000);
    return () => clearInterval(interval);
  }, []);

  async function handleCreatePin(pinDraft) {
    try {
      let media_url = null;
      if (pendingClip) {
        media_url = await uploadToCloudinary(pendingClip);
      }
      await createPin({ ...pinDraft, media_url });
      setPendingPosition(null);
      setPendingClip(null);
      refreshPins();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleUpvote(pinId) {
    try {
      await upvotePin(pinId);
      refreshPins();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer center={NSUT_CENTER} zoom={17} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickCatcher onMapClick={setPendingPosition} />

        {pins.map((pin) => (
          <Marker key={pin.id} position={[pin.lat, pin.lng]}>
            <Popup>
              <PinPopup pin={pin} onUpvote={handleUpvote} />
            </Popup>
          </Marker>
        ))}

        {pendingPosition && (
          <Marker position={[pendingPosition.lat, pendingPosition.lng]}>
            <Popup autoClose={false} closeOnClick={false}>
              <VoiceRecorder onRecorded={setPendingClip} />
              {pendingClip && <p>Vibe clip ready ✓</p>}
              <NewPinForm
                position={pendingPosition}
                onSubmit={handleCreatePin}
                onCancel={() => {
                  setPendingPosition(null);
                  setPendingClip(null);
                }}
              />
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
