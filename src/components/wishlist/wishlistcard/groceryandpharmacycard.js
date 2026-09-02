"use client";

import { useState, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

import useAddCartItem from "api-manage/hooks/react-query/add-cart/useAddCartItem";
import {
  setIncrementToCartItem,
  setDecrementToCartItem,
  setRemoveItemFromCart,
  fetchCartFromApi,
} from "redux/slices/cart";

import { getCorrectCart } from "helper-functions/getCorrectCart";
import { getItemDataForAddToCart } from "components/product-details/product-details-section/helperFunction";
import { getGuestId } from "helper-functions/getToken";
import { getTotalVariationsPrice } from "utils/CustomFunctions";
import { getCurrentModuleType } from "helper-functions/getCurrentModuleType";
import { setModalFor, setSignInModalOpen } from "redux/slices/utils";
import useWishlistHandler from "components/home/search/pathflow/wishlisthandler";
import Perticular from "components/home/module-wise-components/Grocerysubcomponent/PerticularProduct";
import { useTranslation } from "react-i18next";

// ✅ 17 characters ke baad ...
const truncateName = (name) => {
  if (!name) return "";
  return name.length > 17 ? name.slice(0, 17) + "..." : name;
};

const getUserIdentifier = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? token : getGuestId();
};

// ✅ GrocerySession se liya — variation first, product fallback, maxCartQty last resort
const getEffectiveStock = (product, selectedVar = null) => {
  const variationStock = selectedVar?.stock ?? product?.variations?.[0]?.stock;
  const productStock = product?.stock;
  const maxCartQty = product?.maximum_cart_quantity;
  if (variationStock != null && variationStock > 0) return variationStock;
  if (productStock != null && productStock > 0) return productStock;
  if (maxCartQty != null && maxCartQty > 0) return maxCartQty;
  return 0;
};

// ✅ GrocerySession se liya
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

