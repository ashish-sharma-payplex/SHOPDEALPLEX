import MainApi from "../../../MainApi";
import { useMutation } from "react-query";
import { parcel_book_api } from "api-manage/ParcelApi";
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

const bookParcel = async (payload) => {
  const coords = getLatLngFromStorage();
  const zone = getZoneFromStorage();

  const res = await MainApi.post(parcel_book_api, payload, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,

      moduleId: 4,
      zoneId: Array.isArray(zone) ? zone[0] : zone,
      latitude: coords?.lat || "",
      longitude: coords?.lng || "",
      localizationKey: "en",
    },
  });

  return res?.data;
};

export default function useBookParcel() {
  return useMutation(bookParcel, {
    onSuccess: () => toast.success("Booking Confirmed 🚀"),
    onError: onSingleErrorResponse,
  });
}
