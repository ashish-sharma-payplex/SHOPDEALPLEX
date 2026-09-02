// src/api/hotelApi.jsx
import Swal from "sweetalert2";
import { getUserId } from "components/travel-config/userConfig";

export const API_BASE_URL = "https://travelmytrip.com";

// Yeh existing ENDPOINTS object me add karo:
export const ENDPOINTS = {
  CITIES: "/api/hotelv2/cities/",
  HOTEL_CODES: "/api/hotelv2/hotel-codes/",
  HOTEL_DETAILS: "/api/hotelv2/hotel-details/",
  HOTEL_SEARCH: "/api/hotelv2/search/",
  USER_BOOKINGS: "/api/hotelv2/user/bookings",
  BOOKING_DETAILS: "/api/hotelv2/booking/details/",
  CANCEL_SEND: "/api/hotelv2/cancel/send/",
  
  CANCELLATIONS_LIST: "/api/hotelv2/user/cancellations/",
  CANCEL_STATUS: "/api/hotelv2/cancel/status/",
};

// 🔥 NAYA — har hotelFetch request ke saath ye fixed "source" header jayega
const SOURCE_HEADER_VALUE =
  "DKIyHAyntH2wuDLbU5W9HrSFBgqVOkYZvjsfWvFZOg3UoIbSFN7AxzVzb4P5JM";

let sessionAlertShown = false;

// ✅ FIX — jab bhi user login/logout hoke userId update hota hai
// (tumhare existing TRAVEL_USER_UPDATED event ke through), flag ko
// reset kar do. Isse agar sach me session expire hua to alert firse
// dikh sakega, aur agar galti se dikh gaya tha to state clean rahega.
if (typeof window !== "undefined") {
  window.addEventListener("TRAVEL_USER_UPDATED", () => {
    sessionAlertShown = false;
  });
}

const showSessionExpiredAlert = () => {
  if (sessionAlertShown) return;
  sessionAlertShown = true;

  Swal.fire({
    icon: "warning",
    title: "Session Expired",
    text: "Your session has expired. Please log in again.",
    confirmButtonText: "Login",
    allowOutsideClick: false,
  }).then(() => {
    window.location.href = "/travel/hotels";
  });
};

// ✅ FIX — page load / redirect ke turant baad kabhi kabhi getUserId()
// ek race condition ki wajah se null aata hai (auth state abhi
// hydrate ho raha hota hai). Isliye missing milte hi seedha fail mat
// karo — thoda retry karo (150ms gap, max 3 baar) taaki genuine
// logged-in user ko galat "Session Expired" na dikhe.
async function getUserIdWithRetry(retries = 3, delayMs = 150) {
  for (let i = 0; i < retries; i++) {
    const uid = getUserId();
    if (uid) return uid;
    if (i < retries - 1) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return null;
}

export async function hotelFetch(
  endpoint,
  { params = {}, body = {}, method = "POST" } = {},
) {
  const url = new URL(`${API_BASE_URL}${endpoint}`);

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      url.searchParams.append(k, v);
    }
  });

  const userId = await getUserIdWithRetry();

  if (!userId) {
    // console.error(
    //   "❌ x-user-id missing! Beech me session expire ho gaya lagta hai:",
    //   endpoint,
    // );
    showSessionExpiredAlert();
    throw new Error("USER_ID_MISSING");
  }

  // console.log(`🏨 hotelFetch | endpoint: ${endpoint} | x-user-id: ${userId}`);

  const headers = {
    "Content-Type": "application/json",
    "x-api-key": "phbA-DvwrvTf9WD-uvQ_7mVFD0NNMMhEMVkqX9gycws",
    // "x-api-key": "ft4xaqQzYscsEfWAqrl-iLqq67xzrHqGPxVHRXzm_NI",
    "x-user-id": userId,
    source: SOURCE_HEADER_VALUE, // 🔥 NAYA — har request ke saath fixed source header
  };

  const options = { method, headers };
  if (method === "POST") options.body = JSON.stringify(body);

  const res = await fetch(url.toString(), options);

  // ✅ body ek hi baar padh sakte hain, isliye pehle safely parse karo
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  // ✅ Agar API ne error diya (chahe HTTP status se ya success:false se),
  // toh uska asli message nikalo (e.g. "No Hotels Found") instead of
  // generic "API Error: 500 ..."
  if (!res.ok || data?.success === false) {
    const apiMessage =
      data?.error?.details?.Status?.Description ||
      data?.error?.message ||
      `API Error: ${res.status} ${res.statusText}`;

    const err = new Error(apiMessage);
    err.status = res.status;
    err.code = data?.error?.code;
    err.details = data?.error?.details;
    throw err;
  }

  return data;
}

// ✅ NAYA — My Trips > Hotels tab ke liye. GET request hai isliye
// method: "GET" explicitly pass karte hain (hotelFetch ka default POST
// hai baaki search/booking-create APIs ke liye, unhe touch nahi kiya).
export async function getHotelBookings({
  page = 1,
  pageSize = 5,
  fromDate = null,
  toDate = null,
  search = null,
} = {}) {
  try {
    const response = await hotelFetch(ENDPOINTS.USER_BOOKINGS, {
      method: "GET",
      params: {
        page,
        page_size: pageSize,
        from_date: fromDate,
        to_date: toDate,
        search,
      },
    });

    return response;
  } catch (error) {
    // console.log("Hotel Bookings API Error :", error);
    throw error;
  }
}

export async function getHotelBookingDetails(bookingId) {
  try {
    const response = await hotelFetch(ENDPOINTS.BOOKING_DETAILS, {
      method: "POST",
      body: { BookingId: bookingId },
    });

    return response;
  } catch (error) {
    // console.log("Hotel Booking Details Error :", error);
    throw error;
  }
}

// ✅ NAYA — Hotel booking cancel request. { BookingId, Remarks } body
// leke POST /api/hotelv2/cancel/send/ call karta hai.
export async function cancelHotelBooking(bookingId, remarks) {
  try {
    const response = await hotelFetch(ENDPOINTS.CANCEL_SEND, {
      method: "POST",
      body: { BookingId: bookingId, Remarks: remarks },
    });

    return response;
  } catch (error) {
    // console.log("Hotel Cancel Booking Error :", error);
    throw error;
  }
}

export async function getHotelCancellations({ page = 1, pageSize = 20 } = {}) {
  try {
    const response = await hotelFetch(ENDPOINTS.CANCELLATIONS_LIST, {
      method: "GET",
      params: { page, page_size: pageSize },
    });

    return response;
  } catch (error) {
    // console.log("Hotel Cancellations List Error :", error);
    throw error;
  }
}

// ✅ NAYA — Check cancellation status
export async function checkHotelCancelStatus(changeRequestId) {
  try {
    const response = await hotelFetch(ENDPOINTS.CANCEL_STATUS, {
      method: "POST",
      body: { ChangeRequestId: changeRequestId },
    });

    return response;
  } catch (error) {
    // console.log("Hotel Cancel Status Check Error :", error);
    throw error;
  }
}