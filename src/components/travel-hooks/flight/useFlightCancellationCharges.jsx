// src/components/travel-hooks/flight/useFlightCancellationCharges.js
import { useState, useCallback } from "react";
import { flightFetch } from "travel-api/flightApi";

// ── Cancel Ticket flow ka STEP 1 — user "Cancel Ticket" pe click kare to
//    sabse pehle ye hook call hoti hai, taaki refund amount / cancellation
//    charge / GST breakdown user ko dikha sakein form dikhane se pehle. ──
export function useFlightCancellationCharges() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCancellationCharges = useCallback(async (bookingId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await flightFetch(
        "/api/flightv2/get-cancellation-charges/",
        {
          method: "POST",
          body: { BookingId: String(bookingId) },
        },
      );

      if (!response.success) {
        const errMsg =
          response?.error?.message ||
          response?.message ||
          "Failed to fetch cancellation charges.";
        const err = new Error(errMsg);
        err.code = response?.error?.code || "";
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

  return { getCancellationCharges, loading, error };
}