// pages\my-travel-trips\HotelCard.jsx
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Divider,
  Button,
  CircularProgress,
} from "@mui/material";
import HotelIcon from "@mui/icons-material/Hotel";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PaymentIcon from "@mui/icons-material/Payment";
import Swal from "sweetalert2";
import { GREEN } from "components/travel-hooks/my-trips/constants";
import { cancelHotelBooking } from "components/travel-hooks/my-trips/MyTripsApi";

const HOTEL_STATUS_STYLE = {
  Confirmed: { bg: "#dcfce7", color: "#15803d" },
  Pending: { bg: "#fef3c7", color: "#b45309" },
  Failed: { bg: "#fee2e2", color: "#dc2626" },
};

const BOOKING_STATUS_STYLE = {
  Upcoming: { bg: "#dbeafe", color: "#1d4ed8" },
  Completed: { bg: "#f3f4f6", color: "#374151" },
  Cancelled: { bg: "#fee2e2", color: "#dc2626" },
};

const formatDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ✅ NAYA — status codes ka meaning ek jagah rakha hai.
// 2 = "already requested / under processing" — is case me
// hume success wala green tick nahi, warning/info dikhana hai.
const ALREADY_REQUESTED_STATUS = 2;

const HotelCard = ({ booking, onViewDetails, onCancelSuccess }) => {
  const {
    booking_id,
    booking_ref_no,
    confirmation_no,
    invoice_number,
    hotel_booking_status,
    booking_status,
    payment,
    created_at,
  } = booking;

  const [cancelling, setCancelling] = useState(false);

  const hotelStyle = HOTEL_STATUS_STYLE[hotel_booking_status] || {
    bg: "#f3f4f6",
    color: "#6b7280",
  };
  const bookingStyle = BOOKING_STATUS_STYLE[booking_status] || {
    bg: "#f3f4f6",
    color: "#6b7280",
  };

  /* ✅ Cancel booking option sirf tab dikhega jab hotel_booking_status
     "Confirmed" ho aur booking_status "Cancelled" na ho — yani sirf
     confirmed/active bookings pe hi cancel karne ka option milega. */
  const canCancel =
    hotel_booking_status === "Confirmed" && booking_status !== "Cancelled";

  const handleCancelClick = async () => {
    // Step 1 — Ask user for remarks
    const { value: remarks, isConfirmed } = await Swal.fire({
      icon: "warning",
      title: "Cancel Booking?",
      html: `Please enter a reason to cancel booking <b>#${booking_ref_no}</b>:`,
      input: "textarea",
      inputPlaceholder: "Enter cancellation reason here...",
      inputValidator: (val) => {
        if (!val || !val.trim()) return "Remarks are required.";
      },
      showCancelButton: true,
      confirmButtonText: "Cancel Booking",
      cancelButtonText: "Go Back",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });

    if (!isConfirmed || !remarks) return;

    try {
      setCancelling(true);

      const response = await cancelHotelBooking(booking_id, remarks.trim());
      const data = response?.data;

      // ✅ If cancellation is already requested (status === 2),
      // show info instead of success.
      if (data?.status === ALREADY_REQUESTED_STATUS) {
        await Swal.fire({
          icon: "info",
          title: "Already Requested",
          html: `${
            data?.message ||
            "Cancellation already requested and is under processing."
          }<br/><small>Change Request ID: ${
            data?.changeRequestId || "-"
          }</small>`,
          confirmButtonText: "OK",
          confirmButtonColor: "#b45309",
        });
      } else {
        // Step 2 — Show API response message in Swal
        await Swal.fire({
          icon: "success",
          title: "Cancellation Request Submitted",
          html: `${
            data?.message || "Cancellation request submitted."
          }<br/><small>Change Request ID: ${
            data?.changeRequestId || "-"
          }</small>`,
          confirmButtonText: "OK",
          confirmButtonColor: GREEN,
        });
      }

      // Step 3 — Notify parent to refresh the list
      onCancelSuccess && onCancelSuccess(booking);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Cancellation Failed",
        text: error?.message || "Something went wrong, please try again.",
        confirmButtonText: "OK",
      });
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "16px",
        border: "1px solid #e8e8e8",
        overflow: "hidden",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          borderColor: "#d1fae5",
        },
      }}
    >
      {/* Header strip */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2.5,
          py: 1.5,
          bgcolor: "#f9fafb",
          borderBottom: "1px solid #eee",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: "10px",
              bgcolor: "#f0fdf4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <HotelIcon sx={{ fontSize: 18, color: GREEN }} />
          </Box>
          <Box>
            <Typography
              sx={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}
            >
              Booking #{booking_ref_no}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#999" }}>
              {formatDate(created_at)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 0.7 }}>
          <Chip
            size="small"
            label={hotel_booking_status}
            sx={{
              bgcolor: hotelStyle.bg,
              color: hotelStyle.color,
              fontWeight: 700,
              fontSize: 11,
              height: 22,
            }}
          />
          <Chip
            size="small"
            label={booking_status}
            sx={{
              bgcolor: bookingStyle.bg,
              color: bookingStyle.color,
              fontWeight: 700,
              fontSize: 11,
              height: 22,
            }}
          />
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ConfirmationNumberIcon sx={{ fontSize: 16, color: "#9ca3af" }} />
            <Typography sx={{ fontSize: 12.5, color: "#555" }}>
              Confirmation No:{" "}
              <b style={{ color: "#1a1a1a" }}>{confirmation_no}</b>
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ReceiptLongIcon sx={{ fontSize: 16, color: "#9ca3af" }} />
            <Typography sx={{ fontSize: 12.5, color: "#555" }}>
              Invoice No: <b style={{ color: "#1a1a1a" }}>{invoice_number}</b>
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 1.8 }} />

        {/* Payment block */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: "#fafafa",
            borderRadius: "10px",
            px: 1.5,
            py: 1.2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PaymentIcon sx={{ fontSize: 16, color: "#9ca3af" }} />
            <Box>
              <Typography
                sx={{ fontSize: 11, color: "#999", textTransform: "uppercase" }}
              >
                {payment?.payment_mode}
              </Typography>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: payment?.status === "SUCCESS" ? GREEN : "#dc2626",
                }}
              >
                {payment?.status}
              </Typography>
            </Box>
          </Box>
          <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#1a1a1a" }}>
            ₹{Number(payment?.amount || 0).toLocaleString("en-IN")}
          </Typography>
        </Box>

        {/* Action buttons — View Details + (conditionally) Cancel Booking */}
        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
          <Button
            fullWidth
            onClick={() => onViewDetails && onViewDetails(booking)}
            sx={{
              bgcolor: GREEN,
              color: "#fff",
              textTransform: "none",
              fontWeight: 700,
              fontSize: 13,
              borderRadius: "10px",
              py: 1,
              "&:hover": { bgcolor: "#15803d" },
            }}
          >
            View Details
          </Button>

          {canCancel && (
            <Button
              fullWidth
              disabled={cancelling}
              onClick={handleCancelClick}
              sx={{
                border: "1px solid #dc2626",
                color: "#dc2626",
                textTransform: "none",
                fontWeight: 700,
                fontSize: 13,
                borderRadius: "10px",
                py: 1,
                "&:hover": { bgcolor: "#fef2f2", border: "1px solid #dc2626" },
              }}
            >
              {cancelling ? (
                <CircularProgress size={18} sx={{ color: "#dc2626" }} />
              ) : (
                "Cancel Booking"
              )}
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default HotelCard;
