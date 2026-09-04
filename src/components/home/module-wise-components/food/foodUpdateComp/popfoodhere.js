"use client";

import { useState, useEffect } from 'react';
import {
  Grid,
  Box,
  Card,
  CardContent,
  Typography,
  CardMedia,
  IconButton,
  useTheme,
  useMediaQuery,
  Skeleton,
} from '@mui/material';


import StarIcon from '@mui/icons-material/Star';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import toast, { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { setCart, setCartItemQuantity, setBuyNowItemList } from "../../../../../redux/slices/cart";

import ProductModal from './popUpFood';
import { useRouter } from "next/navigation";

import useWishlistHandler from '../../../search/pathflow/wishlisthandler';

// ⭐ ZONE API IMPORTS
import { zoneId_api } from "../../../../../api-manage/ApiRoutes";
import MainApi from "../../../../../api-manage/MainApi";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';

import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useTranslation } from 'react-i18next';


const GREEN_COLOR = "var(--brand-green)";

// ----------------------------------------------------------------------------------------------------
// ⭐ PRODUCT CARD
// ----------------------------------------------------------------------------------------------------
const ProductCardContent = ({ product, handleProductClick, handleAddToCart, handleBuyNow }) => {
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlistHandler(product);

  const originalPrice = product?.price || 0;
  const discount = product?.discount || 0;

  const newPrice =
    discount > 0
      ? product?.discount_type === "percent"
        ? originalPrice - (originalPrice * discount) / 100
        : originalPrice - discount
      : originalPrice;

  return (
    <Card sx={{
      height: '100%',
      border: "0.5px solid var(--border-image)",
      // boxShadow: 1,
      borderRadius: "12px !important",
      position: 'relative',
      maxWidth: 300,
      mb: 1

    }}>
      <Box sx={{ position: "relative" }}>
        {product?.discount > 0 && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 8,
              background: "var(--food-cta-green)",
              color: "var(--food-text-on-brand)",
              fontWeight: 700,
              fontSize: "0.55rem",
              padding: "6px 8px",
              width: "35px",
              textAlign: "center",
              clipPath: `polygon(0 0, 100% 0, 100% 85%, 90% 100%, 80% 85%, 70% 100%, 60% 85%, 50% 100%, 40% 85%, 30% 100%, 20% 85%, 10% 100%, 0 85%)`,
              zIndex: 5,
            }}
          >
            {product?.discount_type === "percent"
              ? `${product?.discount}% OFF`
              : `₹${product?.discount} OFF`}
          </Box>
        )}

        <CardMedia
          component="img"
          height="140"
          image={product?.image_full_url}
          alt={product?.name}
          title={product?.name}
          sx={{ objectFit: "cover", borderTopLeftRadius: "12px", borderTopRightRadius: "12px", cursor: "pointer" }}
          onClick={() => handleProductClick(product)}
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
            if (isWishlisted(product)) {
              removeFromWishlist(product, e);
            } else {
              addToWishlist(product, e);
            }
          }}
        >
          {isWishlisted(product) ? (
            <FavoriteIcon sx={{ color: "var(--danger)", fontSize: 20 }} />
          ) : (
            <FavoriteBorderIcon sx={{ color: "var(--wishlist-inactive)", fontSize: 20 }} />
          )}
        </Box>
      </Box>

      <CardContent sx={{ padding: '8px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography sx={{ fontWeight: 'bold', maxWidth: 150, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
            {product?.name}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--brand-green-soft)', borderRadius: 1, px: 0.75 }}>
            <StarIcon sx={{ color: GREEN_COLOR, fontSize: 14 }} />
            <Typography fontWeight="bold">
              {Number(product?.avg_rating || 0).toFixed(1)}
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2">{product?.store_name}</Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <TimerOutlinedIcon sx={{ color: GREEN_COLOR, fontSize: 16, mr: 0.5 }} />
          <Typography variant="body2">
            {product?.delivery_time || '10-30 min'}
          </Typography>
        </Box>

        <Typography sx={{ fontWeight: "600", mt: 1 }}>
          ₹{Math.round(newPrice)}{' '}
          <span style={{ textDecoration: 'line-through', color: 'var(--food-text-placeholder)' }}>
            ₹{Math.round(originalPrice)}
          </span>
        </Typography>
      </CardContent>
    </Card>
  );
};

// ----------------------------------------------------------------------------------------------------
// ⭐ SKELETON
// ----------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------
// ⭐ PERFECT MATCH SKELETON (Exact Card Shape)
// ----------------------------------------------------------------------------------------------------
const ProductCardSkeleton = () => (
  <Card
    sx={{
      height: "100%",
      border: "0.5px solid var(--border-image)",
      borderRadius: "12px !important",
      position: "relative",
      maxWidth: 300,
    }}
  >
    {/* Image Skeleton */}
    <Skeleton
      variant="rectangular"
      height={140}
      sx={{
        borderTopLeftRadius: "12px",
        borderTopRightRadius: "12px",
      }}
    />

    <CardContent sx={{ padding: "8px" }}>
      {/* Title + Rating Row */}
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="rounded" width={40} height={22} />
      </Box>

      {/* Store Name */}
      <Skeleton variant="text" width="50%" height={20} />

      {/* Delivery Time */}
      <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
        <Skeleton variant="circular" width={16} height={16} sx={{ mr: 1 }} />
        <Skeleton variant="text" width="40%" height={20} />
      </Box>

      {/* Price */}
      <Box sx={{ mt: 1 }}>
        <Skeleton variant="text" width="40%" height={24} />
      </Box>
    </CardContent>
  </Card>
);


