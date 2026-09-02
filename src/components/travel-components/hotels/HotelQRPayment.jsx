// src/components/hotel/HotelQRPayment.jsx
//
// Same look-and-feel as the rest of BookingSuccessPage.jsx (MUI + same
// color tokens), rendered INLINE on the page — no Dialog, no overlay,
// so there's no z-index fight with SweetAlert2 anymore.

import React, { useEffect, useRef } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ReplayIcon from "@mui/icons-material/Replay";
import QRCode from "qrcode";
import Swal from "sweetalert2";

const GREEN = "#16a34a";
const BORDER = "#e5e7eb";
const LIGHT = "#6b7280";
const DARK = "#111827";

function QRCanvas({ upiUrl, size = 220 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!upiUrl || !ref.current) return;
    QRCode.toCanvas(ref.current, upiUrl, {
      width: size,
      margin: 1,
      color: { dark: "#111827", light: "#ffffff" },
      errorCorrectionLevel: "M",
    }).catch(console.error);
  }, [upiUrl, size]);
  return (
    <canvas ref={ref} width={size} height={size} style={{ display: "block", borderRadius: 8 }} />
  );
}

export default function HotelQRPayment({
  paymentData,        // { amount, orderId, upiIntentUrl, expiryDate }
  paymentStatus,       // "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED" | "CANCELLED"
  initiating = false,  // true while QR is being generated / retried
  cancelling = false,
  isExpired = false,
  mins = 0,
  secs = 0,
  currency = "₹",
  onRetry,
  onCancel,
}) {
  const totalSecondsLeft = mins * 60 + secs;
  const isDanger = totalSecondsLeft <= 60 && totalSecondsLeft > 0;

  const showExpired = isExpired || paymentStatus === "EXPIRED";
  const showFailed = paymentStatus === "FAILED";
  const showSuccess = paymentStatus === "SUCCESS";
  const cancelEnabled =
    !showExpired && !showFailed && !showSuccess && !initiating && !cancelling;

  const amount = paymentData?.amount ?? 0;
  const upiUrl = paymentData?.upiIntentUrl ?? "";

  const handleCancelClick = async () => {
    // ✅ No Dialog wrapper anymore, so Swal renders on top of the normal
    // page — no z-index conflict.
    const result = await Swal.fire({
      title: "Cancel Payment?",
      text: "Are you sure you want to cancel this payment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Cancel",
      cancelButtonText: "No, Go Back",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: GREEN,
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await onCancel?.();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Cancellation Failed",
        text: err?.message || "Something went wrong. Please try again.",
        confirmButtonColor: GREEN,
      });
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 480,
        mx: "auto",
        bgcolor: "#fff",
        borderRadius: "18px",
        border: `1px solid ${BORDER}`,
        p: { xs: 2.5, sm: 3.5 },
        fontFamily: "Inter, sans-serif",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
        <Box>
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: DARK, fontFamily: "Inter, sans-serif" }}>
            Pay using QR Code
          </Typography>
          <Typography sx={{ fontSize: 13, color: LIGHT, mt: 0.3, fontFamily: "Inter, sans-serif" }}>
            Scan using any UPI App
          </Typography>
        </Box>
        {!showExpired && !showFailed && !showSuccess && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "Inter, sans-serif",
              color: isDanger ? "#ef4444" : GREEN,
            }}
          >
            <AccessTimeIcon sx={{ fontSize: 15 }} />
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </Box>
        )}
      </Box>

      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          fontSize: 13,
          fontWeight: 600,
          borderRadius: "8px",
          px: 2,
          py: 1,
          mb: 2.5,
          fontFamily: "Inter, sans-serif",
          bgcolor: showSuccess ? "#f0fdf4" : showFailed || showExpired ? "#fef2f2" : "#fffbeb",
          border: `1px solid ${
            showSuccess ? "#bbf7d0" : showFailed || showExpired ? "#fecaca" : "#fde68a"
          }`,
          color: showSuccess ? GREEN : showFailed || showExpired ? "#ef4444" : "#92400e",
        }}
      >
        {showSuccess
          ? "Payment Successful"
          : showFailed
          ? "Payment Failed"
          : showExpired
          ? "QR Expired"
          : "Waiting for payment..."}
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            position: "relative",
            border: `1px solid ${BORDER}`,
            borderRadius: "16px",
            p: 2,
            bgcolor: "#fff",
          }}
        >
          {initiating ? (
            <Box sx={{ width: 220, height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CircularProgress size={32} sx={{ color: GREEN }} />
            </Box>
          ) : (
            <QRCanvas upiUrl={upiUrl} size={220} />
          )}

          {(showExpired || showFailed) && !initiating && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(255,255,255,0.97)",
              }}
            >
              <Box sx={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                <ErrorOutlinedIcon sx={{ fontSize: 32, color: "#f59e0b" }} />
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: DARK, fontFamily: "Inter, sans-serif" }}>
                  {showFailed ? "Payment Failed" : "QR Expired"}
                </Typography>
                <Button
                  onClick={onRetry}
                  startIcon={<ReplayIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    bgcolor: GREEN,
                    color: "#fff",
                    borderRadius: "8px",
                    px: 2.5,
                    py: 1,
                    fontSize: 13,
                    fontWeight: 600,
                    textTransform: "none",
                    fontFamily: "Inter, sans-serif",
                    "&:hover": { bgcolor: "#15803d" },
                  }}
                >
                  Retry Payment
                </Button>
              </Box>
            </Box>
          )}

          {showSuccess && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(255,255,255,0.97)",
              }}
            >
              <Box sx={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    bgcolor: "#f0fdf4",
                    border: "2px solid #bbf7d0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 26, color: GREEN }} />
                </Box>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: DARK, fontFamily: "Inter, sans-serif" }}>
                  Payment Successful!
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {!showExpired && !showFailed && !showSuccess && !initiating && (
          <Typography sx={{ fontSize: 13, color: GREEN, fontFamily: "Inter, sans-serif" }}>
            Scan securely using any UPI application
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 2.5,
          px: 2,
          py: 1.5,
          bgcolor: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: "10px",
        }}
      >
        <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: DARK, fontFamily: "Inter, sans-serif" }}>
          Amount Payable
        </Typography>
        <Typography sx={{ fontSize: 17, fontWeight: 800, color: GREEN, fontFamily: "Inter, sans-serif" }}>
          {currency}
          {Number(amount).toFixed(2)}
        </Typography>
      </Box>

      <Box sx={{ mt: 3, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3,1fr)" }, gap: 2 }}>
        {[
          { n: 1, t: "Open UPI App", d: "Open GPay, PhonePe, Paytm or any UPI app." },
          { n: 2, t: "Scan QR", d: "Scan the QR shown above to start payment." },
          { n: 3, t: "Complete Payment", d: "Enter UPI PIN and wait for confirmation." },
        ].map((s) => (
          <Box key={s.n}>
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                bgcolor: "#f0fdf4",
                color: GREEN,
                fontWeight: 700,
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 0.7,
              }}
            >
              {s.n}
            </Box>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: DARK, mb: 0.3, fontFamily: "Inter, sans-serif" }}>
              {s.t}
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: LIGHT, lineHeight: 1.5, fontFamily: "Inter, sans-serif" }}>
              {s.d}
            </Typography>
          </Box>
        ))}
      </Box>

      {onCancel && (
        <Button
          fullWidth
          disabled={!cancelEnabled}
          onClick={handleCancelClick}
          sx={{
            mt: 2.5,
            py: 1.3,
            borderRadius: "10px",
            border: "1.5px solid #ef4444",
            color: "#ef4444",
            fontWeight: 600,
            fontSize: 13,
            textTransform: "none",
            fontFamily: "Inter, sans-serif",
            "&:hover": { bgcolor: "#fef2f2" },
            "&.Mui-disabled": { opacity: 0.4 },
          }}
        >
          {cancelling ? "Cancelling..." : "Cancel Payment"}
        </Button>
      )}
    </Box>
  );
}