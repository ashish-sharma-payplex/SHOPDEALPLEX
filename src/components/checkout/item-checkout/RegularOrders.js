// src\components\checkout\item-checkout\RegularOrders.js
import { Grid, Stack, Typography, Button, IconButton } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import { useTheme } from "@mui/material/styles";
import { Box } from "@mui/system";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useDispatch, useSelector } from "react-redux";
import {
  setCartList,
  setIncrementToCartItem,
  setDecrementToCartItem,
  setRemoveItemFromCart,
  setBuyNowItemList,
} from "../../../redux/slices/cart";
import { useRouter } from "next/router";
import { getAmountWithSign } from "../../../helper-functions/CardHelpers";
import { CustomStackFullWidth } from "../../../styled-components/CustomStyles.style";
import { handleProductValueWithOutDiscount } from "../../../utils/CustomFunctions";
import CustomImageContainer from "../../CustomImageContainer";
import VariationContent from "../../added-cart-view/VariationContent";
import DeleteOutlineIcon from "@mui/icons-material/Delete";
import {
  OrderFoodAmount,
  OrderFoodName,
  OrderFoodSubtitle,
} from "../CheckOut.style";
import toast from "react-hot-toast";

export const VegNonveg = ({ theme, item, t }) => {
  return (
    <Stack
      sx={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        background: (theme) => theme.palette.primary.overLay,
        opacity: "0.6",
        padding: "10px",
        height: "30%",
        alignItems: "center",
        justifyContent: "center",
        borderBottomRightRadius: "10px",
        borderBottomLeftRadius: "10px",
      }}
    >
      <Typography align="center" color={theme.palette.neutral[100]}>
        {item?.veg === 0 ? t("Non-Veg") : t("Veg")}
      </Typography>
    </Stack>
  );
};

