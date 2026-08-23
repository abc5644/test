import {
  useEffect,
  useState,
} from "react";

import {
  getCurrentUser,
  getMe,
  updateMyProfile,
  logout,
} from "../api.js";

import {
  useNavigate,
} from "react-router-dom";

import UploadPhoto from "../components/UploadPhoto.jsx";


export default function Profile() {
  const navigate =
    useNavigate();

  const cachedUser =
    getCurrentUser();


  /* ==========================================================
     STATE
  ========================================================== */

  const [
    name,
    setName,
  ] = useState(
    cachedUser?.name || ""
  );

  const [
    email,
    setEmail,
  ] = useState(
    cachedUser?.email || ""
  );

  const [
    photoUrl,
    setPhotoUrl,
  ] = useState(
    cachedUser?.photo_url ||
      null
  );

  const [
    role,
    setRole,
  ] = useState(
    cachedUser?.role ||
      "user"
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");


  /* ==========================================================
     LOAD AUTHORITATIVE PROFILE
  ========================================================== */

  useEffect(() => {
    let mounted = true;


    async function loadProfile() {
      try {
        const user =
          await getMe();

        if (!mounted) {
          return;
        }


        setName(
          user.name || ""
        );

        setEmail(
          user.email || ""
        );

        setPhotoUrl(
          user.photo_url ||
            null
        );

        setRole(
          user.role ||
            "user"
        );

      } catch (err) {
        if (!mounted) {
          return;
        }

        setError(
          err.message ||
            "Unable to load profile."
        );

      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }


    /*
     * If there is no cached session, don't make an
     * authenticated request that is guaranteed to fail.
     */

    if (cachedUser) {
      loadProfile();
    } else {
      setLoading(false);
      navigate("/login");
    }


    return () => {
      mounted = false;
    };
  }, [navigate]);


  /* ==========================================================
     PHOTO UPLOAD
  ========================================================== */

  function handlePhotoUploaded(
    url
  ) {
    setPhotoUrl(url);
    setMessage("");
    setError("");
  }


  /* ==========================================================
     SAVE PROFILE
  ========================================================== */

  async function handleSave(
    event
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");


    try {
      const updated =
        await updateMyProfile({
          name,
          photo_url:
            photoUrl,
        });


      setName(
        updated.name || ""
      );

      setEmail(
        updated.email || ""
      );

      setPhotoUrl(
        updated.photo_url ||
          null
      );

      setRole(
        updated.role ||
          "user"
      );

      setMessage(
        "Profile saved successfully."
      );

    } catch (err) {
      setError(
        err.message ||
          "Failed to save profile."
      );

    } finally {
      setSaving(false);
    }
  }


  /* ==========================================================
     LOGOUT
  ========================================================== */

  function handleLogout() {
    logout();
    navigate("/");
  }


  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={styles.muted}>
            Loading profile…
          </p>
        </div>
      </div>
    );
  }


  /* ==========================================================
     PAGE
  ========================================================== */

  return (
    <div style={styles.page}>

      <div style={styles.card}>

        {/* ==================================================
            HEADER
        ================================================== */}

        <div style={styles.header}>

          <div>
            <div style={styles.kicker}>
              NAKSHA ACCOUNT
            </div>

            <h2 style={styles.title}>
              Your Profile
            </h2>

            <p style={styles.subtitle}>
              Keep your campus identity up to date.
            </p>
          </div>


          <div style={styles.roleBadge}>
            {role}
          </div>

        </div>


        {/* ==================================================
            PROFILE PHOTO
        ================================================== */}

        <div style={styles.photoSection}>

          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Profile"
              style={styles.avatar}
            />
          ) : (
            <div style={styles.avatarFallback}>
              {name
                ? name
                    .trim()
                    .charAt(0)
                    .toUpperCase()
                : "?"}
            </div>
          )}


          <div style={styles.photoInfo}>

            <div style={styles.sectionLabel}>
              PROFILE PHOTO
            </div>

            <UploadPhoto
              onUploaded={
                handlePhotoUploaded
              }
            />

            <p style={styles.helper}>
              Your new photo is uploaded first,
              then saved with your profile.
            </p>

          </div>

        </div>


        {/* ==================================================
            PROFILE FORM
        ================================================== */}

        <form
          onSubmit={
            handleSave
          }
        >

          {/* -----------------------------------------------
              NAME
          ------------------------------------------------ */}

          <label style={styles.label}>
            Name

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              maxLength={100}
              placeholder="Your name"
              style={styles.input}
              disabled={saving}
            />
          </label>


          {/* -----------------------------------------------
              EMAIL
          ------------------------------------------------ */}

          <label style={styles.label}>
            Email

            <input
              type="email"
              value={email}
              disabled
              style={{
                ...styles.input,
                ...styles.disabledInput,
              }}
            />

            <span style={styles.helper}>
              Email is linked to your account
              and cannot be changed here.
            </span>
          </label>


          {/* -----------------------------------------------
              STATUS
          ------------------------------------------------ */}

          {message && (
            <div style={styles.success}>
              {message}
            </div>
          )}


          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}


          {/* -----------------------------------------------
              ACTIONS
          ------------------------------------------------ */}

          <div style={styles.actions}>

            <button
              type="submit"
              disabled={
                saving ||
                !name.trim()
              }
              style={{
                ...styles.primaryButton,

                ...(saving ||
                !name.trim()
                  ? styles.disabledButton
                  : {}),
              }}
            >
              {saving
                ? "SAVING…"
                : "SAVE PROFILE"}
            </button>


            <button
              type="button"
              onClick={
                handleLogout
              }
              style={
                styles.secondaryButton
              }
            >
              LOG OUT
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


