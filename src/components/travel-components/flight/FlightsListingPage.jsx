// src\components\travel-components\flight\FlightsListingPage.jsx
import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CompareArrows from "@mui/icons-material/CompareArrows";

import {
  Box,
  Button,
  Typography,
  Paper,
  Divider,
  Checkbox,
  FormControlLabel,
  Slider,
  Drawer,
  IconButton,
  Skeleton,
  Dialog,
  DialogContent,
} from "@mui/material";
import {
  Close,
  FlightTakeoff,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import FlightSearch from "./FlightSearch";
import { useCalendarFare } from "components/travel-hooks/flight/useCalanderFare";
import {
  normalizeFlightResponse,
  useFlightSearch,
} from "components/travel-hooks/flight/useFlightSearch";
import Lottie from "lottie-react";

const planlogo = "/sidebarplanlogo.svg";

const AIRLINE_LOGO_MAP = {
  indigo: "/navbaricons/indigo.png",
  "6e": "/navbaricons/indigo.png",
  spicejet: "/navbaricons/spicejet.svg",
  sg: "/navbaricons/spicejet.png",
  "air india": "/navbaricons/airindia.png",
  ai: "/navbaricons/airindia.png",
  "air india express": "/navbaricons/airindiaexpress.png",
  ix: "/navbaricons/airindia.png",
  "air asia": "/navbaricons/airasia.png",
  i5: "/navbaricons/airasia.png",
  "fly dubai": "/navbaricons/flydubai.png",
  flydubai: "/navbaricons/flydubai.png",
  fz: "/navbaricons/flydubai.png",
  "go air": "/navbaricons/goair.png",
  goair: "/navbaricons/goair.png",
  g8: "/navbaricons/goair.png",
  "akasa air": "/navbaricons/akasaa.png",
};

const getAirlineLogo = (name = "", code = "") => {
  const key = name.toLowerCase();
  const codeKey = code.toLowerCase();
  return AIRLINE_LOGO_MAP[key] || AIRLINE_LOGO_MAP[codeKey] || null;
};

const AirlineLogo = ({ name, code, size = 36 }) => {
  const [imgError, setImgError] = useState(false);
  const logoSrc = getAirlineLogo(name, code);
  const colors = {
    indigo: "#2B3D8F",
    "6e": "#2B3D8F",
    spicejet: "#FF0000",
    sg: "#FF0000",
    "air india": "#E31837",
    ai: "#E31837",
    "akasa air": "#FF6B00",
  };
  const fallbackBg =
    colors[name?.toLowerCase()] || colors[code?.toLowerCase()] || "#555";
  const initials = (code || name || "??")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (logoSrc && !imgError) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: "7.5px",
          overflow: "hidden",
          flexShrink: 0,
          border: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#fff",
        }}
      >
        <Box
          component="img"
          src={logoSrc}
          alt={name}
          onError={() => setImgError(true)}
          sx={{ width: "100%", height: "100%", objectFit: "contain", p: 0 }}
        />
      </Box>
    );
  }
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "7.5px",
        bgcolor: fallbackBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: size * 0.3,
        flexShrink: 0,
      }}
    >
      {initials}
    </Box>
  );
};



const AirplaneLoader = ({ onDismiss }) => {
  const [showDismiss, setShowDismiss] = useState(false);
  React.useEffect(() => {
    const timer = setTimeout(() => setShowDismiss(true), 8000);
    return () => clearTimeout(timer);
  }, []);
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
      {showDismiss && (
        <Typography
          onClick={onDismiss}
          sx={{
            fontSize: 13,
            color: "#9ca3af",
            cursor: "pointer",
            textDecoration: "underline",
            mt: 1,
            "&:hover": { color: "#6b7280" },
          }}
        >
          Taking too long? Dismiss
        </Typography>
      )}
    </Box>
  );
};



const SearchErrorBanner = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <Box
      sx={{
        bgcolor: "#FEF2F2",
        border: "1px solid #FECACA",
        borderRadius: "10px",
        px: 3,
        py: 1.5,
        mx: { xs: 2, md: 4 },
        mt: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Typography sx={{ fontSize: 14, color: "#991B1B", fontWeight: 500 }}>
        ⚠ {message}
      </Typography>
      <Typography
        onClick={onClose}
        sx={{
          fontSize: 20,
          color: "#991B1B",
          cursor: "pointer",
          ml: 2,
          lineHeight: 1,
          "&:hover": { opacity: 0.7 },
        }}
      >
        ×
      </Typography>
    </Box>
  );
};

