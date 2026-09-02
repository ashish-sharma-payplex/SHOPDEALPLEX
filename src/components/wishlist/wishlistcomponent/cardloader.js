import React from "react";
import { Grid, Box, Typography } from "@mui/material";
import GroceryPharmacyCard from "../wishlistcard/groceryandpharmacycard";
import FoodCard from "../wishlistcard/foodcard";
import RestaurantCard from "../wishlistcard/restaurantcard";
import ProviderCard from "../wishlistcard/providercard";
import VehicleCard from "components/home/module-wise-components/rental/New-Rental-pages/Top-rating-Vehicles/VehiclesCard";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import useStoreWishlistHandler from "components/home/search/pathflow/storewishlisthandler";

// Skeleton Card
const SkeletonCard = () => (
  <Box
    sx={{
      width: "100%",
      height: 250,
      borderRadius: 2,
      p: 1,
      background: "#fff",
      border: "1px solid #E3E8EE",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    }}
  >
    <Box className="shimmer" sx={{ width: "100%", height: 120, borderRadius: "8px" }} />
    <Box className="shimmer" sx={{ height: 12, borderRadius: 1, mt: 1, width: "90%" }} />
    <Box className="shimmer" sx={{ height: 12, borderRadius: 1, mt: 0.5, width: "60%" }} />
    <Box className="shimmer" sx={{ height: 10, borderRadius: 1, mt: 1, width: "40%" }} />
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
      <Box className="shimmer" sx={{ height: 14, width: "40%", borderRadius: 1 }} />
      <Box className="shimmer" sx={{ height: 28, width: 60, borderRadius: "6px" }} />
    </Box>
  </Box>
);

// ✅ Dynamic Empty State
const getEmptyMessage = (activeCategory, selectedSubCategory) => {
  if (activeCategory === "Food" && selectedSubCategory === "restaurants")
    return "No Wishlist Restaurant Found";
  if (activeCategory === "Food")
    return "No Wishlist Dish Found";
  if (activeCategory === "Rental" && selectedSubCategory === "providers")
    return "No Wishlist Provider Found";
  if (activeCategory === "Rental")
    return "No Wishlist Vehicle Found";
  // Grocery / Pharmacy
  return "No Wishlist Products Found";
};

const EmptyState = ({ activeCategory, selectedSubCategory }) => {
  const message = getEmptyMessage(activeCategory, selectedSubCategory);

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 10,
        gap: 1.5,
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          backgroundColor: "#F3F4F6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FavoriteBorderIcon sx={{ fontSize: 36, color: "#9CA3AF" }} />
      </Box>
      <Typography fontWeight={600} sx={{ fontSize: "1rem", color: "#374151", mt: 1 }}>
        {message}
      </Typography>
      <Typography variant="body2" sx={{ fontSize: "0.85rem", color: "#9CA3AF", textAlign: "center" }}>
        You haven't added anything to your wishlist here yet.
      </Typography>
    </Box>
  );
};

const CardLoader = ({ activeCategory, selectedSubCategory, wishLists, isLoading }) => {
  const { isStoreWishlisted } = useStoreWishlistHandler();

  // ✅ Restaurant ke liye filtered list — sirf wahi jo abhi bhi redux wishlist me hai.
  // Isse remove hone par us restaurant ka Grid slot hi create nahi hoga.
  const visibleRestaurantWishlist =
    activeCategory === "Food" && selectedSubCategory === "restaurants"
      ? (wishLists || []).filter((item) => isStoreWishlisted(item))
      : wishLists;

  // ✅ Skeleton
  if (isLoading) {
    return (
      <Grid container spacing={1} sx={{ width: "100%", mt: 0.5 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Grid item xs={6} sm={4} md={3} lg={2} key={i}>
            <SkeletonCard />
          </Grid>
        ))}
      </Grid>
    );
  }

  // ✅ Empty state with dynamic message
  if (!wishLists || wishLists.length === 0) {
    return (
      <EmptyState
        activeCategory={activeCategory}
        selectedSubCategory={selectedSubCategory}
      />
    );
  }

  // ✅ Restaurant tab ke liye agar sab remove ho gaye ho to bhi EmptyState dikhao
  if (
    activeCategory === "Food" &&
    selectedSubCategory === "restaurants" &&
    visibleRestaurantWishlist.length === 0
  ) {
    return (
      <EmptyState
        activeCategory={activeCategory}
        selectedSubCategory={selectedSubCategory}
      />
    );
  }

  // ✅ Cards
  return (
    <Grid container spacing={1} sx={{ width: "100%", mt: 0.5 }}>

      {(activeCategory === "Grocery" || activeCategory === "Pharmacy") &&
        wishLists.map((item) => (
          <Grid item xs={6} sm={4} md={3} lg={2} key={item.id}>
            <GroceryPharmacyCard products={[item]} />
          </Grid>
        ))}

      {activeCategory === "Food" && selectedSubCategory === "items" &&
        wishLists.map((item) => (
          <Grid item xs={12} sm={6} md={2.4} lg={2} key={item.id}>
            <FoodCard products={[item]} />
          </Grid>
        ))}

      {activeCategory === "Food" && selectedSubCategory === "restaurants" &&
        visibleRestaurantWishlist.map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
            <RestaurantCard restaurants={[item]} />
          </Grid>
        ))}

      {activeCategory === "Rental" && selectedSubCategory === "vehicles" &&
        wishLists.map((item) => (
          <Grid item xs={6} sm={6} md={4} key={item.id}>
            <VehicleCard data={item} vehicle={item} />
          </Grid>
        ))}

      {activeCategory === "Rental" && selectedSubCategory === "providers" &&
        wishLists.map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
            <ProviderCard provider={item} />
          </Grid>
        ))}

    </Grid>
  );
};

export default CardLoader;