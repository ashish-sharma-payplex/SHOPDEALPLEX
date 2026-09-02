import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import { usePayment } from "components/travel-hooks/hotels/usePayment";
import { useCountdown } from "components/travel-hooks/hotels/useCountdown";

const GREEN = "#16a34a";
const DARK = "#111827";
const LIGHT = "#6b7280";
const BORDER = "#e5e7eb";

const shimmerKeyframes = `
@keyframes shimmer { 0% { background-position:-600px 0;} 100% { background-position:600px 0;} }
@keyframes pulse-dot { 0%,100% { opacity:.5; transform:scale(1);} 50% { opacity:1; transform:scale(1.15);} }
@keyframes spin-in { from { opacity:0; transform:scale(.85);} to { opacity:1; transform:scale(1);} }
`;

const steps = [
  { title: "Open UPI App", desc: "Open GPay, PhonePe, Paytm or any UPI application." },
  { title: "Scan QR", desc: "Scan the QR shown above to initiate payment." },
  { title: "Complete Payment", desc: "Enter your UPI PIN and wait for automatic confirmation." },
];

/**
 * ✅ Ab ye modal/overlay nahi — poora ALAG ROUTE hai (/hotels/qr-payment).
 * BookingSuccessPage se `navigate` karke yaha aate hain, state mein
 * prebookId + booking-context data pass karke. Isse background mein
 * BookingSuccessPage bilkul nahi dikhta (unmount ho jaata hai) — scroll
 * pe bhi kuch peeche nahi dikhega.
 */
const QRPaymentPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { state } = useLocation();
  const navigate = useNavigate();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // ✅ BookingSuccessPage se pass kiya gaya sab data
  const prebookId = state?.prebookId ?? null;
  const currency = state?.currency ?? "₹";
  const hotelName = state?.hotelName ?? "";
  const hotelLocation = state?.hotelLocation ?? "";
  const checkInDay = state?.checkInDay ?? "";
  const checkInDate = state?.checkInDate ?? "";
  const checkOutDay = state?.checkOutDay ?? "";
  const checkOutDate = state?.checkOutDate ?? "";
  const roomFare = state?.roomFare ?? 0;
  const taxAmount = state?.taxAmount ?? 0;
  const convenienceFee = state?.convenienceFee ?? 0;
  const totalPayable = state?.totalPayable ?? 0;

  // ✅ Apna khud ka usePayment instance — is page pe hi payment initiate hoga
  const {
    initiatePayment,
    cancelPayment,
    cancelling,
    initiating,
    paymentStatus,
    paymentData,
    bookingResult,
    booking, 
    resetKey,
    handleClientExpiry,
  } = usePayment();

  const { mins, secs, isExpired } = useCountdown(
    paymentData?.expiryDate ?? null,
    paymentData?._ts ?? null,
    false,
    resetKey,
    handleClientExpiry,
  );

  // ✅ Page load hote hi payment initiate karo (agar prebookId mila)
  React.useEffect(() => {
    if (prebookId) {
      initiatePayment(prebookId, { onSuccess: () => {} }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prebookId]);

  // ✅ Payment success hone par booking-success page pe wapas bhejo,
  // taaki wahan ka Book-API-call/redirect-to-ticket logic chale
  React.useEffect(() => {
    if (paymentStatus === "SUCCESS" && !booking && bookingResult) {
      const timer = setTimeout(() => {
        navigate("/hotels/payment", {
          state: {
            ...state,
            paymentStatus,
            bookingResult, // ✅ ab asli Book API result forward ho raha hai
            paymentData,
          },
          replace: true,
        });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus, booking, bookingResult]);

  const isCancelled = paymentStatus === "CANCELLED";
  const isSuccess = paymentStatus === "SUCCESS";
  const isFailed = paymentStatus === "FAILED";
  const isPending = (paymentStatus === "PENDING" || !paymentStatus) && !isExpired;
  const showBlur = isExpired || isCancelled || initiating || isSuccess || isFailed;
  const qrSize = isMobile ? 220 : 260;
  const showExpiredState = paymentStatus === "EXPIRED" && !initiating;

  const handleClose = () => {
    if (!initiating && !cancelling) navigate(-1);
  };

 const handleRetry = async () => {
  if (!prebookId || initiating) return;
  try {
    const res = await initiatePayment(prebookId, { onSuccess: () => {} });
    const raw = res.expiryDate.includes("Z") || res.expiryDate.includes("+")
      ? new Date(res.expiryDate).getTime()
      : new Date(res.expiryDate.replace(" ", "T") + "+05:30").getTime();
    console.log("expiryDate from API:", res.expiryDate);
    console.log("parsed expiry ms:", raw, new Date(raw).toString());
    console.log("current time:", Date.now(), new Date().toString());
    console.log("diff (seconds left):", (raw - Date.now()) / 1000);
  } catch (err) {}
};

  const handleCancel = async () => {
    if (!prebookId || cancelling) return;
    await cancelPayment(prebookId);
  };

  if (!prebookId) {
    // ✅ Direct URL hit / refresh ho gaya bina state ke — safe fallback
    navigate("/hotels", { replace: true });
    return null;
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa", fontFamily: "Inter, sans-serif" }}>
      <style>{shimmerKeyframes}</style>

      {/* Top bar */}
      <Box sx={{
        bgcolor: "#fff", borderBottom: `1px solid ${BORDER}`,
        px: { xs: 2, sm: 4 }, py: 1.6,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        // position: "sticky", top: { xs: "56px", md: "0px" }, zIndex: 2,
      }}>
        <Box>
          <Typography sx={{ fontSize: { xs: 16, sm: 18 }, fontWeight: 800, color: DARK }}>
            Pay using QR Code
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: LIGHT }}>
            Scan using any UPI App
          </Typography>
        </Box>

        <Box onClick={handleClose} sx={{
          width: 32, height: 32, borderRadius: "50%", bgcolor: "#f3f4f6",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          "&:hover": { bgcolor: "#e5e7eb" },
        }}>
          <CloseIcon sx={{ fontSize: 16, color: DARK }} />
        </Box>
      </Box>

      <Box sx={{
        maxWidth: 1200, mx: "auto", p: { xs: 2, sm: 4 },
        display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 2.5,
        alignItems: "flex-start",
      }}>
        {/* ══ LEFT — QR + steps ══ */}
        <Box sx={{ flex: 1, width: "100%", bgcolor: "#fff", borderRadius: "18px", border: `1px solid ${BORDER}`, p: { xs: 2.5, sm: 4 } }}>

          {/* Status pill + timer */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative", mb: 3 }}>
            <Box sx={{
              display: "inline-flex", alignItems: "center", gap: 0.8,
              px: 2, py: 0.7, borderRadius: "20px",
              bgcolor: isSuccess ? "#dcfce7" : isFailed || isExpired ? "#fef2f2" : isCancelled ? "#f3f4f6" : "#fefce8",
              border: `1px solid ${isSuccess ? "#bbf7d0" : isFailed || isExpired ? "#fecaca" : isCancelled ? BORDER : "#fde68a"}`,
            }}>
              {isPending && <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#ca8a04", animation: "pulse-dot 1.6s ease-in-out infinite" }} />}
              {isSuccess && <CheckCircleIcon sx={{ fontSize: 14, color: GREEN }} />}
              <Typography sx={{
                fontSize: 13, fontWeight: 700,
                color: isSuccess ? GREEN : isFailed || isExpired ? "#ef4444" : isCancelled ? LIGHT : "#92400e",
              }}>
                {isSuccess ? "Payment successful" : isFailed ? "Payment failed" : isCancelled ? "Cancelled" : isExpired ? "QR expired" : initiating ? "Generating..." : "Waiting for payment..."}
              </Typography>
            </Box>

            {isPending && !initiating && (
              <Box sx={{
                position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
                display: "flex", alignItems: "center", gap: 0.6,
              }}>
                <AccessTimeIcon sx={{ fontSize: 18, color: GREEN }} />
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: GREEN, fontVariantNumeric: "tabular-nums" }}>
                  {mins}:{secs}
                </Typography>
              </Box>
            )}
          </Box>

          {/* QR box */}
          <Box key={resetKey} sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Box sx={{
              position: "relative", p: 1.5, borderRadius: "16px",
              border: `2px solid ${showExpiredState ? "#fecaca" : isCancelled ? BORDER : isSuccess ? "#bbf7d0" : BORDER}`,
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            }}>
              {initiating || !paymentData ? (
                <Box sx={{
                  width: qrSize, height: qrSize, borderRadius: "8px",
                  background: "linear-gradient(90deg,#f3f4f6 25%,#e9eaec 50%,#f3f4f6 75%)",
                  backgroundSize: "600px 100%", animation: "shimmer 1.5s ease-in-out infinite",
                }} />
              ) : (
                <Box sx={{ position: "relative" }}>
                  <img
                    key={paymentData._ts}
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(paymentData.upiIntentUrl)}&_t=${paymentData._ts}`}
                    alt="UPI QR Code"
                    width={qrSize} height={qrSize}
                    style={{ display: "block", borderRadius: 6, filter: showBlur ? "blur(5px) brightness(0.45)" : "none", transition: "filter .4s ease" }}
                  />
                  {showExpiredState && (
                    <Box onClick={handleRetry} sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, cursor: "pointer" }}>
                      <Box sx={{ width: 44, height: 44, borderRadius: "50%", bgcolor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(0,0,0,0.28)", fontSize: 20 }}>↻</Box>
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Tap to retry</Typography>
                    </Box>
                  )}
                  {isFailed && (
                    <Box onClick={handleRetry} sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, cursor: "pointer" }}>
                      <Box sx={{ width: 44, height: 44, borderRadius: "50%", bgcolor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(0,0,0,0.28)", fontSize: 20 }}>↻</Box>
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Tap to retry</Typography>
                    </Box>
                  )}
                  {isCancelled && (
                    <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: .5 }}>Cancelled</Typography>
                    </Box>
                  )}
                  {isSuccess && (
                    <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(22,163,74,0.88)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, animation: "spin-in .4s ease" }}>
                      <CheckCircleIcon sx={{ fontSize: 46, color: "#fff" }} />
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Payment done!</Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Box>

          {isPending && !initiating && (
            <>
              <Typography sx={{ textAlign: "center", fontSize: 13, color: LIGHT, mb: 1.5 }}>
                Scan securely using any UPI application
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 4, flexWrap: "wrap" }}>
                {["Google Pay", "PhonePe", "Paytm", "BHIM"].map((app) => (
                  <Typography key={app} sx={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{app}</Typography>
                ))}
              </Box>
            </>
          )}

          {/* How it works */}
          <Box sx={{ mt: 3, pt: 3, borderTop: `1px dashed ${BORDER}` }}>
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: DARK, mb: 2 }}>How it works</Typography>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2.5 }}>
              {steps.map((s, i) => (
                <Box key={i} sx={{ flex: 1 }}>
                  <Box sx={{
                    width: 26, height: 26, borderRadius: "50%", bgcolor: "#ede9fe",
                    color: "#6d28d9", fontWeight: 700, fontSize: 13,
                    display: "flex", alignItems: "center", justifyContent: "center", mb: 1,
                  }}>{i + 1}</Box>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: DARK, mb: .3 }}>{s.title}</Typography>
                  <Typography sx={{ fontSize: 12.5, color: LIGHT, lineHeight: 1.6 }}>{s.desc}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* ══ RIGHT — booking details + payment summary ══ */}
        <Box sx={{ width: { xs: "100%", lg: 320 }, flexShrink: 0, display: "flex", flexDirection: "column", gap: 2, position: { lg: "sticky" }, top: 90 }}>

          {(hotelName || hotelLocation) && (
            <Box sx={{ bgcolor: "#fff", borderRadius: "18px", border: `1px solid ${BORDER}`, p: 2.5 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 800, color: DARK, mb: 1.5 }}>Booking Details</Typography>
              {hotelName && (
                <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: DARK, mb: .8 }}>{hotelName}</Typography>
              )}
              {hotelLocation && (
                <Box sx={{ display: "flex", gap: .7, alignItems: "flex-start", mb: 1 }}>
                  <LocationOnOutlinedIcon sx={{ fontSize: 15, color: GREEN, mt: .2 }} />
                  <Typography sx={{ fontSize: 12.5, color: LIGHT, lineHeight: 1.6 }}>{hotelLocation}</Typography>
                </Box>
              )}
              {(checkInDay || checkInDate) && (
                <Box sx={{ display: "flex", gap: .7, alignItems: "center" }}>
                  <CalendarTodayOutlinedIcon sx={{ fontSize: 14, color: LIGHT }} />
                  <Typography sx={{ fontSize: 12.5, color: LIGHT }}>
                    {checkInDay}{checkInDay && checkInDate ? ", " : ""}{checkInDate} → {checkOutDay}{checkOutDay && checkOutDate ? ", " : ""}{checkOutDate}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          <Box sx={{ bgcolor: "#fff", borderRadius: "18px", border: `1px solid ${BORDER}`, p: 2.5 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: DARK, mb: 1.8 }}>Payment Summary</Typography>

            {[
              { label: "Room Fare", value: roomFare },
              { label: "Taxes & Charges", value: taxAmount },
              { label: "Convenience Fee", value: convenienceFee },
            ].map((row, i) => (
              <Box key={i} sx={{ display: "flex", justifyContent: "space-between", mb: 1.2 }}>
                <Typography sx={{ fontSize: 13, color: "#374151" }}>{row.label}</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: DARK }}>
                  {currency}{Number(row.value || 0).toLocaleString("en-IN")}
                </Typography>
              </Box>
            ))}

            <Box sx={{ borderTop: `1px dashed ${BORDER}`, my: 1.5 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2.5 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 800, color: DARK }}>Total Payable</Typography>
              <Typography sx={{ fontSize: 16, fontWeight: 800, color: DARK }}>
                {currency}{Number(totalPayable || 0).toLocaleString("en-IN")}
              </Typography>
            </Box>

            {isPending && !initiating && (
              <Button
                fullWidth
                onClick={() => setShowCancelConfirm(true)}
                disabled={cancelling}
                sx={{
                  border: "1px solid #ef4444", color: "#ef4444", textTransform: "none",
                  fontSize: 13.5, fontWeight: 700, borderRadius: "10px", py: 1.1,
                  "&:hover": { bgcolor: "#fef2f2" },
                }}
              >
                {cancelling ? <CircularProgress size={14} sx={{ color: "#ef4444" }} /> : "Cancel Payment"}
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Cancel confirm popup */}
      {showCancelConfirm && (
        <Box sx={{ position: "fixed", inset: 0, zIndex: 1400, bgcolor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
          <Box sx={{ bgcolor: "#fff", borderRadius: "18px", maxWidth: 300, width: "100%", p: 2.5, textAlign: "center", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
            <Box sx={{ width: 48, height: 48, borderRadius: "50%", bgcolor: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 1.5, fontSize: 22 }}>⚠️</Box>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: DARK, mb: .6 }}>Cancel payment?</Typography>
            <Typography sx={{ fontSize: 12, color: LIGHT, mb: 2, lineHeight: 1.7 }}>This action cannot be undone.</Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button fullWidth onClick={() => setShowCancelConfirm(false)} sx={{ border: `1px solid ${BORDER}`, color: DARK, textTransform: "none", fontSize: 13, fontWeight: 600, borderRadius: "8px", py: .9 }}>
                No, go back
              </Button>
              <Button fullWidth onClick={() => { setShowCancelConfirm(false); handleCancel(); }} disabled={cancelling} sx={{ bgcolor: "#ef4444", color: "#fff", textTransform: "none", fontSize: 13, fontWeight: 600, borderRadius: "8px", py: .9, "&:hover": { bgcolor: "#dc2626" } }}>
                {cancelling ? <CircularProgress size={13} sx={{ color: "#fff" }} /> : "Yes, cancel"}
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default QRPaymentPage;