const RegularOrders = (props) => {
  const { configData, cartList, t, isSmall } = props;
  const theme = useTheme();
  const productBaseUrl = configData?.base_urls?.item_image_url;
  const dispatch = useDispatch();
  const router = useRouter();
  const { page } = router.query;
  const buyNowItemList = useSelector((state) => state.cart.buyNowItemList);
  /* =====================================================
   READ MODULE FROM LOCALSTORAGE
  ===================================================== */
  const moduleData = JSON.parse(localStorage.getItem("module"));
  const currentModuleType = moduleData?.module_type;

  const getUpdatedPrice = (item, qty) => {
    const isFood = currentModuleType === "food";
    const base = isFood
      ? item.price
      : item?.selectedOption?.[0]?.price ?? item.price;

    // Apply discount if available
    const discount = item.discount || 0;
    const discountType = item.discount_type || "percent"; // default to percentage

    let finalPrice = base * qty;

    if (discount > 0) {
      if (discountType === "percent") {
        finalPrice = finalPrice - (finalPrice * discount) / 100;
      } else {
        finalPrice = finalPrice - discount;
      }
    }

    return finalPrice;
  };

  const getBaseItemPrice = (item) => {
    const isFood = currentModuleType === "food";

    // Food module: item.price hi base hota hai
    if (isFood) {
      return item.price;
    }

    // Other modules: selected option ka price ya fallback
    return item?.selectedOption?.[0]?.price ?? item.price;
  };

  /* ================= HANDLE INCREASE QUANTITY ================= */
  const handleIncreaseQuantity = (index) => {
    const updatedItem = cartList[index];
    const newQty = updatedItem.quantity + 1;
    const newTotalPrice = getUpdatedPrice(updatedItem, newQty);

    if (page === "buy_now") {
      // ✅ buyNowItemList update — cart bilkul mat chheḍo
      dispatch(
        setBuyNowItemList({
          ...updatedItem,
          quantity: newQty,
          totalPrice: newTotalPrice,
        }),
      );
      return;
    }

    // ✅ Cart flow — unchanged
    dispatch(
      setIncrementToCartItem({
        ...updatedItem,
        quantity: newQty,
        totalPrice: newTotalPrice,
        cartItemKey: updatedItem.cartItemKey,
        cartItemId: updatedItem.cartItemId,
      }),
    );
  };

  // RegularOrders.js — sirf ye 2 functions change karo

  // ✅ FIX 1: getBaseDiscountedPrice — price correctly le
  const getBaseDiscountedPrice = (item, qty) => {
    const basePrice =
      item?.variation?.[0]?.price ??
      item?.selectedOption?.[0]?.price ??
      item?.product?.price ??
      item?.price ??
      0;

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

    return discountedUnit * qty; // ✅ quantity included
  };

  /* ================= HANDLE DECREASE QUANTITY ================= */
  const handleDecreaseQuantity = (index) => {
    const updatedItem = cartList[index];

    if (page === "buy_now") {
      if (updatedItem.quantity <= 1) return; // Buy Now me 1 se neeche mat jao
      const newQty = updatedItem.quantity - 1;
      const newTotalPrice = getUpdatedPrice(updatedItem, newQty);
      dispatch(
        setBuyNowItemList({
          ...updatedItem,
          quantity: newQty,
          totalPrice: newTotalPrice,
        }),
      );
      return;
    }

    // ✅ Cart flow — unchanged
    if (updatedItem.quantity === 1) {
      dispatch(
        setRemoveItemFromCart({
          cartItemKey: updatedItem.cartItemKey,
          cartItemId: updatedItem.cartItemId,
        }),
      );
      return;
    }

    const newQty = updatedItem.quantity - 1;
    const newTotalPrice = getUpdatedPrice(updatedItem, newQty);
    dispatch(
      setDecrementToCartItem({
        ...updatedItem,
        quantity: newQty,
        totalPrice: newTotalPrice,
      }),
    );
  };

  const handleAddMoreItems = () => {
    router.push("/home"); // or your product listing page
  };

  return (
    <>
      {cartList.length > 0 ? (
        cartList.map((item, index) => {
          // console.log("🔍 ITEM STRUCTURE:", {
          //   name: item?.name,
          //   price: item?.price,
          //   variation: item?.variation,
          //   "variation[0]?.price": item?.variation?.[0]?.price,
          //   "selectedOption[0]?.price": item?.selectedOption?.[0]?.price,
          //   "product?.price": item?.product?.price,
          //   "product?.discount": item?.product?.discount,
          //   "product?.discount_type": item?.product?.discount_type,
          //   module_type: item?.module_type,
          // });
          const variationCount =
            currentModuleType === "food"
              ? item?.variation?.reduce((acc, v) => {
                  const count =
                    v?.values_to_show?.filter((val) => val.isSelected)
                      ?.length || 0;
                  return acc + count;
                }, 0)
              : 0;

          const addonCount =
            item?.addons?.filter((a) => a.isChecked)?.length || 0;

          const addonText =
            item?.addons
              ?.filter((a) => a.isChecked)
              ?.map((a) => a.name)
              ?.join(", ") || "";

          return (
            <Stack
              key={index}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              width="100%" // ✅ ADD THIS
              border="1px solid #e0e0e0"
              sx={{
                background: "#fff",
                borderRadius: "12px",
                padding: "12px",
                mb: 1,
                mt: 0,
                ml: 1,
              }}
            >
              {/* LEFT IMAGE */}
              <Stack
                sx={{
                  width: 55,
                  height: 55,
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "1px solid #eee",
                }}
              >
                <CustomImageContainer
                  src={item?.image_full_url}
                  height="100%"
                  width="100%"
                />
              </Stack>

              {/* CENTER CONTENT */}
              <Stack flex={1} ml={1.5} spacing={0.4}>
                <Typography fontSize="13px" fontWeight={600}>
                  {item.name}
                </Typography>

                {currentModuleType !== "food" &&
                  item?.variation?.length > 0 && (
                    <Typography fontSize="11px" color="text.secondary">
                      {item.variation[0]?.type} {item?.product?.unit_type}
                    </Typography>
                  )}

                {currentModuleType === "food" && variationCount > 0 && (
                  <Typography fontSize="11px" color="text.secondary">
                    Variation x{variationCount}
                  </Typography>
                )}

                {currentModuleType === "food" && addonCount > 0 && (
                  <Typography fontSize="11px" color="text.secondary">
                    Add On x{addonCount}
                  </Typography>
                )}

                {/* {addonText && (
                  <Typography fontSize="11px" color="text.secondary">
                    Add on: {addonText}
                  </Typography>
                )} */}
                {/* ================= PRICE BLOCK ================= */}
                <Stack direction="row" spacing={1} alignItems="center">
                  {currentModuleType === "food" ? (
                    <>
                      {/* Final / discounted price */}
                      <Typography
                        fontSize="13px"
                        fontWeight={600}
                        color="green"
                      >
                        {getAmountWithSign(
                          getBaseDiscountedPrice(item, item.quantity),
                        )}
                      </Typography>

                      {/* Original price, line-through if discount */}
                      {item?.product?.discount > 0 && (
                        <Typography
                          sx={{
                            textDecoration: "line-through",
                            color: "#ADADAD",
                            fontSize: "0.85rem",
                          }}
                        >
                          {getAmountWithSign(item.price * item.quantity)}
                        </Typography>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Non-food price */}
                      {/* <Typography
                        sx={{
                          textDecoration:
                            item?.product?.discount && item.product.discount > 0
                              ? "line-through"
                              : "none",
                          color:
                            item?.product?.discount && item.product.discount > 0
                              ? "#ADADAD"
                              : "#000",
                          fontSize: "0.85rem",
                        }}
                      >
                        ₹
                        {(
                          item?.variation?.[0]?.price ??
                          item?.selectedOption?.[0]?.price ??
                          item?.product?.price ??
                          item?.price ??
                          0
                        )?.toLocaleString(undefined, {
                          minimumFractionDigits:
                            (item?.variation?.[0]?.price ??
                              item?.selectedOption?.[0]?.price ??
                              item?.product?.price ??
                              item?.price ??
                              0) %
                              1 ===
                            0
                              ? 0
                              : 2,
                        })}
                      </Typography> */}

                      {/* Discounted non-food price */}
                      {/* Original Price */}
                      <Typography
                        sx={{
                          textDecoration:
                            item?.product?.discount > 0
                              ? "line-through"
                              : "none",
                          color:
                            item?.product?.discount > 0 ? "#ADADAD" : "#000",
                          fontSize: "0.85rem",
                        }}
                      >
                        {getAmountWithSign(
                          (item?.variation?.[0]?.price ??
                            item?.selectedOption?.[0]?.price ??
                            item?.product?.price ??
                            item?.price ??
                            0) * item.quantity,
                        )}
                      </Typography>

                      {/* Discounted Price */}
                      {item?.product?.discount > 0 && (
                        <Typography
                          fontSize="13px"
                          fontWeight={600}
                          color="green"
                        >
                          {getAmountWithSign(
                            getBaseDiscountedPrice(item, item.quantity),
                          )}
                        </Typography>
                      )}
                    </>
                  )}
                </Stack>
              </Stack>

              {/* RIGHT QTY BUTTON */}
              <Stack
                direction="row"
                alignItems="center"
                sx={{
                  background: "#1dbf73",
                  borderRadius: "8px",
                  px: 1,
                  height: 34,
                }}
              >
                {item.quantity > 1 ? (
                  <IconButton
                    size="small"
                    onClick={() => handleDecreaseQuantity(index)}
                    sx={{ color: "#fff" }}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                ) : (
                  // ✅ FIX 2: Trash can — buy_now pe clear + redirect, cart pe normal remove
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (page === "buy_now") {
                        // buy_now item hata do aur home pe bhejo
                        dispatch(setBuyNowItemList([])); // list clear
                        router.push("/"); // redirect
                        return;
                      }
                      dispatch(
                        setRemoveItemFromCart({
                          cartItemKey: item.cartItemKey,
                          cartItemId: item.cartItemId,
                        }),
                      );
                    }}
                    sx={{ color: "#fff" }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                )}

                <Typography sx={{ color: "#fff", fontWeight: 600, px: 0.5 }}>
                  {item.quantity}
                </Typography>

                <IconButton
                  size="small"
                  onClick={() => {
                    const maxQuantity = Math.min(
                      item.maximum_cart_quantity ?? Infinity,
                      item.variation?.[0]?.stock ?? Infinity,
                    );

                    if (item.quantity < maxQuantity) {
                      handleIncreaseQuantity(index);
                    } else {
                      // Show a message when max quantity reached
                      toast.error("You can't add more than the maximum quantity for this item!")
                      // If you have a toast/snackbar system, use that instead
                      // e.g., toast.error("You can't add more than max quantity!");
                    }
                  }}
                  sx={{ color: "#fff" }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>
          );
        })
      ) : (
        <Skeleton height={70} />
      )}
    </>
  );
};

RegularOrders.propTypes = {};

export default RegularOrders;
