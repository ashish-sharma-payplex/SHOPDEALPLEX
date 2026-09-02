import { useQuery } from "react-query";
import { getToken } from "helper-functions/getToken";
import MainApi from "api-manage/MainApi";
import { onSingleErrorResponse } from "api-manage/api-error-response/ErrorResponses";
import { comfirm_booking_list } from "api-manage/ApiRoutes";

const getData = async (guestId) => {
  try {
    const userToken = getToken();
    const params = !userToken && guestId ? `?guest_id=${guestId}` : "";
    const { data } = await MainApi.get(`${comfirm_booking_list}${params}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export default function useGetBookingList(guestId, bookingSuccess) {
  return useQuery(
    ["booking-items", guestId],   // 🔥 dynamic query key
    () => getData(guestId),
    {
      enabled: !!guestId || !!getToken(),       // 🔥 auto enable when guestId exists
      keepPreviousData: false,    // 🔥 avoid stale cache
      onSuccess: bookingSuccess,
      onError: onSingleErrorResponse,
    }
  );
}