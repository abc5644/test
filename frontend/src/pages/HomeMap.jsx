import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  MapContainer,
  Marker,
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
import { REFERENCE_IMAGE_PATH, NSUT_CENTER } from "../campusGeo.js";
import PinPopup from "../components/PinPopup.jsx";
import NewPinForm from "../components/NewPinForm.jsx";
import VoiceRecorder from "../components/VoiceRecorder.jsx";

const IMAGE_BOUNDS = [
  [28.6061065, 77.0335128],
  [28.6145109, 77.0427505],
];
const CENTER = NSUT_CENTER || [28.609888, 77.035854];

const escapeAttr = (value) => String(value || "").replaceAll('"', "&quot;");

const pinSvg = (type) => ({
  book: '<path d="M6 5.5c2.5-1.3 5.5-.7 6 1v9c-.5-1.7-3.5-2.3-6-1V5.5Zm12 0c-2.5-1.3-5.5-.7-6 1v9c.5-1.7 3.5-2.3 6-1V5.5Z"/>',
  crowd: '<circle cx="9" cy="9" r="2.5"/><circle cx="15" cy="9" r="2.5"/><path d="M4.5 17c.5-2.4 2.1-3.6 4.5-3.6S13 14.6 13.5 17M10.5 17c.5-2.4 2.1-3.6 4.5-3.6s4 1.2 4.5 3.6"/>',
  silent: '<path d="M7 10h3l4-4v12l-4-4H7z"/><path d="m17 9 3 6m0-6-3 6"/>',
  event: '<rect x="5" y="6" width="14" height="13" rx="2"/><path d="M8 4v4m8-4v4M5 10h14M9 14h2m2 0h2"/>',
  sound: '<path d="M5 13h3l4 4V7L8 11H5z"/><path d="M15 10.5c1.8 1.4 1.8 3.6 0 5m2-7c3 2.5 3 6.5 0 9"/>',
  user: '<circle cx="12" cy="8" r="3"/><path d="M6.5 19c.7-3.3 2.5-5 5.5-5s4.8 1.7 5.5 5"/>',
  add: '<path d="M12 6v12M6 12h12"/>'
}[type] || '<circle cx="12" cy="12" r="5"/>');

const pinIcon = (color, type = "add", photo = null) =>
  L.divIcon({
    className: "campus-pin-wrap",
    html: `
      <div class="campus-pin" style="--pin:${color}">
        <span class="campus-pin-inner">
          ${photo ? `<img src="${escapeAttr(photo)}" alt="" />` : `<svg viewBox="0 0 24 24" aria-hidden="true">${pinSvg(type)}</svg>`}
        </span>
      </div>
    `,
    iconSize: [38, 48],
    iconAnchor: [19, 46],
  });

function ViewController() {
  const map = useMap();

  useEffect(() => {
    const fit = () => {
      map.invalidateSize();
      map.fitBounds(IMAGE_BOUNDS, { padding: [16, 16] });
    };
    fit();
    const a = setTimeout(fit, 150);
    const b = setTimeout(fit, 500);
    window.addEventListener("resize", fit);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
      window.removeEventListener("resize", fit);
    };
  }, [map]);

  return null;
}

