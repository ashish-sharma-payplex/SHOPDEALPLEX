// src/components/travel-hooks/flight/useFlightChangeRequest.js
import { useState, useCallback } from "react";
import { flightFetch } from "travel-api/flightApi";

// ── Cancel Ticket flow ka STEP 2 — user charges dekhne ke baad form fill
//    karke submit karta hai (RequestType, CancellationType, Remarks,
//    Sectors, TicketId) — ye hook wahi final request bhejti hai. ────────
export function useFlightChangeRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendChangeRequest = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await flightFetch("/api/flightv2/send-change-request/", {
        method: "POST",
        body: payload,
      });

      if (!response.success) {
        const errMsg =
          response?.error?.message ||
          response?.message ||
          "Failed to submit cancellation request.";
        const err = new Error(errMsg);
        err.code = response?.error?.code || "";
        err.details = response?.error?.details;
        throw err;
      }

      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { sendChangeRequest, loading, error };
}