// src/components/hotel/BookingSuccessPage.jsx
//
// ✅ CHANGES IN THIS FILE ONLY (Hotel module) — Bus/Flight modules and the
// shared QRPaymentModal.jsx are completely untouched:
//   1. Import HotelQRPayment instead of QRPaymentModal (new, hotel-only file)
//   2. New useEffect: when paymentStatus becomes "CANCELLED", close the
//      QR view (qrOpen=false) and go back to the normal booking page
//   3. New early-return: while qrOpen is true (and we're not already
//      redirecting to the ticket page), render the QR payment as a full
//      in-page view instead of behind a Dialog — this removes the
//      Dialog vs SweetAlert2 z-index conflict entirely
//   4. Removed the old <QRPaymentModal .../> usage at the bottom (no
//      longer needed since QR is now rendered via the early-return above)

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Divider,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import SquareFootOutlinedIcon from "@mui/icons-material/SquareFootOutlined";
import BedOutlinedIcon from "@mui/icons-material/BedOutlined";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import { usePayment } from "components/travel-hooks/hotels/usePayment";
import { hotelFetch } from "travel-api/hotelApi";
import { useCountdown } from "components/travel-hooks/hotels/useCountdown";
import HotelQRPayment from "./HotelQRPayment"; // ✅ CHANGED — was: import QRPaymentModal from "./QRPaymentModal";
import useTravelAuthGuard from "components/travel-hooks/useTravelAuthGuard";
import QRPaymentPage from "./QRPaymentPage";
import CancellationPolicyModal from "./CancellationPolicyModal";
import Swal from "sweetalert2";

const GREEN = "#16a34a";
const BORDER = "#e5e7eb";
const LIGHT = "#6b7280";
const DARK = "#111827";
const BG = "#f5f7fa";
const FONT = "'DM Sans', sans-serif";

const InfoItem = ({ icon, text }) =>
  text ? (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
      {icon}
      <Typography
        sx={{ fontSize: 13, color: "#374151", fontFamily: "Inter, sans-serif" }}
      >
        {text}
      </Typography>
    </Box>
  ) : null;

const Facility = ({ label }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
    <CheckCircleIcon sx={{ fontSize: 14, color: GREEN }} />
    <Typography
      sx={{ fontSize: 12.5, color: "#374151", fontFamily: "Inter, sans-serif" }}
    >
      {label}
    </Typography>
  </Box>
);

const Stars = ({ count = 4 }) => (
  <Box
    sx={{
      px: 1,
      py: 0.3,
      bgcolor: "#fef3c7",
      borderRadius: "6px",
      fontSize: 12,
      fontWeight: 700,
      fontFamily: "Inter, sans-serif",
    }}
  >
    {count} ★
  </Box>
);

// ✅ NEW — aaj ki date ko "Mon, 17 Aug" jaisa format deta hai, bilkul
// checkInDay/checkInDate ki tarah, taaki "Now" label ke niche real date
// dikh sake.
const getTodayFormatted = () => {
  const today = new Date();
  const day = today.toLocaleDateString("en-IN", { weekday: "short" });
  const date = today.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
  return { day, date };
};

