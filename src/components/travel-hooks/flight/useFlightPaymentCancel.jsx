// src/hooks/flighthooks/useFlightPaymentCancel.js
import { useState, useCallback } from "react";
import { flightFetch } from "travel-api/flightApi";

export function useFlightPaymentCancel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── legPayload optional — LCC leg ke liye { ResultIndex }, Non-LCC leg
  //    ke liye { BookingId, PNR }. FlightPaymentPage ab current leg ka
  //    payload bhejta hai (buildLegInitiatePayload se), initiate/status
  //    hooks jaisa hi pattern. ──────────────────────────────────────────
 const cancelPayment = useCallback(async (traceId, legPayload = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await flightFetch("/api/flightv2/payment/cancel/", {
        method: "POST",
        body: { traceId, ...legPayload },
      });

      if (!response.success) {
        const errMsg =
          response?.error?.message ||
          response?.message ||
          "Payment cancellation failed.";
        throw new Error(errMsg);
      }

      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { cancelPayment, loading, error };
}