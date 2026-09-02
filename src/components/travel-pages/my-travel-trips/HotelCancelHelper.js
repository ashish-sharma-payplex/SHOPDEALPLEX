// Reusable function — HotelCard.jsx me import karke button pe call karna hai
import { getHotelCancelStatus } from "components/travel-hooks/hotels/HotelCancelStatus";
import Swal from "sweetalert2";
import { cancelHotelBooking } from "travel-api/hotelApi";

export const handleHotelCancelRequest = async (bookingId, onSuccess) => {
  const { value: remarks, isConfirmed } = await Swal.fire({
    title: "Cancel Booking?",
    input: "text",
    inputLabel: "Reason for cancellation",
    inputPlaceholder: "e.g. Change in plans",
    showCancelButton: true,
    confirmButtonText: "Submit Request",
    confirmButtonColor: "#16a34a",
    cancelButtonText: "Back",
    inputValidator: (value) => {
      if (!value) return "Please enter a remark";
    },
  });

  if (!isConfirmed || !remarks) return;

  try {
    Swal.fire({ title: "Submitting...", didOpen: () => Swal.showLoading(), allowOutsideClick: false });

    const res = await cancelHotelBooking(bookingId, remarks);
    const data = res?.data || {};
    const statusInfo = getHotelCancelStatus(data.status);

    await Swal.fire({
      icon: "success",
      title: "Cancellation Requested",
      html: `
        <div style="text-align:left;font-size:14px;line-height:1.8">
          <b>Change Request ID:</b> ${data.changeRequestId}<br/>
          <b>Status:</b> <span style="color:${statusInfo.color};font-weight:600">${statusInfo.label}</span><br/>
          ${data.message || ""}
        </div>
      `,
      confirmButtonText: "OK",
    });

    if (onSuccess) onSuccess();
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Cancellation Failed",
      text: error?.message || "Something went wrong. Please try again.",
    });
  }
};