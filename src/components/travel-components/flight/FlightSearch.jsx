// src\components\flights\FlightSearch.jsx
import { useState, useEffect, useRef, useMemo, useLayoutEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Link,
  useMediaQuery,
  useTheme,
  CircularProgress,
  CssBaseline,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import HeadsetMicOutlinedIcon from "@mui/icons-material/HeadsetMicOutlined";
import LuggageOutlinedIcon from "@mui/icons-material/LuggageOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import SearchIcon from "@mui/icons-material/Search";
import { useFlightCities } from "components/travel-hooks/flight/useFlightCities";
import { useFlightSearch } from "components/travel-hooks/flight/useFlightSearch";
import Lottie from "lottie-react";



// ─── MUI Theme ────────────────────────────────
const muiTheme = createTheme({
  palette: {
    primary: { main: "#2e7d32" },
    // background: { default: "#f0f4f8" },
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          overflowY: "scroll",
        },
        body: {
          overflowX: "hidden",
        },
      },
    },
  },
});

// ─── Constants ────────────────────────────────
const GREEN = "#16a34a";

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
];

// 🔥 SHARED horizontal padding for outer sections only — CategoryTabs,
// non-sticky content wrap, and sticky content wrap all use THIS same
// value so their left/right edges always line up on every laptop screen
// size. Change it here once and all three stay in sync.
const SECTION_PX = { xs: 1.5, sm: 2, md: "40px" };

const CABIN_CLASSES = ["Economy", "Premium Economy", "Business", "First Class"];

// ─── SVG Icons ────────────────────────────────
const FlightTakeoffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M22 2 11 13" />
    <path d="m22 2-7 20-4-9-9-4 20-7z" />
  </svg>
);

const FlightLandIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M17.8 19.2 16 11l-3.5 3.5-2 4.8" />
    <path d="m2 9 7.7-1.4 3-5.3 1.3 3.5-4 7.2L2 9z" />
    <line x1="2" y1="19" x2="22" y2="19" />
  </svg>
);

const SwapIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 16V4m0 0L3 8m4-4l4 4" />
    <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const UserIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="#2e7d32" stroke="#2e7d32" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const PassengerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ─── Date Helpers ─────────────────────────────
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const DAYS_FULL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year, month) { const d = new Date(year, month, 1).getDay(); return (d + 6) % 7; }
function isSameDay(a, b) {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function formatDisplayDate(date) {
  if (!date) return "";
  return `${DAYS_FULL[date.getDay()]}, ${MONTH_SHORT[date.getMonth()]} ${date.getDate()}`;
}

// ─── CitySearchDropdown ───────────────────────
const CitySearchDropdown = ({ anchorEl, open, onClose, onSelect, cities, loading, placeholder = "Search city or airport..." }) => {
  const [query, setQuery] = useState("");
  const [pos, setPos] = useState({ top: 0, left: 0, width: 320 });
  const inputRef = useRef(null);
  const ref = useRef(null);

  useEffect(() => {
    if (open && anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollX = window.scrollX || document.documentElement.scrollLeft;
      setPos({ top: rect.bottom + scrollY + 6, left: rect.left + scrollX, width: Math.max(rect.width, 320) });
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, anchorEl]);

  useEffect(() => {
    if (!open) return;
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target) && anchorEl && !anchorEl.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open, onClose, anchorEl]);

  const normalize = (c) => ({ code: c.code || c.value || "", name: c.name || c.label || "", country: "", airport: "" });

  const filtered = useMemo(() => {
    if (!query.trim()) return cities.slice(0, 50);
    const q = query.toLowerCase();
    return cities
      .filter((c) => {
        const name = (c.name || c.label || "").toLowerCase();
        const code = (c.code || c.value || "").toLowerCase();
        return name.includes(q) || code.includes(q);
      })
      .slice(0, 50);
  }, [query, cities]);

  if (!open) return null;

  return (
    <Paper
      ref={ref}
      elevation={0}
      sx={{
        position: "absolute",
        top: pos.top,
        left: { xs: 8, md: pos.left },
        right: { xs: 8, md: "auto" },
        width: { xs: "calc(100vw - 16px)", md: pos.width },
        zIndex: 9999,
        borderRadius: "16px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 8px 40px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.07)",
        bgcolor: "#fff",
        overflow: "hidden",
        boxSizing: "border-box",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, px: 2, py: 1.5, borderBottom: "1px solid #f3f4f6" }}>
        <SearchIcon sx={{ fontSize: 18, color: "#9ca3af", flexShrink: 0 }} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          style={{ flex: 1, border: "none", outline: "none", fontSize: 14, fontFamily: "'Inter', sans-serif", color: "#111827", background: "transparent", minWidth: 0 }}
        />
        {query && (
          <Box onClick={() => setQuery("")} sx={{ cursor: "pointer", color: "#9ca3af", fontSize: 18, lineHeight: 1, "&:hover": { color: "#374151" } }}>×</Box>
        )}
      </Box>

      <Box sx={{ maxHeight: 320, overflowY: "auto", overflowX: "hidden", width: "100%", boxSizing: "border-box", scrollbarGutter: "stable" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={24} sx={{ color: GREEN }} />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ py: 3, textAlign: "center" }}>
            <Typography sx={{ fontSize: 13, color: "#9ca3af", fontFamily: "'Inter', sans-serif" }}>No cities found</Typography>
          </Box>
        ) : (
          filtered.map((city, idx) => {
            const { code, name, country } = normalize(city);
            return (
              <Box
                key={`${code}-${idx}`}
                onClick={() => { onSelect({ code, name: country ? `${name}, ${country}` : name }); onClose(); }}
                sx={{ display: "flex", alignItems: "center", gap: 2, px: 2, py: 1.2, cursor: "pointer", borderBottom: "1px solid #f9fafb", transition: "background 0.12s", "&:hover": { bgcolor: "#f0fdf4" } }}
              >
                <Box sx={{ minWidth: 42, height: 42, borderRadius: "10px", border: "1px solid #E3E8EE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, fontFamily: "'Inter', sans-serif", letterSpacing: 0.5 }}>{code || "—"}</Typography>
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#111827", fontFamily: "'Inter', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {name}
                  </Typography>
                </Box>
              </Box>
            );
          })
        )}
      </Box>
    </Paper>
  );
};

// ─── Full-screen Search Loader (Lottie) ───────
const FlightSearchLoader = ({ open }) => {
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
        <Lottie path="/flightlottie.json" loop autoplay />
      </Box>
      <Box sx={{ textAlign: "center" }}>
        <Typography
          sx={{ fontSize: 18, fontWeight: 700, color: "#111827", mb: 0.5 }}
        >
          Searching Best Flights...
        </Typography>
        <Typography sx={{ fontSize: 14, color: "#6b7280" }}>
          Checking availability across airlines
        </Typography>
      </Box>
    </Box>
  );
};

