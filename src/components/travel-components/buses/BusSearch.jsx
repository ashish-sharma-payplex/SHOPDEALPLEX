import {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useMemo,
  useCallback,
} from "react";
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
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import HeadsetMicOutlinedIcon from "@mui/icons-material/HeadsetMicOutlined";
import LuggageOutlinedIcon from "@mui/icons-material/LuggageOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useBusSearch } from "components/travel-hooks/bus/useBusSearch";
import { useBusCitySearch } from "components/travel-hooks/bus/useBusCitySearch";
import { BUS_ENDPOINTS, busFetch } from "travel-api/busApi";
import Lottie from "lottie-react";

// ─── MUI Theme ────────────────────────────────
// Follows the site-wide light / dark mode (outer ThemeProvider in _app.js)
// instead of forcing a light palette. Without `mode`, MUI defaults to light,
// so every OutlinedInput, MenuItem and Typography inside this ThemeProvider
// stayed white-on-white while the rest of the page turned dark.
const buildMuiTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: mode === "dark" ? "#4caf50" : "#2e7d32" },
      ...(mode === "dark"
        ? { background: { default: "#131313", paper: "#1a1a1a" } }
        : { background: { default: "#f5f5f5" } }),
    },
    typography: {
      fontFamily: "Inter, sans-serif",
    },
    components: {
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundColor: "var(--bs-surface)",
            color: "var(--bs-text-strong)",
            "& fieldset": { borderColor: "var(--bs-border)" },
            "&:hover fieldset": { borderColor: "var(--bs-brand-line)" },
            "&.Mui-focused fieldset": { borderColor: "var(--bs-brand-line)" },
          },
          input: {
            color: "var(--bs-text-strong)",
            "&::placeholder": { color: "var(--bs-text-faint)", opacity: 1 },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: { color: "var(--bs-text-muted)" },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: "var(--bs-surface)",
            color: "var(--bs-text-strong)",
            border: "1px solid var(--bs-border)",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none" },
        },
      },
    },
  });

// ─── Constants ────────────────────────────────
const GREEN = "var(--bs-brand)";

// 🔥 NAYA — grey (#f0f4f8) background ki total height (CategoryTabs + search
// bar ke upper-half tak). Isi single value se control hoga ki grey kahan
// tak dikhega. Screenshot ke hisaab se approx values di hain — apne screen
// pe dekh ke thoda tweak kar lena.
const HEADER_BG_HEIGHT = { xs: 150, sm: 165, md: 195 };

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

// ─── SVG Icons ────────────────────────────────
const LocationIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--bs-text-soft)"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="3" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="21" />
    <line x1="3" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="21" y2="12" />
  </svg>
);

const PinIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--bs-text-soft)"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s-8-6.686-8-12a8 8 0 1 1 16 0c0 5.314-8 12-8 12z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

const SwapIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--bs-brand-strong-text)"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transform: "rotate(90deg)" }}
  >
    <path d="M7 16V4m0 0L3 8m4-4l4 4" />
    <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
  </svg>
);

const CalendarIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--bs-text-soft)"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const UserIcon = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="var(--bs-brand-strong-text)"
    stroke="var(--bs-brand-strong-text)"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// ─── Date Helpers ─────────────────────────────
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDateChips(centerDate) {
  const result = [];
  for (let i = -1; i <= 1; i++) {
    const d = new Date(centerDate);
    d.setDate(d.getDate() + i);
    result.push({ dayLabel: DAYS[d.getDay()], date: d, offset: i });
  }
  return result;
}

