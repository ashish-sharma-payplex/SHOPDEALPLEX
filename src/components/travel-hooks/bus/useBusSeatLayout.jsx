import { useState, useCallback } from "react";
import { busFetch } from "travel-api/busApi";

export function useBusSeatLayout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSeatLayout = useCallback(async ({ traceId, resultIndex }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await busFetch("/api/busv2/seat-layout/", {
        method: "POST",
        body: {
          trace_id: traceId,
          result_index: resultIndex,
        },
      });
      return data;
    } catch (err) {
      setError(err.message);
      return { success: false, error: { message: err.message } };
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchSeatLayout, loading, error };
}
