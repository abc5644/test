// Single source of truth for pin-type colors/labels/icons.
// Import this anywhere a pin type needs to be shown or selected,
// so the map markers, dropdown, and popups never drift out of sync.
export const PIN_TYPE_META = {
  study: { label: "Study spot", color: "#5EEAD4", icon: "book" },
  crowded: { label: "Crowded", color: "#FB7185", icon: "crowd" },
  silent: { label: "Silent zone", color: "#A78BFA", icon: "silent" },
  event: { label: "Event", color: "#FBBF24", icon: "event" },
  sound: { label: "Vibe / sound", color: "#38BDF8", icon: "sound" },
};

export const PIN_TYPES = Object.keys(PIN_TYPE_META);