/* ============================================================
   STYLES
============================================================ */

const styles = {

  page: {
    minHeight: "100%",
    width: "100%",
    padding: "40px 20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    background: "#101322",
    color: "#ffffff",
    boxSizing: "border-box",
  },


  card: {
    width: "100%",
    maxWidth: "620px",
    padding: "28px",
    background: "#171b2b",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "12px",
    boxShadow: "0 18px 45px rgba(0,0,0,0.35)",
  },


  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "28px",
  },


  kicker: {
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.14em",
    color: "#a78bfa",
    marginBottom: "6px",
  },


  title: {
    margin: 0,
    fontSize: "28px",
    lineHeight: 1.1,
  },


  subtitle: {
    margin: "7px 0 0",
    color: "#9ca3af",
    fontSize: "13px",
  },


  roleBadge: {
    padding: "6px 9px",
    borderRadius: "999px",
    background: "rgba(167,139,250,0.12)",
    border: "1px solid rgba(167,139,250,0.28)",
    color: "#c4b5fd",
    fontSize: "10px",
    fontWeight: 800,
    textTransform: "uppercase",
  },


  photoSection: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    padding: "18px 0",
    marginBottom: "22px",
    borderTop:
      "1px solid rgba(255,255,255,0.08)",
    borderBottom:
      "1px solid rgba(255,255,255,0.08)",
  },


  avatar: {
    width: "92px",
    height: "92px",
    borderRadius: "50%",
    objectFit: "cover",
    border:
      "3px solid rgba(167,139,250,0.55)",
    flexShrink: 0,
  },


  avatarFallback: {
    width: "92px",
    height: "92px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #4338ca, #7c3aed)",
    color: "#ffffff",
    fontSize: "32px",
    fontWeight: 900,
    flexShrink: 0,
  },


  photoInfo: {
    minWidth: 0,
  },


  sectionLabel: {
    marginBottom: "8px",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.1em",
    color: "#9ca3af",
  },


  label: {
    display: "block",
    marginBottom: "18px",
    fontSize: "12px",
    fontWeight: 700,
    color: "#d1d5db",
  },


  input: {
    display: "block",
    width: "100%",
    marginTop: "7px",
    padding: "11px 12px",
    borderRadius: "7px",
    border:
      "1px solid rgba(255,255,255,0.15)",
    background: "#0f1322",
    color: "#ffffff",
    outline: "none",
    fontSize: "13px",
    boxSizing: "border-box",
  },


  disabledInput: {
    color: "#8b92a1",
    cursor: "not-allowed",
    background: "#111522",
  },


  helper: {
    display: "block",
    marginTop: "6px",
    color: "#7f8797",
    fontSize: "10px",
    lineHeight: 1.4,
  },


  success: {
    marginBottom: "14px",
    padding: "10px 12px",
    borderRadius: "7px",
    background:
      "rgba(52,211,153,0.10)",
    border:
      "1px solid rgba(52,211,153,0.24)",
    color: "#6ee7b7",
    fontSize: "11px",
    fontWeight: 700,
  },


  error: {
    marginBottom: "14px",
    padding: "10px 12px",
    borderRadius: "7px",
    background:
      "rgba(244,63,94,0.10)",
    border:
      "1px solid rgba(244,63,94,0.24)",
    color: "#fda4af",
    fontSize: "11px",
    fontWeight: 700,
  },


  actions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "24px",
  },


  primaryButton: {
    border: "none",
    borderRadius: "7px",
    padding: "11px 15px",
    background: "#7c3aed",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: 800,
    cursor: "pointer",
  },


  secondaryButton: {
    border:
      "1px solid rgba(255,255,255,0.16)",
    borderRadius: "7px",
    padding: "11px 15px",
    background: "transparent",
    color: "#d1d5db",
    fontSize: "11px",
    fontWeight: 800,
    cursor: "pointer",
  },


  disabledButton: {
    opacity: 0.45,
    cursor: "not-allowed",
  },


  muted: {
    color: "#9ca3af",
    fontSize: "13px",
  },

};