/* ───────────────────────── Flight Details POPUP (Dialog) ───────────────────────── */
const FlightDetailsPopup = ({ open, onClose, flight }) => {
  if (!flight) return null;
  const segs = flight.Segments?.[0] || [];
  const first = segs[0];
  const last = segs[segs.length - 1];
  const totalDuration = last?.AccumulatedDuration || first?.Duration || 0;
  const dh = Math.floor(totalDuration / 60);
  const dm = totalDuration % 60;
  const stopsCount = segs.length - 1;
  const stopLabel =
    stopsCount === 0
      ? "Non-stop"
      : `${stopsCount} stop${stopsCount > 1 ? "s" : ""}`;
  const originCity = first?.Origin?.Airport?.CityName || "";
  const destCity = last?.Destination?.Airport?.CityName || "";

  const formatT = (d) =>
    d
      ? new Date(d).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      : "--";
  const formatDateShort = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
      : "";

  const LayoverStrip = ({ currentSeg, nextSeg }) => {
    let groundTime = nextSeg?.GroundTime || currentSeg?.GroundTime || 0;
    if (
      !groundTime &&
      currentSeg?.Destination?.ArrTime &&
      nextSeg?.Origin?.DepTime
    ) {
      const arrMs = new Date(currentSeg.Destination.ArrTime).getTime();
      const depMs = new Date(nextSeg.Origin.DepTime).getTime();
      groundTime = Math.round((depMs - arrMs) / 60000);
    }
    if (!groundTime || groundTime <= 0) return null;
    const lh = Math.floor(groundTime / 60);
    const lm = groundTime % 60;
    const cityName =
      currentSeg?.Destination?.Airport?.CityName ||
      currentSeg?.Destination?.Airport?.CityCode ||
      "";
    return (
      <Box
        sx={{
          my: 1.2,
          borderRadius: "8px",
          bgcolor: "#F0FDF4",
          border: "1px solid #BBF7D0",
          px: 1.8,
          py: 1,
        }}
      >
        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#166534" }}>
          Change of planes
        </Typography>
        <Typography sx={{ fontSize: 11.5, color: "#16a34a" }}>
          {lh > 0 ? `${lh}h ` : ""}
          {lm > 0 ? `${lm}m ` : ""}Layover at {cityName}
        </Typography>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: "16px", overflow: "hidden" },
      }}
    >
      <Box
        sx={{
          bgcolor: "#fff",
          px: 3,
          pt: 2.5,
          pb: 1.5,
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#111" }}>
              {originCity}
            </Typography>
            <FlightTakeoff sx={{ fontSize: 16, color: "#1A914B" }} />
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#111" }}>
              {destCity}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 12.5, color: "#888", mt: 0.3 }}>
            {formatDateShort(first?.Origin?.DepTime)} &nbsp;·&nbsp; {dh}h {dm}m
            &nbsp;·&nbsp; {stopLabel}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "#555" }}>
          <Close />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 3, py: 2.5, bgcolor: "#fafafa" }}>
        {segs.map((seg, idx) => {
          const segDh = Math.floor((seg.Duration || 0) / 60);
          const segDm = (seg.Duration || 0) % 60;
          return (
            <React.Fragment key={idx}>
              <Box
                sx={{
                  bgcolor: "#fff",
                  border: "1px solid #E3E8EE",
                  borderRadius: "12px",
                  p: 2,
                  mb: idx < segs.length - 1 ? 0 : 1.5,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 1.5,
                  }}
                >
                  <AirlineLogo
                    name={seg.Airline?.AirlineName}
                    code={seg.Airline?.AirlineCode}
                    size={34}
                  />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{ fontSize: 13, fontWeight: 700, color: "#222" }}
                    >
                      {seg.Airline?.AirlineName} · {seg.Airline?.AirlineCode}-
                      {seg.Airline?.FlightNumber}
                    </Typography>
                    <Typography sx={{ fontSize: 11.5, color: "#888" }}>
                      {segDh}h {segDm}m
                      {seg.SupplierFareClass
                        ? ` · ${seg.SupplierFareClass}`
                        : ""}
                      {seg.Craft ? ` · Aircraft ${seg.Craft}` : ""}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{ fontSize: 18, fontWeight: 700, color: "#111" }}
                    >
                      {formatT(seg.Origin?.DepTime)}
                    </Typography>
                    <Typography
                      sx={{ fontSize: 12.5, fontWeight: 600, color: "#333" }}
                    >
                      {seg.Origin?.Airport?.CityName} (
                      {seg.Origin?.Airport?.AirportCode})
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "#888" }}>
                      {seg.Origin?.Airport?.AirportName}
                      {seg.Origin?.Airport?.Terminal
                        ? `, Terminal ${seg.Origin.Airport.Terminal}`
                        : ""}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      pt: 1,
                      minWidth: 70,
                    }}
                  >
                    <Typography
                      sx={{ fontSize: 10.5, color: "#F59E0B", fontWeight: 600 }}
                    >
                      {segDh}h {segDm}m
                    </Typography>
                    <Box
                      sx={{
                        width: "100%",
                        height: 2,
                        bgcolor: "#F59E0B",
                        my: 0.5,
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 1, textAlign: "right" }}>
                    <Typography
                      sx={{ fontSize: 18, fontWeight: 700, color: "#111" }}
                    >
                      {formatT(seg.Destination?.ArrTime)}
                    </Typography>
                    <Typography
                      sx={{ fontSize: 12.5, fontWeight: 600, color: "#333" }}
                    >
                      {seg.Destination?.Airport?.CityName} (
                      {seg.Destination?.Airport?.AirportCode})
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "#888" }}>
                      {seg.Destination?.Airport?.AirportName}
                      {seg.Destination?.Airport?.Terminal
                        ? `, Terminal ${seg.Destination.Airport.Terminal}`
                        : ""}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 1.5 }} />
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2 }}>
                  <Typography sx={{ fontSize: 11.5, color: "#555" }}>
                    Cabin: {seg.CabinBaggage || "7 KG"}
                  </Typography>
                  <Typography sx={{ fontSize: 11.5, color: "#555" }}>
                    Check-in: {seg.Baggage || "15 KG"}
                  </Typography>
                  {seg.NoOfSeatAvailable != null && (
                    <Typography
                      sx={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        color:
                          seg.NoOfSeatAvailable <= 5 ? "#E57373" : "#6B7280",
                      }}
                    >
                      {seg.NoOfSeatAvailable} seats left
                    </Typography>
                  )}
                </Box>
              </Box>
              {idx < segs.length - 1 && (
                <LayoverStrip currentSeg={seg} nextSeg={segs[idx + 1]} />
              )}
            </React.Fragment>
          );
        })}

        {flight.AirlineRemarks && (
          <Box
            sx={{
              mt: 1,
              mb: 2,
              borderRadius: "10px",
              bgcolor: "#FFFBEB",
              border: "1px solid #FDE68A",
              px: 1.8,
              py: 1.2,
            }}
          >
            <Typography
              sx={{ fontSize: 12, fontWeight: 700, color: "#92400E", mb: 0.3 }}
            >
              ⓘ Fare Note
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#92400E" }}>
              {flight.AirlineRemarks}
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            bgcolor: "#fff",
            border: "1px solid #E3E8EE",
            borderRadius: "12px",
            p: 2,
          }}
        >
          <Typography
            sx={{ fontSize: 13.5, fontWeight: 700, color: "#333", mb: 1 }}
          >
            Fare Summary
          </Typography>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.6 }}
          >
            <Typography sx={{ fontSize: 12.5, color: "#555" }}>
              Base Fare
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: "#222", fontWeight: 500 }}>
              ₹ {flight.Fare?.BaseFare?.toLocaleString("en-IN")}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ fontSize: 12.5, color: "#555" }}>
              Taxes & Fees
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: "#222", fontWeight: 500 }}>
              ₹ {flight.Fare?.Tax?.toLocaleString("en-IN")}
            </Typography>
          </Box>
          {flight.FareBreakdown?.[0]?.TaxBreakUp?.length > 0 && (
            <Typography sx={{ fontSize: 10.5, color: "#9ca3af", mt: 0.4 }}>
              {flight.FareBreakdown[0].TaxBreakUp.map(
                (t) => `${t.key} ₹${t.value}`,
              ).join(" · ")}
            </Typography>
          )}
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#111" }}>
              Total (per traveller)
            </Typography>
            <Typography
              sx={{ fontSize: 15, fontWeight: 700, color: "#1A914B" }}
            >
              ₹ {flight.Fare?.PublishedFare?.toLocaleString("en-IN")}
            </Typography>
          </Box>
          <Box sx={{ mt: 1.2, display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Box
              sx={{
                px: 1.4,
                py: 0.4,
                borderRadius: "50px",
                bgcolor: flight.IsRefundable ? "#EAF7EF" : "#FEF2F2",
                border: `1px solid ${flight.IsRefundable ? "#86EFAC" : "#FECACA"
                  }`,
              }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: flight.IsRefundable ? "#166534" : "#991B1B",
                }}
              >
                {flight.IsRefundable ? "✓ Refundable" : "✗ Non-refundable"}
              </Typography>
            </Box>
            {segs[0]?.SupplierFareClass && (
              <Box
                sx={{
                  px: 1.4,
                  py: 0.4,
                  borderRadius: "50px",
                  bgcolor: "#EFF6FF",
                  border: "1px solid #BFDBFE",
                }}
              >
                <Typography
                  sx={{ fontSize: 11, fontWeight: 600, color: "#1D4ED8" }}
                >
                  {segs[0].SupplierFareClass}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

const FlightDetailSidebar = ({
  open,
  onClose,
  flight,
  searchMeta,
  traceId,
}) => {
  const navigate = useNavigate();
  if (!flight) return null;
  const segs = flight.Segments?.[0] || [];
  const first = segs[0];
  const last = segs[segs.length - 1];
  const price = flight.Fare?.PublishedFare;
  const totalPassengers =
    (searchMeta?.passengers?.adults || 1) +
    (searchMeta?.passengers?.children || 0);
  const totalPrice = price * totalPassengers;
  const depDate = first?.Origin?.DepTime
    ? new Date(first.Origin.DepTime)
    : null;
  const totalDuration = last?.AccumulatedDuration || first?.Duration || 0;
  const dh = Math.floor(totalDuration / 60);
  const dm = totalDuration % 60;
  const stopsCount = segs.length - 1;
  const stopLabel =
    stopsCount === 0
      ? "non-stop"
      : `${stopsCount} stop${stopsCount > 1 ? "s" : ""}`;
  const originCity = first?.Origin?.Airport?.CityName || "";
  const destCity = last?.Destination?.Airport?.CityName || "";

  const formatTime = (d) =>
    d
      ? d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      : "--";
  const formatDateShort = (d) =>
    d
      ? d.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
      : "";

  const handleContinue = () => {
    onClose();
    navigate("/book-flight", {
      state: { flight, searchMeta: { ...searchMeta, traceId } },
    });
  };

  const SegmentBlock = ({ seg }) => {
    const segDepTime = seg.Origin?.DepTime
      ? new Date(seg.Origin.DepTime)
      : null;
    const segArrTime = seg.Destination?.ArrTime
      ? new Date(seg.Destination.ArrTime)
      : null;
    const segDh = Math.floor(seg.Duration / 60);
    const segDm = seg.Duration % 60;

    return (
      <Box sx={{ display: "flex", gap: 2, alignItems: "stretch" }}>
        {/* LEFT: time + duration + time, stacked */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minWidth: 70,
            flexShrink: 0,
            py: 0.5,
          }}
        >
          <Typography
            sx={{ fontSize: 22, fontWeight: 700, color: "#111", lineHeight: 1 }}
          >
            {formatTime(segDepTime)}
          </Typography>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 600,
              color: "#9ca3af",
              whiteSpace: "nowrap",
            }}
          >
            {segDh}h {segDm}m
          </Typography>
          <Typography
            sx={{ fontSize: 22, fontWeight: 700, color: "#111", lineHeight: 1 }}
          >
            {formatTime(segArrTime)}
          </Typography>
        </Box>

        {/* MIDDLE: vertical line with dots + plane icon */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minWidth: 24,
            flexShrink: 0,
            py: 1,
          }}
        >
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: "#E5E7EB",
              flexShrink: 0,
            }}
          />
          <Box sx={{ width: 2, flex: 1, bgcolor: "#E5E7EB" }} />
          <Box
            sx={{
              width: 20,
              height: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={planlogo}
              alt="Flight"
              style={{ width: 20, height: 20, objectFit: "contain" }}
            />
          </Box>
          <Box sx={{ width: 2, flex: 1, bgcolor: "#E5E7EB" }} />
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: "#E5E7EB",
              flexShrink: 0,
            }}
          />
        </Box>

        {/* RIGHT: city / airline / city */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#222" }}>
              {seg.Origin?.Airport?.CityName} (
              {seg.Origin?.Airport?.AirportCode})
            </Typography>
            <Typography
              sx={{ fontSize: 12, color: "#888", wordBreak: "break-word" }}
            >
              {seg.Origin?.Airport?.AirportName}
              {seg.Origin?.Airport?.Terminal
                ? `, Terminal ${seg.Origin.Airport.Terminal}`
                : ""}
            </Typography>
          </Box>

          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1.2, my: 5 }}
          >
            <AirlineLogo
              name={seg.Airline?.AirlineName}
              code={seg.Airline?.AirlineCode}
              size={26}
            />
            <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: "#333" }}>
              {seg.Airline?.AirlineName} &bull; {seg.Airline?.AirlineCode}-
              {seg.Airline?.FlightNumber}
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#222" }}>
              {seg.Destination?.Airport?.CityName} (
              {seg.Destination?.Airport?.AirportCode})
            </Typography>
            <Typography
              sx={{ fontSize: 12, color: "#888", wordBreak: "break-word" }}
            >
              {seg.Destination?.Airport?.AirportName}
              {seg.Destination?.Airport?.Terminal
                ? `, Terminal ${seg.Destination.Airport.Terminal}`
                : ""}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  const LayoverBadge = ({ currentSeg, nextSeg }) => {
    let groundTime = nextSeg?.GroundTime || currentSeg?.GroundTime || 0;
    if (
      !groundTime &&
      currentSeg?.Destination?.ArrTime &&
      nextSeg?.Origin?.DepTime
    ) {
      const arrMs = new Date(currentSeg.Destination.ArrTime).getTime();
      const depMs = new Date(nextSeg.Origin.DepTime).getTime();
      groundTime = Math.round((depMs - arrMs) / 60000);
    }
    if (!groundTime || groundTime <= 0) return null;
    const lh = Math.floor(groundTime / 60);
    const lm = groundTime % 60;
    const cityName =
      currentSeg?.Destination?.Airport?.CityName ||
      currentSeg?.Destination?.Airport?.CityCode ||
      "";
    return (
      <Box
        sx={{
          mx: 0,
          my: 1.5,
          borderRadius: "10px",
          bgcolor: "#F0FDF4",
          border: "1px solid #BBF7D0",
          px: 2,
          py: 1.2,
          display: "flex",
          alignItems: "flex-start",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 3,
            borderRadius: "4px",
            bgcolor: "#22C55E",
            alignSelf: "stretch",
            flexShrink: 0,
          }}
        />
        <Box>
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 700,
              color: "#166534",
              lineHeight: 1.3,
            }}
          >
            Change of planes
          </Typography>
          <Typography
            sx={{
              fontSize: 12,
              color: "#16a34a",
              mt: 0.3,
              fontFamily: "Inter,Sans-serif",
            }}
          >
            {lh > 0 ? `${lh}h ` : ""}
            {lm > 0 ? `${lm}m ` : ""}Layover at {cityName}
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        zIndex: 99999,
      }}
      PaperProps={{
        sx: {
          width: { xs: "100vw", sm: 420 },
          borderRadius: { sm: "16px 0 0 16px" },
          overflow: "hidden",
          zIndex: 99999,
        },
      }}
    >
      <Box
        sx={{
          bgcolor: "#fff",
          px: 3,
          pt: 3,
          pb: 2,
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 0.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              minWidth: 0,
              flex: 1,
              mr: 1,
            }}
          >
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 700,
                color: "#111",
                fontFamily: "Inter,Sans-serif",
              }}
            >
              {originCity}
            </Typography>
            <FlightTakeoff
              sx={{ fontSize: 18, color: "#1A914B", flexShrink: 0 }}
            />
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 700,
                color: "#111",
                fontFamily: "Inter,Sans-serif",
              }}
            >
              {destCity}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: "#555", flexShrink: 0 }}
          >
            <Close />
          </IconButton>
        </Box>
        <Typography
          sx={{ fontSize: 13, color: "#888", fontFamily: "Inter,Sans-serif" }}
        >
          {formatDateShort(depDate)} &nbsp;·&nbsp; {totalPassengers} Adult
          {totalPassengers > 1 ? "s" : ""} &nbsp;·&nbsp;{" "}
          {searchMeta?.cabinClass || "Economy"} &nbsp;·&nbsp;{" "}
          {searchMeta?.tripType === "roundtrip" ? "Round Trip" : "Oneway"}
        </Typography>
      </Box>
      <Box
        sx={{ overflowY: "auto", flex: 1, px: 3, py: 2.5, bgcolor: "#fafafa" }}
      >
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            width: "100%",
            bgcolor: "#EAF7EF",
            px: 2,
            py: 0.8,
            borderRadius: "50px",
            mb: 2,
            boxSizing: "border-box",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, width: "100%" }}>
            <AirlineLogo
              name={first?.Airline?.AirlineName}
              code={first?.Airline?.AirlineCode}
              size={28}
            />

            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1A914B" }}>
                {formatDateShort(depDate)}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#555" }}>
                {originCity} – {destCity} &bull; {dh}h {dm}m ({stopLabel})
              </Typography>
            </Box>
          </Box>
        </Paper>
        {segs.map((seg, idx) => (
          <React.Fragment key={idx}>
            <SegmentBlock seg={seg} />
            {idx < segs.length - 1 && (
              <LayoverBadge currentSeg={seg} nextSeg={segs[idx + 1]} />
            )}
          </React.Fragment>
        ))}

        <Divider sx={{ my: 2 }} />
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 600,
            color: "#333",
            mb: 1.5,
            fontFamily: "Inter,Sans-serif",
          }}
        >
          Fare Summary
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography
              sx={{
                fontSize: 13,
                color: "#555",
                fontFamily: "Inter,Sans-serif",
              }}
            >
              Base Fare × {totalPassengers}
            </Typography>
            <Typography
              sx={{
                fontSize: 13,
                color: "#222",
                fontWeight: 500,
                fontFamily: "Inter,Sans-serif",
              }}
            >
              ₹{" "}
              {(flight.Fare?.BaseFare * totalPassengers).toLocaleString(
                "en-IN",
              )}
            </Typography>
          </Box>
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography
                sx={{
                  fontSize: 13,
                  color: "#555",
                  fontFamily: "Inter,Sans-serif",
                }}
              >
                Taxes & Fees
              </Typography>
              <Typography
                sx={{
                  fontSize: 13,
                  color: "#222",
                  fontWeight: 500,
                  fontFamily: "Inter,Sans-serif",
                }}
              >
                ₹ {(flight.Fare?.Tax * totalPassengers).toLocaleString("en-IN")}
              </Typography>
            </Box>
            {flight.FareBreakdown?.[0]?.TaxBreakUp?.length > 0 && (
              <Typography
                sx={{
                  fontSize: 11,
                  color: "#9ca3af",
                  fontFamily: "Inter,Sans-serif",
                  mt: 0.3,
                }}
              >
                {flight.FareBreakdown[0].TaxBreakUp.map(
                  (t) => `${t.key} ₹${t.value}`,
                ).join(" · ")}
              </Typography>
            )}
          </Box>
          <Divider sx={{ my: 0.5 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 700,
                color: "#111",
                fontFamily: "Inter,Sans-serif",
              }}
            >
              Total
            </Typography>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 700,
                color: "#1A914B",
                fontFamily: "Inter,Sans-serif",
              }}
            >
              ₹ {totalPrice.toLocaleString("en-IN")}
            </Typography>
          </Box>
          <Typography
            sx={{
              fontSize: 11,
              color: "#9ca3af",
              textAlign: "right",
              fontFamily: "Inter,Sans-serif",
            }}
          >
            For {totalPassengers} traveller{totalPassengers > 1 ? "s" : ""}
          </Typography>
        </Box>
        <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Box
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: "50px",
              bgcolor: flight.IsRefundable ? "#EAF7EF" : "#FEF2F2",
              border: `1px solid ${flight.IsRefundable ? "#86EFAC" : "#FECACA"
                }`,
            }}
          >
            <Typography
              sx={{
                fontSize: 11.5,
                fontWeight: 600,
                color: flight.IsRefundable ? "#166534" : "#991B1B",
                fontFamily: "Inter,Sans-serif",
              }}
            >
              {flight.IsRefundable ? "✓ Refundable" : "✗ Non-refundable"}
            </Typography>
          </Box>
          {segs[0]?.SupplierFareClass && (
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: "50px",
                bgcolor: "#EFF6FF",
                border: "1px solid #BFDBFE",
              }}
            >
              <Typography
                sx={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: "#1D4ED8",
                  fontFamily: "Inter,Sans-serif",
                }}
              >
                {segs[0].SupplierFareClass}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
      <Box
        sx={{
          px: 3,
          py: 2.5,
          bgcolor: "#fff",
          borderTop: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 22,
              fontWeight: 700,
              color: "#111",
              fontFamily: "Inter,Sans-serif",
            }}
          >
            ₹ {totalPrice.toLocaleString("en-IN")}
          </Typography>
          <Typography
            sx={{ fontSize: 12, color: "#888", fontFamily: "Inter,Sans-serif" }}
          >
            For {totalPassengers} Traveller{totalPassengers > 1 ? "s" : ""}
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={handleContinue}
          sx={{
            bgcolor: "#1A914B",
            "&:hover": { bgcolor: "#157a3e" },
            textTransform: "none",
            borderRadius: "10px",
            px: 3.5,
            py: 1.3,
            fontSize: 15,
            fontWeight: 700,
            boxShadow: "none",
            fontFamily: "Inter,Sans-serif",
          }}
        >
          Continue
        </Button>
      </Box>
    </Drawer>
  );
};

