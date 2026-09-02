"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Box,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import useWishlistHandler from "./wishlisthandler";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { CircularProgress } from "@mui/material";

import { useTranslation } from 'react-i18next';

/* ===== CART ===== */
import {
  setIncrementToCartItem,
  setDecrementToCartItem,
  setRemoveItemFromCart,
  fetchCartFromApi,
  setCartList,
} from "redux/slices/cart";
import { getCorrectCart } from "helper-functions/getCorrectCart";

/* ===== HELPERS ===== */
import { getGuestId } from "helper-functions/getToken";
import { getItemDataForAddToCart } from "../../../product-details/product-details-section/helperFunction";
import useAddCartItem from "../../../../api-manage/hooks/react-query/add-cart/useAddCartItem";
import useDeleteAllCartItem from "../../../../api-manage/hooks/react-query/add-cart/useDeleteAllCartItem";
import { setModalFor, setSignInModalOpen } from "redux/slices/utils";
import StarIcon from '@mui/icons-material/Star';

/* ===== ZONE ===== */
const getValidZoneId = () => {
  try {
    const raw = localStorage.getItem("zoneid");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : null;
  } catch {
    return null;
  }
};

const getUserIdentifier = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? token : getGuestId();
};

const ProductCard = ({ product, onClick, handleProductClick }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const addCartMutation = useAddCartItem();
  const { mutateAsync: deleteAllCartItems } = useDeleteAllCartItem();

  // ✅ Per-variation loading: { index: true/false }
  const [loadingVariations, setLoadingVariations] = useState({});
  // ✅ Card-level ADD button loading (no variations / single variation)
  const [cardLoading, setCardLoading] = useState(false);

  const { isWishlisted, addToWishlist, removeFromWishlist } =
    useWishlistHandler(product);

  const cartList = useSelector((state) => getCorrectCart(state));
  const cartItem = cartList?.find((c) => c.id === product.id);

  const [quantity, setQuantity] = useState(0);
  const [variationModalOpen, setVariationModalOpen] = useState(false);
  const ignoreSyncRef = useRef(false);

  // ✅ Store switch states (GrocerySession.js jaisa hi pattern)
  const [storeSwitchOpen, setStoreSwitchOpen] = useState(false);
  const [storeSwitchLoading, setStoreSwitchLoading] = useState(false);
  // pending action ko store karne ke liye — confirm hone par retry karna hai
  const pendingActionRef = useRef(null); // { type: "card" } ya { type: "variation", variation, index }

  useEffect(() => {
    if (ignoreSyncRef.current) return;
    setQuantity(cartItem?.quantity || 0);
  }, [cartItem]);

  const price = +product.price || 0;
  const discount = +product.discount || 0;
  const finalPrice = discount > 0 ? price - (price * discount) / 100 : price;

  const variation = product?.variations?.[0];
  const unitLabel = variation?.type;
  const unitType = product?.unit?.unit || "Unit";

  const isFoodModule = product.module_id === 5;

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

  const selectedVar = product?.selectedVariation ?? product?.variations?.[0] ?? null;
  const effectiveStock = getEffectiveStock(product, selectedVar);
  const outOfStock = effectiveStock <= 0;

  /* ================= STORE CONFLICT CHECK (GrocerySession.js jaisa hi) ================= */
  const checkStoreConflict = () => {
    const cartStoreId =
      cartList?.[0]?.product?.store_id ?? cartList?.[0]?.store_id ?? null;
    const newProductStoreId =
      product?.store_id ?? product?.store?.id ?? null;

    return (
      cartList?.length > 0 &&
      cartStoreId &&
      newProductStoreId &&
      String(cartStoreId) !== String(newProductStoreId)
    );
  };

  /* ================= CARD-LEVEL ADD (no variations / single variation) ================= */
  const handleAddClick = (e, bypassStoreCheck = false) => {
    e.stopPropagation();

    if (cardLoading) return;

    const token = localStorage.getItem("token");
    const zoneId = getValidZoneId();

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

    // Multiple variations → open modal (no loading needed)
    if (Array.isArray(product?.variations) && product.variations.length > 1) {
      setVariationModalOpen(true);
      return;
    }

    // ✅ STORE VALIDATION — different store hone par confirmation dialog
    if (!bypassStoreCheck && checkStoreConflict()) {
      pendingActionRef.current = { type: "card" };
      setStoreSwitchOpen(true);
      return;
    }

    setCardLoading(true);

    // Single variation → direct add
    if (Array.isArray(product?.variations) && product.variations.length === 1) {
      const singleVariation = product.variations[0];
      const payload = getItemDataForAddToCart(
        { ...product, selectedOption: [singleVariation] },
        1,
        singleVariation.price,
        token || getGuestId()
      );

      addCartMutation.mutate(payload, {
        onSuccess: () => {
          dispatch(fetchCartFromApi());
          toast.success(`${product.name} added to cart`);
          setQuantity(1);
          setCardLoading(false);
        },
        onError: () => {
          toast.error("Failed to add item");
          setCardLoading(false);
        },
      });
      return;
    }

    // No variations → direct add
    const payload = getItemDataForAddToCart(
      product,
      1,
      product.price,
      token || getGuestId()
    );

    addCartMutation.mutate(payload, {
      onSuccess: () => {
        dispatch(fetchCartFromApi());
        toast.success(`${product.name} added to cart`);
        setQuantity(1);
        setCardLoading(false);
      },
      onError: () => {
        toast.error("Failed to add item");
        setCardLoading(false);
      },
    });
  };

  /* ================= VARIATION MODAL ADD (per-variation loading) ================= */
  const handleVariationAdd = (e, variation, index, bypassStoreCheck = false) => {
    e.stopPropagation();

    const token = localStorage.getItem("token");
    const zoneId = getValidZoneId();

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

    // ✅ STORE VALIDATION
    if (!bypassStoreCheck && checkStoreConflict()) {
      pendingActionRef.current = { type: "variation", variation, index };
      setStoreSwitchOpen(true);
      return;
    }

    // ✅ Sirf is variation ka loader on karo
    setLoadingVariations((prev) => ({ ...prev, [index]: true }));

    const payload = getItemDataForAddToCart(
      { ...product, selectedOption: [variation] },
      1,
      variation.price,
      token || getGuestId()
    );

    addCartMutation.mutate(payload, {
      onSuccess: () => {
        dispatch(fetchCartFromApi());
        toast.success(`${product.name} added to cart`);
        setVariationModalOpen(false);
        setLoadingVariations((prev) => ({ ...prev, [index]: false }));
      },
      onError: () => {
        toast.error("Failed to add item");
        setLoadingVariations((prev) => ({ ...prev, [index]: false }));
      },
    });
  };

  /* ================= STORE SWITCH CONFIRM ================= */
  const handleStoreSwitchConfirm = async () => {
    try {
      setStoreSwitchLoading(true);
      const userId = getUserIdentifier();
      await deleteAllCartItems(userId);
      dispatch(setCartList([]));
      setStoreSwitchOpen(false);

      // ✅ jo bhi action pending tha, usko bypass=true karke retry karo
      const pending = pendingActionRef.current;
      if (pending?.type === "card") {
        // Fake event banake pass karo kyunki original event ab available nahi
        handleAddClick({ stopPropagation: () => {} }, true);
      } else if (pending?.type === "variation") {
        handleVariationAdd(
          { stopPropagation: () => {} },
          pending.variation,
          pending.index,
          true
        );
      }
    } catch (error) {
      // console.error("❌ Cart clear failed:", error);
      toast.error("Cart clear nahi hui. Please try again.");
    } finally {
      setStoreSwitchLoading(false);
      pendingActionRef.current = null;
    }
  };

  const handleStoreSwitchCancel = () => {
    setStoreSwitchOpen(false);
    pendingActionRef.current = null;
  };

  /* ================= INCREMENT ================= */
  const handleIncrease = (e) => {
    e.stopPropagation();
    const newQty = quantity + 1;

    if (newQty > effectiveStock) {
      toast.error(`You can only add ${effectiveStock} of this product.`);
      return;
    }

    dispatch(
      setIncrementToCartItem({
        ...cartItem,
        quantity: quantity + 1,
      })
    );
  };

  /* ================= DECREMENT ================= */
  const handleDecrease = (e) => {
    e.stopPropagation();

    if (quantity === 1) {
      ignoreSyncRef.current = true;

      dispatch(
        setRemoveItemFromCart({
          cartItemKey: cartItem.cartItemKey,
          cartItemId: cartItem.cartItemId,
        })
      );

      setQuantity(0);
      toast.success(`${product.name} removed`);

      setTimeout(() => {
        ignoreSyncRef.current = false;
      }, 300);
      return;
    }

    dispatch(
      setDecrementToCartItem({
        ...cartItem,
        quantity: quantity - 1,
      })
    );
  };

  return (
    <>
      <Card
        sx={{
          borderRadius: "12px !important",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          height: 240,
          display: "flex",
          width: 178,
          flexDirection: "column",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
        onClick={onClick}
      >
        <Box sx={{ position: "relative" }}>
          {product?.discount > 0 && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 8,
                background: "green",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.55rem",
                padding: "6px 8px",
                width: "35px",
                textAlign: "center",
                clipPath: `polygon(0 0, 100% 0, 100% 85%, 90% 100%, 80% 85%, 70% 100%, 60% 85%, 50% 100%, 40% 85%, 30% 100%, 20% 85%, 10% 100%, 0 85%)`,
                zIndex: 5,
              }}
            >
              {product.discount}% OFF
            </Box>
          )}

          <CardMedia
            component="img"
            height="140"
            image={product?.image_full_url}
            sx={{
              objectFit: "cover",
              borderTopLeftRadius: "12px",
              borderTopRightRadius: "12px",
              cursor: "pointer",
            }}
            onClick={() => handleProductClick(product)}
          />

          {/* Wishlist Icon */}
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
              transition: "all 0.2s ease",
              "&:hover": { transform: "scale(1.05)" },
            }}
            onClick={(e) => {
              if (isWishlisted(product)) {
                removeFromWishlist(product, e);
              } else {
                addToWishlist(product, e);
              }
            }}
          >
            {isWishlisted(product) ? (
              <FavoriteIcon sx={{ color: "#E53935", fontSize: 20 }} />
            ) : (
              <FavoriteBorderIcon sx={{ color: "#c4c2c2", fontSize: 20 }} />
            )}
          </Box>
        </Box>

        <CardContent sx={{ p: 1.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography
              sx={{
                fontWeight: "bold",
                maxWidth: 110,
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {product.name}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#e8f5e9",
                borderRadius: 1,
                px: 0.75,
              }}
            >
              <StarIcon sx={{ color: "#1A914B", fontSize: 14 }} />
              <Typography fontWeight="bold">
                {product.avg_rating
                  ? parseFloat(product.avg_rating) % 1 === 0
                    ? parseInt(product.avg_rating)
                    : parseFloat(product.avg_rating).toFixed(1)
                  : 0}
              </Typography>
            </Box>
          </Box>

          {product?.module_type == "food" && (
            <Typography variant="body2">{product.store_name}</Typography>
          )}
          {product?.module_type !== "food" && (
            <Typography fontSize={12} color="text.secondary">
              {unitLabel}{unitType}
            </Typography>
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: "4px",
            }}
          >
            <Box>
              <Typography fontWeight={700}>₹{finalPrice.toFixed(0)}</Typography>
              {discount > 0 && (
                <Typography fontSize={11} sx={{ textDecoration: "line-through" }}>
                  ₹{price.toFixed(0)}
                </Typography>
              )}
            </Box>

            {!isFoodModule && (
              outOfStock ? (
                <Button
                  variant="outlined"
                  size="small"
                  disabled
                  sx={{
                    borderRadius: "8px",
                    fontSize: "11px",
                    width: "80px",
                    color: "#e53935 !important",
                    border: "1.8px solid #e53935 !important",
                    padding: "5px 0px",
                    opacity: 0.8,
                    fontWeight: 600,
                  }}
                >
                  Out of Stock
                </Button>
              ) : quantity === 0 ? (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={(e) => handleAddClick(e, false)}
                  disabled={cardLoading}
                  sx={{
                    width: "80px",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  {cardLoading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    "ADD"
                  )}
                </Button>
              ) : (
                <Box
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #2e7d32",
                    borderRadius: "6px",
                    padding: "0 4px",
                  }}
                >
                  <IconButton size="small" onClick={handleDecrease}>
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <Typography sx={{ minWidth: 20, textAlign: "center" }}>
                    {quantity}
                  </Typography>
                  <IconButton size="small" onClick={handleIncrease}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Box>
              )
            )}
          </Box>
        </CardContent>
      </Card>

      {/* ===== VARIATION MODAL ===== */}
      {variationModalOpen && (
        <Dialog
          open={variationModalOpen}
          onClose={() => setVariationModalOpen(false)}
          fullWidth
          maxWidth="xs"
          sx={{
            width: "450px",
            margin: "auto",
            "& .MuiPaper-root": {
              borderRadius: "12px !important",
              backgroundColor: "none",
            },
          }}
        >
          <DialogContent
            dividers
            sx={{
              borderRadius: "12px !important",
              backgroundColor: "#FFFFFF",
              border: "1px solid",
            }}
          >
            <DialogTitle sx={{ paddingTop: 0 }}>Select Quantity</DialogTitle>

            {product.variations.map((variation, index) => {
              const isThisLoading = loadingVariations[index] || false; // ✅ sirf is variation ka loader
              const originalPrice = variation.price;
              const variationDiscount = product.discount || 0;
              const discountedPrice =
                variationDiscount > 0
                  ? Math.round(originalPrice - (originalPrice * variationDiscount) / 100)
                  : originalPrice;

              // Per-variation stock check
              const varStock = getEffectiveStock(product, variation);
              const varOutOfStock = varStock <= 0;

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
                    borderBottom: "1px dashed #e0e0e0",
                  }}
                >
                  {/* LEFT: Image + Details */}
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Box
                      component="img"
                      src={product.image_full_url}
                      alt={variation.type}
                      sx={{ width: 48, height: 48, borderRadius: 1, objectFit: "cover" }}
                    />
                    <Box>
                      <Typography fontWeight={600}>
                        {variation.type} {product.unit_type}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography fontWeight={600}>₹{discountedPrice}</Typography>
                        {variationDiscount > 0 && (
                          <Typography
                            sx={{
                              textDecoration: "line-through",
                              color: "#9e9e9e",
                              fontSize: "13px",
                            }}
                          >
                            ₹{originalPrice}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {/* RIGHT: ADD BUTTON — per-variation, independent loader */}
                  {!isFoodModule && (
                    varOutOfStock ? (
                      <Button
                        variant="outlined"
                        size="small"
                        disabled
                        sx={{
                          borderRadius: "8px",
                          fontSize: "11px",
                          width: "80px",
                          color: "#e53935 !important",
                          border: "1.8px solid #e53935 !important",
                          padding: "5px 0px",
                          opacity: 0.8,
                          fontWeight: 600,
                        }}
                      >
                        Out of Stock
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => handleVariationAdd(e, variation, index, false)}
                        disabled={isThisLoading}
                        sx={{
                          width: "80px",
                          borderRadius: "8px",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        {isThisLoading ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          "ADD"
                        )}
                      </Button>
                    )
                  )}
                </Box>
              );
            })}
          </DialogContent>
        </Dialog>
      )}

      {/* ===== STORE SWITCH DIALOG (GrocerySession.js jaisa hi) ===== */}
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
    </>
  );
};

export default ProductCard;