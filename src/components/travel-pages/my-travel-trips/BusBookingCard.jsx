// pages\my-travel-trips\BusBookingCard.jsx
import React from "react";
import { Box, Typography } from "@mui/material";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";

const BORDER_BLUE = "#1e3a5f";
const CARD_BG = "#f3f4f6";
const TEXT_DARK = "#1a1a1a";
const LINE_GRAY = "#c9c2b4";

/*
  ✅ FIX (zoom / responsiveness issue at 125% browser zoom):
  Pehle card ki sizing sirf MUI ke xs/sm breakpoints (viewport-width based)
  par depend karti thi, aur notches + bus image ke liye fixed px values
  (-9px offset, 18px circle, 62/120px image) hardcoded thi.

  Browser zoom (125%, 150% etc.) par effective CSS viewport width badalti
  hai lekin content utne hi fixed px me render hota hai — isliye overflow,
  notch-clipping, image-overlap ho raha tha.

  Solution: har jagah `clamp(min, fluid, max)` use kiya hai jo container
  ki actual rendered width (not viewport breakpoint) ke hisaab se scale
  hoti hai. Isse card kisi bhi zoom level (90%–150%) ya kisi bhi laptop
  screen size par proportionally sahi dikhega, breakpoint "jump" nahi hoga.
*/

// ✅ Agar decimal part ".00" hai to use hide kar do (sirf "150" dikhao),
// warna asli decimal value dikhao (jaise "150.50"). Isse amount text
// chhota rehta hai aur zoom pe adjacent boxes ke saath merge/overlap
// nahi hota.
const formatAmount = (value) => {
  const num = Number(value ?? 0);
  if (Number.isNaN(num)) return value ?? "0";
  return num % 1 === 0 ? num.toFixed(0) : num.toFixed(2).replace(/0$/, "");
};

