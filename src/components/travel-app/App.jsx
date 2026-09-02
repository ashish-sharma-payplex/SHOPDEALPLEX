import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Stack, styled } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

// ✅ configData ke liye (logo/header data)
import { useGetConfigData } from "../../api-manage/hooks/useGetConfigData";
import { setConfigData } from "../../redux/slices/configData";

import HotelDetailsPageWrapper from "../travel-pages/hotels/HotelDetailsPageWrapper";
import BusesPage from "../travel-pages/buses";
import BusResultsPage from "../travel-pages/buses/Results";
import BusPassengerPage from "../travel-pages/buses/BusPassangerPage";
import FlightsListingPage from "../../../src/components/travel-components/flight/FlightsListingPage";
import BookFlight from "../../../src/components/travel-components/flight/BookFlight";
import SeatSelectionPage from "../../../src/components/travel-components/flight/SeatSelectionPage";
import FlightTicketPage from "../../../src/components/travel-components/flight/FlightTicketPage";
import MyTrips from "../travel-pages/my-travel-trips";
import HotelBookingTicket from "../travel-pages/hotels/HotelBookingTicket";
import BusTicketPage from "../travel-pages/buses/BusTicketPage";
import FlightsPage from "../travel-pages/flights/index";
import HotelsPage from "../travel-pages/hotels/index";
import HotelCheckoutPage from "components/travel-components/hotels/HotelCheckoutPage";
import BookingSuccessPage from "components/travel-components/hotels/BookingSuccessPage";
import HotelsResultsPage from "../travel-components/hotels/HotelsResultsPage";

// ✅ REMOVED — main-site HeaderComponent/FooterComponent no longer used here
import HeaderComponent from "../header";
// import FooterComponent from "../footer";

// ✅ NAYA — ab travel app me sirf EK navbar hai (StickyNavbar), jo hamesha
// visible rehta hai. Purana top `Navbar` (AppBar) component ab use nahi ho
// raha, isliye import bhi hata diya.
import StickyNavbar from "../../travel-api/StickyNavbar";
import FooterComponent from "../footer";

import AccountPopover from "components/header/second-navbar/account-popover";
import AuthModal from "components/auth/AuthModal";
import { setSignInModalOpen, setModalFor } from "../../redux/slices/utils";

import SSRSeatPage from "components/travel-components/flight/SSRSeatPage";
import ComingSoonPage from "components/home/module-wise-components/commingSoon";
import FlightPaymentPage from "components/travel-components/flight/FlightPaymentPage";
import BusPaymentPage from "components/travel-pages/buses/BusPaymentPage";
import QRPaymentPage from "components/travel-pages/hotels/QRPaymentPage";

const TRAVEL_APP_ENABLED = true;

const MainLayoutRoot = styled("div")({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  position: "relative",
  overflowAnchor: "none",
});

function ScrollHandler({ setScrolled }) {
  const location = useLocation();

  useEffect(() => {
    setScrolled(false);
    window.scrollTo(0, 0);

    const titles = {
      "/hotels": "Hotels - Dealplex",
      "/flights": "Flights - Dealplex",
      "/buses": "Buses - Dealplex",
      "/trains": "Trains - Dealplex",
      "/hotels/results": "Hotel Results - Dealplex",
      "/hotels/checkout": "Hotel Checkout - Dealplex",
      "/hotels/payment": "Booking Success - Dealplex",
    };

    if (location.pathname.startsWith("/hotels/details")) {
      document.title = "Hotel Details - Dealplex";
    } else {
      document.title = titles[location.pathname] || "Dealplex";
    }
  }, [location.pathname]);


  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return null;
}

// ❌ REMOVED — `NavbarSection` (jo purane top `Navbar` ko conditionally
// hide/show karta tha) ab zaroori nahi, kyunki hum sirf StickyNavbar use
// kar rahe hain jo hamesha visible rehta hai.

