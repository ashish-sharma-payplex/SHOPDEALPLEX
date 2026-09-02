export const getToken = () => {
  if (typeof window !== "undefined") {
    return window.localStorage.getItem("token");
  }
};
export const getGuestId = () => {
  if (typeof window !== "undefined") {
  
    // Try localStorage first, then sessionStorage for incognito mode support
    return window.localStorage.getItem("guest_id") || window.sessionStorage.getItem("guest_id");
  }
};
