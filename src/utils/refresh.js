// src/lib/refresh.js
// Simple emitter that posts a global event the app can listen to.
let timeoutId = null;

export const triggerUiRefresh = (wait = 100) => {
  if (typeof window === "undefined") return;

  // debounce coalescing multiple triggers into one
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    window.dispatchEvent(new Event("app-data-refresh"));
    timeoutId = null;
  }, wait);
};
