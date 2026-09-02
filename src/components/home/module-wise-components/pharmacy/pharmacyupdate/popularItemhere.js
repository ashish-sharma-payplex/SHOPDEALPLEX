"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import useWishlistHandler from "components/home/search/pathflow/wishlisthandler";
import { useTranslation } from "react-i18next";
import useAddCartItem from "../../../../../api-manage/hooks/react-query/add-cart/useAddCartItem";
import useDeleteAllCartItem from "../../../../../api-manage/hooks/react-query/add-cart/useDeleteAllCartItem";
import {
  setIncrementToCartItem,
  setDecrementToCartItem,
  setRemoveItemFromCart,
  fetchCartFromApi,
  setCartList,
} from "redux/slices/cart";
import { getGuestId } from "helper-functions/getToken";
import { getCurrentModuleType } from "helper-functions/getCurrentModuleType";
import { getCorrectCart } from "../../../../../helper-functions/getCorrectCart";
import { getItemDataForAddToCart } from "../../../../product-details/product-details-section/helperFunction";
import Perticular from "../../Grocerysubcomponent/PerticularProduct";
import MainApi from "api-manage/MainApi";
import { setModalFor, setSignInModalOpen } from "redux/slices/utils";

// ─── Constants ───────────────────────────────────────────────────────────────
const CARD_WIDTH = 180;
const CARD_GAP = 15;

// ─── Pure-div shimmer (MUI theme se independent) ─────────────────────────────
const shimmerStyle = {
  background: "linear-gradient(90deg, #e8e8e8 25%, #f5f5f5 50%, #e8e8e8 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s infinite",
};

const GrayBox = ({ width = "100%", height, borderRadius = "4px", mt = 0 }) => (
  <div
    style={{
      width,
      height,
      borderRadius,
      marginTop: mt,
      flexShrink: 0,
      ...shimmerStyle,
    }}
  />
);

const CardSkeleton = () => (
  <div
    style={{
      flexShrink: 0,
      width: CARD_WIDTH,
      height: 230,
      borderRadius: "8px",
      border: "1px solid #E3E8EE",
      backgroundColor: "#ffffff",
      padding: "8px",
      boxSizing: "border-box",
    }}
  >
    <GrayBox height={130} borderRadius="8px" />
    <GrayBox width="70%" height={18} mt={8} />
    <GrayBox width="40%" height={14} mt={4} />
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
      <GrayBox width="40%" height={18} />
      <GrayBox width="45px" height={28} borderRadius="6px" />
    </div>
  </div>
);

const TitleSkeleton = () => (
  <div
    style={{
      width: 160,
      height: 32,
      borderRadius: "4px",
      marginBottom: "16px",
      ...shimmerStyle,
    }}
  />
);

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getUpdatedPrice = (item, qty) => {
  const isFood = getCurrentModuleType() === "food";
  const base = isFood
    ? item.price + getTotalVariationsPrice(item?.food_variations)
    : item?.selectedOption?.[0]?.price ?? item.price;
  return base * qty;
};

const getUserIdentifier = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? token : getGuestId();
};

const fetchZoneId = async () => {
  try {
    const storedLatLng = localStorage.getItem("currentLatLng");
    if (!storedLatLng) throw new Error("Location not selected");
    const { lat, lng } = JSON.parse(storedLatLng);
    const res = await MainApi.get(zoneId_api, { params: { lat, lng } });
    const data = res.data;
    const zones =
      data?.zone_ids || data?.data?.zone_ids || data?.zone_id || data?.data?.zone_id;
    if (!zones) throw new Error("Zone not found in API response");
    const zoneArray = Array.isArray(zones) ? zones : [zones];
    localStorage.setItem("zoneid", zoneArray);
    return zoneArray;
  } catch (error) {
    // console.error("fetchZoneId failed:", error);
    return [];
  }
};

