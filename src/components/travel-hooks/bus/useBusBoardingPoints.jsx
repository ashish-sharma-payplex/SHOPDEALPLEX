// hooks/buseshooks/useBusBoardingPoints.js
import { useState, useCallback } from "react";
import { busFetch } from "travel-api/busApi";

export function useBusBoardingPoints() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBoardingPoints = useCallback(async ({ traceId, resultIndex }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await busFetch("/api/busv2/boarding-point/", {
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

  return { fetchBoardingPoints, loading, error };
}