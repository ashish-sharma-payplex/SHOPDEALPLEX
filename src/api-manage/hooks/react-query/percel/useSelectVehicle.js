import MainApi from "../../../MainApi";
import { useMutation } from "react-query";
import { parcel_select_vehicle_api } from "api-manage/ParcelApi";
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

const selectVehicle = async ({ parcelId, vehicleId }) => {
  const coords = getLatLngFromStorage();
  const zone = getZoneFromStorage();

  const res = await MainApi.post(
    parcel_select_vehicle_api(parcelId),
    {
      vehicle_id: vehicleId, // 🔥 IMPORTANT
    },
    {
      headers: {
        moduleId: 4,
        zoneId: Array.isArray(zone) ? zone[0] : zone,
        latitude: coords?.lat || "",
        longitude: coords?.lng || "",
        localizationKey: "en",
      },
    }
  );

  return res?.data;
};

export default function useSelectVehicle() {
  return useMutation(selectVehicle, {
    // onSuccess: () => toast.success("Vehicle Selected ✅"),
    onError: onSingleErrorResponse,
  });
}