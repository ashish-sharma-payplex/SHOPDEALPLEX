"use client";

import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Avatar,
  Button,
  Chip,
} from "@mui/material";
import { useRouter } from "next/router";

const ProviderCard = ({ provider }) => {
  const router = useRouter();

 const formatRating = (rating) => {
    const num = Number(rating) || 0;
    const rounded = Math.round(num * 10) / 10;
    return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
  };

  if (!provider) return null;

  const handleViewVehicles = () => {
    router.push(`/rental/provider-details/${provider?.id}`);
  };

  return (
    <Card
      sx={{
        borderRadius: "12px !important",
        overflow: "hidden",
        boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
        cursor: "pointer",
        transition: "0.25s",
        "&:hover": {
          transform: "translateY(-4px)",
        },
      }}
    >
      {/* COVER PHOTO */}
      <CardMedia
        component="img"
        height="170"
        image={provider?.cover_photo_full_url}
        alt={provider?.name}
      />

      <CardContent>
        {/* LOGO + STORE NAME */}
        <Box display="flex" alignItems="center" gap={2} mb={1}>
          <Avatar
            src={provider?.logo_full_url}
            alt={provider?.name}
            sx={{
              width: 50,
              height: 50,
              border: "2px solid #eee",
            }}
          />

          <Box>
            <Typography fontWeight={600}>
              {provider?.name}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {provider?.address}
            </Typography>
          </Box>
        </Box>

        {/* INFO ROW */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={1}
        >
          <Typography variant="body2">
             ⭐ {formatRating(provider?.avg_rating)} ({provider?.rating_count || 0})
          </Typography>

          <Typography variant="body2">
            ⏱ {provider?.delivery_time}
          </Typography>

          {provider?.open ? (
            <Chip label="Open" color="success" size="small" />
          ) : (
            <Chip label="Closed" color="error" size="small" />
          )}
        </Box>

        {/* BUTTON */}
        <Button
          fullWidth
          variant="outlined"
          onClick={handleViewVehicles}
          sx={{
            mt: 2,
            borderColor: "#14A44D",
            color: "#14A44D",
            fontWeight: 600,
            textTransform: "none",
            "&:hover": {
              borderColor: "#14A44D",
              backgroundColor: "rgba(20,164,77,0.08)",
            },
          }}
        >
          View Vehicles →
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProviderCard;