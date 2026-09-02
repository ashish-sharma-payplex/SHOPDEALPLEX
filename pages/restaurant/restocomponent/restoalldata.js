import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Box,
  Button,
  InputBase,
} from "@mui/material";
import { FavoriteBorder, Star, AccessTime } from "@mui/icons-material";
import { useRouter } from "next/router";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";

import useStoreWishlistHandler from "../../../src/components/home/search/pathflow/storewishlisthandler";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useTranslation } from 'react-i18next';

export default function RestaurantsGrid() {

  const { t } = useTranslation();
  const { addStoreToWishlist, removeStoreFromWishlist, isStoreWishlisted } = useStoreWishlistHandler(t);

  const router = useRouter();
  const [stores, setStores] = useState([]);
  const [originalStores, setOriginalStores] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const { filter = "all" } = router.query;
  const [searchQuery, setSearchQuery] = useState("");

  // API CALL — ALL RESTAURANTS
  const fetchAllStores = async () => {
    try {
      const response = await fetch(
        "https://dealplex.in/api/v1/stores/get-stores/all",
        {
          method: "GET",
          headers: { moduleId: "5", zoneId: "[15,17]" },
        }
      );

      const data = await response.json();
      setStores(data?.stores || data || []);
      setOriginalStores(data?.stores || data || []);
      setActiveFilter("all");
    } catch (error) {
      // console.log("Fetch error:", error);
    }
  };

  // API CALL — TOP RATED
  const fetchTopRatedStores = async () => {
    try {
      const response = await fetch(
        "https://dealplex.in/api/v1/stores/top-rated",
        {
          method: "GET",
          headers: { moduleId: "5", zoneId: "[15,17]" },
        }
      );

      const data = await response.json();
      setStores(data?.stores || data || []);
      setActiveFilter("top");
    } catch (error) {
      // console.log("Top Rated Fetch Error:", error);
    }
  };

  useEffect(() => {
    fetchAllStores();
  }, []);

  // Function to filter stores based on search query
  const filterStores = (query) => {
    if (!query) {
      setStores(originalStores);
      return;
    }

    // Split the query into words
    const queryWords = query.toLowerCase().split(" "); // Split query by spaces (word by word)
    
    // Filter stores based on any match with the name or description
    const filteredStores = originalStores.filter((store) => {
      const storeName = store.name.toLowerCase();
      const storeDescription = store.meta_description?.toLowerCase() || "";

      // Check if any word in the query matches the store name or description
      return queryWords.some((word) => 
        storeName.includes(word) || storeDescription.includes(word)
      );
    });

    setStores(filteredStores);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    filterStores(query); // Filter stores based on search input
  };

  // FILTERS
  const handleNewlyJoined = () => {
    const filtered = originalStores.filter((store) => {
      const created = new Date(store.created_at);
      const cutoff = new Date("2025-11-14");
      return created >= cutoff;
    });
    setStores(filtered);
    setActiveFilter("new");
  };

  const handleVeg = () => {
    const filtered = originalStores.filter(
      (store) => store.veg === 1 && store.non_veg === 0
    );
    setStores(filtered);
    setActiveFilter("veg");
  };

  const handleNonVeg = () => {
    const filtered = originalStores.filter(
      (store) => store.veg === 1 && store.non_veg === 1
    );
    setStores(filtered);
    setActiveFilter("nonveg");
  };

  const limitedStores = stores.slice(0, 9);

  return (
    <CustomStackFullWidth sx={{ width: "100%" }}>
      <Box
        sx={{
          width: "1200px",
          mx: "auto",
          mb: { xs: 2, sm: 3, md: 4 },
          px:"40px"
        }}
      >
        {/* HERO SECTION */}
        <Box
          sx={{
            position: "relative",
            minHeight: { xs: "auto", md: "500px" },
            bgcolor: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            overflow: "hidden",
            py: { xs: 4, md: 0 },
          }}
        >
          {/* 🍊 ORANGE */}
          <Box
            component="img"
            src="/icons/Orange.svg"
            alt="orange"
            sx={{
              position: "absolute",
              top: { xs: 20, md: 60 },
              left: { xs: -20, md: 40 },
              width: "144px",
              height: "auto",
            }}
          />

          {/* 🍔 BURGER */}
          <Box
            component="img"
            src="/icons/burger-shape-2.png.svg"
            alt="burger"
            sx={{
              position: "absolute",
              top: { xs: 100, md: 120 },
              right: { xs: -20, md: 80 },
              width: "83.94px",
              height: "86.67px",
            }}
          />

          {/* 🍟 FRY */}
          <Box
            component="img"
            src="/icons/h3_vector6.png.svg"
            alt="fry"
            sx={{
              position: "absolute",
              bottom: { xs: 20, md: 60 },
              left: { xs: 10, md: 120 },
              width: "122.13px",
              height: "121.29px",
            }}
          />

          {/* 🔺 VECTOR */}
          <Box
            component="img"
            src="/icons/fry-shape.png.svg"
            alt="vector"
            sx={{
              position: "absolute",
              bottom: { xs: 40, md: 80 },
              right: { xs: 20, md: 160 },
              width: "149.53px",
              height: "108.8px",
            }}
          />

          {/* EXISTING CONTENT */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{
              width: "141px",
              height: "28px",
              bgcolor: "#9ce7ba",
              borderRadius: "100px",
              mb: "24px",
            }}
          >
            <Box component="img" src="/icons/heart.svg" alt="heart" sx={{ width: 16 }} />
            <Typography sx={{ fontSize: 14, ml: 0.5 }}>
              People Trust us
            </Typography>
          </Box>

          {/* Heading */}
          <Typography
            sx={{
              fontSize: { xs: "32px", sm: "48px", md: "60px" },
              fontWeight: 700,
              color: "#0B3D20",
              mb: "16px",
            }}
          >
            Explore Top <br />
            <Box component="span" sx={{ color: "#F4B400" }} >
              Restaurants Near You
            </Box>
          </Typography>

          {/* Subtitle */}
          <Typography
            sx={{
              fontSize: { xs: "16px", sm: "20px", md: "24px" },
              opacity: 0.8,
              mb: "24px",
            }}
          >
            From pizza to sushi, burgers to biryani – order your favorite meals
            <br />
            from <Box component="span" sx={{ fontWeight: 600, color: "#1A914B" }} >
              top-rated restaurants
            </Box> with fast delivery
          </Typography>

          {/* SEARCH BAR */}
          <Box
            sx={{
              width: { xs: "100%", sm: "471px" },
              height: "54px",
              border: "0.5px solid #191919",
              borderRadius: "100px",
              bgcolor: "#fff",
              display: "flex",
              alignItems: "center",
            }}
          >
            <InputBase
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search Restaurant"
              sx={{
                flex: 1,
                height: "100%",
                px: "16px",
                fontFamily: "Inter",
                fontSize: "14px",
              }}
              startAdornment={
                <Box
                  component="img"
                  src="/icons/bx_bx-search (black).svg"
                  alt="search"
                  sx={{ width: "18px", mr: "8px" }}
                />
              }
            />

            <Box
              sx={{
                width: "42px",
                height: "42px",
                bgcolor: "#1A914B",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                marginRight: "8px",
              }}
            >
              <Box
                component="img"
                src="/icons/bx_bx-search.svg"
                alt="search"
                sx={{ width: "20px", height: "20px" }}
              />
            </Box>
          </Box>
        </Box>

        {/* FILTER & HEADER */}
        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          mb={3}
          mt={4}
          gap={2}
        >
          <Box>
            <Typography variant="h5" fontWeight={700} mb={1}>
              Top Restaurant
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stores.length} Restaurants near you
            </Typography>
          </Box>

          {/* FILTER BUTTONS */}
          <Box display="flex" flexWrap="wrap" gap={1}>
            <Button
              variant={activeFilter === "all" ? "contained" : "outlined"}
              onClick={fetchAllStores}
              sx={activeFilter === "all" ? activeBtnStyle : btnStyle}
            >
              All
            </Button>

            <Button
              variant={activeFilter === "new" ? "contained" : "outlined"}
              onClick={handleNewlyJoined}
              sx={activeFilter === "new" ? activeBtnStyle : btnStyle}
            >
              Newly Joined
            </Button>

            <Button
              variant={activeFilter === "veg" ? "contained" : "outlined"}
              onClick={handleVeg}
              sx={activeFilter === "veg" ? activeBtnStyle : btnStyle}
            >
              Veg
            </Button>

            <Button
              variant={activeFilter === "nonveg" ? "contained" : "outlined"}
              onClick={handleNonVeg}
              sx={activeFilter === "nonveg" ? activeBtnStyle : btnStyle}
            >
              Non-Veg
            </Button>

            <Button
              variant={activeFilter === "top" ? "contained" : "outlined"}
              onClick={fetchTopRatedStores}
              sx={activeFilter === "top" ? activeBtnStyle : btnStyle}
            >
              Top Rated
            </Button>
          </Box>
        </Box>

        {/* RESTAURANT CARDS */}
        <Grid container spacing={3} sx={{ justifyContent: "center" }}>
          {limitedStores.map((res) => (
            <Grid item xs={12} sm={6} md={4} key={res.id}>
              <Card
                sx={{
                  borderRadius: "12px !important",
                  border: "1px solid #e0e0e0",
                  height: 330,  // Fixed height to prevent shrinking
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  boxShadow: "none",
                }}
              >
                <Box
                  position="relative"
                  sx={{ cursor: "pointer" }}
                  onClick={() =>
                    router.push(
                      `/restaurant/${res.id}?from=viewall&filter=${activeFilter}`
                    )
                  }
                >
                  <CardMedia
                    component="img"
                    height={res.cover_photo_full_url ? 220 : 180}
                    image={res.cover_photo_full_url || res.logo_full_url}
                    alt={res.name}
                    title={res.name}
                    style={{ objectFit: "cover" }}
                  />
                  
                  {/* Wishlist Icon */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      width: 35,
                      height: 35,
                      borderRadius: "12px",
                      // backgroundColor: "rgba(255,255,255,0.95)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      // border:"1px solid #E7E7E7",
                      cursor: "pointer",
                      zIndex: 5,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "#ffffff",
                        transform: "scale(1.05)",
                      },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isStoreWishlisted(res)) {
                        removeStoreFromWishlist(res, e);
                      } else {
                        addStoreToWishlist(res, e);
                      }
                    }}
                  >
                    {isStoreWishlisted(res) ? (
                      <FavoriteIcon sx={{ color: "#E53935", fontSize: 20 }} />
                    ) : (
                      <FavoriteBorderIcon sx={{ color: "#c4c2c2", fontSize: 20 }} />
                    )}
                  </Box>
                </Box>

                <Box
                  sx={{
                    background: "linear-gradient(150deg, #56e388ff, #f7fcf9ff)",
                    padding: "8px 12px",
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ color: "#1a3d1a", fontSize: "13px" }}
                  >
                    ITEMS START AT ₹{res.minimum_order}
                  </Typography>
                </Box>

                <CardContent sx={{ flexGrow: 1, paddingTop: 1 }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: "#1a1a33", fontSize: { xs: 16, sm: 18 } }}
                    >
                      {res.name}
                    </Typography>

                    <Box
                      display="flex"
                      alignItems="center"
                      sx={{
                        backgroundColor: "#E6F4EA",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        color: "#34A853",
                        fontWeight: 600,
                        fontSize: "14px",
                      }}
                    >
                      <Star sx={{ fontSize: 18, mr: 0.5 }} />
                      {res.avg_rating?.toFixed(1)}
                    </Box>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.3, fontSize: "13px" }}
                  >
                    {res.meta_description || "Cuisines available"}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 0.5,
                        mb: 1,
                        maxWidth: "75%",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontSize: { xs: 12, sm: 13 },
                      }}
                    >
                      {res.address
                        ? res.address.length > 35
                          ? `${res.address.slice(0, 35)}...`
                          : res.address
                        : ""}
                    </Typography>

                    <Box display="flex" alignItems="center" gap={0.5} sx={{ flexShrink: 0 }}>
                      <AccessTime sx={{ fontSize: 17, color: "#555" }} />
                      <Typography variant="caption" color="text.secondary">
                        {res.delivery_time}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </CustomStackFullWidth>
  );
}

/* BUTTON STYLES */
const btnStyle = {
  color: "#34a853",
  borderColor: "#cfeccc",
  borderRadius: "20px",
  textTransform: "none",
  padding: "4px 14px",
  fontWeight: 500,
};

const activeBtnStyle = {
  backgroundColor: "#34a853",
  color: "white",
  borderRadius: "20px",
  textTransform: "none",
  padding: "4px 14px",
  border: "1px solid #34a853",
  fontWeight: 600,
  "&:hover": { backgroundColor: "#2e964c" },
};