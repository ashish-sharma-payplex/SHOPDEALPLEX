"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import useWishlistHandler from "components/home/search/pathflow/wishlisthandler";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import {
  Box,
  Grid,
  Typography,
  Button,
  Skeleton,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import {
  setIncrementToCartItem,
  setDecrementToCartItem,
  setRemoveItemFromCart,
  fetchCartFromApi,
  setCartList,
  addOptimisticCartItem,
  patchCartItemId,
  removeOptimisticCartItem,
} from "redux/slices/cart";
import { getCorrectCart } from "../../helper-functions/getCorrectCart";
import useAddCartItem from "../../api-manage/hooks/react-query/add-cart/useAddCartItem";
import { getGuestId } from "helper-functions/getToken";
import { getItemDataForAddToCart } from "../product-details/product-details-section/helperFunction";
import { getCurrentModuleType } from "helper-functions/getCurrentModuleType";
import { getTotalVariationsPrice } from "utils/CustomFunctions";
import MainApi from "api-manage/MainApi";
import { zoneId_api } from "api-manage/ApiRoutes";
import CustomImageContainer from "../../components/CustomImageContainer";
import Perticular from "components/home/module-wise-components/Grocerysubcomponent/PerticularProduct";
import { setModalFor, setSignInModalOpen } from "redux/slices/utils";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import useDeleteAllCartItem from "api-manage/hooks/react-query/add-cart/useDeleteAllCartItem";
import styles from "../../../src/styles/Pharmacy.module.css";

const fetchZoneId = async () => {
  try {
    const storedLatLng = localStorage.getItem("currentLatLng");
    if (!storedLatLng) throw new Error("Location not selected");
    const { lat, lng } = JSON.parse(storedLatLng);
    const res = await MainApi.get(zoneId_api, { params: { lat, lng } });
    const data = res.data;
    const zones =
      data?.zone_ids ||
      data?.data?.zone_ids ||
      data?.zone_id ||
      data?.data?.zone_id;
    if (!zones) throw new Error("Zone not found in API response");
    const zoneArray = Array.isArray(zones) ? zones : [zones];
    localStorage.setItem("zoneid", zoneArray);
    return zoneArray;
  } catch (error) {
    // console.error("fetchZoneId failed:", error);
    return [];
  }
};

const getUserIdentifier = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? token : getGuestId();
};

const getUpdatedPrice = (item, qty) => {
  const isFood = getCurrentModuleType() === "food";
  const base = isFood
    ? item.price + getTotalVariationsPrice(item?.food_variations)
    : item?.selectedOption?.[0]?.price ?? item.price;
  const discount = item.discount || 0;
  const discountType = item.discount_type || "percent";
  let finalPrice = base * qty;
  if (discount > 0) {
    if (discountType === "percent")
      finalPrice = finalPrice - (finalPrice * discount) / 100;
    else finalPrice = finalPrice - discount;
  }
  return finalPrice;
};

