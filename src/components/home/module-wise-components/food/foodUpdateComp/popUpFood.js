"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Button,
  Rating,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CloseIcon from "@mui/icons-material/Close";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { toast, Toaster } from "react-hot-toast";
import { getCorrectCart } from "helper-functions/getCorrectCart";
import {
  setIncrementToCartItem,
  setDecrementToCartItem,
  setBuyNowItemList,
  fetchCartFromApi,
  setRemoveItemFromCart,
  setCartList,
  addOptimisticCartItem,
  patchCartItemId,
  removeOptimisticCartItem,
} from "redux/slices/cart";
import { setModalFor } from "redux/slices/utils";
import { setSignInModalOpen } from "redux/slices/utils";
import useAddCartItem from "../../../../../api-manage/hooks/react-query/add-cart/useAddCartItem";
import useDeleteAllCartItem from "../../../../../api-manage/hooks/react-query/add-cart/useDeleteAllCartItem";
import { getGuestId } from "helper-functions/getToken";
import { showToast } from "components/custom-toaster/CustomToast";
import useWishlistHandler from "components/home/search/pathflow/wishlisthandler";
import { t } from "i18next";

/* ================= USER IDENTIFIER ================= */
const getUserIdentifier = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? token : getGuestId();
};

/* ================= ZONE HELPER ================= */
const getValidZoneId = () => {
  try {
    const raw = localStorage.getItem("zoneid");
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;

    return parsed;
  } catch {
    return null;
  }
};

