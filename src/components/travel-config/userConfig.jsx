// src/components/travel-config/userConfig.js

const USER_ID_KEY = "app_user_id";
const USER_NAME_KEY = "app_user_name";
const USER_IMAGE_KEY = "app_user_image";

export const syncTravelUser = ({ userId, name, image } = {}) => {
  if (typeof window === "undefined") return;

  if (userId) {
    sessionStorage.setItem(USER_ID_KEY, userId);
    if (name) sessionStorage.setItem(USER_NAME_KEY, name);
    if (image) sessionStorage.setItem(USER_IMAGE_KEY, image);
    // console.log("✅ Travel user synced:", { userId, name, image });
  } else {
    clearTravelUser();
  }

  window.dispatchEvent(new Event("TRAVEL_USER_UPDATED"));
};

/**
 * ✅ Logout hone pe ya id na milne pe sab clear
 */
export const clearTravelUser = () => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(USER_ID_KEY);
  sessionStorage.removeItem(USER_NAME_KEY);
  sessionStorage.removeItem(USER_IMAGE_KEY);
  window.dispatchEvent(new Event("TRAVEL_USER_UPDATED"));
};

/**
 * ✅ URL params se ek baar init (dev mode / new-tab open case ke liye,
 * prod me same-origin hone ki wajah se generally trigger hi nahi hoga)
 */
const initUserDataFromUrl = () => {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const userIdFromUrl = params.get("user_id");
  const nameFromUrl = params.get("name");
  const imageFromUrl = params.get("image");

  if (userIdFromUrl) {
    syncTravelUser({
      userId: userIdFromUrl,
      name: nameFromUrl,
      image: imageFromUrl,
    });

    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }
};

initUserDataFromUrl();

/**
 * ✅ NO fallback "1" ab. Nahi mila to null — API files isko detect karke swal dikhayengi.
 */
export const getUserId = () => {
  if (typeof window === "undefined") return null;
  const id = sessionStorage.getItem(USER_ID_KEY);
  // console.log("👤 getUserId called, returning:", id);
  return id || null;
};

export const getUserName = () => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(USER_NAME_KEY) || null;
};

export const getUserImage = () => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(USER_IMAGE_KEY) || null;
};

/**
 * ✅ Kahin bhi guard check ke liye
 */
export const isTravelUserLoggedIn = () => !!getUserId();