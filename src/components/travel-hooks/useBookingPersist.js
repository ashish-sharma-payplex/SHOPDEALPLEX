// src/components/travel-hooks/useBookingPersist.js
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

/**
 * Refresh pe location.state uda jaata hai (Next.js router aur React Router
 * dono ek hi browser history use karte hain isliye clash hota hai).
 * Ye hook state ko sessionStorage me backup rakhta hai aur refresh ke baad
 * wahi se restore karta hai — sirf tabhi fallback route pe bhejta hai jab
 * sessionStorage me bhi kuch na mile.
 */
export default function useBookingPersist(storageKey, fallbackRoute) {
  const location = useLocation();
  const navigate = useNavigate();

  const [data, setData] = useState(() => {
    if (location.state) {
      sessionStorage.setItem(storageKey, JSON.stringify(location.state));
      return location.state;
    }
    try {
      const saved = sessionStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (location.state) {
      sessionStorage.setItem(storageKey, JSON.stringify(location.state));
      setData(location.state);
    }
  }, [location.state]);

  useEffect(() => {
    if (!data) {
      navigate(fallbackRoute, { replace: true });
    }
  }, [data]);

  return data;
}