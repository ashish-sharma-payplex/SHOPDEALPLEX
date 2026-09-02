import MainApi from "../../../MainApi";
import { useMutation } from "react-query";
import { parcel_cancel_booking_api } from "api-manage/ParcelApi";

export default function useParcelCancelBooking(parcelId) {
  return useMutation(
    (cancelData) =>
      MainApi.post(parcel_cancel_booking_api(parcelId), cancelData),
    {
      onError: (error) => {
        // console.error("Cancel booking failed", error);
      },
      onSuccess: (data) => {
        // console.log("Booking cancelled successfully", data);
      },
    }
  );
}