import MainApi from "../MainApi";
import { getToken } from "../../helper-functions/getToken";

export const ProfileApi = {
  profileInfo: () => {
    const token = getToken();
    const currentLanguageKey = "en";  // You can dynamically fetch this value if needed (from i18n, for example)
    
    // Check if token is available and add headers
    if (token) {
      return MainApi.get("/api/v1/customer/info", {
        headers: {
          Authorization: `Bearer ${token}`,  // Adding the token for authorization
          current_language_key: currentLanguageKey,  // Sending the current language key
        },
      });
    }
    return null;  // Return null if token is not found
  },

  profileUpdate: (profileData) =>
    MainApi.post("/api/v1/customer/update-profile", profileData),
};
