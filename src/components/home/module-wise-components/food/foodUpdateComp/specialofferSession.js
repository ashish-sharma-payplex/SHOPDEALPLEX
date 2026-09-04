import * as React from "react";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Skeleton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useTranslation } from "react-i18next";

// >>>>>>>>>>> SWIPER IMPORTS <<<<<<<<<<<
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
// >>>>>>>>>>> END SWIPER IMPORTS <<<<<<<<<<<

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import StarIcon from "@mui/icons-material/Star";

import useWishlistHandler from "components/home/search/pathflow/wishlisthandler";

// ✅ CART + ROUTING
import { useDispatch } from "react-redux";
import { setCart, setBuyNowItemList } from "redux/slices/cart";
import { useRouter } from "next/navigation";
import ProductModal from "./popUpFood";

// >>>>>>>>>>> ZONE ID DEPENDENCIES IMPORTS <<<<<<<<<<<
import { zoneId_api } from "../../../../../api-manage/ApiRoutes";
import MainApi from "../../../../../api-manage/MainApi";
// >>>>>>>>>>> END ZONE ID DEPENDENCIES IMPORTS <<<<<<<<<<<

// --- CONFIG ---
const CARD_WIDTH = 200; // स्थिर चौड़ाई
const CARD_MARGIN = 16;
const AUTOPLAY_INTERVAL = 3000;
const GREEN_COLOR = "var(--brand-green)";

// --- API ---
const API_URL = "https://dealplex.in/api/v1/items/discounted";
let API_HEADERS = {
  ModuleId: "5",
};

// ---------------- MAP PRODUCT (Unaltered) -----------------
const mapProductToOfferCardProps = (product) => {
  const originalPrice = product.price || 0;
  let discountedPrice = originalPrice;
  let discount = product.discount || 0;

  if (discount > 0) {
    if (product.discount_type === "percent") {
      discountedPrice = Math.max(
        originalPrice - (originalPrice * discount) / 100,
        0,
      );
    } else {
      discountedPrice = Math.max(originalPrice - discount, 0);
    }
  }

  return {
    id: product.id,
    title: product.name,
    restaurant: product.store_name,
    deliveryTime: product.delivery_time,
    originalPrice: originalPrice.toFixed(2),
    discountedPrice: discountedPrice.toFixed(2),
    rating: product.avg_rating > 0 ? product.avg_rating.toFixed(1) : "0",
    imageUrl: product.image_full_url,
    discount: Math.round(discount),
    item: product,
  };
};

// ---------------- SKELETON CARD (Unaltered) -----------------
const OfferCardSkeleton = () => (
  <Paper
    sx={{
      width: CARD_WIDTH, // स्थिर चौड़ाई
      mr: 2,
      borderRadius: 2,
      border: "1px solid var(--border-default)",
      overflow: "hidden",
      background: "var(--bg-card)",
    }}
  >
    <Skeleton variant="rectangular" height={150} />
    <Box sx={{ p: 1 }}>
      <Skeleton width="70%" height={20} />
      <Skeleton width="40%" height={15} />
      <Skeleton width="30%" height={15} />
      <Skeleton width="60%" height={20} />
    </Box>
  </Paper>
);

