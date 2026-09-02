import { alpha, Stack, Typography, Grid, Box } from "@mui/material";
import CustomImageContainer from "components/CustomImageContainer";
import { getAmountWithSign } from "helper-functions/CardHelpers";
import React, { useState } from "react";
import { CustomBoxFullWidth } from "styled-components/CustomStyles.style";
import RentalCarVehicleRating from "./RentalCarVehicleRating"; 
import { useTheme } from "@emotion/react"; // Import useTheme to get theme spacing if needed

const RentalCarDetailsBannerImg = ({
  cover_photo_url,
  bannerData,
  bannerLoading,
  data,
  providerData, 
  configData,
  isLoading
}) => {
  const theme = useTheme(); // Use theme to reference spacing
  
  // Combine cover photo and banner data for all images
  const allImages = bannerData
    ? [
        { image_full_url: cover_photo_url }, 
        ...bannerData,
      ]
    : [
        { image_full_url: cover_photo_url },
      ];

  const [mainImageIndex, setMainImageIndex] = useState(0);
  const mainImageUrl = allImages[mainImageIndex]?.image_full_url || cover_photo_url;

  const handleBannerClick = (link) => {
    if (link) {
      window.open(link, "_blank");
    }
  };

  // --- Styling for Full Width Banner ---
  const fullWidthBannerStyle = {
    px: { xs: 0, sm: 0 }, // Remove inner padding on the main Grid container
    mx: { xs: `-${theme.spacing(2)}`, md: 0 }, // Negative margins to counteract padding
    width: "100%", // Ensure it takes full width
  };

  return (
    <CustomBoxFullWidth>
      {/* 1. TOP SECTION: Provider Details (Retaining margin-bottom and full 12-grid inside its container) */}
      <RentalCarVehicleRating 
          data={providerData} 
          configData={configData} 
          isLoading={isLoading} 
          sx={{ mb: 2 }} 
      />
      
      {/* 2. MAIN IMAGE SECTION */}
      {/* *** APPLIED FULL-WIDTH STYLING HERE *** */}
      <Grid container spacing={1} sx={fullWidthBannerStyle}>
        
        {/* LEFT: Main Large Image */}
        <Grid item xs={12}>
          <CustomBoxFullWidth
            sx={{
              borderRadius: "10px",
              height: { xs: "200px", sm: "265px", md: "380px" },
              position: "relative",
              overflow: "hidden",
              width: "100%", // Ensure it takes full width
            }}
          >
            {mainImageUrl ? (
              <CustomImageContainer
                src={mainImageUrl}
                width="100%"
                height="100%"
                borderRadius="10px"
                objectFit="cover"
                onClick={
                    allImages[mainImageIndex]?.link
                    ? () => handleBannerClick(allImages[mainImageIndex]?.link)
                    : undefined
                }
                sx={{
                    cursor: allImages[mainImageIndex]?.link ? "pointer" : "default",
                }}
              />
            ) : (
                <Box sx={{ width: "100%", height: "100%", backgroundColor: (theme) => theme.palette.grey[200], borderRadius: "10px" }} />
            )}

            {/* Discount Banner (if applicable) */}
            {data?.discount ? (
              <Stack
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: (theme) =>
                    alpha(theme.palette.primary.main, 0.7),
                  color: (theme) => theme.palette.neutral[100],
                  padding: "10px",
                  borderRadius: "0 0 10px 10px",
                }}
              >
                <Typography fontSize="13px" fontWeight="600" textAlign="center">
                  {`${data?.discount?.discount}% discount will be applicable when booking amount is more than ${getAmountWithSign(
                    data?.discount?.min_purchase
                  )} max ${getAmountWithSign(
                    data?.discount?.max_discount
                  )} discount is applicable.`}
                </Typography>
              </Stack>
            ) : null}
          </CustomBoxFullWidth>
        </Grid>

      </Grid>
    </CustomBoxFullWidth>
  );
};

export default RentalCarDetailsBannerImg;