const getLatLngFromStorage = () => {
  const currentLatLng = localStorage.getItem("currentLatLng");
  if (currentLatLng) {
    try {
      const parsedLatLng = JSON.parse(currentLatLng);
      return { lat: parsedLatLng.lat, long: parsedLatLng.lng };
    } catch {
      return { lat: null, long: null };
    }
  }
  return { lat: null, long: null };
};

const fetchPopularItems = async () => {
  const zone = JSON.parse(localStorage.getItem("zoneid"));
  const { lat, long } = getLatLngFromStorage();
  const finalZoneId = zone ?? ["0"];
  const apiUrl = "https://dealplex.in/api/v1/items/popular?limit=10&offset=1";
  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        moduleId: "3",
        zoneId: JSON.stringify(finalZoneId),
        latitude: lat ?? "0",
        longitude: long ?? "0",
      },
    });
    if (!response.ok)
      throw new Error(`Failed to fetch popular items, status: ${response.status}`);
    return await response.json();
  } catch (error) {
    // console.error("Error fetching popular items:", error.message);
    throw error;
  }
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function PharmacyPopular() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const cartList = useSelector((state) => getCorrectCart(state));
  const addCartMutation = useAddCartItem();
  const { mutateAsync: deleteAllCartItems } = useDeleteAllCartItem();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingProductId, setAddingProductId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [variationModalOpen, setVariationModalOpen] = useState(false);
  const [variationProduct, setVariationProduct] = useState(null);

  // ✅ Store switch states
  const [storeSwitchOpen, setStoreSwitchOpen] = useState(false);
  const [storeSwitchProduct, setStoreSwitchProduct] = useState(null);
  const [storeSwitchVariant, setStoreSwitchVariant] = useState(null);
  const [storeSwitchLoading, setStoreSwitchLoading] = useState(false);

  // ─── Scroll arrows ──────────────────────────────────────────────────────────
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      if (el) el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [data]);

  const scrollLeft = () =>
    scrollRef.current?.scrollBy({ left: -(CARD_WIDTH + CARD_GAP) * 2, behavior: "smooth" });
  const scrollRight = () =>
    scrollRef.current?.scrollBy({ left: (CARD_WIDTH + CARD_GAP) * 2, behavior: "smooth" });

  // ─── Data fetch ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      try {
        let zones = JSON.parse(localStorage.getItem("zoneid") || "[]");
        if (!zones.length) zones = await fetchZoneId();
        const result = await fetchPopularItems();
        setData(result);
      } catch (err) {
        setError(err.message || "Failed to load popular items.");
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, []);

  const products = useMemo(
    () => (data ? data.items || data.products || [] : []),
    [data]
  );

  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlistHandler(t);

  useEffect(() => {
    const qtyMap = {};
    cartList.forEach((item) => { qtyMap[item.id] = item.quantity || 0; });
    setQuantities(qtyMap);
  }, [cartList]);

  const getCartItemByProductId = (productId) =>
    cartList?.find((cartItem) => Number(cartItem?.id) === Number(productId));

  const getValidZoneId = () => {
    try {
      const raw = localStorage.getItem("zoneid");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return null;
      const flat = parsed.flat();
      return flat.length > 0 ? flat : null;
    } catch {
      return null;
    }
  };

  const getEffectiveStock = (product, selectedVar = null) => {
    const variationStock = selectedVar?.stock ?? product?.variations?.[0]?.stock;
    const productStock = product?.stock;
    if (variationStock != null && variationStock > 0) return variationStock;
    if (productStock != null && productStock > 0) return productStock;
    return 0;
  };

  // ✅ Store-conflict check — GrocerySession.js jaisa hi
  const checkStoreConflict = (product) => {
    const cartStoreId =
      cartList?.[0]?.product?.store_id ?? cartList?.[0]?.store_id ?? null;
    const newProductStoreId = product?.store_id ?? product?.store?.id ?? null;
    return (
      cartList?.length > 0 &&
      cartStoreId &&
      newProductStoreId &&
      String(cartStoreId) !== String(newProductStoreId)
    );
  };

  // ─── Cart handlers ──────────────────────────────────────────────────────────
  const handleAddToCart = useCallback(
    (product, selectedVar = null, bypassStoreCheck = false) => {
      const zoneId = getValidZoneId();
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        toast.error("Please log in to continue.");
        dispatch(setModalFor("sign-in"));
        dispatch(setSignInModalOpen(true));
        return;
      }

      if (!zoneId || (Array.isArray(zoneId) && zoneId.length === 1 && zoneId[0] === 0)) {
        toast.error("Service is not available in your current zone");
        return;
      }

      if (Array.isArray(product?.variations) && product.variations.length > 0 && !selectedVar) {
        if (product.variations.length === 1) selectedVar = product.variations[0];
        else {
          setVariationProduct(product);
          setVariationModalOpen(true);
          return;
        }
      }

      const effectiveStock = getEffectiveStock(product, selectedVar);
      const cartLimit = product?.maximum_cart_quantity ?? Infinity;
      const maxQty = Math.min(effectiveStock, cartLimit);

      if (effectiveStock <= 0) {
        toast.error("This item is out of stock.");
        return;
      }

      const existingCartItem = getCartItemByProductId(product.id);
      const existingQty = existingCartItem?.quantity ?? 0;

      if (existingQty + 1 > maxQty) {
        toast.error(`Only ${maxQty} items allowed. You already have ${existingQty} in cart.`);
        return;
      }

      // ✅ STORE VALIDATION
      if (!bypassStoreCheck && checkStoreConflict(product)) {
        setStoreSwitchProduct(product);
        setStoreSwitchVariant(selectedVar);
        setStoreSwitchOpen(true);
        return;
      }

      setAddingProductId(product.id);
      const userId = getUserIdentifier();
      const finalPrice = selectedVar?.price ?? product.price;
      const payload = getItemDataForAddToCart(
        { ...product, selectedOption: selectedVar ? [selectedVar] : [] },
        1,
        finalPrice,
        userId
      );

      addCartMutation.mutate(payload, {
        onSuccess: () => {
          setAddingProductId(null);
          dispatch(fetchCartFromApi());
          toast.success(`${product.name} added to cart`);
        },
        onError: (err) => {
          // console.error("Add to cart failed:", err);
          setAddingProductId(null);
        },
      });
    },
    [dispatch, addCartMutation, cartList]
  );

  // ✅ Store switch confirm — cart clear karke retry
  const handleStoreSwitchConfirm = async () => {
    try {
      setStoreSwitchLoading(true);
      const userId = getUserIdentifier();
      await deleteAllCartItems(userId);
      dispatch(setCartList([]));
      setStoreSwitchOpen(false);
      if (storeSwitchProduct) {
        handleAddToCart(storeSwitchProduct, storeSwitchVariant, true);
      }
    } catch (error) {
      // console.error("❌ Cart clear failed:", error);
      toast.error("Cart clear nahi hui. Please try again.");
    } finally {
      setStoreSwitchLoading(false);
      setStoreSwitchProduct(null);
      setStoreSwitchVariant(null);
    }
  };

  const handleStoreSwitchCancel = () => {
    setStoreSwitchOpen(false);
    setStoreSwitchProduct(null);
    setStoreSwitchVariant(null);
  };

  const handleIncrement = useCallback(
    (cartItem) => {
      const userId = getUserIdentifier();
      const variationStock =
        cartItem?.variation?.[0]?.stock ?? cartItem?.selectedOption?.[0]?.stock;
      const productStock = cartItem?.product?.stock ?? cartItem?.stock;
      const effectiveStock =
        variationStock != null && variationStock > 0
          ? variationStock
          : productStock != null && productStock > 0
          ? productStock
          : 0;
      const cartLimit = cartItem?.maximum_cart_quantity ?? Infinity;
      const maxQty = Math.min(effectiveStock, cartLimit);

      if (effectiveStock <= 0) { toast.error("This item is out of stock."); return; }
      if (cartItem.quantity >= maxQty) {
        toast.error(`Only ${maxQty} items allowed.`, { id: "max-qty-toast" });
        return;
      }

      const newQty = cartItem.quantity + 1;
      dispatch(setIncrementToCartItem({ ...cartItem, quantity: newQty, totalPrice: getUpdatedPrice(cartItem, newQty), userId }));
      setTimeout(() => dispatch(fetchCartFromApi()), 300);
    },
    [dispatch]
  );

  const handleDecrement = useCallback(
    (cartItem) => {
      const userId = getUserIdentifier();
      const newQty = cartItem.quantity - 1;
      if (newQty <= 0) {
        dispatch(setRemoveItemFromCart({ cartItemKey: cartItem.cartItemKey, cartItemId: cartItem.cartItemId, userId }));
        toast.success(`${cartItem.name} removed from cart`);
        setTimeout(() => dispatch(fetchCartFromApi()), 300);
        return;
      }
      dispatch(setDecrementToCartItem({ ...cartItem, quantity: newQty, totalPrice: getUpdatedPrice(cartItem, newQty), userId }));
      setTimeout(() => dispatch(fetchCartFromApi()), 300);
    },
    [dispatch]
  );

  const handleProductPreview = (product) => { setSelectedProduct(product); setOpenModal(true); };
  const handleModalClose = () => { setOpenModal(false); setSelectedProduct(null); };

  // ─── Add / +/- button ───────────────────────────────────────────────────────
  const renderAddButton = (item) => {
    const cartItem = getCartItemByProductId(item.id);
    const selectedVar = item?.variations?.[0] ?? null;
    const variationStock = selectedVar?.stock;
    const productStock = item?.stock;
    const effectiveStock =
      variationStock != null && variationStock > 0
        ? variationStock
        : productStock != null && productStock > 0
        ? productStock
        : 0;
    const cartLimit = item?.maximum_cart_quantity ?? Infinity;
    const maxQty = Math.min(effectiveStock, cartLimit);
    const isOutOfStock = effectiveStock <= 0;
    const isMaxReached = cartItem ? cartItem.quantity >= maxQty : false;
    const buttonWidth = "70px";

    // Out of stock
    if (isOutOfStock) {
      return (
        <Button
          variant="outlined"
          size="small"
          disabled
          sx={{
            borderRadius: "8px",
            fontSize: "10px",
            width: buttonWidth,
            color: "#e53935 !important",
            border: "1.8px solid #e53935 !important",
            padding: "5px 0px",
            opacity: 0.7,
          }}
        >
          Out of Stock
        </Button>
      );
    }

    // Not in cart
    if (!cartItem) {
      return (
        <Button
          variant="outlined"
          size="small"
          disabled={addingProductId === item.id}
          onClick={(e) => { e.stopPropagation(); handleAddToCart(item); }}
          sx={{
            borderRadius: "8px",
            fontSize: "12px",
            width: buttonWidth,
            color: "#16A34A",
            border: "1.8px solid #16A34A",
            padding: "5px",
          }}
        >
          {addingProductId === item.id ? "..." : "ADD"}
        </Button>
      );
    }

    // In cart — increment / decrement
    return (
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: buttonWidth,
          height: "32px",
          border: "1.8px solid #16A34A",
          borderRadius: "6px",
        }}
      >
        <Box
          onClick={(e) => { e.stopPropagation(); handleDecrement(cartItem); }}
          sx={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f1f1f1", borderRadius: "4px", cursor: "pointer" }}
        >
          <Typography sx={{ fontSize: "14px", color: "#000000" }}>−</Typography>
        </Box>

        <Typography fontWeight={600} sx={{ fontSize: "14px", color: "#000000" }}>
          {cartItem.quantity}
        </Typography>

        <Box
          onClick={(e) => {
            e.stopPropagation();
            if (!isMaxReached) handleIncrement(cartItem);
            else toast.error(`Only ${maxQty} items allowed.`, { id: "max-qty" });
          }}
          sx={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: isMaxReached ? "#e0e0e0" : "#f1f1f1", borderRadius: "4px", cursor: isMaxReached ? "not-allowed" : "pointer", opacity: isMaxReached ? 0.5 : 1 }}
        >
          <Typography sx={{ fontSize: "14px", color: isMaxReached ? "#aaa" : "#000000" }}>+</Typography>
        </Box>
      </Box>
    );
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Shimmer CSS */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <Box
        sx={{
          justifyContent: "center",
          alignItems: "center",
          p: 3,
          width: "100%",
          maxWidth: "1280px",
          margin: "0 auto",
        }}
      >
        <Toaster position="top-center" reverseOrder={false} />

        {/* Header */}
        <div style={{ marginBottom: "16px" }}>
          {isLoading ? (
            <TitleSkeleton />
          ) : (
            <Typography fontWeight={700} sx={{ fontSize: "24px", color: "#000000" }}>
              Popular Items
            </Typography>
          )}
        </div>

        {/* Shimmer skeleton */}
        {isLoading && (
          <div style={{ display: "flex", gap: `${CARD_GAP}px`, overflowX: "auto", paddingBottom: "8px" }}>
            {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        )}

        {/* Error */}
        {error && (
          <Typography textAlign="center" color="error" sx={{ py: 3 }}>
            Failed to load popular items.
          </Typography>
        )}

        {/* Products with arrow navigation */}
        {!isLoading && !error && products.length > 0 && (
          <Box sx={{ position: "relative" }}>
            {/* Left arrow */}
            {canScrollLeft && (
              <IconButton
                onClick={scrollLeft}
                sx={{
                  position: "absolute",
                  left: { xs: "2px", sm: "-18px" },
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 20,
                  backgroundColor: "#fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  width: "36px",
                  height: "36px",
                  "&:hover": { backgroundColor: "#f0f0f0" },
                }}
              >
                <ArrowBackIosNewIcon sx={{ fontSize: "16px" }} />
              </IconButton>
            )}

            {/* Right arrow */}
            {canScrollRight && (
              <IconButton
                onClick={scrollRight}
                sx={{
                  position: "absolute",
                  right: { xs: "2px", sm: "-18px" },
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 20,
                  backgroundColor: "#fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  width: "36px",
                  height: "36px",
                  "&:hover": { backgroundColor: "#f0f0f0" },
                }}
              >
                <ArrowForwardIosIcon sx={{ fontSize: "16px" }} />
              </IconButton>
            )}

            {/* Scroll container */}
            <Box
              ref={scrollRef}
              sx={{
                display: "flex",
                gap: `${CARD_GAP}px`,
                overflowX: "auto",
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
                pb: 1,
              }}
            >
              {products.map((item) => {
                const variation = item?.variations?.[0];
                const unitLabel = variation?.type || "";
                const unitType = item?.unit_type || item?.unit?.unit || "";
                const isNum = /^\d+(\.\d+)?$/.test(unitLabel);
                const discountedPrice = item.price - (item.price * item.discount) / 100;

                return (
                  <Box
                    key={item.id}
                    sx={{
                      flexShrink: 0,
                      width: CARD_WIDTH,
                      minHeight: 230,
                      borderRadius: "8px",
                      border: "1px solid #E3E8EE",
                      backgroundColor: "#ffffff",
                      p: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      position: "relative",
                    }}
                    onClick={() => handleProductPreview(item)}
                  >
                    {/* Discount tag */}
                    {item.discount > 0 && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 8,
                          background: "#1A914B",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "0.5rem",
                          padding: "6px 8px",
                          width: "30px",
                          textAlign: "center",
                          clipPath: `polygon(0 0,100% 0,100% 85%,90% 100%,80% 85%,70% 100%,60% 85%,50% 100%,40% 85%,30% 100%,20% 85%,10% 100%,0 85%)`,
                          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                          zIndex: 5,
                        }}
                      >
                        {item.discount}% OFF
                      </Box>
                    )}

                    {/* Image */}
                    <Box
                      sx={{
                        width: "100%",
                        height: 130,
                        borderRadius: 2,
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        src={item.image_full_url}
                        alt={item.name}
                        title={item.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }}
                      />
                    </Box>

                    {/* Wishlist */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 10,
                        right: 15,
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
                        if (isWishlisted(item)) removeFromWishlist(item, e);
                        else addToWishlist(item, e);
                      }}
                    >
                      {isWishlisted(item) ? (
                        <FavoriteIcon sx={{ color: "#E53935", fontSize: 20 }} />
                      ) : (
                        <FavoriteBorderIcon sx={{ color: "#c4c2c2", fontSize: 20 }} />
                      )}
                    </Box>

                    {/* Name + Unit */}
                    <Box sx={{ mt: 0.8, textAlign: "left", px: 1 }}>
                      <Typography
                        fontWeight={600}
                        sx={{ fontSize: "0.8rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "#000000" }}
                      >
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                        {unitLabel}
                        {isNum && unitType ? ` ${unitType}` : unitType}
                      </Typography>
                    </Box>

                    {/* Price + Button */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.8, px: 1, pb: 0.5 }}>
                      <Box>
                        <Typography fontWeight="bold" sx={{ fontSize: "0.75rem", color: "#1A914B" }}>
                          ₹{discountedPrice % 1 === 0 ? Math.floor(discountedPrice) : discountedPrice.toFixed(2)}
                        </Typography>
                        {item.discount > 0 && (
                          <Typography sx={{ textDecoration: "line-through", fontSize: "0.65rem", color: "#000000" }}>
                            ₹{item.price}
                          </Typography>
                        )}
                      </Box>
                      {renderAddButton(item)}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {!isLoading && !error && products.length === 0 && (
          <Typography textAlign="center" color="text.secondary" sx={{ py: 3 }}>
            No popular items found.
          </Typography>
        )}

        {/* Variation Modal */}
        {variationModalOpen && variationProduct && (
          <Dialog
            open={variationModalOpen}
            onClose={() => setVariationModalOpen(false)}
            fullWidth
            maxWidth="xs"
            sx={{ width: "450px", margin: "auto", "& .MuiPaper-root": { borderRadius: "12px !important" } }}
          >
            <DialogContent
              dividers
              sx={{ borderRadius: "12px !important", backgroundColor: "#FFFFFF", border: "1px solid #ccc6c6" }}
            >
              <DialogTitle sx={{ paddingTop: 0 }}>Select Variations</DialogTitle>
              {variationProduct?.variations?.map((variation, index) => {
                const originalPrice = variation.price;
                const discount = variationProduct.discount || 0;
                const discountedPrice =
                  discount > 0
                    ? Math.round(originalPrice - (originalPrice * discount) / 100)
                    : originalPrice;
                return (
                  <Box
                    key={index}
                    sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5, p: 1, borderRadius: 1, border: "1px dashed #e0e0e0" }}
                  >
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Box
                        component="img"
                        src={variationProduct.image_full_url}
                        alt={variation.type}
                        title={variation.type}
                        sx={{ width: 48, height: 48, borderRadius: 1, objectFit: "cover" }}
                      />
                      <Box>
                        <Typography fontWeight={600}>
                          {variation.type} {variationProduct.unit_type}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography fontWeight={600}>₹{discountedPrice}</Typography>
                          {discount > 0 && (
                            <Typography sx={{ textDecoration: "line-through", color: "#9e9e9e", fontSize: "13px" }}>
                              ₹{originalPrice}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ color: "#1A914b", fontWeight: 600, px: 2, borderColor: "#1A914b", "&:hover": { borderColor: "#1A914b" } }}
                      onClick={() => { setVariationModalOpen(false); handleAddToCart(variationProduct, variation); }}
                    >
                      ADD
                    </Button>
                  </Box>
                );
              })}
            </DialogContent>
          </Dialog>
        )}

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

        {selectedProduct && (
          <Perticular open={openModal} onClose={handleModalClose} product={selectedProduct} />
        )}
      </Box>
    </>
  );
}