// pages\my-travel-trips\HotelCardSkeleton.jsx
import React from "react";
import { Box, Paper, Skeleton } from "@mui/material";

const HotelCardSkeleton = () => (
  <Paper elevation={0} sx={{ borderRadius: "16px", border: "1px solid #e8e8e8", overflow: "hidden" }}>
    <Box sx={{ px: 2.5, py: 1.5, bgcolor: "#f9fafb", borderBottom: "1px solid #eee", display: "flex", gap: 1.2 }}>
      <Skeleton variant="rounded" width={34} height={34} />
      <Box sx={{ flex: 1 }}>
        <Skeleton width="60%" height={16} />
        <Skeleton width="35%" height={12} />
      </Box>
    </Box>
    <Box sx={{ p: 2.5 }}>
      <Skeleton width="70%" height={16} sx={{ mb: 1 }} />
      <Skeleton width="55%" height={16} sx={{ mb: 2 }} />
      <Skeleton variant="rounded" height={48} sx={{ mb: 2 }} />
      <Skeleton variant="rounded" height={38} />
    </Box>
  </Paper>
);

export default HotelCardSkeleton;