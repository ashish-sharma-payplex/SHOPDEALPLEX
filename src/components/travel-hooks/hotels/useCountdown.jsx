import { useState, useEffect, useRef } from "react";

export function useCountdown(expiryDate, _ts, isStopped = false, resetKey = 0, onExpire = null) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const intervalRef = useRef(null);
  const expiredCalledRef = useRef(false); // ✅ double-fire prevent karo

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setTimeLeft(null);
    setIsReady(false);
    expiredCalledRef.current = false; // ✅ reset on new QR

    if (!expiryDate || !_ts || isStopped) return;

    const rawExpiry = expiryDate.includes("Z") || expiryDate.includes("+")
      ? new Date(expiryDate).getTime()
      : new Date(expiryDate.replace(" ", "T") + "+05:30").getTime();

    if (isNaN(rawExpiry)) return;

    // ✅ 3 second buffer — server thoda pehle expire karta hai
    const adjustedExpiry = rawExpiry - 3000;

    const initTimer = setTimeout(() => {
      setIsReady(true);

      const calculate = () => {
        const diff = adjustedExpiry - Date.now();
        if (diff <= 0) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setTimeLeft(0);

          // ✅ Callback fire karo — sirf ek baar
          if (!expiredCalledRef.current && onExpire) {
            expiredCalledRef.current = true;
            onExpire();
          }
          return;
        }
        setTimeLeft(diff);
      };

      calculate();
      intervalRef.current = setInterval(calculate, 1000);
    }, 50);

    return () => {
      clearTimeout(initTimer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [expiryDate, _ts, isStopped, resetKey]);

  const isExpired = isReady && timeLeft !== null && timeLeft <= 0;
  const totalSecs = timeLeft != null && timeLeft > 0 ? Math.floor(timeLeft / 1000) : 0;
  const mins = String(Math.floor(totalSecs / 60)).padStart(2, "0");
  const secs = String(totalSecs % 60).padStart(2, "0");

  return { mins, secs, isExpired };
}