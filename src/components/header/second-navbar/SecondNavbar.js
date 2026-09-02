// src\components\header\second-navbar\SecondNavbar.js
import React, { useEffect, useState, useRef } from "react";
import { NoSsr, Toolbar } from "@mui/material";
import { CustomBoxFullWidth } from "styled-components/CustomStyles.style";
import { useTheme } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import CustomContainer from "../../container";
import AccountPopover from "./account-popover";
import AuthModal from "components/auth/AuthModal";
import { setSignInModalOpen, setModalFor } from "../../../redux/slices/utils";
import { useTranslation } from "react-i18next";
import TopHeaderBar from "./TopHeaderFile";
import CategoryNavbar from "./CategoryMiddle";
import { getCorrectCart } from "helper-functions/getCorrectCart";
import { fetchCartFromApi, setClearCartLocally } from "redux/slices/cart";
import useGetGuest from "api-manage/hooks/react-query/guest/useGetGuest";
import TaxiView from "components/home/module-wise-components/rental/components/home/TaxiView";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import NavBarIcon from "./NavBarIcon";
import { setUser } from "../../../redux/slices/profileInfo";

/* ✅ RENTAL BOOKING IMPORTS */
import useGetBookingList from "api-manage/hooks/react-query/useGetBookingList";
import useGetUserInfo from "api-manage/hooks/react-query/user/useGetUserInfo";

/* ✅ TRAVEL AUTH BRIDGE */
import { syncTravelUser, clearTravelUser } from "components/travel-config/userConfig";

const TRAVELS_REDIRECT_MODE = "PROD";

