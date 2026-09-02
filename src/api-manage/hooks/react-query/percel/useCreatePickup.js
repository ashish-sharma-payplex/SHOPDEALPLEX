import MainApi from "../../../MainApi";
import { useMutation } from "react-query";
import { parcel_pickup_api } from "api-manage/ParcelApi";
import toast from "react-hot-toast";
import { onSingleErrorResponse } from "../../../api-error-response/ErrorResponses";

/* ================= HELPERS ================= */

const getLatLngFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem("currentLatLng"));
  } catch {
    return null;
  }
};

const getZoneFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem("zoneid"));
  } catch {
    return null;
  }
};

/* ================= API ================= */

const createPickup = async ({ parcelId, payload }) => {
  const coords = getLatLngFromStorage();
  const zone = getZoneFromStorage();

  const response = await MainApi.post(parcel_pickup_api(parcelId), payload, {
    headers: {
      moduleId: 4,
      zoneId: zone,
      latitude: coords?.lat,
      longitude: coords?.lng,
      localizationKey: "en",
    },
  });

  // console.log("📍 PICKUP RESPONSE:", response);

  return response?.data;
};

/* ================= HOOK ================= */

export default function useCreatePickup() {
  return useMutation(createPickup, {
    onSuccess: () => {
      // toast.success("Pickup details saved ✅");
    },
    onError: onSingleErrorResponse,
  });
}
