import React from "react";
import { Box, Card, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

const DeliveryAssignedSection = ({data} ) => {
  const driver = data?.driver_details;
  const vehicle = data?.vehicle_details;
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f8fafd",
        p: 2,
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 450,
          borderRadius: "24px",
          textAlign: "center",
          p: 4,
          background: "#fff",
          border: "1px solid #eef2f6",
        }}
      >
        {/* Success Circle Section */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 5 }}>
          <Box
            sx={{
              width: 160,
              height: 160,
              borderRadius: "50%",
              bgcolor: "#edf7f1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: 110,
                height: 110,
                borderRadius: "50%",
                bgcolor: "#d7efe0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  width: 75,
                  height: 75,
                  borderRadius: "50%",
                  bgcolor: "#71c890",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                }}
              >
                <CheckIcon
                  sx={{ fontSize: 40, stroke: "#fff", strokeWidth: 2 }}
                />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Heading & Subtext */}
        <Typography
          variant="h5"
          fontWeight={800}
          sx={{ color: "#0a1f44", mb: 1 }}
        >
          Delivery partner assigned
        </Typography>
        <Typography sx={{ color: "#7e8ba0", fontSize: "1rem", mb: 4 }}>
          Your delivery partner is on the way to pick up your parcel.
        </Typography>

        {/* --- EXACT PARTNER CARD AREA START --- */}
        {/* --- CENTERED PARTNER CARD AREA --- */}
        {/* --- CENTERED CONTENT PARTNER CARD (IMAGE SIDE-BY-SIDE) --- */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center", // Vertical center (Image aur text ek line mein)
            justifyContent: "center", // Horizontal center (Pura group card ke beech mein)
            p: "20px 24px",
            borderRadius: "20px",
            border: "1px solid #eef2f6",
            bgcolor: (theme) => theme.palette.background.paper,
            mb: 4,
            gap: 3, // Image aur text ke beech ka gap
          }}
        >
          {/* Scooter Image - Side mein hi hai */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <img
              src="/parcelScooter.png"
              alt="scooter"
              style={{
                width: "60px",
                height: "auto",
                objectFit: "contain",
              }}
            />
          </Box>

          {/* Texts - Centered alignment inside the flex block */}
          <Box sx={{ textAlign: "left" }}>
            <Typography
              sx={{
                color: "#7e8ba0",
                fontSize: "1rem",
                fontWeight: 500,
                lineHeight: 1.2,
              }}
            >
                   {vehicle?.vehicle_type} • {driver?.driver_name}

            </Typography>
            <Typography
              sx={{
                color: "#1d443a",
                fontWeight: 700,
                fontSize: "1.3rem",
                mt: 0.5,
              }}
            >
               {vehicle?.vehicle_no}
            </Typography>
          </Box>
        </Box>
        {/* --- END --- */}
        {/* --- END --- */}
        {/* --- EXACT PARTNER CARD AREA END --- */}

        <Typography sx={{ color: "#9aa6b8", fontSize: "0.95rem" }}>
          Taking you to live tracking...
        </Typography>
      </Card>
    </Box>
  );
};

export default DeliveryAssignedSection;
