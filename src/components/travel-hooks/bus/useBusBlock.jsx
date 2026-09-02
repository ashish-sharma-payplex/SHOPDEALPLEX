import { useState, useCallback } from "react";
import { busFetch } from "travel-api/busApi";

export function useBusBlock() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const blockSeat = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await busFetch("/api/busv2/block/", {
        method: "POST",
        body: payload,
      });
      return data;
    } catch (err) {
      setError(err.message);
      return { success: false, error: { message: err.message } };
    } finally {
      setLoading(false);
    }
  }, []);

  return { blockSeat, loading, error };
}
