import React, { useState } from "react";
import { Box, Typography, useMediaQuery } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HeadsetMicOutlinedIcon from "@mui/icons-material/HeadsetMicOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const PaymentSuccess = ({
  amount = "485",
  serviceType = "Electricity",
  billerName = "Maharashtra State Electricty Board",
  consumerNumber = "183271729038",
  date = "20 Mar 2026, 10:43 AM",
  billerLogo = "/utility/ElectricBill.svg",
  billInfo = {
    PC: "5",
    "Disconn Tag": "0",
    "Bill Month": "2602",
    "Bill Number": "00003237018291",
  },
  paidFrom = "UPI",
  upiTransactionId = "8121250917536",
  dealplexTransactionId = "OCICWL2026032014444130",
  onBackToHome = () => {},
}) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedDealplex, setCopiedDealplex] = useState(false);

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === "upi") {
        setCopiedUpi(true);
        setTimeout(() => setCopiedUpi(false), 2000);
      } else {
        setCopiedDealplex(true);
        setTimeout(() => setCopiedDealplex(false), 2000);
      }
    });
  };

  const CopyButton = ({ text, copied, type }) => (
    <Box
      onClick={() => handleCopy(text, type)}
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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#f3f4f6",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        p: { xs: 1.5, sm: 3 },
        pt: { xs: 2, sm: 4 },
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 480,
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid #e5e7eb",
          background: "#fff",
        }}
      >
        {/* ── TOP SUCCESS BANNER ── */}
        <Box
          sx={{
            background:
              "linear-gradient(180deg, #d1fae5 0%, #f0fdf4 60%, #fff 100%)",
            pt: 4,
            pb: 3,
            textAlign: "center",
          }}
        >
          {/* Green check circle */}
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "#16a34a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 1.5,
            }}
          >
            <CheckCircleIcon sx={{ color: "#fff", fontSize: 32 }} />
          </Box>

          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 600,
              color: "#16a34a",
              mb: 1.5,
            }}
          >
            Payment successful
          </Typography>

          <Typography
            sx={{
              fontSize: 30,
              fontWeight: 700,
              color: "#16a34a",
            }}
          >
            ₹{amount}
          </Typography>
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
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                cursor: "pointer",
                "&:hover": { opacity: 0.8 },
              }}
            >
              <HeadsetMicOutlinedIcon sx={{ fontSize: 14, color: "#6b7280" }} />
              <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
                Need Help ?
              </Typography>
            </Box>
          </Box>

          {/* ── BILLER INFO CARD ── */}
          <Box
            sx={{
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              p: 1.5,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 1,
              mb: 2,
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
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#111",
                    lineHeight: 1.4,
                  }}
                >
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
              <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#111" }}>
                ₹{amount}
              </Typography>
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
                    background: "#16a34a",
                    flexShrink: 0,
                  }}
                />
                <Typography
                  sx={{ fontSize: 12, color: "#16a34a", fontWeight: 500 }}
                >
                  Success
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* ── BILL INFORMATION ── */}
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
            {/* BBPS logo placeholder */}
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <Box
                component="img"
                src="/utility/bbps.svg"
                alt="BBPS"
                sx={{ width: 28, height: 28, objectFit: "contain" }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </Box>
          </Box>

          {/* Bill info 2-column grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px 16px",
              mb: 1,
            }}
          >
            {Object.entries(billInfo).map(([key, val]) => (
              <Box key={key}>
                <Typography sx={{ fontSize: 12, color: "#6b7280", mb: 0.3 }}>
                  {key}
                </Typography>
                <Typography sx={{ fontSize: 14, color: "#111" }}>
                  {val}
                </Typography>
              </Box>
            ))}
          </Box>

          <Divider />

          {/* ── PAYMENT INFORMATION ── */}
          <Typography
            sx={{ fontSize: 14, fontWeight: 600, color: "#111", mb: 1.5 }}
          >
            Payment Information
          </Typography>

          {/* Paid From */}
          <Typography sx={{ fontSize: 12, color: "#6b7280", mb: 0.3 }}>
            Paid From
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#111", mb: 1.5 }}>
            {paidFrom}
          </Typography>

          {/* UPI Transaction ID */}
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
            <CopyButton text={upiTransactionId} copied={copiedUpi} type="upi" />
          </Box>

          {/* Dealplex Transaction ID */}
          <Typography sx={{ fontSize: 12, color: "#6b7280", mb: 0.3 }}>
            Dealplex Transaction ID
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
              sx={{
                fontSize: 14,
                color: "#111",
                wordBreak: "break-all",
                pr: 1,
              }}
            >
              {dealplexTransactionId}
            </Typography>
            <CopyButton
              text={dealplexTransactionId}
              copied={copiedDealplex}
              type="dealplex"
            />
          </Box>

          <Divider />

          {/* ── BACK TO HOME ── */}
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
        </Box>
      </Box>
    </Box>
  );
};

export default PaymentSuccess;
