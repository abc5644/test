/**
 * Single shared file for every backend fetch() call.
 * Keep pages/components thin — they call these functions,
 * not fetch() directly.
 */

const API_URL = import.meta.env.VITE_API_URL;


/* ============================================================
   SESSION
============================================================ */

function getToken() {
  return localStorage.getItem("cp_token");
}


function setSession({
  access_token,
  user_id,
  name,
  email,
  role,
  photo_url = null,
}) {
  localStorage.setItem(
    "cp_token",
    access_token
  );

  localStorage.setItem(
    "cp_user",
    JSON.stringify({
      user_id,
      name,
      email,
      role,
      photo_url,
    })
  );
}


/*
 * Update only the local cached user object.
 *
 * This is useful after /auth/me or /auth/me PATCH because
 * we don't want to throw away the existing JWT.
 */
function updateCachedUser(
  updates
) {
  const current =
    getCurrentUser() || {};

  const updated = {
    ...current,
    ...updates,
  };

  localStorage.setItem(
    "cp_user",
    JSON.stringify(updated)
  );

  return updated;
}


/* ============================================================
   AUTH STATE
============================================================ */

export function isLoggedIn() {
  return Boolean(
    getToken()
  );
}


export function getCurrentUser() {
  const raw =
    localStorage.getItem(
      "cp_user"
    );

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(
      "cp_user"
    );

    return null;
  }
}


export function isAdmin() {
  return (
    getCurrentUser()?.role ===
    "admin"
  );
}


export function logout() {
  localStorage.removeItem(
    "cp_token"
  );

  localStorage.removeItem(
    "cp_user"
  );
}


/* ============================================================
   GENERIC REQUEST
============================================================ */

async function request(
  path,
  {
    method = "GET",
    body,
    auth = false,
  } = {}
) {
  const headers = {
    "Content-Type":
      "application/json",
  };


  if (auth) {
    const token =
      getToken();

    if (!token) {
      throw new Error(
        "You are not logged in."
      );
    }

    headers[
      "Authorization"
    ] =
      `Bearer ${token}`;
  }


  let res;

  try {
    res = await fetch(
      `${API_URL}${path}`,
      {
        method,
        headers,
        body:
          body !== undefined
            ? JSON.stringify(body)
            : undefined,
      }
    );
  } catch (error) {
    throw new Error(
      "Unable to connect to the backend."
    );
  }


  if (!res.ok) {
    const err =
      await res
        .json()
        .catch(() => ({
          detail:
            res.statusText,
        }));

    throw new Error(
      err.detail ||
        "Request failed"
    );
  }


  if (res.status === 204) {
    return null;
  }


  return res.json();
}


/* ============================================================
   AUTH
============================================================ */

export async function signup({
  email,
  password,
  name,
}) {
  const data =
    await request(
      "/auth/signup",
      {
        method: "POST",

        body: {
          email,
          password,
          name,
        },
      }
    );

  setSession(data);

  return data;
}


export async function login({
  email,
  password,
}) {
  const data =
    await request(
      "/auth/login",
      {
        method: "POST",

        body: {
          email,
          password,
        },
      }
    );

  setSession(data);

  return data;
}


/* ============================================================
   CURRENT USER / PROFILE
============================================================ */

/*
 * Fetch the authoritative profile from the backend.
 *
 * This should be called after login/page load when we need to
 * make sure localStorage is up to date.
 */
export async function getMe() {
  const data =
    await request(
      "/auth/me",
      {
        auth: true,
      }
    );


  /*
   * Backend uses `id`, while the existing frontend session
   * uses `user_id`.
   */
  updateCachedUser({
    user_id:
      data.id,

    name:
      data.name,

    email:
      data.email,

    role:
      data.role,

    photo_url:
      data.photo_url ??
      null,
  });


  return data;
}


/*
 * Persist profile changes to MongoDB.
 *
 * Supported by the backend:
 * - name
 * - photo_url
 */
export async function updateMyProfile({
  name,
  photo_url,
}) {
  const body = {};

  if (
    name !== undefined
  ) {
    body.name = name;
  }

  if (
    photo_url !== undefined
  ) {
    body.photo_url =
      photo_url;
  }


  const data =
    await request(
      "/auth/me",
      {
        method: "PATCH",

        body,

        auth: true,
      }
    );


  updateCachedUser({
    user_id:
      data.id,

    name:
      data.name,

    email:
      data.email,

    role:
      data.role,

    photo_url:
      data.photo_url ??
      null,
  });


  return data;
}


/* ============================================================
   PINS
============================================================ */

export function getPins(
  communityId = null
) {
  const query =
    communityId
      ? `?community_id=${encodeURIComponent(
          communityId
        )}`
      : "";

  return request(
    `/pins${query}`
  );
}


export function createPin(
  pin
) {
  return request(
    "/pins",
    {
      method: "POST",
      body: pin,
      auth: true,
    }
  );
}


export function upvotePin(
  pinId
) {
  return request(
    `/pins/${pinId}/upvote`,
    {
      method: "POST",
      auth: true,
    }
  );
}


export function deletePin(
  pinId
) {
  return request(
    `/pins/${pinId}`,
    {
      method: "DELETE",
      auth: true,
    }
  );
}


/* ============================================================
   COMMUNITIES
============================================================ */

export function createCommunity(
  name
) {
  return request(
    "/communities",
    {
      method: "POST",

      body: {
        name,
      },

      auth: true,
    }
  );
}


export function joinCommunity(
  joinCode
) {
  return request(
    "/communities/join",
    {
      method: "POST",

      body: {
        join_code:
          joinCode,
      },

      auth: true,
    }
  );
}


export function getMyCommunities() {
  return request(
    "/communities/mine",
    {
      auth: true,
    }
  );
}


/* ============================================================
   MEDIA / CLOUDINARY
============================================================ */

export async function uploadToCloudinary(
  file
) {
  const cloudName =
    import.meta.env
      .VITE_CLOUDINARY_CLOUD_NAME;

  const uploadPreset =
    import.meta.env
      .VITE_CLOUDINARY_UPLOAD_PRESET;


  if (
    !cloudName ||
    !uploadPreset
  ) {
    throw new Error(
      "Cloudinary configuration is missing."
    );
  }


  const formData =
    new FormData();

  formData.append(
    "file",
    file
  );

  formData.append(
    "upload_preset",
    uploadPreset
  );


  const res =
    await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      {
        method: "POST",
        body: formData,
      }
    );


  if (!res.ok) {
    throw new Error(
      "Media upload failed"
    );
  }


  const data =
    await res.json();


  if (!data.secure_url) {
    throw new Error(
      "Cloudinary did not return a media URL."
    );
  }


  return data.secure_url;
}


/* ============================================================
   LIVE LOCATION
============================================================ */

export function shareLocation(
  communityId,
  lat,
  lng
) {
  return request(
    `/locations/${encodeURIComponent(
      communityId
    )}`,
    {
      method: "POST",

      body: {
        lat,
        lng,
      },

      auth: true,
    }
  );
}


export function getCommunityLocations(
  communityId
) {
  return request(
    `/locations/${encodeURIComponent(
      communityId
    )}`,
    {
      auth: true,
    }
  );
}


export function stopSharingLocation(
  communityId
) {
  return request(
    `/locations/${encodeURIComponent(
      communityId
    )}`,
    {
      method: "DELETE",
      auth: true,
    }
  );
}