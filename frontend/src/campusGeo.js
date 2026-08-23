export const REFERENCE_IMAGE_PATH = "/nsut-reference-map.jpg";

export const NSUT_CENTER = [
  28.609888,
  77.035854,
];

/*
  Geographic rectangle for the 768 x 542 reference image.

  These bounds are fitted from known NSUT landmarks:
  APJ Complex, Students Centre, Central Library and
  Mini Auditorium.
*/
export const REFERENCE_IMAGE_BOUNDS = [
  [28.6069248, 77.0339566], // SW
  [28.6134838, 77.0421727], // NE
];

/*
  Real control points on the 768 x 542 image.
  pixel = [x, y]
  latlng = [latitude, longitude]
*/
export const CONTROL_POINTS = [
  {
    name: "APJ Complex",
    pixel: [276, 111],
    latlng: [28.61199, 77.03701],
  },
  {
    name: "Students Centre",
    pixel: [286, 185],
    latlng: [28.6116515, 77.0369261],
  },
  {
    name: "Central Library",
    pixel: [466, 233],
    latlng: [28.6103953, 77.0389687],
  },
  {
    name: "Mini Auditorium",
    pixel: [388, 322],
    latlng: [28.6096, 77.03807],
  },
];

/*
  Convert a pixel on the reference image to real
  [latitude, longitude].
*/
export function referencePixelToLatLng(
  x,
  y
) {
  const lng =
    77.0339566 +
    x * 0.00001069811537;

  const lat =
    28.6134838 -
    y * 0.00001210148815;

  return [lat, lng];
}

/*
  Compatibility exports for the rest of the app.
*/
export const CAMPUS_BOUNDARY_LATLNG = [
  [28.6134838, 77.0339566],
  [28.6134838, 77.0421727],
  [28.6069248, 77.0421727],
  [28.6069248, 77.0339566],
];

export const CAMPUS_GEOJSON = {
  type: "FeatureCollection",
  features: [],
};

export const CATEGORY_COLORS = {
  boundary: "#111111",
  academic: "#7c6ff0",
  hostel: "#f59e0b",
  sports: "#22c55e",
  lawn: "#14b8a6",
  road: "#64748b",
  facility: "#38bdf8",
  other: "#94a3b8",
};

export const WORLD_RING = [
  [-90, -180],
  [-90, 180],
  [90, 180],
  [90, -180],
  [-90, -180],
];

export default CAMPUS_GEOJSON;