"use client";
import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Typography,
  Grid,
  Skeleton,
  IconButton,
  Button,
  useMediaQuery,
  Link,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  setCartList,
  addOptimisticCartItem,
  patchCartItemId,
  removeOptimisticCartItem,
} from "redux/slices/cart";
import { useRouter } from "next/navigation";
import useAddCartItem from "../../api-manage/hooks/react-query/add-cart/useAddCartItem";
import useDeleteAllCartItem from "../../api-manage/hooks/react-query/add-cart/useDeleteAllCartItem";
import { getGuestId } from "helper-functions/getToken";
import { getItemDataForAddToCart } from "../product-details/product-details-section/helperFunction";
import CustomImageContainer from "../../components/CustomImageContainer";
import { RTL } from "../../components/rtl/index";
import { getLanguage } from "helper-functions/getLanguage";
import { zoneId_api } from "../../api-manage/ApiRoutes";
import MainApi from "../../api-manage/MainApi";
import { getCorrectCart } from "../../helper-functions/getCorrectCart";
import useWishlistHandler from "components/home/search/pathflow/wishlisthandler";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useTranslation } from "react-i18next";
import ProductModal from "../home/module-wise-components/food/foodUpdateComp/popUpFood"; // Import the modal component
import { zone_list } from "../../api-manage/ApiRoutes";

const fetchZoneId = async () => {
  try {
    const storedLatLng = localStorage.getItem("currentLatLng");

    if (!storedLatLng) throw new Error("Location not selected");

    const { lat, lng } = JSON.parse(storedLatLng);

    const res = await MainApi.get(zoneId_api, {
      params: { lat, lng },
    });

    const data = res.data;
    const zones =
      data?.zone_ids ||
      data?.data?.zone_ids ||
      data?.zone_id ||
      data?.data?.zone_id;

    if (!zones) throw new Error("Zone not found");

    const zoneArray = Array.isArray(zones) ? zones : [zones];

    localStorage.setItem("zoneid", JSON.stringify(zoneArray));

    return zoneArray;
  } catch (error) {
    // console.error("❌ Zone fetch failed:", error);
    return [];
  }
};

// Function to get lat and long from localStorage
const getLatLngFromStorage = () => {
  const currentLatLng = localStorage.getItem("currentLatLng");
  if (currentLatLng) {
    try {
      const parsedLatLng = JSON.parse(currentLatLng); // Parse the stored JSON string
      return {
        lat: parsedLatLng.lat,
        long: parsedLatLng.lng,
      };
    } catch (error) {
      // console.error("Error parsing lat/lng from localStorage:", error);
      return { lat: null, long: null }; // Return null if parsing fails
    }
  } else {
    return { lat: null, long: null }; // Return null if data is not found
  }
};

// Fetch food items from the API
const fetchFoodItems = async () => {
  const apiUrl = `https://dealplex.in/api/v1/items/popular?limit=10&offset=1`;
  const moduleId = 5;

  // Retrieve the zone ID from localStorage
  const zone = JSON.parse(localStorage.getItem("zoneid"));

  // Get lat and long from localStorage (using the getLatLngFromStorage function)
  const { lat, long } = getLatLngFromStorage();

  // Fallback to [0] if zone is not available in localStorage or zoneIds is not provided
  const zoneIds = zone ?? ["0"];

  // Make the API request
  const response = await fetch(apiUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      moduleId: String(moduleId),
      zoneId: JSON.stringify(zoneIds),
      latitude: lat || "0",
      longitude: long || "0",
    },
  });

  // Handle API error
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  // Parse the JSON response
  const data = await response.json();

  return data;
};

