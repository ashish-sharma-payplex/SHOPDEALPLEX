import { useState, useCallback } from "react";
import { flightFetch } from "travel-api/flightApi";

export function useFlightPaymentInitiate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initiatePayment = useCallback(async (traceId, legsPayload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await flightFetch(
        "/api/flightv2/payment/initiate/",
        {
          method: "POST",
          body: { TraceId: traceId, ...legsPayload },
        }
      );

      if (!response.success) {
        // ── Backend error shape: { success:false, error:{ code, message, details } }
        const apiErr = new Error(
          response.error?.message || response.message || "Payment initiation failed",
        );
        apiErr.code = response.error?.code;
        apiErr.details = response.error?.details;
        throw apiErr;
      }

      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { initiatePayment, loading, error };
}