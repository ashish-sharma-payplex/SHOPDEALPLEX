// src\components\home\module-wise-components\food\foodUpdateComp\TopBannerFood.js
import React from "react";
import { Box, Grid, Typography, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Image from "next/image";
import GlobalSearchBox from "components/header/GlobalSearchBox";

const TopBannerLoader = () => {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        borderRadius:3,
        alignItems: "center",
        backgroundColor: "var(--food-bg-banner)", // Light background color for the section
        py: { xs: 4, md: 8 },
        height: "auto"
      }}
    >
      <Grid container spacing={2} alignItems="center" sx={{ maxWidth: 1200, width: "100%" }}>
        {/* Text Section */}
        <Grid item xs={12} md={6}>
          <Box sx={{ textAlign: "left", px: { xs: 2, md: 0 } }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "0.9rem", mb: 1, fontWeight: 500 }}
            >
              <strong>People Trust Us</strong>
            </Typography>

            <Typography
              variant="h4"
              sx={{ fontWeight: "bold", color: "var(--text-strong)", mb: 1 }}
            >
              Your <span style={{ color: "var(--brand-green)" }}>Favorite</span> Food
            </Typography>

            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", color: "var(--food-accent-orange)", mb: 2 }}
            >
              Just Minutes Away
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                lineHeight: 1.5,
                mb: 3,
                [`@media (max-width:600px)`]: {
                  lineHeight: 2,
                },
              }}
            >
              Thousands of dishes from top restaurants delivered hot to your door.
            </Typography>

        <GlobalSearchBox/>
          </Box>
        </Grid>

        {/* Image Section (hidden on mobile) */}
        <Grid item xs={12} md={6} sx={{ display: { xs: "none", md: "flex" }, justifyContent: "center" }}>
          <Image
            src="/foodtopbanner.png"
            alt="Food and Happy Customer"
            title="Food and Happy Customer"
            width={460}
            height={400}
            objectFit="cover"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default TopBannerLoader;