const FoodSessionModule5 = () => {
  const { t } = useTranslation();
  const { addToWishlist, removeFromWishlist, isWishlisted } =
    useWishlistHandler(t);
  const router = useRouter();
  const dispatch = useDispatch();
  const addCartMutation = useAddCartItem();
  const { mutateAsync: deleteAllCartItems } = useDeleteAllCartItem();
  const cartList = useSelector((state) => getCorrectCart(state));

  const [quantity, setQuantity] = useState(1);
  const lanDirection = getLanguage() ? getLanguage() : "ltr";

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Popup Modal State
  const [openModal, setOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // ✅ Store switch states
  const [storeSwitchOpen, setStoreSwitchOpen] = useState(false);
  const [storeSwitchProduct, setStoreSwitchProduct] = useState(null);
  const [storeSwitchIsBuyNow, setStoreSwitchIsBuyNow] = useState(false);
  const [storeSwitchLoading, setStoreSwitchLoading] = useState(false);

  const isMobile = useMediaQuery("(max-width:600px)");

  const EmptyState = ({ text }) => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        // py: 6,
      }}
    >
      <img
        src="/no-food.png"
        alt="No Products"
        style={{
          width: isMobile ? "100px" : "140px",
          height: isMobile ? "100px" : "140px",
          objectFit: "contain",
          marginBottom: isMobile ? "6px" : "10px",
          opacity: 0.9,
        }}
      />

      <Typography
        sx={{
          fontSize: isMobile ? "14px" : "16px",
          fontWeight: 500,
          color: "#6b7280",
        }}
      >
        {text}
      </Typography>
    </Box>
  );

  useEffect(() => {
    const getData = async () => {
      try {
        let zones = JSON.parse(localStorage.getItem("zoneid") || "[]");
        if (!zones.length) {
          zones = await fetchZoneId();
        }

        // let zoneIdes = await fetchZonesAndPopularItems();

        const result = await fetchFoodItems();
        setData(result);
      } catch (err) {
        // console.error("❌ Failed to load food items:", err);
      } finally {
        setIsLoading(false);
      }
    };

    getData();
  }, []);

  const products = useMemo(() => {
    if (!data) return [];
    return data.items || data.products || [];
  }, [data]);

  const discountedPrice = (price, discount) =>
    discount > 0 ? price - (price * discount) / 100 : price;

  // ✅ Store-id check helper — same pattern as GrocerySession
  const checkStoreConflict = (product) => {
    const cartStoreId =
      cartList?.[0]?.product?.store_id ?? cartList?.[0]?.store_id ?? null;
    const newProductStoreId = product?.store_id ?? null;
    return (
      cartList?.length > 0 &&
      cartStoreId &&
      newProductStoreId &&
      String(cartStoreId) !== String(newProductStoreId)
    );
  };

  /* ================= ADD TO CART (OPTIMISTIC) ================= */
  const handleAddToCart = (product, bypassStoreCheck = false) => {
    if (!product) return;

    // ✅ Different store check
    if (!bypassStoreCheck && checkStoreConflict(product)) {
      setStoreSwitchProduct(product);
      setStoreSwitchIsBuyNow(false);
      setStoreSwitchOpen(true);
      return;
    }

    const guestId = getGuestId();
    const discounted = discountedPrice(product.price, product.discount);
    const totalPrice = discounted * quantity;

    const cartItemKey = `${product.id}-${JSON.stringify([])}`;
    const tempCartItemId = `temp-${Date.now()}`;

    // 🚀 STEP 1: OPTIMISTIC UI UPDATE — instant, no API wait
    dispatch(
      addOptimisticCartItem({
        cartItemKey,
        cartItemId: tempCartItemId,
        id: product.id,
        name: product.name,
        image_full_url: product.image_full_url || product.image,
        quantity,
        price: discounted,
        totalPrice,
        variation: [],
        selectedOption: [],
        food_variations: [],
        module_type: product.module_type,
        stock: product.stock,
        maximum_cart_quantity: product.maximum_cart_quantity,
        product,
      }),
    );

    toast.success(`${product.name} added to cart`);

    const itemData = getItemDataForAddToCart(
      product,
      quantity,
      totalPrice,
      guestId,
    );

    // 🚀 STEP 2: background API sync — UI already updated, no blocking
    addCartMutation.mutate(itemData, {
      onSuccess: (res) => {
        const newId = res?.id ?? (Array.isArray(res) && res[0]?.id);
        if (newId) {
          dispatch(patchCartItemId({ cartItemKey, cartItemId: newId }));
        }
      },
      onError: (err) => {
        // console.error("❌ ADD TO CART FAILED:", err);
        dispatch(removeOptimisticCartItem({ cartItemKey })); // rollback
        toast.error("Failed to add to cart");
      },
    });
  };

  const [wishlistedItems, setWishlistedItems] = useState({});

  const toggleWishlist = (product) => {
    const updatedWishlist = { ...wishlistedItems };

    if (updatedWishlist[product.id]) {
      removeFromWishlist(product); // Remove from wishlist
    } else {
      addToWishlist(product); // Add to wishlist
    }

    updatedWishlist[product.id] = !updatedWishlist[product.id];
    setWishlistedItems(updatedWishlist);
  };

  /* ================= BUY NOW (OPTIMISTIC) ================= */
  const handleBuyNow = (product, bypassStoreCheck = false) => {
    if (!product) return;

    // ✅ Different store check
    if (!bypassStoreCheck && checkStoreConflict(product)) {
      setStoreSwitchProduct(product);
      setStoreSwitchIsBuyNow(true);
      setStoreSwitchOpen(true);
      return;
    }

    const guestId = getGuestId();
    const discounted = discountedPrice(product.price, product.discount);
    const totalPrice = discounted * quantity;

    const cartItemKey = `${product.id}-${JSON.stringify([])}`;
    const tempCartItemId = `temp-${Date.now()}`;

    // 🚀 STEP 1: OPTIMISTIC UI UPDATE — instant, no API wait
    dispatch(
      addOptimisticCartItem({
        cartItemKey,
        cartItemId: tempCartItemId,
        id: product.id,
        name: product.name,
        image_full_url: product.image_full_url || product.image,
        quantity,
        price: discounted,
        totalPrice,
        variation: [],
        selectedOption: [],
        food_variations: [],
        module_type: product.module_type,
        stock: product.stock,
        maximum_cart_quantity: product.maximum_cart_quantity,
        product,
      }),
    );

    toast.success(`${product.name} added to cart`);

    // 🚀 STEP 2: navigate immediately, don't wait for API
    router.push("/cart");

    const itemData = getItemDataForAddToCart(
      product,
      quantity,
      totalPrice,
      guestId,
    );

    // 🚀 STEP 3: background API sync
    addCartMutation.mutate(itemData, {
      onSuccess: (res) => {
        const newId = res?.id ?? (Array.isArray(res) && res[0]?.id);
        if (newId) {
          dispatch(patchCartItemId({ cartItemKey, cartItemId: newId }));
        }
      },
      onError: (err) => {
        // console.error("❌ BUY NOW FAILED:", err);
        dispatch(removeOptimisticCartItem({ cartItemKey })); // rollback
        toast.error("Failed to proceed to cart");
      },
    });
  };

  /* ================= STORE SWITCH CONFIRM ================= */
  const handleStoreSwitchConfirm = async () => {
    try {
      setStoreSwitchLoading(true);
      const guestId = getGuestId();
      await deleteAllCartItems(guestId);
      dispatch(setCartList([]));
      setStoreSwitchOpen(false);
      if (storeSwitchProduct) {
        // ✅ bypassStoreCheck = true pass kiya
        if (storeSwitchIsBuyNow) handleBuyNow(storeSwitchProduct, true);
        else handleAddToCart(storeSwitchProduct, true);
      }
    } catch (error) {
      // console.error("❌ Cart clear failed:", error);
      toast.error("Cart clear nahi hui. Please try again.");
    } finally {
      setStoreSwitchLoading(false);
      setStoreSwitchProduct(null);
      setStoreSwitchIsBuyNow(false);
    }
  };

  const handleStoreSwitchCancel = () => {
    setStoreSwitchOpen(false);
    setStoreSwitchProduct(null);
    setStoreSwitchIsBuyNow(false);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);

    setOpenModal(true);
  };

  const limitByChars = (text, max = 15) => {
    if (!text) return "";
    return text.length > max ? text.slice(0, max) + "..." : text;
  };
  return (
    <RTL direction={lanDirection}>
      <Toaster position="top-center" />
      <Box
        sx={{
          py: 1,
          px: { xs: 2, sm: 4, md: 8 },
          maxWidth: "1320px",
          mx: "auto",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            mt: 2,
          }}
        >
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontSize: isMobile ? "18px" : "24px",
              color: "#000000",
              whiteSpace: "nowrap",
            }}
          >
            Food : Cuisines & Categories
          </Typography>

          <Link
            component="button"
            onClick={() => router.push("/home?module=food")}
            underline="none"
            sx={{
              color: "#1A914b",
              fontWeight: 500,
              background: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              whiteSpace: "nowrap",
              ml: isMobile ? "10px" : "0",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            View All
            <ArrowForwardIcon sx={{ fontSize: { xs: "1.1rem", sm: "1rem" } }} />
          </Link>
        </Box>

        {/* Mobile Horizontal Scroll */}
        <Box
          sx={{
            display: { xs: "flex", sm: "none" },
            overflowX: "auto",
            gap: 2,
            scrollSnapType: "x mandatory",
            pb: 1,
          }}
        >
          {isLoading ? (
            // 🔄 LOADING
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                width="88%"
                height={230}
                sx={{ borderRadius: "16px" }}
              />
            ))
          ) : !products.length ? (
            // ❌ EMPTY STATE
            <Box sx={{ width: "100%" }}>
              <EmptyState text="No Food Found" />
            </Box>
          ) : (
            // ✅ DATA
            products.slice(0, 8).map((item, index) => (
              <Box
                key={index}
                sx={{
                  minWidth: "88%",
                  scrollSnapAlign: "start",
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all"
                  style={{
                    border: "2px solid #e5e5e5",
                    borderRadius: "16px",
                  }}
                  onClick={() => handleProductClick(item)}
                >
                  {/* Image */}
                  <Box
                    sx={{
                      height: 190,
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <CustomImageContainer
                      src={item.image_full_url}
                      alt={item.name}
                      title={item.name}
                      width="100%"
                      height="100%"
                      objectFit="cover"
                    />

                    {/* Wishlist Icon */}
                    <IconButton
                      sx={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        backgroundColor: "rgba(255,255,255,0.8)",
                        zIndex: 10,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(item);
                      }}
                    >
                      {wishlistedItems[item.id] ? (
                        <FavoriteIcon sx={{ color: "red", fontSize: 18 }} />
                      ) : (
                        <FavoriteBorderIcon
                          sx={{ color: "grey", fontSize: 18 }}
                        />
                      )}
                    </IconButton>
                  </Box>

                  {/* Content */}
                  <Box sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.8,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 600,
                          fontSize: isMobile ? "14px" : "16px",
                          color: "#000000",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {limitByChars(item.name, 15)}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          backgroundColor: "#1A914B",
                          borderRadius: "6px",
                          px: 0.8,
                          py: 0.2,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#fff",
                            fontWeight: 600,
                            fontSize: "12px",
                            mr: 0.3,
                          }}
                        >
                          {item.avg_rating?.toFixed(1) || "0"}
                        </Typography>

                        <StarIcon sx={{ color: "#fff", fontSize: "14px" }} />
                      </Box>
                    </Box>

                    <Typography
                      sx={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 400,
                        fontSize: isMobile ? "12px" : "12px",
                        color: "#767676",
                        whiteSpace: "nowrap",
                        mb: 1,
                      }}
                    >
                      {item.category_ids?.map((cat) => cat.name).join(" • ")}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <AccessTimeIcon
                          sx={{
                            fontSize: isMobile ? "13px" : "14px",
                            color: "#767676",
                          }}
                        />
                        <Typography
                          sx={{
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 400,
                            fontSize: isMobile ? "12px" : "12px",
                            color: "#767676",
                          }}
                        >
                          {item.delivery_time || "30–45 min"}
                        </Typography>
                      </Box>

                      <Typography
                        sx={{
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 600,
                          fontSize: isMobile ? "12px" : "12px",
                          color: "#1A914B",
                        }}
                      >
                        Starts at ₹{discountedPrice(item.price, item.discount)}
                      </Typography>
                    </Box>

                    {item.discount > 0 && (
                      <Box sx={{ mt: 1.2 }}>
                        <Box
                          sx={{
                            borderTop: "1px dashed #e5e7eb",
                            width: "100%",
                            mb: 1,
                          }}
                        />
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.8,
                          }}
                        >
                          <img
                            src="/discount.svg"
                            alt="Discount Icon"
                            style={{
                              width: "16px",
                              height: "16px",
                            }}
                          />

                          <Typography
                            sx={{
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 400,
                              fontSize: isMobile ? "12px" : "12px",
                              color: "#767676",
                            }}
                          >
                            Upto {item.discount}% OFF on selected items
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </motion.div>
              </Box>
            ))
          )}

          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                width="88%"
                height={230}
                sx={{ borderRadius: "16px" }}
              />
            ))}
        </Box>

        {/* Desktop Grid */}
        <Grid
          container
          spacing={2.5}
          sx={{ display: { xs: "none", sm: "flex" } }}
        >
          {isLoading ? (
            // 🔄 LOADING
            Array.from({ length: 8 }).map((_, i) => (
              <Grid item xs={12} sm={3} md={3} key={i}>
                <Skeleton
                  variant="rectangular"
                  height={230}
                  sx={{ borderRadius: "16px" }}
                />
              </Grid>
            ))
          ) : !products.length ? (
            // ❌ EMPTY STATE
            <Grid item xs={12}>
              <EmptyState text="No Food Found" />
            </Grid>
          ) : (
            // ✅ DATA
            products.slice(0, 8).map((item, index) => (
              <Grid item xs={6} sm={4} md={3} key={item.id || index}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all"
                  style={{
                    border: "1px solid #e5e5e5",
                    borderRadius: "16px",
                    height: "325px",
                  }}
                  onClick={() => handleProductClick(item)}
                >
                  {/* Image */}
                  <Box
                    sx={{
                      height: 190,
                      position: "relative",
                      overflow: "hidden",
                      borderTopRightRadius: "16px",
                      borderTopLeftRadius: "16px",
                    }}
                  >
                    <CustomImageContainer
                      src={item.image_full_url}
                      alt={item.name}
                      title={item.name}
                      width="100%"
                      height="100%"
                      objectFit="cover"
                    />

                    <Box
                      sx={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        width: 24,
                        height: 24,
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        zIndex: 5,
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
                        <FavoriteIcon sx={{ color: "#E53935", fontSize: 20 }} />
                      ) : (
                        <FavoriteBorderIcon
                          sx={{ color: "#c4c2c2", fontSize: 20 }}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* Content */}
                  <Box sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.8,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 600,
                          fontSize: isMobile ? "14px" : "16px",
                          color: "#000000",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {limitByChars(item.name, 15)}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          backgroundColor: "#1A914B",
                          borderRadius: "6px",
                          px: 0.8,
                          py: 0.2,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#fff",
                            fontWeight: 600,
                            fontSize: "12px",
                            mr: 0.3,
                          }}
                        >
                          {item.avg_rating?.toFixed(1) || "0"}
                        </Typography>

                        <StarIcon sx={{ color: "#fff", fontSize: "14px" }} />
                      </Box>
                    </Box>

                    <Typography
                      sx={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 400,
                        fontSize: isMobile ? "10px" : "12px",
                        color: "#767676",
                        whiteSpace: "nowrap",
                        mb: 1,
                      }}
                    >
                      {item.category_ids?.map((cat) => cat.name).join(" • ")}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <AccessTimeIcon
                          sx={{
                            fontSize: isMobile ? "12px" : "14px",
                            color: "#767676",
                          }}
                        />
                        <Typography
                          sx={{
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 400,
                            fontSize: isMobile ? "10px" : "12px",
                            color: "#767676",
                          }}
                        >
                          {item.delivery_time || "30–45 min"}
                        </Typography>
                      </Box>

                      <Typography
                        sx={{
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 600,
                          fontSize: isMobile ? "10px" : "12px",
                          color: "#1A914B",
                        }}
                      >
                        Starts at ₹{discountedPrice(item.price, item.discount)}
                      </Typography>
                    </Box>

                    {item.discount > 0 && (
                      <Box sx={{ mt: 1.2 }}>
                        <Box
                          sx={{
                            borderTop: "1px dashed #e5e7eb",
                            width: "100%",
                            mb: 1,
                          }}
                        />
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.8,
                          }}
                        >
                          <img
                            src="/discount.svg"
                            alt="Discount Icon"
                            style={{
                              width: "16px",
                              height: "16px",
                            }}
                          />

                          <Typography
                            sx={{
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 400,
                              fontSize: isMobile ? "12px" : "12px",
                              color: "#767676",
                            }}
                          >
                            Upto {item.discount}% OFF on selected items
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </motion.div>
              </Grid>
            ))
          )}

          {isLoading &&
            Array.from({ length: 8 }).map((_, i) => (
              <Grid item xs={12} sm={3} md={3} key={i}>
                <Skeleton
                  variant="rectangular"
                  height={230}
                  sx={{ borderRadius: "16px" }}
                />
              </Grid>
            ))}
        </Grid>
      </Box>

      {/* Modal Implementation */}
      <ProductModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        product={selectedProduct}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      {/* ================= STORE SWITCH DIALOG ================= */}
      <Dialog
        open={storeSwitchOpen}
        onClose={handleStoreSwitchCancel}
        PaperProps={{
          sx: {
            borderRadius: { xs: "24px", sm: "28px" },
            padding: { xs: "8px", sm: "12px" },
            maxWidth: { xs: "92vw", sm: "420px" },
            width: "100%",
            mx: "auto",
          },
        }}
      >
        {/* Icon + Title */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            pt: { xs: 2.5, sm: 3 },
            pb: 1,
            px: { xs: 2, sm: 3 },
          }}
        >
          {/* Warning Icon Circle */}
          <Box
            sx={{
              width: { xs: 52, sm: 60 },
              height: { xs: 52, sm: 60 },
              borderRadius: "50%",
              backgroundColor: "#fff7ed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
              border: "2px solid #fed7aa",
            }}
          >
            <Typography sx={{ fontSize: { xs: 24, sm: 28 } }}>🛒</Typography>
          </Box>

          <Typography
            sx={{
              fontWeight: 700,
              fontSize: { xs: "17px", sm: "19px" },
              color: "#111827",
              textAlign: "center",
              lineHeight: 1.3,
              mb: 0.5,
            }}
          >
            Switch Store?
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: "12px", sm: "13px" },
              color: "#6b7280",
              textAlign: "center",
            }}
          >
            Your cart has items from another store
          </Typography>
        </Box>

        <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 1.5 }}>
          {/* Info Box */}
          <Box
            sx={{
              backgroundColor: "#fef3c7",
              border: "1px solid #fde68a",
              borderRadius: "12px",
              px: { xs: 1.8, sm: 2 },
              py: { xs: 1.5, sm: 1.8 },
              display: "flex",
              gap: 1.2,
              alignItems: "flex-start",
            }}
          >
            <Typography sx={{ fontSize: { xs: 15, sm: 17 }, mt: "1px" }}>
              ⚠️
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "12px", sm: "13px" },
                color: "#92400e",
                lineHeight: 1.6,
              }}
            >
              Adding this item will <strong>clear your current cart</strong>.
              All previously added items from the other store will be removed.
            </Typography>
          </Box>

          {/* Divider line */}
          <Box
            sx={{
              mt: 2,
              mb: 1.5,
              borderTop: "1px dashed #e5e7eb",
            }}
          />

          <Typography
            sx={{
              fontSize: { xs: "13px", sm: "14px" },
              color: "#374151",
              textAlign: "center",
              fontWeight: 500,
            }}
          >
            Do you want to clear the cart and add this item?
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            pb: { xs: 2.5, sm: 3 },
            pt: 1,
            gap: { xs: 1, sm: 1.5 },
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          {/* Cancel Button */}
          <Button
            fullWidth
            onClick={handleStoreSwitchCancel}
            disabled={storeSwitchLoading}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 600,
              fontSize: { xs: "13px", sm: "14px" },
              py: { xs: 1.3, sm: 1.4 },
              border: "1.5px solid #e5e7eb",
              color: "#374151",
              backgroundColor: "#fff",
              order: { xs: 2, sm: 1 },
              "&:hover": {
                backgroundColor: "#f9fafb",
                borderColor: "#d1d5db",
              },
            }}
          >
            Keep Current Cart
          </Button>

          {/* Confirm Button */}
          <Button
            fullWidth
            onClick={handleStoreSwitchConfirm}
            disabled={storeSwitchLoading}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 700,
              fontSize: { xs: "13px", sm: "14px" },
              py: { xs: 1.3, sm: 1.4 },
              backgroundColor: "#16a34a",
              color: "#fff",
              order: { xs: 1, sm: 2 },
              boxShadow: "0 4px 14px rgba(22,163,74,0.25)",
              "&:hover": {
                backgroundColor: "#15803d",
                boxShadow: "0 4px 18px rgba(22,163,74,0.35)",
              },
              "&.Mui-disabled": {
                backgroundColor: "#86efac",
                color: "#fff",
              },
            }}
          >
            {storeSwitchLoading ? "Clearing..." : "Yes, Clear"}
          </Button>
        </DialogActions>
      </Dialog>
    </RTL>
  );
};

export default FoodSessionModule5;
