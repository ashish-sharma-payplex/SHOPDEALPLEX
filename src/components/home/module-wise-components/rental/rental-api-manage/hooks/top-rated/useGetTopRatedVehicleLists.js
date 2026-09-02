
// src\components\home\module-wise-components\rental\rental-api-manage\hooks\top-rated\useGetTopRatedVehicleLists.js
import MainApi from "api-manage/MainApi";
import { useQuery } from "react-query";
import { top_rated_vehicle_list } from "../../ApiRoutes";
import { onSingleErrorResponse } from "api-manage/api-error-response/ErrorResponses";

// Define a standalone fetcher function
const fetchTopRatedVehicleLists = async () => {
  // Include the necessary headers here
  const headers = {
    modulId: '2', // Assuming this is the required module ID
    zoneId: '[15,17]', // Assuming this is the required zone IDs as an array (or string, based on the API specs)
  };

  const { data } = await MainApi.get(`${top_rated_vehicle_list}`, { headers });
  // console.log("rated vehcile",data);
  return data;
};

// Use the fetcher function in useQuery
export const useGetTopRatedVehicleLists = () => {
  return useQuery("top-rated-vehicle-list", fetchTopRatedVehicleLists, {
    onError: onSingleErrorResponse, // Error handler when request fails
  });
};
