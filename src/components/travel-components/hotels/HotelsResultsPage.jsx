// src\components\travel-components\hotels\HotelsResultsPage.jsx
import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import toast, { Toaster } from "react-hot-toast";
import MenuIcon from "@mui/icons-material/Menu";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import HeadsetMicOutlinedIcon from "@mui/icons-material/HeadsetMicOutlined";
import LuggageOutlinedIcon from "@mui/icons-material/LuggageOutlined";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DateRangePicker from "./DateRangePicker";
import { useHotelSearch } from "components/travel-hooks/hotels/useHotelSearch";
import HotelListing from "./HotelListing";
import RoomsGuestDropdown from "./Roomsguestselector";
import LocationDropdown from "./LocationDropdown";
import Lottie from "lottie-react";

const GREEN = "#16a34a";
const BORDER = "#e5e7eb";

const CATEGORIES = [
  {
    label: "Flights",
    img: "/navbaricons/flightslogo.svg",
    path: "/flights",
    emoji: "✈️",
  },
  {
    label: "Hotels",
    img: "/navbaricons/hotelslogo.svg",
    path: "/hotels",
    emoji: "🏨",
  },
  {
    label: "Buses",
    img: "/navbaricons/buseslogo.svg",
    path: "/buses",
    emoji: "🚌",
  },
  {
    label: "Trains",
    img: "/navbaricons/trainslogo.svg",
    path: "/trains",
    emoji: "🚆",
  },
];

function formatDate(date) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}


// ─── Full-screen Search Loader (Lottie) ───
const HotelSearchLoader = ({ open }) => {
  if (!open) return null;
  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        bgcolor: "rgba(255,255,255,0.92)",
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <Box sx={{ width: { xs: 220, sm: 180 }, height: { xs: 220, sm: 180 } }}>
        <Lottie path="/hotelloader.json" loop autoplay />
      </Box>
      <Box sx={{ textAlign: "center" }}>
        <Typography
          sx={{ fontSize: 18, fontWeight: 700, color: "#111827", mb: 0.5 }}
        >
          Searching Best Hotels...
        </Typography>
        <Typography sx={{ fontSize: 14, color: "#6b7280" }}>
          Checking availability across properties
        </Typography>
      </Box>
    </Box>
  );
};


