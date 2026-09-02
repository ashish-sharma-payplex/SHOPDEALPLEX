import React from "react";
import { Box, Card, CardContent, Divider, Typography, Button } from "@mui/material";
import { GREEN } from "components/travel-hooks/my-trips/constants";


// booking = ek item STATIC_DATA[selectedCategory] se (Trains | Hotels | Cabs)
const StaticCard = ({ booking, selectedCategory }) => (
  <Card
    key={booking.id}
    elevation={0}
    sx={{
      mb: 2,
      border: "1px solid #eee",
      borderLeft: `5px solid ${GREEN}`,
      borderRadius: "16px",
      transition: "all 0.2s ease",
      "&:hover": { boxShadow: "0 8px 22px rgba(0,0,0,0.08)" },
    }}
  >
    <CardContent sx={{ p: { xs: 2, sm: 3 }, "&:last-child": { pb: { xs: 2, sm: 3 } } }}>
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
                ? "#fef3c7"
                : booking.status === "Past"
                  ? "#dbeafe"
                  : booking.status === "Cancelled"
                    ? "#fee2e2"
                    : "#f3f4f6",
            color:
              booking.status === "Upcoming"
                ? "#b45309"
                : booking.status === "Past"
                  ? "#0369a1"
                  : booking.status === "Cancelled"
                    ? "#dc2626"
                    : "#374151",
          }}
        >
          {booking.status}
        </Box>
      </Box>

      {selectedCategory === "Trains" && (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Box>
              <Typography sx={{ fontSize: 12, color: "#666", mb: 0.5 }}>Route</Typography>
              <Typography sx={{ fontWeight: 600, color: "#1a1a1a" }}>
                {booking.from} → {booking.to}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ fontSize: 12, color: "#666", mb: 0.5 }}>Train</Typography>
              <Typography sx={{ fontWeight: 600, color: "#1a1a1a" }}>{booking.train}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 3 }}>
            <Box>
              <Typography sx={{ fontSize: 12, color: "#666", mb: 0.5 }}>Departure</Typography>
              <Typography sx={{ fontWeight: 600, color: "#1a1a1a" }}>
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
            <Typography sx={{ fontSize: 12, color: "#666", mb: 0.5 }}>Hotel Name</Typography>
            <Typography sx={{ fontWeight: 600, color: "#1a1a1a", mb: 0.5 }}>{booking.name}</Typography>
            <Typography sx={{ fontSize: 12, color: "#666" }}>📍 {booking.location}</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box>
              <Typography sx={{ fontSize: 12, color: "#666", mb: 0.5 }}>
                Check-in / Check-out
              </Typography>
              <Typography sx={{ fontWeight: 600, color: "#1a1a1a", fontSize: 13 }}>
                {booking.checkIn} / {booking.checkOut}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#666", mt: 0.5 }}>
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
              <Typography sx={{ fontSize: 12, color: "#666", mb: 0.5 }}>Route</Typography>
              <Typography sx={{ fontWeight: 600, color: "#1a1a1a" }}>
                {booking.pickupLocation}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#666", mt: 0.5 }}>
                → {booking.dropLocation}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ fontSize: 12, color: "#666", mb: 0.5 }}>Car Type</Typography>
              <Typography sx={{ fontWeight: 600, color: "#1a1a1a" }}>{booking.carType}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 3 }}>
            <Box>
              <Typography sx={{ fontSize: 12, color: "#666", mb: 0.5 }}>Date & Time</Typography>
              <Typography sx={{ fontWeight: 600, color: "#1a1a1a" }}>
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
              borderColor: "#ccc",
              color: "#666",
              fontWeight: 600,
              fontSize: 12,
              textTransform: "none",
              "&:hover": { borderColor: "#999" },
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