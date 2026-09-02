import React from "react";
import { Box, Typography } from "@mui/material";

const BottomFooter = () => {
  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "#f4f4f4",
        height: "auto",
        padding: "10px 0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex:999,
        textAlign:"center",
      }}
    >
      <Typography variant="subtitle" sx={{ color: "black" }}>
        Copyright 2025 © DealPlex. Created by Payplex
      </Typography>
    </Box>
  );
};

export default BottomFooter;
