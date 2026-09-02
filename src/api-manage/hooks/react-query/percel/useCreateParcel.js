import MainApi from "../../../MainApi";
import { useMutation } from "react-query";
import { parcel_details_api } from "api-manage/ParcelApi";
import { onSingleErrorResponse } from "../../../api-error-response/ErrorResponses";
import toast from "react-hot-toast";

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

/* ================= API CALL ================= */

const createParcel = async (payload) => {
  const coords = getLatLngFromStorage();
  const zone = getZoneFromStorage();

  const response = await MainApi.post(parcel_details_api, payload, {
    headers: {
      moduleId: 4,
      zoneId: zone,
      latitude: coords?.lat,
      longitude: coords?.lng,
      localizationKey: "en",
    },
  });

  // console.log("🔥 PARCEL CREATE RESPONSE:", response);

  return response?.data;
};

/* ================= HOOK ================= */

export default function useCreateParcel() {
  return useMutation(createParcel, {
    onSuccess: (data) => {
      toast.success("Parcel created successfully 🚀");
    },
    onError: onSingleErrorResponse,
  });
}
