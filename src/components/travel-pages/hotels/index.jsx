// pages\hotels\Index.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Typography, Button, Paper } from "@mui/material";
import toast, { Toaster } from "react-hot-toast";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import RoomsGuestDropdown from "components/travel-components/hotels/Roomsguestselector";
import useTravelAuthGuard from "components/travel-hooks/useTravelAuthGuard";
import { isTravelUserLoggedIn } from "src/components/travel-config/userConfig";
import DateRangePicker from "components/travel-components/hotels/DateRangePicker";
import LocationDropdown from "components/travel-components/hotels/LocationDropdown";
import { useHotelSearch } from "components/travel-hooks/hotels/useHotelSearch";
import PopularDestinations from "components/travel-components/hotels/PopularHotelsRoutes";
import HotelSEOContent from "components/travel-components/hotels/HotelContent";
import { ENDPOINTS, hotelFetch } from "travel-api/hotelApi";
import PopularHotelRoutes from "components/travel-components/hotels/PopularHotelsRoutes";
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
  // {
  //   label: "Trains",
  //   img: "/navbaricons/trainslogo.svg",
  //   path: "/trains",
  //   emoji: "🚆",
  // },
];

function formatDate(date) {
  if (!date) return null;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// ─── Default dates (aaj aur kal) ────────────────────────
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

// ─── Default rooms & guests (1 Room, 1 Adult) ───────────
const DEFAULT_GUESTS_LABEL = "1 Room, 1 Adult";
// NOTE: agar Roomsguestselector.jsx ka internal data shape alag hai
// (jaise adultsCount/roomsCount ya kuch aur), toh ye object usi shape
// se match karke update karna hoga.
const DEFAULT_GUESTS_DATA = {
  rooms: [
    {
      adults: 1,
      children: 0,
      childrenAges: [],
    },
  ],
};

// ─── Full-screen Search Loader (Lottie) — Bus wale jaisa hi ───
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

// ─── CategoryTabs ─────────────────────────────
const CategoryTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <Box
      sx={{
        bgcolor: "#F7FAFF",
        pt: { xs: 1.5, md: 4 },
        pb: { xs: 1.5, md: 1 },
        px: 2,
        // 👇 yahi naya addition hai - navbar ke peeche hide hone se bachayega
        mt: { xs: "10px", md: "50px" },
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: { xs: 1, md: 1.5 },
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {CATEGORIES.map((cat) => {
          const isActive =
            location.pathname === cat.path ||
            location.pathname.startsWith(cat.path + "/");
          return (
            <Box
              key={cat.label}
              onClick={() => navigate(cat.path)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 0.8, md: 1 },
                px: { xs: 1.8, md: 2.5 },
                py: { xs: 0.8, md: 1.1 },
                borderRadius: "50px",
                cursor: "pointer",
                bgcolor: isActive ? "#ffffff" : "transparent",
                boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.10)" : "none",
                transition: "all 0.18s",
                "&:hover": {
                  bgcolor: isActive ? "#ffffff" : "rgba(255,255,255,0.6)",
                },
              }}
            >
              {cat.img && (
                <Box
                  component="img"
                  src={cat.img}
                  alt={cat.label}
                  sx={{
                    width: { xs: 24, md: 30 },
                    height: { xs: 24, md: 30 },
                    objectFit: "contain",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "block";
                  }}
                />
              )}
              <Typography
                sx={{
                  fontSize: { xs: 22, md: 26 },
                  lineHeight: 1,
                  display: cat.img ? "none" : "block",
                }}
              >
                {cat.emoji}
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: 13, md: 15 },
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#111827" : "#555",
                  whiteSpace: "nowrap",
                }}
              >
                {cat.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

// ─── renderFields ─────────────────────────────
function renderFields(
  FIELDS,
  calendarOpen,
  activeField,
  guestsOpen,
  locationOpen,
) {
  return FIELDS.map((field, index) => {
    const isActive =
      (calendarOpen &&
        ((field.id === "checkin" && activeField === "checkin") ||
          (field.id === "checkout" && activeField === "checkout"))) ||
      (field.id === "guests" && guestsOpen) ||
      (field.id === "location" && locationOpen);

    const hasError = !!field.error;

    return (
      <Box
        key={field.id}
        ref={field.ref}
        onClick={field.onClick}
        sx={{
          flex: 1,
          px: 2.5,
          py: 1.1,
          cursor: "pointer",
          borderRight: {
            md:
              index < FIELDS.length - 1
                ? `1.5px solid ${hasError ? "#fecaca" : BORDER}`
                : "none",
            xs: "none",
          },
          borderBottom: {
            xs: `1.5px solid ${hasError ? "#fecaca" : BORDER}`,
            md: "none",
          },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "5px",
          minWidth: 0,
          transition: "background 0.15s",
          bgcolor: hasError ? "#fff5f5" : isActive ? "#f0fdf4" : "transparent",
          borderRadius:
            index === 0
              ? {
                  xs: "10.5px 10.5px 0 0",
                  md: "10.5px 0 0 10.5px",
                }
              : "0",
          "&:hover": { background: hasError ? "#fff5f5" : "#f9fafb" },
        }}
      >
        {/* Label */}
        <Typography
          sx={{
            fontSize: "0.71rem",
            fontWeight: 600,
            letterSpacing: "0.15px",
            color: hasError ? "#dc2626" : isActive ? GREEN : "#6b7280",
          }}
        >
          {field.label}
        </Typography>

        {/* Value row */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "7px" }}>
          {field.icon}
          <Typography
            sx={{
              fontSize: "0.92rem",
              fontWeight: 600,
              color: field.isPlaceholder ? "#9ca3af" : "#111827",
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
              fontSize: 18,
              flexShrink: 0,
              color: hasError ? "#dc2626" : isActive ? GREEN : "#6b7280",
              transform: isActive ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}
          />
        </Box>

        {/* Inline error */}
        {hasError && (
          <Typography
            sx={{
              fontSize: "0.7rem",
              color: "#dc2626",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "3px",
              lineHeight: 1.3,
            }}
          >
            ⚠ {field.error}
          </Typography>
        )}
      </Box>
    );
  });
}

// ─── HotelsPage ────────────────────────────────
const HotelsPage = ({ scrolled }) => {
  const navigate = useNavigate();

  // ✅ TRAVEL AUTH GUARD — ab ye `loggedIn` boolean bhi return karta hai.
  // Login nahi hai to signin modal khol dega (Redux se, grocery jaisa hi),
  // aur `loggedIn` false hone par hum niche data-fetching useEffect ko
  // bhi skip karenge — taaki guest ke liye "Session Expired" wala
  // duplicate blocking Swal popup kabhi trigger na ho.
  const loggedIn = useTravelAuthGuard();

  // ✅ Check In / Check Out ab default aaj aur kal ki date se pre-selected hain
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [errors, setErrors] = useState({
    location: "",
    checkin: "",
    checkout: "",
  });

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [calendarAnchor, setCalendarAnchor] = useState(null);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState({ code: "", name: "" });

  // ✅ Page load hote hi Mumbai ka REAL city code CITIES API se fetch
  // karke selectedCity me set kar dete hain, taaki default value bhi
  // ek genuinely "selected" value ho aur bina kisi manual selection ke
  // Search seedha kaam kare.
  //
  // ✅ NAYA — ab ye API call sirf tab hi hoga jab user LOGGED IN ho
  // (`loggedIn` true). Guest ke liye hotelFetch() andar se
  // "Session Expired" wala blocking SweetAlert (allowOutsideClick:
  // false) trigger karta tha, jo signin-modal ke UPAR aake page ko
  // completely stuck/crash jaisa dikhata tha. Ab guest ke case mein
  // ye effect kuch nahi karta — sirf useTravelAuthGuard() ka signin
  // modal dikhega.
  useEffect(() => {
    if (!loggedIn) return;

    let cancelled = false;

    async function resolveDefaultCity() {
      try {
        const data = await hotelFetch(ENDPOINTS.CITIES, {
          method: "POST",
          params: { page: 1, page_size: 10, search: "Mumbai" },
          body: { CountryCode: "IN" },
        });

        if (cancelled) return;

        const match = (data?.data ?? []).find((c) =>
          (c.name || "").toLowerCase().startsWith("mumbai"),
        );

        // ✅ Agar isi beech user ne khud manually koi city select kar li
        // hai, toh default fetch us selection ko overwrite nahi karega.
        setSelectedCity((prev) =>
          prev.code
            ? prev
            : match
            ? { code: match.code, name: match.name }
            : prev,
        );
      } catch {
        // Network/API fail ho jaye toh bhi silently ignore — user
        // dropdown se manually city select kar sakta hai, placeholder
        // "Mumbai" dikhta rahega.
      }
    }

    resolveDefaultCity();
    return () => {
      cancelled = true;
    };
  }, [loggedIn]); // ✅ login modal se login karne ke turant baad (bina
  // reload) ye effect firse chalega aur city fetch ho jaayegi.

  // ✅ Rooms & Guests ab default "1 Room, 1 Adult" se pre-selected hain,
  // "Done" click kiye bina bhi valid rahega. User dropdown khol ke
  // change karega tabhi wo apna naya selection "Done" se confirm karega.
  const [guestsLabel, setGuestsLabel] = useState(DEFAULT_GUESTS_LABEL);
  const [guestsData, setGuestsData] = useState(DEFAULT_GUESTS_DATA);

  const checkinRef = useRef(null);
  const checkoutRef = useRef(null);
  const guestsRef = useRef(null);
  const locationRef = useRef(null);

  // ✅ Background (#f0f4f8) ko search-bar ke exact MIDDLE tak dikhane
  // ke liye do refs: ek outer relative wrapper (jiske andar background
  // absolute-position hota hai), aur ek khud search-bar row.
  const bgSectionRef = useRef(null);
  const searchBoxRef = useRef(null);
  const [bgHeight, setBgHeight] = useState(null);

  useEffect(() => {
    function updateBgHeight() {
      if (bgSectionRef.current && searchBoxRef.current) {
        const outerTop = bgSectionRef.current.getBoundingClientRect().top;
        const boxRect = searchBoxRef.current.getBoundingClientRect();
        const offsetTop = boxRect.top - outerTop;
        setBgHeight(offsetTop + boxRect.height / 2);
      }
    }

    updateBgHeight();
    window.addEventListener("resize", updateBgHeight);
    return () => window.removeEventListener("resize", updateBgHeight);
  }, []);

  const { search: searchHotels, loading: hotelLoading } = useHotelSearch();

  const openCalendar = (field) => {
    const el = field === "checkin" ? checkinRef.current : checkoutRef.current;
    setActiveField(field);
    setCalendarAnchor(el);
    setCalendarOpen(true);
  };

  const handleDateChange = (start, end) => {
    setCheckIn(start);
    setCheckOut(end);
    setErrors((prev) => ({ ...prev, checkin: "", checkout: "" }));
  };

  const handleSearch = async () => {
    // ✅ EXTRA SAFETY — search click pe bhi check, useTravelAuthGuard
    // already modal khol chuka hoga agar login nahi hai
    if (!isTravelUserLoggedIn()) {
      toast.error("Please login to search hotels.");
      return;
    }

    const newErrors = { location: "", checkin: "", checkout: "", guests: "" };
    let hasError = false;

    if (!selectedCity.code) {
      newErrors.location = "Please select a location";
      hasError = true;
    }
    if (!checkIn) {
      newErrors.checkin = "Please select a check-in date";
      hasError = true;
    }
    if (!checkOut) {
      newErrors.checkout = "Please select a check-out date";
      hasError = true;
    }
    if (!guestsLabel) {
      newErrors.guests = "Please select rooms & guests";
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    try {
      const data = await searchHotels(selectedCity.code);

      const hotels = data?.data ?? data?.hotels ?? data?.results ?? [];
      const total = data?.meta?.total ?? hotels.length ?? 0;

      navigate("/hotels/results", {
        state: {
          hotels,
          cityName: selectedCity.name,
          cityCode: selectedCity.code,
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          guests: guestsLabel,
          guestsData,
          total,
        },
      });
    } catch (err) {
      toast.error(err?.message || "Something went wrong. Please try again.");
    }
  };

  const FIELDS = [
    {
      id: "location",
      label: "Location",
      value: selectedCity.code ? selectedCity.name : "Mumbai",
      isPlaceholder: !selectedCity.code,
      error: errors.location,
      icon: (
        <LocationOnIcon
          sx={{ color: errors.location ? "#dc2626" : GREEN, fontSize: 19 }}
        />
      ),
      ref: locationRef,
      onClick: () => setLocationOpen((o) => !o),
    },
    {
      id: "checkin",
      label: "Check In",
      value: formatDate(checkIn),
      isPlaceholder: false,
      error: errors.checkin,
      icon: (
        <CalendarTodayIcon
          sx={{ color: errors.checkin ? "#dc2626" : GREEN, fontSize: 19 }}
        />
      ),
      ref: checkinRef,
      onClick: () => openCalendar("checkin"),
    },
    {
      id: "checkout",
      label: "Check Out",
      value: formatDate(checkOut),
      isPlaceholder: false,
      error: errors.checkout,
      icon: (
        <CalendarTodayIcon
          sx={{ color: errors.checkout ? "#dc2626" : GREEN, fontSize: 19 }}
        />
      ),
      ref: checkoutRef,
      onClick: () => openCalendar("checkout"),
    },
    {
      id: "guests",
      label: "Rooms & Guests",
      value: guestsLabel,
      isPlaceholder: false,
      error: errors.guests,
      icon: (
        <PeopleAltIcon
          sx={{ color: errors.guests ? "#dc2626" : GREEN, fontSize: 19 }}
        />
      ),
      ref: guestsRef,
      onClick: () => setGuestsOpen((o) => !o),
    },
  ];

  return (
    <>
      <HotelSearchLoader open={hotelLoading} />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: "12px",
            background: "#1f2937",
            color: "#fff",
            fontSize: "14px",
            padding: "12px 18px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          },
          success: { style: { background: "#166534", color: "#fff" } },
          error: { style: { background: "#991b1b", color: "#fff" } },
          loading: { style: { background: "#166534", color: "#fff" } },
        }}
      />

      <CategoryTabs />

      <Box
        ref={bgSectionRef}
        sx={{
          fontFamily: "Inter, sans-serif",
          position: "relative",
          width: "100%",
          boxSizing: "border-box",
          overflowX: "hidden",
          px: {
            xs: 1.5,
            sm: 2,
          },
          pb: {
            xs: 3,
            md: 5,
          },
          pt: {
            xs: 2,
            md: 4,
          },
        }}
      >
        {/* BACKGROUND ONLY TILL SEARCH BAR MIDDLE (Book a Hotel AREA) */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "100vw",
            height: bgHeight
              ? `${bgHeight}px`
              : { xs: "140px", sm: "160px", md: "80px" },
            bgcolor: "#F7FAFF",
            zIndex: 0,
            pointerEvents: "none",
            transition: "height 0.15s ease",
          }}
        />

        {/* CONTENT LAYER */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "16px",
            width: "100%",
            maxWidth: 1200,
            mx: "auto",
            boxSizing: "border-box",
            overflow: "hidden",
            px: {
              xs: 2,
              sm: 3,
              md: 4,
            },
            py: {
              xs: 2,
              sm: 3,
              md: 4,
            },
            boxShadow: "0 2px 20px rgba(0,0,0,0.08)",
            position: "relative",
            zIndex: 1,
            backgroundColor: "#fff",
          }}
        >
          {/* HEADER */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "flex-start" },
              gap: { xs: 1.5, sm: 0 },
              mb: {
                xs: 2,
                md: 2.8,
              },
            }}
          >
            <Box
              sx={{
                textAlign: {
                  xs: "center",
                  md: "left",
                },
                width: "100%",
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "1.5rem", md: "1.65rem" },
                  fontWeight: 400,
                  fontFamily: "Inter, sans-serif",
                  color: "#111827",
                  letterSpacing: "-0.3px",
                  lineHeight: 1.2,
                  textAlign: {
                    xs: "center",
                    md: "left",
                  },
                }}
              >
                Book a Hotel
              </Typography>

              <Typography
                sx={{
                  fontSize: "0.875rem",
                  fontFamily: "Inter, sans-serif",
                  color: "rgba(0, 0, 0, 0.87)",
                  mt: 0.5,
                  textAlign: {
                    xs: "center",
                    md: "left",
                  },
                }}
              >
                Discover the perfect space for you!
              </Typography>
            </Box>
          </Box>

          {/* SEARCH BOX */}
          <Box
            ref={searchBoxRef}
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "stretch",
              border: `1.5px solid ${BORDER}`,
              borderRadius: "12px",
              overflow: "hidden",
              boxSizing: "border-box",
              position: "relative",
            }}
          >
            {renderFields(
              FIELDS,
              calendarOpen,
              activeField,
              guestsOpen,
              locationOpen,
            )}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                px: { xs: 1.5, md: 1.2 },
                py: { xs: 1.2, md: 1 },
                bgcolor: "#fff",
                flexShrink: 0,
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
                  fontFamily: "Inter, sans-serif",
                  textTransform: "none",
                  borderRadius: "10px",
                  px: { xs: 3, md: 3 },
                  py: 1.6,
                  width: { xs: "100%", md: "auto" },
                  minWidth: { xs: 0, md: 130 },
                  "&:hover": { background: "#15803d" },
                  "&:active": { transform: "scale(0.97)" },
                  "&.Mui-disabled": {
                    background: "#86efac",
                    color: "#fff",
                  },
                  transition: "background 0.2s, transform 0.1s",
                }}
              >
                {hotelLoading ? "Searching..." : "Search"}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      <DateRangePicker
        anchorEl={calendarAnchor}
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        startDate={checkIn}
        endDate={checkOut}
        onChange={handleDateChange}
        activeField={activeField}
      />

      <LocationDropdown
        open={locationOpen}
        onClose={() => setLocationOpen(false)}
        anchorEl={locationRef.current}
        onSelect={(city) => {
          setSelectedCity(city);
          setLocationOpen(false);
          setErrors((prev) => ({ ...prev, location: "" }));
        }}
      />

      <RoomsGuestDropdown
        open={guestsOpen}
        onClose={() => setGuestsOpen(false)}
        anchorEl={guestsRef.current}
        initialData={guestsData}
        onDone={(label, data) => {
          setGuestsLabel(label);
          setGuestsData(data);
          setGuestsOpen(false);
        }}
      />

      <Box sx={{ px: { xs: 1.5, sm: 2, md: 4 }, boxSizing: "border-box" }}>
        <Box
          sx={{
            maxWidth: 1200,
            mx: "auto",
            boxSizing: "border-box",
            px: { xs: 2, sm: 3, md: 0 },
          }}
        >
          <PopularHotelRoutes />
        </Box>
      </Box>

      <HotelSEOContent />
    </>
  );
};

export default HotelsPage;
