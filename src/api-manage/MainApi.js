import axios from "axios";
import toast from "react-hot-toast";
import { t } from "i18next";
import { store } from "../redux/store";

export const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
const MainApi = axios.create({
  baseURL: baseUrl,
});

// Track if geolocation has been attempted in this session
let geolocationAttempted = false;

// Function to validate if location is in a valid zone
const validateLocationInZone = async (coords) => {
  try {
    const response = await axios.get(
      `${baseUrl}/api/v1/config/get-zone-id?lat=${coords.lat}&lng=${coords.lng}`,
      {
        headers: {
          "X-software-id": 33571750,
          "origin": process.env.NEXT_CLIENT_HOST_URL,
        }
      }
    );
    
    // If we get a valid zone response, the location is in a valid zone
    return response.data && response.data.zone_id;
  } catch (error) {
    // If the API returns an error, the location is not in a valid zone
    return false;
  }
};

// Function to get location with proper error handling and caching
const getLocationWithCache = async () => {
  // Check if we've already attempted geolocation in this session
  if (geolocationAttempted) {
    return JSON.parse(localStorage.getItem("currentLatLng"));
  }
  
  // Mark as attempted to prevent multiple calls
  geolocationAttempted = true;
  
  // Check if geolocation was previously denied
  const geolocationDenied = localStorage.getItem("geolocationDenied") === "true";
  const cachedLocation = JSON.parse(localStorage.getItem("currentLatLng"));
  
  if (geolocationDenied) {
    // Skip geolocation if previously denied
    return cachedLocation || null;
  }
  
  if (cachedLocation) {
    // Validate cached location
    const zoneValidation = await validateLocationInZone(cachedLocation);
    if (zoneValidation) {
      return cachedLocation;
    } else {
      // Cached location is no longer valid
      localStorage.removeItem("currentLatLng");
      localStorage.removeItem("zoneid");
      toast.error(t("Your saved location is no longer in our service area. Please update your location."));
      return null;
    } 
  }
  
  // Attempt to get fresh location
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        (error) => {
          // Cache the denial to prevent repeated requests
          localStorage.setItem("geolocationDenied", "true");
          
          // Show toast only once
          if (!sessionStorage.getItem("locationErrorShown")) {
            toast.error(t("Location unavailable, Please select location"));
            sessionStorage.setItem("locationErrorShown", "true");
          }
          
          reject(error);
        },
        { timeout: 5000 }
      );
    });
    
    const coords = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
    
    // Validate if the location is in a valid zone
    const zoneValidation = await validateLocationInZone(coords);
    
    if (zoneValidation) {
      // Location is in a valid zone, save it
      localStorage.setItem("currentLatLng", JSON.stringify(coords));
      localStorage.setItem("zoneid", zoneValidation);
      return coords;
    } else {
      // Location is not in a valid zone
      toast.error(t("Your location is not in our service area. Please select a location within our service zone."));
      return null;
    }
  } catch (e) {
    // console.error("Geolocation error:", e);
    return null;
  }
};

MainApi.interceptors.request.use(async function (config) {
  let zoneid, token, language, currentLocation, moduleid;
  const software_id = 33571750;
  const hostname = process.env.NEXT_CLIENT_HOST_URL;

  if (typeof window !== "undefined") {
    zoneid = localStorage.getItem("zoneid");
    token = localStorage.getItem("token");
    language = JSON.parse(localStorage.getItem("language-setting"));
    moduleid = JSON.parse(localStorage.getItem("module"))?.id;

    // Get location with caching and error handling
    currentLocation = await getLocationWithCache();
  }

  if (currentLocation) {
    config.headers.latitude = currentLocation.lat;
    config.headers.longitude = currentLocation.lng;
  }
  if (zoneid) config.headers.zoneid = zoneid;
  if (moduleid) config.headers.moduleId = moduleid;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (language) config.headers["X-localization"] = language;
  if (hostname) config.headers["origin"] = hostname;
  config.headers["X-software-id"] = software_id;
  config.headers["Accept"] = "application/json";

  return config;
});

export default MainApi;
