// src/hooks/flighthooks/useFlightTicket.js
import { useState, useCallback, useRef } from "react";
import { flightFetch } from "travel-api/flightApi";

export function useFlightTicket() {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── DEDUPE GUARD (bilkul useFlightBook.js jaisa) ───────────────────────
  // Combined international round-trip me (ya StrictMode double-invoke /
  // status-poll multi-fire jaise kisi bhi race me) agar generateTicket()
  // same TraceId ke saath do baar bulaya jaaye, to doosri call NAYA
  // network request nahi bhejegi — pehli wali hi promise/result reuse
  // hogi. Isse backend me 2 alag ticket/PNR ban jaane wala issue, root
  // cause chahe jo bhi ho, hamesha guard ho jaata hai — FlightPaymentPage
  // ke sessionStorage guard ke upar ye ek extra safety layer hai, seedha
  // hook ke andar.
  const inFlightRef = useRef(null);   // { key, promise }
  const completedRef = useRef(null);  // { key, result }

  const generateTicket = useCallback(async (ticketPayload) => {
    const key = JSON.stringify({ TraceId: ticketPayload?.TraceId });

    // Is TraceId ke liye ticket already ban chuka hai — dobara API call
    // na maaro, cached result hi wapas de do.
    if (completedRef.current && completedRef.current.key === key) {
      return completedRef.current.result;
    }

    // Is TraceId ke liye ticket generation already in-flight hai — dusri
    // call ko wahi pending promise thama do, naya request mat bhejo.
    if (inFlightRef.current && inFlightRef.current.key === key) {
      return inFlightRef.current.promise;
    }

    setLoading(true);
    setError(null);

    const promise = (async () => {
      try {
        // ── flightFetch khud hi success:false / non-2xx pe proper Error
        //    throw kar deta hai (.message, .code, .details, .response sab
        //    set karke) — isliye yahan response.success check karne ki
        //    zaroorat nahi, hum yahan sirf tabhi pahunchenge jab success ho. ──
        const response = await flightFetch("/api/flightv2/ticket/", {
          method: "POST",
          body: ticketPayload,
        });

        setTicket(response.data);
        completedRef.current = { key, result: response.data };
        return response.data;
      } catch (err) {
        // err.message ab backend ka asli message hai
        // (jaise "Ticket Failed From Supplier Side."), generic nahi.
        setError(err.message);
        // Failure case me completedRef set nahi karte — retry allowed rahe.
        throw err; // .code / .details / .response sab intact rehte hain
      } finally {
        setLoading(false);
        inFlightRef.current = null;
      }
    })();

    inFlightRef.current = { key, promise };
    return promise;
  }, []);

  return { ticket, loading, error, generateTicket };
}