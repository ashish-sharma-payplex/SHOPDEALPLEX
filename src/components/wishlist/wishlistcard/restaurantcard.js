"use client";

import React from "react";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Stack,
  Grid,
} from "@mui/material";

import StarIcon from "@mui/icons-material/Star";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import Link from "next/link";
import useStoreWishlistHandler from "components/home/search/pathflow/storewishlisthandler";

const GREEN_COLOR = "#2e7d32";

const formatRating = (rating) => {
  const num = Number(rating) || 0;
  const rounded = Math.round(num * 10) / 10;
  return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
};

const RestaurantCardItem = ({
  restaurant,
  isStoreWishlisted,
  addStoreToWishlist,
  removeStoreFromWishlist,
}) => {
  return (
    <Card
      sx={{
        width: "100%",
        borderRadius: "12px !important",
        boxShadow: 2,
        cursor: "pointer",
      }}
    >
      <Box sx={{ position: "relative" }}>
        <Link href={`/restaurant/${restaurant.id}`} scroll={true}>
          <CardMedia
            component="img"
            height="200"
            image={restaurant.image_full_url || restaurant.logo_full_url}
            alt={restaurant.name}
            sx={{ objectFit: "cover" }}
          />
        </Link>

        {/* Wishlist Icon */}
        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            cursor: "pointer",
            zIndex: 5,
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (isStoreWishlisted(restaurant)) {
              removeStoreFromWishlist(restaurant, e);
            } else {
              addStoreToWishlist(restaurant, e);
            }
          }}
        >
          {isStoreWishlisted(restaurant) ? (
            <FavoriteIcon sx={{ color: "#E53935" }} />
          ) : (
            <FavoriteBorderIcon sx={{ color: "#c4c2c2" }} />
          )}
        </Box>
      </Box>

      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography fontWeight="bold" noWrap>
            {restaurant.name}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#e8f5e9",
              color: GREEN_COLOR,
              borderRadius: 1,
              px: 1,
            }}
          >
            <StarIcon sx={{ fontSize: 14, mr: 0.3 }} />
            <Typography variant="body2">
              {formatRating(restaurant.avg_rating)}
            </Typography>
          </Box>
        </Stack>

        <Typography variant="body2" color="text.secondary" mt={0.5}>
          {restaurant.meta_description || "Delicious food awaits"}
        </Typography>

        <Grid container mt={1}>
          <Grid item xs={6}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <AccessTimeIcon sx={{ fontSize: 16 }} />
              <Typography variant="body2" ml={0.5}>
                {restaurant.delivery_time || "30 min"}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} textAlign="right">
            <Typography
              variant="body2"
              fontWeight="bold"
              color={GREEN_COLOR}
            >
              Starts at ₹{restaurant.minimum_order || 0}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default function RestaurantCard({ restaurants }) {
  const {
    addStoreToWishlist,
    removeStoreFromWishlist,
    isStoreWishlisted,
  } = useStoreWishlistHandler();

  if (!restaurants || restaurants.length === 0) {
    return <Typography>No Restaurants Found</Typography>;
  }

  return (
    <>
      {restaurants.map((restaurant) => (
        <RestaurantCardItem
          key={restaurant.id}
          restaurant={restaurant}
          isStoreWishlisted={isStoreWishlisted}
          addStoreToWishlist={addStoreToWishlist}
          removeStoreFromWishlist={removeStoreFromWishlist}
        />
      ))}
    </>
  );
}