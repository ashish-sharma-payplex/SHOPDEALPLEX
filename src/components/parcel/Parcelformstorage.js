// parcelFormStorage.js
// ─────────────────────────────────────────────────────────────────────────────
// Central storage utility for the entire parcel booking flow.
// Import keys from HERE — not from MainForm — so every file gets the same key.
// Call clearAllParcelStorage() ONLY after a successful order placement.
// ─────────────────────────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  STEP:        "parcel_flow_step",   // which step the user was on  (0/1/2)
  PARCEL:      "parcel_raw_data",    // ParcelForm  state
  PICKUP:      "pickup_raw_data",    // PickUpForm  state
  DROP:        "drop_raw_data",      // DropForm    state
  MERGED:      "parcel_merged_payload", // accumulated merged payload
};

// ── read ──────────────────────────────────────────────────────────────────────
export const readStorage = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// ── write ─────────────────────────────────────────────────────────────────────
export const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

// ── clear ONE key ─────────────────────────────────────────────────────────────
export const clearStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {}
};

// ── clear ALL parcel-flow keys (call this after successful checkout) ───────────
export const clearAllParcelStorage = () => {
  Object.values(STORAGE_KEYS).forEach((key) => {
    try { localStorage.removeItem(key); } catch {}
  });
};