const FoodPopup = ({ open, onClose, product }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const cartList = useSelector((state) => getCorrectCart(state));
  const addCartMutation = useAddCartItem();
  const { mutateAsync: deleteAllCartItems } = useDeleteAllCartItem();

  const [quantity, setQuantity] = useState(1);
  const [addons, setAddons] = useState({});
  const [selectedFoodVariations, setSelectedFoodVariations] = useState({});
  const [openReviews, setOpenReviews] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewLength, setReviewLength] = useState(0);
  const [maxLimitToastShown, setMaxLimitToastShown] = useState(false);
  const { addToWishlist, removeFromWishlist, isWishlisted } =
    useWishlistHandler(t);

  // ✅ Store switch states (GrocerySession.js jaisa hi pattern)
  const [storeSwitchOpen, setStoreSwitchOpen] = useState(false);
  const [storeSwitchLoading, setStoreSwitchLoading] = useState(false);

  const greenColor = "var(--food-cta-green)";
  const hasAuthToken = () => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("token");
  };

  const isProductAvailableNow = () => {
    if (!product?.available_time_starts || !product?.available_time_ends) {
      return true;
    }

    const now = new Date();
    const currentTime =
      now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    const [sh, sm, ss] = product.available_time_starts.split(":").map(Number);
    const [eh, em, es] = product.available_time_ends.split(":").map(Number);

    const startTime = sh * 3600 + sm * 60 + ss;
    const endTime = eh * 3600 + em * 60 + es;

    return currentTime >= startTime && currentTime <= endTime;
  };

  const getSelectedVariationText = () => {
    if (!selectedFoodVariations) return "";

    return Object.entries(selectedFoodVariations)
      .map(([variationName, values]) => {
        const labels = values.map((v) => v.label).join(", ");
        return `${variationName}: ${labels}`;
      })
      .join(" | ");
  };
  const formatTo12Hour = (timeStr) => {
    if (!timeStr) return "";

    const [h, m] = timeStr.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;

    return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
  };

  /* ================= PRICE CALCULATION ================= */
  const isProductAlreadyInCart = () => {
    if (!product?.id || !Array.isArray(cartList)) return false;

    const currentVariation =
      buildFoodVariationPayload(selectedFoodVariations) || [];

    const currentKey = `${product.id}-${JSON.stringify(currentVariation)}`;

    return cartList.some((item) => item?.cartItemKey === currentKey);
  };

  const getFoodVariationPrice = () => {
    let total = 0;

    product?.food_variations?.forEach((variation) => {
      const selected = selectedFoodVariations[variation.name];
      if (!selected) return;

      selected.forEach((opt) => {
        total += Number(opt.optionPrice || 0);
      });
    });

    return total;
  };

  const getAddOnsPrice = () => {
    let total = 0;
    product?.add_ons?.forEach((addon) => {
      if (addons[addon.id]) {
        total += Number(addon.price || 0);
      }
    });
    return total;
  };

  const getUpdatedPrice = (product, qty) => {
    if (!priceToUse) return 0;
    const singleItem = priceToUse + getFoodVariationPrice() + getAddOnsPrice();
    return singleItem * qty;
  };

  const oldPrice = product?.discount > 0 ? product.price * quantity : null;

  /* ================= QUANTITY HANDLERS ================= */

  const maxQty = Number(product?.maximum_cart_quantity) || Infinity;

  const handleIncrement = () => {
    if (quantity + 1 >= maxQty && !maxLimitToastShown) {
      toast.error(`Maximum quantity allowed is ${maxLimit}`);
    }

    if (quantity < maxQty) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity <= 1) {
      toast.error("Minimum quantity is 1");
      return;
    }

    setQuantity(quantity - 1);

    if (maxLimitToastShown) {
      setMaxLimitToastShown(false);
    }
  };

  /* ================= STORE CONFLICT CHECK (GrocerySession.js jaisa hi) ================= */
  const checkStoreConflict = () => {
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

  const buildFoodVariationPayload = (selectedFoodVariations = {}) => {
    return Object.entries(selectedFoodVariations)
      .map(([name, selectedValues]) => {
        if (!Array.isArray(selectedValues) || selectedValues.length === 0) {
          return null;
        }

        return {
          name,
          values: {
            label: selectedValues.map((v) => v.label),
          },
          values_to_show: selectedValues.map((v) => ({
            label: v.label,
            optionPrice: Number(v.optionPrice || 0),
            isSelected: true,
          })),
        };
      })
      .filter(Boolean);
  };

  const newPrice =
    product?.discount > 0
      ? product?.discount_type === "percent"
        ? product?.price - (product?.price * product?.discount) / 100
        : product?.price - product?.discount
      : product?.price;

  const priceToUse = newPrice;

  const buildAddonPayload = (product, addons = {}) =>
    product?.add_ons?.map((addon) => ({
      id: addon.id,
      name: addon.name,
      priceToUse: Number(addon.price || 0),
      isChecked: addons[addon.id] || false,
      quantity: addons[addon.id] ? 1 : 0,
    })) || [];

  useEffect(() => {}, [selectedFoodVariations]);

  useEffect(() => {
    const initAddons = {};
    product?.add_ons?.forEach((a) => (initAddons[a.id] = false));
    setAddons(initAddons);
  }, [product]);

  const validateVariations = () => {
    for (let variation of product.food_variations) {
      const selected = selectedFoodVariations[variation.name] || [];
      const minLimit = Number(variation.min) || 0;
      const maxLimit = Number(variation.max) || Infinity;

      if (selected.length < minLimit) {
        toast.error(
          `Please select at least ${minLimit} option(s) for ${variation.name}`,
        );
        return false;
      }
      if (selected.length > maxLimit) {
        toast.error(
          `You can select maximum ${maxLimit} option(s) for ${variation.name}`,
        );
        return false;
      }
    }
    return true;
  };

  const validateRequiredVariations = () => {
    for (let variation of product.food_variations) {
      if (variation.required === "on") {
        const selected = selectedFoodVariations[variation.name] || [];
        const minLimit = Number(variation.min) || 0;
        if (selected.length < minLimit) {
          toast.error(
            `Please select at least ${minLimit} option for ${variation.name}`,
          );
          return false;
        }
      }
    }
    return true;
  };

  // ✅ UPDATED — ab bypassStoreCheck param leta hai (GrocerySession.js jaisa hi)
  // 🚀 OPTIMISTIC ADD TO CART — instant UI update, API background me sync hoti hai
  const handleAddToCart = (bypassStoreCheck = false) => {
    // 🔐 AUTH CHECK
    if (typeof window !== "undefined" && !localStorage.getItem("token")) {
      dispatch(setModalFor("sign-in"));
      dispatch(setSignInModalOpen(true));
      return;
    }

    // 📍 ZONE CHECK
    const zoneId = getValidZoneId();
    if (!zoneId) {
      toast.error("Please select your zone first");
      return;
    }

    if (!validateRequiredVariations()) return;

    // ❌ DUPLICATE CHECK
    if (isProductAlreadyInCart()) {
      const variationText = getSelectedVariationText();

      toast(
        variationText
          ? `${product.name} already added with ${variationText}`
          : `${product.name} already exists in cart`,
      );

      return;
    }

    // ✅ STORE VALIDATION — pehle yeh check, baaki sab baad me
    if (!bypassStoreCheck && checkStoreConflict()) {
      setStoreSwitchOpen(true);
      return;
    }

    // ✅ SELECTED ADDONS
    const selectedAddonsIds = product.add_ons
      .filter((addon) => addons[addon.id])
      .map((addon) => addon.id);

    const selectedAddonsQtys = product.add_ons
      .filter((addon) => addons[addon.id])
      .map(() => 1);

    const variationPayload = buildFoodVariationPayload(selectedFoodVariations);
    const cartItemKey = `${product.id}-${JSON.stringify(variationPayload)}`;
    const tempCartItemId = `temp-${Date.now()}`;
    const finalPrice = priceToUse + getFoodVariationPrice() + getAddOnsPrice();
    const finalTotalPrice = finalPrice * quantity;

    // 🚀 STEP 1: OPTIMISTIC UI UPDATE — instant, no API wait
    dispatch(
      addOptimisticCartItem({
        cartItemKey,
        cartItemId: tempCartItemId,
        id: product.id,
        name: product.name,
        image_full_url: product.image_full_url || product.image,
        quantity,
        price: finalPrice,
        totalPrice: finalTotalPrice,
        variation: variationPayload,
        selectedOption: variationPayload,
        food_variations: variationPayload,
        module_type: product.module_type || "food",
        stock: product.stock,
        maximum_cart_quantity: product.maximum_cart_quantity,
        product,
      }),
    );

    toast.success(`${product.name} added to cart`);
    onClose();

    // 📦 PAYLOAD
    const payload = {
      item_id: product.id,
      model: "Item",
      price: priceToUse,
      quantity,
      variation: variationPayload,
      add_on_ids: selectedAddonsIds,
      add_on_qtys: selectedAddonsQtys,
      module_id: product.module_id || 1,
      module_type: product.module_type || "food",
    };

    // 🚀 STEP 2: background API sync — UI already updated, no blocking
    addCartMutation.mutate(payload, {
      onSuccess: (res) => {
        const newId = res?.id ?? (Array.isArray(res) && res[0]?.id);
        if (newId) {
          dispatch(patchCartItemId({ cartItemKey, cartItemId: newId }));
        }
      },

      onError: (error) => {
        dispatch(removeOptimisticCartItem({ cartItemKey })); // rollback

        const backendMessage =
          error?.response?.data?.errors?.[0]?.message ||
          error?.response?.data?.message ||
          "Failed to add to cart";

        toast.error(backendMessage);
      },
    });
  };

  // ✅ UPDATED — bypassStoreCheck param
  const handleBuyNow = (bypassStoreCheck = false) => {
    // 🔐 AUTH CHECK
    if (typeof window !== "undefined" && !localStorage.getItem("token")) {
      dispatch(setModalFor("sign-in"));
      dispatch(setSignInModalOpen(true));
      return;
    }

    // 📍 ZONE CHECK
    const zoneId = getValidZoneId();
    if (!zoneId) {
      toast.error("Please select your zone first");
      return;
    }

    if (!validateRequiredVariations()) return;

    // ✅ STORE VALIDATION
    if (!bypassStoreCheck && checkStoreConflict()) {
      setStoreSwitchOpen(true);
      return;
    }

    // 🛒 BUILD BUY NOW ITEM
    const buyNowCartItem = {
      id: product.id,
      quantity,
      price: priceToUse,
      module_type: product.module_type || "food",
      food_variations: buildFoodVariationPayload(selectedFoodVariations),
      product: {
        ...product,
        addons:
          product.add_ons
            ?.filter((a) => addons[a.id])
            .map((a) => ({
              id: a.id,
              name: a.name,
              price: Number(a.price),
              isChecked: true,
              quantity: 1,
            })) || [],
      },
    };

    dispatch(setBuyNowItemList([buyNowCartItem]));
    onClose();

    router.push("/checkout?page=buy_now");
  };

  /* ================= STORE SWITCH CONFIRM (GrocerySession.js jaisa hi) ================= */
  const handleStoreSwitchConfirm = async () => {
    try {
      setStoreSwitchLoading(true);
      const userId = getUserIdentifier();
      await deleteAllCartItems(userId);
      dispatch(setCartList([]));
      setStoreSwitchOpen(false);
      // ✅ cart clear hone ke baad bypassStoreCheck = true karke retry
      handleAddToCart(true);
    } catch (error) {
      // console.error("❌ Cart clear failed:", error);
      toast.error("Cart clear nahi hui. Please try again.");
    } finally {
      setStoreSwitchLoading(false);
    }
  };

  const handleStoreSwitchCancel = () => {
    setStoreSwitchOpen(false);
  };

  useEffect(() => {}, [selectedFoodVariations]);
  useEffect(() => {}, [addons]);

  /* ================= RESET ================= */

  useEffect(() => {
    setQuantity(1);
    setSelectedFoodVariations({});
    const initAddons = {};
    product?.add_ons?.forEach((a) => (initAddons[a.id] = false));
    setAddons(initAddons);
  }, [product]);

  /* ================= FETCH REVIEWS ================= */

  useEffect(() => {
    if (!product?.id) return;
    fetch(`/api/reviews/${product.id}`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews || []);
        setReviewLength(data.total_size || 0);
      });
  }, [product?.id]);

  /* ================= UI ================= */
  const totalAmount = useMemo(() => {
    return getUpdatedPrice(product, quantity);
  }, [product, quantity, selectedFoodVariations, addons]);

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            boxShadow: "none",
            WebkitBoxShadow: "none",
            MozBoxShadow: "none",
          },
        }}
      />
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "var(--bg-card)",
          },
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 10, right: 10 }}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent sx={{ p: 0 }}>
          {/* IMAGE + INFO */}
          <Box sx={{ display: "flex", p: 2 }}>
            <Box sx={{ width: "35%", position: "relative" }}>
              <img
                src={product?.image_full_url}
                alt={product?.name}
                style={{ width: "100%", borderRadius: 8 }}
              />
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
              <IconButton
                sx={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  bgcolor: "var(--food-overlay-80)",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isWishlisted(product)) removeFromWishlist(product, e);
                  else addToWishlist(product, e);
                }}
              >
                {isWishlisted(product) ? (
                  <FavoriteIcon sx={{ color: "var(--danger)", fontSize: 20 }} />
                ) : (
                  <FavoriteBorderIcon sx={{ color: "var(--wishlist-inactive)", fontSize: 20 }} />
                )}
              </IconButton>
            </Box>

            <Box sx={{ width: "65%", pl: 1 }}>
              <Typography fontWeight="bold" color={"var(--text-strong)"}>
                {product?.name}
              </Typography>

              <Box display="flex" alignItems="center" mt={0.5}>
                <Rating
                  value={product?.avg_rating || 0}
                  readOnly
                  size="small"
                  precision={0.5}
                  sx={{
                    "& .MuiRating-iconEmpty": {
                      color: "var(--food-star-gold)",
                      opacity: 0.4,
                    },
                  }}
                />
                <Typography
                  sx={{ ml: 1, cursor: "pointer", color: "text.secondary" }}
                  onClick={() => setOpenReviews(true)}
                >
                  ({reviewLength} reviews)
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                <Typography fontWeight="bold">
                  <span style={{ color: "var(--food-cta-green)" }}>
                    ₹{Math.round(priceToUse)}
                  </span>
                  <span
                    style={{
                      textDecoration: "line-through",
                      marginLeft: "8px",
                      color: "var(--food-text-disabled)",
                      fontSize: "0.8rem",
                      fontWeight: "semibold",
                    }}
                  >
                    ₹{Math.round(product?.price)}
                  </span>
                </Typography>

                <Box
                  sx={{
                    width: 14,
                    height: 14,
                    border: "1px solid",
                    borderColor: product?.veg === 1 ? "var(--brand-green)" : "var(--danger)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: product?.veg === 1 ? "var(--brand-green)" : "var(--danger)",
                    }}
                  />
                </Box>
              </Box>
              <Box>
                {!isProductAvailableNow() && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ display: "block", mt: 0.5 }}
                  >
                    Available only from{" "}
                    {formatTo12Hour(product.available_time_starts)} to{" "}
                    {formatTo12Hour(product.available_time_ends)}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* DESCRIPTION */}
          <Box px={2}>
            <Typography fontWeight="bold">Description</Typography>
            <Typography variant="body2">{product?.description}</Typography>
          </Box>

          {/* VARIATIONS */}
          {product?.food_variations?.length > 0 && (
            <Box px={2} mt={2}>
              {product.food_variations.map((variation, idx) => {
                const minLimit = Number(variation.min) || 0;
                const maxLimit = Number(variation.max) || Infinity;
                const existing = selectedFoodVariations[variation.name] || [];

                return (
                  <Box key={idx} mt={1}>
                    <Typography fontWeight={600} fontSize="0.9rem">
                      {variation.name}{" "}
                      {variation.required === "on" && "(Required)"}
                    </Typography>

                    {variation.values.map((val, i) => {
                      const isSelected = existing.some(
                        (v) => v.label === val.label,
                      );

                      return (
                        <FormControlLabel
                          key={i}
                          control={
                            <Checkbox
                              checked={isSelected}
                              onChange={(e) => {
                                if (
                                  variation.type === "single" &&
                                  e.target.checked
                                ) {
                                  setSelectedFoodVariations({
                                    ...selectedFoodVariations,
                                    [variation.name]: [
                                      {
                                        label: val.label,
                                        optionPrice: Number(
                                          val.optionPrice || 0,
                                        ),
                                      },
                                    ],
                                  });
                                } else if (variation.type === "multi") {
                                  if (
                                    e.target.checked &&
                                    existing.length >= maxLimit
                                  ) {
                                    toast.error(
                                      `You can select a maximum of ${maxLimit} option(s) for ${variation.name}`,
                                    );
                                    return;
                                  }

                                  if (e.target.checked) {
                                    setSelectedFoodVariations({
                                      ...selectedFoodVariations,
                                      [variation.name]: [
                                        ...existing,
                                        {
                                          label: val.label,
                                          optionPrice: Number(
                                            val.optionPrice || 0,
                                          ),
                                        },
                                      ],
                                    });
                                  } else {
                                    setSelectedFoodVariations({
                                      ...selectedFoodVariations,
                                      [variation.name]: existing.filter(
                                        (v) => v.label !== val.label,
                                      ),
                                    });
                                  }
                                }
                              }}
                              disabled={
                                existing.length >= maxLimit && !isSelected
                              }
                            />
                          }
                          label={`${val.label} (+ ₹${val.optionPrice})`}
                        />
                      );
                    })}
                  </Box>
                );
              })}
            </Box>
          )}

          {/* ADD-ONS */}
          {product?.add_ons?.length > 0 && (
            <Box px={2} mt={2}>
              <Typography fontWeight="bold">Add-ons</Typography>
              {product.add_ons.map((addon) => (
                <FormControlLabel
                  key={addon.id}
                  control={
                    <Checkbox
                      checked={addons[addon.id] || false}
                      onChange={(e) => {
                        setAddons({
                          ...addons,
                          [addon.id]: e.target.checked,
                        });
                      }}
                    />
                  }
                  label={`${addon.name} (+ ₹${addon.price})`}
                />
              ))}
            </Box>
          )}
        </DialogContent>

        {/* CHECKOUT BAR */}
        <DialogActions sx={{ px: 2, display: "block" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography fontWeight="bold" color="var(--brand-green)">
              Total Amount: ₹{totalAmount.toFixed(2)}
            </Typography>

            <Box display="flex" alignItems="center">
              <IconButton onClick={handleDecrement}>
                <RemoveIcon />
              </IconButton>
              <Typography fontWeight="bold">{quantity}</Typography>
              <IconButton
                onClick={handleIncrement}
                disabled={quantity >= maxQty}
              >
                <AddIcon />
              </IconButton>
            </Box>
          </Box>

          <Box display="flex" gap={1}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => handleAddToCart(false)}
              disabled={!isProductAvailableNow()}
              sx={{
                backgroundColor: greenColor,
                "&:hover": {
                  backgroundColor: "var(--brand-green-hover)",
                },
                position: "relative",
              }}
            >
              Add to Cart
            </Button>
          </Box>
        </DialogActions>

        {/* REVIEWS MODAL */}
        <Dialog
          open={openReviews}
          onClose={() => setOpenReviews(false)}
          maxWidth="xs"
          fullWidth
        >
          <Box
            sx={{
              p: "12px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid var(--food-border-light)",
              backgroundColor: "var(--bg-card)",
            }}
          >
            <Typography fontWeight="bold" color={"var(--food-text-neutral-dark)"}>
              {product?.name} Reviews
            </Typography>
            <IconButton onClick={() => setOpenReviews(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <DialogContent sx={{ p: "12px 16px", backgroundColor: "var(--bg-card)" }}>
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <Box
                  key={index}
                  sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: "10px",
                    backgroundColor: "var(--bg-card)",
                    boxShadow: "0px 1px 6px var(--shadow-review-color)",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        backgroundColor: "var(--food-blue-info)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        mr: 1,
                      }}
                    >
                      {review.customer?.f_name?.[0]?.toUpperCase() || "U"}
                    </Box>

                    <Box sx={{ flexGrow: 1 }}>
                      <Typography fontWeight={600} fontSize="0.9rem">
                        {review.customer?.f_name || "Unknown User"}
                      </Typography>
                      <Typography fontSize="0.7rem" color="var(--text-secondary)">
                        {new Date(review.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>

                    <Rating
                      value={review.rating}
                      readOnly
                      size="small"
                      precision={0.5}
                      sx={{
                        "& .MuiRating-iconEmpty": {
                          color: "var(--food-star-gold)",
                          opacity: 0.4,
                        },
                      }}
                    />
                  </Box>

                  <Typography fontSize="0.85rem" color="var(--food-text-icon-muted)">
                    {review.comment}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography align="center" mt={4}>
                No reviews available.
              </Typography>
            )}
          </DialogContent>
        </Dialog>
      </Dialog>

      {/* ================= STORE SWITCH DIALOG (GrocerySession.js jaisa hi) ================= */}
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
              backgroundColor: "var(--warning-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
              border: "2px solid var(--warning-border)",
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
              color: "var(--text-secondary)",
              textAlign: "center",
            }}
          >
            Your cart has items from another store
          </Typography>
        </Box>

        <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 1.5 }}>
          <Box
            sx={{
              backgroundColor: "var(--amber-bg)",
              border: "1px solid var(--amber-border)",
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
                color: "var(--amber-text)",
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
              borderTop: "1px dashed var(--border-subtle)",
            }}
          />

          <Typography
            sx={{
              fontSize: { xs: "13px", sm: "14px" },
              color: "var(--food-text-form)",
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
              border: "1.5px solid var(--border-subtle)",
              color: "var(--food-text-form)",
              backgroundColor: "var(--bg-card)",
              order: { xs: 2, sm: 1 },
              "&:hover": {
                backgroundColor: "var(--bg-subtle)",
                borderColor: "var(--food-form-border)",
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
              backgroundColor: "var(--brand-green)",
              color: "var(--food-text-on-brand)",
              order: { xs: 1, sm: 2 },
              boxShadow: "0 4px 14px var(--food-shadow-btn)",
              "&:hover": {
                backgroundColor: "var(--brand-green-hover)",
                boxShadow: "0 4px 18px var(--food-shadow-btn-hover)",
              },
              "&.Mui-disabled": {
                backgroundColor: "var(--brand-green-disabled)",
                color: "var(--food-text-on-brand)",
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

export default FoodPopup;
