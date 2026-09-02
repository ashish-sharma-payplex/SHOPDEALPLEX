import React from "react";
import { Box, Typography, Button, Card } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const ThankYouCard = ({ onGoHome }) => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #e0f7ef 0%, #f9fafb 100%)",
        p: 3,
      }}
    >
      <Card
        elevation={0}
        sx={{
          p: 5,
          borderRadius: 4,
          border: "1px solid #e0e0e0",
          textAlign: "center",
          maxWidth: 480,
          width: "100%",
        }}
      >
        <CheckCircleOutlineIcon sx={{ fontSize: 80, color: "#1f8f4a", mb: 2 }} />

        <Typography fontWeight={700} fontSize={26} mb={1}>
          Booking Confirmed! 🎉
        </Typography>

        <Typography color="text.secondary" fontSize={15} mb={3}>
          Thank you for choosing us. Your parcel has been booked successfully.
          Stay connected — our team will reach out to you shortly!
        </Typography>

        <Box
          sx={{
            backgroundColor: "#f0faf5",
            borderRadius: 2,
            p: 2,
            mb: 3,
          }}
        >
          <Typography fontSize={13} color="text.secondary">
            Expected pickup within
          </Typography>
          <Typography fontWeight={700} fontSize={20} color="#1f8f4a">
            30 – 60 minutes
          </Typography>
        </Box>

        <Button
          fullWidth
          onClick={onGoHome}
          sx={{
            backgroundColor: "#1f8f4a",
            color: "#fff",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "16px",
            borderRadius: "10px",
            height: "48px",
            "&:hover": { backgroundColor: "#187a3e" },
          }}
        >
          Go to Home
        </Button>
      </Card>
    </Box>
  );
};

export default ThankYouCard;