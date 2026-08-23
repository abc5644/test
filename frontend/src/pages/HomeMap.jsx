import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  MapContainer,
  Marker,
  Popup,
  ImageOverlay,
  ScaleControl,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

import {
  getPins,
  createPin,
  upvotePin,
  deletePin,
  uploadToCloudinary,
  isAdmin,
  getCurrentUser,
  shareLocation,
  stopSharingLocation,
  getCommunityLocations,
} from "../api.js";

import { PIN_TYPE_META } from "../pinTypes.js";
import {
  REFERENCE_IMAGE_PATH,
  NSUT_CENTER,
} from "../campusGeo.js";

import PinPopup from "../components/PinPopup.jsx";
import NewPinForm from "../components/NewPinForm.jsx";
import VoiceRecorder from "../components/VoiceRecorder.jsx";

const IMAGE_BOUNDS = [
  [28.6061065, 77.0335128],
  [28.6145109, 77.0427505],
];

const CENTER = NSUT_CENTER || [28.609888, 77.035854];

const icon = (color) =>
  L.divIcon({
    className: "naksha-pin-wrap",
    html: `
      <div class="naksha-pin" style="--c:${color}">
        <span class="pin-ring"></span>
        <span class="pin-dot"></span>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13],
  });

function ViewController() {
  const map = useMap();

  useEffect(() => {
    const update = () => {
      map.invalidateSize();
      map.setView(CENTER, 18.25, { animate: false });
    };

    update();
    const a = setTimeout(update, 150);
    const b = setTimeout(update, 500);

    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [map]);

  return null;
}

function ClickCatcher({ onClick }) {
  useMapEvents({
    click: (e) => onClick(e.latlng),
  });

  return null;
}

export default function HomeMap() {
  const [params] = useSearchParams();
  const communityId = params.get("community");
  const communityName = params.get("name");

  const admin = isAdmin();
  const user = getCurrentUser();
  const canAddPin = !!communityId || admin;

  const [pins, setPins] = useState([]);
  const [locations, setLocations] = useState([]);
  const [pending, setPending] = useState(null);
  const [clip, setClip] = useState(null);
  const [media, setMedia] = useState(null);
  const [sharing, setSharing] = useState(false);

  const watchRef = useRef(null);

  async function loadPins() {
    try {
      const data = await getPins(communityId);
      setPins(Array.isArray(data) ? data : []);
    } catch {
      setPins([]);
    }
  }

  useEffect(() => {
    loadPins();
    const id = setInterval(loadPins, 7000);
    return () => clearInterval(id);
  }, [communityId]);

  useEffect(() => {
    if (!communityId) {
      setLocations([]);
      return;
    }

    const load = async () => {
      try {
        const data = await getCommunityLocations(communityId);
        setLocations(Array.isArray(data) ? data : []);
      } catch {
        setLocations([]);
      }
    };

    load();
    const id = setInterval(load, 7000);
    return () => clearInterval(id);
  }, [communityId]);

  useEffect(() => {
    return () => {
      if (watchRef.current !== null) {
        navigator.geolocation.clearWatch(watchRef.current);
      }
    };
  }, []);

  function toggleSharing() {
    if (sharing) {
      if (watchRef.current !== null) {
        navigator.geolocation.clearWatch(watchRef.current);
        watchRef.current = null;
      }

      stopSharingLocation(communityId).catch(() => {});
      setSharing(false);
      return;
    }

    if (!navigator.geolocation) {
      alert("Geolocation is not supported.");
      return;
    }

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        shareLocation(
          communityId,
          pos.coords.latitude,
          pos.coords.longitude
        ).catch(() => {});
      },
      (err) => {
        alert(err.message);
        setSharing(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    setSharing(true);
  }

  async function handleCreate(data) {
    try {
      let media_url = null;

      if (media) media_url = await uploadToCloudinary(media);
      else if (clip) media_url = await uploadToCloudinary(clip);

      await createPin({
        ...data,
        media_url,
        community_id: communityId || null,
      });

      setPending(null);
      setClip(null);
      setMedia(null);
      loadPins();
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleUpvote(id) {
    try {
      await upvotePin(id);
      loadPins();
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleDelete(id) {
    try {
      await deletePin(id);
      loadPins();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="naksha-map">
      <MapContainer
        center={CENTER}
        zoom={18.25}
        minZoom={17}
        maxZoom={21}
        zoomControl
        dragging
        scrollWheelZoom
        doubleClickZoom
        style={{ width: "100%", height: "100%" }}
      >
        <ImageOverlay
          url={REFERENCE_IMAGE_PATH}
          bounds={IMAGE_BOUNDS}
          opacity={1}
          interactive={false}
          zIndex={100}
        />

        <ViewController />

        <ScaleControl position="bottomleft" metric imperial />

        {canAddPin && (
          <ClickCatcher onClick={setPending} />
        )}

        {pins.map((pin) => (
          <Marker
            key={pin.id}
            position={[Number(pin.lat), Number(pin.lng)]}
            icon={icon(
              PIN_TYPE_META[pin.type]?.color || "#7c3aed"
            )}
            zIndexOffset={1000}
          >
            <Popup>
              <PinPopup
                pin={pin}
                onUpvote={handleUpvote}
                onDelete={handleDelete}
                canDelete={
                  admin || pin.created_by === user?.user_id
                }
              />
            </Popup>
          </Marker>
        ))}

        {communityId &&
          locations.map((loc) => (
            <Marker
              key={loc.user_id}
              position={[Number(loc.lat), Number(loc.lng)]}
              icon={icon("#38BDF8")}
              zIndexOffset={1200}
            >
              <Popup>
                <strong>{loc.name}</strong>
                <br />
                <small>Community member</small>
              </Popup>
            </Marker>
          ))}

        {pending && (
          <Marker
            position={[pending.lat, pending.lng]}
            icon={icon("#ffffff")}
            zIndexOffset={2000}
          />
        )}
      </MapContainer>

      {communityId && (
        <>
          <div className="community-chip">
            <span>VIEWING:</span>
            <strong>{communityName || "COMMUNITY"}</strong>
            <Link to="/home">MAIN MAP</Link>
          </div>

          <button
            className="location-btn"
            onClick={toggleSharing}
          >
            <span className={sharing ? "dot on" : "dot"} />
            {sharing ? "STOP SHARING" : "SHARE LOCATION"}
          </button>
        </>
      )}

      {pending && canAddPin && (
        <div className="pin-panel">
          <h3>NEW CAMPUS PIN</h3>
          <p>Add a report at this location.</p>

          <VoiceRecorder onRecorded={setClip} />

          {clip && <small className="ready">✓ VIBE CLIP READY</small>}

          <NewPinForm
            position={pending}
            onSubmit={handleCreate}
            onMediaSelect={setMedia}
            onCancel={() => {
              setPending(null);
              setClip(null);
              setMedia(null);
            }}
          />
        </div>
      )}

      <style>{`
        .naksha-map {
          width:100%;
          height:100%;
          overflow:hidden;
          background:#171b2b;
        }

        .naksha-pin-wrap {
          background:transparent !important;
          border:none !important;
        }

        .naksha-pin {
          position:relative;
          width:26px;
          height:26px;
        }

        .pin-dot {
          position:absolute;
          left:50%;
          top:50%;
          width:11px;
          height:11px;
          transform:translate(-50%,-50%);
          background:var(--c);
          border:2px solid #fff;
          border-radius:50%;
          box-shadow:0 2px 6px rgba(0,0,0,.6);
        }

        .pin-ring {
          position:absolute;
          inset:1px;
          border:2px solid var(--c);
          border-radius:50%;
          animation:pulse 1.7s ease-out infinite;
        }

        @keyframes pulse {
          0% { transform:scale(.35); opacity:.8; }
          100% { transform:scale(1.3); opacity:0; }
        }

        .community-chip,
        .location-btn {
          position:absolute;
          top:12px;
          z-index:1500;
          background:rgba(20,24,42,.94);
          color:#fff;
          border:1px solid rgba(255,255,255,.18);
          border-radius:6px;
          box-shadow:0 5px 16px rgba(0,0,0,.3);
          backdrop-filter:blur(8px);
          font:700 10px Arial,sans-serif;
        }

        .community-chip {
          left:12px;
          padding:6px 9px;
          display:flex;
          gap:7px;
          align-items:center;
        }

        .community-chip span { color:#9ca3af; }
        .community-chip a {
          color:#c4b5fd;
          text-decoration:none;
        }

        .location-btn {
          right:12px;
          padding:7px 10px;
          cursor:pointer;
          display:flex;
          align-items:center;
          gap:7px;
        }

        .dot {
          width:7px;
          height:7px;
          border-radius:50%;
          background:#6b7280;
        }

        .dot.on {
          background:#f43f5e;
        }

        .pin-panel {
          position:absolute;
          right:16px;
          bottom:16px;
          z-index:2500;
          width:310px;
          max-width:calc(100% - 32px);
          padding:14px;
          background:rgba(22,26,45,.97);
          color:#fff;
          border:1px solid rgba(255,255,255,.16);
          border-radius:8px;
          box-shadow:0 14px 35px rgba(0,0,0,.45);
        }

        .pin-panel h3 {
          margin:0;
          font:800 14px Arial,sans-serif;
        }

        .pin-panel p {
          margin:4px 0 10px;
          color:#9ca3af;
          font-size:10px;
        }

        .ready {
          display:block;
          margin:6px 0;
          color:#34d399;
        }

        .leaflet-control-zoom a {
          background:#171b2b !important;
          color:#fff !important;
          border-color:rgba(255,255,255,.1) !important;
        }

        .leaflet-control-scale-line {
          background:rgba(20,24,42,.9) !important;
          color:#fff !important;
          border-color:#fff !important;
        }
      `}</style>
    </div>
  );
}