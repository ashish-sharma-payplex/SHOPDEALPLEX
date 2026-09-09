"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Skeleton,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import StarIcon from "@mui/icons-material/Star";

// --- SWIPER IMPORTS ---
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// --- APP IMPORTS ---
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import useWishlistHandler from "components/home/search/pathflow/wishlisthandler";
import ProductModal from "./popUpFood"; // Ensure path is correct
import { useTranslation } from "react-i18next";

// --- Configuration ---
const GREEN_COLOR = "var(--food-soft-mint-bg)"; // Background for container
const ICON_GREEN_COLOR = "var(--brand-green)"; // Color for icons/buttons
const PINK_COLOR = "var(--food-badge-soft-yellow-bg)";

// API Configuration (we will update ZoneId dynamically)
const API_URL = "https://dealplex.in/api/v1/items/most-reviewed";

const mapProductToOfferCardProps = (product) => {
  const originalPrice = product.price;
  let discountedPrice = originalPrice;

  if (product.discount > 0) {
    if (product.discount_type === "percent") {
      discountedPrice =
        originalPrice - (originalPrice * product.discount) / 100;
    } else if (product.discount_type === "amount") {
      discountedPrice = originalPrice - product.discount;
    }
  }
  const ratingValue =
    product.avg_rating > 0 ? product.avg_rating.toFixed(1) : "0";

  return {
    title: product.name,
    restaurant: product.store_name,
    deliveryTime: product.delivery_time,
    originalPrice: originalPrice.toFixed(0),
    discountedPrice: discountedPrice.toFixed(0),
    rating: ratingValue,
    imageUrl: product.image_full_url || "placeholder.png",
    isTopRated: parseFloat(ratingValue) >= 4.5,
    item: product,
  };
};

