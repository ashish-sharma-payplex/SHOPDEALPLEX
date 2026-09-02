// src/api/flightApi.jsx
import Swal from "sweetalert2";
import { getUserId } from "components/travel-config/userConfig";

export const API_BASE_URL = "https://travelmytrip.com";
export const FLIGHT_ENDPOINTS = {
  COUNTRIES: "/api/flightv2/airports",
  COUNTRY_LIST: "/api/flightv2/countries",   
  SEARCH: "/api/flightv2/search/",
  CALENDAR_FARE: "/api/flightv2/calendar-fare/",
  FARE_RULE: "/api/flightv2/fare-rule/",
  FARE_QUOTE: "/api/flightv2/fare-quote/",
  SSR: "/api/flightv2/ssr/",
  SSR_SAVE: "/api/flightv2/ssr/save",
  BOOKING_DETAILS: "/api/flightv2/booking-details/",
};

// 🔥 NAYA — har flightFetch request ke saath ye fixed "source" header jayega
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

// ✅ NAYA — hotelApi/busApi jaisa hi session expired alert, ek hi baar
// dikhega (spam nahi)
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

// ✅ NAYA — page load/redirect ke turant baad getUserId() race condition
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

export async function flightFetch(
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
    // console.error("❌ x-user-id missing! Beech me session expire ho gaya lagta hai:", endpoint);
    showSessionExpiredAlert();
    throw new Error("USER_ID_MISSING");
  }

  // console.log(`✈️ flightFetch | endpoint: ${endpoint} | x-user-id: ${userId}`);

  const headers = {
    "Content-Type": "application/json",
    "x-api-key": "phbA-DvwrvTf9WD-uvQ_7mVFD0NNMMhEMVkqX9gycws",
    // "x-api-key": "ft4xaqQzYscsEfWAqrl-iLqq67xzrHqGPxVHRXzm_NI",
    "x-user-id": userId,
    source: SOURCE_HEADER_VALUE, // 🔥 NAYA — har request ke saath fixed source header
  };

  const options = { method, headers };
  if (method === "POST" && body) options.body = JSON.stringify(body);

  const res = await fetch(url.toString(), options);

  // ── FIX: pehle response body ko JSON parse karo (chahe res.ok ho ya na ho),
  //    tabhi backend ka asli error message ({success:false, error:{code,message}})
  //    milega. Pehle wala code res.json() se pehle hi generic
  //    "API error 400: Bad Request" throw kar deta tha, jisse asli
  //    TBO_TICKET_35 jaisa message kabhi read hi nahi hota tha. ──────────────
  let data = null;
  try {
    data = await res.json();
  } catch {
    // body JSON nahi tha (ya khaali tha) — data null hi rahega
  }

  const isBackendError = data && data.success === false;

  if (!res.ok || isBackendError) {
    const backendMessage = data?.error?.message || data?.message;
    const message =
      backendMessage || `API error ${res.status}: ${res.statusText}`;

    const err = new Error(message);
    err.code = data?.error?.code;
    err.details = data?.error?.details;
    err.status = res.status;
    err.response = data; // pura parsed body attach — koi bhi caller detail nikal sake
    throw err;
  }

  return data;
}