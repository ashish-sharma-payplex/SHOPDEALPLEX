// src/components/home/module-wise-components/rental/components/RentalBanner.jsx

import { useTheme } from "@emotion/react";
import { Box, Stack, Typography, useMediaQuery, Button, alpha } from "@mui/material";
import { t } from "i18next";
import React from "react";
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const RentalBanner = () => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box 
      // Full-Width Container (using the "breakout" technique)
      sx={{ 
        pt: { xs: 4, md: 8 }, 
        pb: { xs: 15, md: 0 },
        width: '100vw', 
        marginLeft: 'calc(-50vw + 50%)', 
        marginRight: 'calc(-50vw + 50%)', 
        backgroundColor:"#ffffff", 
      
      }}
    >
      <Stack 
        direction={{ xs: 'column', md: 'row' }}
        spacing={4}
        alignItems="center"
        justifyContent="space-between"
        sx={{ 
          // Inner content container, centered
          maxWidth: '1200px', 
          margin: '0 auto', 
          px: { xs: 2, md: 6, lg: 12 }, 
          width: '100%',
        }}
      >
        {/* --- Left Side: Text and Button (50% width from md up) --- */}
        <Stack
          spacing={2}
          sx={{ 
            // ⭐️ Changed width to 50% for md and up, 100% for xs
            width: { xs: '100%', md: '50%' }, 
            textAlign: { xs: 'center', md: 'left' } 
          }}
        >
          <Typography
            variant={isSmall ? "h4" : "h2"}
            component="h1"
            fontWeight="700"
            lineHeight="1.1"
            color={theme.palette.text.primary} 
          >
            <span style={{ color: theme.palette.warning.main }}>{t("Easy")}</span> {t("Rentals,")}
            <br />
            {t("Anywhere You Go.")}
          </Typography>

          <Stack direction="row" alignItems="center" spacing={1} sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}>
              <Typography variant="body1" fontWeight="500">{t("Find Perfect Car To Drive")}</Typography>
              <LocalTaxiIcon sx={{ color: theme.palette.text.primary }} />
          </Stack>

          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.secondary, maxWidth: '450px', margin: { xs: '0 auto', md: '0' } }}
          >
            {t("Want to book a car for camping, City riding or Airport? book the best cars from us to get best experience.")}
          </Typography>

          <Button
  variant="contained"
  endIcon={
    <ArrowForwardIcon 
      sx={{
        transform: 'translate(0, 0)', // Default position
        transition: 'transform 0.3s ease', // Smooth transition
        '&:hover': { transform: 'translate(4px, -4px)' } // Moves the icon to top-right
      }} 
    />
  }
  sx={{
    width: { xs: '100%', sm: 'fit-content' },
    mt: 3,
    fontSize: '1rem',
    padding: '10px 25px',
    borderRadius: '8px',
    backgroundColor: theme.palette.success.main,
    '&:hover': { backgroundColor: theme.palette.success.dark },
  }}
>
  {t("Browse all Categories")}
</Button>


        </Stack>

        {/* --- Right Side: Car Graphic/Image Placeholder (50% width from md up) --- */}
        <Box
          sx={{
            // ⭐️ Changed width to 50% for md and up, 100% for xs
            width: { xs: '100%', md: '50%' }, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: { xs: '200px', md: '500px' }, 
            backgroundColor: 'transparent',
          }}
        >
          <img 
              src={"/rentalBanner.png"}
              alt="Car Rental" 
              title="Car Rental"
              style={{ width: '100%', height: 'auto', objectFit: 'contain', maxWidth: '100%' }} 
          />
        </Box>
      </Stack>
    </Box>
  );
};

export default RentalBanner;