// ---------------- CARD COMPONENT (Unaltered) -----------------
const OfferCard = ({
  title,
  restaurant,
  deliveryTime,
  originalPrice,
  discountedPrice,
  rating,
  imageUrl,
  discount,
  item,
  onClick,
}) => {
  const { isWishlisted, addToWishlist, removeFromWishlist } =
    useWishlistHandler(item);

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    isWishlisted ? removeFromWishlist(e) : addToWishlist(e);
  };

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        width: CARD_WIDTH,
        flexShrink: 0,
        marginRight: 2,
        borderRadius: "12px !important",
        border: "1px solid var(--border-default)",
        backgroundColor: "var(--bg-card)",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Discount */}
      {discount > 0 && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 8,
            backgroundColor: "var(--food-cta-green)",
            color: "var(--food-text-on-brand)",
            fontWeight: 700,
            fontSize: "0.5rem",
            padding: "6px 8px",
            width: "30px",
            textAlign: "center",
            clipPath: `polygon(
                              0 0,
                              100% 0,
                              100% 85%,
                              90% 100%,
                              80% 85%,
                              70% 100%,
                              60% 85%,
                              50% 100%,
                              40% 85%,
                              30% 100%,
                              20% 85%,
                              10% 100%,
                              0 85%
                            )`,
            boxShadow: "0 2px 6px var(--food-overlay-modal)",
            zIndex: 5,
          }}
        >
          {item?.discount_type === "percent"
            ? `${discount}% OFF`
            : `₹${discount} OFF`}
        </Box>
      )}

      {/* Image */}
      <Box
        sx={{
          height: 150,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mt: 2,
        }}
      >
        <img
          src={imageUrl}
          alt={title}
          title={title}
          style={{ width: "300px", height: "300px", objectFit: "cover" }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 24,
            height: 24,
            borderRadius: "12px",
            // backgroundColor: "var(--food-overlay-95)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // border:"1px solid var(--border-image)",
            cursor: "pointer",
            zIndex: 5,
            transition: "all 0.2s ease",
            "&:hover": {
              // backgroundColor: "var(--bg-card)",
              transform: "scale(1.05)",
            },
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (isWishlisted(item)) {
              removeFromWishlist(item, e);
            } else {
              addToWishlist(item, e);
            }
          }}
        >
          {isWishlisted(item) ? (
            <FavoriteIcon sx={{ color: "var(--danger)", fontSize: 20 }} />
          ) : (
            <FavoriteBorderIcon
              sx={{ color: "var(--wishlist-inactive)", fontSize: 20 }}
            />
          )}
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: 1 }}>
        <Typography
          noWrap
          fontWeight="bold"
          sx={{ color: "var(--text-strong)" }}
        >
          {title}
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            background: "var(--brand-green-soft)",
            borderRadius: 1,
            px: 0.6,
            py: 0.3,
            my: 0.5,
            width: "fit-content",
            lineHeight: 1,
            ml: "-5px",
          }}
        >
          <StarIcon
            sx={{
              fontSize: 14,
              mr: 0.3,
              color: "var(--brand-green)",
              display: "block",
            }}
          />
          <Typography
            fontSize={12}
            sx={{
              lineHeight: 1,
              fontWeight: 600,
              color: "var(--brand-green-dark)",
            }}
          >
            {rating}
          </Typography>
        </Box>

        <Typography fontSize={12} sx={{ color: "var(--text-secondary)" }}>
          {restaurant}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
          <AccessTimeIcon
            sx={{ fontSize: 14, mr: 0.5, color: "var(--text-secondary)" }}
          />
          <Typography fontSize={12} sx={{ color: "var(--text-secondary)" }}>
            {deliveryTime}
          </Typography>
        </Box>

        <Box sx={{ mt: 1, display: "flex", gap: 1, alignItems: "center" }}>
          <Typography fontWeight="bold" sx={{ color: "var(--text-strong)" }}>
            ₹{Math.round(discountedPrice)}
          </Typography>

          {originalPrice !== discountedPrice && (
            <Typography
              fontSize={12}
              sx={{
                textDecoration: "line-through",
                mt: 0.3,
                color: "var(--text-muted)",
              }}
            >
              ₹{Math.round(originalPrice)}
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

// ---------------- MAIN -----------------
const SpecialOffersCompleteLayout = () => {
  const { t } = useTranslation();
  const { addToWishlist, removeFromWishlist, isWishlisted } =
    useWishlistHandler(t);

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoneIds, setZoneIds] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const dispatch = useDispatch();
  const router = useRouter();

  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down("sm"));

  // ✅ FIX: slidesPerView को 'auto' पर सेट करें।
  // Swiper अब CSS में दी गई चौड़ाई (CARD_WIDTH) का उपयोग करेगा।
  const getLatLngFromStorage = () => {
    const currentLatLng = localStorage.getItem("currentLatLng");

    if (currentLatLng) {
      try {
        const parsedLatLng = JSON.parse(currentLatLng);
        return {
          lat: parsedLatLng?.lat ?? 0,
          long: parsedLatLng?.lng ?? 0,
        };
      } catch (error) {
        return { lat: 0, long: 0 };
      }
    }

    // ✅ ALWAYS RETURN 0
    return { lat: 0, long: 0 };
  };

  const swiperSettings = {
    modules: [Autoplay, FreeMode],
    spaceBetween: CARD_MARGIN,
    loop: offers.length > 2,
    autoplay: {
      delay: AUTOPLAY_INTERVAL,
      disableOnInteraction: false,
    },
    slidesPerView: "auto", // <<<<<<<<<<< यह मुख्य बदलाव है
    freeMode: true, // ऑटो-स्क्रॉल के बाद ड्रैग करने की अनुमति देता है
  };

  // ---------------- FETCH ZONE ID LOGIC (Unaltered) -----------------
  const fetchZoneId = async () => {
    try {
      const storedLatLng = localStorage.getItem("currentLatLng");
      if (!storedLatLng) throw new Error("Location not selected");

      const { lat, lng } = JSON.parse(storedLatLng);
      if (!lat || !lng) throw new Error("Invalid lat/lng");

      const res = await MainApi.get(zoneId_api, { params: { lat, lng } });
      const data = res.data;

      const zones =
        data?.zone_ids ||
        data?.data?.zone_ids ||
        data?.zone_id ||
        data?.data?.zone_id;

      if (!zones) throw new Error("Zone not found");

      const zoneArray = Array.isArray(zones) ? zones : [zones];

      localStorage.setItem("zoneid", JSON.stringify(zoneArray));
      setZoneIds(zoneArray);
    } catch (err) {
      // console.error("❌ ZONE FETCH FAILED. Using default [0].", err);
      setZoneIds([0]);
    }
  };

  // ---------------- FETCH OFFERS LOGIC (Unaltered) -----------------
  const fetchOffers = async (zones) => {
    if (zones.length === 0) return;
    // console.log("🚀 New Hadapsar Zone Id :", zones);
    const zone = JSON.parse(localStorage.getItem("zoneid"));

    const { lat, long } = getLatLngFromStorage();
    const finalZoneId = zone ?? ["0"];

    // console.log("OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO ", zone);

    // console.log("Latitude and Longitude: ", lat, long);
    // console.log("finalZone id $1111111111111111111111$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ ", finalZoneId);

    setLoading(true);
    setError(null);

    const dynamicHeaders = {
      ...API_HEADERS,
      zoneId: JSON.stringify(finalZoneId),
      latitude: lat,
      longitude: long,
    };

    try {
      const response = await fetch(API_URL, {
        headers: dynamicHeaders,
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const mapped = (data.products || []).map(mapProductToOfferCardProps);
      setOffers(mapped);
    } catch (err) {
      setError(`Failed to load offers: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- EFFECT 1: Load/Fetch zoneIds (Unaltered) -----------------
  useEffect(() => {
    const cached = localStorage.getItem("zoneid");
    if (cached) {
      setZoneIds(JSON.parse(cached));
    } else {
      fetchZoneId();
    }
  }, []);

  // ---------------- EFFECT 2: Fetch offers when zoneIds ready (Unaltered) -----------------
  useEffect(() => {
    if (zoneIds.length > 0) {
      fetchOffers(zoneIds);
    }
  }, [zoneIds]);

  // ---------------- MODAL ACTIONS (Unaltered) -----------------
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setOpenModal(true);
  };

  const handleAddToCart = (product) =>
    dispatch(setCart({ ...product, quantity: 1 }));

  const handleBuyNow = (product) => {
    dispatch(setBuyNowItemList({ ...product, quantity: 1 }));
    router.push("/checkout?page=buy_now");
  };

  // ---------------- RENDER (Updated Swiper structure) -----------------
  if (loading) {
    const skeletonCount = isMobileView ? 2 : 5;
    return (
      <Box sx={{ width: "100%", py: 2 }}>
        {/* HEADER SKELETON */}
        <Box
          sx={{
            px: 2,
            mb: 2,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Skeleton width={180} height={32} />
            <Skeleton width={240} height={18} />
          </Box>

          <Skeleton width={120} height={36} />
        </Box>

        {/* CAROUSEL SKELETON */}
        <Box sx={{ py: 3, px: 2 }}>
          <Swiper {...swiperSettings}>
            {[...Array(skeletonCount)].map((_, index) => (
              <SwiperSlide key={`skel-${index}`} style={{ width: CARD_WIDTH }}>
                {" "}
                {/* ✅ width added here */}
                <OfferCardSkeleton />
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
      </Box>
    );
  }

  if (error) return <Typography sx={{ p: 2 }}>{error}</Typography>;

  if (offers.length === 0)
    return (
      <Typography sx={{ p: 2 }}>
        No special offers available in your zone.
      </Typography>
    );

  return (
    <Box sx={{ width: "100%", py: 2 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          px: 2,
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Special Offers
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Don't miss amazing deals
          </Typography>
        </Box>

        {/* <Button
          color="success"
          variant="text"
          endIcon={<ArrowForwardIcon />}
          sx={{ fontWeight: 'bold', textTransform: 'none' }}
        >
          Explore All
        </Button> */}
      </Box>

      {/* Carousel (Now using Swiper) */}
      <Box
        sx={{
          backgroundColor: "var(--food-bg-cream)",
          borderRadius: 2,
          py: 3,
          px: 2,
        }}
      >
        <Swiper {...swiperSettings}>
          {offers.map((offer, index) => (
            <SwiperSlide
              key={`${offer.item.id}-${index}`}
              style={{ width: CARD_WIDTH }}
            >
              {" "}
              {/* ✅ width added here */}
              <OfferCard
                {...offer}
                onClick={() => handleProductClick(offer.item)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>

      {/* ✅ MODAL */}
      <ProductModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        product={selectedProduct}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />
    </Box>
  );
};

export default SpecialOffersCompleteLayout;