const SecondNavBar = ({ configData, isBlog = false }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();

  /* ============================================================
     AUTH / PROFILE STATE
     ============================================================ */
  const token = useSelector((state) => state.auth.token);
  const reduxProfile = useSelector((state) => state.profileInfo.profileInfo);
  const [userInfo, setUserInfo] = useState(reduxProfile);

  useEffect(() => {
    setUserInfo(reduxProfile ?? null);
  }, [reduxProfile]);

const { refetch: refetchUserInfo } = useGetUserInfo((data) => {
  if (data) {
    setUserInfo(data);
    dispatch(setUser(data));
  }
});

useEffect(() => {
  if (token) {
    refetchUserInfo();
  }
}, [token]);
  /* ============================================================
     GUEST IMPLEMENTATION
     ============================================================ */
  const [guestId, setGuestId] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("guest_id");
    return null;
  });

  const { data: guestData, refetch: guestRefetch } = useGetGuest();

  useEffect(() => {
    if (!token && !guestId) {
      guestRefetch();
    }
  }, [token, guestId, guestRefetch]);

  useEffect(() => {
    if (guestData?.guest_id) {
      localStorage.setItem("guest_id", guestData.guest_id);
      setGuestId(guestData.guest_id);
    }
  }, [guestData]);

  /* ============================================================
     AUTH / MODULE
     ============================================================ */
  const profileInfo = useSelector((state) => state.profileInfo.profileInfo);

  const { modalFor, signInModalOpen, selectedModule } = useSelector(
    (state) => state.utilsData,
  );
  const moduleType = selectedModule?.module_type;
  const prevModuleRef = useRef(moduleType);

  /* ============================================================
     FOOD CART
     ============================================================ */
  useEffect(() => {
    if (prevModuleRef.current !== moduleType) {
      dispatch(setClearCartLocally());
      prevModuleRef.current = moduleType;
    }
    dispatch(fetchCartFromApi());
  }, [moduleType]);

  const cartList = useSelector((state) => getCorrectCart(state));

  /* ============================================================
     RENTAL CART (VEHICLE)
     ============================================================ */
  const {
    data: bookingLists,
    isLoading: bookingListsIsLoading,
    refetch: bookingRefetch,
  } = useGetBookingList(guestId);

  useEffect(() => {
    if (moduleType === "rental" && guestId) {
      bookingRefetch();
    }
  }, [moduleType, guestId]);

  useEffect(() => {
    const handleRefresh = () => {
      bookingRefetch();
    };
    window.addEventListener("REFRESH_RENTAL_CART", handleRefresh);
    return () =>
      window.removeEventListener("REFRESH_RENTAL_CART", handleRefresh);
  }, [bookingRefetch]);

  /* ============================================================
     ✅ USER DATA EXTRACTION - PROJECT 1 SPECIFIC
     ============================================================ */
  const userId = reduxProfile?.id || reduxProfile?.user_id;
  const userName = `${reduxProfile?.f_name || ""} ${
    reduxProfile?.l_name || ""
  }`.trim();
  const userImage = reduxProfile?.image_full_url || reduxProfile?.image || "";

  /* ============================================================
     ✅ TRAVEL AUTH BRIDGE — login/logout/profile change pe
     sessionStorage ko sync/clear karte raho, taaki bus/flight/hotel
     teeno modules ko hamesha CORRECT x-user-id mile, kabhi "1" nahi.
     ============================================================ */
  useEffect(() => {
    if (token && userId) {
      syncTravelUser({ userId, name: userName, image: userImage });
    } else {
      clearTravelUser();
    }
  }, [token, userId, userName, userImage]);

  /* ============================================================
     ✅ TRAVELS / PROJECT 2 LINK
     ============================================================ */
  const handleTravelsClick = () => {
  if (TRAVELS_REDIRECT_MODE === "dev") {
    const travelUrl = new URL("http://localhost:5173");
    if (userId) travelUrl.searchParams.set("user_id", userId);
    if (userName) travelUrl.searchParams.set("name", userName);
    if (userImage) travelUrl.searchParams.set("image", userImage);
    window.open(travelUrl.toString(), "_blank");
    return;
  }

  // PROD MODE — same app, internal /travel route
  if (!token || !userId) {
    // console.warn("⚠️ Travels click | user login nahi hai — signin modal khol rahe hain");
    sessionStorage.setItem("pendingRedirect", "/travel/hotels");
    dispatch(setModalFor("sign-in"));
    dispatch(setSignInModalOpen(true));
    return;
  }

  syncTravelUser({ userId, name: userName, image: userImage });

  // ✅ router.push (Next.js) ki jagah full page navigation —
  // taaki React Router ka BrowserRouter fresh mount ho aur
  // sahi URL (/travel/hotels) se match kare. router.push use karne
  // se Next.js sirf apna internal history update karta hai, jo
  // BrowserRouter ko pata hi nahi chalta (wo already mounted state
  // pe stuck reh jata hai — isi wajah se purana FlightTicketPage
  // dikhta reh raha tha).
  window.location.href = "/travel/hotels";
};

  /* ============================================================
     CATEGORY ROUTES
     ============================================================ */
  const categoryRoutes = {
    Home: "/",
    Grocery: "/home?module=grocery",
    Pharmacy: "/home?module=pharmacy",
    Food: "/home?module=food",
    Parcel: "/home?module=parcel",
    Rental: "/home?module=rental",
    Handyman: "https://agent.dealplex.in/",
    Utility: "/utility",
  };

  useEffect(() => {
    const moduleFromUrl = router.query.module;
    if (moduleFromUrl) {
      const moduleToCategoryMap = {
        grocery: "Grocery",
        pharmacy: "Pharmacy",
        food: "Food",
        travels: "Travels",
        parcel: "Parcel",
        rental: "Rental",
        handyman: "Handyman",
      };
      const category = moduleToCategoryMap[moduleFromUrl];
      if (category) setSelectedCategory(category);
    }
  }, [router.query.module]);

  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [openCategoryMenu, setOpenCategoryMenu] = useState(false);
  const anchorRef = useRef(null);

  const [placeholder, setPlaceholder] = useState("");
  useEffect(() => {
    const text = "Search for products, services, or food...";
    let i = 0;
    const interval = setInterval(() => {
      setPlaceholder(text.slice(0, i));
      i++;
      if (i > text.length) i = 0;
    }, 120);
    return () => clearInterval(interval);
  }, []);

  const handleCartOpen = () => setSideDrawerOpen(true);
  const handleCartClose = () => setSideDrawerOpen(false);
  const handleOpenPopover = () => dispatch(setModalFor("profile"));
  const handleTrackOrder = () => router.push("/track-order");

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <CustomBoxFullWidth
      sx={{
        backgroundColor: "#FFF",
        zIndex: 1251,
      }}
    >
      <NoSsr>
        <CustomContainer>
          <Toolbar disableGutters>
            <TopHeaderBar
              configData={configData}
              isBlog={isBlog}
              placeholder={placeholder}
              t={t}
              router={router}
              moduleType={moduleType}
              token={token}
              profileInfo={userInfo}
              anchorRef={anchorRef}
              handleOpenPopover={handleOpenPopover}
              dispatch={dispatch}
              setSignInModalOpen={setSignInModalOpen}
              cartList={cartList}
              bookingLists={bookingLists}
              bookingListsIsLoading={bookingListsIsLoading}
              handleTrackOrder={handleTrackOrder}
              sideDrawerOpen={sideDrawerOpen}
              handleCartOpen={handleCartOpen}
              handleCartClose={handleCartClose}
              openCategoryMenu={openCategoryMenu}
              setOpenCategoryMenu={setOpenCategoryMenu}
            />
          </Toolbar>

          <CategoryNavbar
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            router={router}
            categoryRoutes={categoryRoutes}
            openCategoryMenu={openCategoryMenu}
            setOpenCategoryMenu={setOpenCategoryMenu}
            onTravelsClick={handleTravelsClick}
          />

          {token && (
            <AccountPopover
              anchorEl={anchorRef.current}
              open={modalFor === "profile"}
              onClose={() => dispatch(setModalFor(null))}
              cartListRefetch={() => {}}
              openCartDrawer={handleCartOpen}
            />
          )}

          <AuthModal
            modalFor={modalFor}
            setModalFor={(v) => dispatch(setModalFor(v))}
            open={signInModalOpen}
            handleClose={() => dispatch(setSignInModalOpen(false))}
          />
        </CustomContainer>
      </NoSsr>
    </CustomBoxFullWidth>
  );
};

export default SecondNavBar;