const GroceryPharmacyCard = ({ products }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const cartList = useSelector((state) => getCorrectCart(state));
  const addCartMutation = useAddCartItem();

  const { addToWishlist, removeFromWishlist, isWishlisted } =
    useWishlistHandler(t);

  const [addingProductId, setAddingProductId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [variationModalOpen, setVariationModalOpen] = useState(false);
  const [variationProduct, setVariationProduct] = useState(null);

  const getCartItemByProductId = (productId) =>
    cartList?.find((item) => Number(item?.id) === Number(productId));

  /* ================= ADD TO CART ================= */
  const handleAddToCart = useCallback(
    (product, selectedVar = null) => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        toast.error("Please log in to continue.");
        dispatch(setModalFor("sign-in"));
        dispatch(setSignInModalOpen(true));
        return;
      }

      if (
        Array.isArray(product?.variations) &&
        product.variations.length > 0 &&
        !selectedVar
      ) {
        if (product.variations.length === 1) {
          selectedVar = product.variations[0];
        } else {
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
          `Only ${effectiveStock} items allowed. You already have ${existingQty} in cart.`
        );
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
        onError: () => {
          setAddingProductId(null);
        },
      });
    },
    [dispatch, addCartMutation]
  );

  /* ================= INCREMENT ================= */
  const handleIncrement = useCallback(
    (cartItem) => {
      const userId = getUserIdentifier();

      // ✅ GrocerySession se liya — variation first, product fallback
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
        toast.error(`Only ${effectiveStock} items allowed.`, {
          id: "max-qty-toast",
        });
        return;
      }

      const newQty = cartItem.quantity + 1;
      dispatch(
        setIncrementToCartItem({
          ...cartItem,
          quantity: newQty,
          totalPrice: getUpdatedPrice(cartItem, newQty),
          userId,
        })
      );
      setTimeout(() => dispatch(fetchCartFromApi()), 600);
    },
    [dispatch]
  );

  /* ================= DECREMENT ================= */
  const handleDecrement = useCallback(
    (cartItem) => {
      const userId = getUserIdentifier();
      const newQty = cartItem.quantity - 1;

      if (newQty <= 0) {
        dispatch(
          setRemoveItemFromCart({
            cartItemKey: cartItem.cartItemKey,
            cartItemId: cartItem.cartItemId,
            userId,
          })
        );
        toast.success(`${cartItem.name} removed from cart`);
        setTimeout(() => dispatch(fetchCartFromApi()), 300);
        return;
      }

      dispatch(
        setDecrementToCartItem({
          ...cartItem,
          quantity: newQty,
          totalPrice: getUpdatedPrice(cartItem, newQty),
          userId,
        })
      );
      setTimeout(() => dispatch(fetchCartFromApi()), 600);
    },
    [dispatch]
  );

  /* ================= RENDER ADD BUTTON ================= */
  const renderAddButton = (item) => {
    const cartItem = getCartItemByProductId(item.id);

    const selectedVar = item?.variations?.[0] ?? null;
    const effectiveStock = getEffectiveStock(item, selectedVar);
    const isOutOfStock = effectiveStock <= 0;
    const isMaxReached = cartItem ? cartItem.quantity >= effectiveStock : false;
    const buttonWidth = "70px";

    // ✅ Out of Stock UI — GrocerySession se liya
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
          disabled={addingProductId === item.id}
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart(item);
          }}
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

        {/* Increment — disabled if max reached */}
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
                onClick={() => { setSelectedProduct(item); setOpenPreview(true); }}
                sx={{
                  width: 160,
                  border: "1px solid #E3E8EE",
                  borderRadius: "14px",
                  p: 1.2,
                  position: "relative",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                {/* Discount Badge */}
                {item.discount > 0 && (
                  <Box sx={{
                    position: "absolute",
                    top: 0, left: 10,
                    background: "#1A914B", color: "#fff",
                    fontWeight: 700, fontSize: "0.5rem",
                    padding: "6px 8px", width: "30px", textAlign: "center",
                    clipPath: `polygon(0 0,100% 0,100% 85%,90% 100%,80% 85%,70% 100%,60% 85%,50% 100%,40% 85%,30% 100%,20% 85%,10% 100%,0 85%)`,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)", zIndex: 5,
                  }}>
                    {item.discount}% OFF
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

                {/* Image */}
                <Box sx={{ mt: 1 }}>
                  <img
                    src={item.image_full_url}
                    alt={item.name}
                    style={{
                      width: "100%", height: 110,
                      objectFit: "cover", borderRadius: "8px", display: "block",
                    }}
                  />
                </Box>

                {/* Name — 17 chars */}
                <Typography
                  fontWeight={600}
                  title={item.name}
                  sx={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}
                >
                  {truncateName(item.name)}
                </Typography>

                {/* Unit */}
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.78rem" }}>
                  {unitLabel}{unitType}
                </Typography>

                {/* Price + Add */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography fontWeight="bold" sx={{ fontSize: "0.9rem", color: "#1A914B", lineHeight: 1.2 }}>
                      ₹{formattedPrice}
                    </Typography>
                    {discount > 0 && (
                      <Typography variant="caption" sx={{ textDecoration: "line-through", color: "text.disabled", fontSize: "0.7rem" }}>
                        ₹{price}
                      </Typography>
                    )}
                  </Box>
                  <Box>{renderAddButton(item)}</Box>
                </Box>
              </Box>
            );
          })}

          {/* Variation Modal */}
          {variationModalOpen && variationProduct && (
            <Dialog
              open={variationModalOpen}
              onClose={() => setVariationModalOpen(false)}
              fullWidth maxWidth="xs"
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
                      sx={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        mb: 1.5, p: 1, borderRadius: 1, border: "1px dashed #e0e0e0",
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Box
                          component="img"
                          src={variationProduct.image_full_url}
                          alt={variation.type}
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
                        variant="outlined" size="small"
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

          {/* Product Preview */}
          {selectedProduct && (
            <Perticular
              open={openPreview}
              onClose={() => setOpenPreview(false)}
              product={selectedProduct}
              isWishlisted={false}
              addToWishlist={() => {}}
              removeFromWishlist={() => {}}
            />
          )}
        </Box>
      </Box>
    </>
  );
};

export default GroceryPharmacyCard;