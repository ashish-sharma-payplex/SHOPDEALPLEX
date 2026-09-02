import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { Box, Typography, Divider, Button } from "@mui/material";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";

const DeliveryUnavailable = ({ orderId = "108960", amount = 400 }) => {
    const router = useRouter();

  useEffect(() => {           
    window.scrollTo(0, 0);
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
        padding: "2rem 1rem",
      }}
    >
      <Box
        sx={{
          background: "#fff",
          borderRadius: "16px",
          border: "1px solid #f0f0f0",
          padding: "2rem 1.5rem",
          width: "100%",
          maxWidth: "320px",
        }}
      >
        {/* Icon */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "#FAECE7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 1,
            }}
          >
            <SentimentDissatisfiedIcon sx={{ fontSize: 36, color: "#D85A30" }} />
          </Box>
          <Typography
            sx={{
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "2px",
              color: "#D85A30",
              textTransform: "uppercase",
            }}
          >
            Sorry
          </Typography>
        </Box>

        {/* Message */}
        <Box sx={{ textAlign: "center", mb: 2.5 }}>
          <Typography sx={{ fontSize: "16px", fontWeight: 600, fontFamily: "Inter", color: "#1a1a1a", mb: 0.5 }}>
            Delivery not available
          </Typography>
          <Typography sx={{ fontSize: "13px", color: "#888", lineHeight: 1.6, fontFamily: "Inter" }}>
            We currently don't deliver to your area.
            <br />
            We're expanding soon!
          </Typography>
        </Box>

        {/* Button */}
        <Button
          fullWidth
          onClick={() => router.push("/home?module=parcel")}
          sx={{
            border: "1.5px solid #E24B4A",
            borderRadius: "10px",
            color: "#E24B4A",
            background: "transparent",
            fontSize: "15px",
            fontWeight: 500,
            padding: "12px",
            textTransform: "none",
            "&:hover": {
              background: "#fff5f5",
            },
          }}
        >
          Back to Home
        </Button>
      </Box>
    </Box>
  );
};

export default DeliveryUnavailable;