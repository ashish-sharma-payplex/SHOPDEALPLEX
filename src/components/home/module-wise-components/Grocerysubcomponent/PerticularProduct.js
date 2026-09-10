"use client";

import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import useWishlistHandler from "components/home/search/pathflow/wishlisthandler";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Button,
  Rating,
  Chip,
  Grid,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { toast } from "react-hot-toast";
import Lottie from "lottie-react";
import cartLoader from "../../../../../public/cart-loop.json";

import {
  setIncrementToCartItem,
  setDecrementToCartItem,
  fetchCartFromApi,
  setBuyNowItemList,
  addOptimisticCartItem,
  patchCartItemId,
  removeOptimisticCartItem,
} from "redux/slices/cart";
import { getItemDataForAddToCart } from "components/product-details/product-details-section/helperFunction";
import useAddCartItem from "api-manage/hooks/react-query/add-cart/useAddCartItem";
import { getGuestId } from "helper-functions/getToken";
import { getCorrectCart } from "helper-functions/getCorrectCart";

const getUserIdentifier = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? token : getGuestId();
};

const Perticular = ({ open, onClose, product }) => {
  const { t } = useTranslation();
  const { addToWishlist, removeFromWishlist, isWishlisted } =
    useWishlistHandler(t);
  const dispatch = useDispatch();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const thumbnailRef = useRef(null);
  const isAutoScrolling = useRef(false);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  const getDefaultVariation = (prod) => {
    if (!prod) return null;
    if (prod.variation?.length > 0) return prod.variation[0];
    if (prod.variations?.length > 0) return prod.variations[0];
    return null;
  };

  const [currentVariation, setCurrentVariation] = useState(() =>
    getDefaultVariation(product),
  );
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [openReviews, setOpenReviews] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const cartList = useSelector((state) => getCorrectCart(state));
  const addCartMutation = useAddCartItem();

  const mainImage = product?.image_full_url;
  const galleryImages = [mainImage, ...(product?.images_full_url || [])];

  useEffect(() => {
    const container = thumbnailRef.current;

    if (!container || !open || galleryImages.length <= 4) return;

    const interval = setInterval(() => {
      // ❌ agar user interact kar raha hai to auto scroll band
      if (isUserInteracting) return;

      isAutoScrolling.current = true;

      if (
        container.scrollLeft + container.offsetWidth >=
        container.scrollWidth - 10
      ) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        const itemWidth = container.firstChild?.offsetWidth || 80;
        container.scrollBy({ left: itemWidth + 8, behavior: "smooth" });
      }

      setTimeout(() => {
        isAutoScrolling.current = false;
      }, 600);
    }, 2000); // smooth timing

    return () => clearInterval(interval);
  }, [open, galleryImages.length, isUserInteracting]);

  useEffect(() => {
    if (open && product) {
      const defaultVar = getDefaultVariation(product);
      setCurrentVariation(defaultVar);
      setQuantity(1);
      setCurrentImageIndex(0);
    }
  }, [open, product]);

  useEffect(() => {
    if (open && product?.id) fetchReviews(product.id);
  }, [open, product?.id]);

  const cartItem = cartList.find(
    (item) =>
      Number(item.id) === Number(product?.id) &&
      String(item.variation?.[0]?.type) === String(currentVariation?.type),
  );

  useEffect(() => {
    if (open && cartItem?.quantity != null) {
      setQuantity(cartItem.quantity);
    }
  }, [open, cartItem?.quantity]);

  let scrollTimeout;

  const handleUserScroll = () => {
    if (isAutoScrolling.current) return;

    if (scrollTimeout) clearTimeout(scrollTimeout);

    setIsUserInteracting(true);

    // ✅ 2 sec baad auto scroll resume
    scrollTimeout = setTimeout(() => {
      setIsUserInteracting(false);
    }, 2000);
  };

  const getDiscountedPrice = (variation, qty) => {
    if (!variation?.price) return 0;
    const base = variation.price * qty;
    return base - (base * (product?.discount || 0)) / 100;
  };

  const getOriginalPrice = (variation, qty) => {
    if (!variation?.price) return 0;
    return variation.price * qty;
  };

  const handleVariationSelect = (variation) => {
    if (variation.stock <= 0) return;
    setCurrentVariation(variation);
    setQuantity(1);
  };

  const maxAllowedQty = () => {
    const variationStock = currentVariation?.stock;
    const productStock = product?.stock;
    const maxCartQty = product?.maximum_cart_quantity;
    if (variationStock != null && variationStock > 0) return variationStock;
    if (productStock != null && productStock > 0) return productStock;
    if (maxCartQty != null && maxCartQty > 0) return maxCartQty;
    return 0;
  };

  const getEffectiveStock = () => {
    const variationStock = currentVariation?.stock;
    const productStock = product?.stock;
    const maxCartQty = product?.maximum_cart_quantity;
    if (variationStock != null && variationStock > 0) return variationStock;
    if (productStock != null && productStock > 0) return productStock;
    if (maxCartQty != null && maxCartQty > 0) return maxCartQty;
    return 0;
  };

  // ✅ Increment/Decrement inside the modal — instant local update,
  // reducer already syncs to backend in the background (no fetchCartFromApi wait)
  const handleIncrement = () => {
    const effectiveStock = getEffectiveStock();
    const cartLimit = product?.maximum_cart_quantity ?? Infinity;
    const max = Math.min(effectiveStock, cartLimit);
    if (effectiveStock <= 0) {
      toast.error("This item is out of stock.", { id: "oos-toast" });
      return;
    }
    if (quantity >= max) {
      toast.error(`Max ${max} items allowed.`, { id: "max-qty-toast" });
      return;
    }
    const newQty = quantity + 1;
    setQuantity(newQty);
    syncCartQuantity(newQty);
  };

  const handleDecrement = () => {
    if (quantity <= 1) return;
    const newQty = quantity - 1;
    setQuantity(newQty);
    syncCartQuantity(newQty);
  };

  const syncCartQuantity = (newQty) => {
    if (!cartItem) return;
    const userId = getUserIdentifier();
    dispatch(
      setIncrementToCartItem({
        ...cartItem,
        quantity: newQty,
        totalPrice: getDiscountedPrice(currentVariation, newQty),
        userId,
      }),
    );
    // ✅ no fetchCartFromApi() here — reducer already fires the update API
    // call in the background; the modal's own state is already correct.
  };

  // ✅ ADD TO CART — now optimistic. UI updates instantly, API call
  // (or quantity-update call for existing items) happens in the background.
  const handleAddToCart = () => {
    if (loading) return;
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      toast.error("Please log in to continue.");
      return;
    }
    const effectiveStock = getEffectiveStock();
    const cartLimit = product?.maximum_cart_quantity ?? Infinity;
    const maxQty = Math.min(effectiveStock, cartLimit);
    if (effectiveStock <= 0) {
      toast.error("This item is out of stock.");
      return;
    }
    const existingQty = cartItem?.quantity ?? 0;
    const totalQtyAfterAdd = existingQty + quantity;
    if (totalQtyAfterAdd > maxQty) {
      toast.error(
        `Only ${maxQty} items allowed. You already have ${existingQty} in cart.`,
      );
      return;
    }
    const zoneId = getValidZoneId();
    if (
      !zoneId ||
      (Array.isArray(zoneId) && zoneId.length === 1 && zoneId[0] === 0)
    ) {
      toast.error("Service is not available in your current zone");
      return;
    }
    const userId = getUserIdentifier();

    if (cartItem) {
      // Item already in cart with this variation — just bump quantity,
      // local update + background sync, no fetch/wait.
      const newQty = cartItem.quantity + quantity;
      dispatch(
        setIncrementToCartItem({
          ...cartItem,
          quantity: newQty,
          totalPrice: getDiscountedPrice(currentVariation, newQty),
          userId,
        }),
      );
      toast.success(`${product.name} quantity updated in cart`);
      return;
    }

    // New item → optimistic add
    const variationArr = currentVariation ? [currentVariation] : [];
    const cartItemKey = `${product.id}-${JSON.stringify(variationArr)}`;
    const tempCartItemId = `temp-${Date.now()}`;
    const finalPrice = currentVariation?.price ?? product.price;

    // 🚀 STEP 1: instant UI update
    dispatch(
      addOptimisticCartItem({
        cartItemKey,
        cartItemId: tempCartItemId,
        id: product.id,
        name: product.name,
        image_full_url: product.image_full_url || product.image,
        quantity,
        price: finalPrice,
        totalPrice: getDiscountedPrice(currentVariation, quantity),
        variation: variationArr,
        selectedOption: variationArr,
        food_variations: variationArr,
        module_type: product.module_type,
        stock: product.stock,
        maximum_cart_quantity: product.maximum_cart_quantity,
        product,
      }),
    );
    toast.success(`${product.name} added to cart`);

    const payload = getItemDataForAddToCart(
      product,
      quantity,
      currentVariation?.price,
      userId,
    );
    payload.variation = variationArr;
    payload.totalPrice = getDiscountedPrice(currentVariation, quantity);

    // 🚀 STEP 2: background API sync — no blocking, no fetchCartFromApi
    addCartMutation.mutate(payload, {
      onSuccess: (response) => {
        if (response?.id) {
          dispatch(patchCartItemId({ cartItemKey, cartItemId: response.id }));
        }
      },
      onError: () => {
        dispatch(removeOptimisticCartItem({ cartItemKey })); // rollback
        toast.error("Item add nahi ho paya, dobara try karo");
      },
    });
  };

  const handleUpdateCartClose = () => {
    toast.success("Cart updated");
    onClose();
  };

  const handleBuyNow = () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      toast.error("Please log in to continue.");
      return;
    }

    const zoneId = getValidZoneId();
    if (
      !zoneId ||
      (Array.isArray(zoneId) && zoneId.length === 1 && zoneId[0] === 0)
    ) {
      toast.error("Service is not available in your current zone");
      return;
    }

    const effectiveStock = getEffectiveStock();
    if (effectiveStock <= 0) {
      toast.error("This item is out of stock.");
      return;
    }

    // ✅ product ko NESTED rakho - ItemCheckout yahi expect karta hai
    const buyNowItem = {
      // ── Top level fields (normalizeCartList ke liye) ──
      id: product?.id,
      store_id: product?.store_id,
      price: currentVariation?.price ?? product?.price,
      quantity: quantity,
      totalPrice: getDiscountedPrice(currentVariation, quantity),
      module_type: product?.module_type ?? "ecommerce",

      // ── Variation ──
      selectedOption: currentVariation ? [currentVariation] : [],
      variation: currentVariation ? [currentVariation] : [],
      food_variations: [],
      selectedAddons: [],

      // ✅ NESTED product object - finalCheckoutCartList yahi use karta hai
      product: {
        ...product,
        name: product?.name,
        image_full_url: product?.image_full_url,
        store_id: product?.store_id,
        addons: product?.addons ?? [],
      },
    };

    dispatch(setBuyNowItemList(buyNowItem));
    router.push("/checkout?page=buy_now");
  };

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

  const fetchReviews = async (productId) => {
    try {
      const res = await fetch(
        `https://dealplex.in/api/v1/items/reviews/${productId}?offset=1&limit=100`,
        { method: "GET", headers: { moduleId: "2" } },
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data?.reviews) {
        setReviews(data.reviews);
        setReviewCount(data.total_size || 0);
        const total = data.reviews.reduce((acc, r) => acc + r.rating, 0);
        setAverageRating(
          data.reviews.length > 0 ? total / data.reviews.length : 0,
        );
      }
    } catch (e) {
      console.error("Reviews error:", e);
    }
  };

  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const descriptionRef = useRef(null);
  useEffect(() => {
    if (descriptionRef.current) {
      setIsTruncated(
        descriptionRef.current.scrollHeight >
          descriptionRef.current.clientHeight,
      );
    }
  }, [product?.description]);

  const nextImage = () =>
    setCurrentImageIndex((p) => (p + 1) % galleryImages.length);
  const prevImage = () =>
    setCurrentImageIndex(
      (p) => (p - 1 + galleryImages.length) % galleryImages.length,
    );

  if (!product) return null;

  // ─── Derived values ──────────────────────────────────────────────────────────
  const effectiveStock = getEffectiveStock();
  const isInStock = effectiveStock > 0;
  const discountedPrice = getDiscountedPrice(currentVariation, quantity);
  const originalPrice = getOriginalPrice(currentVariation, quantity);
  const isMaxQtyReached = quantity >= maxAllowedQty();

  // ─── Stock display logic ─────────────────────────────────────────────────────
  // Rule 1: maximum_cart_quantity has a valid value (not null / 0) → show it
  // Rule 2: max_cart_qty null/0 but variations exist → show currentVariation.stock
  // Rule 3: both null/0 → show 0  (isInStock=false → "Out of Stock" button shown)
  const maxCartQty = product?.maximum_cart_quantity;
  const displayStock = (() => {
    if (maxCartQty != null && maxCartQty > 0) return maxCartQty; // Rule 1
    if (product?.variations?.length > 0) return currentVariation?.stock ?? 0; // Rule 2
    return 0; // Rule 3
  })();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      sx={{
        "& .MuiDialog-paper": {
          backgroundColor: "var(--bg-card)",
          color: "var(--text-primary)",
          borderRadius: { xs: 0, sm: "16px" },
        },
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          top: 0,
          right: 8,
          color: "var(--text-secondary)",
          zIndex: 1,
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ p: { xs: 1.5, sm: 2 }, pt: { xs: 3, sm: 3.6 } }}>
        <Grid container spacing={{ xs: 1, sm: 2 }}>
          {/* ── LEFT: IMAGE ── */}
          <Grid item xs={12} md={6}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              height={{ xs: "auto", md: "360px" }}
            >
              <Box
                sx={{
                  position: "relative",
                  borderRadius: 3,
                  overflow: "hidden",
                  border: "2px solid var(--border-image)",
                  width: { xs: "100%", md: 340 },
                  height: { xs: 220, sm: 280, md: 270 },
                }}
              >
                <img
                  src={galleryImages[currentImageIndex] || mainImage}
                  alt={product.name}
                  title={product.name}
                  style={{
                    objectFit: "cover",
                    width: "100%",
                    height: "100%",
                    borderRadius: "12px",
                    transition: "all 0.6s ease",
                  }}
                />
                <IconButton
                  onClick={prevImage}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: 10,
                    transform: "translateY(-50%)",
                    bgcolor: "var(--grocery-overlay-70)",
                    "&:hover": { bgcolor: "var(--bg-card)" },
                    width: { xs: 28, sm: 30 },
                    height: { xs: 28, sm: 30 },
                  }}
                >
                  <ArrowBackIosNewIcon sx={{ fontSize: { xs: 14, sm: 18 } }} />
                </IconButton>
                <IconButton
                  onClick={nextImage}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    right: 10,
                    transform: "translateY(-50%)",
                    bgcolor: "var(--grocery-overlay-70)",
                    "&:hover": { bgcolor: "var(--bg-card)" },
                    width: { xs: 28, sm: 30 },
                    height: { xs: 28, sm: 30 },
                  }}
                >
                  <ArrowForwardIosIcon sx={{ fontSize: { xs: 14, sm: 18 } }} />
                </IconButton>
                <Box
                  sx={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    cursor: "pointer",
                    zIndex: 5,
                    "&:hover": { transform: "scale(1.1)" },
                    transition: "all 0.2s ease",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    isWishlisted(product)
                      ? removeFromWishlist(product, e)
                      : addToWishlist(product, e);
                  }}
                >
                  {isWishlisted(product) ? (
                    <FavoriteIcon sx={{ color: "var(--danger)", fontSize: 22 }} />
                  ) : (
                    <FavoriteBorderIcon
                      sx={{ color: "var(--wishlist-inactive)", fontSize: 22 }}
                    />
                  )}
                </Box>
              </Box>

              <Box
                ref={thumbnailRef}
                onScroll={handleUserScroll}
                sx={{
                  display: "flex",
                  gap: 1,
                  mt: 1.5,
                  overflowX: "auto",
                  width: { xs: "100%", sm: 340 },
                  scrollBehavior: "smooth",
                  "&::-webkit-scrollbar": { display: "none" },
                }}
              >
                {galleryImages.map((img, idx) => (
                  <Box
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    sx={{
                      flex: "0 0 calc(25% - 6px)",
                      maxWidth: "calc(25% - 6px)",
                      height: { xs: 52, sm: 70 },
                      border:
                        idx === currentImageIndex
                          ? "2px solid var(--brand-green)"
                          : "1px solid var(--grocery-border-lightgray)",
                      borderRadius: 2,
                      overflow: "hidden",
                      cursor: "pointer",
                    }}
                  >
                    <img
                      src={img}
                      alt={product.name}
                      title={product.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* ── RIGHT: DETAILS ── */}
          <Grid item xs={12} md={6}>
            <Box
              display="flex"
              flexDirection="column"
              height="100%"
              maxHeight={{ xs: "none", md: "420px" }}
            >
              <Box
                sx={{
                  flex: 1,
                  overflowY: { xs: "visible", md: "auto" },
                  pr: 0.5,
                }}
              >
                {/* Name + Stock Badge */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: "1rem", sm: "1.2rem" },
                      color: "var(--text-strong)",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      flex: 1,
                    }}
                  >
                    {product.name}
                  </Typography>
                  <Chip
                    label={isInStock ? "In Stock" : "Out of Stock"}
                    color={isInStock ? "success" : "error"}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.7rem",
                      ml: 1,
                      mt: "2px",
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  />
                </Box>

                {/* Net Qty + Rating */}
                <Box
                  display="flex"
                  alignItems="center"
                  flexWrap="wrap"
                  gap={2}
                  sx={{ mt: 1 }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: "var(--text-strong)" }}
                  >
                    Net Qty:{" "}
                    <b>
                      {currentVariation?.type ?? ""} {product?.unit_type ?? ""}
                    </b>
                  </Typography>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Rating
                      value={reviewCount > 0 ? averageRating : 0}
                      size="small"
                      readOnly
                      precision={0.5}
                      sx={{
                        "& .MuiRating-iconEmpty": {
                          color: "var(--grocery-star-gold)",
                          opacity: 0.4,
                        },
                      }}
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        cursor: "pointer",
                        fontSize: { xs: "0.7rem", sm: "0.875rem" },
                      }}
                      onClick={() => setOpenReviews(true)}
                    >
                      {reviewCount} Reviews
                    </Typography>
                  </Box>
                </Box>

                {/* Price */}
                <Box
                  display="flex"
                  alignItems="center"
                  flexWrap="wrap"
                  gap={0.5}
                  sx={{ mt: 0.5 }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "var(--brand-green)",
                      fontSize: { xs: "1rem", sm: "1.25rem" },
                    }}
                  >
                    ₹{discountedPrice.toFixed(2)}
                  </Typography>
                  {(product?.discount ?? 0) > 0 && (
                    <>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ textDecoration: "line-through", ml: 1 }}
                      >
                        ₹{originalPrice.toFixed(2)}
                      </Typography>
                      <Chip
                        label={`${product.discount}% Off`}
                        size="small"
                        sx={{
                          bgcolor: "var(--grocery-discount-bg) !important",
                          color: "var(--grocery-discount-text)",
                          ml: 1,
                          fontWeight: 600,
                        }}
                      />
                    </>
                  )}
                </Box>

                {/* Description */}
                <div>
                  <Typography
                    ref={descriptionRef}
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 1,
                      lineHeight: 1.5,
                      display: "-webkit-box",
                      WebkitLineClamp: expanded ? "unset" : 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    }}
                  >
                    {product.description}
                  </Typography>
                  {isTruncated && (
                    <Button
                      onClick={() => setExpanded(!expanded)}
                      sx={{
                        p: 0,
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        textTransform: "none",
                      }}
                    >
                      {expanded ? "show less" : "show more"}
                    </Button>
                  )}
                </div>

                {/* Quantity Counter */}
                <Box sx={{ mt: 1.5 }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 0.5 }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: "var(--text-strong)",
                        fontSize: { xs: "0.85rem", sm: "1rem" },
                      }}
                    >
                      Quantity
                    </Typography>

                    {/* ── Stock display — 3 rules applied ── */}
                    <Typography variant="caption" sx={{ color: "var(--text-muted)" }}>
                      Stock:{" "}
                      <b
                        style={{
                          color:
                            displayStock > 10
                              ? "var(--brand-green)"
                              : "var(--danger)",
                        }}
                      >
                        {displayStock}
                      </b>
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <Button
                      onClick={handleDecrement}
                      disabled={quantity <= 1}
                      sx={{
                        minWidth: { xs: 30, sm: 34 },
                        height: { xs: 30, sm: 34 },
                        borderRadius: "50%",
                        border: "1.5px solid var(--brand-green)",
                        color: "var(--brand-green)",
                        fontSize: "20px",
                        fontWeight: 700,
                        p: 0,
                        "&:hover": { backgroundColor: "var(--brand-green-soft)" },
                        "&.Mui-disabled": {
                          borderColor: "var(--grocery-border-lightgray)",
                          color: "var(--text-disabled)",
                        },
                      }}
                    >
                      −
                    </Button>
                    <Typography
                      sx={{
                        minWidth: 28,
                        textAlign: "center",
                        fontWeight: 700,
                        fontSize: "16px",
                        color: "var(--text-strong)",
                      }}
                    >
                      {quantity}
                    </Typography>
                    <Button
                      onClick={handleIncrement}
                      disabled={isMaxQtyReached}
                      sx={{
                        minWidth: { xs: 30, sm: 34 },
                        height: { xs: 30, sm: 34 },
                        borderRadius: "50%",
                        border: "1.5px solid var(--brand-green)",
                        color: "var(--brand-green)",
                        fontSize: "20px",
                        fontWeight: 700,
                        p: 0,
                        "&:hover": { backgroundColor: "var(--brand-green-soft)" },
                        "&.Mui-disabled": {
                          borderColor: "var(--grocery-border-lightgray)",
                          color: "var(--text-disabled)",
                        },
                      }}
                    >
                      +
                    </Button>
                  </Box>
                </Box>

                {/* Variation Buttons */}
                {product?.variations?.length > 0 && (
                  <Box sx={{ mt: 1.5 }}>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        mb: 0.8,
                        fontSize: "0.9rem",
                        color: "var(--text-strong)",
                      }}
                    >
                      {product?.choice_options?.[0]?.title
                        ? product.choice_options[0].title
                            .charAt(0)
                            .toUpperCase() +
                          product.choice_options[0].title.slice(1)
                        : "Weight / Size"}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: { xs: 0.6, sm: 1 },
                      }}
                    >
                      {product.variations.map((variation) => {
                        const isSelected =
                          currentVariation?.type === variation.type;
                        const isOOS = variation.stock <= 0;
                        return (
                          <Button
                            key={variation.type}
                            onClick={() => handleVariationSelect(variation)}
                            disabled={isOOS}
                            sx={{
                              px: { xs: 1.2, sm: 2 },
                              py: 0.5,
                              borderRadius: "6px",
                              fontWeight: 600,
                              fontSize: { xs: "12px", sm: "14px" },
                              textTransform: "none",
                              border: "1.5px solid",
                              borderColor: isSelected
                                ? "var(--brand-green)"
                                : isOOS
                                ? "var(--border-subtle)"
                                : "var(--grocery-border-mint)",
                              color: isSelected
                                ? "var(--grocery-text-on-brand)"
                                : isOOS
                                ? "var(--text-disabled)"
                                : "var(--brand-green)",
                              backgroundColor: isSelected
                                ? "var(--brand-green)"
                                : isOOS
                                ? "var(--bg-muted)"
                                : "var(--bg-card)",
                              minWidth: 0,
                              flexDirection: "column",
                              "&:hover": {
                                backgroundColor: isSelected
                                  ? "var(--brand-green-hover)"
                                  : isOOS
                                  ? "var(--bg-muted)"
                                  : "var(--brand-green-soft)",
                                borderColor: isOOS
                                  ? "var(--border-subtle)"
                                  : "var(--brand-green)",
                              },
                              "&.Mui-disabled": {
                                color: "var(--text-disabled)",
                                borderColor: "var(--border-subtle)",
                                backgroundColor: "var(--bg-muted)",
                              },
                            }}
                          >
                            {variation.type} {product?.unit_type ?? ""}
                            {isOOS && (
                              <Typography
                                component="span"
                                sx={{
                                  fontSize: "9px",
                                  color: "var(--danger)",
                                  lineHeight: 1,
                                  display: "block",
                                }}
                              >
                                Out of stock
                              </Typography>
                            )}
                          </Button>
                        );
                      })}
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Bottom Buttons */}
              <Box
                display="flex"
                gap={2}
                sx={{
                  mt: 2,
                  pt: 1.5,
                  borderTop: "1px solid var(--border-subtle)",
                  flexShrink: 0,
                  position: { xs: "sticky", md: "relative" },
                  bottom: 0,
                  // backgroundColor: "var(--bg-card)",
                  pb: { xs: 1, md: 0 },
                }}
              >
                {isInStock ? (
                  <>
                    {!cartItem && (
                      <Button
                        variant="outlined"
                        onClick={handleBuyNow}
                        // disabled={buyNowLoading}
                        sx={{
                          fontWeight: 600,
                          flex: 1,
                          py: { xs: 1, sm: 1.2 },
                          fontSize: { xs: "0.8rem", sm: "0.875rem" },
                          // 🔒 fixed brand CTA green — does NOT change with theme
                          color: "#188444",
                          borderColor: "#188444",
                          whiteSpace: "nowrap",
                          "&:hover": {
                            backgroundColor: "transparent",
                            borderColor: "#166d39",
                            color: "#166d39",
                          },
                        }}
                      >
                        Buy Now
                      </Button>
                    )}
                    <Button
                      variant="contained"
                      onClick={
                        cartItem ? handleUpdateCartClose : handleAddToCart
                      }
                      sx={{
                        fontWeight: 600,
                        flex: 1,
                        py: { xs: 1, sm: 1.2 },
                        fontSize: { xs: "0.8rem", sm: "0.875rem" },
                        // 🔒 fixed brand CTA green — does NOT change with theme
                        color: "white",
                        backgroundColor: "#188444",
                        whiteSpace: "nowrap",
                        "&:hover": { backgroundColor: "#166d39" },
                      }}
                    >
                      {cartItem ? "Update Cart" : "Add to Cart"}
                    </Button>
                  </>
                ) : (
                  // Rule 3: both max_cart_qty and variation stock are 0/null → Out of Stock button
                  <Button
                    variant="contained"
                    disabled
                    fullWidth
                    sx={{ fontWeight: 600, py: 1.2 }}
                  >
                    Out of Stock
                  </Button>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      {/* Reviews Dialog */}
      <Dialog
        open={openReviews}
        onClose={() => setOpenReviews(false)}
        maxWidth="xs"
        fullWidth
        fullScreen={isMobile}
        sx={{
          "& .MuiDialog-paper": {
            backgroundColor: "var(--bg-card)",
            color: "var(--text-primary)",
            borderRadius: { xs: 0, sm: "16px !important" },
          },
        }}
      >
        <Box
          sx={{
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <Typography
            sx={{ fontWeight: "bold", fontSize: { xs: "0.9rem", sm: "1rem" } }}
          >
            {product?.name} Reviews
          </Typography>
          <IconButton onClick={() => setOpenReviews(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent sx={{ padding: "12px 16px" }}>
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <Box
                key={index}
                sx={{
                  mb: 2,
                  p: 2,
                  borderRadius: "10px",
                  backgroundColor: "var(--bg-card)",
                  boxShadow: "var(--shadow-review)",
                }}
              >
                <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      backgroundColor: "var(--grocery-blue-info)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      mr: 1,
                    }}
                  >
                    {review.customer?.f_name?.[0]?.toUpperCase() ?? "U"}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                      {review.customer?.f_name ?? "Unknown User"}
                    </Typography>
                    <Typography sx={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      {new Date(review.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Rating
                    value={review.rating}
                    readOnly
                    size="small"
                    precision={0.5}
                  />
                </Box>
                <Typography sx={{ fontSize: "0.85rem", color: "var(--grocery-text-body)" }}>
                  {review.comment}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ textAlign: "center", mt: 4 }}
            >
              No reviews available.
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default Perticular;