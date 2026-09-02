import React from "react";
import { Box, Skeleton, Stack } from "@mui/material";

const shimmer = {
  animation: "pulse 1.2s ease-in-out infinite",
};

const SectionSkeleton = ({ lines = 4 }) => (
  <Stack spacing={1}>
    <Skeleton width="35%" height={18} sx={shimmer} />
    {[...Array(lines)].map((_, i) => (
      <Skeleton key={i} height={16} sx={shimmer} />
    ))}
  </Stack>
);

const RentalFilterSkeleton = () => {
  return (
    <Stack spacing={4}>
      
      {/* PRICE RANGE */}
      <Box>
        <Skeleton width="35%" height={18} sx={shimmer} />
        <Skeleton height={18} sx={{ mt: 2 }} />
        <Stack direction="row" spacing={1} mt={2}>
          <Skeleton width="48%" height={32} sx={shimmer} />
          <Skeleton width="48%" height={32} sx={shimmer} />
        </Stack>
      </Box>

      {/* CATEGORIES */}
      <SectionSkeleton lines={5} />

      {/* BRANDS */}
      <SectionSkeleton lines={5} />

      {/* SEATS */}
      <SectionSkeleton lines={3} />

      {/* AC OPTIONS */}
      <SectionSkeleton lines={2} />

    </Stack>
  );
};

export default RentalFilterSkeleton;