const RoundTripDetailSidebar = ({
  open,
  onClose,
  onwardFlight,
  returnFlight,
  searchMeta,
  traceId,
  isCombinedRoundTrip = false,
}) => {
  const navigate = useNavigate();
  if (!onwardFlight || !returnFlight) return null;
  const totalPassengers =
    (searchMeta?.passengers?.adults || 1) +
    (searchMeta?.passengers?.children || 0);
  const totalPrice =
    (onwardFlight.Fare?.PublishedFare || 0) +
    (returnFlight.Fare?.PublishedFare || 0);
  const totalPriceAll = totalPrice * totalPassengers;
  const fromCity = searchMeta?.fromCity?.code || "";
  const toCity = searchMeta?.toCity?.code || "";

  const formatTime = (d) =>
    d
      ? d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      : "--";
  const formatDateShort = (d) =>
    d
      ? d.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
      : "";

  const handleContinue = () => {
    onClose();
    navigate("/book-flight", {
      state: {
        onwardFlight,
        returnFlight,
        searchMeta: { ...searchMeta, traceId, isCombinedRoundTrip },
      },
    });
  };

  const SegmentBlock = ({ seg }) => {
    const segDepTime = seg.Origin?.DepTime
      ? new Date(seg.Origin.DepTime)
      : null;
    const segArrTime = seg.Destination?.ArrTime
      ? new Date(seg.Destination.ArrTime)
      : null;
    const segDh = Math.floor(seg.Duration / 60);
    const segDm = seg.Duration % 60;

    return (
      <Box sx={{ display: "flex", gap: 2, alignItems: "stretch" }}>
        {/* LEFT: time + duration + time, stacked */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minWidth: 70,
            flexShrink: 0,
            py: 0.5,
          }}
        >
          <Typography
            sx={{ fontSize: 24, fontWeight: 600, color: "#111", lineHeight: 1 }}
          >
            {formatTime(segDepTime)}
          </Typography>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 500,
              color: "#717171",
              whiteSpace: "nowrap",
            }}
          >
            {segDh}h {segDm}m
          </Typography>
          <Typography
            sx={{ fontSize: 24, fontWeight: 600, color: "#111", lineHeight: 1 }}
          >
            {formatTime(segArrTime)}
          </Typography>
        </Box>

        {/* MIDDLE: orange vertical line with dots + plane icon */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minWidth: 24,
            flexShrink: 0,
            py: 1,
          }}
        >
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: "#E3E8EE",
              flexShrink: 0,
            }}
          />
          <Box sx={{ width: 2, flex: 1, bgcolor: "#E3E8EE" }} />
          <Box
            sx={{
              width: 20,
              height: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={planlogo}
              alt="Flight"
              style={{ width: 20, height: 20, objectFit: "contain" }}
            />
          </Box>
          <Box sx={{ width: 2, flex: 1, bgcolor: "#E3E8EE" }} />
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: "#E3E8EE",
              flexShrink: 0,
            }}
          />
        </Box>

        {/* RIGHT: city / airline logo+name+number / city */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "18px",
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 600, color: "#222" }}>
              {seg.Origin?.Airport?.CityName} (
              {seg.Origin?.Airport?.AirportCode})
            </Typography>
            <Typography
              sx={{ fontSize: 12, color: "#888", wordBreak: "break-word" }}
            >
              {seg.Origin?.Airport?.AirportName}
              {seg.Origin?.Airport?.Terminal
                ? `, Terminal ${seg.Origin.Airport.Terminal}`
                : ""}
            </Typography>
          </Box>

          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1.2, my: 1.5 }}
          >
            <AirlineLogo
              name={seg.Airline?.AirlineName}
              code={seg.Airline?.AirlineCode}
              size={26}
            />
            <Typography sx={{ fontSize: 16, fontWeight: 500, color: "#333" }}>
              {seg.Airline?.AirlineName} &bull; {seg.Airline?.AirlineCode}-
              {seg.Airline?.FlightNumber}
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 600, color: "#222" }}>
              {seg.Destination?.Airport?.CityName} (
              {seg.Destination?.Airport?.AirportCode})
            </Typography>
            <Typography
              sx={{ fontSize: 12, color: "#888", wordBreak: "break-word" }}
            >
              {seg.Destination?.Airport?.AirportName}
              {seg.Destination?.Airport?.Terminal
                ? `, Terminal ${seg.Destination.Airport.Terminal}`
                : ""}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  const LayoverBadge = ({ currentSeg, nextSeg }) => {
    let groundTime = nextSeg?.GroundTime || currentSeg?.GroundTime || 0;
    if (
      !groundTime &&
      currentSeg?.Destination?.ArrTime &&
      nextSeg?.Origin?.DepTime
    ) {
      const arrMs = new Date(currentSeg.Destination.ArrTime).getTime();
      const depMs = new Date(nextSeg.Origin.DepTime).getTime();
      groundTime = Math.round((depMs - arrMs) / 60000);
    }
    if (!groundTime || groundTime <= 0) return null;
    const lh = Math.floor(groundTime / 60);
    const lm = groundTime % 60;
    const cityName = currentSeg?.Destination?.Airport?.CityName || "";
    return (
      <Box
        sx={{
          mx: 0,
          my: 5,
          borderRadius: "10px",
          bgcolor: "#F0FDF4",
          border: "1px solid #15d659",
          px: 2,
          py: 1.2,
          display: "flex",
          alignItems: "flex-start",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 3,
            borderRadius: "4px",
            bgcolor: "#22C55E",
            alignSelf: "stretch",
            flexShrink: 0,
          }}
        />
        <Box>
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 700,
              color: "#166534",
              lineHeight: 1.3,
            }}
          >
            Change of planesss
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#16a34a", mt: 0.3 }}>
            {lh > 0 ? `${lh}h ` : ""}
            {lm > 0 ? `${lm}m ` : ""}Layover at {cityName}
          </Typography>
        </Box>
      </Box>
    );
  };

  const FlightLegDetail = ({ flight, label }) => {
    const segs = flight.Segments?.[0] || [];
    const first = segs[0];
    const last = segs[segs.length - 1];
    const depDate = first?.Origin?.DepTime
      ? new Date(first.Origin.DepTime)
      : null;
    const totalDuration = last?.AccumulatedDuration || first?.Duration || 0;
    const dh = Math.floor(totalDuration / 60);
    const dm = totalDuration % 60;
    const stopsCount = segs.length - 1;
    const stopLabel =
      stopsCount === 0
        ? "non-stop"
        : `${stopsCount} stop${stopsCount > 1 ? "s" : ""}`;
    const originCity = first?.Origin?.Airport?.CityName || "";
    const destCity = last?.Destination?.Airport?.CityName || "";
    return (
      <Box>
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            width: "100%",
            bgcolor: "#EAF7EF",
            px: 2,
            py: 0.8,
            borderRadius: "50px",
            mb: 2,
            boxSizing: "border-box",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, width: "100%" }}>
            <AirlineLogo
              name={first?.Airline?.AirlineName}
              code={first?.Airline?.AirlineCode}
              size={28}
            />

            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1A914B" }}>
                {formatDateShort(depDate)}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#555" }}>
                {originCity} – {destCity} &bull; {dh}h {dm}m ({stopLabel})
              </Typography>
            </Box>
          </Box>
        </Paper>
        {segs.map((seg, idx) => (
          <React.Fragment key={idx}>
            <SegmentBlock seg={seg} />
            {idx < segs.length - 1 && (
              <LayoverBadge currentSeg={seg} nextSeg={segs[idx + 1]} />
            )}
          </React.Fragment>
        ))}
      </Box>
    );
  };

  const onwardDepDate = onwardFlight.Segments?.[0]?.[0]?.Origin?.DepTime
    ? new Date(onwardFlight.Segments[0][0].Origin.DepTime)
    : null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        zIndex: 99999,
      }}
      PaperProps={{
        sx: {
          width: { xs: "100vw", sm: 420 },
          borderRadius: { sm: "16px 0 0 16px" },
          overflow: "hidden",
          zIndex: 99999,
        },
      }}
    >
      <Box
        sx={{
          bgcolor: "#fff",
          px: 3,
          pt: 3,
          pb: 2,
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 0.5,
          }}
        >


          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              minWidth: 0,
              flex: 1,
              mr: 1,
            }}
          >
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#111" }}>
              {fromCity}
            </Typography>

            <CompareArrows sx={{ fontSize: 18, color: "#6B7280", flexShrink: 0 }} />

            <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#111" }}>
              {toCity}
            </Typography>
          </Box>

          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: "#555", flexShrink: 0 }}
          >
            <Close />
          </IconButton>
        </Box>
        <Typography sx={{ fontSize: 13, color: "#888" }}>
          {formatDateShort(onwardDepDate)} &nbsp;·&nbsp; {totalPassengers} Adult
          {totalPassengers > 1 ? "s" : ""} &nbsp;·&nbsp;{" "}
          {searchMeta?.cabinClass || "Economy"} &nbsp;·&nbsp; Round Trip
        </Typography>
      </Box>


      <Box
        sx={{ overflowY: "auto", flex: 1, px: 3, py: 2.5, bgcolor: "#fafafa" }}
      >
        <FlightLegDetail flight={onwardFlight} label="Onward" />

        <Divider
          sx={{
            my: 5,
            borderStyle: "dashed",
            borderColor: "#CBD5E1",
          }}
        />

        <FlightLegDetail flight={returnFlight} label="Return" />

        <Divider sx={{ my: 2 }} />
        <Typography
          sx={{ fontSize: 14, fontWeight: 600, color: "#333", mb: 1.5 }}
        >
          Fare Summary
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ fontSize: 13, color: "#555" }}>
              Onward Base Fare × {totalPassengers}
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#222", fontWeight: 500 }}>
              ₹{" "}
              {(
                (onwardFlight.Fare?.BaseFare || 0) * totalPassengers
              ).toLocaleString("en-IN")}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ fontSize: 13, color: "#555" }}>
              Return Base Fare × {totalPassengers}
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#222", fontWeight: 500 }}>
              ₹{" "}
              {(
                (returnFlight.Fare?.BaseFare || 0) * totalPassengers
              ).toLocaleString("en-IN")}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ fontSize: 13, color: "#555" }}>
              Taxes & Fees
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#222", fontWeight: 500 }}>
              ₹{" "}
              {(
                ((onwardFlight.Fare?.Tax || 0) +
                  (returnFlight.Fare?.Tax || 0)) *
                totalPassengers
              ).toLocaleString("en-IN")}
            </Typography>
          </Box>
          <Divider sx={{ my: 0.5 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#111" }}>
              Total
            </Typography>
            <Typography
              sx={{ fontSize: 16, fontWeight: 700, color: "#1A914B" }}
            >
              ₹ {totalPriceAll.toLocaleString("en-IN")}
            </Typography>
          </Box>
          <Typography
            sx={{ fontSize: 11, color: "#9ca3af", textAlign: "right" }}
          >
            For {totalPassengers} traveller{totalPassengers > 1 ? "s" : ""}
          </Typography>
        </Box>
        <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Box
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: "50px",
              bgcolor: "#F3F4F6",
              border: "1px solid #E5E7EB",
            }}
          >
            <Typography
              sx={{
                fontSize: 11.5,
                fontWeight: 600,
                color: onwardFlight.IsRefundable ? "#166534" : "#991B1B",
              }}
            >
              Onward:{" "}
              {onwardFlight.IsRefundable ? "✓ Refundable" : "✗ Non-refundable"}
            </Typography>
          </Box>
          <Box
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: "50px",
              bgcolor: "#F3F4F6",
              border: "1px solid #E5E7EB",
            }}
          >
            <Typography
              sx={{
                fontSize: 11.5,
                fontWeight: 600,
                color: returnFlight.IsRefundable ? "#166534" : "#991B1B",
              }}
            >
              Return:{" "}
              {returnFlight.IsRefundable ? "✓ Refundable" : "✗ Non-refundable"}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          px: 3,
          py: 2.5,
          bgcolor: "#fff",
          borderTop: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#111" }}>
            ₹ {totalPriceAll.toLocaleString("en-IN")}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#888" }}>
            For {totalPassengers} Traveller{totalPassengers > 1 ? "s" : ""}
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={handleContinue}
          sx={{
            bgcolor: "#1A914B",
            "&:hover": { bgcolor: "#157a3e" },
            textTransform: "none",
            borderRadius: "10px",
            px: 3.5,
            py: 1.3,
            fontSize: 15,
            fontWeight: 700,
            boxShadow: "none",
          }}
        >
          Continue
        </Button>
      </Box>
    </Drawer>
  );
};

const timeSlots = [
  { label: "Before 6 AM", icon: "/morning.svg" },
  { label: "6AM - 12PM", icon: "/afternoon.svg" },
  { label: "12PM - 6PM", icon: "/evening.svg" },
  { label: "6PM - 12AM", icon: "/night.svg" },
];

const checkboxStyle = {
  color: "#B5BAC2",
  "&.Mui-checked": { color: "#1A914B" },
  padding: "4px 8px",
};

const getFlightMeta = (flight) => {
  const segs = flight.Segments?.[0] || [];
  if (!segs.length) return null;
  const first = segs[0];
  const last = segs[segs.length - 1];
  const depTime = first.Origin?.DepTime?.split("T")[1]?.substring(0, 5) || "--";
  const arrTime =
    last.Destination?.ArrTime?.split("T")[1]?.substring(0, 5) || "--";
  const totalDuration = last.AccumulatedDuration || first.Duration || 0;
  const durationHours = Math.floor(totalDuration / 60);
  const durationMinutes = totalDuration % 60;
  const stopsCount = segs.length - 1;
  const stopLabel =
    stopsCount === 0
      ? "Non-stop"
      : `${stopsCount} Stop${stopsCount > 1 ? "s" : ""}`;
  return {
    depTime,
    arrTime,
    durationHours,
    durationMinutes,
    stopsCount,
    stopLabel,
    airlineName: first.Airline?.AirlineName || "",
    airlineCode: first.Airline?.AirlineCode || "",
    flightNumber: first.Airline?.FlightNumber || "",
    originCity: first.Origin?.Airport?.CityName || "",
    destCity: last.Destination?.Airport?.CityName || "",
    segs,
    first,
    last,
  };
};

