// src/hooks/flighthooks/useFlightPaymentStatus.js
import { useState, useCallback, useRef } from "react";
import { flightFetch } from "travel-api/flightApi";

export function useFlightPaymentStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);

  // ← Yahi key fix hai — ref se stop signal bhejo setTimeout ko
  const shouldStopRef = useRef(false);

  const checkPaymentStatus = useCallback(async (traceId, legsPayload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await flightFetch("/api/flightv2/payment/status/", {
        method: "POST",
        body: { trace_id: traceId, ...legsPayload },
      });

      if (!response.success) {
        throw new Error(response.message || "Status check failed");
      }

      setStatus(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const startPolling = useCallback(
    (traceId, legsPayload, interval = 2000, maxAttempts = 180) => {
      // Pehle koi purani polling rok do
      shouldStopRef.current = false;
      setIsPolling(true);
      let attempts = 0;

      const poll = async () => {
        // Har call se pehle check karo — ruk jaana hai kya
        if (shouldStopRef.current) {
          setIsPolling(false);
          return;
        }

        if (attempts >= maxAttempts) {
          setIsPolling(false);
          setStatus((prev) => ({ ...prev, status: "EXPIRED" }));
          return;
        }

        try {
          const data = await checkPaymentStatus(traceId, legsPayload);

          // API call ke baad bhi check karo — cancel ho gaya ho toh
          if (shouldStopRef.current) {
            setIsPolling(false);
            return;
          }

          if (
            data.status === "SUCCESS" ||
            data.status === "FAILED" ||
            data.status === "EXPIRED" ||
            data.status === "CANCELLED"  // ← CANCELLED bhi add kiya
          ) {
            setIsPolling(false);
            return;
          }

          attempts++;
          setTimeout(poll, interval);
        } catch (err) {
          // console.error("Polling error:", err);
          if (shouldStopRef.current) {
            setIsPolling(false);
            return;
          }
          attempts++;
          setTimeout(poll, interval);
        }
      };

      poll();
    },
    [checkPaymentStatus],
  );

  const stopPolling = useCallback(() => {
    shouldStopRef.current = true; 
    setIsPolling(false);
  }, []);

  return {
    status,
    loading,
    error,
    isPolling,
    checkPaymentStatus,
    startPolling,
    stopPolling,
  };
}