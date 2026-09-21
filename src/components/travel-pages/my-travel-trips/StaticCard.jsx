import React from "react";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Typography,
  Button,
} from "@mui/material";
import { GREEN } from "components/travel-hooks/my-trips/constants";

// booking = ek item STATIC_DATA[selectedCategory] se (Trains | Hotels | Cabs)
const StaticCard = ({ booking, selectedCategory }) => (
  <Card
    key={booking.id}
    elevation={0}
    sx={{
      mb: 2,
      border: "1px solid var(--mb-border-soft)",
      borderLeft: `5px solid ${GREEN}`,
      borderRadius: "16px",
      transition: "all 0.2s ease",
      "&:hover": { boxShadow: "0 8px 22px rgba(0,0,0,0.08)" },
    }}
  >
    <CardContent
      sx={{ p: { xs: 2, sm: 3 }, "&:last-child": { pb: { xs: 2, sm: 3 } } }}
    >
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1.5 }}>
        <Box
          sx={{
            px: 2,
            py: 0.7,
            borderRadius: "20px",
            fontSize: 13,
            fontWeight: 700,
            bgcolor:
              booking.status === "Upcoming"
                ? "var(--mb-warn-bg)"
                : booking.status === "Past"
                ? "var(--mb-info-bg-strong)"
                : booking.status === "Cancelled"
                ? "var(--mb-danger-bg-strong)"
                : "var(--mb-surface-muted)",
            color:
              booking.status === "Upcoming"
                ? "var(--mb-warn-strong-text)"
                : booking.status === "Past"
                ? "var(--mb-info-text)"
                : booking.status === "Cancelled"
                ? "var(--mb-danger-text)"
                : "var(--mb-text-body)",
          }}
        >
          {booking.status}
        </Box>
      </Box>

      {selectedCategory === "Trains" && (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Box>
              <Typography
                sx={{ fontSize: 12, color: "var(--mb-text-muted)", mb: 0.5 }}
              >
                Route
              </Typography>
              <Typography
                sx={{ fontWeight: 600, color: "var(--mb-text-strong)" }}
              >
                {booking.from} → {booking.to}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography
                sx={{ fontSize: 12, color: "var(--mb-text-muted)", mb: 0.5 }}
              >
                Train
              </Typography>
              <Typography
                sx={{ fontWeight: 600, color: "var(--mb-text-strong)" }}
              >
                {booking.train}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 3 }}>
            <Box>
              <Typography
                sx={{ fontSize: 12, color: "var(--mb-text-muted)", mb: 0.5 }}
              >
                Departure
              </Typography>
              <Typography
                sx={{ fontWeight: 600, color: "var(--mb-text-strong)" }}
              >
                {booking.date} • {booking.time}
              </Typography>
            </Box>
            <Box sx={{ ml: "auto", textAlign: "right" }}>
              <Typography sx={{ fontSize: 12, color: GREEN, fontWeight: 700 }}>
                {booking.price}
              </Typography>
            </Box>
          </Box>
        </>
      )}

      {selectedCategory === "Hotels" && (
        <>
          <Box sx={{ mb: 1 }}>
            <Typography
              sx={{ fontSize: 12, color: "var(--mb-text-muted)", mb: 0.5 }}
            >
              Hotel Name
            </Typography>
            <Typography
              sx={{ fontWeight: 600, color: "var(--mb-text-strong)", mb: 0.5 }}
            >
              {booking.name}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "var(--mb-text-muted)" }}>
              📍 {booking.location}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box>
              <Typography
                sx={{ fontSize: 12, color: "var(--mb-text-muted)", mb: 0.5 }}
              >
                Check-in / Check-out
              </Typography>
              <Typography
                sx={{
                  fontWeight: 600,
                  color: "var(--mb-text-strong)",
                  fontSize: 13,
                }}
              >
                {booking.checkIn} / {booking.checkOut}
              </Typography>
              <Typography
                sx={{ fontSize: 12, color: "var(--mb-text-muted)", mt: 0.5 }}
              >
                ({booking.nights} nights)
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ fontSize: 12, color: GREEN, fontWeight: 700 }}>
                {booking.price}
              </Typography>
            </Box>
          </Box>
        </>
      )}

      {selectedCategory === "Cabs" && (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Box>
              <Typography
                sx={{ fontSize: 12, color: "var(--mb-text-muted)", mb: 0.5 }}
              >
                Route
              </Typography>
              <Typography
                sx={{ fontWeight: 600, color: "var(--mb-text-strong)" }}
              >
                {booking.pickupLocation}
              </Typography>
              <Typography
                sx={{ fontSize: 12, color: "var(--mb-text-muted)", mt: 0.5 }}
              >
                → {booking.dropLocation}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography
                sx={{ fontSize: 12, color: "var(--mb-text-muted)", mb: 0.5 }}
              >
                Car Type
              </Typography>
              <Typography
                sx={{ fontWeight: 600, color: "var(--mb-text-strong)" }}
              >
                {booking.carType}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 3 }}>
            <Box>
              <Typography
                sx={{ fontSize: 12, color: "var(--mb-text-muted)", mb: 0.5 }}
              >
                Date & Time
              </Typography>
              <Typography
                sx={{ fontWeight: 600, color: "var(--mb-text-strong)" }}
              >
                {booking.date} • {booking.time}
              </Typography>
            </Box>
            <Box sx={{ ml: "auto", textAlign: "right" }}>
              <Typography sx={{ fontSize: 12, color: GREEN, fontWeight: 700 }}>
                {booking.price}
              </Typography>
            </Box>
          </Box>
        </>
      )}

      <Divider sx={{ my: 1.5 }} />
      <Box sx={{ display: "flex", gap: 1 }}>
        {booking.status === "Upcoming" && (
          <Button
            size="small"
            variant="outlined"
            sx={{
              borderColor: "var(--mb-border-strong)",
              color: "var(--mb-text-muted)",
              fontWeight: 600,
              fontSize: 12,
              textTransform: "none",
              "&:hover": { borderColor: "var(--mb-text-faint)" },
            }}
          >
            Modify
          </Button>
        )}
      </Box>
    </CardContent>
  </Card>
);

export default StaticCard;
