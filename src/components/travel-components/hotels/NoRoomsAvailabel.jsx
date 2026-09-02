// NoRoomsAvailable.jsx
// React + MUI Responsive UI

import React from "react";
import {
  Box,
  Typography,
  Container,
} from "@mui/material";

const NoRoomsAvailable = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        // bgcolor: "#f7f7f7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* IMAGE */}
          <Box
            component="img"
            src="/noroomfound.svg" // image inside public folder
            alt="No rooms available"
            sx={{
              width: {
                xs: 180,
                sm: 240,
                md: 520,
              },
              maxWidth: "100%",
              objectFit: "contain",
              mb: 4,
            }}
          />

          {/* TITLE */}
          <Typography
            sx={{
              fontSize: {
                xs: "22px",
                sm: "26px",
                md: "30px",
              },
              fontWeight: 600,
              color: "#222",
              mb: 1,
            }}
          >
            Uh-oh, no rooms available
          </Typography>

          {/* SUBTITLE */}
          <Typography
            sx={{
              fontSize: {
                xs: "14px",
                sm: "15px",
                md: "16px",
              },
              color: "#8a8a8a",
              maxWidth: "420px",
              lineHeight: 1.6,
            }}
          >
            Please modify your travel dates or explore other available
            properties
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default NoRoomsAvailable;