import MainApi from "api-manage/MainApi";
import { useQuery } from "react-query";
import { banner_list } from "../../../ApiRoutes";
import { onSingleErrorResponse } from "api-manage/api-error-response/ErrorResponses";

// Define a standalone fetcher function
const fetchVehicleBannerList = async () => {
	const { data } = await MainApi.get(`${banner_list}`);
	return data;
};

// Use the fetcher function in useQuery with caching options
export const useGetVehicleBannerList = () => {
	return useQuery("vehicle-banner-list", fetchVehicleBannerList, {
		staleTime: 5 * 60 * 1000, // Data will be considered fresh for 5 minutes
		cacheTime: 10 * 60 * 1000, // Data will be cached for 10 minutes
		refetchOnWindowFocus: false,
		onError: onSingleErrorResponse, // Prevent refetching when the window regains focus
	});
};
