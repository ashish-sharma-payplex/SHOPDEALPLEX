// hooks/buseshooks/useBusPayment.js
import { useState, useCallback, useRef } from "react";
import { busFetch } from "travel-api/busApi";


export function useBusPayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  /**
   * Initiates payment and returns the response data.
   * @param {{ traceId: string, resultIndex: number }} params
   */
  const initiatePayment = useCallback(async ({ traceId, resultIndex }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await busFetch("/api/busv2/payment/initiate/", {
        method: "POST",
        body: {
          trace_id: traceId,
          result_index: resultIndex,
        },
      });
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Polls payment status every `intervalMs` ms.
   * Calls `onStatus(statusData)` on every tick.
   * Calls `onSuccess()` when status === "SUCCESS".
   * Calls `onExpired()` when status === "EXPIRED".
   * Calls `onFailed()` when status === "FAILED".
   *
   * @param {{ traceId: string, resultIndex: number, intervalMs?: number, onStatus: Function, onSuccess: Function, onExpired: Function, onFailed: Function }} opts
   */
  const startPolling = useCallback(
    ({
      traceId,
      resultIndex,
      intervalMs = 3000,
      onStatus,
      onSuccess,
      onExpired,
      onFailed,
    }) => {
      stopPolling();

      const poll = async () => {
        try {
          const data = await busFetch("/api/busv2/payment/status/", {
            method: "POST",
            body: {
              trace_id: traceId,
              result_index: resultIndex,
            },
          });

          const status = data?.data?.status;
          if (onStatus) onStatus(data?.data);

          if (status === "SUCCESS") {
            stopPolling();
            if (onSuccess) onSuccess(data?.data);
          } else if (status === "EXPIRED") {
            stopPolling();
            if (onExpired) onExpired(data?.data);
          } else if (status === "FAILED") {
            stopPolling();
            if (onFailed) onFailed(data?.data);
          }
        } catch (err) {
          // console.error("Payment status poll error:", err);
        }
      };

      // First tick immediately
      poll();
      pollRef.current = setInterval(poll, intervalMs);
    },
    [stopPolling],
  );

  return { initiatePayment, startPolling, stopPolling, loading, error };
}
