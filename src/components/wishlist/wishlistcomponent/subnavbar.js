import React, { useEffect } from "react";
import { Button, Box, Typography } from "@mui/material";
import { useWishlistSelector } from "api-manage/hooks/usegetwishlistselector";
import { useGetWishList } from "api-manage/hooks/react-query/rental-wishlist/useGetWishlist";
import { useWishListGet } from "api-manage/hooks/react-query/wish-list/useWishListGet";

const Variables = {
  StrokeD: "#E3E8EE",
  selectedColor: "#EAFFF3",
  borderColor: "#1A914B",
};

const Navbar = ({ activeCategory, setActiveCategory, selectedTab, setSelectedTab }) => {
  const showFoodSubNavbar = activeCategory === "Food";
  const showRentalSubNavbar = activeCategory === "Rental";

  const handleCategoryClick = (category) => {
    // console.log("Clicked Category:", category);
    setActiveCategory(category);






    // Reset sub-tab if main category is not Food or Rental
    if (category === "Food") {
      setSelectedTab("items");  // Default to "items" for Food
    } else if (category === "Rental") {
      setSelectedTab("vehicles");  // Default to "vehicles" for Rental
    } else {
      setSelectedTab("items");
    }
  };




const { normalWishlist, rentalWishlist, combinedWishlist } =
  useWishlistSelector();

useEffect(() => {
  // console.log("Normal Wishlist :", normalWishlist);
  // console.log("Rental Wishlist :", rentalWishlist);
  // console.log("Combined Wishlist :", combinedWishlist);
}, [normalWishlist, rentalWishlist, combinedWishlist]);

  useEffect(() => {
    // console.log("Active Category:", activeCategory);
    // console.log("Selected Tab:", selectedTab);
  }, [activeCategory, selectedTab]);

  return (
    <Box display="flex" flexDirection="column" width="100%" padding={2}>
      {/* Main Navbar */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
          My Wishlist
        </Typography>

        <Box display="flex" gap={2}>
          {["Grocery", "Pharmacy", "Food", "Rental"].map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "contained" : "outlined"}
              onClick={() => handleCategoryClick(category)}
              sx={{
                padding: "8px 0px",
             
                border: `1px solid ${
                  activeCategory === category
                    ? Variables.borderColor
                    : Variables.StrokeD
                }`,
                color: activeCategory === category ? "#1A914B" : "black",
                backgroundColor:
                  activeCategory === category
                    ? Variables.selectedColor
                    : "transparent",
                borderRadius: "8px",
                width: "109px",
                height: "40px",
                "&:hover": {
                  backgroundColor:
                    activeCategory === category
                      ? Variables.selectedColor
                      : "#EAFFF3",
                },
              }}
            >
              {category}
            </Button>
          ))}
        </Box>
      </Box>

    {/* Sub Navbar for Food */}
{showFoodSubNavbar && (
  <Box display="flex" gap={2} mt={2}>
    {["items", "restaurants"].map((tab) => {
      const isActive = selectedTab === tab;

      return (
        <Button
          key={tab}
          variant={isActive ? "contained" : "outlined"}
          onClick={() => {
            // console.log(`Selected SubTab: ${tab}`);
            setSelectedTab(tab);
          }}
          sx={{
            padding: "8px 16px",
            borderRadius: "8px",
            width: "109px",
            height: "40px",
            border: `1px solid ${isActive ? Variables.borderColor : Variables.StrokeD}`,
            color: isActive ? "#1A914B" : "black",
            backgroundColor: isActive ? Variables.selectedColor : "transparent",
            textTransform: "none",
            "&:hover": {
              backgroundColor: isActive ? Variables.selectedColor : "#EAFFF3",
            },
          }}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)} {/* Capitalize first letter */}
        </Button>
      );
    })}
  </Box>
)}

{/* Sub Navbar for Rental */}
{showRentalSubNavbar && (
  <Box display="flex" gap={2} mt={2}>
    {["vehicles", "providers"].map((tab) => {
      const isActive = selectedTab === tab;

      return (
        <Button
          key={tab}
          variant={isActive ? "contained" : "outlined"}
          onClick={() => {
            // console.log(`Selected SubTab: ${tab}`);
            setSelectedTab(tab);
          }}
          sx={{
            padding: "8px 16px",
            borderRadius: "8px",
            width: "109px",
            height: "40px",
            border: `1px solid ${isActive ? Variables.borderColor : Variables.StrokeD}`,
            color: isActive ? "#1A914B" : "black",
            backgroundColor: isActive ? Variables.selectedColor : "transparent",
            textTransform: "none",
            "&:hover": {
              backgroundColor: isActive ? Variables.selectedColor : "#EAFFF3",
            },
          }}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </Button>
      );
    })}
  </Box>
)}
    </Box>
  );
};

export default Navbar;