// src\api-manage\hooks\react-query\percel\useParcelWeightRange.js
import MainApi from "../../../MainApi";
import { useQuery } from "react-query";
import { onSingleErrorResponse } from "../../../api-error-response/ErrorResponses";
import { parcel_weight_range_api } from "api-manage/ParcelApi";
import { useEffect } from "react";
import toast from "react-hot-toast";

/* ================= TOAST GUARD ================= */

let hasShownLocationToast = false;

/* ================= INDIA BOUNDARY CHECK ================= */

const isInsideIndia = (lat, lng) => {
  return lat >= 6.5 && lat <= 37.1 && lng >= 68.1 && lng <= 97.4;
};

/* ================= GET LAT LNG ================= */

const getLatLngFromStorage = () => {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem("currentLatLng");

  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);

    return {
      lat: parsed.lat,
      lng: parsed.lng,
    };
  } catch {
    return null;
  }
};

/* ================= GET ZONE ================= */

const getValidZoneId = () => {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("zoneid");

    if (!raw) return null;

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

/* ================= VALIDATION ================= */

const validateLocationAndZone = () => {
  const coords = getLatLngFromStorage();

  if (!coords) {
    if (!hasShownLocationToast) {
      toast.error("Please select location to continue");
      hasShownLocationToast = true;
    }
    return false;
  }

  if (!isInsideIndia(coords.lat, coords.lng)) {
    if (!hasShownLocationToast) {
      toast.error("Service is available only in India");
      hasShownLocationToast = true;
    }
    return false;
  }

  const zone = getValidZoneId();

  if (!zone) {
    if (!hasShownLocationToast) {
      toast.error("Service not available in your area");
      hasShownLocationToast = true;
    }
    return false;
  }

  return true;
};

/* ================= API ================= */

const getParcelWeightRange = async () => {
  const isValid = validateLocationAndZone();

  if (!isValid) {
    return [];
  }

  const coords = getLatLngFromStorage();
  const zone = getValidZoneId();

  const response = await MainApi.get(parcel_weight_range_api, {
    headers: {
      moduleId: 4,
      zoneId: zone,
      latitude: coords.lat,
      longitude: coords.lng,
      localizationKey: "en",
    },
  });

  // console.log("FULL WEIGHT RANGE RESPONSE:", response);

  return response?.data?.data || [];
};

/* ================= HOOK ================= */

export default function useGetParcelWeightRange() {
  const coords = getLatLngFromStorage();
  const zone = getValidZoneId();

  /* Page Load Validation */

  useEffect(() => {
    validateLocationAndZone();
  }, []);

  return useQuery("parcel-weight-range", getParcelWeightRange, {
    enabled: !!coords && !!zone,
    retry: false,
    onError: onSingleErrorResponse,
  });
}
