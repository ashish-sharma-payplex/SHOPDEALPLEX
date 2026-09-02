import React from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const GREEN = "#16a34a";
const RED = "#ef4444";
const BORDER = "#e5e7eb";
const LIGHT = "#6b7280";
const DARK = "#111827";

// Same safe date formatter used elsewhere — avoids `new Date()` timezone
// shifting. Handles both "16-08-2026 00:00:00" (TBO format) and
// "2026-08-16T00:00:00" (ISO format).
const formatPolicyDate = (value) => {
  if (!value) return "";
  const str = String(value).trim();

  // TBO format: "16-08-2026 00:00:00" -> DD-MM-YYYY already
  const ddmmyyyy = str.match(/^(\d{2})-(\d{2})-(\d{4})/);
  if (ddmmyyyy) {
    const [, d, m, y] = ddmmyyyy;
    return `${d}/${m}/${y}`;
  }

  // ISO format: "2026-08-16T00:00:00" or "2026-08-16"
  const datePart = str.split("T")[0];
  const [y, m, d] = datePart.split("-");
  if (y && m && d) return `${d}/${m}/${y}`;

  return str;
};

const formatCharge = (policy) => {
  if (!policy || policy.CancellationCharge === 0) return "Free";
  if (policy.ChargeType === "Percentage") return `${policy.CancellationCharge}%`;
  return `₹${Number(policy.CancellationCharge).toLocaleString("en-IN")}`;
};

/**
 * cancelPolicies: array from API — prebookData.data.tboResponse
 *   .HotelResult[0].Rooms[0].CancelPolicies
 * isRefundable: boolean, from Rooms[0].IsRefundable
 */
const CancellationPolicyModal = ({
  open,
  onClose,
  cancelPolicies = [],
  isRefundable,
}) => {
  const hasPolicies = cancelPolicies && cancelPolicies.length > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: { borderRadius: "18px", overflow: "hidden" },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2.2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <Typography
          sx={{
            fontSize: 17,
            fontWeight: 800,
            color: DARK,
            fontFamily: "Inter, sans-serif",
          }}
        >
          Cancellation Policy
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon sx={{ fontSize: 20, color: LIGHT }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {/* Overall status pill */}
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.7,
            px: 1.5,
            py: 0.6,
            borderRadius: "30px",
            bgcolor: isRefundable ? "#dcfce7" : "#fef2f2",
            mb: 2.5,
          }}
        >
          {isRefundable ? (
            <CheckCircleIcon sx={{ fontSize: 16, color: GREEN }} />
          ) : (
            <EventBusyOutlinedIcon sx={{ fontSize: 16, color: RED }} />
          )}
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 700,
              color: isRefundable ? GREEN : RED,
              fontFamily: "Inter, sans-serif",
            }}
          >
            {isRefundable ? "Partially Refundable" : "Non Refundable"}
          </Typography>
        </Box>

        {!hasPolicies ? (
          <Typography
            sx={{
              fontSize: 13.5,
              color: LIGHT,
              fontFamily: "Inter, sans-serif",
            }}
          >
            No cancellation policy details are available for this booking.
          </Typography>
        ) : (
          <>
            <Typography
              sx={{
                fontSize: 12.5,
                color: LIGHT,
                mb: 1.5,
                fontFamily: "Inter, sans-serif",
              }}
            >
              Cancellation charges depend on when you cancel:
            </Typography>

            <Box
              sx={{
                border: `1px solid ${BORDER}`,
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              {cancelPolicies.map((policy, i) => {
                const isFree = policy.CancellationCharge === 0;
                return (
                  <Box key={i}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: 2,
                        py: 1.5,
                        bgcolor: i % 2 === 0 ? "#fff" : "#fafafa",
                      }}
                    >
                      <Box>
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: LIGHT,
                            fontFamily: "Inter, sans-serif",
                          }}
                        >
                          From
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 13.5,
                            fontWeight: 700,
                            color: DARK,
                            fontFamily: "Inter, sans-serif",
                          }}
                        >
                          {formatPolicyDate(policy.FromDate)}
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          fontSize: 14,
                          fontWeight: 800,
                          fontFamily: "Inter, sans-serif",
                          color: isFree ? GREEN : RED,
                        }}
                      >
                        {formatCharge(policy)}
                      </Typography>
                    </Box>
                    {i < cancelPolicies.length - 1 && (
                      <Divider sx={{ borderColor: BORDER }} />
                    )}
                  </Box>
                );
              })}
            </Box>

            <Typography
              sx={{
                fontSize: 12,
                color: LIGHT,
                mt: 2,
                lineHeight: 1.7,
                fontFamily: "Inter, sans-serif",
              }}
            >
              Charges shown are deducted from your paid amount if you cancel
              on or after the corresponding date. Times are as per hotel's
              local check-in policy.
            </Typography>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CancellationPolicyModal;