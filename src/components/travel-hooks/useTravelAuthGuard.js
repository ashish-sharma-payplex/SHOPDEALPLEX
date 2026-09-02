// src/hooks/useTravelAuthGuard.js
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { isTravelUserLoggedIn } from "components/travel-config/userConfig";
import { setModalFor, setSignInModalOpen } from "redux/slices/utils";

/**
 * ✅ Har travel page (Hotels Index, Flights Index, Bus Index,
 * HotelResults, FlightResults, BusResults) ke top pe call karo:
 *    useTravelAuthGuard();
 *
 * Agar valid x-user-id nahi mila (login nahi hai / session gone),
 * seedha signin modal khol dega — same modal jo grocery/food module
 * me use hota hai (Redux store shared hai).
 */
const useTravelAuthGuard = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const token = useSelector((state) => state.auth?.token);
  const alertedRef = useRef(false);

  useEffect(() => {
    const loggedIn = isTravelUserLoggedIn() && !!token;

    if (!loggedIn && !alertedRef.current) {
      alertedRef.current = true;

      // console.warn("⚠️ Travel page | user login nahi hai — signin modal khol rahe hain");

      // Login ke baad wapas isi page pe laane ke liye
      sessionStorage.setItem(
        "pendingRedirect",
        location.pathname + location.search,
      );

      dispatch(setModalFor("sign-in"));
      dispatch(setSignInModalOpen(true));
    }
  }, [token, location.pathname]);
};

export default useTravelAuthGuard;