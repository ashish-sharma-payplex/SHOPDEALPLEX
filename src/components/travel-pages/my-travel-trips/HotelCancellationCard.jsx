// pages/my-travel-trips/HotelCancellationCard.jsx
import React, { useState } from "react";
import { Box, Typography, Chip, Button, CircularProgress } from "@mui/material";
import Swal from "sweetalert2";
import { GREEN } from "components/travel-hooks/my-trips/constants";
import { checkHotelCancelStatus } from "travel-api/hotelApi";
import { getHotelCancelStatus } from "components/travel-hooks/hotels/HotelCancelStatus";

const HotelCancellationCard = ({ booking }) => {
  const [checking, setChecking] = useState(false);
  const statusInfo = getHotelCancelStatus(booking.status);

  const handleCheckStatus = async () => {
    try {
      setChecking(true);
      const res = await checkHotelCancelStatus(booking.changeRequestId);
      const data = res?.data || {};
      const latest = getHotelCancelStatus(data.status);

      Swal.fire({
        icon: "info",
        title: "Cancellation Status",
        html: `
          <div style="text-align:left;font-size:14px;line-height:1.8">
            <b>Change Request ID:</b> ${data.changeRequestId ?? "-"}<br/>
            <b>Status:</b> <span style="color:${
              latest.color
            };font-weight:600">${latest.label}</span><br/>
            <b>Refunded Amount:</b> ${
              data.refundedAmount ?? "Not yet refunded"
            }<br/>
            <b>Credit Note No:</b> ${data.creditNoteNo ?? "-"}
          </div>
        `,
        confirmButtonText: "OK",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to fetch status",
        text: error?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <Box
      sx={{
        border: "1px solid var(--ht-border)",
        borderRadius: "14px",
        p: 2.2,
        bgcolor: "var(--ht-surface)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 1,
        }}
      >
        <Typography
          sx={{ fontWeight: 700, fontSize: 15, color: "var(--ht-text-strong)" }}
        >
          Booking #{booking.booking_id}
        </Typography>
        <Chip
          label={statusInfo.label}
          size="small"
          sx={{
            bgcolor: `${statusInfo.color}1a`,
            color: statusInfo.color,
            fontWeight: 700,
            fontSize: 12,
          }}
        />
      </Box>

      <Typography
        sx={{ fontSize: 13, color: "var(--ht-text-neutral)", mb: 0.5 }}
      >
        Change Request ID: {booking.changeRequestId}
      </Typography>

      <Typography
        sx={{ fontSize: 13, color: "var(--ht-text-neutral)", mb: 0.5 }}
      >
        Requested on: {new Date(booking.created_at).toLocaleString("en-IN")}
      </Typography>

      {booking.refunded_amount != null && (
        <Typography
          sx={{
            fontSize: 13,
            color: "var(--ht-brand-text)",
            fontWeight: 600,
            mb: 1,
          }}
        >
          Refunded: ₹{booking.refunded_amount}
        </Typography>
      )}

      <Button
        onClick={handleCheckStatus}
        disabled={checking}
        size="small"
        variant="outlined"
        sx={{
          mt: 1,
          textTransform: "none",
          fontWeight: 600,
          borderColor: GREEN,
          color: GREEN,
          "&:hover": { borderColor: GREEN, bgcolor: "var(--ht-success-bg)" },
        }}
      >
        {checking ? (
          <CircularProgress size={16} sx={{ color: GREEN }} />
        ) : (
          "Check Status"
        )}
      </Button>
    </Box>
  );
};

export default HotelCancellationCard;