function ClickCatcher({ onClick }) {
  useMapEvents({ click: (e) => onClick(e.latlng) });
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
  const [selected, setSelected] = useState(null);
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

  useEffect(() => () => {
    if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
  }, []);

  useEffect(() => {
    if (!selected) return;
    const close = (e) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [selected]);

  function toggleSharing() {
    if (sharing) {
      if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
      stopSharingLocation(communityId).catch(() => {});
      setSharing(false);
      return;
    }
    if (!navigator.geolocation) return alert("Geolocation is not supported.");

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => shareLocation(communityId, pos.coords.latitude, pos.coords.longitude).catch(() => {}),
      (err) => {
        alert(err.message);
        setSharing(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    setSharing(true);
  }

  async function handleCreate(data) {
    try {
      let media_url = null;
      if (media) media_url = await uploadToCloudinary(media);
      else if (clip) media_url = await uploadToCloudinary(clip);
      await createPin({ ...data, media_url, community_id: communityId || null });
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
      setSelected(null);
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleDelete(id) {
    try {
      await deletePin(id);
      loadPins();
      setSelected(null);
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="naksha-map">
      <MapContainer
        center={CENTER}
        zoom={18.25}
        minZoom={15.75}
        maxZoom={21}
        zoomControl
        dragging
        scrollWheelZoom
        doubleClickZoom
        maxBounds={IMAGE_BOUNDS}
        maxBoundsViscosity={1}
        style={{ width: "100%", height: "100%" }}
      >
        <ImageOverlay url={REFERENCE_IMAGE_PATH} bounds={IMAGE_BOUNDS} opacity={1} interactive={false} zIndex={100} />
        <ViewController />
        <ScaleControl position="bottomleft" metric imperial />
        {canAddPin && <ClickCatcher onClick={setPending} />}

        {pins.map((pin) => (
          <Marker
            key={pin.id}
            position={[Number(pin.lat), Number(pin.lng)]}
            icon={pinIcon(PIN_TYPE_META[pin.type]?.color || "#7c3aed", PIN_TYPE_META[pin.type]?.icon || "add")}
            zIndexOffset={1000}
            eventHandlers={{ click: () => setSelected({ kind: "pin", data: pin }) }}
          />
        ))}

        {communityId && locations.map((loc) => (
          <Marker
            key={loc.user_id}
            position={[Number(loc.lat), Number(loc.lng)]}
            icon={pinIcon("#38BDF8", "user", loc.photo_url)}
            zIndexOffset={1200}
            eventHandlers={{ click: () => setSelected({ kind: "location", data: loc }) }}
          />
        ))}

        {pending && (
          <Marker
            position={[pending.lat, pending.lng]}
            icon={pinIcon("#ffffff", "add")}
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
          <button className="location-btn" onClick={toggleSharing}>
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

      {selected && (
        <div className="detail-backdrop" onClick={() => setSelected(null)}>
          <div className="detail-box" onClick={(e) => e.stopPropagation()}>
            <button className="detail-back" onClick={() => setSelected(null)}>← Back</button>
            {selected.kind === "pin" ? (
              <PinPopup
                pin={selected.data}
                onUpvote={handleUpvote}
                onDelete={handleDelete}
                canDelete={admin || selected.data.created_by === user?.user_id}
              />
            ) : (
              <div className="location-details">
                <div className="location-avatar">
                  {selected.data.photo_url ? (
                    <img src={selected.data.photo_url} alt={selected.data.name} />
                  ) : (
                    <svg viewBox="0 0 24 24" aria-hidden="true">{pinSvg("user")}</svg>
                  )}
                </div>
                <div>
                  <div className="detail-kicker">LIVE LOCATION</div>
                  <h2>{selected.data.name}</h2>
                  <p>Community member</p>
                </div>
                <div className="location-status"><span /> Currently sharing location</div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .naksha-map{position:relative;width:100%;height:100%;overflow:hidden;background:#0b0d1f}
        .campus-pin-wrap{background:transparent!important;border:0!important}
        .campus-pin{width:34px;height:34px;background:var(--pin);border:2px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 4px 10px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center}
        .campus-pin-inner{width:22px;height:22px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;line-height:1;transform:rotate(45deg);overflow:hidden}
        .campus-pin-inner img{width:100%;height:100%;object-fit:cover}.campus-pin-inner svg{width:15px;height:15px;fill:none;stroke:#111;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
        .community-chip,.location-btn{position:absolute;top:12px;z-index:1500;background:rgba(20,24,42,.94);color:#fff;border:1px solid rgba(255,255,255,.18);border-radius:6px;box-shadow:0 5px 16px rgba(0,0,0,.3);backdrop-filter:blur(8px);font:700 10px Arial,sans-serif}
        .community-chip{left:12px;padding:6px 9px;display:flex;gap:7px;align-items:center}.community-chip span{color:#9ca3af}.community-chip a{color:#c4b5fd;text-decoration:none}
        .location-btn{right:12px;padding:7px 10px;cursor:pointer;display:flex;align-items:center;gap:7px}.dot{width:7px;height:7px;border-radius:50%;background:#6b7280}.dot.on{background:#f43f5e}
        .pin-panel{position:absolute;right:16px;bottom:16px;z-index:2500;width:310px;max-width:calc(100% - 32px);padding:14px;background:rgba(22,26,45,.97);color:#fff;border:1px solid rgba(255,255,255,.16);border-radius:8px;box-shadow:0 14px 35px rgba(0,0,0,.45)}
        .pin-panel h3{margin:0;font:800 14px Arial,sans-serif}.pin-panel p{margin:4px 0 10px;color:#9ca3af;font-size:10px}.ready{display:block;margin:6px 0;color:#34d399}
        .detail-backdrop{position:absolute;inset:0;z-index:4000;background:rgba(3,5,15,.45);display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(3px)}
        .detail-box{width:min(440px,100%);max-height:min(620px,calc(100% - 20px));overflow:auto;background:rgba(18,22,40,.98);color:#fff;border:2px solid rgba(167,139,250,.55);border-radius:12px;padding:18px;box-shadow:0 20px 60px rgba(0,0,0,.55)}
        .detail-back{border:0;background:transparent;color:#c4b5fd;font:700 12px Arial,sans-serif;cursor:pointer;padding:0 0 12px}.detail-back:hover{color:#fff}
        .detail-kicker{font:700 10px Arial,sans-serif;color:#38bdf8;letter-spacing:.12em;margin-bottom:5px}.location-details h2{margin:0 0 3px;font:800 22px Arial,sans-serif}.location-details p{margin:0;color:#9ca3af;font:14px Arial,sans-serif}
        .location-avatar{width:84px;height:84px;border-radius:50%;overflow:hidden;background:#fff;color:#111;display:flex;align-items:center;justify-content:center;font-size:32px;border:3px solid #38bdf8;margin-bottom:14px}.location-avatar img{width:100%;height:100%;object-fit:cover}.location-avatar svg{width:36px;height:36px;fill:none;stroke:#111;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
        .location-status{margin-top:18px;padding:10px 12px;border-radius:8px;background:rgba(56,189,248,.1);color:#bae6fd;font:12px Arial,sans-serif;display:flex;align-items:center;gap:8px}.location-status span{width:8px;height:8px;border-radius:50%;background:#22c55e}
        .leaflet-control-zoom{border:2px solid #000!important;box-shadow:2px 2px 0 rgba(0,0,0,.5)!important;border-radius:3px!important;overflow:hidden}.leaflet-control-zoom a{background:#171b2b!important;color:#fff!important;border-color:rgba(255,255,255,.1)!important}.leaflet-control-zoom a:hover{background:#232842!important;color:#a78bfa!important}.leaflet-control-scale-line{background:rgba(20,24,42,.9)!important;color:#fff!important;border-color:#fff!important}
        @media(max-width:600px){.detail-backdrop{padding:12px;align-items:flex-end}.detail-box{max-height:75vh;border-radius:12px 12px 8px 8px}.community-chip{max-width:calc(100% - 160px);overflow:hidden}.community-chip strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}}
      `}</style>
    </div>
  );
}
