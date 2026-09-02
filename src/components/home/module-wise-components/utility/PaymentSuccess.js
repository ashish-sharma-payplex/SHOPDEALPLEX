import React, { useState, useRef } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HeadsetMicOutlinedIcon from "@mui/icons-material/HeadsetMicOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import DownloadIcon from "@mui/icons-material/Download";

// ─── Helpers ────────────────────────────────────────────────────────────────

const getPaymentStatus = (apiResponse) => {
  if (!apiResponse) return "failure";
  const bbpsStatus = apiResponse?.bbps?.status?.toUpperCase();
  const responseReason = apiResponse?.bbps?.response?.responseReason?.toUpperCase();
  const errorList = apiResponse?.bbps?.response?.errorList || [];
  if (
    bbpsStatus === "FAILURE" ||
    responseReason === "FAILURE" ||
    responseReason === "ERROR" ||
    errorList.length > 0
  ) return "failure";
  if (bbpsStatus === "SUCCESS") return "success";
  return "failure";
};

const getFailureMessage = (apiResponse) => {
  const complianceReason = apiResponse?.bbps?.response?.complianceReason || "";
  const errorList = apiResponse?.bbps?.response?.errorList || [];
  const message = apiResponse?.message || "";
  if (complianceReason) return complianceReason;
  if (errorList.length > 0)
    return errorList[0]?.errorDtl?.trim() || message || "Payment failed. Please try again.";
  return message || "Payment failed. Please try again.";
};

const getAllErrors = (apiResponse) =>
  apiResponse?.bbps?.response?.errorList || [];

// ─── Sub-components ─────────────────────────────────────────────────────────

const CopyButton = ({ text, copied, type, onCopy }) => (
  <Box
    onClick={() => onCopy(text, type)}
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 0.5,
      cursor: "pointer",
      color: copied ? "#16a34a" : "#6b7280",
      transition: "color 0.2s",
      "&:hover": { color: "#16a34a" },
      flexShrink: 0,
    }}
  >
    <ContentCopyIcon sx={{ fontSize: 14 }} />
    <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
      {copied ? "COPIED" : "COPY"}
    </Typography>
  </Box>
);

const Divider = () => <Box sx={{ borderTop: "1px solid #e5e7eb", my: 2 }} />;

// ─── Main Component ──────────────────────────────────────────────────────────

