import React from "react";
import { Box, Skeleton } from "@mui/material";
import styles from "styles/rental.module.css";

/*
  ✅ Real VehicleCard ki exact height match karo yahan
  Agar real card ki height alag hai to sirf CARD_HEIGHT badlo —
  layout kabhi shift nahi hoga
*/
const CARD_HEIGHT = 320; // ← real VehicleCard ki height yahan daalo

const VehicleCardSkeleton = () => {
  return (
    <Box
      className={styles.rentalSkeleton}
      sx={{
        height: `${CARD_HEIGHT}px`, // ✅ fixed height — real card jaisi
        width: "100%",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #f0f0f0",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Image area */}
      <Skeleton
        variant="rectangular"
        width="100%"
        height={180}
        animation="wave"
        sx={{ flexShrink: 0 }}
      />

      {/* Content area */}
      <Box
        sx={{
          p: 1.5,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {/* Title */}
        <Skeleton variant="text" width="70%" height={22} animation="wave" />
        {/* Subtitle */}
        <Skeleton variant="text" width="50%" height={18} animation="wave" />
        {/* Bottom row */}
        <Box
          sx={{ mt: "auto", display: "flex", justifyContent: "space-between" }}
        >
          <Skeleton variant="text" width="40%" height={22} animation="wave" />
          <Skeleton variant="rounded" width={80} height={32} animation="wave" />
        </Box>
      </Box>
    </Box>
  );
};

export default VehicleCardSkeleton;
