import React, { useState } from "react";
import { Box, Typography, useMediaQuery } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";

const PayViaWallet = ({
  totalAmount = "500",
  billerName = "ICIC Bank Fastag",
  consumerNumber = "183271729038",
  walletBalance = "2,000",
  afterPaymentBalance = "1,515",
  baseAmount = "500",
  couponDiscount = "15",
  payableAmount = "485",
  onPay = () => {},
  onApplyCoupon = () => {},
}) => {
  const isMobile = useMediaQuery("(max-width:600px)");

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 2,
        flexDirection: { xs: "column", md: "row" },
        p: { xs: 1.5, sm: 2 },
        background: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      {/* ── LEFT CARD ── */}
      <Box
        sx={{
          width: { xs: "100%", md: "40%" },
          flexShrink: 0,
          border: "1px solid #e5e7eb",
          borderRadius: "14px",
          p: { xs: 2, sm: 2.5 },
          background: "#fff",
        }}
      >
        {/* Header */}
        <Typography
          sx={{ fontSize: 16, fontWeight: 700, color: "#111", mb: 0.4 }}
        >
          Pay via Wallet
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#6b7280", mb: 2.5 }}>
          Secure &amp; instant payment
        </Typography>

        {/* Wallet Card */}
        <Box
          sx={{
            border: "1px solid #d1fae5",
            borderRadius: "16px",
            p: 2.5,
            mb: 2.5,
            position: "relative",
            overflow: "hidden",
            background:
              "linear-gradient(to right, #e8faf0 0%, #f4fdf7 40%, transparent 100%)",
          }}
        >
          {/* Wallet name + Active badge */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1.5,
            }}
          >
            <Typography sx={{ fontSize: 17, fontWeight: 700, color: "#111" }}>
              Dealplex Wallet
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "20px",
                px: 1.2,
                py: 0.3,
              }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#16a34a",
                }}
              />
              <Typography
                sx={{ fontSize: 12, color: "#16a34a", fontWeight: 500 }}
              >
                Active
              </Typography>
            </Box>
          </Box>

          {/* Available Balance */}
          <Typography sx={{ fontSize: 13, color: "#6b7280", mb: 0.4 }}>
            Available Balance
          </Typography>
          <Typography
            sx={{ fontSize: 22, fontWeight: 700, color: "#16a34a", mb: 1.5 }}
          >
            ₹{walletBalance}
          </Typography>

          {/* Dashed divider */}
          <Box sx={{ borderTop: "1.5px dashed #e5e7eb", mb: 1.5 }} />

          {/* Pay instantly message */}
          <Typography
            sx={{ fontSize: 14, fontWeight: 500, color: "#111", mb: 0.3 }}
          >
            You can pay this bill instanly
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
            After payment: ₹{afterPaymentBalance} left
          </Typography>
        </Box>

        {/* Pay Button */}
        <Box
          onClick={onPay}
          sx={{
            background: "#1a7a3c",
            borderRadius: "10px",
            py: 1.6,
            textAlign: "center",
            cursor: "pointer",
            transition: "0.2s",
            "&:hover": { background: "#15692f" },
            "&:active": { transform: "scale(0.99)" },
          }}
        >
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>
            Pay ₹ {payableAmount}
          </Typography>
        </Box>
      </Box>

      {/* ── RIGHT COLUMN ── */}
      <Box
        sx={{
          width: { xs: "100%", md: "60%" },
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: 0,
          border: "1px solid #e5e7eb",
          borderRadius: "14px",
          background: "#fff",
          overflow: "hidden",
        }}
      >
        {/* Total Amount + Biller */}
        <Box sx={{ p: { xs: 2, sm: 2.5 }, borderBottom: "1px solid #e5e7eb" }}>
          <Typography sx={{ fontSize: 13, color: "#6b7280", mb: 0.3 }}>
            Total Amount
          </Typography>
          <Typography
            sx={{ fontSize: 24, fontWeight: 700, color: "#111", mb: 2 }}
          >
            ₹ {totalAmount}
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1,
            }}
          >
            <Box>
              <Typography sx={{ fontSize: 12, color: "#6b7280", mb: 0.3 }}>
                Biller Name
              </Typography>
              <Typography sx={{ fontSize: 14, color: "#111" }}>
                {billerName}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 12, color: "#6b7280", mb: 0.3 }}>
                Consumer Number
              </Typography>
              <Typography sx={{ fontSize: 14, color: "#111" }}>
                {consumerNumber}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Apply Coupon */}
        <Box
          onClick={onApplyCoupon}
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: 1.8,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            borderBottom: "1px solid #e5e7eb",
            "&:hover": { background: "#f9fafb" },
            transition: "0.15s",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LocalOfferOutlinedIcon sx={{ fontSize: 18, color: "#6b7280" }} />
            <Typography sx={{ fontSize: 14, color: "#111" }}>
              Apply Coupon
            </Typography>
          </Box>
          <ChevronRightIcon sx={{ fontSize: 18, color: "#9ca3af" }} />
        </Box>

        {/* Payment Summary */}
        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Typography
            sx={{ fontSize: 14, fontWeight: 700, color: "#111", mb: 2 }}
          >
            Payment Summary
          </Typography>

          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}
          >
            <Typography sx={{ fontSize: 13, color: "#374151" }}>
              Base Amount
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#374151" }}>
              ₹ {baseAmount}
            </Typography>
          </Box>

          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}
          >
            <Typography sx={{ fontSize: 13, color: "#374151" }}>
              Coupon Discount
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#374151" }}>
              ₹ {couponDiscount}
            </Typography>
          </Box>

          <Box sx={{ borderTop: "1px dashed #e5e7eb", mb: 1.5 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#111" }}>
              Payable Amount
            </Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#111" }}>
              ₹ {payableAmount}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PayViaWallet;
