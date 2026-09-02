import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  useMediaQuery,
  Skeleton,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { useRouter } from "next/router";
import { QRCodeSVG } from "qrcode.react";
import ReplayIcon from "@mui/icons-material/Replay";
import useRegisterBbpsIntent from "api-manage/hooks/react-query/utility/userRegisterBbpsIntent";
import usePayBbpsBillV2 from "api-manage/hooks/react-query/utility/usePayBbpsbillv2";
import useGetBbpsIntentStatus from "api-manage/hooks/react-query/utility/useGetBbpsIntentStatus";
import useCancelBbpsIntent from "api-manage/hooks/react-query/utility/useCancelBbpsIntent";
import UtilityLayout from "../utility/UtilityLayout";

const upiLogos = {
  gpay: "/utility/gpay.svg",
  phonepe: "/utility/phonepay.svg",
  paytm: "/utility/paytm.svg",
  bhim: "/utility/bhim.svg",
};

const serviceImageMap = {
  "education-fees": "/utility/educationfees.svg",
  electricity: "/utility/Electricbill.svg",
  "loan-repayment": "/utility/loanrepayment.svg",
  gas: "/utility/gas-pipe.svg",
  water: "/utility/water.svg",
  "mobile-postpaid": "/utility/mobilepostpaid.svg",
  "housing-society": "/utility/housing.svg",
  "broadband-postpaid": "/utility/broadband.svg",
  insurance: "/utility/insurance.svg",
  "landline-postpaid": "/utility/device-landline-phone.svg",
  fastag: "/utility/fastag.svg",
  "cable-tv": "/utility/Postpaid.svg",
  "municipal-taxes": "/utility/muncipal.svg",
  "life-insurance": "/utility/lifeinsurance.svg",
  dth: "/utility/DTHrecharge.svg",
  "credit-card": "/utility/cards.svg",
  "hospital-and-pathology": "/utility/pathology.svg",
  "municipal-services": "/utility/muncipal.svg",
  "lpg-gas": "/utility/LPG.svg",
  "clubs-and-associations": "/utility/club&association.svg",
  subscription: "/utility/subcription.svg",
  "health-insurance": "/utility/healthinsurance.svg",
  "mobile-prepaid": "/utility/recharge.svg",
  "recurring-deposit": "/utility/recharge.svg",
  hospital: "/utility/hospital.svg",
  rental: "/utility/rental.svg",
  b2b: "/utility/b2b.svg",
  "metro-recharge": "/utility/train-front.svg",
  "ncmc-recharge": "/utility/recharge.svg",
  donation: "/utility/donation.svg",
  "national-pension-system": "/utility/recharge.svg",
  "prepaid-meter": "/utility/prepaid.svg",
  "agent-collection": "/utility/agentcollection.svg",
  echallan: "/utility/eChallan.svg",
  "ev-recharge": "/utility/EVrecharge.svg",
};

const TERMINAL_STATUSES = ["SUCCESS", "FAILED", "EXPIRED", "CANCELLED"];
const POLL_INTERVAL_MS = 3000;

