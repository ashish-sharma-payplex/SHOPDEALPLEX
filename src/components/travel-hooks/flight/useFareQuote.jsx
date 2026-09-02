import { useState, useCallback, useRef } from "react";
import { FLIGHT_ENDPOINTS, flightFetch } from "travel-api/flightApi";

export function useFareQuote() {
  const [onwardFareQuote, setOnwardFareQuote] = useState(null);
  const [returnFareQuote, setReturnFareQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorCode, setErrorCode] = useState(null);

  const inFlightRef = useRef(null);
  const completedRef = useRef(null);

  const fetchFareQuote = useCallback(
    async ({ traceId, onwardResultIndex, returnResultIndex, isCombinedRoundTrip = false }) => {
      const key = JSON.stringify({
        traceId,
        onwardResultIndex,
        returnResultIndex: isCombinedRoundTrip ? null : returnResultIndex,
      });

      if (completedRef.current && completedRef.current.key === key) {
        setOnwardFareQuote(completedRef.current.onward);
        setReturnFareQuote(completedRef.current.ret);
        return;
      }

      if (inFlightRef.current && inFlightRef.current.key === key) {
        return inFlightRef.current.promise;
      }

      setLoading(true);
      setError(null);
      setErrorCode(null);
      setOnwardFareQuote(null);
      setReturnFareQuote(null);

      const promise = (async () => {
        try {
          const onwardRes = await flightFetch(FLIGHT_ENDPOINTS.FARE_QUOTE, {
            method: "POST",
            body: { TraceId: traceId, ResultIndex: onwardResultIndex },
          });

          // ✅ FIX: agar onward fare quote fail hua (success:false), to
          // explicitly throw karo taaki catch block chale aur `error`/
          // `errorCode` state set ho. Pehle yahan sirf `if (success)` ka
          // happy-path handle hota tha — failure case me chup-chaap
          // onwardData null reh jaata tha, koi error state set nahi hota
          // tha, aur UI ko pata hi nahi chalta tha ki kuch fail hua hai.
          if (!onwardRes?.success) {
            const apiErr = new Error(
              onwardRes?.error?.message ||
                onwardRes?.message ||
                "Fare quote failed",
            );
            apiErr.code = onwardRes?.error?.code;
            throw apiErr;
          }

          const onwardData = onwardRes.data;
          setOnwardFareQuote(onwardData);

          let returnData = null;

          if (!isCombinedRoundTrip && returnResultIndex) {
            const returnRes = await flightFetch(FLIGHT_ENDPOINTS.FARE_QUOTE, {
              method: "POST",
              body: { TraceId: traceId, ResultIndex: returnResultIndex },
            });

            // ✅ Same fix for return leg — pehle yahan bhi failure
            // silently ignore ho jaata tha.
            if (!returnRes?.success) {
              const apiErr = new Error(
                returnRes?.error?.message ||
                  returnRes?.message ||
                  "Return fare quote failed",
              );
              apiErr.code = returnRes?.error?.code;
              throw apiErr;
            }

            returnData = returnRes.data;
            setReturnFareQuote(returnData);
          }

          completedRef.current = { key, onward: onwardData, ret: returnData };
        } catch (err) {
          // ✅ FIX: yahan se `throw err;` HATA diya hua hi rehne diya hai
          // (fetchFareQuote ko BookFlight.jsx me bina await/.catch ke
          // fire-and-forget call kiya jaata hai — rethrow karne se
          // unhandled promise rejection ban jaata). Ab error + code
          // dono state me store karte hain taaki UI (BookFlight.jsx)
          // inhe Swal me dikha sake.
          setError(err.message);
          setErrorCode(err.code || null);
          // completedRef intentionally set nahi karte — retry allowed rahe.
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

  return {
    onwardFareQuote,
    returnFareQuote,
    loading,
    error,
    errorCode,
    fetchFareQuote,
  };
}