// ─── Search Header ─────────────────────────────
const SearchHeader = ({ initialData }) => {
  const navigate = useNavigate();

  // scroll-based "fixed" positioning, "sticky" ki jagah.
  // WAJAH: kahin na kahin parent layout (Next.js _app.js / globals.css)
  // me overflow ya transform laga hua hai jo "position: sticky" ko tod
  // deta hai. "position: fixed" viewport ke against hota hai — koi bhi
  // ancestor overflow/transform ho, ye hamesha upar chipka rahega.
  const [isFixed, setIsFixed] = useState(false);
  const placeholderRef = useRef(null); // header ki original screen-position record karne ke liye
  const headerBoxRef = useRef(null); // header ki actual height measure karne ke liye
  const stickyThreshold = useRef(0);
  const [headerHeight, setHeaderHeight] = useState(0);

  useLayoutEffect(() => {
    const measureThreshold = () => {
      if (placeholderRef.current) {
        const rect = placeholderRef.current.getBoundingClientRect();
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        stickyThreshold.current = rect.top + scrollY;
      }
    };
    measureThreshold();

    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setIsFixed(scrollY > stickyThreshold.current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", measureThreshold);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", measureThreshold);
    };
  }, []);

  // Header ki actual rendered height auto-measure karo, taaki jab
  // fixed ho jaaye to neeche spacer exactly utni hi height le — warna
  // content thoda jump karega upar-neeche.
  useLayoutEffect(() => {
    const measureHeight = () => {
      if (headerBoxRef.current) {
        setHeaderHeight(headerBoxRef.current.getBoundingClientRect().height);
      }
    };
    measureHeight();

    const ro = new ResizeObserver(measureHeight);
    if (headerBoxRef.current) ro.observe(headerBoxRef.current);
    window.addEventListener("resize", measureHeight);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureHeight);
    };
  }, []);

  const [checkIn, setCheckIn] = useState(
    initialData.checkIn ? new Date(initialData.checkIn) : null,
  );
  const [checkOut, setCheckOut] = useState(
    initialData.checkOut ? new Date(initialData.checkOut) : null,
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [calendarAnchor, setCalendarAnchor] = useState(null);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [guestsLabel, setGuestsLabel] = useState(
    initialData.guests ?? "1 Room, 2 Adults",
  );
  const [locationOpen, setLocationOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState({
    code: initialData.cityCode ?? "",
    name: initialData.cityName ?? "Select Location",
  });

  const checkinRef = useRef(null);
  const checkoutRef = useRef(null);
  const guestsRef = useRef(null);
  const locationRef = useRef(null);

  const { search: searchHotels, loading: hotelLoading } = useHotelSearch();

  const openCalendar = (field) => {
    const el = field === "checkin" ? checkinRef.current : checkoutRef.current;
    setActiveField(field);
    setCalendarAnchor(el);
    setCalendarOpen(true);
  };

  const handleSearch = async () => {
    if (!selectedCity.code) {
      toast.error("Please select a location first!", { icon: "📍" });
      return;
    }
    if (!checkIn || !checkOut) {
      toast.error("Please select check-in & check-out dates!", { icon: "📅" });
      return;
    }

    // const loadingToast = toast.loading("Searching hotels...", { icon: "🔍" });
    try {
      const data = await searchHotels(selectedCity.code);
      // toast.dismiss(loadingToast);
      const hotels = data?.data ?? data?.hotels ?? data?.results ?? [];
      const total = data?.meta?.total ?? hotels.length ?? 0;
      // if (total > 0) {
      //   toast.success(
      //     `🏨 ${total} hotels found in ${selectedCity.name.split(",")[0]}!`,
      //     { duration: 3000, style: { fontWeight: 600 } },
      //   );
      // } else {
      //   toast("No hotels found for this location.", { icon: "😔" });
      // }
      // FIX: naya object har baar banao (spread se) taaki React Router
      // ise ek naya reference maane, chahe values same hi kyun na ho.
      // Isse HotelsResultsPage ka useEffect (state pe dependent) reliably
      // trigger hota hai, chahe pathname same rahe.
      navigate("/hotels/results", {
        state: {
          hotels: [...hotels],
          cityName: selectedCity.name,
          cityCode: selectedCity.code,
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          guests: guestsLabel,
          guestsData: initialData.guestsData ?? null,
          total,
          // searchToken: har search ko unique banata hai, isse agar
          // koi edge-case mein values hi-bhi-hi rah jayein (same city,
          // same dates) tab bhi useEffect zaroor re-fire hoga
          searchToken: Date.now(),
        },
        replace: true,
      });
    } catch (err) {
      // toast.dismiss(loadingToast);
      // ab agar API ne specific error message diya (e.g. "No Hotels Found")
      // toh wahi dikhega, generic message sirf fallback hai
      toast.error(err?.message || "Something went wrong. Please try again.");
    }
  };

  const FIELDS = [
    {
      id: "location",
      label: "Location",
      value: selectedCity.name,
      icon: <LocationOnIcon sx={{ color: GREEN, fontSize: 19 }} />,
      ref: locationRef,
      onClick: () => setLocationOpen((o) => !o),
    },
    {
      id: "checkin",
      label: "Check In",
      value: checkIn ? formatDate(checkIn) : "Select date",
      icon: <CalendarTodayIcon sx={{ color: GREEN, fontSize: 19 }} />,
      ref: checkinRef,
      onClick: () => openCalendar("checkin"),
    },
    {
      id: "checkout",
      label: "Check Out",
      value: checkOut ? formatDate(checkOut) : "Select date",
      icon: <CalendarTodayIcon sx={{ color: GREEN, fontSize: 19 }} />,
      ref: checkoutRef,
      onClick: () => openCalendar("checkout"),
    },
    {
      id: "guests",
      label: "Rooms & Guests",
      value: guestsLabel,
      icon: <PeopleAltIcon sx={{ color: GREEN, fontSize: 19 }} />,
      ref: guestsRef,
      onClick: () => setGuestsOpen((o) => !o),
    },
  ];

  return (
    <>
         <HotelSearchLoader open={hotelLoading} />

      <Box ref={placeholderRef} sx={{ height: 0 }} />

      {/* Search Bar Strip — scroll ke baad "fixed" ban jaata hai */}
      <Box
        ref={headerBoxRef}
        sx={{
          ...(isFixed
            ? {
                position: "fixed",
                top: { xs: 56, md: 60 }, // apne global navbar ki height ke hisaab se adjust kar lena
                left: 0,
                right: 0,
              }
            : {
                position: "relative",
              }),
          zIndex: 1100,
          // bgcolor: "#fff",
          // boxShadow: isFixed ? "0 2px 10px rgba(0,0,0,0.06)" : "none",
          px: { xs: 2, md: 4 },
          py: { xs: 1.5, md: 2 },
          mt: isFixed ? 0 : "60px",
          transition: "box-shadow 0.15s",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            borderRadius: "12px",
            maxWidth: 1100,
            mx: "auto",
            overflow: "visible",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "stretch",
              border: `1.5px solid ${BORDER}`,
              borderRadius: "12px",
              overflow: "visible",
              position: "relative",
            }}
          >
            {FIELDS.map((field, index) => {
              const isActive =
                (calendarOpen &&
                  ((field.id === "checkin" && activeField === "checkin") ||
                    (field.id === "checkout" && activeField === "checkout"))) ||
                (field.id === "guests" && guestsOpen) ||
                (field.id === "location" && locationOpen);
              return (
                <Box
                  key={field.id}
                  ref={field.ref}
                  onClick={field.onClick}
                  sx={{
                    flex: 1,
                    px: 2.5,
                    py: 1.5,
                    cursor: "pointer",
                    borderRight: {
                      md:
                        index < FIELDS.length - 1
                          ? `1.5px solid ${BORDER}`
                          : "none",
                      xs: "none",
                    },
                    borderBottom: { xs: `1.5px solid ${BORDER}`, md: "none" },
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    gap: "5px",
                    minWidth: 0,
                    transition: "background 0.15s",
                    bgcolor: isActive ? "#f0fdf4" : "transparent",
                    borderRadius: isActive
                      ? index === 0
                        ? "11px 0 0 11px"
                        : index === FIELDS.length - 1
                        ? "0 11px 11px 0"
                        : "0"
                      : "0",
                    "&:hover": { background: "#f9fafb" },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      color: isActive ? GREEN : "#6b7280",
                      letterSpacing: "0.15px",
                    }}
                  >
                    {field.label}
                  </Typography>
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: "7px" }}
                  >
                    {field.icon}
                    <Typography
                      sx={{
                        fontSize: "0.88rem",
                        fontWeight: 600,
                        color:
                          field.value === "Select date" ||
                          field.value === "Select Location"
                            ? "#9ca3af"
                            : "#111827",
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {field.value}
                    </Typography>
                    <KeyboardArrowDownIcon
                      sx={{
                        color: isActive ? GREEN : "#6b7280",
                        fontSize: 18,
                        flexShrink: 0,
                        transform: isActive ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
                    />
                  </Box>
                </Box>
              );
            })}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                px: { xs: 1.5, md: 1.2 },
                py: { xs: 1.2, md: 1 },
                bgcolor: "#fff",
                flexShrink: 0,
                borderRadius: "0 11px 11px 0",
              }}
            >
              <Button
                onClick={handleSearch}
                disabled={hotelLoading}
                startIcon={<SearchIcon sx={{ fontSize: "19px !important" }} />}
                sx={{
                  background: GREEN,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  textTransform: "none",
                  borderRadius: "10px",
                  px: { xs: 3, md: 3 },
                  py: 1.4,
                  width: { xs: "100%", md: "auto" },
                  minWidth: { xs: 0, md: 130 },
                  "&:hover": { background: "#15803d" },
                  "&:active": { transform: "scale(0.97)" },
                  "&.Mui-disabled": { background: "#86efac", color: "#fff" },
                  transition: "background 0.2s, transform 0.1s",
                }}
              >
                {hotelLoading ? "Searching..." : "Modify Search"}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Spacer — jab header "fixed" ho jaata hai, uski jagah khaali ho
          jaati hai (fixed elements normal flow se nikal jaate hain),
          isliye neeche content upar "jump" kar jaata. Ye spacer exactly
          utni hi height leta hai jitni header ki asli height hai
          (ResizeObserver se auto-measured), taaki koi jump na ho. */}
      {isFixed && <Box sx={{ height: headerHeight }} />}

      <DateRangePicker
        anchorEl={calendarAnchor}
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        startDate={checkIn}
        endDate={checkOut}
        onChange={(s, e) => {
          setCheckIn(s);
          setCheckOut(e);
        }}
        activeField={activeField}
      />
      <LocationDropdown
        open={locationOpen}
        onClose={() => setLocationOpen(false)}
        anchorEl={locationRef.current}
        onSelect={(city) => {
          setSelectedCity(city);
          setLocationOpen(false);
        }}
      />
      <RoomsGuestDropdown
        open={guestsOpen}
        onClose={() => setGuestsOpen(false)}
        anchorEl={guestsRef.current}
        onDone={(label) => {
          setGuestsLabel(label);
          setGuestsOpen(false);
        }}
      />
    </>
  );
};

