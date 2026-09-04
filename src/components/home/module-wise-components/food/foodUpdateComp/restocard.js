"use client";

import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  Box,
  Button,
} from "@mui/material";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import StarIcon from "@mui/icons-material/Star";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useTranslation } from 'react-i18next';

import useWishlistHandler from "../../../search/pathflow/wishlisthandler";

import useAddCartItem from "../../../../../api-manage/hooks/react-query/add-cart/useAddCartItem";
import { useDispatch } from "react-redux";
import { setCartList } from "../../../../../redux/slices/cart";
import { getGuestId } from "../../../../../helper-functions/getToken";
import { getItemDataForAddToCart } from "../../../../product-details/product-details-section/helperFunction";

import toast from "react-hot-toast";

export default function ProductCard({ product, onProductClick }) {
   const { t } = useTranslation();
  const dispatch = useDispatch();
  const addCartMutation = useAddCartItem();

   const { addToWishlist, removeFromWishlist, isWishlisted } =
    useWishlistHandler(t);

  // const { isWishlisted, addToWishlist, removeFromWishlist } =
  //   useWishlistHandler(product);

  const oldPrice = product.price;
  const discount = product.discount || 0;
  const newPrice = oldPrice - (oldPrice * discount) / 100;

  // ⭐ ADD TO CART — SAME LOGIC AS ProductModal
  const handleAddToCart = () => {
    const guestId = getGuestId();

    const unitPrice = newPrice;

    const values = {
      id: product.id,
      cartItemId: null,
      price: product.price,
      discount: product.discount,
      module_type: product.module_type,
      add_ons: product.add_ons || [],
      addons: [],
      food_variations: product.food_variations || [],
      selectedOption:
        Array.isArray(product.variations) && product.variations.length
          ? [product.variations[0]]
          : [],
    };

    const itemData = getItemDataForAddToCart(
      values,
      1,
      unitPrice,
      guestId
    );

    addCartMutation.mutate(itemData, {
      onSuccess: (res) => {
        if (res?.length > 0) {
          dispatch(
            setCartList(
              res.map((item) => ({
                ...item.item,
                cartItemId: item.id,
                quantity: item.quantity,
                totalPrice: item.price,
                selectedOption: [],
              }))
            )
          );
        }

        toast.success(`${product.name} added to cart`);
      },

      onError: () => {
        toast.error("Failed to add to cart");
      },
    });
  };

  return (
    <Card
      sx={{
        borderRadius: "14px !important",
        height: "290px",
        p: 1.5,
        position: "relative",
        boxShadow: "0px 1px 4px var(--food-shadow-card)",
       
      }}
    >
      {/* DISCOUNT */}
      {discount > 0 && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 10,
            background: "var(--food-cta-green)",
            color: "var(--food-text-on-brand)",
            fontWeight: 700,
            fontSize: "8px",
            p: "6px 8px",
            width: "35px",
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
            zIndex: 5,
          }}
        >
          {discount}% OFF
        </Box>
      )}

      {/* WISHLIST */}
      {/* <IconButton
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          width: 24,
          height: 24,
          background: "var(--bg-card)",
          borderRadius: "10px",
        }}
        onClick={(e) => {
          e.stopPropagation();
          isWishlisted ? removeFromWishlist(e) : addToWishlist(e);
        }}
      >
        {isWishlisted ? (
          <FavoriteIcon sx={{ color: "var(--danger)", fontSize: 18 }} />
        ) : (
          <FavoriteBorderIcon sx={{ fontSize: 18, color: "var(--food-text-icon-muted)" }} />
        )}
      </IconButton> */}
<Box
  sx={{
    position: "absolute",
    top: 5,
    right: 5,
    width: 34,
    height: 34,
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
      {/* IMAGE */}
      <CardMedia
        component="img"
        height="150"
        image={product.image_full_url}
        sx={{
          objectFit: "cover",
          borderRadius: "10px",
          cursor: "pointer",
        }}
        onClick={() => onProductClick(product)}
      />

      <CardContent sx={{ p: 0, mt: 1 }}>
        {/* NAME + RATING */}
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "15px",
              maxWidth: "65%",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {product.name}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              px: 0.8,
              py: "2px",
              borderRadius: "10px",
              background: "var(--food-rating-bg)",
              color: "var(--food-rating-text)",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            <StarIcon sx={{ fontSize: 14 }} />
           {Number(product?.avg_rating || 0).toFixed(1)}
          </Box>
        </Box>

        {/* STORE */}
        <Typography sx={{ fontSize: "12px", color: "var(--food-text-soft)", mt: 0.3 }}>
          {product.store_name}
        </Typography>

        {/* TIME */}
        <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
          <AccessTimeIcon sx={{ fontSize: 15, mr: 0.5 }} />
          <Typography sx={{ fontSize: "12px", color: "var(--food-text-soft)" }}>
            {product.delivery_time}
          </Typography>
        </Box>

        {/* PRICE + ADD BUTTON */}
        <Box
          sx={{
            mt: 1.1,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
        <Box sx={{ display:"flex", gap:"6px" }}>
            <Typography sx={{ fontWeight:700, fontSize:"15px" }}>
              ₹{Math.round(newPrice)}
            </Typography>
            <Typography
              sx={{
                textDecoration:"line-through",
                color:"var(--food-text-placeholder)",
                fontSize:"14px",
              }}
            >
              ₹{Math.round(oldPrice)}
            </Typography>
          </Box>

          {/* <Button
            variant="outlined"
            sx={{
              borderRadius: "10px",
              fontSize: "12px",
              px: 2,
              maxHeight: "28px ",
              borderColor: "var(--food-rating-text)",
              color: "var(--food-rating-text)",
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
          >
            ADD
          </Button> */}
        </Box>
      </CardContent>
    </Card>
  );
}
