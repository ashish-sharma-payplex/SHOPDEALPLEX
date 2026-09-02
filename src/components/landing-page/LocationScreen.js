import React from "react";
import { Box, Typography, Container } from "@mui/material";

const LocationScreen = ({title,subtext}) => {
  return (
    <Box
      sx={{
        minHeight: "50vh",
        // backgroundColor: "#f5f5f5",
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
            // py: { xs: 6, sm: 8 },
          }}
        >
          {/* Image instead of icon */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 3,
            }}
          >
            <Box
              component="img"
              src="/locationSelect.png" 
              alt="location"
              sx={{
                width: { xs: 120, sm: 160 },
                height: "auto",
                opacity: 0.8,
              }}
            />
          </Box>

          {/* Heading */}
          <Typography
            sx={{
              fontWeight: 600,
              mb: 1,
              fontSize: { xs: "18px", sm: "22px" },
              color:"#000000"
            }}
          >
           {title}
          </Typography>

          {/* Subtext */}
          <Typography
            sx={{
              color: "text.secondary",
              fontSize: { xs: "14px", sm: "16px" },
            }}
          >
           {subtext}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LocationScreen;