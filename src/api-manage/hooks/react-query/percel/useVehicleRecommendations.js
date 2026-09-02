import MainApi from "../../../MainApi";
import { useQuery } from "react-query";
import { parcel_vehicle_recommendation_api } from "api-manage/ParcelApi";
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

const getVehicleRecommendations = async (parcelData) => {
  const coords = getLatLngFromStorage();
  const zone = getZoneFromStorage();

  const body = {
    pickup_lat: parcelData?.pickup_latitude,
    pickup_lng: parcelData?.pickup_longitude,
    drop_lat: parcelData?.drop_latitude,
    drop_lng: parcelData?.drop_longitude,
    weight_range: parcelData?.weight_rangeid,
  };

  const res = await MainApi.post(
    parcel_vehicle_recommendation_api,
    body,
    {
      headers: {
        moduleId: 4,
        zoneId: zone ? (Array.isArray(zone) ? zone[0] : zone) : "",
        latitude: coords?.lat || "",
        longitude: coords?.lng || "",
        localizationKey: "en",
      },
    }
  );

  return res?.data;
};

export default function useVehicleRecommendations(parcelData) {
  return useQuery(
    ["vehicle-recommendations", parcelData?.pickup_latitude, parcelData?.drop_latitude],
    () => getVehicleRecommendations(parcelData),
    {
      enabled: !!(parcelData?.pickup_latitude && parcelData?.drop_latitude),
      onError: onSingleErrorResponse,
    }
  );
}