// 1. Reusable Card Component (OfferCard)
const OfferCard = ({
  title,
  restaurant,
  deliveryTime,
  originalPrice,
  discountedPrice,
  rating,
  imageUrl,
  item,
  onCardClick,
  isLoading,
}) => {
  const { isWishlisted, addToWishlist, removeFromWishlist } =
    useWishlistHandler(item);

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    isWishlisted ? removeFromWishlist(e) : addToWishlist(e);
  };

  const showTopRatedBadge = true;

  return (
    <Paper
      elevation={0}
      onClick={() => onCardClick(item)}
      sx={{
        width: "100%", // âœ… Changed to 100% to fit Swiper Slide
        height: "100%", // Ensure equal height
        flexShrink: 0,
        borderRadius: "8px !Important",
        border: "1px solid var(--border-default)",
        stroke: 1,
        position: "relative",
        overflow: "hidden",
        backgroundColor: "var(--bg-card)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Favorite Icon */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 40,
          height: 40,
          // borderRadius: "12px",
          // backgroundColor: "var(--food-overlay-95)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          // border: "1px solid var(--border-image)",
          cursor: "pointer",
          zIndex: 5,
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: "var(--bg-card)",
            transform: "scale(1.05)",
          },
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (isWishlisted(item.id)) {
            removeFromWishlist(item.id, e);
          } else {
            addToWishlist(item.id, e);
          }
        }}
      >
        {isWishlisted(item.id) ? (
          <FavoriteIcon sx={{ color: "var(--danger)", fontSize: 20 }} />
        ) : (
          <FavoriteBorderIcon
            sx={{ color: "var(--wishlist-inactive)", fontSize: 20 }}
          />
        )}
      </Box>

      {/* Image Container */}
      <Box
        sx={{
          height: 140,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Shimmer effect for image */}
        {isLoading ? (
          <Skeleton variant="rectangular" width="100%" height="100%" />
        ) : (
          <img
            src={imageUrl}
            alt={title}
            title={title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
      </Box>

      {/* Card Content */}
      <Box sx={{ p: 1 }}>
        {showTopRatedBadge && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              backgroundColor: PINK_COLOR,
              color: "var(--food-text-body)",
              px: 0.9,
              py: 0.7,
              zIndex: 3,
              mb: 0.5,
              width: "fit-content",
              boxShadow: "0 1px 3px var(--food-shadow-strong)",
            }}
          >
            <Typography
              variant="caption"
              fontWeight="bold"
              lineHeight={1}
              sx={{ fontSize: "0.7rem" }}
            >
              Top Rated
            </Typography>
            <FavoriteIcon sx={{ color: "red", fontSize: 10, ml: 0.5 }} />
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 0.8,
            minHeight: "20px",
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            color="var(--food-text-body)"
            sx={{
              flexGrow: 1,
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              marginRight: 1,
              fontSize: "1rem",
            }}
          >
            {isLoading ? <Skeleton width="80%" /> : title}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              backgroundColor: GREEN_COLOR,
              color: "white",
              borderRadius: 20,
              px: 0.75,
              py: 0.25,
              flexShrink: 0,
              height: "24px",
            }}
          >
            <StarIcon
              sx={{ color: "var(--food-cta-green)", fontSize: 14, mr: 0.5 }}
            />
            <Typography
              variant="body2"
              fontWeight="bold"
              sx={{ color: "var(--food-cta-green)" }}
            >
              {isLoading ? <Skeleton width={30} /> : rating}
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          mb={1.2}
          sx={{ fontSize: "0.8rem" }}
        >
          {isLoading ? <Skeleton width="60%" /> : restaurant}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", mb: 1.2, mt: 0.5 }}>
          <AccessTimeIcon sx={{ fontSize: 14, color: "grey", mr: 0.5 }} />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: "0.8rem" }}
          >
            {isLoading ? <Skeleton width="40%" /> : deliveryTime}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "baseline", pb: 0, mt: 0.5 }}>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            color="text.primary"
            mr={1}
            lineHeight={1}
            sx={{ fontSize: "1rem" }}
          >
            ₹{isLoading ? <Skeleton width={50} /> : Math.round(discountedPrice)}
          </Typography>
          {isLoading ? (
            <Skeleton width={50} />
          ) : (
            originalPrice !== discountedPrice && (
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ textDecoration: "line-through", fontSize: "0.9rem" }}
              >
                ₹{Math.round(originalPrice)}
              </Typography>
            )
          )}
        </Box>
      </Box>
    </Paper>
  );
};

