import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import {
  ShoppingCart,
  Upload,
  CheckCircle,
  DeliveryDining,
  ChevronRight as ArrowIcon,
} from "@mui/icons-material";

// STEP ITEM
const Step = ({ icon, label, isMobile, isTablet, isLaptop }) => (
  <Box sx={{ textAlign: "center" }}>
    <Box
      sx={{
        width: isMobile ? 60 : isTablet || isLaptop ? 56 : 56, // Adjust size for mobile/tablet/laptop
        height: isMobile ? 60 : isTablet || isLaptop ? 56 : 56, // Adjust size for mobile/tablet/laptop
        backgroundColor: "#E2F2EB",
        borderRadius: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: "0 auto",
      }}
    >
      {React.cloneElement(icon, {
        sx: { fontSize: isMobile ? 30 : isTablet || isLaptop ? 28 : 30, color: "#292D32" }, // Adjust icon size for mobile/tablet/laptop
      })}
    </Box>

    <Typography
      sx={{
        mt: 1.2,
        fontSize: isMobile ? "18px" : isTablet || isLaptop ? "16px" : "16px", // Adjust text size for mobile/tablet/laptop
        color: "#1B1B1B",
        maxWidth: "160px",
        margin: "6px auto",
        lineHeight: 1.3,
        fontWeight: 500,
        textAlign: "center",
        fontFamily: "Inter",
      }}
    >
      {label}
    </Typography>
  </Box>
);

// CONNECTOR (responsive)
const Connector = ({ isMobile, isTablet, isLaptop }) => (
  <Box
    sx={{
      width: isMobile ? "100%" : 120,
      height: isMobile ? 60 : 50, // Adjusted height for mobile/tablet/laptop
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
      my: isMobile ? 0 : 0, // Remove additional space between steps for mobile
    }}
  >
    {/* vertical dotted line for mobile/tablet/laptop */}
    <Box
      sx={{
        position: "absolute",
        top: isMobile ? "0px" : "50%",
        bottom: isMobile ? "0px" : "auto", // Remove space between dotted line and arrow for mobile
        left: isMobile ? "50%" : "-10px",
        right: isMobile ? "auto" : "18px",
        width: isMobile ? "0px" : "auto",
        height: isMobile ? "35px" : "auto", // Adjusted for mobile/tablet/laptop
        borderLeft: isMobile ? "3px dotted #9E9E9E" : "none", // Increased dot size
        borderBottom: isMobile ? "none" : "3px dotted #9E9E9E", // Increased dot size
        transform: isMobile ? "translateX(-50%)" : "translateY(-50%)",
      }}
    />

    {/* arrow icon */}
    <ArrowIcon
      sx={{
        position: "absolute",
        bottom: isMobile ? "0px" : "50%", // Remove space between dotted line and arrow for mobile
        right: isMobile ? "50%" : 0,
        transform: isMobile
          ? "translateX(50%) rotate(90deg)" // down arrow on mobile
          : "translateY(50%) rotate(0deg)", // right arrow on desktop/tablet/laptop
        fontSize: isMobile ? 24 : isTablet || isLaptop ? 18 : 14, // Adjusted font size for mobile/tablet/laptop
        color: "#9E9E9E",
      }}
    />
  </Box>
);

const Steps = () => {
  return (
    <Box sx={{ width: "100%", px: 2, py: 4 }}>
      <Grid container justifyContent="center" spacing={2}>
        <Grid
          item
          xs={12}
          sx={{
            display: { xs: "flex", sm: "none" },
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* ------ MOBILE VIEW (vertical) ------ */}
          <Step icon={<ShoppingCart />} label="Add medicine to cart" isMobile />
          <Connector isMobile />

          <Step
            icon={<Upload />}
            label="Upload Prescription at checkout"
            isMobile
          />
          <Connector isMobile />

          <Step
            icon={<CheckCircle />}
            label="Reviewed by Our Expert"
            isMobile
          />
          <Connector isMobile />

          <Step
            icon={<DeliveryDining />}
            label="Get Medicines Delivered"
            isMobile
          />
        </Grid>

        {/* ------ TABLET/LAPTOP VIEW (horizontal) ------ */}
        <Grid
          item
          xs={12}
          sx={{
            display: { xs: "none", sm: "flex" },
            justifyContent: "center",
            alignItems: "center",
            columnGap: 4,
            flexWrap: "nowrap", // Ensures the steps remain in one line without wrapping
          }}
        >
          <Step icon={<ShoppingCart />} label="Add medicine to cart" isTablet />
          <Connector isTablet />

          <Step icon={<Upload />} label="Upload Prescription at checkout" isTablet />
          <Connector isTablet />

          <Step icon={<CheckCircle />} label="Reviewed by Our Expert" isTablet />
          <Connector isTablet />

          <Step
            icon={<DeliveryDining />}
            label="Get Medicines Delivered"
            isTablet
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Steps;