const CustomContainer = ({ children }) => (
  <Box sx={{ maxWidth: 1320, mx: "auto", px: { xs: 2, sm: 3, md: 6, lg: 8 } }}>
    {children}
  </Box>
);

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
  try {
    const zone = JSON.parse(localStorage.getItem("zoneid"));
    const { lat, long } = getLatLngFromStorage();
    const finalZoneId = zone ?? ["0"];

    const res = await fetch(
      "https://dealplex.in/api/v1/items/popular?limit=10&offset=1",
      {
        headers: {
          moduleId: "3", // ⚠️ check karo grocery ke liye moduleId sahi hai ya nahi
          zoneId: JSON.stringify(finalZoneId),
          latitude: lat,
          longitude: long,
        },
      },
    );

    if (!res.ok) {
      throw new Error(`API request failed with status ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    // console.error("fetchPopularItems failed:", error);
    return { items: [] }; // ✅ safe fallback — component crash nahi hoga
  }
};

const PharmacySession = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();
  const addCartMutation = useAddCartItem();
  const isMobile = useMediaQuery("(max-width:600px)");
  const cartList = useSelector((state) => getCorrectCart(state));

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addingProductId, setAddingProductId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [variationModalOpen, setVariationModalOpen] = useState(false);
  const [variationProduct, setVariationProduct] = useState(null);

  // ✅ Store switch states
  const [storeSwitchOpen, setStoreSwitchOpen] = useState(false);
  const [storeSwitchProduct, setStoreSwitchProduct] = useState(null);
  const [storeSwitchVariant, setStoreSwitchVariant] = useState(null);
  const [storeSwitchLoading, setStoreSwitchLoading] = useState(false);

  // ✅ Delete all cart items hook
  const { mutateAsync: deleteAllCartItems } = useDeleteAllCartItem();

  // ─── Rapid-click glitch fix (increment/decrement) ─────────────────────────
  const pendingQtyRef = useRef({}); // { [productId]: latestQty }
  const syncTimersRef = useRef({}); // { [productId]: timeoutId }

  const EmptyState = ({ text }) => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <img
        src="/nomedicine.png"
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
          color: "var(--text-secondary)",
        }}
      >
        {text}
      </Typography>
    </Box>
  );

  useEffect(() => {
    cartList.forEach((item) => {
      if (pendingQtyRef.current[item.id] === item.quantity) {
        delete pendingQtyRef.current[item.id];
      }
    });
  }, [cartList]);
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchZoneId();
    fetchPopularItems()
      .then(setData)
      .finally(() => setIsLoading(false));
  }, []);

  const products = useMemo(() => data?.items || data?.products || [], [data]);
  const { addToWishlist, removeFromWishlist, isWishlisted } =
    useWishlistHandler(t);

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

  // ✅ Stock helper — variation first, then product, then maximum_cart_quantity
  const getEffectiveStock = (product, selectedVar = null) => {
    const variationStock =
      selectedVar?.stock ?? product?.variations?.[0]?.stock;
    const productStock = product?.stock;
    const maxCartQty = product?.maximum_cart_quantity;
    if (variationStock != null && variationStock > 0) return variationStock;
    if (productStock != null && productStock > 0) return productStock;
    if (maxCartQty != null && maxCartQty > 0) return maxCartQty;
    return 0;
  };

  /* ================= ADD TO CART (✅ now optimistic) ================= */
  const handleAddToCart = useCallback(
    (product, selectedVar = null, bypassStoreCheck = false) => {
      // ✅ bypassStoreCheck flag
      const zoneId = getValidZoneId();
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        toast.error("Please log in to continue.");
        dispatch(setModalFor("sign-in"));
        dispatch(setSignInModalOpen(true));
        return;
      }

      if (
        !zoneId ||
        (Array.isArray(zoneId) && zoneId.length === 1 && zoneId[0] === 0)
      ) {
        toast.error("Service is not available in your current zone");
        return;
      }

      if (
        Array.isArray(product?.variations) &&
        product.variations.length > 0 &&
        !selectedVar
      ) {
        if (product.variations.length === 1)
          selectedVar = product.variations[0];
        else {
          setVariationProduct(product);
          setVariationModalOpen(true);
          return;
        }
      }

      // ✅ Stock check
      const effectiveStock = getEffectiveStock(product, selectedVar);
      if (effectiveStock <= 0) {
        toast.error("This item is out of stock.");
        return;
      }

      const existingCartItem = getCartItemByProductId(product.id);
      const existingQty = existingCartItem?.quantity ?? 0;
      if (existingQty + 1 > effectiveStock) {
        toast.error(
          `Only ${effectiveStock} items allowed. You already have ${existingQty} in cart.`,
        );
        return;
      }

      // ═══════════════════════════════════════════
      // ✅ STORE VALIDATION
      // ═══════════════════════════════════════════
      const cartStoreId =
        cartList?.[0]?.product?.store_id ?? cartList?.[0]?.store_id ?? null;
      const newProductStoreId = product?.store_id ?? null;

      if (
        !bypassStoreCheck && // ✅ bypass flag check
        cartList?.length > 0 &&
        cartStoreId &&
        newProductStoreId &&
        String(cartStoreId) !== String(newProductStoreId)
      ) {
        setStoreSwitchProduct(product);
        setStoreSwitchVariant(selectedVar);
        setStoreSwitchOpen(true);
        return;
      }
      // ═══════════════════════════════════════════

      const userId = getUserIdentifier();
      const finalPrice = selectedVar?.price ?? product.price;
      const variationArr = selectedVar ? [selectedVar] : [];
      const cartItemKey = `${product.id}-${JSON.stringify(variationArr)}`;
      const tempCartItemId = `temp-${Date.now()}`;

      // 🚀 STEP 1: OPTIMISTIC UI UPDATE — instant, no API wait
      dispatch(
        addOptimisticCartItem({
          cartItemKey,
          cartItemId: tempCartItemId,
          id: product.id,
          name: product.name,
          image_full_url: product.image_full_url || product.image,
          quantity: 1,
          price: finalPrice,
          totalPrice: finalPrice,
          variation: variationArr,
          selectedOption: variationArr,
          food_variations: variationArr,
          module_type: product.module_type,
          stock: product.stock,
          maximum_cart_quantity: product.maximum_cart_quantity,
          product,
        }),
      );

      // ✅ keep pendingQtyRef in sync so increment/decrement debounce logic
      // sees the right starting quantity right away
      pendingQtyRef.current[product.id] = 1;

      toast.success(`${product.name} added to cart`);

      const payload = getItemDataForAddToCart(
        { ...product, selectedOption: variationArr },
        1,
        finalPrice,
        userId,
      );

      // 🚀 STEP 2: background API sync — UI already updated, no blocking
      addCartMutation.mutate(payload, {
        onSuccess: (response) => {
          if (response?.id) {
            dispatch(patchCartItemId({ cartItemKey, cartItemId: response.id }));
          }
        },
        onError: (err) => {
          // console.error("❌ Add to cart failed:", err);
          delete pendingQtyRef.current[product.id];
          dispatch(removeOptimisticCartItem({ cartItemKey })); // rollback
          toast.error("Item add nahi ho paya, dobara try karo");
        },
      });
    },
    [dispatch, addCartMutation, cartList],
  );

  /* ================= STORE SWITCH CONFIRM ================= */
  const handleStoreSwitchConfirm = async () => {
    try {
      setStoreSwitchLoading(true);
      const userId = getUserIdentifier();
      await deleteAllCartItems(userId);
      dispatch(setCartList([]));
      // ✅ pending qty refs bhi clear kar do, purane cart ka stale data na reh jaaye
      pendingQtyRef.current = {};
      Object.values(syncTimersRef.current).forEach((timerId) =>
        clearTimeout(timerId),
      );
      syncTimersRef.current = {};
      setStoreSwitchOpen(false);
      if (storeSwitchProduct) {
        // ✅ bypassStoreCheck = true pass kiya
        handleAddToCart(storeSwitchProduct, storeSwitchVariant, true);
      }
    } catch (error) {
      // console.error("Cart clear failed:", error);
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

  /* ================= INCREMENT ================= */
  const handleIncrement = useCallback(
    (cartItem) => {
      const userId = getUserIdentifier();
      const productId = cartItem.id;

      const variationStock =
        cartItem?.variation?.[0]?.stock ?? cartItem?.selectedOption?.[0]?.stock;
      const productStock = cartItem?.product?.stock ?? cartItem?.stock;
      const maxCartQty = cartItem?.maximum_cart_quantity;
      const effectiveStock =
        variationStock != null && variationStock > 0
          ? variationStock
          : productStock != null && productStock > 0
          ? productStock
          : maxCartQty != null && maxCartQty > 0
          ? maxCartQty
          : 0;

      if (effectiveStock <= 0) {
        toast.error("This item is out of stock.");
        return;
      }

      // ✅ Ref se latest qty lo — stale Redux value se nahi
      const currentQty = pendingQtyRef.current[productId] ?? cartItem.quantity;
      if (currentQty >= effectiveStock) {
        toast.error(`Only ${effectiveStock} items allowed.`, {
          id: "max-qty-toast",
        });
        return;
      }

      const newQty = currentQty + 1;
      pendingQtyRef.current[productId] = newQty;

      dispatch(
        setIncrementToCartItem({
          ...cartItem,
          quantity: newQty,
          totalPrice: getUpdatedPrice(cartItem, newQty),
          userId,
        }),
      );

      // ✅ No more fetchCartFromApi() — reducer already syncs to backend
      // in the background; this timer only clears the local ref later,
      // it never blocks or delays the visible button UI.
      clearTimeout(syncTimersRef.current[productId]);
      syncTimersRef.current[productId] = setTimeout(() => {
        delete pendingQtyRef.current[productId];
      }, 1200);
    },
    [dispatch],
  );

  /* ================= DECREMENT ================= */
  const handleDecrement = useCallback(
    (cartItem) => {
      const userId = getUserIdentifier();
      const productId = cartItem.id;

      // ✅ Ref se latest qty lo
      const currentQty = pendingQtyRef.current[productId] ?? cartItem.quantity;
      const newQty = currentQty - 1;

      if (newQty <= 0) {
        delete pendingQtyRef.current[productId];
        clearTimeout(syncTimersRef.current[productId]);
        dispatch(
          setRemoveItemFromCart({
            cartItemKey: cartItem.cartItemKey,
            cartItemId: cartItem.cartItemId,
            userId,
          }),
        );
        toast.success(`${cartItem.name} removed from cart`);
        return;
      }

      pendingQtyRef.current[productId] = newQty;

      dispatch(
        setDecrementToCartItem({
          ...cartItem,
          quantity: newQty,
          totalPrice: getUpdatedPrice(cartItem, newQty),
          userId,
        }),
      );

      // ✅ Same reasoning as increment — no fetchCartFromApi() blocking UI
      clearTimeout(syncTimersRef.current[productId]);
      syncTimersRef.current[productId] = setTimeout(() => {
        delete pendingQtyRef.current[productId];
      }, 1200);
    },
    [dispatch],
  );

  /* ================= RENDER ADD BUTTON ================= */
  const renderAddButton = (item) => {
    const cartItem = getCartItemByProductId(item.id);

    // ✅ variation first, product fallback, maxCartQty sirf dono nahi hone pe
    const selectedVar = item?.variations?.[0] ?? null;
    const variationStock = selectedVar?.stock;
    const productStock = item?.stock;
    const maxCartQty = item?.maximum_cart_quantity;
    const effectiveStock =
      variationStock != null && variationStock > 0
        ? variationStock
        : productStock != null && productStock > 0
        ? productStock
        : maxCartQty != null && maxCartQty > 0
        ? maxCartQty
        : 0;

    const isOutOfStock = effectiveStock <= 0;

    // ✅ Display qty from ref — glitch-free rapid clicks
    const displayQty = cartItem
      ? pendingQtyRef.current[item.id] ?? cartItem.quantity
      : 0;

    const isMaxReached = cartItem ? displayQty >= effectiveStock : false;
    const buttonWidth = "70px";

    // ✅ Out of stock button
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
            color: "var(--danger) !important",
            border: "1.8px solid var(--danger) !important",
            padding: "5px 0px",
            opacity: 0.7,
          }}
        >
          Out of Stock
        </Button>
      );
    }

    // ✅ Not in cart
    if (!cartItem) {
      return (
        <Button
          variant="outlined"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart(item);
          }}
          sx={{
            borderRadius: "8px",
            fontSize: "12px",
            width: buttonWidth,
            color: "var(--pharmacy-cta-green)",
            border: "1.8px solid var(--pharmacy-cta-green)",
            padding: "5px",
          }}
        >
          ADD
        </Button>
      );
    }

    // ✅ In cart — increment / decrement
    return (
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: buttonWidth,
          height: "32px",
          border: "1.8px solid var(--pharmacy-cta-green)",
          borderRadius: "6px",
        }}
      >
        <Box
          onClick={(e) => {
            e.stopPropagation();
            handleDecrement(cartItem);
          }}
          sx={{
            width: "20px",
            height: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--qty-btn-bg)",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          <Typography sx={{ fontSize: "14px", color: "var(--text-strong)" }}>
            −
          </Typography>
        </Box>

        {/* ✅ displayQty — ref se, Redux re-render ka wait nahi */}
        <Typography
          fontWeight={600}
          sx={{ fontSize: "14px", color: "var(--text-strong)" }}
        >
          {displayQty}
        </Typography>

        <Box
          onClick={(e) => {
            e.stopPropagation();
            if (!isMaxReached) handleIncrement(cartItem);
            else
              toast.error(`Only ${effectiveStock} items allowed.`, {
                id: "max-qty",
              });
          }}
          sx={{
            width: "20px",
            height: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isMaxReached
              ? "var(--qty-btn-bg-disabled)"
              : "var(--qty-btn-bg)",
            borderRadius: "4px",
            cursor: isMaxReached ? "not-allowed" : "pointer",
            opacity: isMaxReached ? 0.5 : 1,
          }}
        >
          <Typography
            sx={{
              fontSize: "14px",
              color: isMaxReached ? "var(--text-disabled)" : "var(--text-strong)",
            }}
          >
            +
          </Typography>
        </Box>
      </Box>
    );
  };

  /* ================= RENDER ================= */
  return (
    <div className={`${styles.pharmacyThemeVars} ${styles["pharmacy-module-root"]}`}>
      <CustomContainer>
        <Toaster position="top-center" />

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
              color: "var(--text-strong)",
              whiteSpace: "nowrap",
            }}
          >
            Pharmacy & Wellness
          </Typography>
          <Link
            component="button"
            onClick={() => router.push("/home?module=pharmacy")}
            underline="none"
            sx={{
              color: "var(--pharmacy-brand-green)",
              fontWeight: 500,
              background: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              whiteSpace: "nowrap",
              ml: isMobile ? "10px" : "0",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            View All
            <ArrowForwardIcon sx={{ fontSize: { xs: "1.1rem", sm: "1rem" } }} />
          </Link>
        </Box>

        <Grid container spacing={2.2}>
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Grid item xs={6} sm={4} md={2.4} key={i}>
                <Skeleton height={220} sx={{ borderRadius: "10px" }} />
              </Grid>
            ))
          ) : !products.length ? (
            // ✅ EMPTY STATE (FULL WIDTH)
            <Grid item xs={12}>
              <EmptyState text="No Medicines Found" />
            </Grid>
          ) : (
            products.map((item) => {
              const variation = item?.variations?.[0];
              const unitLabel = variation?.type || "Default Label";
              const unitType = item?.unit?.unit || "Unit";
              const discountedPrice =
                item.price - (item.price * item.discount) / 100;

              const limitByChars = (text, max = 15) => {
                if (!text) return "";
                return text.length > max ? text.slice(0, max) + "..." : text;
              };

              return (
                <Grid item xs={6} sm={4} md={2.4} key={item.id}>
                  <Box
                    sx={{
                      p: "12px 8px",
                      border: "1px solid var(--border-default)",
                      borderRadius: "12px",
                      backgroundColor: "var(--bg-card)",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                    }}
                    onClick={() => {
                      setSelectedProduct(item);
                      setOpenModal(true);
                    }}
                  >
                    <Box sx={{ position: "relative", mb: 1.5 }}>
                      {item.discount > 0 && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: -12,
                            left: 0,
                            background: "var(--pharmacy-brand-green)",
                            color: "var(--text-on-brand)",
                            fontWeight: 700,
                            fontSize: "0.55rem",
                            padding: "6px 4px",
                            width: "38px",
                            height: "45px",
                            textAlign: "center",
                            whiteSpace: "nowrap",
                            clipPath:
                              "polygon(0 0,100% 0,100% 85%,90% 100%,80% 85%,70% 100%,60% 85%,50% 100%,40% 85%,30% 100%,20% 85%,10% 100%,0 85%)",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                            zIndex: 2,
                          }}
                        >
                          {item.discount}%<br /> OFF
                        </Box>
                      )}

                      <CustomImageContainer
                        src={item.image_full_url || item.image}
                        alt={item.name}
                        title={item.name}
                        height="160px"
                        width="100%"
                        objectFit="contain"
                        borderRadius="8px"
                      />

                      <Box
                        sx={{
                          position: "absolute",
                          top: -6,
                          right: -5,
                          width: 24,
                          height: 24,
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          zIndex: 5,
                          transition: "all 0.2s ease",
                          "&:hover": { transform: "scale(1.05)" },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isWishlisted(item)) removeFromWishlist(item, e);
                          else addToWishlist(item, e);
                        }}
                      >
                        {isWishlisted(item) ? (
                          <FavoriteIcon
                            sx={{ color: "var(--danger)", fontSize: 20 }}
                          />
                        ) : (
                          <FavoriteBorderIcon
                            sx={{ color: "var(--wishlist-inactive)", fontSize: 20 }}
                          />
                        )}
                      </Box>
                    </Box>

                    <Typography
                      sx={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 600,
                        fontSize: isMobile ? "14px" : "16px",
                        color: "var(--text-strong)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {limitByChars(item.name || "Unnamed Product", 15)}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 500,
                        fontSize: isMobile ? "10px" : "12px",
                        color: "var(--text-muted)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {unitLabel}
                      {unitType}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mt: 0.8,
                        pb: 0.5,
                      }}
                    >
                      <Box sx={{ alignItems: "center", gap: 0.6 }}>
                        <Typography
                          sx={{
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 600,
                            fontSize: isMobile ? "14px" : "16px",
                            color: "var(--pharmacy-brand-green)",
                          }}
                        >
                          ₹
                          {discountedPrice % 1 === 0
                            ? Math.floor(discountedPrice)
                            : discountedPrice.toFixed(2)}
                        </Typography>
                        {item.discount > 0 && (
                          <Typography
                            sx={{
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 500,
                              fontSize: isMobile ? "12px" : "14px",
                              color: "var(--text-muted)",
                              textDecoration: "line-through",
                            }}
                          >
                            ₹{item.price}
                          </Typography>
                        )}
                      </Box>

                      {/* ✅ renderAddButton handles out of stock internally */}
                      {renderAddButton(item)}
                    </Box>
                  </Box>
                </Grid>
              );
            })
          )}
        </Grid>

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
              backgroundColor: "var(--bg-card)",
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
                backgroundColor: "var(--warning-soft-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
                border: "2px solid var(--warning-soft-border)",
              }}
            >
              <Typography sx={{ fontSize: { xs: 24, sm: 28 } }}>🛒</Typography>
            </Box>

            <Typography
              sx={{
                fontWeight: 700,
                fontSize: { xs: "17px", sm: "19px" },
                color: "var(--text-primary)",
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
                color: "var(--dialog-subtitle)",
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
                backgroundColor: "var(--info-bg)",
                border: "1px solid var(--info-border)",
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
                  color: "var(--info-text)",
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
                borderTop: "1px dashed var(--border-dashed)",
              }}
            />

            <Typography
              sx={{
                fontSize: { xs: "13px", sm: "14px" },
                color: "var(--dialog-body)",
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
                border: "1.5px solid var(--cancel-border)",
                color: "var(--cancel-text)",
                backgroundColor: "var(--cancel-bg)",
                order: { xs: 2, sm: 1 },
                "&:hover": {
                  backgroundColor: "var(--cancel-hover-bg)",
                  borderColor: "var(--cancel-hover-border)",
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
                backgroundColor: "var(--pharmacy-cta-green)",
                color: "var(--text-on-brand)",
                order: { xs: 1, sm: 2 },
                boxShadow: "0 4px 14px var(--pharmacy-cta-shadow)",
                "&:hover": {
                  backgroundColor: "var(--pharmacy-cta-green-hover)",
                  boxShadow: "0 4px 18px var(--pharmacy-cta-shadow-hover)",
                },
                "&.Mui-disabled": {
                  backgroundColor: "var(--pharmacy-cta-green-disabled)",
                  color: "var(--text-on-brand)",
                },
              }}
            >
              {storeSwitchLoading ? "Clearing..." : "Yes, Clear"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Variation Modal */}
        {variationModalOpen && variationProduct && (
          <Dialog
            open={variationModalOpen}
            onClose={() => setVariationModalOpen(false)}
            fullWidth
            maxWidth="xs"
            sx={{
              width: "450px",
              margin: "auto",
              "& .MuiPaper-root": { borderRadius: "12px !important" },
            }}
          >
            <DialogContent
              dividers
              sx={{
                borderRadius: "12px !important",
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-variation)",
              }}
            >
              <DialogTitle sx={{ paddingTop: 0, color: "var(--text-strong)" }}>
                Select Variations
              </DialogTitle>
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
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1.5,
                      p: 1,
                      borderRadius: 1,
                      border: "1px dashed var(--border-default)",
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Box
                        component="img"
                        src={variationProduct.image_full_url}
                        alt={variation.type}
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 1,
                          objectFit: "cover",
                        }}
                      />
                      <Box>
                        <Typography
                          fontWeight={600}
                          sx={{ color: "var(--text-strong)" }}
                        >
                          {variation.type} {variationProduct.unit_type}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography
                            fontWeight={600}
                            sx={{ color: "var(--text-strong)" }}
                          >
                            ₹{discountedPrice}
                          </Typography>
                          {discount > 0 && (
                            <Typography
                              sx={{
                                textDecoration: "line-through",
                                color: "var(--text-faint)",
                                fontSize: "13px",
                              }}
                            >
                              ₹{originalPrice}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        color: "var(--pharmacy-brand-green)",
                        fontWeight: 600,
                        px: 2,
                        borderColor: "var(--pharmacy-brand-green)",
                        "&:hover": { borderColor: "var(--pharmacy-brand-green)" },
                      }}
                      onClick={() => {
                        setVariationModalOpen(false);
                        handleAddToCart(variationProduct, variation);
                      }}
                    >
                      ADD
                    </Button>
                  </Box>
                );
              })}
            </DialogContent>
          </Dialog>
        )}

        {selectedProduct && (
          <Perticular
            open={openModal}
            onClose={() => setOpenModal(false)}
            product={selectedProduct}
            isWishlisted={false}
            addToWishlist={() => {}}
            removeFromWishlist={() => {}}
          />
        )}
      </CustomContainer>
    </div>
  );
};

export default PharmacySession;