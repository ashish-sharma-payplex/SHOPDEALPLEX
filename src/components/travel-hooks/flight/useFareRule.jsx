// src/hooks/flighthooks/useFareRule.js
import { useState, useCallback, useRef } from "react";
import { FLIGHT_ENDPOINTS, flightFetch } from "travel-api/flightApi";

export function useFareRule() {
  const [onwardFareRule, setOnwardFareRule] = useState(null);
  const [returnFareRule, setReturnFareRule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── DEDUPE GUARD (bilkul useSSR.js / useFlightBook.js jaisa) ───────────
  // BookFlight.jsx me `useEffect(() => { fetchFareRule(...) }, [])` se
  // call hota hai. StrictMode dev-mode me component mount → unmount →
  // remount hota hai, jisse ye effect do baar chal jaata hai — result:
  // FareRule API (aur combined RT me poori RT ki call) do baar hit hoti
  // hai. Yahan hook ke andar hi persistent ref-based guard laga rahe hain:
  // same TraceId+ResultIndex ke liye fetchFareRule do baar bulaya jaaye,
  // to doosri call NAYA network request nahi bhejegi.
  const inFlightRef = useRef(null);   // { key, promise }
  const completedRef = useRef(null);  // { key, onward, ret }

  const fetchFareRule = useCallback(
    async ({ traceId, onwardResultIndex, returnResultIndex, isCombinedRoundTrip = false }) => {
      const key = JSON.stringify({
        traceId,
        onwardResultIndex,
        returnResultIndex: isCombinedRoundTrip ? null : returnResultIndex,
      });

      // Is TraceId+ResultIndex ke liye FareRule already fetch ho chuki hai
      // — dobara API call na maaro, cached state hi wapas set kar do.
      if (completedRef.current && completedRef.current.key === key) {
        setOnwardFareRule(completedRef.current.onward);
        setReturnFareRule(completedRef.current.ret);
        return;
      }

      // Is TraceId+ResultIndex ke liye FareRule already in-flight hai —
      // dusri call ko wahi pending promise thama do, naya request mat
      // bhejo.
      if (inFlightRef.current && inFlightRef.current.key === key) {
        return inFlightRef.current.promise;
      }

      setLoading(true);
      setError(null);
      setOnwardFareRule(null);
      setReturnFareRule(null);

      const promise = (async () => {
        try {
          const onwardRes = await flightFetch(FLIGHT_ENDPOINTS.FARE_RULE, {
            method: "POST",
            body: { TraceId: traceId, ResultIndex: onwardResultIndex },
          });

          let onwardData = null;
          let returnData = null;

          if (onwardRes?.success) {
            onwardData = onwardRes.data;
            setOnwardFareRule(onwardData);

            // ✅ COMBINED INTERNATIONAL ROUND TRIP: ek hi ResultIndex ki
            // call se dono legs (onward+return) ka FareRules data mil
            // jaata hai. Isliye dusri call NAHI karni, same response
            // return-state me bhi daal do taaki koi bhi consumer chahe to
            // use kar sake.
            if (isCombinedRoundTrip) {
              returnData = onwardRes.data;
              setReturnFareRule(returnData);
            }
          }

          // Domestic RT / normal case — purana flow bilkul as-is
          if (!isCombinedRoundTrip && returnResultIndex) {
            const returnRes = await flightFetch(FLIGHT_ENDPOINTS.FARE_RULE, {
              method: "POST",
              body: { TraceId: traceId, ResultIndex: returnResultIndex },
            });

            if (returnRes?.success) {
              returnData = returnRes.data;
              setReturnFareRule(returnData);
            }
          }

          // Success — cache karo taaki future duplicate calls (StrictMode
          // remount, retry, etc.) network hit na karein.
          completedRef.current = { key, onward: onwardData, ret: returnData };
         } catch (err) {
          // ✅ Same fix — rethrow nahi, sirf error state set karo.
          setError(err.message);
        } finally {
          setLoading(false);
          inFlightRef.current = null;
        }
      })();

      inFlightRef.current = { key, promise };
      return promise;
    },
    [],
  );

  return { onwardFareRule, returnFareRule, loading, error, fetchFareRule };
}