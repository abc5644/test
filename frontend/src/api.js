/**
 * Single shared file for every backend fetch() call.
 * Keep pages/components thin — they call these functions, not fetch() directly.
 */
const API_URL = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem("cp_token");
}

function setSession({ access_token, user_id, name, email }) {
  localStorage.setItem("cp_token", access_token);
  localStorage.setItem("cp_user", JSON.stringify({ user_id, name, email }));
}

export function isLoggedIn() {
  return Boolean(getToken());
}

export function getCurrentUser() {
  const raw = localStorage.getItem("cp_user");
  return raw ? JSON.parse(raw) : null;
}

export function logout() {
  localStorage.removeItem("cp_token");
  localStorage.removeItem("cp_user");
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) headers["Authorization"] = `Bearer ${getToken()}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }

  if (res.status === 204) return null;
  return res.json();
}

// ---- Auth ----
export async function signup({ email, password, name }) {
  const data = await request("/auth/signup", { method: "POST", body: { email, password, name } });
  setSession(data);
  return data;
}

export async function login({ email, password }) {
  const data = await request("/auth/login", { method: "POST", body: { email, password } });
  setSession(data);
  return data;
}

// ---- Pins ----
export function getPins(communityId = null) {
  const query = communityId ? `?community_id=${communityId}` : "";
  return request(`/pins${query}`);
}

export function createPin(pin) {
  return request("/pins", { method: "POST", body: pin, auth: true });
}

export function upvotePin(pinId) {
  return request(`/pins/${pinId}/upvote`, { method: "POST", auth: true });
}

export function deletePin(pinId) {
  return request(`/pins/${pinId}`, { method: "DELETE", auth: true });
}

// ---- Communities ----
export function createCommunity(name) {
  return request("/communities", { method: "POST", body: { name }, auth: true });
}

export function joinCommunity(joinCode) {
  return request("/communities/join", { method: "POST", body: { join_code: joinCode }, auth: true });
}

export function getMyCommunities() {
  return request("/communities/mine", { auth: true });
}

// ---- Media (Cloudinary — uploaded directly from the browser, not via backend) ----
export async function uploadToCloudinary(file) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Media upload failed");
  const data = await res.json();
  return data.secure_url;
}