const formatBookedAt = (isoString) => {
  if (!isoString) return "-";
  try {
    const date = new Date(isoString);
    const datePart = date
      .toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
      .toUpperCase();
    const timePart = date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${datePart}, ${timePart} (IST)`;
  } catch (e) {
    return isoString;
  }
};

// Number of scallop notches down each side of the ticket
const NOTCH_COUNT = 7;

// Fluid notch size — scales with card width instead of a fixed px value
const NOTCH_SIZE = "clamp(12px, 4.2%, 18px)";

const Notches = ({ side }) =>
  Array.from({ length: NOTCH_COUNT }).map((_, i) => (
    <Box
      key={`${side}-${i}`}
      sx={{
        position: "absolute",
        [side]: `calc(${NOTCH_SIZE} / -2)`,
        top: `${((i + 0.5) / NOTCH_COUNT) * 100}%`,
        transform: "translateY(-50%)",
        width: NOTCH_SIZE,
        height: NOTCH_SIZE,
        borderRadius: "50%",
        bgcolor: "#ffffff",
        border: `1.2px solid ${LINE_GRAY}`,
        zIndex: 2,
        boxSizing: "border-box",
      }}
    />
  ));

const BoxedField = ({ icon, label, value, sx }) => (
  <Box
    sx={{
      border: `1.2px solid ${LINE_GRAY}`,
      borderRadius: "10px",
      p: "clamp(6px, 1.8%, 9px)",
      display: "flex",
      alignItems: "center",
      gap: "clamp(6px, 1.8%, 9px)",
      minWidth: 0,
      boxSizing: "border-box",
      ...sx,
    }}
  >
    <Box sx={{ color: BORDER_BLUE, display: "flex", flexShrink: 0 }}>{icon}</Box>
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography
        sx={{
          fontSize: "clamp(9px, 2.4vw, 10.5px)",
          fontWeight: 600,
          color: "#555",
          textTransform: "uppercase",
          letterSpacing: "0.02em",
          lineHeight: 1.3,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: "clamp(12.5px, 3vw, 14.5px)",
          fontWeight: 800,
          color: TEXT_DARK,
          wordBreak: "break-word",
          lineHeight: 1.2,
        }}
      >
        {value}
      </Typography>
    </Box>
  </Box>
);

const BusBookingCard = ({ booking, onClick }) => {
  const {
    ticket_number,
    booking_status,
    invoice_number,
    invoice_amount,
    bus_id,
    total_amount,
    booked_at,
    trace_id,
  } = booking || {};

  const isConfirmed = (booking_status || "").toLowerCase() === "confirmed";

  return (
    <Box
      onClick={() => onClick?.(booking)}
      sx={{
        position: "relative",
        bgcolor: CARD_BG,
        borderRadius: "13px",
        p: "clamp(16px, 4vw, 22px)",
        maxWidth: 420,
        width: "100%",
        mx: "auto",
        boxSizing: "border-box",
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        "&:hover": {
          transform: "translateY(-2px)",
        },
      }}
    >
      <Notches side="left" />
      <Notches side="right" />

      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1, minWidth: 0 }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{
              fontSize: "clamp(9.5px, 2.4vw, 11px)",
              fontWeight: 600,
              color: "#444",
              letterSpacing: "0.03em",
            }}
          >
            TICKET NUMBER
          </Typography>
          <Typography
            sx={{
              fontSize: "clamp(15px, 3.8vw, 18px)",
              fontWeight: 800,
              color: TEXT_DARK,
              wordBreak: "break-all",
              lineHeight: 1.15,
            }}
          >
            {ticket_number || "-"}
          </Typography>
        </Box>

        <Box
          component="img"
          src="/busimg.png"
          alt="Bus"
          sx={{
            width: "clamp(58px, 22%, 120px)",
            maxWidth: "40%",
            height: "auto",
            objectFit: "contain",
            flexShrink: 0,
            mt: 0.3,
          }}
        />
      </Box>

      {/* Status pill */}
      <Box
        sx={{
          display: "inline-block",
          mt: 0.5,
          mb: 0.8,
          px: "clamp(10px, 2.5%, 14px)",
          py: 0.25,
          borderRadius: "16px",
          bgcolor: isConfirmed ? "#c9e8c9" : "#f5c6c6",
          border: `1.2px solid ${isConfirmed ? "#4caf50" : "#e53935"}`,
          boxShadow: isConfirmed ? "0 0 8px rgba(76, 175, 80, 0.45)" : "0 0 8px rgba(229, 57, 53, 0.35)",
        }}
      >
        <Typography
          sx={{
            fontSize: "clamp(10px, 2.6vw, 11.5px)",
            fontWeight: 700,
            color: isConfirmed ? "#1b5e20" : "#8e0000",
            letterSpacing: "0.02em",
          }}
        >
          {(booking_status || "Unknown").toUpperCase()}
        </Typography>
      </Box>

      {/* Bus ID + Invoice No */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "clamp(6px, 1.8%, 9px)",
          mb: 0.7,
        }}
      >
        <BoxedField icon={<DirectionsBusIcon sx={{ fontSize: 16 }} />} label="Bus ID" value={bus_id ?? "-"} />
        <BoxedField
          icon={<ReceiptLongIcon sx={{ fontSize: 16 }} />}
          label="Invoice No."
          value={invoice_number || "-"}
        />
      </Box>

      {/* Payment details shaded box */}
      <Box
        sx={{
          bgcolor: "rgba(0,0,0,0.05)",
          borderRadius: "10px",
          p: "clamp(8px, 2%, 11px)",
          mb: 0.7,
          boxSizing: "border-box",
        }}
      >
        <Typography
          sx={{
            fontSize: "clamp(11.5px, 2.8vw, 13px)",
            fontWeight: 800,
            color: TEXT_DARK,
            mb: 0.5,
          }}
        >
          PAYMENT DETAILS
        </Typography>

        <Box sx={{ display: "flex", alignItems: "stretch", gap: "clamp(10px, 3%, 16px)" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "clamp(6px, 1.8%, 8px)",
              flex: "1 1 0",
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: "clamp(20px, 5.5%, 24px)",
                height: "clamp(20px, 5.5%, 24px)",
                borderRadius: "50%",
                border: `1.2px solid ${BORDER_BLUE}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: BORDER_BLUE,
                flexShrink: 0,
              }}
            >
              <CurrencyRupeeIcon sx={{ fontSize: 13 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{ fontSize: "clamp(9px, 2.2vw, 10px)", fontWeight: 600, color: "#555", textTransform: "uppercase" }}
              >
                Total Amount
              </Typography>
              <Typography
                sx={{
                  fontSize: "clamp(13px, 3.2vw, 14.5px)",
                  fontWeight: 800,
                  color: TEXT_DARK,
                  whiteSpace: "nowrap",
                }}
              >
                ₹{formatAmount(total_amount)}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ width: "1.2px", bgcolor: LINE_GRAY, my: 0.3, flexShrink: 0 }} />

          <Box sx={{ flex: "1 1 0", minWidth: 0, overflow: "hidden" }}>
            <Typography
              sx={{ fontSize: "clamp(9px, 2.2vw, 10px)", fontWeight: 600, color: "#555", textTransform: "uppercase" }}
            >
              Invoice Amount
            </Typography>
            <Typography
              sx={{
                fontSize: "clamp(13px, 3.2vw, 14.5px)",
                fontWeight: 800,
                color: TEXT_DARK,
                whiteSpace: "nowrap",
              }}
            >
              ₹{formatAmount(invoice_amount)}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Booked At */}
      <BoxedField
        icon={<CalendarMonthIcon sx={{ fontSize: 16 }} />}
        label="Booked At"
        value={formatBookedAt(booked_at)}
        sx={{ mb: trace_id ? 0.6 : 0 }}
      />

      {trace_id && (
        <Typography
          sx={{
            fontSize: "clamp(9px, 2.2vw, 10px)",
            color: "#555",
            wordBreak: "break-all",
          }}
        >
          Trace ID: {trace_id}
        </Typography>
      )}
    </Box>
  );
};

export default BusBookingCard;