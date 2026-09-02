import { useState, useCallback } from "react";
import { BUS_ENDPOINTS, busFetch } from "travel-api/busApi";


/**
 * useBusPaymentCancel
 * - Bus payment cancel POST API call karta hai
 * - Body: { traceId, resultIndex }
 */
export function useBusPaymentCancel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cancelPayment = useCallback(async ({ traceId, resultIndex }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await busFetch(BUS_ENDPOINTS.PAYMENT_CANCEL, {
        method: "POST",
        body: {
          traceId: traceId,
          resultIndex: resultIndex,
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

  return { cancelPayment, loading, error };
}