// ─── No Hotel Found — empty state ─────────────
const NoHotelFound = ({ onBack }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      px: { xs: 3, sm: 4 },
      py: { xs: 6, sm: 8, md: 10 },
      mt: { xs: 4, sm: 6, md: 8 },
    }}
  >
    <Box
      component="img"
      src="/nohotel.svg"
      alt="No hotel found"
      sx={{
        width: { xs: 275, sm: 400, md: 550 },
        height: { xs: 160, sm: 200, md: 300 },
        maxWidth: "100%",
        mb: { xs: 2.5, sm: 3 },
      }}
    />
    <Typography
      sx={{
        fontSize: { xs: 17, sm: 19, md: 21 },
        fontWeight: 700,
        color: "#111827",
        fontFamily: "Inter, sans-serif",
        mb: 0.6,
      }}
    >
      No Hotel Found
    </Typography>
    <Typography
      sx={{
        fontSize: { xs: 13, sm: 14 },
        color: "#6b7280",
        fontFamily: "Inter, sans-serif",
        mb: 2,
      }}
    >
      Please search again
    </Typography>
    <Button
      onClick={onBack}
      // startIcon={<ArrowBackIcon />}
      variant="contained"
      disableElevation
      sx={{
        bgcolor: GREEN,
        color: "#fff",
        fontWeight: 600,
        textTransform: "none",
        borderRadius: "8px",
        px: 2,
        py: 1,
        fontSize: { xs: 13, sm: 14 },
        "&:hover": { bgcolor: "#15803d" },
      }}
    >
      Back to Search
    </Button>
  </Box>
);