function App() {
  const [scrolled, setScrolled] = useState(false);
  const dispatch = useDispatch();

  const { configData } = useSelector((state) => state.configData);
  const { data: dataConfig, refetch: configRefetch } = useGetConfigData();

  useEffect(() => {
    if (!configData) {
      configRefetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (dataConfig) {
      dispatch(setConfigData(dataConfig));
    }
  }, [dataConfig, dispatch]);

  useEffect(() => {
    document.documentElement.style.scrollbarGutter = "stable";
    return () => {
      document.documentElement.style.scrollbarGutter = "";
    };
  }, []);

  /* ============================================================
     ✅ SHARED AUTH — same Redux slices the main shopdealplex
     header (SecondNavbar.js) reads. This is what keeps the travel
     navbar's login state identical to the rest of the site.
     ============================================================ */
  const token = useSelector((state) => state.auth.token);
  const reduxProfile = useSelector((state) => state.profileInfo.profileInfo);
  const { modalFor, signInModalOpen } = useSelector((state) => state.utilsData);

  const userName = `${reduxProfile?.f_name || ""} ${
    reduxProfile?.l_name || ""
  }`.trim();
  const userImage = reduxProfile?.image_full_url || reduxProfile?.image || "";

  // Single shared <AccountPopover/> anchor for StickyNavbar
  const [accountAnchorEl, setAccountAnchorEl] = useState(null);
  const openAccountMenu = (e) => setAccountAnchorEl(e.currentTarget);
  const closeAccountMenu = () => setAccountAnchorEl(null);

  const openLoginModal = () => {
    dispatch(setModalFor("sign-in"));
    dispatch(setSignInModalOpen(true));
  };

  const navbarAuthProps = {
    token,
    userName,
    userImage,
    onLoginClick: openLoginModal,
    onProfileClick: openAccountMenu,
  };

  return (
    <BrowserRouter basename="/travel">
      <ScrollHandler setScrolled={setScrolled} />

      <MainLayoutRoot>
        {/* ✅ Sirf EK navbar — StickyNavbar hamesha top pe fixed/visible
            rehta hai. Iske andar CATEGORIES (Flights/Hotels/Buses) row
            sirf tab dikhta hai jab `scrolled` true ho — warna hidden. */}
        <StickyNavbar scrolled={scrolled} {...navbarAuthProps} />

        {/* ✅ Same profile popover + login modal as the rest of the site */}
        {token && (
          <AccountPopover
            anchorEl={accountAnchorEl}
            open={Boolean(accountAnchorEl)}
            onClose={closeAccountMenu}
            cartListRefetch={() => {}}
            openCartDrawer={() => {}}
          />
        )}
        <AuthModal
          modalFor={modalFor}
          setModalFor={(v) => dispatch(setModalFor(v))}
          open={signInModalOpen}
          handleClose={() => dispatch(setSignInModalOpen(false))}
        />

        {/* GLOBAL CENTER WRAPPER (PAGES) */}
        <div
          style={{
            // maxWidth: "1260px",
            margin: "0 auto",
            width: "100%",
            flex: 1,
          }}
        >
          {!TRAVEL_APP_ENABLED ? (
            <Stack
              sx={{
                paddingTop: { xs: "70px", md: "100px" },
                display: "flex",
                alignItems: "center",
                flexGrow: 1,
                height: "100vh",
              }}
            >
              <ComingSoonPage />
            </Stack>
          ) : (
            <Routes>
              <Route path="/" element={<Navigate to="/hotels" replace />} />
              <Route
                path="/hotels"
                element={<HotelsPage scrolled={scrolled} />}
              />
              <Route
                path="/hotels/results"
                element={<HotelsResultsPage scrolled={scrolled} />}
              />
              <Route
                path="/hotels/details/:hotelCode"
                element={<HotelDetailsPageWrapper scrolled={scrolled} />}
              />
              <Route path="/hotels/checkout" element={<HotelCheckoutPage />} />
              <Route path="/hotels/payment" element={<BookingSuccessPage />} />
              <Route path="/flights" element={<FlightsPage />} />
              <Route path="/flights/listing" element={<FlightsListingPage />} />
              <Route path="/buses" element={<BusesPage />} />
              <Route path="/buses/results" element={<BusResultsPage />} />
              <Route path="/buses/ticket" element={<BusTicketPage />} />
              <Route
                path="/buses/passenger-details"
                element={<BusPassengerPage />}
              />
              <Route path="/book-flight" element={<BookFlight />} />
              <Route path="/ssr" element={<SSRSeatPage />} />
              <Route path="/seat-selection" element={<SeatSelectionPage />} />
              <Route path="/flight-payment" element={<FlightPaymentPage />} />
              <Route path="/flight-ticket" element={<FlightTicketPage />} />
              <Route path="/my-trips" element={<MyTrips />} />
              <Route
                path="/hotel/booking-ticket"
                element={<HotelBookingTicket />}
              />
              <Route path="/buses/payment" element={<BusPaymentPage />} />
               <Route path="/hotels/qr-payment" element={<QRPaymentPage />} /> 
            </Routes>
          )}
        </div>

        {/* ✅ COMMON FOOTER — poore site jaisa */}
        <footer
          style={{
            width: "100%",
            backgroundColor: "#F8F8F8",
            display: "flex",
            justifyContent: "center",
            padding: "20px 0",
          }}
        >
          <FooterComponent />
        </footer>
      </MainLayoutRoot>
    </BrowserRouter>
  );
}

export default App;