// ─── Inner Content ────────────────────────────────────────────────────────────
const PayUsingQRContent = () => {
  const router = useRouter();
  const slug = router.query?.slug || "";

  const [qrData, setQrData] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const expiryTimeRef = useRef(null);

  const [failureReason, setFailureReason] = useState("");

  const { mutateAsync: checkStatus } = useGetBbpsIntentStatus();
  const { mutateAsync: cancelIntent, isLoading: cancelling } =
    useCancelBbpsIntent();
  const { mutateAsync: registerIntent, isLoading: registeringIntent } =
    useRegisterBbpsIntent();
  const { mutateAsync: payBillV2 } = usePayBbpsBillV2();

  const pollRef = useRef(null);
  const timerRef = useRef(null);
  const qrDataRef = useRef(null);

  const updateQrData = (data) => {
    setQrData(data);
    qrDataRef.current = data;
  };

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startPolling = useCallback(
    (orderId) => {
      stopPolling();
      pollRef.current = setInterval(async () => {
        try {
          const res = await checkStatus({ order_id: orderId });
          const status = res?.status;
          if (!status) return;

          setPaymentStatus(status);

          if (res?.message) setStatusMessage(res.message);

          if (TERMINAL_STATUSES.includes(status)) {
            stopPolling();

            if (status === "SUCCESS") {
              stopTimer();
              const currentQrData = qrDataRef.current;
              try {
                const payRes = await payBillV2({
                  payment_method: "upi",
                  upi_order_id: currentQrData?.order_id,
                  billerId: currentQrData?.biller_id,
                  customerParms: currentQrData?.customerParms,
                  service: currentQrData?.biller_name,
                  service_slug: currentQrData?.service_slug || slug,
                  amount: Number(currentQrData?.amount),
                  amountTags: currentQrData?.amountTags || [],
                  fetchRefId: currentQrData?.fetchRefId || "",
                });
                sessionStorage.setItem(
                  "bbps_payment_response",
                  JSON.stringify(payRes),
                );
              } catch (_) { }
              sessionStorage.removeItem("bbps_qr_data");
              setTimeout(() => {
                router.push(
                  `/utility/${currentQrData?.service_slug || slug}/success`,
                );
              }, 1000);
            }

            if (status === "FAILED") {
              const reason =
                res?.failureReason ||
                res?.gatewayResponseMessage ||
                res?.responseMessage ||
                "Payment failed. Please try again.";
              setFailureReason(reason);
            }
          }
        } catch (_) { }
      }, POLL_INTERVAL_MS);
    },
    [checkStatus, router],
  );

  const initTimer = useCallback((expiry) => {
    stopTimer();

    let absoluteExpiry;
    if (typeof expiry === "number") {
      absoluteExpiry = Date.now() + expiry * 1000;
    } else if (typeof expiry === "string" && expiry.includes("T")) {
      absoluteExpiry = new Date(expiry).getTime();
    } else {
      absoluteExpiry = Date.now() + 5 * 60 * 1000;
    }

    expiryTimeRef.current = absoluteExpiry;

    const tick = () => {
      const remaining = Math.floor(
        (expiryTimeRef.current - Date.now()) / 1000,
      );

      if (remaining <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setSecondsLeft(0);
        setPaymentStatus((current) =>
          current === null || current === "PENDING" ? "EXPIRED" : current,
        );
        stopPolling();
        return;
      }

      setSecondsLeft(remaining);
    };

    tick();
    timerRef.current = setInterval(tick, 1000);
  }, []);

  useEffect(() => {
    const raw = sessionStorage.getItem("bbps_qr_data");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      updateQrData(parsed);
      initTimer(parsed.expiry);
    } catch (_) { }
  }, []);

  useEffect(() => {
    if (qrData?.order_id) {
      startPolling(qrData.order_id);
    }
    return () => stopPolling();
  }, [qrData?.order_id]);

  useEffect(() => {
    return () => {
      stopPolling();
      stopTimer();
    };
  }, []);

  const formatTime = (secs) => {
    if (secs === null) return "--:--";
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleRetry = async () => {
    if (!qrData?.amount) return;
    setFailureReason("");
    try {
      const intentRes = await registerIntent({ amount: qrData.amount });
      if (!intentRes || !intentRes.upi_link) return;
      const newQrData = {
        ...qrData,
        upi_link: intentRes.upi_link,
        order_id: intentRes.order_id,
        expiry: intentRes.expiry,
      };
      sessionStorage.setItem("bbps_qr_data", JSON.stringify(newQrData));
      updateQrData(newQrData);
      setPaymentStatus(null);
      setStatusMessage(null);
      initTimer(intentRes.expiry);
      payBillV2({
        payment_method: "upi",
        upi_order_id: intentRes.order_id,
        billerId: qrData.biller_id,
        customerParms: qrData.customerParms,
        service: qrData.biller_name,
        service_slug: qrData.service_slug || slug,
        amount: Number(qrData.amount),
        amountTags: qrData.amountTags || [],
        fetchRefId: qrData.fetchRefId || "",
      }).catch(() => { });
      startPolling(intentRes.order_id);
    } catch (_) { }
  };

  const handleCancelClick = () => setShowCancelDialog(true);

  const handleCancelConfirm = async () => {
    setShowCancelDialog(false);
    if (!qrData?.order_id) return;
    try {
      await cancelIntent({ order_id: qrData.order_id });
      stopPolling();
      stopTimer();
      setPaymentStatus("CANCELLED");
      sessionStorage.removeItem("bbps_qr_data");
      router.push("/utility");
    } catch (_) { }
  };

  const handleCancelDialogClose = () => setShowCancelDialog(false);

  const isQrReady = !!qrData?.upi_link;
  const isExpired =
    paymentStatus === "EXPIRED" || (secondsLeft === 0 && !paymentStatus);
  const isFailed = paymentStatus === "FAILED";
  const isSuccess = paymentStatus === "SUCCESS";
  const isCancelled = paymentStatus === "CANCELLED";
  const isQrDisabled = isFailed || isCancelled || isSuccess;
  const isCancelEnabled =
    isQrReady &&
    !isExpired &&
    !isFailed &&
    !isSuccess &&
    !isCancelled &&
    !cancelling;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: 2,
        width: "100%",
        alignItems: "flex-start",
      }}
    >
      {/* QR CARD */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          p: 2.5,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography fontWeight={600} fontSize={15}>
            Pay using QR code
          </Typography>
          {!isFailed && !isCancelled && !isSuccess && (
            <Typography
              sx={{
                fontSize: 13,
                color: isExpired ? "#ef4444" : "#16a34a",
                fontWeight: 600,
              }}
            >
              ⏱ {formatTime(secondsLeft)}
            </Typography>
          )}
        </Box>

        {/* QR Code */}
        <Box sx={{ textAlign: "center" }}>
          <Box sx={{ position: "relative", display: "inline-block", mb: 1.5 }}>
            <Box
              sx={{
                p: 1.5,
                border: `1.5px solid ${isFailed || isCancelled
                    ? "#fca5a5"
                    : isSuccess
                      ? "#86efac"
                      : "#e5e7eb"
                  }`,
                borderRadius: "12px",
                display: "inline-block",
                background: "#fff",
                opacity: isQrDisabled ? 0.25 : isExpired ? 0.25 : 1,
                // ✅ Cancel hone par blur effect
                filter: isCancelled ? "blur(3px)" : "none",
                transition: "opacity 0.3s, filter 0.3s",
              }}
            >
              {isQrReady ? (
                <QRCodeSVG value={qrData.upi_link} size={160} level="H" />
              ) : (
                <Skeleton
                  variant="rounded"
                  width={160}
                  height={160}
                  sx={{ borderRadius: "8px" }}
                />
              )}
            </Box>

            {/* Expired overlay — Retry button */}
            {isExpired && !isQrDisabled && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.5)",
                  backdropFilter: "blur(1px)",
                }}
              >
                <Button
                  onClick={handleRetry}
                  disabled={registeringIntent}
                  startIcon={
                    registeringIntent ? (
                      <CircularProgress size={14} sx={{ color: "#fff" }} />
                    ) : (
                      <ReplayIcon sx={{ fontSize: 18 }} />
                    )
                  }
                  sx={{
                    background: "#1A914B",
                    color: "#fff",
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: 13,
                    px: 2,
                    py: 0.8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                    "&:hover": { background: "#157a3d" },
                    "&.Mui-disabled": { background: "#9ca3af", color: "#fff" },
                  }}
                >
                  {registeringIntent ? "Generating..." : "Retry"}
                </Button>
              </Box>
            )}

            {/* Failed overlay — Retry button */}
            {isFailed && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.55)",
                  backdropFilter: "blur(1px)",
                }}
              >
                <Button
                  onClick={handleRetry}
                  disabled={registeringIntent}
                  startIcon={
                    registeringIntent ? (
                      <CircularProgress size={14} sx={{ color: "#fff" }} />
                    ) : (
                      <ReplayIcon sx={{ fontSize: 18 }} />
                    )
                  }
                  sx={{
                    background: "#ef4444",
                    color: "#fff",
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: 13,
                    px: 2,
                    py: 0.8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                    "&:hover": { background: "#dc2626" },
                    "&.Mui-disabled": { background: "#fca5a5", color: "#fff" },
                  }}
                >
                  {registeringIntent ? "Generating..." : "Retry"}
                </Button>
              </Box>
            )}

            {/* ✅ Cancelled overlay — blur + message */}
            {isCancelled && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.55)",
                  backdropFilter: "blur(1px)",
                }}
              >
                <Typography
                  sx={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}
                >
                  Cancelled
                </Typography>
              </Box>
            )}
          </Box>

          {/* Status Messages */}
          {isExpired && !isQrDisabled && (
            <Typography sx={{ fontSize: 12, color: "#ef4444", mb: 1 }}>
              QR code expired. Click Retry to generate a new one.
            </Typography>
          )}

          {/* FAILED */}
          {isFailed && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.5,
                background: "#fef2f2",
                border: "1px solid #fca5a5",
                borderRadius: "8px",
                px: 2,
                py: 1,
                mb: 1,
                width: "100%",
                maxWidth: 250,
                mx: "auto",
              }}
            >
              <Typography
                sx={{ fontSize: 12, color: "#dc2626", fontWeight: 600 }}
              >
                Payment Failed
              </Typography>
              {failureReason ? (
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "#7f1d1d",
                    textAlign: "center",
                    lineHeight: 1.4,
                  }}
                >
                  {failureReason}
                </Typography>
              ) : null}
            </Box>
          )}

          {isCancelled && (
            <Typography sx={{ fontSize: 12, color: "#6b7280", mb: 1 }}>
              Payment was cancelled.
            </Typography>
          )}

          {/* SUCCESS */}
          {isSuccess && (
            <Box
              sx={{
                width: "240px",
                margin: "auto",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 0.8,
                background: "#f0fdf4",
                border: "1px solid #86efac",
                borderRadius: "8px",
                px: 1.5,
                py: 0.8,
                mb: 2,
              }}
            >
              <Typography
                sx={{ fontSize: 12, color: "#16a34a", fontWeight: 500 }}
              >
                ✓ Payment successful! Redirecting...
              </Typography>
            </Box>
          )}

          {paymentStatus === "PENDING" && statusMessage && (
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.8,
                mb: 1,
              }}
            >
              <CircularProgress size={12} sx={{ color: "#f59e0b" }} />
              <Typography sx={{ fontSize: 12, color: "#f59e0b" }}>
                {statusMessage}
              </Typography>
            </Box>
          )}

          {!paymentStatus && !isExpired && (
            <Typography sx={{ fontSize: 12, color: "#6b7280", mb: 1.5 }}>
              Pay securely with any UPI app
            </Typography>
          )}

          {!isFailed && !isCancelled && (
            <Box
              sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 1 }}
            >
              {Object.keys(upiLogos).map((app) => (
                <Box
                  key={app}
                  component="img"
                  src={upiLogos[app]}
                  sx={{ height: 16, objectFit: "contain" }}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* How it works */}
        <Box sx={{ mt: 3, textAlign: "left" }}>
          <Typography fontWeight={600} fontSize={14} mb={1.5}>
            How it works
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
              gap: 2,
            }}
          >
            {[
              {
                step: "1",
                title: "Open UPI App",
                desc: "Go to your preferred UPI app and click on Scan QR Button",
              },
              {
                step: "2",
                title: "Scan QR code",
                desc: "Scan the generated QR code given on this screen to make payment",
              },
              {
                step: "3",
                title: "Enter UPI PIN",
                desc: "Complete the payment by selecting the bank and entering UPI PIN",
              },
            ].map((item, i) => (
              <Box key={i}>
                <Box sx={{ display: { xs: "block", sm: "none" } }}>
                  <Box
                    sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}
                  >
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        border: "1px solid #c7d2fe",
                        color: "#4f46e5",
                        fontSize: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        mt: "2px",
                      }}
                    >
                      {item.step}
                    </Box>
                    <Box>
                      <Typography fontSize={13} fontWeight={500}>
                        {item.title}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                        {item.desc}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ display: { xs: "none", sm: "block" } }}>
                  <Box
                    sx={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      border: "1px solid #c7d2fe",
                      color: "#4f46e5",
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 0.8,
                    }}
                  >
                    {item.step}
                  </Box>
                  <Typography fontSize={13} fontWeight={500}>
                    {item.title}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                    {item.desc}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* RIGHT COLUMN */}
      <Box
        sx={{
          width: { xs: "100%", md: "280px" },
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {/* Bill Summary */}
        <Box sx={{ border: "1px solid #e5e7eb", borderRadius: "12px", p: 2 }}>
          <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
            Total Amount
          </Typography>
          <Typography fontSize={18} fontWeight={600} mb={1}>
            ₹{qrData?.amount || "--"}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
            Biller Name
          </Typography>
          <Typography fontSize={14} mb={1}>
            {qrData?.biller_name || "--"}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
            Consumer Number
          </Typography>
          <Typography fontSize={14}>
            {qrData?.customerParms?.[0]?.value || "--"}
          </Typography>
        </Box>

        {/* Payment Summary */}
        <Box sx={{ border: "1px solid #e5e7eb", borderRadius: "12px", p: 2 }}>
          <Typography fontWeight={600} fontSize={14} mb={1.5}>
            Payment Summary
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography fontSize={13}>Base Amount</Typography>
            <Typography fontSize={13}>₹{qrData?.amount || "--"}</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography fontSize={13}>Coupon Discount</Typography>
            <Typography fontSize={13}>₹0</Typography>
          </Box>
          <Box sx={{ borderTop: "1px dashed #e5e7eb", my: 1 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography fontWeight={600}>Payable Amount</Typography>
            <Typography fontWeight={600}>₹{qrData?.amount || "--"}</Typography>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Button
              fullWidth
              onClick={handleCancelClick}
              disabled={!isCancelEnabled}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 500,
                py: 1.1,
                fontSize: 13,
                border: "1.5px solid",
                borderColor: isCancelEnabled ? "#ef4444" : "#e5e7eb",
                color: isCancelEnabled ? "#ef4444" : "#9ca3af",
                background: "transparent",
                "&:hover": {
                  background: isCancelEnabled ? "#fef2f2" : "transparent",
                  borderColor: isCancelEnabled ? "#dc2626" : "#e5e7eb",
                },
                "&.Mui-disabled": { color: "#9ca3af", borderColor: "#e5e7eb" },
                transition: "all 0.2s",
              }}
            >
              {cancelling ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={14} sx={{ color: "#ef4444" }} />
                  Cancelling...
                </Box>
              ) : (
                "Cancel Payment"
              )}
            </Button>
            {!isQrReady && (
              <Typography
                sx={{
                  fontSize: 11,
                  color: "#9ca3af",
                  textAlign: "center",
                  mt: 0.5,
                }}
              >
                Available once QR is generated
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={showCancelDialog}
        onClose={handleCancelDialogClose}
        PaperProps={{
          sx: {
            borderRadius: "16px !important",
            p: 1,
            maxWidth: 360,
            boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.08)"
          },
        }}
      >
        {/* Header */}
        <DialogTitle sx={{ fontSize: 18, fontWeight: 700, pt: 2, pb: 1, color: "#111827" }}>
          Cancel Payment?
        </DialogTitle>

        {/* Body Content */}
        <DialogContent sx={{ pb: 2 }}>
          <DialogContentText sx={{ fontSize: 14, color: "#4b5563", lineHeight: 1.5 }}>
            Are you sure you want to cancel this payment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>

        {/* Action Buttons */}
        <DialogActions sx={{ px: 3, pb: 2, gap: 4.5, justifyContent: "flex-end" }}>

          {/* Cancel Action (Subtle Text/Outlined style) */}
          <Button
            onClick={handleCancelConfirm}
            disabled={cancelling}
            sx={{
              textTransform: "none",
              fontSize: 14,
              fontWeight: 600,
              color: "#ef4444",
               background: "#fef2f2",
              borderRadius: "10px",
              px: 2.5,
              py: 1,
              "&:hover": { background: "#f7dddd" },
              "&.Mui-disabled": { color: "#fca5a5" },
            }}
          >
            {cancelling ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={14} sx={{ color: "#fca5a5" }} />
                Cancelling...
              </Box>
            ) : (
              "Yes, Cancel"
            )}
          </Button>

          {/* Primary Safe Action (Solid Button) */}
          <Button
            onClick={handleCancelDialogClose}
            variant="contained"
            disableElevation
            sx={{
              textTransform: "none",
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              background: "#1A914B", // Aap apni brand ka main primary color yaha daal sakte hain
              borderRadius: "10px",
              px: 3,
              py: 1,
              "&:hover": { background: "#1ebb60" },
            }}
          >
            Keep Paying
          </Button>

        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ─── Main Export ──────────────────────────────────────────────────────────────
const PayUsingQR = () => (
  <UtilityLayout activeKey="home">
    <PayUsingQRContent />
  </UtilityLayout>
);

export default PayUsingQR;