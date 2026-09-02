import MainApi from "../../../MainApi";
import { useMutation } from "react-query";
import { parcel_drop_api } from "api-manage/ParcelApi";
import toast from "react-hot-toast";
import { onSingleErrorResponse } from "../../../api-error-response/ErrorResponses";

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

const createDrop = async ({ parcelId, payload }) => {
  const coords = getLatLngFromStorage();
  const zone = getZoneFromStorage();

  const res = await MainApi.post(parcel_drop_api(parcelId), payload, {
    headers: {
      moduleId: 4,
      zoneId: Array.isArray(zone) ? zone[0] : zone, // ✅ fix
      latitude: coords?.lat || "", // ✅ safe fallback
      longitude: coords?.lng || "", // ✅ safe fallback
      localizationKey: "en",
    },
  });

  // console.log("📦 DROP RESPONSE:", res);
  return res?.data;
};

export default function useCreateDrop() {
  return useMutation(createDrop, {
    // onSuccess: () => toast.success("Drop details saved ✅"),
    onError: onSingleErrorResponse,
  });
}
