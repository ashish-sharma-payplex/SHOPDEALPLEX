// src/hooks/useTravelAuthGuard.js
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { isTravelUserLoggedIn } from "components/travel-config/userConfig";
import { setModalFor, setSignInModalOpen } from "redux/slices/utils";

const useTravelAuthGuard = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const token = useSelector((state) => state.auth?.token);
  const alertedRef = useRef(false);

  const [loggedIn, setLoggedIn] = useState(
    () => isTravelUserLoggedIn() && !!token,
  );

  useEffect(() => {
    const checkLoginStatus = () => {
      const currentLoggedIn = isTravelUserLoggedIn() && !!token;
      setLoggedIn(currentLoggedIn);

      if (!currentLoggedIn && !alertedRef.current) {
        alertedRef.current = true;

        sessionStorage.setItem(
          "pendingRedirect",
          location.pathname + location.search,
        );

        dispatch(setModalFor("sign-in"));
        dispatch(setSignInModalOpen(true));
      }

      if (currentLoggedIn) {
        alertedRef.current = false;
      }
    };

    checkLoginStatus();

    window.addEventListener("TRAVEL_USER_UPDATED", checkLoginStatus);
    return () =>
      window.removeEventListener("TRAVEL_USER_UPDATED", checkLoginStatus);
  }, [token, location.pathname]);

  return loggedIn;
};

export default useTravelAuthGuard;