const getLegMeta = (segs) => {
  if (!segs || !segs.length) return null;
  const first = segs[0];
  const last = segs[segs.length - 1];
  const depTime = first.Origin?.DepTime?.split("T")[1]?.substring(0, 5) || "--";
  const arrTime =
    last.Destination?.ArrTime?.split("T")[1]?.substring(0, 5) || "--";
  const totalDuration = last.AccumulatedDuration || first.Duration || 0;
  const durationHours = Math.floor(totalDuration / 60);
  const durationMinutes = totalDuration % 60;
  const stopsCount = segs.length - 1;
  const stopLabel =
    stopsCount === 0
      ? "Non-stop"
      : `${stopsCount} Stop${stopsCount > 1 ? "s" : ""}`;
  return {
    depTime,
    arrTime,
    durationHours,
    durationMinutes,
    stopLabel,
    airlineName: first.Airline?.AirlineName || "",
    airlineCode: first.Airline?.AirlineCode || "",
    originCode: first.Origin?.Airport?.AirportCode || "",
    destCode: last.Destination?.Airport?.AirportCode || "",
  };
};

const getPriceRange = (flights) => {
  if (!flights.length) return [0, 100000];
  const prices = flights.map((f) => f.Fare?.PublishedFare || 0);
  return [Math.min(...prices), Math.max(...prices)];
};

const getUniqueAirlines = (flights) => {
  const set = new Set();
  flights.forEach((f) => {
    const name = f.Segments?.[0]?.[0]?.Airline?.AirlineName;
    if (name) set.add(name);
  });
  return Array.from(set);
};

const applyFilters = (
  flights,
  effectivePriceRange,
  selectedStops,
  departureTime,
  arrivalTime,
  selectedAirlines,
  lccFilter,
) => {
  return flights.filter((flight) => {
    const meta = getFlightMeta(flight);
    if (!meta) return false;
    const price = flight.Fare?.PublishedFare || 0;
    if (price < effectivePriceRange[0] || price > effectivePriceRange[1])
      return false;
    if (selectedStops.length > 0) {
      const stopText =
        meta.stopsCount === 0
          ? "Nonstop"
          : meta.stopsCount === 1
            ? "1 Stop"
            : "2+ Stop";
      if (!selectedStops.includes(stopText)) return false;
    }
    if (departureTime) {
      const h = parseInt(meta.depTime.split(":")[0]);
      if (
        (departureTime === "Before 6 AM" && h >= 6) ||
        (departureTime === "6AM - 12PM" && (h < 6 || h >= 12)) ||
        (departureTime === "12PM - 6PM" && (h < 12 || h >= 18)) ||
        (departureTime === "6PM - 12AM" && h < 18)
      )
        return false;
    }
    if (arrivalTime) {
      const h = parseInt(meta.arrTime.split(":")[0]);
      if (
        (arrivalTime === "Before 6 AM" && h >= 6) ||
        (arrivalTime === "6AM - 12PM" && (h < 6 || h >= 12)) ||
        (arrivalTime === "12PM - 6PM" && (h < 12 || h >= 18)) ||
        (arrivalTime === "6PM - 12AM" && h < 18)
      )
        return false;
    }
    if (
      selectedAirlines.length > 0 &&
      !selectedAirlines.includes(meta.airlineName)
    )
      return false;
    if (lccFilter === "lcc" && !flight.IsLCC) return false;
    if (lccFilter === "nonlcc" && flight.IsLCC) return false;
    return true;
  });
};

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const VISIBLE_COUNT = 7;
const getVisibleCount = () => {
  if (typeof window === "undefined") return VISIBLE_COUNT;
  if (window.innerWidth < 400) return 4;
  if (window.innerWidth < 520) return 5;
  if (window.innerWidth < 768) return 6;
  return VISIBLE_COUNT;
};

