// src/hooks/flighthooks/useFlightBook.js
import { useState, useCallback, useRef } from "react";
import { flightFetch } from "travel-api/flightApi";

export function useFlightBook() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── DEDUPE GUARD ──────────────────────────────────────────────────────
  // Combined international round-trip me (ya kisi bhi race/StrictMode
  // double-invoke case me) agar bookFlight() same TraceId+ResultIndex ke
  // saath do baar bulaya jaaye, to doosri call NAYA network request nahi
  // bhejegi — pehli wali hi promise/result reuse hogi. Isse "ek sath 2
  // baar book call" wala issue root cause chahe jo bhi ho, hamesha guard
  // ho jaata hai.
  const inFlightRef = useRef(null);   // { key, promise }
  const completedRef = useRef(null);  // { key, result }

  const bookFlight = useCallback(async (bookingPayload) => {
    const key = JSON.stringify({
      TraceId: bookingPayload?.TraceId,
      ResultIndex: bookingPayload?.ResultIndex,
    });

    // Is TraceId+ResultIndex ke liye booking already succeed ho chuki hai
    // — dobara API call na maaro, cached result hi wapas de do.
    if (completedRef.current && completedRef.current.key === key) {
      return completedRef.current.result;
    }

    // Is TraceId+ResultIndex ke liye booking already in-flight hai —
    // dusri call ko wahi pending promise thama do, naya request mat bhejo.
    if (inFlightRef.current && inFlightRef.current.key === key) {
      return inFlightRef.current.promise;
    }

    setLoading(true);
    setError(null);

    const promise = (async () => {
      try {
        const response = await flightFetch("/api/flightv2/book/", {
          method: "POST",
          body: bookingPayload,
        });

        if (!response.success) {
          const errMsg =
            response?.error?.message ||
            response?.message ||
            "Booking failed. Please try again.";
          const errCode = response?.error?.code || "";
          const err = new Error(errMsg);
          err.code = errCode;
          throw err;
        }

        completedRef.current = { key, result: response.data };
        return response.data;
      } catch (err) {
        setError(err.message);
        // Failure case me completedRef set nahi karte — retry allowed rahe.
        throw err;
      } finally {
        setLoading(false);
        inFlightRef.current = null;
      }
    })();

    inFlightRef.current = { key, promise };
    return promise;
  }, []);

  return { bookFlight, loading, error };
}