// 3. Main Component
const TopReviewedItemsLayout = () => {
  const { t } = useTranslation();
  const [offers, setOffers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const [zoneIds, setZoneIds] = useState([15, 17]); // Default zone IDs

  // --- MODAL STATE ---
  const [openModal, setOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const dispatch = useDispatch();
  const router = useRouter();
  const { addToWishlist, removeFromWishlist, isWishlisted } =
    useWishlistHandler(t);
  const {
    isWishlisted: isSelectedProductWishlisted,
    addToWishlist: addSelectedProductToWishlist,
    removeFromWishlist: removeSelectedProductFromWishlist,
  } = useWishlistHandler(selectedProduct);

  const handleCardClick = (product) => {
    setSelectedProduct(product);
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
    setSelectedProduct(null); // Setting to null on close is correct, but can cause a flicker/error if not handled in ProductModal
  };

  // ðŸš€ BUY NOW LOGIC
  const handleBuyNow = (product) => {
    // console.log("Buy Now Triggered for:", product);
    toast.success("Redirecting to checkout...");
    router.push("/checkout?page=checkout");
    handleModalClose();
  };

  // Fetch Zone IDs and update API headers
  useEffect(() => {
    const fetchZoneId = async () => {
      try {
        const storedLatLng = localStorage.getItem("currentLatLng");
        if (!storedLatLng) throw new Error("Location not selected");

        const { lat, lng } = JSON.parse(storedLatLng);
        if (!lat || !lng) throw new Error("Invalid lat/lng");

        const res = await fetch(
          "https://dealplex.in/api/v1/items/most-reviewed",
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat, lng }),
          },
        );

        const data = await res.json();
        const zoneArray = data.zoneIds || [15, 17]; // Default if zoneId not found

        localStorage.setItem("zoneid", JSON.stringify(zoneArray));
        setZoneIds(zoneArray);
      } catch (err) {
        // console.error("âŒ Zone fetch failed", err);
        setZoneIds([15, 17]); // Default fallback
      }
    };

    fetchZoneId();
  }, []);

  // Fetch Offers with Dynamic Zone ID
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const headers = {
          ZoneId: JSON.stringify([15, 17]),
          ModuleId: "5",
        };

        const response = await fetch(API_URL, { method: "GET", headers });
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        const mappedOffers = (data.products || []).map(
          mapProductToOfferCardProps,
        );

        if (mappedOffers.length === 0)
          throw new Error("API returned zero products.");

        setOffers(mappedOffers);
        setError(null);
      } catch (err) {
        // console.warn("API call failed.", err);
        setError("Failed to fetch top reviewed items.");
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [zoneIds]);

  if (loading)
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography>Loading top reviewed items...</Typography>
      </Box>
    );
  if (offers.length === 0)
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography color="error">{error || "No items available."}</Typography>
      </Box>
    );

  return (
    <Box sx={{ width: "100%", py: 2, boxSizing: "border-box", margin: 0 }}>
      {error && (
        <Box
          sx={{
            p: 1,
            mx: 2,
            mb: 1,
            backgroundColor: "var(--food-badge-soft-orange-bg)",
            color: "var(--food-accent-orange)",
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" fontWeight="bold">
            {error}
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          mb: 2,
          px: 2,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Top Reviewed Items
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Customer favorites with top ratings
          </Typography>
        </Box>
        {/* <Button variant="text" color="success" endIcon={<ArrowForwardIcon />} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
                    Explore All
                </Button> */}
      </Box>

      {/* âœ… SWIPER SLIDER IMPLEMENTATION */}
      <Box
        sx={{
          backgroundColor: GREEN_COLOR,
          borderRadius: 2,
          py: 3,
          px: 2,
          width: "100%",
          ".swiper-button-prev, .swiper-button-next": {
            color: ICON_GREEN_COLOR,
            "&:after": { fontSize: "20px !important", fontWeight: "bold" },
            backgroundColor: "var(--food-overlay-80)",
            borderRadius: "50%",
            width: "35px",
            height: "35px",
            boxShadow: "0 2px 5px var(--food-shadow-strong)",
          },
          ".swiper-slide": {
            height: "auto",
            display: "flex",
          },
        }}
      >
        <Swiper
          modules={[Autoplay, Navigation, Mousewheel]}
          loop={offers.length > 4}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          mousewheel={true}
          grabCursor={true}
          spaceBetween={16}
          slidesPerView={1.2}
          // navigation={true}
          breakpoints={{
            1200: { slidesPerView: 5.5, spaceBetween: 20 },
            900: { slidesPerView: 4.2, spaceBetween: 20 },
            600: { slidesPerView: 2.5, spaceBetween: 15 },
            0: { slidesPerView: 1.2, spaceBetween: 10 },
          }}
        >
          {offers.map((offer, index) => (
            <SwiperSlide key={`${offer.item.id}-${index}`}>
              <OfferCard
                {...offer}
                isLoading={loading} // Pass loading state here to show skeletons
                onCardClick={handleCardClick}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>

      {/* âœ… PRODUCT MODAL - The conditional rendering prevents the error */}
      {selectedProduct && (
        <ProductModal
          open={openModal}
          onClose={handleModalClose}
          product={selectedProduct}
          onBuyNow={handleBuyNow}
        />
      )}
    </Box>
  );
};

export default TopReviewedItemsLayout;
