import { FLIGHT_ENDPOINTS, flightFetch } from "travel-api/flightApi";
import {
  getHotelBookings,
  getHotelBookingDetails,
  cancelHotelBooking,
} from "../../../../src/travel-api/hotelApi";

export async function getMyTrips(page = 1, page_size = 20, status = null) {
  try {
    const params = { page, page_size };
    if (status) params.status = status;

    const response = await flightFetch("/api/flightv2/user/bookings", {
      params,
    });

    return response;
  } catch (error) {
    // sconsole.log("My Trips API Error :", error);
    throw error;
  }
}

export async function getBookingDetails(bookingId) {
  try {
    const response = await flightFetch(FLIGHT_ENDPOINTS.BOOKING_DETAILS, {
      method: "POST",
      body: {
        BookingId: bookingId,
      },
    });

    return response;
  } catch (error) {
    // console.log("Booking Details Error :", error);
    throw error;
  }
}

export async function getCancellations(page = 1, page_size = 20) {
  try {
    const response = await flightFetch("/api/flightv2/user/cancellations", {
      params: { page, page_size },
    });

    return response;
  } catch (error) {
    console.log("Cancellations API Error :", error);
    throw error;
  }
}

export async function getChangeRequestStatus(changeRequestId) {
  try {
    const response = await flightFetch(
      "/api/flightv2/get-change-request-status/",
      {
        method: "POST",
        body: {
          ChangeRequestId: changeRequestId,
        },
      },
    );

    return response;
  } catch (error) {
    // console.log("Change Request Status Error :", error);
    throw error;
  }
}

export { getHotelBookings, getHotelBookingDetails, cancelHotelBooking };
