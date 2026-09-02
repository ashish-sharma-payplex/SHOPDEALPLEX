// hooks/buseshooks/useBusBook.js
import { useState, useCallback } from "react";
import { busFetch } from "travel-api/busApi";

export function useBusBook() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const bookTicket = useCallback(async (traceId, resultIndex) => {
    setLoading(true);
    setError(null);
    try {
      const data = await busFetch("/api/busv2/book/", {
        method: "POST",
        body: {
          trace_id: traceId,
          result_index: resultIndex,
        },
      });
      if (!data?.success) {
        throw new Error(data?.message || data?.error?.message || "Booking failed");
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { bookTicket, loading, error };
}