const CalendarFareStrip = ({
  calendarData,
  loading,
  selectedDate,
  onDateChange,
  label,
  originCode,
  destCode,
}) => {
  const allItems = useMemo(() => {
    if (!calendarData?.SearchResults?.length) return [];
    return [...calendarData.SearchResults]
      .map((item) => ({ ...item, dateObj: new Date(item.DepartureDate) }))
      .sort((a, b) => a.dateObj - b.dateObj);
  }, [calendarData]);

  const [visibleCount, setVisibleCount] = useState(getVisibleCount);
  const [startIdx, setStartIdx] = useState(0);

  useEffect(() => {
    const handleResize = () => setVisibleCount(getVisibleCount());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!allItems.length) return;
    const selD = selectedDate ? new Date(selectedDate) : null;
    if (!selD) {
      setStartIdx(0);
      return;
    }
    const selKey = `${selD.getFullYear()}-${selD.getMonth()}-${selD.getDate()}`;
    const idx = allItems.findIndex((item) => {
      const d = item.dateObj;
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` === selKey;
    });
    if (idx === -1) {
      setStartIdx(0);
      return;
    }
    setStartIdx(
      Math.max(
        0,
        Math.min(
          idx - Math.floor(visibleCount / 2),
          allItems.length - visibleCount,
        ),
      ),
    );
  }, [allItems, selectedDate]);

  const canGoPrev = startIdx > 0;
  const canGoNext = startIdx + visibleCount < allItems.length;
  const visibleItems = allItems.slice(startIdx, startIdx + visibleCount);
  const lowestFare = useMemo(
    () =>
      allItems.length ? Math.min(...allItems.map((r) => r.TotalFare)) : null,
    [allItems],
  );
  const selectedKey = selectedDate
    ? (() => {
      const d = new Date(selectedDate);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })()
    : null;

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #E3E8EE",
          borderRadius: "14px",
          bgcolor: "#fff",
          mb: 2,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: { xs: 1.5, sm: 2.5 },
            py: 1.5,
            borderBottom: "1px solid #F3F4F6",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <FlightTakeoff sx={{ fontSize: 16, color: "#1A914B" }} />
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111" }}>
            {label}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#888" }}>
            {originCode} → {destCode}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", px: 1, py: 1.5 }}>
          <Box sx={{ width: 32 }} />
          {Array.from({ length: visibleCount }).map((_, i) => (
            <Box key={i} sx={{ flex: 1, mx: 0.5 }}>
              <Skeleton
                variant="text"
                width="60%"
                sx={{ mx: "auto", mb: 0.5 }}
              />
              <Skeleton variant="text" width="80%" sx={{ mx: "auto" }} />
            </Box>
          ))}
          <Box sx={{ width: 32 }} />
        </Box>
      </Paper>
    );
  }

  if (!allItems.length) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid #E3E8EE",
        borderRadius: "14px",
        bgcolor: "#fff",
        mb: 2,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          borderBottom: "1px solid #F3F4F6",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FlightTakeoff sx={{ fontSize: 16, color: "#1A914B" }} />
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "Inter,Sans-serif",
              color: "#111",
            }}
          >
            {label}
          </Typography>
          <Typography
            sx={{ fontSize: 12, fontFamily: "Inter,Sans-serif", color: "#888" }}
          >
            {originCode} → {destCode}
          </Typography>
        </Box>
        {lowestFare && (
          <Box
            sx={{
              px: 1.5,
              py: 0.4,
              bgcolor: "#F0FDF4",
              border: "1px solid #BBF7D0",
              borderRadius: "50px",
            }}
          >
            <Typography
              sx={{
                fontSize: 11.5,
                fontWeight: 700,
                fontFamily: "Inter,Sans-serif",
                color: "#166634",
              }}
            >
              Lowest ₹ {lowestFare.toLocaleString("en-IN")}
            </Typography>
          </Box>
        )}
      </Box>
      <Box sx={{ display: "flex", alignItems: "stretch" }}>
        <Box
          onClick={() => canGoPrev && setStartIdx((i) => Math.max(0, i - 1))}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: { xs: 28, sm: 36 },
            minWidth: { xs: 28, sm: 36 },
            flexShrink: 0,
            cursor: canGoPrev ? "pointer" : "default",
            borderRight: "1px solid #F3F4F6",
            color: canGoPrev ? "#374151" : "#D1D5DB",
            "&:hover": canGoPrev ? { bgcolor: "#F9FAFB" } : {},
            transition: "background 0.15s",
          }}
        >
          <ChevronLeft sx={{ fontSize: { xs: 16, sm: 20 } }} />
        </Box>

        <Box sx={{ flex: 1, display: "flex", minWidth: 0 }}>
          {visibleItems.map((item, idx) => {
            const d = item.dateObj;
            const dayKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            const isSelected = dayKey === selectedKey;
            const isLowest = item.TotalFare === lowestFare;
            const isPast = d < new Date(new Date().setHours(0, 0, 0, 0));
            const isLast = idx === visibleItems.length - 1;
            const dateLabel = `${DAY_SHORT[d.getDay()]}, ${d.getDate()} ${MONTH_SHORT[d.getMonth()]
              }`;
            return (
              <Box
                key={item.DepartureDate}
                onClick={() => !isPast && onDateChange && onDateChange(d)}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  textAlign: "center",
                  py: 1.5,
                  px: 0.3,
                  cursor: isPast ? "default" : "pointer",
                  opacity: isPast ? 0.4 : 1,
                  borderRight: isLast ? "none" : "1px solid #F3F4F6",
                  position: "relative",
                  transition: "background 0.12s",
                  "&:hover": !isPast ? { bgcolor: "#F9FAFB" } : {},
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: 10, sm: 13 },
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? "#111" : "#374151",
                    lineHeight: 1.4,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontFamily: "Inter,Sans-serif",
                  }}
                >
                  {dateLabel}
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: 10, sm: 13 },
                    fontWeight: 600,
                    fontFamily: "Inter,Sans-serif",
                    color: isSelected
                      ? "#1A914B"
                      : isLowest
                        ? "#1A914B"
                        : "#6B7280",
                    lineHeight: 1.4,
                    mt: 0.2,
                  }}
                >
                  ₹{item.TotalFare.toLocaleString("en-IN")}
                </Typography>
                {isSelected && (
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: "15%",
                      right: "15%",
                      height: 3,
                      bgcolor: "#1A914B",
                      borderRadius: "3px 3px 0 0",
                    }}
                  />
                )}
              </Box>
            );
          })}
        </Box>
        <Box
          onClick={() =>
            canGoNext &&
            setStartIdx((i) => Math.min(allItems.length - visibleCount, i + 1))
          }
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: { xs: 28, sm: 36 },
            minWidth: { xs: 28, sm: 36 },
            flexShrink: 0,
            cursor: canGoNext ? "pointer" : "default",
            borderLeft: "1px solid #F3F4F6",
            color: canGoNext ? "#374151" : "#D1D5DB",
            "&:hover": canGoNext ? { bgcolor: "#F9FAFB" } : {},
            transition: "background 0.15s",
          }}
        >
          <ChevronRight sx={{ fontSize: { xs: 16, sm: 20 } }} />
        </Box>
      </Box>
    </Paper>
  );
};

const RT_VISIBLE = 5;
const getRtVisibleCount = () => {
  if (typeof window === "undefined") return RT_VISIBLE;
  if (window.innerWidth < 400) return 2;
  if (window.innerWidth < 520) return 3;
  return RT_VISIBLE;
};

const RoundTripCalendarStrip = ({
  onwardData,
  returnData,
  loading,
  selectedOnwardDate,
  selectedReturnDate,
  onOnwardDateChange,
  onReturnDateChange,
  originCode,
  destCode,
}) => {
  const onwardItems = useMemo(() => {
    if (!onwardData?.SearchResults?.length) return [];
    return [...onwardData.SearchResults]
      .map((item) => ({ ...item, dateObj: new Date(item.DepartureDate) }))
      .sort((a, b) => a.dateObj - b.dateObj);
  }, [onwardData]);

  const returnItems = useMemo(() => {
    if (!returnData?.SearchResults?.length) return [];
    return [...returnData.SearchResults]
      .map((item) => ({ ...item, dateObj: new Date(item.DepartureDate) }))
      .sort((a, b) => a.dateObj - b.dateObj);
  }, [returnData]);

  const [rtVisible, setRtVisible] = useState(getRtVisibleCount);
  const [onwardStart, setOnwardStart] = useState(0);
  const [returnStart, setReturnStart] = useState(0);

  useEffect(() => {
    const handleResize = () => setRtVisible(getRtVisibleCount());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!onwardItems.length) return;
    const selD = selectedOnwardDate ? new Date(selectedOnwardDate) : null;
    if (!selD) {
      setOnwardStart(0);
      return;
    }
    const selKey = `${selD.getFullYear()}-${selD.getMonth()}-${selD.getDate()}`;
    const idx = onwardItems.findIndex((item) => {
      const d = item.dateObj;
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` === selKey;
    });
    if (idx === -1) {
      setOnwardStart(0);
      return;
    }
    setOnwardStart(
      Math.max(
        0,
        Math.min(
          idx - Math.floor(RT_VISIBLE / 2),
          onwardItems.length - RT_VISIBLE,
        ),
      ),
    );
  }, [onwardItems, selectedOnwardDate]);

  useEffect(() => {
    if (!returnItems.length) return;
    const selD = selectedReturnDate ? new Date(selectedReturnDate) : null;
    if (!selD) {
      setReturnStart(0);
      return;
    }
    const selKey = `${selD.getFullYear()}-${selD.getMonth()}-${selD.getDate()}`;
    const idx = returnItems.findIndex((item) => {
      const d = item.dateObj;
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` === selKey;
    });
    if (idx === -1) {
      setReturnStart(0);
      return;
    }
    setReturnStart(
      Math.max(
        0,
        Math.min(
          idx - Math.floor(RT_VISIBLE / 2),
          returnItems.length - RT_VISIBLE,
        ),
      ),
    );
  }, [returnItems, selectedReturnDate]);

  const onwardLowest = useMemo(
    () =>
      onwardItems.length
        ? Math.min(...onwardItems.map((r) => r.TotalFare))
        : null,
    [onwardItems],
  );
  const returnLowest = useMemo(
    () =>
      returnItems.length
        ? Math.min(...returnItems.map((r) => r.TotalFare))
        : null,
    [returnItems],
  );
  const onwardKey = selectedOnwardDate
    ? (() => {
      const d = new Date(selectedOnwardDate);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })()
    : null;
  const returnKey = selectedReturnDate
    ? (() => {
      const d = new Date(selectedReturnDate);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })()
    : null;

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #E3E8EE",
          borderRadius: "14px",
          bgcolor: "#fff",
          mb: 2,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" } }}
        >
          {[0, 1].map((i) => (
            <Box
              key={i}
              sx={{
                flex: 1,
                p: 2,
                borderRight: { sm: i === 0 ? "1px solid #E3E8EE" : "none" },
                borderBottom: {
                  xs: i === 0 ? "1px solid #E3E8EE" : "none",
                  sm: "none",
                },
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}
              >
                <Skeleton variant="circular" width={16} height={16} />
                <Skeleton variant="text" width={120} />
              </Box>
              <Box sx={{ display: "flex", gap: 0.5 }}>
                {Array.from({ length: rtVisible }).map((_, j) => (
                  <Box key={j} sx={{ flex: 1 }}>
                    <Skeleton variant="text" sx={{ mb: 0.3 }} />
                    <Skeleton variant="text" />
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>
    );
  }

  if (!onwardItems.length && !returnItems.length) return null;

  const renderStrip = ({
    items,
    startIdx,
    setStartIdx,
    selectedKey,
    lowestFare,
    onDateChange,
    label,
    fromCode,
    toCode,
  }) => {
    const visibleItems = items.slice(startIdx, startIdx + RT_VISIBLE);
    const canPrev = startIdx > 0;
    const canNext = startIdx + RT_VISIBLE < items.length;
    return (
      <Box
        sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.2,
            borderBottom: "1px solid #F3F4F6",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.8,
              minWidth: 0,
            }}
          >
            <FlightTakeoff
              sx={{ fontSize: 14, color: "#1A914B", flexShrink: 0 }}
            />
            <Typography
              sx={{
                fontSize: 12.5,
                fontWeight: 700,
                fontFamily: "Inter,Sans-serif",
                color: "#111",
              }}
            >
              {label}
            </Typography>
            <Typography
              sx={{
                fontSize: 11.5,
                fontFamily: "Inter,Sans-serif",
                color: "#888",
              }}
            >
              {fromCode} → {toCode}
            </Typography>
          </Box>
          {lowestFare && (
            <Box
              sx={{
                px: 1.2,
                py: 0.3,
                bgcolor: "#F0FDF4",
                border: "1px solid #BBF7D0",
                borderRadius: "50px",
                flexShrink: 0,
                ml: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  fontFamily: "Inter,Sans-serif",
                  color: "#166534",
                }}
              >
                ₹{lowestFare.toLocaleString("en-IN")}
              </Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "stretch", flex: 1 }}>
          <Box
            onClick={() => canPrev && setStartIdx((i) => Math.max(0, i - 1))}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              flexShrink: 0,
              cursor: canPrev ? "pointer" : "default",
              borderRight: "1px solid #F3F4F6",
              color: canPrev ? "#374151" : "#D1D5DB",
              "&:hover": canPrev ? { bgcolor: "#F9FAFB" } : {},
              transition: "background 0.15s",
            }}
          >
            <ChevronLeft sx={{ fontSize: 16 }} />
          </Box>
          <Box sx={{ flex: 1, display: "flex", minWidth: 0 }}>
            {visibleItems.map((item, idx) => {
              const d = item.dateObj;
              const dayKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
              const isSelected = dayKey === selectedKey;
              const isLowest = item.TotalFare === lowestFare;
              const isPast = d < new Date(new Date().setHours(0, 0, 0, 0));
              const isLast = idx === visibleItems.length - 1;
              const dateLabel = `${DAY_SHORT[d.getDay()]}, ${d.getDate()} ${MONTH_SHORT[d.getMonth()]
                }`;
              return (
                <Box
                  key={item.DepartureDate}
                  onClick={() => !isPast && onDateChange && onDateChange(d)}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    textAlign: "center",
                    py: 1.2,
                    px: 0.3,
                    cursor: isPast ? "default" : "pointer",
                    opacity: isPast ? 0.4 : 1,
                    borderRight: isLast ? "none" : "1px solid #F3F4F6",
                    position: "relative",
                    transition: "background 0.12s",
                    "&:hover": !isPast ? { bgcolor: "#F9FAFB" } : {},
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: 9, sm: 11 },
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? "#111" : "#374151",
                      lineHeight: 1.4,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {dateLabel}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: 9, sm: 11 },
                      fontWeight: 600,
                      color: isSelected
                        ? "#1A914B"
                        : isLowest
                          ? "#1A914B"
                          : "#6B7280",
                      lineHeight: 1.4,
                      mt: 0.2,
                    }}
                  >
                    ₹{item.TotalFare.toLocaleString("en-IN")}
                  </Typography>
                  {isSelected && (
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: "10%",
                        right: "10%",
                        height: 3,
                        bgcolor: "#1A914B",
                        borderRadius: "3px 3px 0 0",
                      }}
                    />
                  )}
                </Box>
              );
            })}
          </Box>
          <Box
            onClick={() =>
              canNext &&
              setStartIdx((i) => Math.min(items.length - RT_VISIBLE, i + 1))
            }
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              flexShrink: 0,
              cursor: canNext ? "pointer" : "default",
              borderLeft: "1px solid #F3F4F6",
              color: canNext ? "#374151" : "#D1D5DB",
              "&:hover": canNext ? { bgcolor: "#F9FAFB" } : {},
              transition: "background 0.15s",
            }}
          >
            <ChevronRight sx={{ fontSize: 16 }} />
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid #E3E8EE",
        borderRadius: "14px",
        bgcolor: "#fff",
        mb: 2,
        overflow: "hidden",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" } }}>
        {renderStrip({
          items: onwardItems,
          startIdx: onwardStart,
          setStartIdx: setOnwardStart,
          selectedKey: onwardKey,
          lowestFare: onwardLowest,
          onDateChange: onOnwardDateChange,
          label: "Onward",
          fromCode: originCode,
          toCode: destCode,
        })}
        <Box
          sx={{
            width: { xs: "100%", sm: "1px" },
            height: { xs: "1px", sm: "auto" },
            bgcolor: "#E3E8EE",
            flexShrink: 0,
          }}
        />
        {renderStrip({
          items: returnItems,
          startIdx: returnStart,
          setStartIdx: setReturnStart,
          selectedKey: returnKey,
          lowestFare: returnLowest,
          onDateChange: onReturnDateChange,
          label: "Return",
          fromCode: destCode,
          toCode: originCode,
        })}
      </Box>
    </Paper>
  );
};

const RoundTripFlightCard = ({ flight, selected, onSelect }) => {
  const meta = getFlightMeta(flight);
  if (!meta) return null;

  const {
    depTime,
    arrTime,
    durationHours,
    durationMinutes,
    stopsCount,
    stopLabel,
    airlineName,
    airlineCode,
    flightNumber,
    originCity,
    destCity,
    segs,
  } = meta;
  const price = flight.Fare?.PublishedFare;
  return (
    <Paper
      elevation={0}
      onClick={onSelect}
      sx={{
        p: 1.5,
        mb: 1,
        borderRadius: "12px",
        border: `1.5px solid ${selected ? "#1A914B" : "#E3E8EE"}`,
        bgcolor: selected ? "#F0FDF4" : "#fff",
        cursor: "pointer",
        transition: "all 0.15s",
        "&:hover": { borderColor: "#1A914B", bgcolor: "#F0FDF4" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            minWidth: 0,
            flex: 1,
          }}
        >
          <AirlineLogo name={airlineName} code={airlineCode} size={28} />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 600,
                color: "#222",
                fontFamily: "Inter,Sans-serif",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {airlineName} · {airlineCode}-{flightNumber}
            </Typography>
            <Typography
              sx={{
                fontSize: 10.5,
                fontWeight: 500,
                color: flight.IsRefundable ? "#1A914B" : "#E57373",
              }}
            >
              {flight.IsRefundable ? "Refundable" : "Non-refundable"}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.8,
            flexShrink: 0,
            ml: 1,
          }}
        >
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 700,
              color: "#222",
              fontFamily: "Inter,Sans-serif",
            }}
          >
            ₹{price?.toLocaleString("en-IN")}
          </Typography>
          <Box
            sx={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              border: `2px solid ${selected ? "#1A914B" : "#D1D5DB"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {selected && (
              <Box
                sx={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  bgcolor: "#1A914B",
                }}
              />
            )}
          </Box>
        </Box>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
        <Box
          sx={{ flexShrink: 0, textAlign: "left", width: { xs: 46, sm: 52 } }}
        >
          <Typography
            sx={{
              fontSize: { xs: 14, sm: 17 },
              fontWeight: 700,
              color: "#111",
              fontFamily: "Inter,Sans-serif",
              lineHeight: 1.1,
            }}
          >
            {depTime}
          </Typography>
          <Typography
            sx={{
              fontSize: 10,
              color: "#888",
              fontFamily: "Inter,Sans-serif",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {originCity}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, textAlign: "center", px: 0.5 }}>
          <Typography
            sx={{
              fontSize: 10,
              color: "#F59E0B",
              fontWeight: 600,
              fontFamily: "Inter,Sans-serif",
              lineHeight: 1.3,
            }}
          >
            {durationHours}h {durationMinutes}m
          </Typography>
          <Box
            sx={{
              position: "relative",
              height: 8,
              my: 0.4,
              mx: "auto",
              width: "80%",
              maxWidth: 70,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: 0,
                right: 0,
                height: 2,
                bgcolor: "#F59E0B",
                borderRadius: 2,
                transform: "translateY(-50%)",
              }}
            />
            {Array.from({ length: stopsCount }).map((_, idx) => (
              <Box
                key={idx}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: `${((idx + 1) / (stopsCount + 1)) * 100}%`,
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: "#1A914B",
                  transform: "translate(-50%, -50%)",
                  boxShadow: "0 0 0 2px #fff",
                }}
              />
            ))}
          </Box>
         
        <Typography
            sx={{
              fontSize: 10,
              color: "#888",
              fontFamily: "Inter,Sans-serif",
              lineHeight: 1.3,
            }}
          >
            {stopLabel}
            {stopsCount > 0 &&
              ` • ${segs
                .slice(0, -1)
                .map((s) => s.Destination?.Airport?.CityCode)
                .join(",")}`}
          </Typography>
        </Box>
        <Box
          sx={{ flexShrink: 0, textAlign: "right", width: { xs: 46, sm: 52 } }}
        >
          <Typography
            sx={{
              fontSize: { xs: 14, sm: 17 },
              fontWeight: 700,
              color: "#111",
              fontFamily: "Inter,Sans-serif",
              lineHeight: 1.1,
            }}
          >
            {arrTime}
          </Typography>
          <Typography
            sx={{
              fontSize: 10,
              color: "#888",
              fontFamily: "Inter,Sans-serif",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {destCity}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

const CombinedRoundTripCard = ({ flight, onBook }) => {
  const segsArr = flight.Segments || [];
  const onwardSegs =
    segsArr.find((leg) => leg?.[0]?.TripIndicator === 1) || segsArr[0] || [];
  const returnSegs =
    segsArr.find((leg) => leg?.[0]?.TripIndicator === 2) || segsArr[1] || [];
  const onward = getLegMeta(onwardSegs);
  const ret = getLegMeta(returnSegs);
  if (!onward || !ret) return null;

  const price = flight.Fare?.PublishedFare || 0;
  const discount = flight.Fare?.Discount || 0;

  const LegBlock = ({ label, meta }) => (
    <Box sx={{ flex: 1, minWidth: 0, px: { xs: 1.5, sm: 2.5 }, py: 1.5 }}>
      <Typography
        sx={{
          fontSize: 12.5,
          fontWeight: 600,
          color: "#374151",
          mb: 1,
          fontFamily: "Inter,Sans-serif",
        }}
      >
        {label} • {meta.airlineName}
      </Typography>
      <Box
        sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}
      >
        <AirlineLogo
          name={meta.airlineName}
          code={meta.airlineCode}
          size={30}
        />
        <Box>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#111" }}>
            {meta.depTime}
          </Typography>
          <Typography sx={{ fontSize: 11.5, color: "#888" }}>
            {meta.originCode}
          </Typography>
        </Box>
        <Box sx={{ textAlign: "center", minWidth: 60 }}>
          <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>
            {meta.durationHours}h {meta.durationMinutes}m
          </Typography>
          <Box sx={{ height: 1, bgcolor: "#E5E7EB", my: 0.4 }} />
          <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>
            {meta.stopLabel}
          </Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#111" }}>
            {meta.arrTime}
          </Typography>
          <Typography sx={{ fontSize: 11.5, color: "#888" }}>
            {meta.destCode}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 1.5,
        borderRadius: "14px",
        border: "1px solid #E3E8EE",
        bgcolor: "#fff",
        overflow: "hidden",
        "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.08)" },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}>
        <LegBlock label="Onward" meta={onward} />
        <Box
          sx={{
            width: { xs: "100%", md: "1px" },
            height: { xs: "1px", md: "auto" },
            bgcolor: "#E3E8EE",
          }}
        />
        <LegBlock label="Return" meta={ret} />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: { xs: "flex-start", md: "flex-end" },
            justifyContent: "center",
            px: { xs: 1.5, sm: 2.5 },
            py: 1.5,
            gap: 0.5,
          }}
        >
          {discount > 0 && (
            <Typography
              sx={{ fontSize: 12, fontWeight: 600, color: "#16a34a" }}
            >
              Extra ₹{discount.toLocaleString("en-IN")} Off
            </Typography>
          )}
          <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#111" }}>
            ₹ {price.toLocaleString("en-IN")}
          </Typography>
          <Button
            variant="contained"
            onClick={() => onBook(flight)}
            sx={{
              bgcolor: "#F97316",
              "&:hover": { bgcolor: "#EA580C" },
              textTransform: "none",
              borderRadius: "8px",
              px: 3,
              fontWeight: 700,
              boxShadow: "none",
              fontFamily: "Inter,Sans-serif",
            }}
          >
            Book
          </Button>
          <Typography
            onClick={() => onBook(flight)}
            sx={{
              fontSize: 12.5,
              color: "#F97316",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "Inter,Sans-serif",
            }}
          >
            Flight Details ›
          </Typography>
        </Box>
      </Box>
      <Box sx={{ px: { xs: 1.5, sm: 2.5 }, pb: 1.5 }}>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            px: 1.2,
            py: 0.4,
            borderRadius: "50px",
            border: `1px solid ${flight.IsRefundable ? "#FDBA74" : "#FECACA"}`,
            bgcolor: flight.IsRefundable ? "#FFF7ED" : "#FEF2F2",
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 600,
              color: flight.IsRefundable ? "#C2410C" : "#991B1B",
            }}
          >
            {flight.IsRefundable ? "Partially Refundable" : "Non-refundable"}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