const PaymentSuccess = ({
  apiResponse = null,
  serviceType = "Electricity",
  billerName = "Maharashtra State Electricity Board",
  consumerNumber = "183271729038",
  billerLogo = "/utility/ElectricBill.svg",
  billInfo = {},
  onBackToHome = () => {},
  onNeedHelp = () => {},
}) => {
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedDealplex, setCopiedDealplex] = useState(false);
  const [copiedTxnRef, setCopiedTxnRef] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isPdfMode, setIsPdfMode] = useState(false);

  // Ref attached to the card we want to capture
  const billCardRef = useRef(null);
  // Ref to hide footer buttons during PDF capture
  const footerRef = useRef(null);

  const paymentStatus = getPaymentStatus(apiResponse);
  const isSuccess = paymentStatus === "success";
  const failureMessage = isSuccess ? "" : getFailureMessage(apiResponse);
  const allErrors = isSuccess ? [] : getAllErrors(apiResponse);

  const bbpsResponse = apiResponse?.bbps?.response || {};
  const amount = apiResponse?.amount || "";
  const txnReferenceId = bbpsResponse?.txnReferenceId || "";
  const txnDateTime = bbpsResponse?.txnDateTime || "";
  const respCode = apiResponse?.bbps?.respCode || "";

  const upiTransactionId =
    bbpsResponse?.upiTransactionId ||
    bbpsResponse?.pgTxnId ||
    bbpsResponse?.txnId ||
    apiResponse?.upiTransactionId ||
    apiResponse?.txnId ||
    "";

  const dealplexTransactionId =
    bbpsResponse?.clientRequestId ||
    apiResponse?.transactionId ||
    apiResponse?.orderId ||
    "";

  const paidFrom = apiResponse?.payment_method || "UPI";

  const date = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === "upi") {
        setCopiedUpi(true);
        setTimeout(() => setCopiedUpi(false), 2000);
      } else if (type === "txnref") {
        setCopiedTxnRef(true);
        setTimeout(() => setCopiedTxnRef(false), 2000);
      } else {
        setCopiedDealplex(true);
        setTimeout(() => setCopiedDealplex(false), 2000);
      }
    });
  };

  // ── PDF Download ──────────────────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    if (!billCardRef.current) return;
    setDownloading(true);

    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const element = billCardRef.current;

      // Hide buttons before capture
      setIsPdfMode(true);
      await new Promise((r) => setTimeout(r, 50)); // wait for re-render

      // Temporarily remove border-radius for cleaner capture
      const originalBorderRadius = element.style.borderRadius;
      element.style.borderRadius = "0";

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      element.style.borderRadius = originalBorderRadius;

      // Restore buttons after capture
      setIsPdfMode(false);

      // A4 page: 210 × 297 mm
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 10;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height / canvas.width) * imgWidth;

      // If content is taller than one page, split across pages
      let remainingHeight = imgHeight;
      let sourceY = 0;

      while (remainingHeight > 0) {
        const sliceHeight = Math.min(remainingHeight, pageHeight - margin * 2);
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = (sliceHeight / imgHeight) * canvas.height;
        const ctx = sliceCanvas.getContext("2d");
        ctx.drawImage(
          canvas,
          0, sourceY,
          canvas.width, sliceCanvas.height,
          0, 0,
          canvas.width, sliceCanvas.height
        );

        if (sourceY > 0) pdf.addPage();
        pdf.addImage(
          sliceCanvas.toDataURL("image/png"),
          "PNG",
          margin,
          margin,
          imgWidth,
          sliceHeight
        );

        sourceY += sliceCanvas.height;
        remainingHeight -= sliceHeight;
      }

      const fileName = `payment_${isSuccess ? "success" : "failed"}_${
        txnReferenceId || Date.now()
      }.pdf`;
      pdf.save(fileName);

    } catch (err) {
      // console.error("PDF generation failed:", err);
      alert("PDF download failed. Please try again.");
    } finally {
      setIsPdfMode(false);
      setDownloading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        p: { xs: 1.5, sm: 3 },
        pt: { xs: 2, sm: 4 },
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 480 }}>

        {/* ── BILL CARD (this gets captured) ── */}
        <Box
          ref={billCardRef}
          sx={{
            width: "100%",
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid #e5e7eb",
            background: "#fff",
          }}
        >
          {/* ── TOP BANNER ── */}
          <Box
            sx={{
              background: isSuccess
                ? "linear-gradient(180deg, #d1fae5 0%, #f0fdf4 60%, #fff 100%)"
                : "linear-gradient(180deg, #fee2e2 0%, #fff5f5 60%, #fff 100%)",
              pt: 4,
              pb: 3,
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: isSuccess ? "#16a34a" : "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 1.5,
              }}
            >
              {isSuccess ? (
                <CheckCircleIcon sx={{ color: "#fff", fontSize: 32 }} />
              ) : (
                <CancelIcon sx={{ color: "#fff", fontSize: 32 }} />
              )}
            </Box>

            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 600,
                color: isSuccess ? "#16a34a" : "#dc2626",
                mb: isSuccess ? 1.5 : 1,
              }}
            >
              {isSuccess ? "Payment Successful" : "Payment Failed"}
            </Typography>

            {isSuccess && amount && (
              <Typography sx={{ fontSize: 30, fontWeight: 700, color: "#16a34a" }}>
                ₹{amount}
              </Typography>
            )}

            {!isSuccess && (
              <Typography sx={{ fontSize: 13, color: "#6b7280", px: 3, lineHeight: 1.5 }}>
                {failureMessage}
              </Typography>
            )}
          </Box>

          {/* ── BODY ── */}
          <Box sx={{ px: { xs: 2, sm: 3 }, pb: 3 }}>

            {/* ── SERVICE ROW ── */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1.5,
              }}
            >
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111" }}>
                {serviceType}
              </Typography>

              {/* Right side: Download icon + Need Help */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                {/* Download icon — hidden in PDF mode */}
                {!isPdfMode && (
                  <Box
                    onClick={!downloading ? handleDownloadPDF : undefined}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      cursor: downloading ? "not-allowed" : "pointer",
                      opacity: downloading ? 0.6 : 1,
                      transition: "opacity 0.2s",
                      "&:hover": { opacity: downloading ? 0.6 : 0.7 },
                    }}
                  >
                    {downloading ? (
                      <CircularProgress
                        size={16}
                        sx={{ color: "#6b7280" }}
                      />
                    ) : (
                      <DownloadIcon sx={{ fontSize: 18, color: "#6b7280" }} />
                    )}
                  </Box>
                )}

                {/* Need Help */}
                <Box
                  onClick={onNeedHelp}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    cursor: "pointer",
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                    "&:hover": { opacity: 0.8 },
                  }}
                >
                  <HeadsetMicOutlinedIcon sx={{ fontSize: 14, color: "#6b7280", flexShrink: 0 }} />
                  <Typography sx={{ fontSize: 13, color: "#6b7280" }}>Need Helpp?</Typography>
                </Box>
              </Box>
            </Box>

            {/* ── BILLER INFO CARD ── */}
            <Box
              sx={{
                border: `1px solid ${isSuccess ? "#e5e7eb" : "#fca5a5"}`,
                borderRadius: "10px",
                p: 1.5,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 1,
                mb: 2,
                background: isSuccess ? "#fff" : "#fff5f5",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                <Box
                  component="img"
                  src={billerLogo}
                  alt={billerName}
                  sx={{
                    width: 32,
                    height: 32,
                    objectFit: "contain",
                    flexShrink: 0,
                    mt: 0.3,
                  }}
                />
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#111", lineHeight: 1.4 }}>
                    {billerName}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: "#374151" }}>
                    {consumerNumber}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "#6b7280", mt: 0.3 }}>
                    {date}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                {amount && (
                  <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#111" }}>
                    ₹{amount}
                  </Typography>
                )}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    justifyContent: "flex-end",
                    mt: 0.4,
                  }}
                >
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: isSuccess ? "#16a34a" : "#dc2626",
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: isSuccess ? "#16a34a" : "#dc2626",
                      fontWeight: 500,
                    }}
                  >
                    {isSuccess ? "Success" : "Failed"}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* ── FAILURE: Error List ── */}
            {!isSuccess && allErrors.length > 0 && (
              <>
                <Divider />
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 1.5 }}>
                    <WarningAmberIcon sx={{ fontSize: 16, color: "#dc2626" }} />
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111" }}>
                      Error Details
                    </Typography>
                  </Box>
                  {allErrors.map((err, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                        mb: 1,
                        p: 1.2,
                        background: "#fff5f5",
                        borderRadius: "8px",
                        border: "1px solid #fecaca",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#dc2626",
                          background: "#fee2e2",
                          px: 0.8,
                          py: 0.2,
                          borderRadius: "4px",
                          flexShrink: 0,
                          mt: 0.1,
                        }}
                      >
                        {err.errorCd}
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: "#374151" }}>
                        {err.errorDtl}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </>
            )}

            {/* ── SUCCESS: Bill Information ── */}
            {isSuccess && Object.keys(billInfo).length > 0 && (
              <>
                <Divider />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111" }}>
                    Bill Information
                  </Typography>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      component="img"
                      src="/utility/bbpsassuredlogo.svg"
                      alt="BBPS"
                      sx={{ width: 34, height: 34, objectFit: "contain" }}
                    />
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px 16px",
                    mb: 1,
                  }}
                >
                  <Box>
                    <Typography sx={{ fontSize: 12, color: "#6b7280", mb: 0.3 }}>
                      Bill Number
                    </Typography>
                    <Typography sx={{ fontSize: 14, color: "#111", wordBreak: "break-all" }}>
                      {billInfo["Bill Number"] || "—"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: 12, color: "#6b7280", mb: 0.3 }}>
                      Max Recharge Amount
                    </Typography>
                    <Typography sx={{ fontSize: 14, color: "#111" }}>
                      {billInfo["Maximum Permissible Recharge Amount"]
                        ? `₹${billInfo["Maximum Permissible Recharge Amount"]}`
                        : "—"}
                    </Typography>
                  </Box>

                  {txnDateTime && (
                    <Box>
                      <Typography sx={{ fontSize: 12, color: "#6b7280", mb: 0.3 }}>
                        Transaction Date & Time
                      </Typography>
                      <Typography sx={{ fontSize: 14, color: "#111" }}>
                        {txnDateTime.slice(0, 10)}&nbsp;&nbsp;&nbsp;{txnDateTime.slice(11, 16)}
                      </Typography>
                    </Box>
                  )}

                  {Object.entries(billInfo)
                    .filter(
                      ([key]) =>
                        key !== "Bill Number" &&
                        key !== "Maximum Permissible Recharge Amount" &&
                        key !== "Tag Status"
                    )
                    .map(([key, val]) => (
                      <Box key={key}>
                        <Typography sx={{ fontSize: 12, color: "#6b7280", mb: 0.3 }}>
                          {key}
                        </Typography>
                        <Typography sx={{ fontSize: 14, color: "#111" }}>{val}</Typography>
                      </Box>
                    ))}
                </Box>
              </>
            )}

            {/* ── SUCCESS: Payment Information ── */}
            {isSuccess && (
              <>
                <Divider />
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111", mb: 1.5 }}>
                  Payment Information
                </Typography>

                <Typography sx={{ fontSize: 12, color: "#6b7280", mb: 0.3 }}>
                  Paid From
                </Typography>
                <Typography
                  sx={{ fontSize: 14, color: "#111", mb: 1.5, textTransform: "uppercase" }}
                >
                  {paidFrom}
                </Typography>

                {txnReferenceId && (
                  <>
                    <Typography sx={{ fontSize: 12, color: "#6b7280", mb: 0.3 }}>
                      Transaction ID
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1.5,
                      }}
                    >
                      <Typography sx={{ fontSize: 14, color: "#111", wordBreak: "break-all", pr: 1 }}>
                        {txnReferenceId}
                      </Typography>
                      <CopyButton
                        text={txnReferenceId}
                        copied={copiedTxnRef}
                        type="txnref"
                        onCopy={handleCopy}
                      />
                    </Box>
                  </>
                )}

                {upiTransactionId && (
                  <>
                    <Typography sx={{ fontSize: 12, color: "#6b7280", mb: 0.3 }}>
                      UPI Transaction ID
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1.5,
                      }}
                    >
                      <Typography sx={{ fontSize: 14, color: "#111" }}>
                        {upiTransactionId}
                      </Typography>
                      <CopyButton
                        text={upiTransactionId}
                        copied={copiedUpi}
                        type="upi"
                        onCopy={handleCopy}
                      />
                    </Box>
                  </>
                )}

                {dealplexTransactionId && (
                  <>
                    <Typography sx={{ fontSize: 12, color: "#6b7280", mb: 0.3 }}>
                      Reference ID
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography
                        sx={{ fontSize: 14, color: "#111", wordBreak: "break-all", pr: 1 }}
                      >
                        {dealplexTransactionId}
                      </Typography>
                      <CopyButton
                        text={dealplexTransactionId}
                        copied={copiedDealplex}
                        type="dealplex"
                        onCopy={handleCopy}
                      />
                    </Box>
                  </>
                )}
              </>
            )}

            <Divider />

            {/* ── FAILURE: Retry / Back ── */}
            {!isSuccess && !isPdfMode && (
              <Box sx={{ textAlign: "center", mt: 1 }}>
                <Typography
                  onClick={onBackToHome}
                  sx={{
                    fontSize: 14,
                    color: "#dc2626",
                    fontWeight: 500,
                    cursor: "pointer",
                    mb: 1,
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Try Again
                </Typography>
                <Typography
                  onClick={onBackToHome}
                  sx={{
                    fontSize: 13,
                    color: "#6b7280",
                    cursor: "pointer",
                    "&:hover": { color: "#374151" },
                  }}
                >
                  Back to Home
                </Typography>
              </Box>
            )}

            {/* ── SUCCESS: Back to Home ── */}
            {isSuccess && !isPdfMode && (
              <Box sx={{ textAlign: "center", mt: 1 }}>
                <Typography
                  onClick={onBackToHome}
                  sx={{
                    fontSize: 14,
                    color: "#16a34a",
                    fontWeight: 500,
                    cursor: "pointer",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Back to Home
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
        {/* end billCardRef */}

      </Box>
    </Box>
  );
};

export default PaymentSuccess;