// ----------------------------------------------------------------------------------------------------
// ⭐ MAIN COMPONENT
// ----------------------------------------------------------------------------------------------------
export default function FoodPopular() {

  const { t } = useTranslation();
  const { addToWishlist, removeFromWishlist, isWishlisted } =
    useWishlistHandler(t);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAll, setShowAll] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const dispatch = useDispatch();
  const router = useRouter();
  const { cartList } = useSelector((state) => state.cart);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [zoneIds, setZoneIds] = useState([]);

  // ✅ FETCH ZONES
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

      // console.log("✅ Zone API resolved IDs:", zoneArray);

      localStorage.setItem("zoneid", JSON.stringify(zoneArray));
      // console.log("💾 Zone IDs saved to localStorage:", zoneArray);

      setZoneIds(zoneArray);

    } catch (err) {
      // console.error("❌ Zone fetch failed:", err);
      setZoneIds([15, 17]); // fallback
    }
  };

  const getLatLngFromStorage = () => {
    const currentLatLng = localStorage.getItem('currentLatLng');
    if (currentLatLng) {
      try {
        const parsedLatLng = JSON.parse(currentLatLng); // Parse the stored JSON string
        return {
          lat: parsedLatLng.lat,
          long: parsedLatLng.lng
        };
      } catch (error) {
        // console.error('Error parsing lat/lng from localStorage:', error);
        return { lat: null, long: null }; // Return null if parsing fails
      }
    } else {
      // console.log('No lat/lng data found in localStorage.');
      return { lat: null, long: null }; // Return null if data is not found
    }
  };
  // ✅ FETCH PRODUCTS
  const fetchPopularItems = async (zones) => {
    try {
      // console.log("🚀 New Hadapsar Zone Id :", zones);
      const zone = JSON.parse(localStorage.getItem("zoneid"));
      // console.log("OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO ", zone);

      const { lat, long } = getLatLngFromStorage();
      // console.log("Latitude and Longitude: ", lat, long);
      const finalZoneId = zone ?? ["0"];
      // console.log("finalZone id $$3333333333333$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ ", finalZoneId);

      setLoading(true);

      const apiUrl = `https://dealplex.in/api/v1/items/popular?limit=10&offset=1`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "moduleId": "5",
          zoneId: JSON.stringify(finalZoneId),
          latitude: lat,
          longitude: long
        },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      if (data?.products) setProducts(data.products);
      else setError("No products found.");
    }
    catch (err) {
      setError(err.message);
    }
    finally {
      setLoading(false);
    }
  };

  // ✅ LOAD ZONES (CACHE OR API)
  useEffect(() => {
    const stored = localStorage.getItem("zoneid");

    if (stored) {
      // console.log("📦 Cached zoneid from localStorage:", JSON.parse(stored));
      setZoneIds(JSON.parse(stored));
    }
    else {
      // console.log("🚫 No cached zones → fetching from API");
      fetchZoneId();
    }
  }, []);

  // ✅ ZONE READY EFFECT
  useEffect(() => {
    // console.log("👀 zoneIds updated:", zoneIds);

    if (zoneIds.length === 0) return;

    fetchPopularItems(zoneIds);
  }, [zoneIds]);

  // ----------------------------------------------------------------------------------------------
  // REMAINING LOGIC — UNCHANGED
  // ----------------------------------------------------------------------------------------------
  const handleAddToCart = (product) => {
    const existing = Array.isArray(cartList)
      ? cartList.find((p) => p.id === product.id)
      : null;

    if (existing) {
      dispatch(setCartItemQuantity({ id: product.id, quantity: existing.quantity + 1 }));
      toast.success("Quantity Updated");
    } else {
      dispatch(setCart({ ...product, quantity: 1 }));
      toast.success("Added to cart");
    }
  };

  const handleBuyNow = (product) => {
    dispatch(setBuyNowItemList({ ...product, quantity: 1 }));
    router.push("/checkout?page=buy_now");
  };

  const handleProductClick = (product) => {
    // console.log("🟢 Product clicked, data sent to modal:", product);
    setSelectedProduct(product);
    setOpenModal(true);
  };

  const {
    isWishlisted: isSelectedProductWishlisted,
    addToWishlist: addSelectedProductToWishlist,
    removeFromWishlist: removeSelectedProductFromWishlist
  } = useWishlistHandler(selectedProduct);

  if (loading) {
    return (
      <Box sx={{ marginLeft: 2 }}>
        <Typography variant="h5">
          <Skeleton width="30%" />
        </Typography>

        <Box sx={{ marginTop: 2 }}>
          <Swiper slidesPerView={isMobile ? 1.2 : 5} spaceBetween={16}>
            {[...Array(5)].map((_, index) => (
              <SwiperSlide key={index}>
                <ProductCardSkeleton />
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
      </Box>
    );
  }


  if (error) return <div>Error: {error}</div>;
  if (products.length === 0) return null;

  const productsToShow = products.slice(0, showAll ? products.length : 10);

  return (
    <>
      <Toaster position="top-center" toastOptions={{
        style: {
          boxShadow: "none",
          WebkitBoxShadow: "none",
          MozBoxShadow: "none",
        },
      }} />
      <Box sx={{ marginLeft: 2, position: 'relative' }}>
        <Typography variant="h5">Popular Products</Typography>

        <Box sx={{ marginTop: 2 }}>
          <Swiper modules={[Autoplay, FreeMode]} slidesPerView={isMobile ? 1.2 : 5} spaceBetween={16}>
            {productsToShow.map((product) => (
              <SwiperSlide key={product.id}>
                <ProductCardContent
                  sx={{ my: 2 }}
                  product={product}
                  handleProductClick={handleProductClick}
                  handleBuyNow={handleBuyNow}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>

        <ProductModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          product={selectedProduct}
          onBuyNow={handleBuyNow}

        />
      </Box>
    </>
  );
}
