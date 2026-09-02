// src/api/busApi.jsx
import Swal from "sweetalert2";
import { getUserId } from "components/travel-config/userConfig";

export const API_BASE_URL = "https://travelmytrip.com";

export const BUS_ENDPOINTS = {
  CITY_LIST: "/api/busv2/city-list/",
  BUS_SEARCH: "/api/busv2/search/",
  PAYMENT_CANCEL: "/api/busv2/payment/cancel/",
  BOOKING_LIST: "/api/busv2/bookings/list/",
  BOOKING_DETAILS: "/api/busv2/booking-detail/",
  BOOK: "/api/busv2/book/",
  CANCEL_BOOKING: "/api/busv2/cancel-booking/",
  CANCELLATIONS_LIST: "/api/busv2/cancellations/list/",
  CANCEL_BOOKING_STATUS: "/api/busv2/cancel-booking-status/",
};

// 🔥 NAYA — har busFetch request ke saath ye fixed "source" header jayega
const SOURCE_HEADER_VALUE =
  "DKIyHAyntH2wuDLbU5W9HrSFBgqVOkYZvjsfWvFZOg3UoIbSFN7AxzVzb4P5JM";

let sessionAlertShown = false;

// ✅ FIX — login/logout ke baad TRAVEL_USER_UPDATED event fire hote hi
// flag reset kar do, taaki stale state kabhi galat alert na trigger kare
// aur genuine future session-expiry pe alert dobara dikh sake.
if (typeof window !== "undefined") {
  window.addEventListener("TRAVEL_USER_UPDATED", () => {
    sessionAlertShown = false;
  });
}

// ✅ Session expire / id missing hone pe ek hi baar swal dikhao (spam nahi)
const showSessionExpiredAlert = () => {
  if (sessionAlertShown) return;
  sessionAlertShown = true;

  Swal.fire({
    icon: "warning",
    title: "Session Expired",
    text: "Your session has expired. Please log in again.",
    confirmButtonText: "Login",
    confirmButtonColor: "#16a34a", // ✅ FIX — was defaulting to SweetAlert2's blue; now matches app's green
    allowOutsideClick: false,
  }).then(() => {
    window.location.href = "/travel/hotels";
  });
};

// ✅ FIX — page load/redirect ke turant baad getUserId() race condition
// ki wajah se null aa sakta hai (auth state abhi hydrate ho raha hota
// hai). Isliye missing milte hi seedha fail mat karo — thoda retry karo
// (150ms gap, max 3 baar) taaki genuine logged-in user ko galat
// "Session Expired" na dikhe.
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

export async function busFetch(
  endpoint,
  { params = {}, body = null, method = "GET" } = {},
) {
  const url = new URL(`${API_BASE_URL}${endpoint}`);

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      url.searchParams.append(k, v);
    }
  });

  const userId = await getUserIdWithRetry();

  if (!userId) {
    // console.error("❌ x-user-id not found! Beech me session expire ho gaya lagta hai.");
    showSessionExpiredAlert();
    throw new Error("USER_ID_MISSING");
  }

  // console.log(`🚌 busFetch | endpoint: ${endpoint} | x-user-id: ${userId}`);

  const headers = {
    "Content-Type": "application/json",
    "x-api-key": "phbA-DvwrvTf9WD-uvQ_7mVFD0NNMMhEMVkqX9gycws",
    // "x-api-key": "ft4xaqQzYscsEfWAqrl-iLqq67xzrHqGPxVHRXzm_NI",
    "x-user-id": userId,
    source: SOURCE_HEADER_VALUE, // 🔥 NAYA — har request ke saath fixed source header
  };

  const options = { method, headers };
  if (method === "POST" && body) {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url.toString(), options);
    const data = await res.json();

    if (!res.ok) {
      // console.error("🚨 Bus API Error:", {
      //   status: res.status,
      //   statusText: res.statusText,
      //   data,
      // });
    } else {
      // console.log("✅ API Response Success:", data);
    }

    return data;
  } catch (error) {
    // console.error("🚌 Bus Fetch Network Error:", error);
    throw error;
  }
}

export async function getBusBookingList() {
  return busFetch(BUS_ENDPOINTS.BOOKING_LIST);
}

export async function getBusBookingDetails(traceId, busId) {
  return busFetch(BUS_ENDPOINTS.BOOKING_DETAILS, {
    method: "POST",
    body: { trace_id: traceId, bus_id: busId },
  });
}

export async function searchBuses(params) {
  return busFetch(BUS_ENDPOINTS.BUS_SEARCH, { params });
}

export async function getCityList() {
  return busFetch(BUS_ENDPOINTS.CITY_LIST);
}

export async function bookBus(bookingData) {
  return busFetch(BUS_ENDPOINTS.BOOK, {
    method: "POST",
    body: bookingData,
  });
}

export async function cancelPayment(paymentData) {
  return busFetch(BUS_ENDPOINTS.PAYMENT_CANCEL, {
    method: "POST",
    body: paymentData,
  });
}

export async function cancelBusBooking(traceId, busId, remarks) {
  return busFetch(BUS_ENDPOINTS.CANCEL_BOOKING, {
    method: "POST",
    body: { trace_id: traceId, bus_id: String(busId), remarks },
  });
}

export async function getBusCancellations(
  page = 1,
  pageSize = 20,
  extraParams = {},
) {
  return busFetch(BUS_ENDPOINTS.CANCELLATIONS_LIST, {
    params: {
      status: "CANCELLED",
      page,
      page_size: pageSize,
      ...extraParams,
    },
  });
}

export async function getBusCancellationStatus(traceId, changeRequestId) {
  return busFetch(BUS_ENDPOINTS.CANCEL_BOOKING_STATUS, {
    method: "POST",
    body: {
      trace_id: traceId,
      change_request_id: [String(changeRequestId)],
    },
  });
}