function formatDate(date) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// ─── BusCityDropdown ──────────────────────────
const BusCityDropdown = ({ open, onClose, anchorEl, onSelect, label }) => {
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const { query, setQuery, cities, loading } = useBusCitySearch(open);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // ✅ FIX — dropdown ab `position: fixed` hai aur viewport coords use karta
  // hai. Pehle `absolute + scrollY` tha, isliye sticky (fixed) search header
  // ke saath scroll karne par dropdown apni jagah se hat jaata tha.
  const updatePosition = useCallback(() => {
    if (!anchorEl) return;
    const rect = anchorEl.getBoundingClientRect();
    // anchor screen se bahar chala gaya -> dropdown band
    if (rect.bottom < 0 || rect.top > window.innerHeight) {
      onClose();
      return;
    }
    const dropdownWidth = Math.min(320, window.innerWidth - 32);
    const padding = 12;
    let left = rect.left + rect.width / 2 - dropdownWidth / 2;
    left = Math.max(
      padding,
      Math.min(left, window.innerWidth - dropdownWidth - padding),
    );
    setPosition({ top: rect.bottom + 8, left });
  }, [anchorEl, onClose]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        anchorEl &&
        !anchorEl.contains(e.target)
      )
        onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose, anchorEl]);

  if (!open) return null;

  return (
    <div
      ref={dropdownRef}
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        width: Math.min(320, window.innerWidth - 32),
        maxWidth: "calc(100vw - 32px)",
        right: "auto",
        zIndex: 9999,
        background: "var(--bs-surface)",
        borderRadius: 16,
        border: "1px solid var(--bs-border-soft)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
        overflow: "hidden",
      }}
    >
      {/* Search Input */}
      <div style={{ padding: "14px 14px 10px" }}>
        <div style={{ position: "relative" }}>
          <svg
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--bs-text-faint)",
            }}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder={`Search ${label}`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 36px",
              borderRadius: 10,
              border: "1.5px solid var(--bs-border)",
              outline: "none",
              fontSize: 14,
              color: "var(--bs-text-strong)",
              boxSizing: "border-box",
              background: "var(--bs-surface-subtle)",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = "var(--bs-brand-line)")
            }
            onBlur={(e) => (e.target.style.borderColor = "var(--bs-border)")}
          />
        </div>
      </div>

      {/* Section Label */}
      <div
        style={{
          padding: "8px 16px 6px",
          fontSize: 13,
          fontWeight: 700,
          color: "var(--bs-text-body)",
        }}
      >
        {query ? "Search Results" : "Popular Cities"}
      </div>

      {/* City List */}
      <div style={{ paddingBottom: 8, maxHeight: 280, overflowY: "auto" }}>
        {loading ? (
          <div
            style={{
              padding: "16px",
              textAlign: "center",
              color: "var(--bs-text-faint)",
              fontSize: 14,
            }}
          >
            Searching...
          </div>
        ) : cities.length > 0 ? (
          cities.map((city, idx) => (
            <div key={city.CityId}>
              <div
                onClick={() => {
                  onSelect({ id: city.CityId, name: city.CityName });
                  onClose();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "13px 16px",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background =
                    "var(--bs-surface-subtle)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--bs-text-faint)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0 }}
                >
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "var(--bs-text-strong)",
                  }}
                >
                  {city.CityName}
                </span>
              </div>
              {idx < cities.length - 1 && (
                <div
                  style={{
                    height: 1,
                    background: "var(--bs-surface-muted)",
                    margin: "0 16px",
                  }}
                />
              )}
            </div>
          ))
        ) : (
          <div
            style={{
              padding: "16px",
              textAlign: "center",
              color: "var(--bs-text-faint)",
              fontSize: 14,
            }}
          >
            No city found
          </div>
        )}
      </div>
    </div>
  );
};

// ─── BusDatePicker ────────────────────────────
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// ─── Full-screen Search Loader (Lottie) ───────
const BusSearchLoader = ({ open }) => {
  if (!open) return null;
  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        bgcolor: "var(--bs-surface-glass)",
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <Box sx={{ width: { xs: 220, sm: 180 }, height: { xs: 220, sm: 180 } }}>
        <Lottie path="/buslottie.json" loop autoplay />
      </Box>
      <Box sx={{ textAlign: "center" }}>
        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 700,
            color: "var(--bs-text-strong)",
            mb: 0.5,
          }}
        >
          Searching Best Buses...
        </Typography>
        <Typography sx={{ fontSize: 14, color: "var(--bs-text-muted)" }}>
          Checking availability across operators
        </Typography>
      </Box>
    </Box>
  );
};

const DAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  const d = new Date(year, month, 1).getDay();
  return (d + 6) % 7;
}
function isSameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const BusDatePicker = ({ anchorEl, open, onClose, selectedDate, onChange }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewMonth, setViewMonth] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const [pos, setPos] = useState({ top: 0, left: 0 });

  // ✅ FIX — fixed positioning (viewport coords), sticky header ke saath sahi
  const updatePos = useCallback(() => {
    if (!anchorEl) return;
    const rect = anchorEl.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) {
      onClose();
      return;
    }
    const isMobile = window.innerWidth < 768;
    setPos({
      top: rect.bottom + 8,
      left: isMobile
        ? 8
        : Math.max(12, Math.min(rect.left, window.innerWidth - 300)),
    });
  }, [anchorEl, onClose]);

  useEffect(() => {
    if (open && anchorEl) {
      const base = selectedDate || today;
      setViewMonth({ year: base.getFullYear(), month: base.getMonth() });
    }
  }, [open, anchorEl]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePos();
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [open, updatePos]);

  useEffect(() => {
    if (!open) return;
    const handle = (e) => {
      const popup = document.getElementById("bus-drp-popup");
      if (
        anchorEl &&
        !anchorEl.contains(e.target) &&
        popup &&
        !popup.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open, onClose, anchorEl]);

  const canGoPrev =
    viewMonth.year > today.getFullYear() ||
    (viewMonth.year === today.getFullYear() &&
      viewMonth.month > today.getMonth());

  const goPrev = () => {
    if (!canGoPrev) return;
    setViewMonth((prev) => {
      let m = prev.month - 1;
      let y = prev.year;
      if (m < 0) {
        m = 11;
        y--;
      }
      if (
        y < today.getFullYear() ||
        (y === today.getFullYear() && m < today.getMonth())
      ) {
        return { year: today.getFullYear(), month: today.getMonth() };
      }
      return { year: y, month: m };
    });
  };

  const goNext = () => {
    setViewMonth((prev) => {
      let m = prev.month + 1;
      let y = prev.year;
      if (m > 11) {
        m = 0;
        y++;
      }
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
      id="bus-drp-popup"
      elevation={0}
      sx={{
        position: "fixed",
        top: pos.top,

        left: { xs: 8, md: pos.left },
        right: { xs: 8, md: "auto" },

        zIndex: 9999,
        borderRadius: "14px",

        p: { xs: "14px 12px", md: "18px 20px" },

        boxShadow: "0 6px 25px rgba(0,0,0,0.12)",

        border: "1px solid var(--bs-border-soft)",
        bgcolor: "var(--bs-surface)",

        width: { xs: "calc(100vw - 20px)", md: "auto" },
        minWidth: { md: 280 },

        maxWidth: { xs: "100%", md: "none" },

        boxSizing: "border-box",
      }}
    >
      {/* Month header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.5,
        }}
      >
        <IconButton
          onClick={goPrev}
          disabled={!canGoPrev}
          size="small"
          sx={{
            width: 28,
            height: 28,
            color: canGoPrev
              ? "var(--bs-text-muted)"
              : "var(--bs-text-disabled)",
            "&:hover": canGoPrev
              ? {
                  bgcolor: "var(--bs-surface-subtle)",
                  color: "var(--bs-text-strong)",
                }
              : {},
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: 18 }} />
        </IconButton>

        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "0.95rem",
            color: "var(--bs-text-strong)",
          }}
        >
          {MONTH_NAMES[month]} {year}
        </Typography>

        <IconButton
          onClick={goNext}
          size="small"
          sx={{
            width: 28,
            height: 28,
            color: "var(--bs-text-muted)",
            "&:hover": {
              bgcolor: "var(--bs-surface-subtle)",
              color: "var(--bs-text-strong)",
            },
          }}
        >
          <ChevronRightIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* Day labels */}
      <Box
        sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", mb: 0.5 }}
      >
        {DAY_LABELS.map((d) => (
          <Typography
            key={d}
            sx={{
              textAlign: "center",
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "var(--bs-text-faint)",
              py: 0.5,
            }}
          >
            {d}
          </Typography>
        ))}
      </Box>

      {/* Day cells */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {cells.map((date, idx) => {
          if (!date) return <Box key={`empty-${idx}`} />;
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);
          const isPast = date < today && !isToday;

          return (
            <Box
              key={date.toISOString()}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                onClick={() => {
                  if (!isPast) {
                    onChange(date);
                    onClose();
                  }
                }}
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: isPast ? "default" : "pointer",
                  bgcolor: isSelected ? GREEN : "transparent",
                  my: 0.3,
                  transition: "background 0.12s, transform 0.1s",
                  "&:hover": !isPast
                    ? {
                        bgcolor: isSelected ? GREEN : "var(--bs-success-bg)",
                        transform: "scale(1.08)",
                      }
                    : {},
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.85rem",
                    fontWeight: isSelected || isToday ? 700 : 400,
                    color: isSelected
                      ? "var(--bs-text-on-brand)"
                      : isPast
                      ? "var(--bs-text-disabled)"
                      : isToday
                      ? GREEN
                      : "var(--bs-text-strong)",
                    lineHeight: 1,
                    userSelect: "none",
                  }}
                >
                  {date.getDate()}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Footer */}
      <Box sx={{ textAlign: "center", mt: 2 }}>
        <Typography
          sx={{
            fontSize: "0.78rem",
            fontFamily: "Inter, sans-serif",
            color: "var(--bs-text-faint)",
          }}
        >
          {selectedDate
            ? selectedDate.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "Select date of journey"}
        </Typography>
      </Box>
    </Paper>
  );
};

// ─── CategoryTabs ─────────────────────────────
// 🔥 UPDATED — bgcolor yahan se hata diya. Grey background ab BusSearch ke
// return me ek single absolute layer se aayega (HEADER_BG_HEIGHT), taaki
// woh layer CategoryTabs + searchbar ke upper-half tak controlled height
// me spread ho sake. Yahan bgcolor rakhne se ye apne hi box tak limited
// reh jaata tha aur searchbar tak bleed nahi karta tha.
const CategoryTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box
      sx={{
        pt: { xs: 1.5, md: 4 },
        pb: { xs: 1.5, md: 1 },
        px: 2,
        mt: { xs: "56px", md: "50px" },
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
                bgcolor: isActive ? "var(--bs-surface)" : "transparent",
                boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.10)" : "none",
                transition: "all 0.18s",
                "&:hover": {
                  bgcolor: isActive
                    ? "var(--bs-surface)"
                    : "var(--bs-surface-glass-hover)",
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
                  color: isActive
                    ? "var(--bs-text-strong)"
                    : "var(--bs-text-neutral)",
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

// ─── BusSearch (Main Component) ───────────────
export default function BusSearch({
  initialFrom = null,
  initialTo = null,
  initialDate = null,
  // 🔥 NAYA — sirf tab true karo jab is component ko results/seat-selection
  // page pe render kar rahe ho (BusResultsPage). Normal /buses page pe
  // ye false hi rahega, taaki wahan ka layout/behaviour bilkul same rahe.
  stickyHeader = false,
}) {
  const theme = useTheme();
  const muiTheme = useMemo(
    () => buildMuiTheme(theme.palette.mode),
    [theme.palette.mode],
  );
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();

  // 🔥 NAYA — scroll-based "fixed" positioning, "sticky" ki jagah.
  // WAJAH: parent layout (Next.js _app.js / globals.css) me kahin overflow
  // ya transform laga hone ki wajah se "position: sticky" reliably kaam
  // nahi karta. "position: fixed" viewport ke against hota hai — koi bhi
  // ancestor overflow/transform ho, ye hamesha upar chipka rahega.
  // Sirf `stickyHeader` true hone par hi activate hota hai.
  const [isFixed, setIsFixed] = useState(false);
  const placeholderRef = useRef(null); // header ki original screen-position record karne ke liye
  const searchBoxRef = useRef(null); // header ki actual height measure karne ke liye
  const stickyThreshold = useRef(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [blueHeight, setBlueHeight] = useState(200);

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
      if (searchBoxRef.current) {
        setHeaderHeight(searchBoxRef.current.getBoundingClientRect().height);
      }
    };
    measureHeight();

    const ro = new ResizeObserver(measureHeight);
    if (searchBoxRef.current) ro.observe(searchBoxRef.current);
    window.addEventListener("resize", measureHeight);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureHeight);
    };
  }, [stickyHeader]);

  useEffect(() => {
    if (initialFrom) {
      setFromCity(initialFrom);
      setErrors((e) => ({ ...e, from: "" }));
    }
  }, [initialFrom?.id, initialFrom?.name]);

  useEffect(() => {
    if (initialTo) {
      setToCity(initialTo);
      setErrors((e) => ({ ...e, to: "" }));
    }
  }, [initialTo?.id, initialTo?.name]);

  // ── City state ──
  const [fromCity, setFromCity] = useState(initialFrom);
  const [toCity, setToCity] = useState(initialTo);
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const fromRef = useRef(null);
  const toRef = useRef(null);

  // ── Validation errors ──
  const [errors, setErrors] = useState({ from: "", to: "" });

  // ── Date state ──
  const [selectedDate, setSelectedDate] = useState(() => {
    if (initialDate) {
      const d = new Date(initialDate);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const dateFieldRef = useRef(null);
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  // ── Bus search hook ──
  const { search: searchBuses, loading: busLoading } = useBusSearch();

  const dateChips = getDateChips(selectedDate);

  const handleSwap = () => {
    setFromCity(toCity);
    setToCity(fromCity);
  };

  // ✅ FIX — Popular Routes cards navigate here with a preset city name
  // (route state) since they only know city names, not city IDs. Resolve
  // those names against the city-list API and pre-fill the From/To
  // fields so the search is one click away instead of the cards doing
  // nothing at all.
  useEffect(() => {
    const presetFromName = location.state?.presetFromCityName;
    const presetToName = location.state?.presetToCityName;
    if (!presetFromName && !presetToName) return;

    let cancelled = false;

    const resolveCity = async (name) => {
      if (!name) return null;
      try {
        const data = await busFetch(BUS_ENDPOINTS.CITY_LIST, {
          params: { page: 1, page_size: 20, search: name },
        });
        const results = data?.data?.results ?? data?.results ?? [];
        const match =
          results.find(
            (c) => c.CityName?.toLowerCase() === name.toLowerCase(),
          ) || results[0];
        return match ? { id: match.CityId, name: match.CityName } : null;
      } catch {
        return null;
      }
    };

    (async () => {
      const [resolvedFrom, resolvedTo] = await Promise.all([
        resolveCity(presetFromName),
        resolveCity(presetToName),
      ]);
      if (cancelled) return;
      if (resolvedFrom) setFromCity(resolvedFrom);
      if (resolvedTo) setToCity(resolvedTo);
      navigate(location.pathname, { replace: true, state: {} });
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const transformBus = (bus, fromCityName, toCityName, traceId) => {
    const dep = new Date(bus.departure_time);
    const arr = new Date(bus.arrival_time);
    const durationMs = arr - dep;
    const hrs = Math.floor(Math.abs(durationMs) / 3600000);
    const mins = Math.floor((Math.abs(durationMs) % 3600000) / 60000);

    return {
      id: bus.result_index,
      traceId: traceId,
      resultIndex: bus.result_index,
      operatorName: bus.operator,
      busType: bus.bus_type,
      departureTime: dep.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      departureDate: dep.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      }),
      arrivalTime: arr.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      arrivalDate: arr.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      }),
      from: fromCityName || "",
      to: toCityName || "",
      duration: `${hrs}h ${mins}m`,
      price: Math.round(bus.price),
      seatsAvailable: bus.available_seats,
      priceTiers: [],
      footerTags: ["Boarding & Dropping Points", "Cancellation Policy"],
      boardingPoints: (bus.raw?.BoardingPointsDetails || []).map((p) => ({
        name: p.CityPointName,
        subLabel: p.CityPointLocation,
        time: new Date(p.CityPointTime).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      })),
      droppingPoints: (bus.raw?.DroppingPointsDetails || []).map((p) => ({
        name: p.CityPointName,
        subLabel: p.CityPointLocation,
        time: new Date(p.CityPointTime).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      })),
      seatLayout: [],

      cancellationPolicies: (bus.raw?.CancellationPolicies || [])
        .filter((p) => p.CancellationCharge != null)
        .map((p) => ({
          charge: p.CancellationCharge,
          chargeType: p.CancellationChargeType,
          policyString: p.PolicyString,
        })),

      busFacilities: {
        liveTracking: !!bus.raw?.LiveTrackingAvailable,
        mTicket: !!bus.raw?.MTicketEnabled,
        idProofRequired: !!bus.raw?.IdProofRequired,
        partialCancellation: !!bus.raw?.PartialCancellationAllowed,
      },
    };
  };

  const handleSearch = async () => {
    const newErrors = { from: "", to: "" };
    let hasError = false;
    if (!fromCity) {
      newErrors.from = "Please select departure city";
      hasError = true;
    }
    if (!toCity) {
      newErrors.to = "Please select destination city";
      hasError = true;
    }
    setErrors(newErrors);
    if (hasError) return;

    try {
      const data = await searchBuses({
        sourceId: fromCity.id,
        destinationId: toCity.id,
        date: selectedDate,
      });

      const resultsData = data?.data?.results;
      const traceId = resultsData?.trace_id;
      const rawBuses = resultsData?.results ?? [];

      const transformedBuses = rawBuses.map((bus) =>
        transformBus(bus, fromCity.name, toCity.name, traceId),
      );

      navigate("/buses/results", {
        state: {
          buses: transformedBuses,
          fromCity,
          toCity,
          date: selectedDate.toISOString(),
        },
      });
    } catch {
      alert("Something went wrong. Please try again.");
    }
  };

  // 🔥 Search Paper box — ye hi sticky/fixed hoga jab stickyHeader=true
  const searchBoxContent = (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: 1235,
        mx: "auto",
        borderRadius: { xs: 3, sm: 4 },
        border: "1px solid var(--bs-border)",
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2.5, sm: 3 },
        position: "relative",
        backgroundColor: "var(--bs-surface)",
      }}
    >
      {/* ── Header ──
                🔥 NAYA — jab stickyHeader true hai AUR header fixed/sticky ho
                chuka hai (isFixed=true), tab ye "Search Buses" title aur
                subtitle wala block hide ho jayega taaki sticky bar compact
                dikhe. Normal (non-sticky) page pe ya jab tak scroll na hua
                ho, ye hamesha visible rahega — koi behaviour change nahi. */}
      {!(stickyHeader && isFixed) && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: {
              xs: "center",
              sm: "flex-start",
            },
            textAlign: {
              xs: "center",
              sm: "left",
            },
            mb: { xs: 2, sm: 2.5 },
          }}
        >
          <Box>
            <Typography
              variant="h5"
              fontWeight={700}
              fontFamily="Inter, sans-serif"
              fontSize={{ xs: "1.25rem", sm: "1.5rem" }}
              color="var(--bs-text-strong)"
              lineHeight={1.2}
            >
              Search Buses
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              fontSize={{ xs: "0.78rem", sm: "0.875rem" }}
              fontFamily="Inter, sans-serif"
              mt={0.4}
            >
              Enjoy hassle free bookings with Dealplex
            </Typography>
          </Box>
        </Box>
      )}

      {/* ── Search Row ── */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "stretch", md: "center" },
          gap: { xs: 1.5, md: 1 },
          "& fieldset": { padding: 0 },
        }}
      >
        {/* FROM + SWAP + TO */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "row", md: "row" },
            flex: { md: "2.6 1 0" },
            alignItems: "center",
            position: "relative",
            gap: 0,
            mt: {
              xs: 0,
              md: "-6px",
            },
          }}
        >
          {/* FROM fieldset */}
          <Box
            ref={fromRef}
            component="fieldset"
            onClick={() => {
              setFromOpen((o) => !o);
              setToOpen(false);
            }}
            sx={{
              flex: 1,
              border: `1px solid ${
                errors.from
                  ? "var(--bs-danger-line)"
                  : "var(--bs-border-strong)"
              }`,
              borderRadius: "12px",
              m: 0,
              pl: {
                xs: "10px",
                sm: "14px",
              },
              pr: {
                xs: "20px",
                sm: "30px",
              },
              height: 50,
              minHeight: 50,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              backgroundColor: errors.from
                ? "var(--bs-danger-bg)"
                : "var(--bs-surface)",
              minWidth: 0,
              mr: "8px",
              lineHeight: 1,
              cursor: "pointer",
              "&:hover": {
                borderColor: errors.from
                  ? "var(--bs-danger-line)"
                  : "var(--bs-brand-line)",
              },
              transition: "border-color 0.15s",
            }}
          >
            <legend
              style={{
                fontSize: "0.72rem",
                color: errors.from
                  ? "var(--bs-danger-text)"
                  : "var(--bs-text-neutral)",
                padding: "0 3px",
                fontFamily: "Inter, sans-serif",
                lineHeight: 1,
                marginLeft: "30px",
              }}
            >
              From
            </legend>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                width: "100%",
                marginLeft: {
                  xs: "8px",
                  sm: "18px",
                },
              }}
            >
              <LocationIcon />
              <Typography
                sx={{
                  fontSize: "0.95rem",
                  fontFamily: "Inter, sans-serif",
                  color: fromCity
                    ? "var(--bs-text-strong)"
                    : "var(--bs-text-faint)",
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  userSelect: "none",
                }}
              >
                {fromCity ? fromCity.name : "Leaving From"}
              </Typography>
            </Box>
            {errors.from && (
              <Typography
                sx={{
                  fontSize: "0.68rem",
                  color: "var(--bs-danger-text)",
                  position: "absolute",
                  bottom: -18,
                  left: 4,
                  whiteSpace: "nowrap",
                }}
              >
                ⚠ {errors.from}
              </Typography>
            )}
          </Box>

          {/* Swap button */}
          <Box
            sx={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 5,
              flexShrink: 0,
            }}
          >
            <IconButton
              onClick={handleSwap}
              sx={{
                border: "1px solid var(--bs-border)",
                backgroundColor: "var(--bs-surface)",
                width: {
                  xs: 34,
                  sm: 40,
                },
                height: {
                  xs: 34,
                  sm: 40,
                },
                borderRadius: "50%",
                boxShadow: "0 0 0 3px var(--bs-swap-ring)",
                "&:hover": {
                  backgroundColor: "var(--bs-success-bg)",
                  borderColor: "var(--bs-brand-line)",
                },
                transition: "all 0.2s",
              }}
            >
              <SwapIcon />
            </IconButton>
          </Box>

          {/* TO fieldset */}
          <Box
            ref={toRef}
            component="fieldset"
            onClick={() => {
              setToOpen((o) => !o);
              setFromOpen(false);
            }}
            sx={{
              flex: 1,
              border: `1px solid ${
                errors.to ? "var(--bs-danger-line)" : "var(--bs-border-strong)"
              }`,
              borderRadius: "12px",
              m: 0,
              pl: {
                xs: "20px",
                sm: "30px",
              },
              pr: {
                xs: "10px",
                sm: "14px",
              },
              height: 50,
              minHeight: 50,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              backgroundColor: errors.to
                ? "var(--bs-danger-bg)"
                : "var(--bs-surface)",
              minWidth: 0,
              lineHeight: 1,
              cursor: "pointer",
              "&:hover": {
                borderColor: errors.to
                  ? "var(--bs-danger-line)"
                  : "var(--bs-brand-line)",
              },
              transition: "border-color 0.15s",
            }}
          >
            <legend
              style={{
                fontSize: "0.72rem",
                color: errors.to
                  ? "var(--bs-danger-text)"
                  : "var(--bs-text-neutral)",
                padding: "0 3px",
                fontFamily: "Inter, sans-serif",
                lineHeight: 1,
                marginLeft: "44px",
              }}
            >
              To
            </legend>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                width: "100%",
                marginLeft: "24px",
              }}
            >
              <PinIcon />
              <Typography
                sx={{
                  fontSize: "0.95rem",
                  color: toCity
                    ? "var(--bs-text-strong)"
                    : "var(--bs-text-faint)",
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  userSelect: "none",
                }}
              >
                {toCity ? toCity.name : "Going To"}
              </Typography>
            </Box>
            {errors.to && (
              <Typography
                sx={{
                  fontSize: "0.68rem",
                  color: "var(--bs-danger-text)",
                  position: "absolute",
                  bottom: -18,
                }}
              >
                ⚠ {errors.to}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Date field */}
        <Box
          ref={dateFieldRef}
          onClick={() => setDatePickerOpen((o) => !o)}
          sx={{
            position: "relative",
            border: "1px solid var(--bs-border-strong)",
            borderRadius: "12px",
            height: 45,
            display: "flex",
            alignItems: "center",
            px: 2,
            gap: 1,
            backgroundColor: "var(--bs-surface)",
            flex: { xs: "1 1 auto", md: "0.7 1 0" },
            width: { xs: "100%", md: "auto" },
            minWidth: { md: 140 },
            boxSizing: "border-box",
            cursor: "pointer",
            mb: {
              xs: 0.5,
              sm: 0,
            },
            "&:hover": { borderColor: "var(--bs-brand-line)" },
            transition: "border-color 0.15s",
          }}
        >
          <Box
            component="legend"
            sx={{
              position: "absolute",
              top: -9,
              left: 10,
              fontSize: "0.72rem",
              fontFamily: "Inter, sans-serif",
              color: "var(--bs-text-neutral)",
              backgroundColor: "var(--bs-surface)",
              px: 0.5,
              lineHeight: 1,
            }}
          >
            Date of Journey
          </Box>
          <CalendarIcon />
          <Typography
            sx={{
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "var(--bs-text-strong)",
              fontFamily: "inherit",
            }}
          >
            {formatDate(selectedDate)}
          </Typography>
        </Box>

        {/* Date chips */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            flexWrap: {
              xs: "wrap",
              sm: "nowrap",
            },
            flex: { xs: "1 1 auto", md: "1 1 0" },
            width: { xs: "100%", md: "auto" },
            justifyContent: { md: "center" },
          }}
        >
          {dateChips.map(({ dayLabel, date, offset }) => {
            const isSelected = offset === 0;
            const isPastChip = date < todayDate;
            return (
              <Box
                key={offset}
                onClick={() => {
                  if (isPastChip) return;
                  const newDate = new Date(selectedDate);
                  newDate.setDate(newDate.getDate() + offset);
                  setSelectedDate(newDate);
                }}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: { xs: 50, sm: 54 },
                  height: { xs: 44, sm: 45 },
                  borderRadius: 2,
                  border: isSelected
                    ? "1.5px solid var(--bs-border-strong)"
                    : "1px solid var(--bs-border)",
                  backgroundColor: isSelected
                    ? "var(--bs-surface-muted)"
                    : "var(--bs-surface)",
                  cursor: isPastChip ? "default" : "pointer",
                  opacity: isPastChip ? 0.4 : 1,
                  transition: "all 0.15s",
                  "&:hover": !isPastChip
                    ? {
                        borderColor: "var(--bs-brand-line)",
                        backgroundColor: "var(--bs-success-bg)",
                      }
                    : {},
                  flexShrink: 0,
                }}
              >
                <Typography
                  fontSize="0.9rem"
                  fontWeight={700}
                  color="var(--bs-text-strong)"
                  lineHeight={1.2}
                >
                  {String(date.getDate()).padStart(2, "0")}
                </Typography>
                <Typography
                  fontSize="0.7rem"
                  color="text.secondary"
                  lineHeight={1.2}
                >
                  {dayLabel}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Search Button */}
        {/* Search Button */}
        <Button
          variant="contained"
          disableElevation
          onClick={handleSearch}
          disabled={busLoading}
          sx={{
            backgroundColor: "var(--bs-brand)",
            color: "var(--bs-text-on-brand)",
            fontWeight: 700,
            fontSize: { xs: "0.9rem", sm: "0.95rem" },
            borderRadius: 2.5,
            px: { xs: 3, md: 2.5 },
            py: 0,
            flex: { xs: "1 1 auto", md: "0.7 1 0" },
            width: { xs: "100%", md: "auto" },
            minWidth: { md: 110 },
            height: 46,
            minHeight: 46,
            flexShrink: 0,
            letterSpacing: 0.3,
            "&:hover": { backgroundColor: "var(--bs-brand-hover)" },
            transition: "background 0.2s",
            textTransform: "none",
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
      <>
        <BusSearchLoader open={busLoading} />
        {/* 🔥 NAYA — CategoryTabs aur searchbar ke upper-half tak grey
                    (#f0f4f8) background ek hi common wrapper se aayega. Isse
                    pehle CategoryTabs ka apna bgcolor tha jo sirf uske khud
                    ke box tak limited tha — searchbar ke beech tak bleed
                    nahi karta tha. Ab ek single absolute layer (HEADER_BG_HEIGHT
                    height ki) CategoryTabs + Paper ke upper hisse ko cover
                    karta hai, neeche wala hissa white/parent-bg rahega. */}
        <Box sx={{ position: "relative" }}>
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "100vw",
              height: `${blueHeight}px`,
              bgcolor: "var(--bs-page-blue)",
              zIndex: 0,
              pointerEvents: "none",
              transition: "height 0.15s ease",
              display: stickyHeader && isFixed ? "none" : "block",
            }}
          />

          {/* ── CategoryTabs ── */}
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <CategoryTabs />
          </Box>

          {/* ── Main Content ── */}
          {stickyHeader ? (
            <>
              {/* 🔥 Placeholder — sirf iski screen-position record karne ke
                                liye use hoti hai (threshold measure), khud koi
                                height/layout impact nahi rakhta */}
              <Box ref={placeholderRef} sx={{ height: 0 }} />

              <Box
                ref={searchBoxRef}
                sx={{
                  position: "relative",
                  zIndex: 1,
                  ...(isFixed
                    ? {
                        position: "fixed",
                        top: { xs: 56, md: 43 }, // apne global navbar height ke hisaab se adjust karo
                        left: 0,
                        right: 0,
                      }
                    : {}),
                  zIndex: 1100,
                  // ✅ fixed hote hi solid strip, warna results neeche se jhalakte hain
                  backgroundColor: isFixed
                    ? "var(--bs-sticky-bg)"
                    : "transparent",
                  // boxShadow: isFixed ? "0 2px 10px rgba(0,0,0,0.06)" : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  p: { xs: 1.5, sm: 2, md: 3 },
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
                p: { xs: 1.5, sm: 2, md: 3 },
              }}
            >
              {searchBoxContent}
            </Box>
          )}
        </Box>

        {/* ── BusDatePicker ── */}
        <BusDatePicker
          anchorEl={dateFieldRef.current}
          open={datePickerOpen}
          onClose={() => setDatePickerOpen(false)}
          selectedDate={selectedDate}
          onChange={(date) => {
            setSelectedDate(date);
          }}
        />

        {/* ── From City Dropdown ── */}
        <BusCityDropdown
          open={fromOpen}
          onClose={() => setFromOpen(false)}
          anchorEl={fromRef.current}
          onSelect={(city) => {
            setFromCity(city);
            setErrors((e) => ({ ...e, from: "" }));
          }}
          label="departure city"
        />

        {/* ── To City Dropdown ── */}
        <BusCityDropdown
          open={toOpen}
          onClose={() => setToOpen(false)}
          anchorEl={toRef.current}
          onSelect={(city) => {
            setToCity(city);
            setErrors((e) => ({ ...e, to: "" }));
          }}
          label="destination city"
        />
      </>
    </ThemeProvider>
  );
}
