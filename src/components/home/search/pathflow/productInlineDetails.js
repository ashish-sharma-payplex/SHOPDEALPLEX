"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Grid,
  Box,
  Typography,
  Button,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Paper,
  Rating,
  useTheme,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CloseIcon from "@mui/icons-material/Close";
import Image from "next/image";
import toast from "react-hot-toast";
import useWishlistHandler from "./wishlisthandler";

import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  setBuyNowItemList,
  setCampaignItemList,
} from "../../../../redux/slices/cart";
import { isVariationAvailable } from "components/product-details/product-details-section/helperFunction";

const ProductInlineDetail = ({ product, onClose, onAddToCart }) => {
  const [mainImage, setMainImage] = useState(product.image_full_url);
  const [selectedChoice, setSelectedChoice] = useState(
    product.choice_options?.[0]?.options?.[0]?.trim() || ""
  );
  const [count, setCount] = useState(1);

  const { isWishlisted, addToWishlist, removeFromWishlist } =
    useWishlistHandler(product);

  const router = useRouter();
  const dispatch = useDispatch();
  const theme = useTheme();

  // refs for up-to-date values (avoids stale closures)
  const countRef = useRef(count);
  const choiceRef = useRef(selectedChoice);

  useEffect(() => {
    setMainImage(product.image_full_url);
    setSelectedChoice(product.choice_options?.[0]?.options?.[0]?.trim() || "");
    setCount(1);
  }, [product]);

  useEffect(() => {
    countRef.current = count;
  }, [count]);

  useEffect(() => {
    choiceRef.current = selectedChoice;
  }, [selectedChoice]);

  // determine selected variation
  const selectedVariation = useMemo(
    () =>
      product.variations?.find(
        (v) => v.type?.trim() === selectedChoice?.trim()
      ) || null,
    [selectedChoice, product]
  );

  // price calculations
  const basePrice = selectedVariation?.price || product.price || 0;
  const discount = product.discount || 0;
  const unitPrice =
    discount > 0 ? basePrice - (basePrice * discount) / 100 : basePrice;
  const totalPriceUI = unitPrice * count;
  const totalBasePriceUI = basePrice * count;

  const stock = selectedVariation?.stock ?? product.stock ?? 0;
  const outOfStock = stock <= 0;
  const discountPercent = discount > 0 ? `${discount}% Off` : null;
  const maxQty = product.maximum_cart_quantity || 10;

  const handleIncrease = () => {
    if (count < maxQty) setCount((c) => c + 1);
    else toast.error(`You can only buy up to ${maxQty} of this item`);
  };
  const handleDecrease = () => setCount((c) => (c > 1 ? c - 1 : 1));

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    isWishlisted ? removeFromWishlist(e) : addToWishlist(e);
  };

  const avgRating = product.avg_rating || 0;
  const ratingCount = product.rating_count || 0;
  const allImages = [product.image_full_url, ...(product.images_full_url || [])];

  const variationErrorToast = () =>
    toast.error(
      "This variation is out of stock. Choose another variation to proceed further."
    );

  // build product payload for cart or buy now
  const buildProductPayload = () => {
    const currentChoice = choiceRef.current;
    const currentCount = countRef.current;

    const selectedVar = product.variations?.find(
      (v) => v.type?.trim() === (currentChoice || "").trim()
    );
    const base = selectedVar?.price ?? product.price ?? 0;
    const disc = product.discount ?? 0;
    const finalUnitPrice = disc > 0 ? base - (base * disc) / 100 : base;
    const total = finalUnitPrice * currentCount;

    return {
      ...product,
      quantity: currentCount,
      selectedOption: selectedVar
        ? {
            type: selectedVar.type,
            price: selectedVar.price,
            stock: selectedVar.stock,
          }
        : null,
      unitPrice: finalUnitPrice,
      totalPrice: total,
    };
  };

  const handleRedirect = () => {
    const buyNowProduct = buildProductPayload();

    if (product?.isCampaignItem) {
      dispatch(setCampaignItemList(buyNowProduct));
      setTimeout(() => {
        router.push("/checkout?page=campaign");
      }, 40);
    } else {
      dispatch(setBuyNowItemList(buyNowProduct));
      setTimeout(() => {
        router.push("/checkout?page=buy_now");
      }, 40);
    }
  };

  const handleRedirectToCheckoutClick = () => {
    if (product?.choice_options?.length > 0) {
      const selectedVar = product.variations?.find(
        (v) => v.type?.trim() === (choiceRef.current || "").trim()
      );
      if (selectedVar?.stock === 0) {
        variationErrorToast();
        return;
      }
      handleRedirect();
      onClose?.();
    } else {
      handleRedirect();
      onClose?.();
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 3,
        backgroundColor: "#fff",
        mb: 3,
        position: "relative",
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          backgroundColor: "rgba(255,255,255,0.9)",
          "&:hover": { backgroundColor: "white" },
        }}
      >
        <CloseIcon />
      </IconButton>

      <Grid container spacing={4} alignItems="flex-start">
        {/* Left Section */}
        <Grid item xs={12} md={6}>
          <Box display="flex" alignItems="flex-start">
            {/* thumbnails */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                mr: 2,
                overflowY: "auto",
                maxHeight: "320px",
                "&::-webkit-scrollbar": { width: 4 },
                "&::-webkit-scrollbar-thumb": {
                  background: "#ccc",
                  borderRadius: 2,
                },
              }}
            >
              {allImages.map((img, idx) => (
                <Box
                  key={idx}
                  sx={{
                    border:
                      mainImage === img
                        ? "2px solid #2e7d32"
                        : "1px solid #ddd",
                    borderRadius: 2,
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "0.3s",
                    "&:hover": { border: "2px solid #2e7d32" },
                    flexShrink: 0,
                  }}
                  onClick={() => setMainImage(img)}
                >
                  <Image
                    src={img}
                    alt={`thumb-${idx}`}
                    width={70}
                    height={70}
                    style={{
                      objectFit: "cover",
                      width: "70px",
                      height: "70px",
                      borderRadius: "8px",
                    }}
                  />
                </Box>
              ))}
            </Box>

            {/* main image */}
            <Box
              sx={{
                position: "relative",
                flex: 1,
                height: "340px",
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              }}
            >
              <Image
                src={mainImage}
                alt={product.name}
                width={500}
                height={340}
                style={{
                  objectFit: "cover",
                  width: "100%",
                  height: "100%",
                }}
              />
              <IconButton
                onClick={handleWishlistClick}
                sx={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  backgroundColor: "rgba(255,255,255,0.8)",
                  "&:hover": { backgroundColor: "white" },
                }}
              >
                {isWishlisted ? (
                  <FavoriteIcon sx={{ color: "red" }} />
                ) : (
                  <FavoriteBorderIcon sx={{ color: "red" }} />
                )}
              </IconButton>
            </Box>
          </Box>
        </Grid>

        {/* Right Section */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            minHeight: "340px",
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h5" fontWeight={700}>
                {product.name}
              </Typography>
              <Chip
                label={outOfStock ? "Out of Stock" : "In Stock"}
                color={outOfStock ? "error" : "success"}
                size="small"
                sx={{ fontWeight: 600, fontSize: "0.7rem" }}
              />
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              {product.description}
            </Typography>

            {/* Rating */}
            <Box display="flex" alignItems="center" gap={1} sx={{ mt: 1 }}>
              <Typography variant="body2">
                Net Qty: <b>{selectedChoice || product.unit_type || "g"}</b>
              </Typography>
              <Rating
                value={avgRating}
                precision={0.1}
                readOnly
                size="small"
                sx={{ color: "#fbc02d" }}
              />
              <Typography variant="body2" color="text.secondary">
                ({ratingCount} Reviews)
              </Typography>
            </Box>

            {/* Price */}
            <Box
              display="flex"
              alignItems="center"
              gap={1.5}
              sx={{ mt: 2, flexWrap: "wrap" }}
            >
              <Typography variant="h5" fontWeight={600}>
                ₹{totalPriceUI.toFixed(2)}
              </Typography>
              {discount > 0 && (
                <>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textDecoration: "line-through" }}
                  >
                    ₹{totalBasePriceUI.toFixed(2)}
                  </Typography>
                  <Chip
                    label={discountPercent}
                    color="error"
                    size="small"
                    sx={{
                      bgcolor: "#FFEAEA",
                      color: "#E53935",
                      fontWeight: 600,
                      fontSize: "0.7rem",
                    }}
                  />
                </>
              )}
            </Box>

            {/* Variation selector */}
            {product.choice_options?.[0]?.options?.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography sx={{ fontWeight: 600 }}>
                  Choose quantity
                </Typography>
                <ToggleButtonGroup
                  color="success"
                  value={selectedChoice}
                  exclusive
                  onChange={(e, val) => val && setSelectedChoice(val.trim())}
                  sx={{ mt: 1 }}
                >
                  {product.choice_options[0].options.map((opt, idx) => {
                    const trimmed = opt.trim();
                    const variation = product.variations?.find(
                      (v) => v.type.trim() === trimmed
                    );
                    const isOut = variation?.stock === 0;
                    return (
                      <ToggleButton
                        key={idx}
                        value={trimmed}
                        disabled={isOut}
                        sx={{ opacity: isOut ? 0.5 : 1 }}
                      >
                        {trimmed}
                        {product.unit_type || "g"}
                      </ToggleButton>
                    );
                  })}
                </ToggleButtonGroup>
              </Box>
            )}

            {/* Quantity */}
            <Box display="flex" alignItems="center" gap={1} sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                color="success"
                size="small"
                sx={{ minWidth: "28px", height: "28px" }}
                onClick={handleDecrease}
              >
                –
              </Button>
              <Typography variant="body1">{count}</Typography>
              <Button
                variant="outlined"
                color="success"
                size="small"
                sx={{ minWidth: "28px", height: "28px" }}
                onClick={handleIncrease}
                disabled={count >= maxQty}
              >
                +
              </Button>
            </Box>
          </Box>

          {/* Buttons */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 1.5,
              mb: "-30px",
            }}
          >
            {/* Buy Now */}
            <Button
              variant="contained"
              fullWidth
              sx={{
                fontWeight: 600,
                py: 1.1,
                borderRadius: 1.5,
                backgroundColor: "#FF8C00",
                color: "#fff",
                "&:hover": { backgroundColor: "#e67e00" },
                textTransform: "none",
                fontSize: "0.85rem",
              }}
              onClick={() => {
                if (outOfStock || !isVariationAvailable(product)) {
                  toast.error(`${product.name} is out of stock`);
                  return;
                }
                handleRedirectToCheckoutClick();
              }}
            >
              Buy Now
            </Button>

            {/* Add to Cart - sends enriched product */}
            <Button
              variant="outlined"
              fullWidth
              sx={{
                fontWeight: 600,
                py: 1.1,
                borderRadius: 1.5,
                borderColor: "#2e7d32",
                color: "#2e7d32",
                "&:hover": {
                  backgroundColor: "#2e7d32",
                  color: "#fff",
                },
                textTransform: "none",
                fontSize: "0.85rem",
              }}
              disabled={outOfStock}
              onClick={() => {
                const cartProduct = buildProductPayload();
                onAddToCart(cartProduct); // ✅ send latest data
              }}
            >
              {outOfStock ? "Out of Stock" : "Add to Cart"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ProductInlineDetail;
