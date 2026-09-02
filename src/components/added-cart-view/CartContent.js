import React, { useState, useEffect } from "react";
import { Typography, useMediaQuery } from "@mui/material";
import CustomImageContainer from "../CustomImageContainer";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import {
  getAmountWithSign,
  getDiscountedAmount,
} from "helper-functions/CardHelpers";
import { Stack, Box } from "@mui/system";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import IconButton from "@mui/material/IconButton";
import { useDispatch } from "react-redux";
import {
  setDecrementToCartItem,
  setIncrementToCartItem,
  setRemoveItemFromCart,
  fetchCartFromApi,
} from "redux/slices/cart";
import { toast, Toaster } from "react-hot-toast";
import { t } from "i18next";
import {
  cart_item_remove,
  out_of_limits,
  out_of_stock,
} from "utils/toasterMessages";
import { getCurrentModuleType } from "helper-functions/getCurrentModuleType";
import { CartIncrementStack } from "./Cart.style";
import CustomDivider from "../CustomDivider";
import { useTheme } from "@emotion/react";
import useDeleteCartItem from "../../api-manage/hooks/react-query/add-cart/useDeleteCartItem";
import useCartItemUpdate from "../../api-manage/hooks/react-query/add-cart/useCartItemUpdate";
import { getItemDataForAddToCart } from "../product-details/product-details-section/helperFunction";
import Loading from "../custom-loading/Loading";
import {
  getTotalVariationsPrice,
  handleTotalAmountWithAddons,
} from "utils/CustomFunctions";

/* =====================================================================================
      🚀 CART CONTENT COMPONENT WITH DEBUGGING + CLEAN INCREMENT/DECREMENT LOGIC
===================================================================================== */

