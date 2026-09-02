"use client";

import { useState, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

import {
  setCart,
  setCartItemQuantity,
  setBuyNowItemList,
} from "redux/slices/cart";
import { useRouter } from "next/navigation";
import FoodPopup from "components/home/module-wise-components/food/foodUpdateComp/popUpFood";
import useWishlistHandler from "components/home/search/pathflow/wishlisthandler";
import { useTranslation } from "react-i18next";
import StarIcon from '@mui/icons-material/Star';

// ✅ 17 characters ke baad ... — same as GroceryPharmacyCard
const truncateName = (name) => {
  if (!name) return "";
  return name.length > 17 ? name.slice(0, 17) + "..." : name;
};

const formatRating = (rating) => {
  const num = Number(rating) || 0;
  const rounded = Math.round(num * 10) / 10;
  return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
};

// ✅ Effective stock — variation first, product fallback, maxCartQty last resort
const getEffectiveStock = (product, selectedVar = null) => {
  const variationStock = selectedVar?.stock ?? product?.variations?.[0]?.stock;
  const productStock = product?.stock;
  const maxCartQty = product?.maximum_cart_quantity;
  if (variationStock != null && variationStock > 0) return variationStock;
  if (productStock != null && productStock > 0) return productStock;
  if (maxCartQty != null && maxCartQty > 0) return maxCartQty;
  return 0;
};

const FoodCard = ({ products }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const router = useRouter();

  const { cartList } = useSelector((state) => state.cart);
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlistHandler(t);

  const [openModal, setOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const getCartItem = (productId) =>
    Array.isArray(cartList)
      ? cartList.find((item) => Number(item?.id) === Number(productId))
      : null;

  /* ================= ADD TO CART ================= */
  const handleAddToCart = useCallback(
    (product) => {
      // ✅ Stock check
      const effectiveStock = getEffectiveStock(product);
      if (effectiveStock <= 0) {
        toast.error("This item is out of stock.");
        return;
      }

      const existing = getCartItem(product.id);
      const existingQty = existing?.quantity ?? 0;

      if (existingQty + 1 > effectiveStock) {
        toast.error(
          `Only ${effectiveStock} items allowed. You already have ${existingQty} in cart.`
        );
        return;
      }

      if (existing) {
        dispatch(setCartItemQuantity({ id: product.id, quantity: existing.quantity + 1 }));
        toast.success("Quantity Updated");
      } else {
        dispatch(setCart({ ...product, quantity: 1 }));
        toast.success("Added to cart");
      }
    },
    [dispatch, cartList]
  );

  /* ================= BUY NOW ================= */
  const handleBuyNow = (product) => {
    dispatch(setBuyNowItemList({ ...product, quantity: 1 }));
    router.push("/checkout?page=buy_now");
  };

  /* ================= INCREMENT ================= */
  const handleIncrement = useCallback(
    (cartItem) => {
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

      if (cartItem.quantity >= effectiveStock) {
        toast.error(`Only ${effectiveStock} items allowed.`, { id: "max-qty-toast" });
        return;
      }

      dispatch(setCartItemQuantity({ id: cartItem.id, quantity: cartItem.quantity + 1 }));
    },
    [dispatch]
  );

  /* ================= DECREMENT ================= */
  const handleDecrement = useCallback(
    (cartItem) => {
      if (cartItem.quantity === 1) {
        dispatch(setCart(null));
        toast.success(`${cartItem.name} removed from cart`);
        return;
      }
      dispatch(setCartItemQuantity({ id: cartItem.id, quantity: cartItem.quantity - 1 }));
    },
    [dispatch]
  );

  /* ================= RENDER ADD BUTTON ================= */
  const renderAddButton = (item) => {
    const cartItem = getCartItem(item.id);
    const selectedVar = item?.variations?.[0] ?? null;
    const effectiveStock = getEffectiveStock(item, selectedVar);
    const isOutOfStock = effectiveStock <= 0;
    const isMaxReached = cartItem ? cartItem.quantity >= effectiveStock : false;
    const buttonWidth = "70px";

    // ✅ Out of Stock — same red button as GroceryPharmacyCard
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

    // ✅ Not in cart
    if (!cartItem) {
      return (
        <Button
          variant="outlined"
          size="small"
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
          ADD
        </Button>
      );
    }

    // ✅ In cart — max reached check on + button
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
        {/* Decrement */}
        <Box
          onClick={(e) => { e.stopPropagation(); handleDecrement(cartItem); }}
          sx={{
            width: "20px", height: "20px",
            display: "flex", alignItems: "center", justifyContent: "center",
            backgroundColor: "#f1f1f1", borderRadius: "4px", cursor: "pointer",
          }}
        >
          <Typography sx={{ fontSize: "14px" }}>−</Typography>
        </Box>

        {/* Quantity */}
        <Typography fontWeight={600} sx={{ fontSize: "14px" }}>
          {cartItem.quantity}
        </Typography>

        {/* Increment — greyed out if max reached */}
        <Box
          onClick={(e) => {
            e.stopPropagation();
            if (!isMaxReached) handleIncrement(cartItem);
            else toast.error(`Only ${effectiveStock} items allowed.`, { id: "max-qty" });
          }}
          sx={{
            width: "20px", height: "20px",
            display: "flex", alignItems: "center", justifyContent: "center",
            backgroundColor: isMaxReached ? "#e0e0e0" : "#f1f1f1",
            borderRadius: "4px",
            cursor: isMaxReached ? "not-allowed" : "pointer",
            opacity: isMaxReached ? 0.5 : 1,
          }}
        >
          <Typography sx={{ fontSize: "14px", color: isMaxReached ? "#aaa" : "inherit" }}>
            +
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <>
      <Box>
        <Toaster
          position="top-center"
          toastOptions={{
            style: { boxShadow: "none", WebkitBoxShadow: "none", MozBoxShadow: "none" },
          }}
        />

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {products?.map((item) => {
            const variation = item?.variations?.[0];
            const unitLabel = variation?.type || "";
            const price = Number(variation?.price ?? item?.price) || 0;
            const discount = Number(item?.discount) || 0;
            const discountType = item?.discount_type || "percent";

            const discountedPrice =
              discount > 0
                ? discountType === "percent"
                  ? price - (price * discount) / 100
                  : price - discount
                : price;

            const formattedPrice = Number.isInteger(discountedPrice)
              ? discountedPrice
              : discountedPrice.toFixed(2);

            const unitType = item?.unit?.unit || "";

            return (
              <Box
                key={item.id}
                onClick={() => { setSelectedProduct(item); setOpenModal(true); }}
                sx={{
                  width: 170,
                  height: 240,                   
                  border: "1px solid #E3E8EE",
                  borderRadius: "14px",
                  p: 1.2,
                  position: "relative",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  boxSizing: "border-box",
                }}
              >
                {/* Discount Badge */}
                {discount > 0 && (
                  <Box sx={{
                    position: "absolute", top: 0, left: 10,
                    background: "#1A914B", color: "#fff",
                    fontWeight: 700, fontSize: "0.5rem",
                    padding: "6px 8px", width: "30px", textAlign: "center",
                    clipPath: `polygon(0 0,100% 0,100% 85%,90% 100%,80% 85%,70% 100%,60% 85%,50% 100%,40% 85%,30% 100%,20% 85%,10% 100%,0 85%)`,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)", zIndex: 5,
                  }}>
                    {discount}% OFF
                  </Box>
                )}

                {/* Wishlist Icon */}
                <Box
                  onClick={(e) => {
                    e.stopPropagation();
                    isWishlisted(item) ? removeFromWishlist(item, e) : addToWishlist(item, e);
                  }}
                  sx={{
                    position: "absolute", top: 5, right: 5,
                    width: 34, height: 34, borderRadius: "12px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", zIndex: 5, transition: "all 0.2s ease",
                    "&:hover": { transform: "scale(1.05)" },
                  }}
                >
                  {isWishlisted(item)
                    ? <FavoriteIcon sx={{ color: "#E53935", fontSize: 20 }} />
                    : <FavoriteBorderIcon sx={{ color: "#c4c2c2", fontSize: 20 }} />
                  }
                </Box>

                {/* Image — fixed height, flexShrink 0 */}
                <Box sx={{ mt: 1, flexShrink: 0 }}>
                  <img
                    src={item.image_full_url}
                    alt={item.name}
                    style={{
                      width: "100%", height: 110,
                      objectFit: "cover", borderRadius: "8px", display: "block",
                    }}
                  />
                </Box>

                {/* Name + Rating — fixed single line */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: "center", flexShrink: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: 'bold',
                      maxWidth: 110,
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      fontSize: "0.9rem",
                    }}
                  >
                    {item.name}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: '#e8f5e9', borderRadius: 1, px: 0.75, flexShrink: 0 }}>
                    <StarIcon sx={{ color: "#1A914B", fontSize: 14 }} />
                    <Typography fontWeight="bold" sx={{ fontSize: "0.8rem" }}>
                      {formatRating(item.avg_rating)}
                    </Typography>
                  </Box>
                </Box>

                {/* Store name — single line, ellipsis, fixed height */}
                <Typography
                  variant="body2"
                  sx={{
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    flexShrink: 0,
                  }}
                >
                  {item.store_name}
                </Typography>

                {/* Price — pushed to bottom always */}
                <Box sx={{ display: "flex", flexDirection: "column", mt: "auto" }}>
                  <Typography fontWeight="bold" sx={{ fontSize: "0.9rem", color: "#1A914B", lineHeight: 1.2 }}>
                    ₹{formattedPrice}
                  </Typography>
                  {discount > 0 && (
                    <Typography variant="caption" sx={{ textDecoration: "line-through", color: "text.disabled", fontSize: "0.7rem" }}>
                      ₹{price}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* FoodPopup */}
        <FoodPopup
          open={openModal}
          onClose={() => setOpenModal(false)}
          product={selectedProduct}
          onBuyNow={handleBuyNow}
        />
      </Box>
    </>
  );
};

export default FoodCard;