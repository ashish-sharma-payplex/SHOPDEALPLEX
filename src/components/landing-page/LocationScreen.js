import React from "react";
import { Box, Typography, Container } from "@mui/material";
import styles from "../../../src/styles/Grocery.module.css";

const LocationScreen = ({ title, subtext }) => {
  return (
    <Box
      className={styles.groceryThemeVars}
      sx={{
        minHeight: "50vh",
        backgroundColor: "var(--bg-page)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        transition: "background-color 0.2s ease, color 0.2s ease",
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            textAlign: "center",
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
                // dark mode mein image thoda aur mute/dim ho, taaki white bg pe bana icon
                // dark background pe zyada harsh na lage
                filter: "var(--grocery-image-filter, none)",
              }}
            />
          </Box>

          {/* Heading */}
          <Typography
            sx={{
              fontWeight: 600,
              mb: 1,
              fontSize: { xs: "18px", sm: "22px" },
              color: "var(--text-strong)",
            }}
          >
            {title}
          </Typography>

          {/* Subtext */}
          <Typography
            sx={{
              color: "var(--text-secondary)",
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