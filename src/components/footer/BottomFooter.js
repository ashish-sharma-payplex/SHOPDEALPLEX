import React from "react";
import { Box, Typography } from "@mui/material";

const BottomFooter = () => {
  return (
    <Box
      className="footer-strip"
      sx={{
        width: "100%",
        height: "auto",
        padding: "10px 0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
        textAlign: "center",
      }}
    >
      <Typography variant="subtitle" className="footer-text">
        Copyright 2025 © DealPlex. Created by Payplex
      </Typography>
    </Box>
  );
};

export default BottomFooter;