const CartContent = (props) => {
  const { cartItem, imageBaseUrl } = props;
  const dispatch = useDispatch();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));

  const moduleData = JSON.parse(localStorage.getItem("module"));
  const currentModuleType = moduleData?.module_type;
  const isFood = currentModuleType === "food";

  const selectedAddons = isFood
    ? (cartItem?.addons || cartItem?.product?.addons || []).filter(
        (a) => a?.isChecked || a?.isSelected || a?.quantity > 0,
      )
    : (cartItem?.selectedAddons || []).filter(
        (addon) => addon?.isChecked || addon?.isSelected,
      );

  /* =====================================================
     DEBUG LOGS
  ===================================================== */
  useEffect(() => {
    // console.group("🛒 CART CONTENT DEBUG");
    // console.log("🛒 cartItem:", cartItem);
    // console.log(cartItem?.selectedOption?.[0]?.type);
    // console.log("🧩 cartItem.module_type:", cartItem?.module_type);
    // console.log("📦 localStorage.module:", moduleData);
    // console.log("📦 localStorage.module_type:", currentModuleType);
    // console.log(
    //   "✅ MODULE MATCH:",
    //   String(cartItem?.module_type) === String(currentModuleType)
    // );
    // console.groupEnd();
  }, [cartItem, currentModuleType]);

  /* =====================================================
     MODULE FILTER (IMPORTANT)
  ===================================================== */
  // if (String(cartItem?.module_type) !== String(currentModuleType)) {
  //   console.warn(
  //     "❌ Cart item hidden (module mismatch)",
  //     cartItem?.module_type,
  //     currentModuleType
  //   );
  //   return null;
  // }

  /* =====================================================
     PRICE CALCULATION
  ===================================================== */
  const getTotalVariationPriceNew = (foodVariations = []) => {
    let total = 0;

    foodVariations.forEach((variation) => {
      const valuesToShow = Array.isArray(variation.values_to_show)
        ? variation.values_to_show
        : [];

      valuesToShow.forEach((v) => {
        if (v?.isSelected) {
          total += Number(v.optionPrice || 0);
        }
      });
    });

    return total;
  };

  const getUpdatedPrice = (item, qty) => {
    if (isFood) {
      const priceData = getFoodFinalPrice({
        ...item,
        quantity: 1, // ❗ per unit calculate karo
      });

      return priceData.discountedPrice * qty; // ❗ qty multiply yaha karo
    }

    const basePrice = item?.selectedOption?.[0]?.price ?? item.price;

    return basePrice * qty;
  };
  const getBaseDiscountedPrice = (item, qty) => {
    const basePrice = Number(item.price || 0);

    const discount = item?.product?.discount || 0;
    const discountType = item?.product?.discount_type || "percent";

    let discountedUnit = basePrice;

    if (discount > 0) {
      if (discountType === "percent") {
        discountedUnit = basePrice - (basePrice * discount) / 100;
      } else {
        discountedUnit = basePrice - discount;
      }
    }

    return discountedUnit * qty;
  };
  /* =====================================================
   INCREMENT
==================================================== */
  const handleIncrement = () => {
    const newQty = cartItem.quantity + 1;

    const maxCartQty = cartItem?.maximum_cart_quantity;
    const variationStock = cartItem?.selectedOption?.[0]?.stock;
    const productStock = cartItem?.product?.stock;

    // 1. Variation stock check
    if (variationStock && newQty > variationStock) {
      toast.error(`Only ${variationStock} items available for this variation.`);
      return;
    }

    // 2. Product stock check
    if (productStock && newQty > productStock) {
      toast.error(`Only ${productStock} items available in stock.`);
      return;
    }

    // 3. Max cart quantity check
    if (maxCartQty && newQty > maxCartQty) {
      toast.error(`You can only add ${maxCartQty} items of this product.`);
      return;
    }

    const newTotal = getUpdatedPrice(cartItem, newQty);

    dispatch(
      setIncrementToCartItem({
        ...cartItem,
        quantity: newQty,
        totalPrice: newTotal,
      }),
    );
  };

  /* =====================================================
   DECREMENT
==================================================== */
  const handleDecrement = () => {
    // console.log("🔽 Decrement clicked");
    // console.log("🚦 Current Quantity: ", cartItem.quantity);
    // console.log("🚦 Current Total Price: ", cartItem.totalPrice);

    const newQty = cartItem.quantity - 1;
    if (newQty === 0) {
      // console.log("🔴 Quantity reached zero. Removing item from cart...");
      handleRemove();
      return;
    }

    const newTotal = getUpdatedPrice(cartItem, newQty);
    // console.log("🔽 New Total Price: ", newTotal);

    dispatch(
      setDecrementToCartItem({
        ...cartItem,
        quantity: newQty,
        totalPrice: newTotal,
      }),
    );
    // console.log("✅ Decrement successfully dispatched!");
  };

  /* =====================================================
     REMOVE
  ===================================================== */
 const handleRemove = () => {
  dispatch(
    setRemoveItemFromCart({
      cartItemKey: cartItem.cartItemKey,
      cartItemId: cartItem.cartItemId,
    }),
  );
  toast.success(t(cart_item_remove));

};

  const getFoodFinalPrice = (item) => {
    const basePrice = Number(item.price || 0);
    const variationsPrice = getTotalVariationPriceNew(
      item.food_variations || [],
    );
    const addonsPrice = handleTotalAmountWithAddons(
      0,
      item.addons || item.selectedAddons || [],
    );

    const totalBeforeDiscount = basePrice + variationsPrice + addonsPrice;

    const discountedPrice = getDiscountedAmount(
      totalBeforeDiscount,
      item.product.discount,
      item.product.discount_type,
      item.product.store_discount,
      item.quantity,
    );

    return {
      basePrice,
      variationsPrice,
      addonsPrice,
      totalBeforeDiscount,
      discountedPrice,
    };
  };

  // console.log("FULL CART ITEM:", cartItem);
  // console.log("ADDONS RAW:", cartItem?.addons);
  // console.log("SELECTED ADDONS:", cartItem?.selectedAddons);
  // console.log("FINAL ADDONS:", selectedAddons);
  return (
    <>
      
      <Stack
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", // Responsive columns

          padding: "1rem", // Padding around the entire grid
          overflowX: "auto", // Horizontal scrolling for extra items
        }}
      >
        {/* Product Item */}

        <CustomStackFullWidth
          direction="row"
          sx={{
            width: "100%",
            // padding: "0.2rem 0.3rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            backgroundColor: "#fff",

            gap: 1,
          }}
        >
          {/* ================= Image Section ================= */}
          <Stack
            // onClick={() => console.log("Product clicked")}
            sx={{
              cursor: "pointer",
              flex: "0 0 60px",
              width: { xs: "50px", sm: "60px" },
              height: { xs: "50px", sm: "60px" },
            }}
          >
            <CustomImageContainer
              height="65px"
              width="65px"
              src={cartItem?.image_full_url}
              borderRadius="5px"
              objectfit="cover"
              border="1.5px solid #C9C9C9"
            />
          </Stack>

          {/* ================= Text Section ================= */}
          <Stack
            flex="1"
            spacing={0.2}
            marginRight={"40px"}
            marginLeft={"10px"}
            sx={{
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            {/* Product Name */}

            <Typography
              fontWeight={600}
              color={"#000000"}
              fontSize={{ xs: "10px", sm: "12px" }}
              noWrap
              title={cartItem?.name}
            >
              {cartItem?.name}
              {getCurrentModuleType() === "food" &&
                ` (${cartItem?.product.unit_type})`}
            </Typography>

            {/* Food Module: Variations count */}
            {getCurrentModuleType() === "food" &&
              cartItem?.food_variations?.length > 0 && (
                <Typography
                  fontSize={{ xs: "10px", sm: "12px" }}
                  color="text.secondary"
                  sx={{ mt: 0.2 }}
                >
                  Variation x
                  {cartItem.food_variations.reduce((acc, v) => {
                    const selected = Array.isArray(v.values_to_show)
                      ? v.values_to_show.filter((x) => x.isSelected).length
                      : 0;
                    return acc + selected;
                  }, 0)}
                </Typography>
              )}

            {/* Food Module: Addons count */}
            {getCurrentModuleType() === "food" &&
              selectedAddons?.length > 0 && (
                <Typography
                  fontSize={{ xs: "10px", sm: "12px" }}
                  color="text.secondary"
                  sx={{ mt: 0.2 }}
                >
                  Add On x{selectedAddons.length}
                </Typography>
              )}

            {/* Non-food selected option */}
            {getCurrentModuleType() !== "food" &&
              cartItem?.selectedOption?.[0]?.type && (
                <Typography
                  fontSize={{ xs: "8px", sm: "10px" }}
                  color="text.secondary"
                >
                  {cartItem?.selectedOption?.[0]?.type}
                  {cartItem.product.unit_type}
                </Typography>
              )}

            {/* Price */}
            {isFood ? (
              <Typography
                fontWeight={600}
                fontSize={{ xs: "10px", sm: "12px" }}
                color="primary.main"
                sx={{ mt: 0.3 }}
              >
                {/* Total Price (discounted) */}
                <span style={{ fontWeight: 600, color: "green" }}>
                  {getAmountWithSign(
                    getBaseDiscountedPrice(cartItem, cartItem.quantity),
                  )}
                </span>

                {/* Base Price (line-through) */}
                <span
                  style={{
                    textDecoration: "line-through",
                    color: "gray",
                    marginLeft: "4px",
                  }}
                >
                  {getAmountWithSign(cartItem.price * cartItem.quantity)}
                </span>
              </Typography>
            ) : (
              <Typography
                fontWeight={600}
                fontSize={{ xs: "10px", sm: "12px" }}
                color="primary.main"
                sx={{ mt: 0.3 }}
              >
                {/* Discounted Price for non-food */}
                <span style={{ fontWeight: 600, color: "green" }}>
                  {getAmountWithSign(
                    handleTotalAmountWithAddons(
                      getDiscountedAmount(
                        cartItem?.totalPrice,
                        cartItem?.product.discount,
                        cartItem?.product.discount_type,
                        cartItem?.product.store_discount,
                        cartItem?.quantity,
                      ),
                      cartItem?.selectedAddons,
                    ),
                  )}
                </span>

                {/* Original Price for non-food */}
                <span
                  style={{
                    textDecoration: "line-through",
                    color: "gray",
                    marginLeft: "4px",
                  }}
                >
                  ₹{cartItem?.totalPrice}
                </span>
              </Typography>
            )}
          </Stack>

          {/* ================= Increment / Decrement ================= */}
          <CartIncrementStack
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 1,
              minWidth: { xs: "40px", sm: "30px" },
              padding: "3px 2px",
              borderRadius: "5px",
              backgroundColor: "green",
              justifyContent: "space-between",
              alignItems: "center",
              my: "auto",
            }}
          >
            <IconButton
              aria-label="decrease quantity"
              size="small"
              onClick={handleDecrement}
              sx={{ p: 0.2, color: "white" }}
            >
              <RemoveIcon
                sx={{ fontSize: { xs: 10, sm: 12 }, color: "white" }}
              />
            </IconButton>

            <Typography
              fontSize={{ xs: "10px", sm: "12px" }}
              fontWeight={600}
              color="white"
            >
              {cartItem?.quantity}
            </Typography>

            <IconButton
              aria-label="increase quantity"
              size="small"
              onClick={handleIncrement}
              sx={{ p: 0.2, color: "white" }}
            >
              <AddIcon sx={{ fontSize: { xs: 10, sm: 12 }, color: "white" }} />
            </IconButton>
          </CartIncrementStack>
        </CustomStackFullWidth>
      </Stack>
    </>
  );
};

CartContent.propTypes = {};

export default CartContent;
