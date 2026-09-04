import React from "react";
import {
  Box,
  Card,
  Typography,
  Divider,
  IconButton,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  useTheme,
} from "@mui/material";
import styles from "styles/Parcel.module.css";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import { useEffect, useState } from "react";
import MainApi from "api-manage/MainApi";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

import useParcelCancelReasons from "api-manage/hooks/react-query/percel/useParcelCancelReasons";
import useParcelCancelBooking from "api-manage/hooks/react-query/percel/useParcelCancelBooking";
import DeliveryAssignedSection from "./DeliveryPartnerAssigned";
import toast from "react-hot-toast";
import LiveTrackingLayout from "./LiveTrackingCheckout";

const BookingStatusCard = ({
  bookingId,
  parcelId,
  amount,
  payment,
  fareBreakdown,
  otp,
  pickup_latitude,
  pickup_longitude,
  drop_latitude,
  drop_longitude,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const TOTAL_TIME = 10 * 60;

  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [status, setStatus] = useState(null);
  const [openCancelPopup, setOpenCancelPopup] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [isCancelled, setIsCancelled] = useState(false);
  const [driverData, setDriverData] = useState(null);
  const [stage, setStage] = useState("searching");
  // "searching" | "success" | "tracking"

  const cancelBookingMutation = useParcelCancelBooking(parcelId);
  const { data: cancelReasons = [], isLoading } =
    useParcelCancelReasons(openCancelPopup);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleCancelClick = () => setOpenCancelPopup(true);
  const handleReasonChange = (e) => setSelectedReason(e.target.value);

  const handleConfirmCancel = () => {
    if (!selectedReason) {
      toast.error("Please select a cancellation reason");
      return;
    }
    if (!parcelId) {
      toast.error("Parcel ID is missing. Cannot cancel booking.");
      return;
    }
    cancelBookingMutation.mutate(
      { parcel_id: parcelId, reason: selectedReason },
      {
        onSuccess: () => {
          setOpenCancelPopup(false);
          setIsCancelled(true);
          toast.success("Booking cancelled successfully!");
        },
        onError: () => {
          toast.error("Failed to cancel booking. Please try again.");
        },
      },
    );
  };

  // console.log("OTP from parcel", otp);

  // ── Polling for delivery partner ─────────────────────────────────────────────
  useEffect(() => {
    if (isCancelled) return;

    const interval = setInterval(async () => {
      // console.log("⏱️ Polling chal rahi hai...");
      try {
        const res = await MainApi.post(
          `/api/v1/customer/parcelapi/${parcelId}/find-deliverypartner`,
          { parcel_id: parcelId },
        );
        // console.log("📡 Response aaya:", res?.data);
        if (res?.data?.status === true) {
          // console.log("✅ STATUS TRUE MIL GAYA", res.data);
          setDriverData(res.data);
          setStage("success");
          clearInterval(interval);
        }
      } catch (err) {
        // console.log("❌ Polling error", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [parcelId, isCancelled]);

  // ── Auto-move to tracking after success screen ───────────────────────────────
  useEffect(() => {
    if (stage === "success") {
      const timer = setTimeout(() => setStage("tracking"), 8000);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  // ── Countdown timer ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft <= 0) {
      setStatus("not_found");
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ── Stage renders ────────────────────────────────────────────────────────────
  if (stage === "tracking") {
    return (
      <LiveTrackingLayout
        data={driverData}
        bookingId={bookingId}
        amount={amount}
        parcelId={parcelId}
        payment={payment}
      />
    );
  }

  if (stage === "success") {
    return <DeliveryAssignedSection data={driverData} />;
  }

  if (isCancelled) {
    return (
      <Box fontFamily="Inter" textAlign="center" sx={{ mt: 10, px: 3 }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            bgcolor: "#f8d7da",
            mx: "auto",
            mb: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#721c24",
            fontSize: 36,
            fontWeight: "bold",
          }}
        >
          &#10060;
        </Box>
        <Typography variant="h6" fontWeight={700} mb={1}>
          Your order has been cancelled!
        </Typography>
        <Typography color="text.secondary" mb={3}>
          Your booking #{bookingId} has been cancelled. Feel free to rebook
          whenever you're ready.
        </Typography>
        <Button
          variant="outlined"
          onClick={() => (window.location.href = "/home?module=parcel")}
          sx={{ borderColor: "#4caf50", color: "#4caf50" }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  if (status === "not_found") {
    return (
      <Box fontFamily="Inter" textAlign="center">
        <img src="/parcelnotFound.png" width={180} />
        <Typography fontWeight={600} mt={2}>
          No delivery partner found nearby yet
        </Typography>
        <Typography color="text.secondary">
          This can happen during busy hours
        </Typography>
        <Button sx={{ mt: 2 }}>Try again</Button>
      </Box>
    );
  }

  // console.log("BOOKING ID:", bookingId);

  // ── Main searching screen ────────────────────────────────────────────────────
  return (
    <>
      <Box
        className={isDark ? styles.pageDark : undefined}
        sx={{
          minHeight: "100vh",
          bgcolor: isDark ? undefined : "#f0f4f8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          py: { xs: 10, md: 14 }, // ✅ top & bottom space — navbar/footer se door
        }}
      >
        <Card
          className={isDark ? styles.cardDark : undefined}
          sx={{
            width: "100%",
            maxWidth: 450,
            borderRadius: "24px",
            p: 4,
            boxShadow: isDark ? undefined : "0px 8px 24px rgba(0,0,0,0.05)",
            border: isDark ? undefined : "1px solid #eef2f6",
          }}
        >
          {/* ── Animated Circle ── */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2, mt: 2 }}>
            <Box
              sx={{
                width: 160,
                height: 160,
                borderRadius: "50%",
                bgcolor: isDark ? "rgba(52, 164, 44, 0.14)" : "#def5e5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  bgcolor: isDark ? "#34a42c" : "#88dca3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                }}
              >
                <SearchIcon sx={{ fontSize: 40 }} />
              </Box>
            </Box>
          </Box>

          {/* ── OTP Box — center me, circle ke niche, text ke upar ── */}
          {otp && (
            <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
              <Box
                sx={{
                  px: 1,
                  py: 1,
                  borderRadius: "12px",
                  backgroundColor: "#f1fff5",
                  // border: "1.5px dashed #1A914B",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#1A914B",
                    letterSpacing: "6px",
                    textAlign: "center",
                  }}
                >
                  OTP: {otp}
                </Typography>
              </Box>
            </Box>
          )}

          {/* ── Status Text ── */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              fontFamily="Inter"
              fontWeight={700}
              sx={{ color: "#000", mb: 0.5 }}
            >
              Looking for delivery partner
            </Typography>
            <Typography
              sx={{
                color: "#7e8ba0",
                fontSize: "1.05rem",
                fontFamily: "Inter",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              We expect to find a partner within {formatTime(timeLeft)} mins
            </Typography>
          </Box>

          <Divider
            sx={{ my: 3, borderStyle: "dotted", borderColor: "#e0e4eb" }}
          />

          {/* ── Order Details ── */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1 }}
          >
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ color: "#000", fontFamily: "Inter" }}
            >
              Order Details
            </Typography>
            {/* <IconButton size="small">
              <ExpandMoreIcon sx={{ color: "#000" }} />
            </IconButton> */}
          </Box>

          <Typography sx={{ color: "#7e8ba0", fontSize: "1.05rem", mb: 3 }}>
            Order ID : #{bookingId}
          </Typography>

          <Divider
            sx={{ my: 3, borderStyle: "dotted", borderColor: "#e0e4eb" }}
          />

          {/* ── Payment ── */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            sx={{ mb: 4 }}
          >
            <Box>
              <Typography
                fontWeight={700}
                sx={{ fontSize: "1.1rem", color: "#000" }}
              >
                {payment}
              </Typography>
              <Typography
                sx={{
                  color: "#7e8ba0",
                  fontSize: "0.95rem",
                  fontFamily: "Inter",
                }}
              >
                Payment Method
              </Typography>
            </Box>
            <Box textAlign="right">
              <Typography
                fontWeight={700}
                sx={{ fontSize: "1.2rem", color: "#000" }}
              >
                ₹{amount}
              </Typography>
              <Typography
                sx={{
                  color: "#27a458",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  fontFamily: "Inter",
                  cursor: "pointer",
                  mt: 0.5,
                }}
              >
                View Breakup
              </Typography>
            </Box>
          </Box>

          {/* ── Cancel Button ── */}
          <Button
            fullWidth
            variant="outlined"
            onClick={handleCancelClick}
            sx={{
              py: 1.8,
              borderColor: "#ff7675",
              color: "#ff4d4f",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "1.05rem",
              borderRadius: "12px",
            }}
          >
            Cancel Booking
          </Button>
        </Card>
      </Box>

      {/* ── Cancel Dialog ── */}
      <Dialog
        open={openCancelPopup}
        onClose={() => setOpenCancelPopup(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Select Cancel Reason</DialogTitle>
        <DialogContent>
          {isLoading ? (
            <Typography>Loading...</Typography>
          ) : (
            <RadioGroup value={selectedReason} onChange={handleReasonChange}>
              {cancelReasons.map((item) => (
                <FormControlLabel
                  key={item.id || item.reason}
                  value={item.reason}
                  control={<Radio />}
                  label={item.reason}
                />
              ))}
            </RadioGroup>
          )}
          <Button
            onClick={handleConfirmCancel}
            variant="contained"
            color="error"
            disabled={cancelBookingMutation.isLoading}
            sx={{ mt: 2 }}
            fullWidth
          >
            {cancelBookingMutation.isLoading
              ? "Cancelling..."
              : "Cancel Booking"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookingStatusCard;