// ✅ NEW — CancelPolicies (DD-MM-YYYY HH:mm:ss) ya ISO date string ko
// "17 Aug" jaisa short readable format deta hai (deadline caption ke liye)
const formatShortDate = (value) => {
  if (!value) return "";
  const str = String(value).trim();

  const ddmmyyyy = str.match(/^(\d{2})-(\d{2})-(\d{4})/);
  let d, m, y;
  if (ddmmyyyy) {
    [, d, m, y] = ddmmyyyy;
  } else {
    const datePart = str.split("T")[0];
    [y, m, d] = datePart.split("-");
  }
  if (!d || !m || !y) return "";

  const dt = new Date(Number(y), Number(m) - 1, Number(d));
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

// ✅ UPDATED — ab checkInDay / checkInDate props leta hai taaki "Now" aur
// "Check-in" dono labels ke niche REAL dates dikhayi ja sakein (response/
// state ke data se), static text ki jagah.
const CancelTimeline = ({
  cancelPolicies,
  isRefundable,
  checkInDay,
  checkInDate,
  lastCancellationDeadline, // ✅ NEW — free cancellation ki last date (agar hai)
}) => {
  const today = getTodayFormatted();

  // ✅ NEW — agar refundable hai aur deadline mil gayi, to ek chhota
  // caption dikhao: "Free cancellation till 16 Aug"
  const freeTillLabel =
    isRefundable && lastCancellationDeadline
      ? formatShortDate(lastCancellationDeadline)
      : null;

  return (
    <Box sx={{ bgcolor: "#fef2f2", borderRadius: "14px", p: 2, mb: 2 }}>
      <Typography
        sx={{
          textAlign: "center",
          fontSize: 13,
          color: "#374151",
          mb: 1.5,
          fontFamily: "Inter, sans-serif",
        }}
      >
        {isRefundable ? "Partially Refundable" : "Non Refundable"}
      </Typography>

      {/* ✅ NEW — free cancellation cutoff caption, sirf jab data mile */}
      {freeTillLabel && (
        <Typography
          sx={{
            textAlign: "center",
            fontSize: 12,
            fontWeight: 600,
            color: GREEN,
            mb: 1.2,
            fontFamily: "Inter, sans-serif",
          }}
        >
          Free cancellation till {freeTillLabel}
        </Typography>
      )}

      <Box sx={{ position: "relative", height: 24, mb: 1 }}>
        <Box
          sx={{
            position: "absolute",
            left: 12,
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            height: 2,
            bgcolor: "#ef4444",
          }}
        />
        <Box
          sx={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            bgcolor: "#ef4444",
            position: "absolute",
            left: 0,
            top: 3,
          }}
        />
        <Box
          sx={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            bgcolor: "#ef4444",
            position: "absolute",
            right: 0,
            top: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#fff" }}
          />
        </Box>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* ✅ UPDATED — "Now" ke niche aaj ki real date */}
        <Box>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 600,
              color: LIGHT,
              fontFamily: "Inter, sans-serif",
            }}
          >
            Now
          </Typography>
          <Typography
            sx={{ fontSize: 11, color: "#9ca3af", fontFamily: "Inter, sans-serif" }}
          >
            {today.day}, {today.date}
          </Typography>
        </Box>

        {/* ✅ UPDATED — "Check-in" ke niche real check-in date (state se) */}
        <Box sx={{ textAlign: "right" }}>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 600,
              color: LIGHT,
              fontFamily: "Inter, sans-serif",
            }}
          >
            Check-in
          </Typography>
          {(checkInDay || checkInDate) && (
            <Typography
              sx={{ fontSize: 11, color: "#9ca3af", fontFamily: "Inter, sans-serif" }}
            >
              {checkInDay}
              {checkInDay && checkInDate ? ", " : ""}
              {checkInDate}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

// Formats an API date string ("2026-07-20T00:00:00" / "2026-07-20") as
// DD/MM/YYYY WITHOUT going through `new Date()` — parsing that way can
// shift the date by a day depending on the browser's timezone offset.
// We only read the Y/M/D digits directly from the string.
const formatCancelDate = (value) => {
  if (!value) return "";
  const datePart = String(value).split("T")[0]; // "2026-07-20"
  const [y, m, d] = datePart.split("-");
  if (!y || !m || !d) return value;
  return `${d}/${m}/${y}`;
};

const getCancellationDesc = (cancelPolicies, fallbackDesc) => {
  if (!cancelPolicies || cancelPolicies.length === 0) return fallbackDesc;
  const last = cancelPolicies[cancelPolicies.length - 1];
  if (last.CancellationCharge === 0) return "Free cancellation available";
  if (last.ChargeType === "Percentage")
    return `${last.CancellationCharge}% amount will be deducted on cancellations`;
  return `₹${Number(last.CancellationCharge).toLocaleString(
    "en-IN",
  )} will be deducted on cancellations`;
};

// ✅ UPDATED — ab bookingLoading / bookingFailed / isDuplicateBooking bhi
// handle karta hai. Payment success ho sakta hai lekin actual hotel
// booking (Book API) fail ho sakti hai, ya pehle se exist kar sakti hai —
// teeno states alag dikhane zaroori hain.
const StatusHeader = ({
  paymentStatus,
  leadEmail,
  isCancelled,
  bookingLoading,
  bookingFailed,
  bookingErrorMessage,
  isDuplicateBooking,
}) => {
  // ✅ NAYA — Payment ho gaya, ab booking confirm ho rahi hai (Book API call chal rahi hai)
  if (paymentStatus === "SUCCESS" && bookingLoading)
    return (
      <Box
        sx={{
          bgcolor: "#fefce8",
          px: { xs: 2, sm: 3 },
          py: 2.5,
          display: "flex",
          gap: 1.5,
          alignItems: "flex-start",
        }}
      >
        <CircularProgress
          size={28}
          sx={{ color: "#ca8a04", mt: "2px", flexShrink: 0 }}
        />
        <Box>
          <Typography
            sx={{
              fontSize: { xs: 18, sm: 20 },
              fontWeight: 800,
              color: "#ca8a04",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Confirming Your Booking
          </Typography>
          <Typography
            sx={{
              fontSize: 13.5,
              color: "#374151",
              mt: 0.5,
              lineHeight: 1.6,
              fontFamily: "Inter, sans-serif",
            }}
          >
            Payment received. We're confirming your hotel booking, please
            wait...
          </Typography>
        </Box>
      </Box>
    );

  // ✅ NAYA — Payment ho gaya lekin Book API fail hui:
  // ya to explicit failure (Invalid Token), ya duplicate booking
  // ("Booking already exists"). Dono ko alag color/message diya.
  if (paymentStatus === "SUCCESS" && bookingFailed)
    return (
      <Box
        sx={{
          bgcolor: isDuplicateBooking ? "#fefce8" : "#fef2f2",
          px: { xs: 2, sm: 3 },
          py: 2.5,
          display: "flex",
          gap: 1.5,
          alignItems: "flex-start",
        }}
      >
        <ErrorOutlinedIcon
          sx={{
            color: isDuplicateBooking ? "#ca8a04" : "#ef4444",
            fontSize: 30,
            mt: "2px",
          }}
        />
        <Box>
          <Typography
            sx={{
              fontSize: { xs: 18, sm: 20 },
              fontWeight: 800,
              color: isDuplicateBooking ? "#ca8a04" : "#ef4444",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {isDuplicateBooking
              ? "Booking Already Exists"
              : "Booking Could Not Be Confirmed"}
          </Typography>
          <Typography
            sx={{
              fontSize: 13.5,
              color: "#374151",
              mt: 0.5,
              lineHeight: 1.6,
              fontFamily: "Inter, sans-serif",
            }}
          >
            {isDuplicateBooking
              ? "Looks like this room is already booked under your account for these dates. Your payment was successful — please check My Trips to find your existing booking, or contact support if you don't see it there."
              : `Your payment was successful, but we couldn't confirm the hotel booking${bookingErrorMessage ? ` (${bookingErrorMessage})` : ""
              }. Don't worry — your money is safe. Please contact support with your Booking ID for assistance.`}
          </Typography>
        </Box>
      </Box>
    );

  if (paymentStatus === "SUCCESS")
    return (
      <Box
        sx={{
          bgcolor: "#dcfce7",
          px: { xs: 2, sm: 3 },
          py: 2.5,
          display: "flex",
          gap: 1.5,
          alignItems: "flex-start",
        }}
      >
        <CheckCircleIcon sx={{ color: GREEN, fontSize: 30, mt: "2px" }} />
        <Box>
          <Typography
            sx={{
              fontSize: { xs: 18, sm: 20 },
              fontWeight: 800,
              color: GREEN,
              fontFamily: "Inter, sans-serif",
            }}
          >
            Booking Confirmed
          </Typography>
          <Typography
            sx={{
              fontSize: 13.5,
              color: "#374151",
              mt: 0.5,
              lineHeight: 1.6,
              fontFamily: "Inter, sans-serif",
            }}
          >
            Your booking is confirmed.
            {leadEmail && ` A confirmation mail will be sent to ${leadEmail}.`}
          </Typography>
        </Box>
      </Box>
    );

  if (paymentStatus === "FAILED")
    return (
      <Box
        sx={{
          bgcolor: "#fef2f2",
          px: { xs: 2, sm: 3 },
          py: 2.5,
          display: "flex",
          gap: 1.5,
          alignItems: "flex-start",
        }}
      >
        <ErrorOutlinedIcon sx={{ color: "#ef4444", fontSize: 30, mt: "2px" }} />
        <Box>
          <Typography
            sx={{
              fontSize: { xs: 18, sm: 20 },
              fontWeight: 800,
              color: "#ef4444",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Payment Failed
          </Typography>
          <Typography
            sx={{
              fontSize: 13.5,
              color: "#374151",
              mt: 0.5,
              lineHeight: 1.6,
              fontFamily: "Inter, sans-serif",
            }}
          >
            Your payment could not be processed. Please try again.
          </Typography>
        </Box>
      </Box>
    );

  if (isCancelled)
    return (
      <Box
        sx={{
          bgcolor: "#f3f4f6",
          px: { xs: 2, sm: 3 },
          py: 2.5,
          display: "flex",
          gap: 1.5,
          alignItems: "flex-start",
        }}
      >
        <ErrorOutlinedIcon sx={{ color: LIGHT, fontSize: 30, mt: "2px" }} />
        <Box>
          <Typography
            sx={{
              fontSize: { xs: 18, sm: 20 },
              fontWeight: 800,
              color: DARK,
              fontFamily: "Inter, sans-serif",
            }}
          >
            Payment Cancelled
          </Typography>
          <Typography
            sx={{
              fontSize: 13.5,
              color: "#374151",
              mt: 0.5,
              lineHeight: 1.6,
              fontFamily: "Inter, sans-serif",
            }}
          >
            You have cancelled the payment.
          </Typography>
        </Box>
      </Box>
    );

  if (paymentStatus === "PENDING")
    return (
      <Box
        sx={{
          bgcolor: "#fefce8",
          px: { xs: 2, sm: 3 },
          py: 2.5,
          display: "flex",
          gap: 1.5,
          alignItems: "flex-start",
        }}
      >
        <CircularProgress
          size={28}
          sx={{ color: "#ca8a04", mt: "2px", flexShrink: 0 }}
        />
        <Box>
          <Typography
            sx={{
              fontSize: { xs: 18, sm: 20 },
              fontWeight: 800,
              color: "#ca8a04",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Payment Pending
          </Typography>
          <Typography
            sx={{
              fontSize: 13.5,
              color: "#374151",
              mt: 0.5,
              lineHeight: 1.6,
              fontFamily: "Inter, sans-serif",
            }}
          >
            Your payment is being processed. Please wait...
          </Typography>
        </Box>
      </Box>
    );

  return null;
};

const BookingSuccessPage = () => {
  // ✅ Auth is already enforced globally in App.jsx (AuthGate + mandatory
  // AuthModal), so no per-page guard is needed here.
  const { state } = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  // ── usePayment — bookingResult + booking added ────────────
  const {
    initiatePayment,
    cancelPayment,
    cancelling,
    initiating,
 paymentStatus: hookPaymentStatus,
    paymentData: hookPaymentData,
    bookingResult: hookBookingResult, // ✅ destructured here
    booking, // ✅ NAYA — Book API abhi call ho rahi hai ya nahi
    resetKey,
    handleClientExpiry,
  } = usePayment();


  const paymentStatus = hookPaymentStatus ?? state?.paymentStatus ?? null;
  const paymentData = hookPaymentData ?? state?.paymentData ?? null;
  const bookingResult = hookBookingResult ?? state?.bookingResult ?? null;
  const [qrOpen, setQrOpen] = useState(false);
  const [redirecting, setRedirecting] = useState(false); // ✅ naya state — redirect loader ke liye
  const [cancelPolicyOpen, setCancelPolicyOpen] = useState(false); // ✅ NEW — cancellation policy modal

  const { mins, secs, isExpired } = useCountdown(
    paymentData?.expiryDate ?? null,
    paymentData?._ts ?? null,
    false,
    resetKey,
    handleClientExpiry,
  );

  const prebookData = state?.prebookData ?? null;
  const prebookId =
    state?.prebookId ??
    prebookData?.data?.prebookId ??
    sessionStorage.getItem("hotel_prebookId") ??
    null;

  const hotelSnapshot = state?.hotelSnapshot ?? {};
  const roomSnapshot = state?.roomSnapshot ?? {};

  const hotelName = hotelSnapshot.hotelName ?? "Hotel";
  const hotelStars = hotelSnapshot.hotelStars ?? 4;
  const hotelImage =
    hotelSnapshot.hotelImage ??
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80";
  const hotelLocation = hotelSnapshot.hotelLocation ?? "";
  const checkInTime = hotelSnapshot.checkInTime ?? "";
  const checkOutTime = hotelSnapshot.checkOutTime ?? "";

  const roomName = roomSnapshot.roomName ?? "Room";
  const roomSize = roomSnapshot.size ?? "";
  const bedType = roomSnapshot.bedType ?? "";
  const sleeps = roomSnapshot.maxOccupancy ?? "";
  const viewType = roomSnapshot.viewType ?? "";
  const inclusions = roomSnapshot.inclusions ?? [];
  const roomImage =
    roomSnapshot.images?.[0] ??
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300&q=80";

  const checkInDay = state?.checkInDay ?? "";
  const checkInDate = state?.checkInDate ?? "";
  const checkOutDay = state?.checkOutDay ?? "";
  const checkOutDate = state?.checkOutDate ?? "";
  const nights = state?.nights ?? 1;
  const roomQty = state?.roomQty ?? 1;
  const currency = state?.currency ?? "₹";

  const prebookRoom =
    prebookData?.data?.tboResponse?.HotelResult?.[0]?.Rooms?.[0] ?? {};
  const confirmedFare = prebookRoom.TotalFare ?? state?.baseAmount ?? 0;
  const confirmedTax = prebookRoom.TotalTax ?? state?.taxAmount ?? 0;
  const confirmedNet = prebookRoom.NetAmount ?? confirmedFare + confirmedTax;
  const convenienceFee = state?.convenienceFee ?? 0;
  const isRefundable = prebookRoom.IsRefundable ?? state?.isRefundable ?? false;
  const cancelPolicies = prebookRoom.CancelPolicies ?? [];
  // ✅ NEW — API response mein directly available field, free-cancellation
  // ki last date/time batata hai (e.g. "16-08-2026 23:59:59")
  const lastCancellationDeadline = prebookRoom.LastCancellationDeadline ?? null;
  const cancellationDesc =
    state?.cancellationDesc ?? "100% amount will be deducted on cancellations";
  const bookingId = prebookId ?? "—";
  const leadEmail = state?.leadEmail ?? "";

  const isCancelled = paymentStatus === "CANCELLED";
  const showExpiredState = paymentStatus === "EXPIRED" && !initiating;

  // ✅ NAYA — Book API business-level failure detect karo.
  // Ye dono cases cover karta hai:
  // 1) { success: false, error: {...} } — jaisa "Invalid Token"
  // 2) { success: true, data: { hotel_booking_status: "FAILED", ... } } —
  //    jaisa "Booking already exists". usePayment.js dono ko normalize
  //    karke { success: false, error, isDuplicate? } shape mein deta hai.
  const bookingFailed =
    paymentStatus === "SUCCESS" &&
    !!bookingResult &&
    bookingResult.success === false;
  const bookingErrorMessage =
    bookingResult?.error?.message ?? bookingResult?.error?.code ?? "";
  // ✅ NAYA — "Booking already exists" jaisa duplicate-booking case ko
  // alag (softer, non-alarming) UI dikhane ke liye
  const isDuplicateBooking = bookingFailed && !!bookingResult?.isDuplicate;
  // ✅ NAYA — Payment success ho gaya lekin bookingResult abhi aaya nahi
  // (ya Book API call chal rahi hai) — "Confirming..." dikhane ke liye
  const bookingLoading =
    paymentStatus === "SUCCESS" &&
    (booking || (!bookingResult && !bookingFailed));

  const dynamicCancellationDesc = getCancellationDesc(
    cancelPolicies,
    cancellationDesc,
  );

  // ── Auto cancel on page leave if PENDING ─────────────────
  useEffect(() => {
    return () => {
      if (prebookId && paymentStatus === "PENDING") {
        hotelFetch("/api/hotelv2/payment/cancel/", {
          body: { prebookId: String(prebookId) },
        }).catch(() => { });
      }
    };
  }, [prebookId, paymentStatus]);

  // ── Close QR on success ───────────────────────────────────
  useEffect(() => {
    if (paymentStatus === "SUCCESS") {
      setTimeout(() => setQrOpen(false), 2500);
      sessionStorage.removeItem("hotel_prebookId");
    }
  }, [paymentStatus]);

  // ── Navigate to ticket page after booking confirmed ───────
  useEffect(() => {
    // ✅ UPDATED — sirf tab redirect karo jab booking actually successful
    // ho (bookingResult.success !== false). Business-level failure ya
    // duplicate booking (dono "Invalid Token" aur "Booking already exists"
    // jaise cases) pe redirect mat karo — StatusHeader apni error UI dikhayega.
    if (
      paymentStatus === "SUCCESS" &&
      bookingResult &&
      bookingResult.success !== false &&
      !bookingResult.error
    ) {
      setRedirecting(true); // ✅ turant redirect loader dikhao
      const timer = setTimeout(() => {
        navigate("/hotel/booking-ticket", {
          state: {
            bookingResult,
            paymentMeta: {
              orderId: paymentData?.orderId ?? null,
              mode: paymentData?.mode ?? "UPI",
              transactionTimestamp: paymentData?.transactionTimestamp ?? "",
            },
            hotelSnapshot,
            roomSnapshot,
            checkInDay,
            checkInDate,
            checkOutDay,
            checkOutDate,
            nights,
            roomQty,
            currency,
            confirmedNet,
            convenienceFee,
            leadEmail,
            leadName: state?.leadName ?? "",
            leadPhone: state?.leadPhone ?? "",
            passengers: state?.passengers ?? [],
            prebookId,
          },
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus, bookingResult]);


 
useEffect(() => {
  if (bookingFailed) {
    Swal.fire({
      icon: isDuplicateBooking ? "warning" : "error",
      title: isDuplicateBooking
        ? "Booking Already Exists"
        : "Booking Could Not Be Confirmed",
      text: isDuplicateBooking
        ? "This room is already booked in your account for these dates. Payment was successful — please check My Trips or contact support."
        : `Payment was successful, but the hotel booking could not be confirmed${
            bookingErrorMessage ? ` (${bookingErrorMessage})` : ""
          }. Please contact support with your Booking ID.`,
      confirmButtonText: "OK",
      confirmButtonColor: GREEN,
      allowOutsideClick: false,
    }).then(() => {
      navigate("/");
    });
  }
}, [bookingFailed]);

  // ── Handlers ──────────────────────────────────────────────
 const handlePayNow = () => {
  if (!prebookId) {
    alert("Prebook ID not found. Please go back and try again.");
    return;
  }
  navigate("/hotels/qr-payment", {
    state: {
      ...state,                 // ✅ pura existing state forward — taaki wapas aane par usePayment/redirect logic chal sake
      prebookId,
      hotelName,
      hotelLocation,
      checkInDay,
      checkInDate,
      checkOutDay,
      checkOutDate,
      roomFare: confirmedFare,
      taxAmount: confirmedTax,
      convenienceFee,
      totalPayable: confirmedNet + convenienceFee,
      currency,
    },
  });
};

  const handleRetry = async () => {
    if (!prebookId || initiating) return;
    try {
      await initiatePayment(prebookId, { onSuccess: () => setQrOpen(true) });
    } catch (err) {
      // console.error("Retry failed:", err);
    }
  };

  const handleCancel = async () => {
    if (!prebookId || cancelling) return;
    await cancelPayment(prebookId);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        // bgcolor: BG,
        p: { xs: 1.5, sm: 2.5, md: 4 },
        fontFamily: "Inter, sans-serif",
        mt: { xs: "56px", md: "0px" },
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: 2.5,
          alignItems: "flex-start",
        }}
      >
        {/* ══ LEFT ══ */}
        <Box
          sx={{
            flex: 1,
            width: "100%",
            bgcolor: "#fff",
            borderRadius: "18px",
            border: `1px solid ${BORDER}`,
            overflow: "hidden",
          }}
        >
          <StatusHeader
            paymentStatus={paymentStatus}
            leadEmail={leadEmail}
            isCancelled={isCancelled}
            bookingLoading={bookingLoading}
            bookingFailed={bookingFailed}
            bookingErrorMessage={bookingErrorMessage}
            isDuplicateBooking={isDuplicateBooking}
          />

          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography
              sx={{
                fontSize: 13,
                color: LIGHT,
                mb: 2.5,
                fontFamily: "Inter, sans-serif",
              }}
            >
              Booking ID : {bookingId}
            </Typography>

            {/* Hotel info */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Box
                component="img"
                src={hotelImage}
                alt={hotelName}
                sx={{
                  width: { xs: "100%", sm: 100 },
                  height: { xs: 200, sm: 90 },
                  borderRadius: "12px",
                  objectFit: "cover",
                  flexShrink: 0,
                }}
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=200&q=80";
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <Stars count={hotelStars} />
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      color: LIGHT,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    Hotel
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: { xs: 18, sm: 22 },
                    fontWeight: 800,
                    color: DARK,
                    fontFamily: "Inter, sans-serif",
                    lineHeight: 1.3,
                  }}
                >
                  {hotelName}
                </Typography>
                {hotelLocation && (
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: LIGHT,
                      mt: 0.5,
                      lineHeight: 1.6,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {hotelLocation}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Check-in / Check-out */}
            <Box
              sx={{
                mt: 3,
                pt: 3,
                pb: 3,
                borderTop: `1px dashed ${BORDER}`,
                borderBottom: `1px dashed ${BORDER}`,
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
                alignItems: { md: "center" },
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.7,
                    mb: 0.5,
                  }}
                >
                  <CalendarTodayOutlinedIcon
                    sx={{ fontSize: 14, color: LIGHT }}
                  />
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: LIGHT,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    Check-in
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: { xs: 20, sm: 24 },
                    fontWeight: 800,
                    color: DARK,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {checkInDay}
                  {checkInDay && checkInDate ? ", " : ""}
                  {checkInDate}
                </Typography>
                {checkInTime && (
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      color: LIGHT,
                      mt: 0.3,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {checkInTime}
                  </Typography>
                )}
              </Box>

              <Box
                sx={{
                  px: 2.5,
                  py: 0.8,
                  bgcolor: "#dcfce7",
                  color: GREEN,
                  borderRadius: "30px",
                  fontWeight: 700,
                  fontSize: 13,
                  width: "fit-content",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {nights} Night{nights > 1 ? "s" : ""}
              </Box>

              <Box sx={{ flex: 1, textAlign: { md: "right" } }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: { md: "flex-end" },
                    alignItems: "center",
                    gap: 0.7,
                    mb: 0.5,
                  }}
                >
                  <CalendarTodayOutlinedIcon
                    sx={{ fontSize: 14, color: LIGHT }}
                  />
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: LIGHT,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    Check-out
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: { xs: 20, sm: 24 },
                    fontWeight: 800,
                    color: DARK,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {checkOutDay}
                  {checkOutDay && checkOutDate ? ", " : ""}
                  {checkOutDate}
                </Typography>
                {checkOutTime && (
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      color: LIGHT,
                      mt: 0.3,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {checkOutTime}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Room info */}
            <Box sx={{ mt: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  gap: { xs: 1.5, sm: 2 },
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <Box
                  sx={{
                    width: { xs: "100%", sm: 100 },
                    height: { xs: 160, sm: 80 },
                    borderRadius: "10px",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  <Box
                    component="img"
                    src={roomImage}
                    alt={roomName}
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300&q=80";
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: DARK,
                      mb: 1.2,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {roomQty} x {roomName}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "10px 18px",
                      mb: 1.2,
                    }}
                  >
                    <InfoItem
                      icon={
                        <SquareFootOutlinedIcon
                          sx={{ fontSize: 15, color: LIGHT }}
                        />
                      }
                      text={roomSize}
                    />
                    <InfoItem
                      icon={
                        <BedOutlinedIcon sx={{ fontSize: 15, color: LIGHT }} />
                      }
                      text={bedType}
                    />
                    <InfoItem
                      icon={
                        <PeopleOutlineOutlinedIcon
                          sx={{ fontSize: 15, color: LIGHT }}
                        />
                      }
                      text={sleeps ? `Sleeps ${sleeps}` : ""}
                    />
                    <InfoItem
                      icon={
                        <ApartmentOutlinedIcon
                          sx={{ fontSize: 15, color: LIGHT }}
                        />
                      }
                      text={viewType}
                    />
                  </Box>
                  {inclusions.length > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px 14px",
                      }}
                    >
                      {inclusions.map((inc, i) => (
                        <Facility key={i} label={inc} />
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Cancellation dates */}
            {cancelPolicies.length > 0 && (
              <Box sx={{ mt: 3, pt: 2.5, borderTop: `1px dashed ${BORDER}` }}>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: DARK,
                    mb: 1.2,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Cancellation Dates
                </Typography>
                {cancelPolicies.map((p, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.8,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 13,
                        color: LIGHT,
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      From {formatCancelDate(p.FromDate)}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 600,
                        fontFamily: "Inter, sans-serif",
                        color: p.CancellationCharge > 0 ? "#ef4444" : GREEN,
                      }}
                    >
                      {p.CancellationCharge === 0
                        ? "Free"
                        : p.ChargeType === "Percentage"
                          ? `${p.CancellationCharge}%`
                          : `₹${Number(p.CancellationCharge).toLocaleString(
                            "en-IN",
                          )}`}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>

        {/* ══ RIGHT ══ */}
        <Box
          sx={{
            width: { xs: "100%", lg: 330 },
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            position: { lg: "sticky" },
            top: 20,
          }}
        >
          {/* Fare summary */}
          <Box
            sx={{
              bgcolor: "#fff",
              borderRadius: "18px",
              border: `1px solid ${BORDER}`,
              p: 2.5,
            }}
          >
            <Typography
              sx={{
                fontSize: 17,
                fontWeight: 800,
                color: DARK,
                mb: 2,
                fontFamily: "Inter, sans-serif",
              }}
            >
              Fare Summary
            </Typography>
            {[
              {
                label: `${roomQty} Room, ${nights} Night${nights > 1 ? "s" : ""
                  }`,
                value: `${currency}${Number(confirmedFare).toLocaleString(
                  "en-IN",
                )}`,
              },
              {
                label: "Taxes & Charges",
                value: `${currency}${Number(confirmedTax).toLocaleString(
                  "en-IN",
                )}`,
              },
            ].map((row, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1.4,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13.5,
                    color: "#374151",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {row.label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: DARK,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {row.value}
                </Typography>
              </Box>
            ))}
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography
                sx={{
                  fontSize: 13.5,
                  color: "#374151",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Convenience Fee
              </Typography>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                {convenienceFee === 0 && (
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      color: "#9ca3af",
                      textDecoration: "line-through",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    ₹100
                  </Typography>
                )}
                <Typography
                  sx={{
                    fontSize: 13.5,
                    fontWeight: 700,
                    fontFamily: "Inter, sans-serif",
                    color: convenienceFee === 0 ? GREEN : DARK,
                  }}
                >
                  {currency}
                  {convenienceFee === 0
                    ? "0"
                    : Number(convenienceFee).toLocaleString("en-IN")}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 2, borderColor: "#f3f4f6" }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: DARK,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Net Amount Payable
              </Typography>
              <Typography
                sx={{
                  fontSize: 17,
                  fontWeight: 800,
                  color: DARK,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {currency}
                {Number(confirmedNet + convenienceFee).toLocaleString("en-IN")}
              </Typography>
            </Box>
          </Box>

          {/* Cancellation Policy */}
          <Box
            sx={{
              bgcolor: "#fff",
              borderRadius: "18px",
              border: `1px solid ${BORDER}`,
              p: 2.5,
            }}
          >
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 800,
                color: DARK,
                mb: 1,
                fontFamily: "Inter, sans-serif",
              }}
            >
              Cancellation Policy
            </Typography>
            <Typography
              sx={{
                fontSize: 13,
                color: LIGHT,
                mb: 2,
                lineHeight: 1.7,
                fontFamily: "Inter, sans-serif",
              }}
            >
              {dynamicCancellationDesc}
            </Typography>
            {/* ✅ UPDATED — CancelTimeline ko ab checkInDay/checkInDate/
                lastCancellationDeadline pass kiya, taaki Now/Check-in
                labels ke niche real dates dikhein */}
            <CancelTimeline
              cancelPolicies={cancelPolicies}
              isRefundable={isRefundable}
              checkInDay={checkInDay}
              checkInDate={checkInDate}
              lastCancellationDeadline={lastCancellationDeadline}
            />
            <Typography
              onClick={() => setCancelPolicyOpen(true)} // ✅ NEW
              sx={{
                fontSize: 13,
                fontWeight: 700,
                color: GREEN,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              View Cancellation Policy
            </Typography>
          </Box>

          {/* Pay Now button */}
          <Button
            fullWidth
            onClick={handlePayNow}
            disabled={initiating || paymentStatus === "SUCCESS" || isCancelled}
            sx={{
              bgcolor: GREEN,
              color: "#fff",
              borderRadius: "12px",
              py: 1.6,
              fontWeight: 700,
              textTransform: "none",
              fontSize: 16,
              fontFamily: "Inter, sans-serif",
              boxShadow: "0 4px 14px rgba(22,163,74,0.3)",
              "&:hover": { bgcolor: "#15803d" },
              "&.Mui-disabled": { bgcolor: "#86efac", color: "#fff" },
            }}
          >
            {initiating ? (
              <CircularProgress size={22} sx={{ color: "#fff" }} />
            ) : paymentStatus === "SUCCESS" ? (
              "Payment Successful ✓"
            ) : isCancelled ? (
              "Payment Cancelled"
            ) : (
              "Pay Now"
            )}
          </Button>

          {paymentStatus &&
            !["PENDING", "SUCCESS", "CANCELLED"].includes(paymentStatus) && (
              <Typography
                sx={{
                  textAlign: "center",
                  fontSize: 13,
                  color: "#ef4444",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Payment {paymentStatus.toLowerCase()}. Please try again.
              </Typography>
            )}

          {/* ✅ NAYA — Booking fail/duplicate hone par support/my-trips CTA */}
          {/* {bookingFailed && (
            <Box
              sx={{
                bgcolor: "#fff",
                borderRadius: "18px",
                border: `1px solid ${isDuplicateBooking ? "#fde68a" : "#fecaca"}`,
                p: 2.5,
              }}
            >
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: isDuplicateBooking ? "#ca8a04" : "#ef4444",
                  mb: 0.8,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Need Help?
              </Typography>
              <Typography
                sx={{ fontSize: 12.5, color: LIGHT, mb: 1.5, lineHeight: 1.6, fontFamily: "Inter, sans-serif" }}
              >
                {isDuplicateBooking
                  ? "This booking may already be confirmed under your account. Check My Trips to be sure."
                  : `Contact support with your Booking ID (${bookingId})${bookingErrorMessage ? ` and error reference "${bookingErrorMessage}"` : ""} so we can confirm your booking manually.`}
              </Typography>
              <Button
                fullWidth
                onClick={() => navigate(isDuplicateBooking ? "/my-travel-trips" : "/support")}
                variant="outlined"
                sx={{
                  borderRadius: "10px",
                  py: 1.2,
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: 13.5,
                  fontFamily: "Inter, sans-serif",
                  borderColor: isDuplicateBooking ? GREEN : "#ef4444",
                  color: isDuplicateBooking ? GREEN : "#ef4444",
                  "&:hover": {
                    borderColor: isDuplicateBooking ? "#15803d" : "#dc2626",
                    bgcolor: isDuplicateBooking ? "#f0fdf4" : "#fef2f2",
                  },
                }}
              >
                {isDuplicateBooking ? "Check My Trips" : "Contact Support"}
              </Button>
            </Box>
          )} */}
        </Box>
      </Box>

      {/* QR Modal */}
      <QRPaymentPage
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        paymentData={paymentData}
        paymentStatus={paymentStatus}
        initiating={initiating}
        cancelling={cancelling}
        isExpired={showExpiredState}
        mins={mins}
        secs={secs}
        currency={currency}
        onRetry={handleRetry}
        onCancel={handleCancel}
        hotelName={hotelName}
        hotelLocation={hotelLocation}
        checkInDay={checkInDay}
        checkInDate={checkInDate}
        checkOutDay={checkOutDay}
        checkOutDate={checkOutDate}
        roomFare={confirmedFare}
        taxAmount={confirmedTax}
        convenienceFee={convenienceFee}
        totalPayable={confirmedNet + convenienceFee}
      />

      {/* ✅ NEW — Cancellation policy detail modal */}
      <CancellationPolicyModal
        open={cancelPolicyOpen}
        onClose={() => setCancelPolicyOpen(false)}
        cancelPolicies={cancelPolicies}
        isRefundable={isRefundable}
      />

      {/* ✅ Redirect loader — payment success ke baad ticket page pe le jaate waqt */}
      {redirecting && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            bgcolor: "rgba(255,255,255,0.92)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <CircularProgress size={48} sx={{ color: GREEN }} />
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 700,
              color: DARK,
              fontFamily: "Inter, sans-serif",
            }}
          >
            Booking Confirmed! 🎉
          </Typography>
          <Typography
            sx={{
              fontSize: 13.5,
              color: LIGHT,
              fontFamily: "Inter, sans-serif",
            }}
          >
            Redirecting you to your ticket...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default BookingSuccessPage;