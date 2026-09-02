import React from 'react';
import { Box, Grid, Typography, Stack } from '@mui/material';
import { 
  Search as SearchIcon, 
  Edit as EditIcon, 
  SentimentSatisfiedAlt as EnjoyIcon, 
  ChevronRight as ArrowheadIcon 
} from '@mui/icons-material';

// STEP ICON (responsive logic)
const StepIconCircle = ({ children, isMobile, isTablet }) => (
  <Box
    sx={{
      width: isMobile ? 60 : isTablet ? 56 : 56,
      height: isMobile ? 60 : isTablet ? 56 : 56,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#e8f5e9",
      border: "1px solid #e8f5e9",
      p: 1,
      margin: "0 auto",
    }}
  >
    {React.cloneElement(children, {
      sx: { fontSize: isMobile ? 30 : isTablet ? 28 : 30, color: "#000000ff" },
    })}
  </Box>
);

// CONNECTOR (same logic as earlier)
const Connector = ({ isMobile }) => (
  <Box
    sx={{
      width: isMobile ? "100%" : 120,
      height: isMobile ? 60 : 50,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
      my: isMobile ? 1.5 : 0,   // 🔥 Added small extra spacing ONLY on mobile
    }}
  >
    <Box
      sx={{
        position: "absolute",
        top: isMobile ? "0px" : "50%",
        bottom: isMobile ? "0px" : "auto",
        left: isMobile ? "50%" : "-10px",
        right: isMobile ? "auto" : "18px",
        width: isMobile ? "0px" : "auto",
        height: isMobile ? "35px" : "auto",
        borderLeft: isMobile ? "3px dotted #bdbdbd" : "none",
        borderBottom: isMobile ? "none" : "3px dotted #bdbdbd",
        transform: isMobile ? "translateX(-50%)" : "translateY(-50%)",
      }}
    />

    <ArrowheadIcon
      sx={{
        position: "absolute",
        bottom: isMobile ? "0px" : "50%",
        right: isMobile ? "50%" : 0,
        transform: isMobile
          ? "translateX(50%) rotate(90deg)"
          : "translateY(50%) rotate(0deg)",
        fontSize: isMobile ? 24 : 18,
        color: "#bdbdbd",
      }}
    />
  </Box>
);

const RentARideSteps = () => {
  const steps = [
    { icon: <SearchIcon />, title: "Browse & Select", description: "Pick any vehicle you need" },
    { icon: <EditIcon />, title: "Book & Confirm", description: "Add details & secure your booking" },
    { icon: <EnjoyIcon />, title: "Enjoy the Ride", description: "Start driving without any hassle" },
  ];

  return (
    <Box
  sx={{
    width: "100%",
    textAlign: "center",
    pt: { xs: 0,md:0, sm: 6 },
    pb:{xs:0,md:0},   // 🔥 small top padding on mobile, normal on tablet+
    pb: 6,
  }}
>

      <Typography variant="body1" sx={{ fontWeight: 400, mb: 1, color: "#3c4043" }}>
        How It Works
      </Typography>

      <Typography variant="h5" sx={{ fontWeight: 600, mb: 5, color: "#4caf50" }}>
        Rent a Ride in 3 Easy Steps
      </Typography>

      {/* MOBILE VIEW (vertical steps with extra spacing) */}
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        spacing={0}
        sx={{ display: { xs: "flex", sm: "none" } }}
      >
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <Grid item xs={12}>
              <Stack alignItems="center" sx={{ mb: 3 }}> {/* 🔥 Added extra spacing AFTER each section */}
                <StepIconCircle isMobile>{step.icon}</StepIconCircle>

                <Typography sx={{ fontWeight: 600, mt: 2 }}>
                  {step.title}
                </Typography>
                <Typography sx={{ color: "#546e7a" }}>
                  {step.description}
                </Typography>
              </Stack>
            </Grid>

            {index < steps.length - 1 && <Connector isMobile />}
          </React.Fragment>
        ))}
      </Grid>

      {/* TABLET + ALL LAPTOP SIZES (always 1 row, no wrapping) */}
      <Grid
        container
        spacing={0}
        justifyContent="center"
        alignItems="center"
        sx={{
          display: { xs: "none", sm: "flex" },
          flexWrap: "nowrap",   // 🔥 forces tablet + laptop to keep the steps in one row
        }}
      >
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <Grid item>
             <Stack alignItems="center" sx={{ mx: 3 }}>
  <StepIconCircle isTablet>{step.icon}</StepIconCircle>

  <Typography sx={{ fontWeight: 600, mt: 2, fontSize: "1.1rem" }}>
    {step.title}
  </Typography>

  <Typography sx={{ color: "#546e7a", fontSize: "0.9rem" }}>
    {step.description}
  </Typography>
</Stack>

            </Grid>

            {index < steps.length - 1 && <Connector />}
          </React.Fragment>
        ))}
      </Grid>
    </Box>
  );
};

export default RentARideSteps;