// ─── FlightDatePicker ─────────────────────────
const FlightDatePicker = ({ anchorEl, open, onClose, selectedDate, onChange, minDate }) => {
  const today = minDate ? new Date(minDate) : new Date();
  today.setHours(0, 0, 0, 0);
  const [viewMonth, setViewMonth] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (open && anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollX = window.scrollX || document.documentElement.scrollLeft;
      setPos({ top: rect.bottom + scrollY + 8, left: rect.left + scrollX });
      const base = selectedDate || today;
      setViewMonth({ year: base.getFullYear(), month: base.getMonth() });
    }
  }, [open, anchorEl]);

  useEffect(() => {
    if (!open) return;
    const handle = (e) => {
      const popup = document.getElementById("flight-drp-popup");
      if (anchorEl && !anchorEl.contains(e.target) && popup && !popup.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open, onClose, anchorEl]);

  const canGoPrev = viewMonth.year > today.getFullYear() || (viewMonth.year === today.getFullYear() && viewMonth.month > today.getMonth());

  const goPrev = () => {
    if (!canGoPrev) return;
    setViewMonth((prev) => {
      let m = prev.month - 1;
      let y = prev.year;
      if (m < 0) { m = 11; y--; }
      if (y < today.getFullYear() || (y === today.getFullYear() && m < today.getMonth())) return { year: today.getFullYear(), month: today.getMonth() };
      return { year: y, month: m };
    });
  };

  const goNext = () => {
    setViewMonth((prev) => {
      let m = prev.month + 1;
      let y = prev.year;
      if (m > 11) { m = 0; y++; }
      return { year: y, month: m };
    });
  };

  if (!open) return null;

  const { year, month } = viewMonth;
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  return (
    <Paper
      id="flight-drp-popup"
      elevation={0}
      sx={{
        position: "absolute",
        top: pos.top,
        left: { xs: 8, md: pos.left },
        right: { xs: 8, md: "auto" },
        zIndex: 9999,
        borderRadius: "16px",
        p: { xs: "20px 16px", md: "24px 28px" },
        boxShadow: "0 8px 40px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.07)",
        border: "1px solid #f3f4f6",
        bgcolor: "#ffffff",
        width: { xs: "calc(100vw - 16px)", md: "auto" },
        minWidth: { md: 300 },
        boxSizing: "border-box",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
        <IconButton onClick={goPrev} disabled={!canGoPrev} size="small" sx={{ width: 28, height: 28, color: canGoPrev ? "#6b7280" : "#d1d5db" }}>
          <ChevronLeftIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#111827", fontFamily: "inherit" }}>{MONTH_NAMES[month]} {year}</Typography>
        <IconButton onClick={goNext} size="small" sx={{ width: 28, height: 28, color: "#6b7280" }}>
          <ChevronRightIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", mb: 0.5 }}>
        {DAY_LABELS.map((d) => (
          <Typography key={d} sx={{ textAlign: "center", fontSize: "0.78rem", fontWeight: 600, color: "#9ca3af", py: 0.5 }}>{d}</Typography>
        ))}
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {cells.map((date, idx) => {
          if (!date) return <Box key={`empty-${idx}`} />;
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, new Date());
          const isPast = date < today && !isToday;
          return (
            <Box key={date.toISOString()} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Box
                onClick={() => { if (!isPast) { onChange(date); onClose(); } }}
                sx={{
                  width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: isPast ? "default" : "pointer", bgcolor: isSelected ? GREEN : "transparent", my: 0.3,
                  transition: "background 0.12s, transform 0.1s",
                  "&:hover": !isPast ? { bgcolor: isSelected ? GREEN : "#f0fdf4", transform: "scale(1.08)" } : {},
                }}
              >
                <Typography sx={{ fontSize: "0.85rem", fontWeight: isSelected || isToday ? 700 : 400, color: isSelected ? "#fff" : isPast ? "#d1d5db" : isToday ? GREEN : "#111827", lineHeight: 1, userSelect: "none" }}>
                  {date.getDate()}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ textAlign: "center", mt: 2 }}>
        <Typography sx={{ fontSize: "0.78rem", color: "#9ca3af" }}>
          {selectedDate ? selectedDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Select date"}
        </Typography>
      </Box>
    </Paper>
  );
};

// ─── PassengerClassDropdown ───────────────────
const PassengerClassDropdown = ({ anchorEl, open, onClose, passengers, setPassengers, cabinClass, setCabinClass }) => {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef(null);

  useEffect(() => {
    if (open && anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollX = window.scrollX || document.documentElement.scrollLeft;
      setPos({ top: rect.bottom + scrollY + 8, left: rect.left + scrollX });
    }
  }, [open, anchorEl]);

  useEffect(() => {
    if (!open) return;
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target) && anchorEl && !anchorEl.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open, onClose, anchorEl]);

  if (!open) return null;

  const types = [
    { key: "adults", label: "Adults", sub: "12+ years" },
    { key: "children", label: "Children", sub: "2-12 years" },
    { key: "infants", label: "Infants", sub: "Under 2" },
  ];

  return (
    <div
      ref={ref}
      style={{
        position: "absolute", top: pos.top, left: pos.left, zIndex: 9999, width: 300, boxSizing: "border-box",
        background: "#fff", borderRadius: 16, border: "1px solid #f0f0f0", boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
        overflow: "hidden", fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ padding: "16px 16px 10px", fontWeight: 700, fontSize: 14, color: "#374151" }}>Travellers</div>
      {types.map(({ key, label, sub }) => (
        <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid #f3f4f6" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>{label}</div>
            <div style={{ fontSize: 12, color: "#9ca3af" }}>{sub}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => setPassengers((p) => ({ ...p, [key]: Math.max(key === "adults" ? 1 : 0, p[key] - 1) }))}
              style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid #d1d5db", background: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#374151", lineHeight: 1 }}
            >
              −
            </button>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#111827", minWidth: 20, textAlign: "center" }}>{passengers[key]}</span>
            <button
              onClick={() => setPassengers((p) => ({ ...p, [key]: p[key] + 1 }))}
              style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid #d1d5db", background: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#374151", lineHeight: 1 }}
            >
              +
            </button>
          </div>
        </div>
      ))}
      <div style={{ padding: "12px 16px 8px", fontWeight: 700, fontSize: 14, color: "#374151" }}>Cabin Class</div>
      <div style={{ padding: "0 16px 16px", display: "flex", flexWrap: "wrap", gap: 8 }}>
        {CABIN_CLASSES.map((cls) => (
          <button
            key={cls}
            onClick={() => setCabinClass(cls)}
            style={{
              padding: "6px 14px", borderRadius: 50, border: `1.5px solid ${cabinClass === cls ? GREEN : "#d1d5db"}`,
              background: cabinClass === cls ? "#f0fdf4" : "#fff", color: cabinClass === cls ? GREEN : "#374151",
              fontWeight: cabinClass === cls ? 700 : 500, fontSize: 13, cursor: "pointer", fontFamily: "'Inter', sans-serif",
            }}
          >
            {cls}
          </button>
        ))}
      </div>
      <div style={{ padding: "0 16px 14px" }}>
        <button
          onClick={onClose}
          style={{ width: "100%", padding: "10px", borderRadius: 10, background: GREEN, color: "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}
        >
          Done
        </button>
      </div>
    </div>
  );
};

// ─── CategoryTabs ─────────────────────────────
// 🔥 UPDATED: apna bg/margin nahi rakhta ab — sirf pills content return karta hai.
// Bg-stretch control ab parent (FlightSearch) mein hai, jo Paper ke middle tak measure karta hai.
const CategoryTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <Box
      sx={{
        pt: { xs: 1.5, md: 4 },
        pb: { xs: 1.5, md: 1 },
        px: SECTION_PX,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 1.5 }, flexWrap: "wrap", justifyContent: "center" }}>
        {CATEGORIES.map((cat) => {
          const isActive = location.pathname === cat.path || location.pathname.startsWith(cat.path + "/");
          return (
            <Box
              key={cat.label}
              onClick={() => navigate(cat.path)}
              sx={{
                display: "flex", alignItems: "center", gap: { xs: 0.8, md: 1 },
                px: { xs: 1.8, md: 2.5 }, py: { xs: 0.8, md: 1.1 }, borderRadius: "50px", cursor: "pointer",
                bgcolor: isActive ? "#ffffff" : "transparent",
                boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.10)" : "none",
                transition: "all 0.18s",
                "&:hover": { bgcolor: isActive ? "#ffffff" : "rgba(255,255,255,0.6)" },
              }}
            >
              {cat.img && (
                <Box
                  component="img" src={cat.img} alt={cat.label}
                  sx={{ width: { xs: 24, md: 30 }, height: { xs: 24, md: 30 }, objectFit: "contain" }}
                  onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "block"; }}
                />
              )}
              <Typography sx={{ fontSize: { xs: 22, md: 26 }, lineHeight: 1, display: cat.img ? "none" : "block" }}>{cat.emoji}</Typography>
              <Typography sx={{ fontSize: { xs: 13, md: 15 }, fontWeight: isActive ? 700 : 500, color: isActive ? "#111827" : "#555", whiteSpace: "nowrap" }}>
                {cat.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

// ─── FieldBox helper ──────────────────────────
const FieldBox = ({ legend, legendColor = "#6b6b6b", children, onClick, error, fieldRef, sx = {} }) => (
  <Box
    ref={fieldRef}
    onClick={onClick}
    sx={{
      position: "relative", border: `1px solid ${error ? "#dc2626" : "#c8c8c8"}`, borderRadius: "12px", height: 58, minHeight: 58,
      display: "flex", alignItems: "center", px: "14px", backgroundColor: error ? "#fff5f5" : "#fff", cursor: "pointer",
      transition: "border-color 0.15s", "&:hover": { borderColor: error ? "#dc2626" : "#2e7d32" }, boxSizing: "border-box", ...sx,
    }}
  >
    <Box
      component="span"
      sx={{
        position: "absolute", top: -9, left: 10, fontSize: "0.72rem", color: error ? "#dc2626" : legendColor,
        backgroundColor: error ? "#fff5f5" : "#fff", px: 0.5, lineHeight: 1, fontFamily: "'Inter', sans-serif", fontWeight: 500,
      }}
    >
      {legend}
    </Box>
    {children}
  </Box>
);

// ─── FlightSearch (Main Component) ───────────
export default function FlightSearch({
  initialFrom = null,
  initialTo = null,
  initialDate = null,
  initialReturnDate = null,
  initialTripType = "oneway",
  initialPassengers = null,
  initialCabinClass = null,
  onSearch = null,
  showCategoryTabs = true,
  // 🔥 NAYA — Bus wale pattern jaisa hi: sirf tab true karo jab is
  // component ko aise page pe render kar rahe ho jaha scroll pe header
  // "fixed" ho jaana chahiye (jaise BusSearch ke results page pe hota hai).
  // Normal /flights page pe ye false hi rahega, koi behaviour change nahi.
  stickyHeader = false,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const { cities, loading: citiesLoading } = useFlightCities();
  const { searchFlights, loading: searchLoading } = useFlightSearch();

  const [fromCity, setFromCity] = useState(initialFrom || { code: "BOM", name: "Mumbai, IN" });
  const [toCity, setToCity] = useState(initialTo || { code: "DEL", name: "New Delhi, IN" });

  const [fromDropOpen, setFromDropOpen] = useState(false);
  const [toDropOpen, setToDropOpen] = useState(false);
  const [tripType, setTripType] = useState(initialTripType || "oneway");
  const [returnDate, setReturnDate] = useState(() => {
    if (initialReturnDate) {
      const d = new Date(initialReturnDate);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    return null;
  });
  const fromFieldRef = useRef(null);
  const toFieldRef = useRef(null);

  const [errors, setErrors] = useState({ from: "", to: "" });

  const [departureDate, setDepartureDate] = useState(() => {
    if (initialDate) {
      const d = new Date(initialDate);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [depPickerOpen, setDepPickerOpen] = useState(false);
  const [retPickerOpen, setRetPickerOpen] = useState(false);
  const [paxDropOpen, setPaxDropOpen] = useState(false);

  const depDateRef = useRef(null);
  const retDateRef = useRef(null);
  const paxRef = useRef(null);

  const [passengers, setPassengers] = useState(initialPassengers || { adults: 1, children: 0, infants: 0 });
  const [cabinClass, setCabinClass] = useState(initialCabinClass || "Economy");

  useEffect(() => { if (initialTripType) setTripType(initialTripType); }, [initialTripType]);

  useEffect(() => {
    if (initialReturnDate) {
      const d = new Date(initialReturnDate);
      d.setHours(0, 0, 0, 0);
      setReturnDate(d);
    }
  }, [initialReturnDate]);

  useEffect(() => { if (initialFrom) setFromCity(initialFrom); }, [initialFrom?.code]);
  useEffect(() => { if (initialTo) setToCity(initialTo); }, [initialTo?.code]);

  // 🔥 NAYA — scroll-based "fixed" positioning, BusSearch jaisa hi.
  // Sirf `stickyHeader` true hone par hi activate hota hai.
  const [isFixed, setIsFixed] = useState(false);
  const placeholderRef = useRef(null); // header ki original screen-position record karne ke liye
  const fixedWrapRef = useRef(null); // header ki actual height measure karne ke liye (spacer ke liye)
  const stickyThreshold = useRef(0);
  const [headerHeight, setHeaderHeight] = useState(0);

  useLayoutEffect(() => {
    if (!stickyHeader) return;

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
  }, [stickyHeader]);

  useLayoutEffect(() => {
    if (!stickyHeader) return;

    const measureHeight = () => {
      if (fixedWrapRef.current) {
        setHeaderHeight(fixedWrapRef.current.getBoundingClientRect().height);
      }
    };
    measureHeight();

    const ro = new ResizeObserver(measureHeight);
    if (fixedWrapRef.current) ro.observe(fixedWrapRef.current);
    window.addEventListener("resize", measureHeight);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureHeight);
    };
  }, [stickyHeader]);

  // 🔥 NEW: bg-stretch measurement refs + state
  const heroWrapRef = useRef(null);    // outer relative container (tabs + search Paper)
  const searchPaperRef = useRef(null); // the search Paper card
  const [blueHeight, setBlueHeight] = useState(140); // sensible fallback before measured

  useLayoutEffect(() => {
    const measure = () => {
      if (!heroWrapRef.current || !searchPaperRef.current) return;
      const wrapRect = heroWrapRef.current.getBoundingClientRect();
      const paperRect = searchPaperRef.current.getBoundingClientRect();
      const middleOfPaper = paperRect.top - wrapRect.top + paperRect.height / 2;
      setBlueHeight(Math.max(0, Math.round(middleOfPaper)));
    };

    measure();

    const ro = new ResizeObserver(measure);
    if (heroWrapRef.current) ro.observe(heroWrapRef.current);
    if (searchPaperRef.current) ro.observe(searchPaperRef.current);
    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [errors.from, errors.to, fromCity, toCity, tripType, returnDate]); // in fields ke change hone par Paper height badal sakti hai

  const passengerLabel = () => {
    const parts = [];
    if (passengers.adults) parts.push(`${passengers.adults} Adult${passengers.adults > 1 ? "s" : ""}`);
    if (passengers.children) parts.push(`${passengers.children} Child${passengers.children > 1 ? "ren" : ""}`);
    if (passengers.infants) parts.push(`${passengers.infants} Infant${passengers.infants > 1 ? "s" : ""}`);
    return `${parts.join(", ")} · ${cabinClass}`;
  };

  const handleSwap = () => {
    setFromCity(toCity);
    setToCity(fromCity);
  };

  const handleRoundTripToggle = (type) => {
    setTripType(type);
    if (type === "oneway") setReturnDate(null);
    if (type === "roundtrip" && !returnDate) {
      const next = new Date(departureDate);
      next.setDate(next.getDate() + 1);
      setReturnDate(next);
    }
  };

  const closeAll = () => {
    setFromDropOpen(false);
    setToDropOpen(false);
    setDepPickerOpen(false);
    setRetPickerOpen(false);
    setPaxDropOpen(false);
  };

  const handleSearch = async () => {
    const newErrors = { from: "", to: "" };
    let hasError = false;
    if (!fromCity?.code) { newErrors.from = "Please select departure city"; hasError = true; }
    if (!toCity?.code) { newErrors.to = "Please select destination city"; hasError = true; }
    setErrors(newErrors);
    if (hasError) return;

    const result = await searchFlights({ fromCity, toCity, departureDate, returnDate, passengers, cabinClass, tripType });

    const params = {
      fromCity,
      toCity,
      departureDate: departureDate.toISOString(),
      returnDate: returnDate?.toISOString() ?? null,
      passengers,
      cabinClass,
      tripType,
    };

    if (onSearch) {
      onSearch(result, params);
      return;
    }

    navigate("/flights/listing", {
      state: {
        searchResult: result,
        flights: result?.data?.results?.Results || [],
        ...params,
      },
    });
  };

  // 🔥 Search Paper box — ye hi sticky/fixed hoga jab stickyHeader=true
  // NOTE: Paper ka px yahan SECTION_PX se ALAG rakha hai jaanbujh ke —
  // ye card ke ANDAR ka internal padding hai (content vs border spacing),
  // outer screen-alignment se koi lena dena nahi. Isliye original value
  // (xs:2, sm:3, md:3) hi rehni chahiye — SECTION_PX yahan use NAHI karna.
  const searchBoxContent = (
    <Paper
      ref={searchPaperRef}
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: 1280,
        borderRadius: { xs: 3, sm: 4 },
        border: "1px solid #e8e8e8",
        px: { xs: 2, sm: 3, md: 3 },
        py: { xs: 2.5, sm: 3 },
        position: "relative",
        backgroundColor: "#fff",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Header
          🔥 NAYA — jab stickyHeader true hai AUR header fixed ho chuka hai
          (isFixed=true), tab ye "Flight Booking" title/subtitle block hide
          ho jayega taaki sticky bar compact dikhe. Normal (non-sticky)
          page pe ya jab tak scroll na hua ho, ye hamesha visible rahega —
          koi behaviour change nahi. */}
      {!(stickyHeader && isFixed) && (
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: { xs: 1.5, sm: 2 } }}>
          <Box
            sx={{
              textAlign: { xs: "center", sm: "left" },
              width: "100%",
              // NOTE: ye title ka apna internal indent hai (Paper ke andar),
              // SECTION_PX (outer alignment) se unrelated — original value
              // pe hi rakha hai.
              px: { xs: 2, sm: 0 },
              py: { xs: 1, sm: 0 },
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "center", sm: "flex-start" },
            }}
          >
            <Typography variant="h5" fontWeight={700} fontSize={{ xs: "1.25rem", sm: "1.5rem" }} color="#1a1a1a" lineHeight={1.2} sx={{ fontFamily: "'Inter', sans-serif" }}>
              Flight Booking
            </Typography>
            <Typography variant="body2" color="text.secondary" fontSize={{ xs: "0.78rem", sm: "0.875rem" }} mt={0.4} sx={{ fontFamily: "'Inter', sans-serif" }}>
              Book International and Domestic Flights
            </Typography>
          </Box>
        </Box>
      )}

      {/* Trip type radios */}
      <Box sx={{ display: "flex", gap: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 2.5 }, justifyContent: { xs: "center", sm: "flex-start" }, width: "100%" }}>
        {[
          { val: "oneway", label: "Oneway" },
          { val: "roundtrip", label: "Round Trip" },
        ].map(({ val, label }) => (
          <Box key={val} onClick={() => handleRoundTripToggle(val)} sx={{ display: "flex", alignItems: "center", gap: 0.8, cursor: "pointer" }}>
            {tripType === val ? (
              <RadioButtonCheckedIcon sx={{ fontSize: 20, color: GREEN }} />
            ) : (
              <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: "#9ca3af" }} />
            )}
            <Typography
              sx={{
                fontSize: { xs: "0.85rem", sm: "0.95rem" },
                fontWeight: tripType === val ? 600 : 500,
                color: tripType === val ? "#111827" : "#6b7280",
                fontFamily: "'Inter', sans-serif",
                userSelect: "none",
              }}
            >
              {label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Search row */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { xs: "stretch", md: "center" }, flexWrap: { md: "nowrap" }, gap: { xs: 1.5, md: 1 }, width: "100%" }}>
        {/* FROM + SWAP + TO */}
        <Box sx={{ display: "flex", flex: { xs: "1 1 auto", md: "3 1 0" }, alignItems: "center", position: "relative", gap: 0, minWidth: 0 }}>
          {/* FROM fieldset */}
          <Box
            component="fieldset"
            ref={fromFieldRef}
            onClick={() => { closeAll(); setFromDropOpen(true); }}
            sx={{
              flex: 1, minWidth: 0, border: `1px solid ${errors.from ? "#dc2626" : "#c8c8c8"}`, borderRadius: "12px", m: 0,
              pl: "10px", pr: "24px", height: 50, minHeight: 50, boxSizing: "border-box", display: "flex", alignItems: "center",
              backgroundColor: errors.from ? "#fff5f5" : "#fff", mr: "8px", lineHeight: 1, cursor: "pointer", overflow: "hidden",
              "&:hover": { borderColor: errors.from ? "#dc2626" : "#2e7d32" }, transition: "border-color 0.15s",
            }}
          >
            <legend style={{ fontSize: "0.68rem", color: errors.from ? "#dc2626" : "#6b6b6b", padding: "0 3px", lineHeight: 1, marginLeft: "6px", fontFamily: "'Inter', sans-serif" }}>
              From
            </legend>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%", marginLeft: "0px", minWidth: 0, overflow: "hidden" }}>
              <FlightTakeoffIcon />
              <Typography
                sx={{
                  fontSize: "0.85rem", fontWeight: 600, color: fromCity ? "#111827" : "#9ca3af", flex: 1, minWidth: 0,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", userSelect: "none", fontFamily: "'Inter', sans-serif",
                }}
              >
                {fromCity ? `${fromCity.code} - ${fromCity.name}` : "Leaving From"}
              </Typography>
            </Box>
            {errors.from && (
              <Typography sx={{ fontSize: "0.68rem", color: "#dc2626", position: "absolute", bottom: -18, left: 4, whiteSpace: "nowrap" }}>
                ⚠ {errors.from}
              </Typography>
            )}
          </Box>

          {/* Swap button */}
          <Box sx={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 5, flexShrink: 0 }}>
            <IconButton
              onClick={(e) => { e.stopPropagation(); handleSwap(); }}
              sx={{
                border: "1px solid #d4d4d4", backgroundColor: "#fff", width: 36, height: 36, borderRadius: "50%",
                boxShadow: "0 0 0 3px #fff", "&:hover": { backgroundColor: "#f1f8f1", borderColor: "#2e7d32" }, transition: "all 0.2s",
              }}
            >
              <SwapIcon />
            </IconButton>
          </Box>

          {/* TO fieldset */}
          <Box
            component="fieldset"
            ref={toFieldRef}
            onClick={() => { closeAll(); setToDropOpen(true); }}
            sx={{
              flex: 1, minWidth: 0, border: `1px solid ${errors.to ? "#dc2626" : "#c8c8c8"}`, borderRadius: "12px", m: 0,
              pl: "24px", pr: "10px", height: 50, minHeight: 50, boxSizing: "border-box", display: "flex", alignItems: "center",
              backgroundColor: errors.to ? "#fff5f5" : "#fff", lineHeight: 1, cursor: "pointer", overflow: "hidden",
              "&:hover": { borderColor: errors.to ? "#dc2626" : "#2e7d32" }, transition: "border-color 0.15s",
            }}
          >
            <legend style={{ fontSize: "0.68rem", color: errors.to ? "#dc2626" : "#6b6b6b", padding: "0 3px", lineHeight: 1, marginLeft: "20px", fontFamily: "'Inter', sans-serif" }}>
              To
            </legend>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%", marginLeft: "0px", minWidth: 0, overflow: "hidden" }}>
              <FlightLandIcon />
              <Typography
                sx={{
                  fontSize: "0.85rem", fontWeight: 600, color: toCity ? "#111827" : "#9ca3af", flex: 1, minWidth: 0,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", userSelect: "none", fontFamily: "'Inter', sans-serif",
                }}
              >
                {toCity ? `${toCity.code} - ${toCity.name}` : "Going To"}
              </Typography>
            </Box>
            {errors.to && (
              <Typography sx={{ fontSize: "0.68rem", color: "#dc2626", position: "absolute", bottom: -18, whiteSpace: "nowrap" }}>
                ⚠ {errors.to}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Departure date */}
        <Box
          component="fieldset"
          ref={depDateRef}
          onClick={() => { closeAll(); setDepPickerOpen((o) => !o); }}
          sx={{
            flex: { xs: "1 1 auto", md: "0.7 1 0" }, width: { xs: "100%", md: "auto" }, minWidth: { md: 105 },
            border: "1px solid #c8c8c8", borderRadius: "12px", m: 0, pl: "12px", pr: "10px", height: 50, minHeight: 50,
            boxSizing: "border-box", display: "flex", alignItems: "center", backgroundColor: "#fff", lineHeight: 1,
            cursor: "pointer", overflow: "hidden", "&:hover": { borderColor: "#2e7d32" }, transition: "border-color 0.15s",
          }}
        >
          <legend style={{ fontSize: "0.68rem", color: "#6b6b6b", padding: "0 3px", lineHeight: 1, marginLeft: "0px", fontFamily: "'Inter', sans-serif" }}>
            Departure
          </legend>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%", minWidth: 0, overflow: "hidden" }}>
            <CalendarIcon />
            <Typography
              sx={{
                fontSize: "0.85rem", fontWeight: 600, color: "#111827", flex: 1, minWidth: 0, overflow: "hidden",
                textOverflow: "ellipsis", whiteSpace: "nowrap", userSelect: "none", fontFamily: "'Inter', sans-serif",
              }}
            >
              {formatDisplayDate(departureDate)}
            </Typography>
          </Box>
        </Box>

        {/* Return date */}
        <Box
          component="fieldset"
          ref={retDateRef}
          onClick={() => {
            if (tripType === "oneway") {
              handleRoundTripToggle("roundtrip");
              closeAll();
              setRetPickerOpen(true);
              return;
            }
            closeAll();
            setRetPickerOpen((o) => !o);
          }}
          sx={{
            flex: { xs: "1 1 auto", md: "0.7 1 0" }, width: { xs: "100%", md: "auto" }, minWidth: { md: 105 },
            border: "1px solid #c8c8c8", borderRadius: "12px", m: 0, pl: "12px", pr: "10px", height: 50, minHeight: 50,
            boxSizing: "border-box", display: "flex", alignItems: "center", backgroundColor: tripType === "oneway" ? "#fafafa" : "#fff",
            lineHeight: 1, cursor: "pointer", overflow: "hidden", "&:hover": { borderColor: "#2e7d32" }, transition: "border-color 0.15s",
          }}
        >
          <legend style={{ fontSize: "0.68rem", color: "#6b6b6b", padding: "0 3px", lineHeight: 1, marginLeft: "0px", fontFamily: "'Inter', sans-serif" }}>
            Return
          </legend>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%", minWidth: 0, overflow: "hidden" }}>
            <CalendarIcon />
            <Typography
              sx={{
                fontSize: "0.85rem", fontWeight: 600, color: returnDate ? "#111827" : "#9ca3af", flex: 1, minWidth: 0,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", userSelect: "none", fontFamily: "'Inter', sans-serif",
              }}
            >
              {returnDate ? formatDisplayDate(returnDate) : "Add date"}
            </Typography>
          </Box>
        </Box>

        {/* Travellers & Class */}
        <Box
          component="fieldset"
          ref={paxRef}
          onClick={() => { closeAll(); setPaxDropOpen((o) => !o); }}
          sx={{
            flex: { xs: "1 1 auto", md: "0.9 1 0" }, width: { xs: "100%", md: "auto" }, minWidth: { md: 115 },
            border: "1px solid #c8c8c8", borderRadius: "12px", m: 0, pl: "12px", pr: "10px", height: 50, minHeight: 50,
            boxSizing: "border-box", display: "flex", alignItems: "center", backgroundColor: "#fff", lineHeight: 1,
            cursor: "pointer", overflow: "hidden", "&:hover": { borderColor: "#2e7d32" }, transition: "border-color 0.15s",
          }}
        >
          <legend style={{ fontSize: "0.68rem", color: "#6b6b6b", padding: "0 3px", lineHeight: 1, marginLeft: "0px", fontFamily: "'Inter', sans-serif" }}>
            Travellers & Class
          </legend>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%", minWidth: 0, overflow: "hidden" }}>
            <PassengerIcon />
            <Typography
              sx={{
                fontSize: "0.8rem", fontWeight: 600, color: "#1a1a1a", flex: 1, minWidth: 0, overflow: "hidden",
                textOverflow: "ellipsis", whiteSpace: "nowrap", userSelect: "none", fontFamily: "'Inter', sans-serif",
              }}
            >
              {passengerLabel()}
            </Typography>
            <ChevronDownIcon />
          </Box>
        </Box>

        {/* Search Button */}
      {/* Search Button */}
<Button
  variant="contained"
  disableElevation
  onClick={handleSearch}
  disabled={searchLoading}
  sx={{
    backgroundColor: "#2e7d32",
    color: "#fff",
    fontWeight: 700,
    fontSize: { xs: "0.9rem", sm: "0.95rem" },
    borderRadius: 2.5,
    px: { xs: 3, md: 2.5 },
    py: 0,
    flex: { xs: "1 1 auto", md: "0.8 1 0" },
    width: { xs: "100%", md: "auto" },
    minWidth: { md: 110 },
    height: 46,
    minHeight: 46,
    flexShrink: 0,
    letterSpacing: 0.3,
    "&:hover": { backgroundColor: "#1b5e20" },
    transition: "background 0.2s",
    textTransform: "none",
    fontFamily: "'Inter', sans-serif",
    alignSelf: { xs: "stretch", md: "center" },
  }}
>
  Search
</Button>
      </Box>
    </Paper>
  );

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <>
        <FlightSearchLoader open={searchLoading} />
        {/* ── Hero wrap: tabs + search Paper, bg extends to Paper's middle ── */}
        <Box ref={heroWrapRef} sx={{ position: "relative", mt: { xs: "56px", md: "50px" } }}>
          {/* Full-bleed bg — height auto-measured to reach search Paper's middle.
              🔥 NAYA — stickyHeader wale case me jab header fixed ho jaata hai to
              searchBoxContent viewport-fixed ho jaata hai aur apna khud ka bg le
              leta hai — is layer ki zaroorat nahi rehti us waqt (BusSearch jaisa hi). */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "100vw",
              height: `${blueHeight}px`,
              bgcolor: "#F7FAFF",
              zIndex: 0,
              pointerEvents: "none",
              transition: "height 0.15s ease",
              display: stickyHeader && isFixed ? "none" : "block",
            }}
          />

          {/* ── CategoryTabs ── */}
          {!stickyHeader && (
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <CategoryTabs />
            </Box>
          )}

          {/* ── Main Content ── */}
          {stickyHeader ? (
            <>
              {/* 🔥 Placeholder — sirf iski screen-position record karne ke
                  liye use hoti hai (threshold measure), khud koi
                  height/layout impact nahi rakhta */}
              <Box ref={placeholderRef} sx={{ height: 0 }} />

              <Box
                ref={fixedWrapRef}
                sx={{
                  position: "relative",
                  zIndex: 1,
                  ...(isFixed
                    ? {
                      position: "fixed",
                      top: { xs: 56, md: 40 }, // apne global navbar height ke hisaab se adjust karo
                      left: 0,
                      right: 0,
                    }
                    : {}),
                  zIndex: 1100,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pt: { xs: 1.5, sm: 2, md: 3 },
                  pb: { xs: 1.5, sm: 2, md: 3 },
                  // 🔥 FIXED — ab CategoryTabs jaisa hi SECTION_PX use ho raha
                  // hai (pehle yahan alag "75px" hardcoded tha jo tabs ke
                  // "40px" se match nahi karta tha, isliye laptop pe content
                  // misaligned dikhta tha).
                  px: SECTION_PX,
                  transition: "box-shadow 0.15s",
                }}
              >
                {searchBoxContent}
              </Box>

              {/* 🔥 Spacer — jab header "fixed" ho jaata hai, uski jagah
                  khaali ho jaati hai (fixed elements normal flow se nikal
                  jaate hain), isliye neeche content upar "jump" kar
                  jaata. Ye spacer exactly utni hi height leta hai jitni
                  header ki asli height hai (ResizeObserver se
                  auto-measured), taaki koi jump na ho. */}
              {isFixed && <Box sx={{ height: headerHeight }} />}
            </>
          ) : (
            <Box
              sx={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pt: { xs: 1.5, sm: 2, md: 3 },
                pb: { xs: 1.5, sm: 2, md: 3 },
                // 🔥 same SECTION_PX yahan bhi — CategoryTabs se match rahega
                px: SECTION_PX,
              }}
            >
              {searchBoxContent}
            </Box>
          )}
        </Box>

        {/* City Dropdowns */}
        <CitySearchDropdown
          anchorEl={fromFieldRef.current}
          open={fromDropOpen}
          onClose={() => setFromDropOpen(false)}
          onSelect={(city) => { setFromCity(city); setErrors((e) => ({ ...e, from: "" })); }}
          cities={cities}
          loading={citiesLoading}
          placeholder="Search departure city..."
        />
        <CitySearchDropdown
          anchorEl={toFieldRef.current}
          open={toDropOpen}
          onClose={() => setToDropOpen(false)}
          onSelect={(city) => { setToCity(city); setErrors((e) => ({ ...e, to: "" })); }}
          cities={cities}
          loading={citiesLoading}
          placeholder="Search destination city..."
        />

        {/* Date Pickers */}
        <FlightDatePicker
          anchorEl={depDateRef.current}
          open={depPickerOpen}
          onClose={() => setDepPickerOpen(false)}
          selectedDate={departureDate}
          onChange={(date) => {
            setDepartureDate(date);
            if (returnDate && date >= returnDate) {
              const next = new Date(date);
              next.setDate(next.getDate() + 1);
              setReturnDate(next);
            }
          }}
        />
        <FlightDatePicker
          anchorEl={retDateRef.current}
          open={retPickerOpen}
          onClose={() => setRetPickerOpen(false)}
          selectedDate={returnDate}
          onChange={(date) => setReturnDate(date)}
          minDate={departureDate}
        />

        {/* Passenger & Class Dropdown */}
        <PassengerClassDropdown
          anchorEl={paxRef.current}
          open={paxDropOpen}
          onClose={() => setPaxDropOpen(false)}
          passengers={passengers}
          setPassengers={setPassengers}
          cabinClass={cabinClass}
          setCabinClass={setCabinClass}
        />
      </>
    </ThemeProvider>
  );
}