// ─── Results Page ─────────────────────────────
const HotelsResultsPage = ({ scrolled }) => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // hotels, loadMore, loadingMore, hasMore — sab ek hi hook instance se
  const { hotels, loadMore, loadingMore, hasMore, init } = useHotelSearch();

  // FIX: pehle ye effect sirf mount pe (ek hi baar, [] dependency) chalta
  // tha. Isliye jab "Modify Search" ke baad navigate() naye state ke saath
  // /hotels/results pe hi call hota tha (same pathname, sirf state badalta
  // tha), to React Router component ko unmount/remount NAHI karta — sirf
  // location.state update hota hai. Aur [] dependency ki wajah se init()
  // dobara call hi nahi hota tha, isliye purani listing hi dikhti rehti thi.
  //
  // Ab state ke relevant fields (aur searchToken, jo har search pe unique
  // hota hai) ko dependency array mein daal diya hai — isse naya search
  // aane par ye effect reliably re-run hota hai, chahe route same hi kyun
  // na ho, aur listing turant refresh ho jaati hai.
  useEffect(() => {
    if (state?.cityCode && state?.hotels && state?.total) {
      init(state.cityCode, state.hotels, state.total);
    }
  }, [state?.cityCode, state?.total, state?.searchToken, state?.hotels]);

  if (!state?.hotels) {
    return <NoHotelFound onBack={() => navigate("/hotels")} />;
  }

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: "12px",
            background: "#1f2937",
            color: "#fff",
            fontSize: "14px",
            padding: "12px 18px",
          },
          success: { style: { background: "#166534", color: "#fff" } },
          error: { style: { background: "#991b1b", color: "#fff" } },
          loading: { style: { background: "#166534", color: "#fff" } },
        }}
      />

      <SearchHeader initialData={state} />

      {/* hotels — state.hotels nahi, hook ke hotels use karo */}
      <HotelListing
        hotels={hotels}
        cityName={state.cityName}
        cityCode={state.cityCode ?? ""}
        checkIn={state.checkIn ? new Date(state.checkIn) : null}
        checkOut={state.checkOut ? new Date(state.checkOut) : null}
        guests={state.guests ?? ""}
        guestsData={state.guestsData ?? null}
        loadMore={loadMore}
        loadingMore={loadingMore}
        hasMore={hasMore}
        resetKey={state.searchToken ?? state.cityCode}
      />
    </>
  );
};

export default HotelsResultsPage;