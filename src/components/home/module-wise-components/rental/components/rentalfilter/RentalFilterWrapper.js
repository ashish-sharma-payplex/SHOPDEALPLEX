// RentalFilterWrapper.jsx

import { Box, Typography } from "@mui/material";

const RentalFilterWrapper = ({ title, content }) => {
  return (
    <Box
      sx={{
        mb: "22px", // ✅ SPACING UNDER EACH SECTION
      }}
    >
      <Typography
        sx={{
          fontSize: "14px",
          fontWeight: 600,
          mb: "8px",
          color: "text.primary",
        }}
      >
        {title}
      </Typography>

      {content}
    </Box>
  );
};

export default RentalFilterWrapper;
