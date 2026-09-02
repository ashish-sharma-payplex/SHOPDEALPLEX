import { useState, useCallback, useRef } from "react";
import { hotelFetch } from "travel-api/hotelApi";


export function usePayment() {
  const [initiating, setInitiating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [booking, setBooking] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);
  const [error, setError] = useState(null);
  const [resetKey, setResetKey] = useState(0);

  const pollingRef = useRef(null);
  const prebookIdRef = useRef(null);
  const expiryMsRef = useRef(null);
  const bookingCalledRef = useRef(false); // ✅ double-call guard

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const handleClientExpiry = useCallback(() => {
    setPaymentStatus((prev) => {
      if (prev === "PENDING") {
        stopPolling();
        return "EXPIRED";
      }
      return prev;
    });
  }, [stopPolling]);

  // ✅ Book karo SUCCESS ke baad
  const triggerBooking = useCallback(async (prebookId) => {
    if (bookingCalledRef.current) return; // already called guard
    bookingCalledRef.current = true;
    setBooking(true);
    try {
      const result = await hotelFetch("/api/hotelv2/book/", {
        body: { prebookId: String(prebookId), paymentMode: "upi" },
      });

      // ✅ Case 1 — HTTP/wrapper level failure:
      // { success: false, error: { code, message, details } }
      // Jaisa: "Invalid Token"
      if (result?.success === false) {
        // console.error("[booking failed]", result?.error?.message);
        setBookingResult({
          success: false,
          error: result?.error ?? { message: "Booking failed. Please contact support." },
        });
        return result;
      }

      // ✅ Case 2 — "success: true" hai (HTTP call ne 200 diya, wrapper level
      // pe sab thik laga) lekin actual booking business-level FAILED hai.
      // Response shape:
      // { success: true, data: { hotel_booking_status: "FAILED",
      //   message: "Booking already exists", booking_id: null, ... } }
      // Isliye sirf top-level success pe bharosa mat karo — data.hotel_booking_status
      // ko bhi confirm karo. "Confirmed" ke alawa kuch bhi treat as failure.
      const status = result?.data?.hotel_booking_status;
      if (status && status !== "Confirmed") {
        // console.error("[booking status not confirmed]", status, result?.data?.message);
        setBookingResult({
          success: false,
          // ✅ "Booking already exists" jaisa duplicate case ko alag flag kiya
          // taaki UI generic failure na dikhaye, alag (softer) message de.
          isDuplicate: /already exists/i.test(result?.data?.message ?? ""),
          error: {
            message: result?.data?.message ?? `Booking status: ${status}`,
            code: status,
          },
        });
        return result;
      }

      setBookingResult(result);
      return result;
    } catch (err) {
      // console.error("[booking error]", err.message);
      // ✅ Network/thrown error ko bhi same shape mein normalize kiya
      // (success: false + error.message) taaki UI ek hi jagah se
      // error padh sake, chahe error throw hua ho ya response body
      // mein success:false ya status:FAILED aaya ho.
      const backendErr = err?.response?.data?.error ?? err?.data?.error ?? null;
      setBookingResult({
        success: false,
        error: backendErr ?? { message: err.message ?? "Booking failed. Please contact support." },
      });
    } finally {
      setBooking(false);
    }
  }, []);

  const startPolling = useCallback(
    (prebookId, expiryMs) => {
      stopPolling();
      prebookIdRef.current = String(prebookId);
      expiryMsRef.current = expiryMs ?? null;

      const poll = async () => {
        if (expiryMsRef.current && Date.now() > expiryMsRef.current + 5000) {
          stopPolling();
          return;
        }

        try {
          const res = await hotelFetch("/api/hotelv2/payment/status/", {
            body: { prebookId: prebookIdRef.current },
          });
          const rawStatus = res?.data?.txnStatus ?? res?.data?.status ?? null;
          if (rawStatus) {
            const upper = rawStatus.toUpperCase();
            const normalized = upper === "FAIL" ? "FAILED" : upper;
            setPaymentStatus(normalized);
            if (["SUCCESS", "FAILED", "EXPIRED", "CANCELLED"].includes(normalized)) {
              stopPolling();
              // ✅ SUCCESS pe book API call
              if (normalized === "SUCCESS") {
                triggerBooking(prebookIdRef.current);
              }
            }
          }
        } catch (err) {
          // console.warn("[poll error]", err.message);
        }
      };

      const getInterval = () => {
        if (!expiryMsRef.current) return 3000;
        const remaining = expiryMsRef.current - Date.now();
        return remaining < 60000 ? 2000 : 3000;
      };

      poll();

      const scheduleNext = () => {
        pollingRef.current = setTimeout(async () => {
          await poll();
          if (pollingRef.current !== null) scheduleNext();
        }, getInterval());
      };

      scheduleNext();
    },
    [stopPolling, triggerBooking],
  );

  const initiatePayment = useCallback(
    async (prebookId, { onSuccess } = {}) => {
      setInitiating(true);
      setError(null);
      setPaymentData(null);
      setPaymentStatus("PENDING");
      setBookingResult(null);
      setResetKey((k) => k + 1);
      stopPolling();
      bookingCalledRef.current = false; // reset guard on new payment
      prebookIdRef.current = String(prebookId);

      try {
        const result = await hotelFetch("/api/hotelv2/payment/initiate/", {
          body: { prebookId: String(prebookId) },
        });
        const data = result?.data ?? result;
        const dataWithTs = { ...data, _ts: Date.now() };

       if (data.expiryDate) {
  const rawExpiry =
    data.expiryDate.includes("Z") || data.expiryDate.includes("+")
      ? new Date(data.expiryDate).getTime()
      : new Date(data.expiryDate.replace(" ", "T") + "+05:30").getTime();

  const minValidExpiry = Date.now() + 60 * 1000; // kam se kam 1 min future
  if (rawExpiry <= minValidExpiry) {
    console.warn("[payment] Backend returned stale expiryDate — using 5 min fallback");
    expiryMsRef.current = Date.now() + 5 * 60 * 1000 - 3000;
  } else {
    expiryMsRef.current = rawExpiry - 3000;
  }
}

        setPaymentData(dataWithTs);
        setPaymentStatus("PENDING");
        startPolling(prebookId, expiryMsRef.current);
        if (onSuccess) onSuccess(dataWithTs);
        return dataWithTs;
      } catch (err) {
        setError(err.message ?? "Payment initiation failed.");
        throw err;
      } finally {
        setInitiating(false);
      }
    },
    [startPolling, stopPolling],
  );

  const cancelPayment = useCallback(
    async (prebookId) => {
      if (!prebookId) return;
      setCancelling(true);
      stopPolling();
      try {
        await hotelFetch("/api/hotelv2/payment/cancel/", {
          body: { prebookId: String(prebookId) },
        });
        setPaymentStatus("CANCELLED");
      } catch (err) {
        // console.warn("[cancel error]", err.message);
        setPaymentStatus("CANCELLED");
      } finally {
        setCancelling(false);
      }
    },
    [stopPolling],
  );

  return {
    initiatePayment,
    cancelPayment,
    stopPolling,
    handleClientExpiry,
    paymentData,
    paymentStatus,
    bookingResult,
    booking,
    initiating,
    cancelling,
    error,
    resetKey,
  };
}