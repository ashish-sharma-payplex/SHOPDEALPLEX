import React from "react";
import { Box, Card, CardContent, Divider } from "@mui/material";

const FlightCardSkeleton = () => (
  <Card
    elevation={0}
    sx={{
      position: "relative",
      overflow: "hidden",
      border: "1px solid #e5e7eb",
      borderLeft: "4px solid #d1fae5",
      borderRadius: "14px",
    }}
  >
    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
      {/* Row 1 */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{ width: 34, height: 34, borderRadius: "50%", bgcolor: "#f3f4f6" }}
          />
          <Box sx={{ width: 100, height: 14, borderRadius: 2, bgcolor: "#f3f4f6" }} />
        </Box>
        <Box sx={{ width: 70, height: 22, borderRadius: "20px", bgcolor: "#f3f4f6" }} />
      </Box>

      {/* Row 2 - route */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Box sx={{ width: 40, height: 13, borderRadius: 2, bgcolor: "#f3f4f6" }} />
        <Box sx={{ width: 16, height: 13, borderRadius: 2, bgcolor: "#f3f4f6" }} />
        <Box sx={{ width: 40, height: 13, borderRadius: 2, bgcolor: "#f3f4f6" }} />
      </Box>

      {/* Row 3 - date + id */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
        <Box sx={{ width: 90, height: 12, borderRadius: 2, bgcolor: "#f3f4f6" }} />
        <Box sx={{ width: 70, height: 12, borderRadius: 2, bgcolor: "#f3f4f6" }} />
      </Box>

      {/* Row 4 - fare */}
      <Box sx={{ width: 80, height: 18, borderRadius: 2, bgcolor: "#f3f4f6", mb: 1.5 }} />

      <Divider sx={{ mb: 1.5 }} />

      {/* Row 5 - buttons */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ width: 90, height: 30, borderRadius: "8px", bgcolor: "#f3f4f6" }} />
        <Box sx={{ width: 60, height: 12, borderRadius: 2, bgcolor: "#f3f4f6" }} />
      </Box>
    </CardContent>

    {/* Shimmer sweep */}
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s infinite",
        "@keyframes shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      }}
    />
  </Card>
);

export default FlightCardSkeleton;