const RoundTripSummaryBar = ({ flight }) => {
  const meta = getFlightMeta(flight);
  if (!meta) return null;
  const {
    depTime,
    arrTime,
    airlineName,
    airlineCode,
    flightNumber,
    originCity,
    destCity,
  } = meta;
  const price = flight.Fare?.PublishedFare || 0;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, minWidth: 0 }}>
      <AirlineLogo name={airlineName} code={airlineCode} size={34} />
      <Box sx={{ minWidth: 0, flexShrink: 0 }}>
        <Typography
          sx={{
            fontSize: 12.5,
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.3,
            whiteSpace: "nowrap",
          }}
        >
          {airlineName}
        </Typography>
        <Typography
          sx={{
            fontSize: 11,
            color: "#B8BEC9",
            lineHeight: 1.3,
            whiteSpace: "nowrap",
          }}
        >
          {airlineCode}-{flightNumber}
        </Typography>
      </Box>
      <Box sx={{ textAlign: "center", flexShrink: 0, ml: 1 }}>
        <Typography
          sx={{
            fontSize: 13.5,
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.3,
          }}
        >
          {depTime}
        </Typography>
        <Typography
          sx={{ fontSize: 11, color: "#B8BEC9", whiteSpace: "nowrap" }}
        >
          {originCity}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: 15, color: "#B8BEC9", flexShrink: 0 }}>
        →
      </Typography>
      <Box sx={{ textAlign: "center", flexShrink: 0 }}>
        <Typography
          sx={{
            fontSize: 13.5,
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.3,
          }}
        >
          {arrTime}
        </Typography>
        <Typography
          sx={{ fontSize: 11, color: "#B8BEC9", whiteSpace: "nowrap" }}
        >
          {destCity}
        </Typography>
      </Box>
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 700,
          color: "#fff",
          flexShrink: 0,
          ml: 1.5,
          whiteSpace: "nowrap",
        }}
      >
        ₹ {price.toLocaleString("en-IN")}
      </Typography>
    </Box>
  );
};

const RoundTripLayout = ({
  onwardFlights,
  returnFlights,
  searchMeta,
  onBook,
  selectedOnward,
  setSelectedOnward,
  selectedReturn,
  setSelectedReturn,
  onOpenSidebar,
  isCombinedRoundTrip,
  hideBar,
}) => {
  const containerRef = useRef(null);
  const [barRect, setBarRect] = useState(null);

  useEffect(() => {
    const updateRect = () => {
      if (!containerRef.current) return;
      if (window.innerWidth < 900) {
        setBarRect(null);
        return;
      }
      const rect = containerRef.current.getBoundingClientRect();
      setBarRect({ left: rect.left, width: rect.width });
    };
    updateRect();
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, []);

  const fromCode = searchMeta?.fromCity?.code || "Origin";
  const toCode = searchMeta?.toCity?.code || "Dest";
  const depDate = searchMeta?.departureDate
    ? new Date(searchMeta.departureDate)
    : null;
  const retDate = searchMeta?.returnDate
    ? new Date(searchMeta.returnDate)
    : null;
  const formatDateTab = (d) =>
    d
      ? d.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
      : "";
  const totalPrice = isCombinedRoundTrip
    ? selectedOnward?.Fare?.PublishedFare || 0
    : (selectedOnward?.Fare?.PublishedFare || 0) +
    (selectedReturn?.Fare?.PublishedFare || 0);

  const handleSelectOnward = (flight) => {
    setSelectedOnward(flight);
    if (isCombinedRoundTrip) {
      const paired = returnFlights.find(
        (r) => r._comboResultIndex === flight._comboResultIndex,
      );
      if (paired) setSelectedReturn(paired);
    }
  };

  const handleSelectReturn = (flight) => {
    setSelectedReturn(flight);
    if (isCombinedRoundTrip) {
      const paired = onwardFlights.find(
        (r) => r._comboResultIndex === flight._comboResultIndex,
      );
      if (paired) setSelectedOnward(paired);
    }
  };

  return (
    <Box ref={containerRef}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
        }}
      >
        <Box>
          <Box
            sx={{
              bgcolor: "#fff",
              borderRadius: "12px",
              border: "1px solid #E3E8EE",
              px: 2,
              py: 1.2,
              mb: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <FlightTakeoff
              sx={{ fontSize: 16, color: "#1A914B", flexShrink: 0 }}
            />
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "Inter,Sans-serif",
                color: "#111",
              }}
            >
              {fromCode} → {toCode}
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                color: "#888",
                fontFamily: "Inter,Sans-serif",
                ml: "auto",
              }}
            >
              {formatDateTab(depDate)}
            </Typography>
          </Box>
          {onwardFlights.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                textAlign: "center",
                borderRadius: "12px",
                border: "1px solid #E3E8EE",
                bgcolor: "#fff",
              }}
            >
              <Typography
                sx={{
                  fontSize: 14,
                  fontFamily: "Inter,Sans-serif",
                  color: "#888",
                }}
              >
                No onward flights found
              </Typography>
            </Paper>
          ) : (
            onwardFlights.map((flight, i) => (
              <RoundTripFlightCard
                key={flight.ResultIndex || i}
                flight={flight}
                selected={selectedOnward?.ResultIndex === flight.ResultIndex}
                onSelect={() => handleSelectOnward(flight)}
              />
            ))
          )}
        </Box>
        <Box>
          <Box
            sx={{
              bgcolor: "#fff",
              borderRadius: "12px",
              border: "1px solid #E3E8EE",
              px: 2,
              py: 1.2,
              mb: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <FlightTakeoff
              sx={{
                fontSize: 16,
                color: "#1A914B",
                transform: "scaleX(-1)",
                flexShrink: 0,
              }}
            />
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "Inter,Sans-serif",
                color: "#111",
              }}
            >
              {toCode} → {fromCode}
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                fontFamily: "Inter,Sans-serif",
                color: "#888",
                ml: "auto",
              }}
            >
              {formatDateTab(retDate)}
            </Typography>
          </Box>
          {returnFlights.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                textAlign: "center",
                borderRadius: "12px",
                border: "1px solid #E3E8EE",
                bgcolor: "#fff",
              }}
            >
              <Typography
                sx={{
                  fontSize: 14,
                  color: "#888",
                  fontFamily: "Inter,Sans-serif",
                }}
              >
                No return flights found
              </Typography>
            </Paper>
          ) : (
            returnFlights.map((flight, i) => (
              <RoundTripFlightCard
                key={flight.ResultIndex || i}
                flight={flight}
                selected={selectedReturn?.ResultIndex === flight.ResultIndex}
                onSelect={() => handleSelectReturn(flight)}
              />
            ))
          )}
        </Box>
      </Box>
      {selectedOnward && selectedReturn && !hideBar && (
        <Box
          sx={{
            position: "fixed",
            bottom: { xs: 12, sm: 16, md: 20 },
            left: barRect ? barRect.left : "50%",
            transform: barRect ? "none" : "translateX(-50%)",
            width: barRect
              ? barRect.width
              : { xs: "calc(100% - 24px)", sm: "calc(100% - 32px)" },
            maxWidth: { xs: "100%", md: "none" },
            zIndex: 1200,
            bgcolor: "#4B5468",
            borderRadius: "14px",
            px: { xs: 2, sm: 3 },
            py: 1.8,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
            fontFamily: "Inter,Sans-serif",
            overflowX: "auto",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1.5, sm: 3 },
              minWidth: 0,
              flex: 1,
            }}
          >
            <RoundTripSummaryBar flight={selectedOnward} />
            <Box
              sx={{
                width: "1px",
                height: 32,
                bgcolor: "rgba(255,255,255,0.2)",
                flexShrink: 0,
              }}
            />
            <RoundTripSummaryBar flight={selectedReturn} />
          </Box>

          <Box
            sx={{
              width: "1px",
              height: 32,
              bgcolor: "rgba(255,255,255,0.2)",
              flexShrink: 0,
            }}
          />

          <Box
            sx={{ textAlign: "right", flexShrink: 0, cursor: "pointer" }}
            onClick={() => onOpenSidebar()}
          >
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1.3,
                whiteSpace: "nowrap",
              }}
            >
              ₹ {totalPrice.toLocaleString("en-IN")}
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                color: "#9CA3AF",
                textDecoration: "underline",
                whiteSpace: "nowrap",
              }}
            >
              Flight Details
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={() => onOpenSidebar()}
            sx={{
              bgcolor: "#1A914B",
              "&:hover": { bgcolor: "#157a3e" },
              textTransform: "none",
              borderRadius: "10px",
              px: { xs: 2.5, sm: 3.5 },
              py: 1.2,
              fontSize: { xs: 13, sm: 14 },
              fontWeight: 700,
              boxShadow: "none",
              fontFamily: "Inter,Sans-serif",
              flexShrink: 0,
            }}
          >
            Book Now
          </Button>
        </Box>
      )}
    </Box>
  );
};

const FlightsListingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { searchFlights } = useFlightSearch();
  const [selectedOnward, setSelectedOnward] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [rtSidebarOpen, setRtSidebarOpen] = useState(false);
  const [fareTypeFilter, setFareTypeFilter] = useState("");
  const [detailsPopupFlight, setDetailsPopupFlight] = useState(null);
  const {
    data: calendarData,
    returnData: calendarReturnData,
    loading: calendarLoading,
    fetchCalendarFare,
  } = useCalendarFare();

  const searchMeta = location.state || {};
  const traceId =
    location.state?.searchResult?.data?.TraceId ||
    location.state?.searchResult?.data?.results?.TraceId ||
    location.state?.traceId;
  const tripType = searchMeta.tripType || "oneway";

  useEffect(() => {
    const fromCode = searchMeta.fromCity?.code;
    const toCode = searchMeta.toCity?.code;
    if (!fromCode || !toCode) return;
    fetchCalendarFare({
      fromCode,
      toCode,
      departureDate: searchMeta.departureDate,
      returnDate: searchMeta.returnDate,
      tripType,
    });
  }, [
    searchMeta.fromCity?.code,
    searchMeta.toCity?.code,
    searchMeta.departureDate,
    searchMeta.returnDate,
    tripType,
  ]);

  const handleCalendarDateChange = useCallback(
    (newDate, isReturn = false) => {
      const params = { ...searchMeta };
      if (isReturn) {
        params.returnDate = newDate.toISOString();
      } else {
        params.departureDate = newDate.toISOString();
        if (params.returnDate && new Date(params.returnDate) <= newDate) {
          const next = new Date(newDate);
          next.setDate(next.getDate() + 1);
          params.returnDate = next.toISOString();
        }
      }
      setIsSearching(true);
      searchFlights({
        fromCity: searchMeta.fromCity,
        toCity: searchMeta.toCity,
        departureDate: new Date(params.departureDate),
        returnDate: params.returnDate ? new Date(params.returnDate) : null,
        passengers: searchMeta.passengers,
        cabinClass: searchMeta.cabinClass || "Economy",
        tripType,
      })
        .then((result) => {
          setIsSearching(false);
          if (!result) {
            setSearchError("No flights found for selected date.");
            return;
          }
          setSearchError("");
          navigate("/flights/listing", {
            state: {
              searchResult: result,
              flights: result?.data?.results?.Results || [],
              ...params,
            },
            replace: true,
          });
        })
        .catch(() => {
          setIsSearching(false);
          setSearchError("Search failed. Please try again.");
        });
    },
    [searchMeta, searchFlights, navigate, tripType],
  );

  const handleSearchFromBar = useCallback(
    (result, params) => {
      if (!result) {
        setSearchError(
          "No flights found or search timed out. Please try again.",
        );
        return;
      }
      setSearchError("");
      navigate("/flights/listing", {
        state: {
          searchResult: result,
          flights: result?.data?.results?.Results || [],
          ...params,
        },
        replace: true,
      });
    },
    [navigate],
  );

  const handleCombinedBook = (flight) => {
    const segsArr = flight.Segments || [];
    const onwardSegs =
      segsArr.find((leg) => leg?.[0]?.TripIndicator === 1) || segsArr[0] || [];
    const returnSegs =
      segsArr.find((leg) => leg?.[0]?.TripIndicator === 2) || segsArr[1] || [];

    const onwardObj = { ...flight, Segments: [onwardSegs] };

    setSelectedOnward(onwardObj);
    setSelectedReturn({
      ...flight,
      Segments: [returnSegs],
      Fare: { ...flight.Fare, PublishedFare: 0, BaseFare: 0, Tax: 0 },
    });
    setRtSidebarOpen(true);
  };

  const rawResults = useMemo(() => {
    const state = location.state || {};
    const data = state.searchResult?.data;
    if (!data)
      return { onwardFlights: [], returnFlights: [], isRoundTrip: false };
    return normalizeFlightResponse(data);
  }, [location.state]);

  const { onwardFlights, returnFlights, oneWayFlights } = useMemo(() => {
    if (tripType === "roundtrip")
      return {
        onwardFlights: rawResults.onwardFlights || [],
        returnFlights: rawResults.returnFlights || [],
        oneWayFlights: [],
      };
    return {
      onwardFlights: [],
      returnFlights: [],
      oneWayFlights: rawResults.onwardFlights || [],
    };
  }, [rawResults, tripType]);

  const allFlightsForFilters = useMemo(
    () =>
      tripType === "roundtrip"
        ? [...onwardFlights, ...returnFlights]
        : oneWayFlights,
    [tripType, onwardFlights, returnFlights, oneWayFlights],
  );
  const [minP, maxP] = useMemo(
    () => getPriceRange(allFlightsForFilters),
    [allFlightsForFilters],
  );
  const [priceRange, setPriceRange] = useState(null);
  const effectivePriceRange = priceRange || [minP, maxP];
  const uniqueAirlines = useMemo(
    () => getUniqueAirlines(allFlightsForFilters),
    [allFlightsForFilters],
  );
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [selectedStops, setSelectedStops] = useState([]);
  const [selectedAirlines, setSelectedAirlines] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const clearAll = () => {
    setPriceRange(null);
    setDepartureTime("");
    setArrivalTime("");
    setSelectedStops([]);
    setSelectedAirlines([]);
    setFareTypeFilter("");
  };
  const toggleItem = (setter, arr, val) =>
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const filteredFlights = useMemo(
    () =>
      applyFilters(
        oneWayFlights,
        effectivePriceRange,
        selectedStops,
        departureTime,
        arrivalTime,
        selectedAirlines,
        fareTypeFilter,
      ),
    [
      oneWayFlights,
      effectivePriceRange,
      selectedStops,
      departureTime,
      arrivalTime,
      selectedAirlines,
      fareTypeFilter,
    ],
  );
  const filteredOnwardFlights = useMemo(
    () =>
      applyFilters(
        onwardFlights,
        effectivePriceRange,
        selectedStops,
        departureTime,
        arrivalTime,
        selectedAirlines,
      ),
    [
      onwardFlights,
      effectivePriceRange,
      selectedStops,
      departureTime,
      arrivalTime,
      selectedAirlines,
    ],
  );
  const filteredReturnFlights = useMemo(
    () =>
      applyFilters(
        returnFlights,
        effectivePriceRange,
        selectedStops,
        departureTime,
        arrivalTime,
        selectedAirlines,
      ),
    [
      returnFlights,
      effectivePriceRange,
      selectedStops,
      departureTime,
      arrivalTime,
      selectedAirlines,
    ],
  );

  const FilterPanel = () => (
    <Paper
      elevation={0}
      sx={{
        width: { xs: "100%", md: "260px" },
        minWidth: { md: "240px" },
        p: 2.5,
        borderRadius: "16px",
        border: "1px solid #E3E8EE",
        bgcolor: "#fff",
        height: "fit-content",
        flexShrink: 0,
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography sx={{ fontSize: 17, fontWeight: 600, color: "#383E48" }}>
          Filter by:
        </Typography>
        <Typography
          onClick={clearAll}
          sx={{
            color: "#1A914B",
            textDecoration: "underline",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          Clear
        </Typography>
      </Box>
      <Typography
        sx={{
          fontSize: 15,
          fontWeight: 600,
          mb: 1.5,
          fontFamily: "Inter,Sans-serif",
          color: "#222",
        }}
      >
        Price Range
      </Typography>
      <Slider
        value={effectivePriceRange}
        onChange={(_, v) => setPriceRange(v)}
        min={minP}
        max={maxP}
        sx={{
          color: "#1A914B",
          "& .MuiSlider-thumb": { width: 18, height: 18 },
        }}
      />
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography
          sx={{ fontSize: 13, fontFamily: "Inter,Sans-serif", color: "#555" }}
        >
          ₹ {effectivePriceRange[0].toLocaleString("en-IN")}
        </Typography>
        <Typography
          sx={{ fontSize: 13, fontFamily: "Inter,Sans-serif", color: "#555" }}
        >
          ₹ {effectivePriceRange[1].toLocaleString("en-IN")}
        </Typography>
      </Box>
      <Divider sx={{ borderStyle: "dashed", mb: 2 }} />
      <Typography
        sx={{
          fontSize: 15,
          fontWeight: 600,
          mb: 1,
          fontFamily: "Inter,Sans-serif",
          color: "#222",
        }}
      >
        Stops
      </Typography>
      {["Nonstop", "1 Stop", "2+ Stop"].map((stop) => (
        <FormControlLabel
          key={stop}
          control={
            <Checkbox
              size="small"
              sx={checkboxStyle}
              checked={selectedStops.includes(stop)}
              onChange={() => toggleItem(setSelectedStops, selectedStops, stop)}
            />
          }
          label={
            <Typography
              sx={{
                fontSize: 13.5,
                fontFamily: "Inter,Sans-serif",
                color: "#444",
              }}
            >
              {stop}
            </Typography>
          }
          sx={{ ml: 0, display: "flex" }}
        />
      ))}
      <Divider sx={{ borderStyle: "dashed", my: 2 }} />
      <Typography
        sx={{
          fontSize: 15,
          fontWeight: 600,
          mb: 1,
          fontFamily: "Inter,Sans-serif",
          color: "#222",
        }}
      >
        Fare Type
      </Typography>
      <Box sx={{ display: "flex", gap: 1.2, mb: 2 }}>
        {[
          { key: "lcc", label: "LCC" },
          { key: "nonlcc", label: "Non-LCC" },
        ].map(({ key, label }) => (
          <Paper
            key={key}
            onClick={() => setFareTypeFilter(fareTypeFilter === key ? "" : key)}
            elevation={0}
            sx={{
              flex: 1,
              p: 1.2,
              textAlign: "center",
              borderRadius: "10px",
              cursor: "pointer",
              border:
                fareTypeFilter === key
                  ? "1.5px solid #1A914B"
                  : "1px solid #E3E8EE",
              backgroundColor: fareTypeFilter === key ? "#EAF7EF" : "#fff",
              "&:hover": { borderColor: "#1A914B" },
              transition: "all .15s",
            }}
          >
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: fareTypeFilter === key ? 700 : 500,
                color: fareTypeFilter === key ? "#1A914B" : "#555",
              }}
            >
              {label}
            </Typography>
          </Paper>
        ))}
      </Box>
      <Divider sx={{ borderStyle: "dashed", my: 2 }} />
      <Typography
        sx={{
          fontSize: 15,
          fontWeight: 600,
          mb: 1.5,
          fontFamily: "Inter,Sans-serif",
          color: "#222",
        }}
      >
        Departure from {searchMeta.fromCity?.code || "Origin"}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 1.2,
          mb: 2,
        }}
      >
        {timeSlots.map(({ label, icon }) => (
          <Paper
            key={label}
            onClick={() =>
              setDepartureTime(departureTime === label ? "" : label)
            }
            elevation={0}
            sx={{
              p: 1.2,
              textAlign: "center",
              borderRadius: "10px",
              cursor: "pointer",
              border:
                departureTime === label
                  ? "1.5px solid #1A914B"
                  : "1px solid #E3E8EE",
              backgroundColor: departureTime === label ? "#EAF7EF" : "#fff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.3,
              "&:hover": { borderColor: "#1A914B" },
              transition: "all .15s",
            }}
          >
            <img
              src={icon}
              alt={label}
              style={{
                width: 20,
                height: 20,
                filter:
                  departureTime === label
                    ? "invert(40%) sepia(90%) saturate(400%) hue-rotate(100deg)"
                    : "invert(60%)",
              }}
            />
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 500,
                color: departureTime === label ? "#1A914B" : "#555",
                lineHeight: 1.3,
              }}
            >
              {label}
            </Typography>
          </Paper>
        ))}
      </Box>
      <Typography
        sx={{
          fontSize: 15,
          fontWeight: 600,
          mb: 1.5,
          fontFamily: "Inter,Sans-serif",
          color: "#222",
        }}
      >
        Arrival at {searchMeta.toCity?.code || "Destination"}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 1.2,
          mb: 2,
        }}
      >
        {timeSlots.map(({ label, icon }) => (
          <Paper
            key={label}
            onClick={() => setArrivalTime(arrivalTime === label ? "" : label)}
            elevation={0}
            sx={{
              p: 1.2,
              textAlign: "center",
              borderRadius: "10px",
              cursor: "pointer",
              border:
                arrivalTime === label
                  ? "1.5px solid #1A914B"
                  : "1px solid #E3E8EE",
              backgroundColor: arrivalTime === label ? "#EAF7EF" : "#fff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.3,
              "&:hover": { borderColor: "#1A914B" },
              transition: "all .15s",
            }}
          >
            <img
              src={icon}
              alt={label}
              style={{
                width: 20,
                height: 20,
                filter:
                  arrivalTime === label
                    ? "invert(40%) sepia(90%) saturate(400%) hue-rotate(100deg)"
                    : "invert(60%)",
              }}
            />
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 500,
                color: arrivalTime === label ? "#1A914B" : "#555",
                lineHeight: 1.3,
              }}
            >
              {label}
            </Typography>
          </Paper>
        ))}
      </Box>
      <Divider sx={{ borderStyle: "dashed", my: 2 }} />
      <Typography
        sx={{
          fontSize: 15,
          fontWeight: 600,
          mb: 1,
          fontFamily: "Inter,Sans-serif",
          color: "#222",
        }}
      >
        Airlines
      </Typography>
      {uniqueAirlines.map((airline) => (
        <FormControlLabel
          key={airline}
          control={
            <Checkbox
              size="small"
              sx={checkboxStyle}
              checked={selectedAirlines.includes(airline)}
              onChange={() =>
                toggleItem(setSelectedAirlines, selectedAirlines, airline)
              }
            />
          }
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AirlineLogo name={airline} code="" size={24} />
              <Typography
                sx={{
                  fontSize: 13.5,
                  fontFamily: "Inter,Sans-serif",
                  color: "#444",
                }}
              >
                {airline}
              </Typography>
            </Box>
          }
          sx={{ ml: 0, display: "flex" }}
        />
      ))}
    </Paper>
  );

  const FlightCard = ({ flight }) => {
    const meta = getFlightMeta(flight);
    if (!meta) return null;
    const {
      depTime,
      arrTime,
      durationHours,
      durationMinutes,
      stopsCount,
      stopLabel,
      airlineName,
      airlineCode,
      flightNumber,
      originCity,
      destCity,
      segs,
    } = meta;
    const price = flight.Fare?.PublishedFare;
    const baggage = segs[0]?.Baggage || "15 KG";
    const cabinBag = segs[0]?.CabinBaggage || "7 KG";
    const fareClass = segs[0]?.SupplierFareClass || "";
    const seatsLeft = segs[0]?.NoOfSeatAvailable;

    return (
      <Paper
        elevation={0}
        sx={{
          mb: 1.5,
          borderRadius: "14px",
          border: "1px solid #E3E8EE",
          bgcolor: "#fff",
          overflow: "hidden",
          "&:hover": {
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            borderColor: "#ccc",
          },
          transition: "box-shadow .2s, border-color .2s",
        }}
      >
        {/* Desktop */}
        <Box
          sx={{
            display: { xs: "none", sm: "grid" },
            gridTemplateColumns: "1.8fr 1.2fr 1.4fr 1.2fr 1.4fr",
            alignItems: "center",
            p: 2.5,
            gap: 0,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <AirlineLogo name={airlineName} code={airlineCode} size={44} />
            <Box>
              <Typography
                sx={{
                  fontSize: 14.5,
                  fontWeight: 600,
                  fontFamily: "Inter,Sans-serif",
                  color: "#222",
                }}
              >
                {airlineName}
              </Typography>
              <Typography
                sx={{
                  fontSize: 12.5,
                  fontFamily: "Inter,Sans-serif",
                  color: "#888",
                }}
              >
                {airlineCode}-{flightNumber}
                {stopsCount > 0 &&
                  ` · ${stopsCount} stop${stopsCount > 1 ? "s" : ""}`}
              </Typography>
              <Typography
                onClick={() => setDetailsPopupFlight(flight)}
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#1A914B",
                  cursor: "pointer",
                  mt: 0.3,
                  fontFamily: "Inter,Sans-serif",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Flight Details
              </Typography>
            </Box>
          </Box>

          <Box>
            <Typography sx={{ fontSize: 17, fontWeight: 700, color: "#222" }}>
              {depTime}
            </Typography>
            <Typography
              sx={{
                fontSize: 12.5,
                fontFamily: "Inter,Sans-serif",
                color: "#888",
              }}
            >
              {originCity}
            </Typography>
          </Box>

          <Box sx={{ textAlign: "center" }}>
            <Typography
              sx={{ fontSize: 13, fontWeight: 600, color: "#F59E0B" }}
            >
              {durationHours}h {durationMinutes}m
            </Typography>
            <Box
              sx={{
                position: "relative",
                height: 8,
                my: 0.6,
                mx: "auto",
                width: "80%",
                maxWidth: 90,
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  right: 0,
                  height: 2,
                  bgcolor: "#F59E0B",
                  borderRadius: 2,
                  transform: "translateY(-50%)",
                }}
              />
              {Array.from({ length: stopsCount }).map((_, idx) => (
                <Box
                  key={idx}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: `${((idx + 1) / (stopsCount + 1)) * 100}%`,
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: "#1A914B",
                    transform: "translate(-50%, -50%)",
                    boxShadow: "0 0 0 2px #fff",
                  }}
                />
              ))}
            </Box>
           
           <Typography
                sx={{
                  fontSize: 10,
                  color: "#888",
                  fontFamily: "Inter,Sans-serif",
                }}
              >
                {stopLabel}
                {stopsCount > 0 &&
                  ` • ${segs
                    .slice(0, -1)
                    .map((s) => s.Destination?.Airport?.CityCode)
                    .join(",")}`}
              </Typography>
          </Box>

          <Box>
            <Typography sx={{ fontSize: 17, fontWeight: 700, color: "#222" }}>
              {arrTime}
            </Typography>
            <Typography
              sx={{
                fontSize: 12.5,
                fontFamily: "Inter,Sans-serif",
                color: "#888",
              }}
            >
              {destCity}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 2.5,
            }}
          >
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 800,
                color: "#111827",
                whiteSpace: "nowrap",
              }}
            >
              ₹{price?.toLocaleString("en-IN")}
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.6,
              }}
            >
              <Button
                variant="contained"
                onClick={() => {
                  setSelectedFlight(flight);
                  setSidebarOpen(true);
                }}
                sx={{
                  bgcolor: "#1A914B",
                  "&:hover": { bgcolor: "#157a3e" },
                  textTransform: "none",
                  borderRadius: "10px",
                  px: 4,
                  py: 1.1,
                  fontSize: 14,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  boxShadow: "none",
                  fontFamily: "Inter,Sans-serif",
                }}
              >
                Book Now
              </Button>
              <Typography
                sx={{
                  fontSize: 12,
                  fontFamily: "Inter,Sans-serif",
                  color: seatsLeft <= 5 ? "#E57373" : "#6B7280",
                  fontWeight: seatsLeft <= 5 ? 600 : 400,
                  whiteSpace: "nowrap",
                }}
              >
                {seatsLeft} Seats Available
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Mobile */}
        <Box
          sx={{
            display: { xs: "flex", sm: "none" },
            flexDirection: "column",
            p: 1.5,
            gap: 1,
          }}
        >
          {/* Row 1 */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                minWidth: 0,
                flex: 1,
              }}
              onClick={() => setDetailsPopupFlight(flight)}
              style={{ cursor: "pointer" }}
            >
              <AirlineLogo name={airlineName} code={airlineCode} size={32} />
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "#222",
                    fontFamily: "Inter,Sans-serif",
                    lineHeight: 1.2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {airlineName}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 10.5,
                    color: "#888",
                    fontFamily: "Inter,Sans-serif",
                  }}
                >
                  {airlineCode}-{flightNumber}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ textAlign: "right", flexShrink: 0, ml: 1 }}>
              <Typography
                sx={{
                  fontSize: { xs: 14, sm: 17 },
                  fontWeight: 700,
                  color: "#111",
                  fontFamily: "Inter,Sans-serif",
                  lineHeight: 1.2,
                }}
              >
                ₹{price?.toLocaleString("en-IN")}
              </Typography>
              {seatsLeft <= 5 && (
                <Typography
                  sx={{
                    fontSize: 10,
                    color: "#E57373",
                    fontWeight: 600,
                    fontFamily: "Inter,Sans-serif",
                  }}
                >
                  {seatsLeft} seats left!
                </Typography>
              )}
            </Box>
          </Box>

          {/* Row 2: Flight timeline */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                flexShrink: 0,
                textAlign: "left",
                width: { xs: 44, sm: 50 },
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: 13, sm: 15 },
                  fontWeight: 700,
                  color: "#111",
                  fontFamily: "Inter,Sans-serif",
                  lineHeight: 1.1,
                }}
              >
                {depTime}
              </Typography>
              <Typography
                sx={{
                  fontSize: 10,
                  color: "#888",
                  fontFamily: "Inter,Sans-serif",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {originCity}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: "center", minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: 10,
                  color: "#F59E0B",
                  fontWeight: 600,
                  fontFamily: "Inter,Sans-serif",
                }}
              >
                {durationHours}h {durationMinutes}m
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.3,
                  my: 0.3,
                }}
              >
                <Box
                  sx={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    bgcolor: "#D1D5DB",
                  }}
                />
                {segs.slice(0, -1).map((_, i) => (
                  <React.Fragment key={i}>
                    <Box sx={{ flex: 1, height: 1, bgcolor: "#E5E7EB" }} />
                    <Box
                      sx={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        bgcolor: "#9CA3AF",
                      }}
                    />
                  </React.Fragment>
                ))}
                <Box sx={{ flex: 1, height: 1, bgcolor: "#E5E7EB" }} />
                <Box
                  sx={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    bgcolor: "#D1D5DB",
                  }}
                />
              </Box>
              <Typography
                sx={{
                  fontSize: 10,
                  color: "#888",
                  fontFamily: "Inter,Sans-serif",
                }}
              >
                {stopLabel}
              </Typography>
              {stopsCount > 0 && (
                <Typography
                  sx={{
                    fontSize: 10,
                    color: "#aaa",
                    fontFamily: "Inter,Sans-serif",
                  }}
                >
                  via{" "}
                  {segs
                    .slice(0, -1)
                    .map((s) => s.Destination?.Airport?.CityCode)
                    .join(", ")}
                </Typography>
              )}
            </Box>
            <Box
              sx={{
                flexShrink: 0,
                textAlign: "right",
                width: { xs: 44, sm: 50 },
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: 13, sm: 15 },
                  fontWeight: 700,
                  color: "#111",
                  fontFamily: "Inter,Sans-serif",
                  lineHeight: 1.1,
                }}
              >
                {arrTime}
              </Typography>
              <Typography
                sx={{
                  fontSize: 10,
                  color: "#888",
                  fontFamily: "Inter,Sans-serif",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {destCity}
              </Typography>
            </Box>
          </Box>

          {/* Row 3 */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              pt: 0.5,
              borderTop: "1px solid #F3F4F6",
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: 10.5,
                  color: flight.IsRefundable ? "#1A914B" : "#E57373",
                  fontWeight: 600,
                  fontFamily: "Inter,Sans-serif",
                }}
              >
                {flight.IsRefundable ? "✓ Refundable" : "✗ Non-refundable"}
              </Typography>
              <Typography
                sx={{
                  fontSize: 10,
                  color: "#9ca3af",
                  fontFamily: "Inter,Sans-serif",
                }}
              >
                Cabin: {cabinBag} · Checkin: {baggage}
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={() => {
                setSelectedFlight(flight);
                setSidebarOpen(true);
              }}
              sx={{
                bgcolor: "#1A914B",
                "&:hover": { bgcolor: "#157a3e" },
                textTransform: "none",
                borderRadius: "8px",
                px: 2,
                py: 0.7,
                fontSize: 12.5,
                fontWeight: 600,
                whiteSpace: "nowrap",
                boxShadow: "none",
                fontFamily: "Inter,Sans-serif",
              }}
            >
              Book Now
            </Button>
          </Box>
        </Box>
      </Paper>
    );
  };

  return (
    <Box
      sx={{
        // bgcolor: "#F5F7FA",
        minHeight: "100vh",
        overflowX: "hidden",
        width: "100%",
      }}
    >
      {isSearching && (
        <AirplaneLoader onDismiss={() => setIsSearching(false)} />
      )}

      <FlightSearch
        key={`${searchMeta.departureDate || ""}-${searchMeta.returnDate || ""}`}
        initialFrom={searchMeta.fromCity}
        initialTo={searchMeta.toCity}
        initialDate={searchMeta.departureDate}
        initialReturnDate={searchMeta.returnDate}
        initialTripType={searchMeta.tripType}
        initialPassengers={searchMeta.passengers}
        initialCabinClass={searchMeta.cabinClass}
        onSearch={handleSearchFromBar}
        stickyHeader={true}  
      />

      <SearchErrorBanner
        message={searchError}
        onClose={() => setSearchError("")}
      />

      <Box sx={{ display: { xs: "flex", md: "none" }, px: 2, pt: 2, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={() => setFilterOpen((p) => !p)}
          sx={{
            borderColor: "#1A914B",
            color: "#1A914B",
            borderRadius: "8px",
            textTransform: "none",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "Inter,Sans-serif",
          }}
        >
          {filterOpen ? "Hide Filters" : "Show Filters"}
        </Button>
        <Typography
          sx={{
            fontSize: 13.5,
            color: "#555",
            alignSelf: "center",
            ml: 1,
            fontFamily: "Inter,Sans-serif",
          }}
        >
          {tripType === "roundtrip"
            ? `${filteredOnwardFlights.length} onward · ${filteredReturnFlights.length} return`
            : `${filteredFlights.length} results`}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 2, md: 3 },
          p: { xs: 3, sm: 2.5, md: 3 },
          maxWidth: 1400,
          mx: "auto",
          alignItems: "flex-start",
          boxSizing: "border-box",
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: { xs: filterOpen ? "block" : "none", md: "block" },
            width: { xs: "100%", md: "auto" },
            boxSizing: "border-box",
          }}
        >
          <FilterPanel />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0, boxSizing: "border-box" }}>
          {tripType === "oneway" ? (
            <CalendarFareStrip
              calendarData={calendarData}
              loading={calendarLoading}
              selectedDate={searchMeta.departureDate}
              onDateChange={(d) => handleCalendarDateChange(d, false)}
              label="Fare Calendar"
              originCode={searchMeta.fromCity?.code || ""}
              destCode={searchMeta.toCity?.code || ""}
            />
          ) : (
            <RoundTripCalendarStrip
              onwardData={calendarData}
              returnData={calendarReturnData}
              loading={calendarLoading}
              selectedOnwardDate={searchMeta.departureDate}
              selectedReturnDate={searchMeta.returnDate}
              onOnwardDateChange={(d) => handleCalendarDateChange(d, false)}
              onReturnDateChange={(d) => handleCalendarDateChange(d, true)}
              originCode={searchMeta.fromCity?.code || ""}
              destCode={searchMeta.toCity?.code || ""}
            />
          )}

          {tripType === "roundtrip" ? (
            rawResults.isCombinedRoundTrip ? (
              filteredOnwardFlights.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 5,
                    textAlign: "center",
                    borderRadius: "14px",
                    border: "1px solid #E3E8EE",
                    bgcolor: "#fff",
                  }}
                >
                  <Typography
                    sx={{ fontSize: 17, color: "#555", fontWeight: 500 }}
                  >
                    No flights match your filters
                  </Typography>
                </Paper>
              ) : (
                filteredOnwardFlights.map((flight, i) => (
                  <CombinedRoundTripCard
                    key={flight.ResultIndex || i}
                    flight={flight}
                    onBook={handleCombinedBook}
                  />
                ))
              )
            ) : (
              // NAYA — bas ek prop add kiya
              <RoundTripLayout
                onwardFlights={filteredOnwardFlights}
                returnFlights={filteredReturnFlights}
                searchMeta={searchMeta}
                onBook={(onward, ret) =>
                  navigate("/book-flight", {
                    state: {
                      onwardFlight: onward,
                      returnFlight: ret,
                      searchMeta,
                    },
                  })
                }
                selectedOnward={selectedOnward}
                setSelectedOnward={setSelectedOnward}
                selectedReturn={selectedReturn}
                setSelectedReturn={setSelectedReturn}
                onOpenSidebar={() => setRtSidebarOpen(true)}
                isCombinedRoundTrip={rawResults.isCombinedRoundTrip}
                hideBar={rtSidebarOpen}
              />
            )
          ) : (
            <>
              {filteredFlights.length > 0 && (
                <Box
                  sx={{
                    display: { xs: "none", sm: "grid" },
                    gridTemplateColumns: "1.8fr 1.2fr 1.4fr 1.2fr 1.4fr",
                    px: { xs: 1, sm: 2, md: 2.5 },
                    py: 1.2,
                    mb: 0.5,
                  }}
                >
                  {["Airline", "Departure", "Duration", "Arrival", "Price"].map(
                    (h) => (
                      <Typography
                        key={h}
                        sx={{
                          fontSize: 12.5,
                          fontFamily: "Inter,Sans-serif",
                          color: "#9CA3AF",
                          fontWeight: 500,
                          textAlign: h === "Price" ? "right" : "left",
                        }}
                      >
                        {h}
                      </Typography>
                    ),
                  )}
                </Box>
              )}
              {filteredFlights.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 5,
                    textAlign: "center",
                    borderRadius: "14px",
                    border: "1px solid #E3E8EE",
                    bgcolor: "#fff",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 17,
                      color: "#555",
                      fontWeight: 500,
                      fontFamily: "Inter,Sans-serif",
                    }}
                  >
                    {rawResults.length === 0
                      ? "No flights data received"
                      : "No flights match your filters"}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 13.5,
                      color: "#9CA3AF",
                      mt: 1,
                      fontFamily: "Inter,Sans-serif",
                    }}
                  >
                    {rawResults.length === 0
                      ? "Please search again"
                      : "Try adjusting your filters"}
                  </Typography>
                </Paper>
              ) : (
                filteredFlights.map((flight, i) => (
                  <FlightCard key={flight.ResultIndex || i} flight={flight} />
                ))
              )}
            </>
          )}
        </Box>
      </Box>

      {tripType === "oneway" && (
        <FlightDetailSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          flight={selectedFlight}
          searchMeta={searchMeta}
          traceId={traceId}
        />
      )}
      <RoundTripDetailSidebar
        open={rtSidebarOpen}
        onClose={() => setRtSidebarOpen(false)}
        onwardFlight={selectedOnward}
        returnFlight={selectedReturn}
        searchMeta={searchMeta}
        traceId={traceId}
        isCombinedRoundTrip={rawResults.isCombinedRoundTrip}
      />

      <FlightDetailsPopup
        open={!!detailsPopupFlight}
        onClose={() => setDetailsPopupFlight(null)}
        flight={detailsPopupFlight}
      />
    </Box>
  );
};

export default FlightsListingPage;
