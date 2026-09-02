import InfoIcon from "@mui/icons-material/Info";
import {
  Checkbox,
  FormControlLabel,
  Grid,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { Box, alpha } from "@mui/system";
import {
  getAmountWithSign,
  getReferDiscount,
} from "helper-functions/CardHelpers";
import { getToken } from "helper-functions/getToken";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { setTotalAmount } from "redux/slices/cart";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import {
  bad_weather_fees,
  getCouponDiscount,
  getDeliveryFees,
  getProductDiscount,
  getSubTotalPrice,
  getTaxableTotalPrice,
  handlePurchasedAmount,
} from "utils/CustomFunctions";
import CustomDivider from "../../CustomDivider";
import { CalculationGrid, TotalGrid } from "../CheckOut.style";

const OrderCalculation = (props) => {
  const {
    cartList,
    normalizedCartList,
    storeData,
    couponDiscount,
    distanceData,
    configData,
    orderType,

    origin,
    destination,
    zoneData,
    setDeliveryFee,
    extraCharge,
    usePartialPayment,
    walletBalance,
    setPayableAmount,
    additionalCharge,
    payableAmount,
    cashbackAmount,
    handleExtraPackaging,
    isPackaging,
    packagingCharge,
    customerData,
    initVauleEx,
    isLoading,
  } = props;
  const storeData1 = storeData;
  const token = getToken();
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useDispatch();
  // const [freeDelivery, setFreeDelivery] = useState("false");
  const { profileInfo } = useSelector((state) => state.profileInfo);
  const tempExtraCharge = extraCharge ?? 0;
  const couponType = "coupon";
  const moduleData = JSON.parse(localStorage.getItem("module"));

  const moduleType = moduleData?.module_type?.toLowerCase?.() || "";

  const isFood = moduleType === "food";

  // console.log("moduleData:", moduleData);
  // console.log("isFood:", isFood);
  function getDeliveryTip() {
    return localStorage.getItem("deliveryTip") || "0";
  }

  // Usage:
  const deliveryTip = getDeliveryTip();
  const effectiveCartList =
    Array.isArray(cartList) &&
    cartList.length > 0 &&
    (cartList[0]?.food_variations?.length > 0 ||
      cartList[0]?.product?.addons?.length > 0)
      ? cartList
      : normalizedCartList;

  const normalizedEffectiveCartList = useMemo(() => {
    return effectiveCartList.map((item) => {
      const newItem = { ...item };

      if (
        (!newItem.food_variations || newItem.food_variations.length === 0) &&
        Array.isArray(newItem.variation)
      ) {
        newItem.food_variations = [...newItem.variation];
      }

      if (
        (!newItem.product?.addons || newItem.product.addons.length === 0) &&
        Array.isArray(newItem.selectedAddons)
      ) {
        newItem.product = {
          ...newItem.product,
          addons: newItem.selectedAddons.map((a) => ({
            ...a,
            isChecked: true,
          })),
        };
      }

      return newItem;
    });
  }, [effectiveCartList]);

  // 1️⃣ pehle subtotal
  const baseItemSubTotal = useMemo(() => {
    let total = 0;

    normalizedEffectiveCartList?.forEach((item) => {
      const qty = Number(item.quantity || 1);
      const basePrice = Number(item?.product?.price ?? item?.price ?? 0);
      total += basePrice * qty;
    });

    return total;
  }, [normalizedEffectiveCartList]);

  // 2️⃣ phir discount
  // 2️⃣ phir discount
  const baseDiscount = useMemo(() => {
    if (!isFood) return 0; // ✅ non-food modules: kuch nahi badla

    let totalDiscount = 0;

    normalizedEffectiveCartList?.forEach((item) => {
      const qty = Number(item.quantity || 1);
      const basePrice = Number(item?.product?.price ?? item?.price ?? 0);
      const discountType = item?.product?.discount_type;
      const discountValue = Number(item?.product?.discount || 0);

      if (discountType === "percent") {
        totalDiscount += (basePrice * qty * discountValue) / 100;
      } else if (discountType === "amount") {
        totalDiscount += discountValue * qty;
      }
    });

    return totalDiscount;
  }, [isFood, normalizedEffectiveCartList]); // baseItemSubTotal hataya — ab direct loop se calculate ho raha hai

  // 3️⃣ sabse last me ye
  const itemPriceAfterDiscount = baseItemSubTotal - baseDiscount;

  /* ================= FOOD ONLY : VARIATION ================= */
  const variationSummary = useMemo(() => {
    let count = 0;
    let price = 0;

    normalizedEffectiveCartList?.forEach((item) => {
      const qty = Number(item.quantity || 1);
      const variations = Array.isArray(item.food_variations)
        ? item.food_variations
        : [];

      variations.forEach((variation) => {
        const values = Array.isArray(variation.values_to_show)
          ? variation.values_to_show
          : [];

        values.forEach((v) => {
          if (v?.isSelected) {
            count += qty;
            price += Number(v.optionPrice || 0) * qty;
          }
        });
      });
    });

    return { count, price };
  }, [normalizedEffectiveCartList]);

  /* ================= FOOD ONLY : ADDON ================= */
  const addonSummary = useMemo(() => {
    let count = 0;
    let price = 0;

    normalizedEffectiveCartList?.forEach((item) => {
      const qty = Number(item.quantity || 1);
      const addons = Array.isArray(item.product?.addons)
        ? item.product.addons
        : [];

      addons.forEach((addon) => {
        if (addon?.isChecked && addon.quantity > 0) {
          count += addon.quantity * qty;
          price += Number(addon.price || 0) * addon.quantity * qty;
        }
      });
    });

    return { count, price };
  }, [normalizedEffectiveCartList]);

  normalizedEffectiveCartList?.forEach((item, idx) => {
    item.food_variations?.forEach((v, i) => {});
  });

  /* ================= REAL SUBTOTAL ================= */
  const realSubTotal = useMemo(() => {
    return (
      getSubTotalPrice(normalizedEffectiveCartList) +
      variationSummary.price +
      addonSummary.price
    );
  }, [normalizedEffectiveCartList, variationSummary.price, addonSummary.price]);
  /* ================= DELIVERY FEE ================= */
  //   const handleDeliveryFee = () => {
  //   const price = Number(
  //     getDeliveryFees(
  //       storeData,
  //       configData,
  //       cartList,
  //       distanceData?.data,
  //       couponDiscount,
  //       couponType,
  //       orderType,
  //       zoneData,
  //       origin,
  //       destination,
  //       tempExtraCharge
  //     ) || 0
  //   );

  //   // ✅ delivery me fee lagegi, pickup me 0
  //   const finalFee = orderType === "delivery" ? price : 0;

  //   setDeliveryFee(finalFee);

  //   if (finalFee === 0) {
  //     return <Typography>{t("Free")}</Typography>;
  //   }

  //   return (
  //     <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
  //       <Typography>(+)</Typography>
  //       <Typography>{getAmountWithSign(finalFee)}</Typography>
  //     </Stack>
  //   );
  // };

  /* ================= DELIVERY FEE ================= */

  const deliveryFee = useMemo(() => {
    if (orderType !== "delivery") return 0;

    return Number(
      getDeliveryFees(
        storeData,
        configData,
        cartList,
        distanceData?.data,
        couponDiscount,
        couponType,
        orderType,
        zoneData,
        origin,
        destination,
        tempExtraCharge,
      ) || 0,
    );
  }, [
    storeData,
    configData,
    cartList,
    distanceData,
    couponDiscount,
    orderType,
    zoneData,
    origin,
    destination,
    tempExtraCharge,
  ]);

  useEffect(() => {
    setDeliveryFee(deliveryFee);
  }, [deliveryFee]);

  /* ================= COUPON ================= */
  const handleCouponDiscount = () => {
    const value = getCouponDiscount(couponDiscount, storeData, cartList);

    if (couponDiscount?.coupon_type === "free_delivery") {
      setFreeDelivery("true");
      return 0;
    }
    return getAmountWithSign(value);
  };

  /* ================= REFER DISCOUNT ================= */
  const totalAmountForRefer = couponDiscount
    ? handlePurchasedAmount(cartList) -
      getProductDiscount(cartList, storeData) -
      getCouponDiscount(couponDiscount, storeData, cartList)
    : handlePurchasedAmount(cartList) - getProductDiscount(cartList, storeData);

  const referDiscount = getReferDiscount(
    totalAmountForRefer,
    customerData?.data?.discount_amount,
    customerData?.data?.discount_amount_type,
  );

  /* ================= FINAL TOTAL ================= */
  const discountedPrice = useMemo(() => {
    if (isFood) {
      return baseDiscount; // ✅ ONLY CHANGE
    }

    return getProductDiscount(normalizedEffectiveCartList, storeData) || 0;
  }, [normalizedEffectiveCartList, storeData, baseDiscount, isFood]);

  // AFTER — frozen amount use karo, recalculate mat karo
  const couponAmount = useMemo(() => {
    if (!couponDiscount) return 0;

    // free_delivery coupon ke liye alag handling
    if (couponDiscount.coupon_type === "free_delivery") return 0;

    // ✅ Frozen value use karo (set at apply-time in HaveCoupon)
    if (couponDiscount.fixed_discount_amount !== undefined) {
      return Number(couponDiscount.fixed_discount_amount) || 0;
    }

    // Fallback (purane applied coupons ke liye)
    return (
      getCouponDiscount(
        couponDiscount,
        storeData,
        normalizedEffectiveCartList,
      ) || 0
    );
  }, [couponDiscount]); // ← sirf couponDiscount pe depend karo, cart pe nahi

  const taxAmount = useMemo(() => {
    if (isFood) {
      const subtotalOriginal =
        baseItemSubTotal + variationSummary.price + addonSummary.price;

      const subtotalAfterProductDiscount = subtotalOriginal - baseDiscount;

      const subtotalAfterAllDiscount =
        subtotalAfterProductDiscount - Number(couponAmount || 0);

      const gstPercent =
        normalizedEffectiveCartList?.[0]?.product?.tax || storeData?.tax || 0;

      return (subtotalAfterAllDiscount * gstPercent) / 100;
    }

    return (
      getTaxableTotalPrice(
        normalizedEffectiveCartList,
        couponDiscount,
        storeData,
        referDiscount,
      ) || 0
    );
  }, [
    normalizedEffectiveCartList,
    couponDiscount,
    storeData,
    referDiscount,
    baseItemSubTotal,
    baseDiscount,
    variationSummary,
    addonSummary,
    couponAmount,
    isFood,
  ]);

  const finalTotalAmount = useMemo(() => {
    let total = 0;

    if (isFood) {
      const subtotalOriginal =
        baseItemSubTotal + variationSummary.price + addonSummary.price;

      const subtotalActual = subtotalOriginal - baseDiscount;

      const subtotalAfterCoupon = subtotalActual - Number(couponAmount || 0);

      const taxBase = subtotalAfterCoupon;

      total =
        subtotalAfterCoupon +
        Number(taxAmount) +
        Number(deliveryFee || 0) +
        Number(deliveryTip || 0) +
        Number(additionalCharge || 0) +
        Number(packagingCharge || 0);

      // console.table({
      //   "1. baseItemSubTotal": baseItemSubTotal,
      //   "2. variationPrice": variationSummary.price,
      //   "3. addonPrice": addonSummary.price,
      //   "4. subtotalOriginal": subtotalOriginal,
      //   "5. baseDiscount": baseDiscount,
      //   "6. subtotalActual": subtotalActual,
      //   "7. couponAmount": Number(couponAmount || 0),
      //   "8. subtotalAfterCoupon": subtotalAfterCoupon,
      //   "9. taxBase": taxBase,
      //   "10. taxAmount": Number(taxAmount),
      //   "11. deliveryFee": Number(deliveryFee || 0),
      //   "12. deliveryTip": Number(deliveryTip || 0),
      //   "13. additionalCharge": Number(additionalCharge || 0),
      //   "14. packagingCharge": Number(packagingCharge || 0),
      //   "15. total (before refer)": total,
      // });
    } else {
      // 🔒 UNTOUCHED FLOW
      total =
        Number(realSubTotal) -
        Number(discountedPrice) -
        Number(couponAmount) +
        Number(taxAmount) +
        Number(deliveryFee || 0) +
        Number(deliveryTip || 0) +
        Number(additionalCharge || 0) +
        Number(packagingCharge || 0);
    }

    const finalAmount = profileInfo?.is_valid_for_discount
      ? total - referDiscount
      : total;

    // console.log("[finalTotalAmount]", {
    //   isFood,
    //   total,
    //   referDiscount,
    //   is_valid_for_discount: profileInfo?.is_valid_for_discount,
    //   finalAmount: parseFloat(finalAmount.toFixed(2)),
    // });

    return parseFloat(finalAmount.toFixed(2));
  }, [
    isFood,
    baseItemSubTotal,
    baseDiscount,
    variationSummary,
    addonSummary,
    discountedPrice,
    realSubTotal,
    couponAmount,
    taxAmount,
    deliveryFee,
    deliveryTip,
    additionalCharge,
    packagingCharge,
    referDiscount,
    profileInfo,
  ]);

  // useEffect(() => {
  //   console.log("Garuda is here ; ", finalTotalAmount);
  // }, []);

  // Ensure finalTotalAmount is formatted to two decimals when setting payable amount
  useEffect(() => {
    if (Number.isFinite(finalTotalAmount)) {
      const formattedTotalAmount = finalTotalAmount.toFixed(2); // Format to 2 decimal places
      setPayableAmount(formattedTotalAmount); // Set the formatted amount
      dispatch(setTotalAmount(formattedTotalAmount)); // Also dispatch the formatted value to Redux
    }
  }, [finalTotalAmount]);

  const totalAmountAfterPartial = finalTotalAmount - walletBalance;

  const newPrice = isFood
    ? baseItemSubTotal - baseDiscount
    : realSubTotal - discountedPrice;
  // console.log("isFood:", isFood);

  // ✅ ONLY FOR SUBTOTAL DISPLAY (FOOD MODULE)
  const subtotalOriginal =
    baseItemSubTotal + variationSummary.price + addonSummary.price;

  const subtotalAfterDiscount =
    baseItemSubTotal -
    baseDiscount +
    variationSummary.price +
    addonSummary.price;
  /* ================= UI ================= */
  return (
    <CalculationGrid
      container
      item
      xs={12}
      spacing={1}
      sx={{
        border: "1px solid #e0e0e0",
        padding: "13px 16px",
        borderRadius: "10px",
      }}
      mt="1rem"
    >
      {/* Items Price */}
      <Grid item xs={8}>
        {cartList.length > 1 ? t("Items price") : t("Item price")}
      </Grid>
      {/* Items Price */}
      <Grid item xs={4} align="right">
        <span>
          ₹{newPrice % 1 === 0 ? Math.floor(newPrice) : newPrice.toFixed(2)}
        </span>

        <span
          style={{
            marginLeft: "8px",
            textDecoration: "line-through",
            color: "#999",
          }}
        >
          ₹
          {isFood
            ? baseItemSubTotal % 1 === 0
              ? Math.floor(baseItemSubTotal)
              : baseItemSubTotal.toFixed(2)
            : realSubTotal % 1 === 0
            ? Math.floor(realSubTotal)
            : realSubTotal.toFixed(2)}
        </span>
      </Grid>

      {/* 🔴 FOOD FLOW */}
      {isFood ? (
        <>
          {/* Variation */}
          {variationSummary.count > 0 && (
            <>
              <Grid item xs={8}>
                {t("Variation")} x{variationSummary.count}
              </Grid>
              <Grid item xs={4} align="right">
                (+) {getAmountWithSign(variationSummary.price)}
              </Grid>
            </>
          )}

          {/* Addon */}
          {addonSummary.count > 0 && (
            <>
              <Grid item xs={8}>
                {t("Add On")} x{addonSummary.count}
              </Grid>
              <Grid item xs={4} align="right">
                (+) {getAmountWithSign(addonSummary.price)}
              </Grid>
            </>
          )}

          {/* Subtotal */}

          {/* Subtotal */}
          {(variationSummary.count > 0 || addonSummary.count > 0) && (
            <>
              <Grid item xs={8}>
                {t("Subtotal")}
              </Grid>
              <Grid item xs={4} align="right">
                {/* LEFT: Discounted + variation + addon */}
                <span>
                  ₹
                  {subtotalAfterDiscount % 1 === 0
                    ? Math.floor(subtotalAfterDiscount)
                    : subtotalAfterDiscount.toFixed(2)}
                </span>

                {/* RIGHT: Original + variation + addon */}
                <span
                  style={{
                    marginLeft: "8px",
                    textDecoration: "line-through",
                    color: "#999",
                  }}
                >
                  ₹
                  {subtotalOriginal % 1 === 0
                    ? Math.floor(subtotalOriginal)
                    : subtotalOriginal.toFixed(2)}
                </span>
              </Grid>
            </>
          )}

          {/* Discount */}
          <Grid item xs={8}>
            {t("Discount")}
          </Grid>
          <Grid item xs={4} align="right">
            (-) {getAmountWithSign(discountedPrice)}
          </Grid>
        </>
      ) : (
        <>
          {/* 🟢 DEFAULT FLOW (UNCHANGED) */}

          {/* Discount */}
          <Grid item xs={8}>
            {t("Discount")}
          </Grid>
          <Grid item xs={4} align="right">
            (-) {getAmountWithSign(discountedPrice)}
          </Grid>

          {/* Variation */}
          {variationSummary.count > 0 && (
            <>
              <Grid item xs={8}>
                {t("Variation")} x{variationSummary.count}
              </Grid>
              <Grid item xs={4} align="right">
                {getAmountWithSign(variationSummary.price)}
              </Grid>
            </>
          )}

          {/* Addon */}
          {addonSummary.count > 0 && (
            <>
              <Grid item xs={8}>
                {t("Add On")} x{addonSummary.count}
              </Grid>
              <Grid item xs={4} align="right">
                {getAmountWithSign(addonSummary.price)}
              </Grid>
            </>
          )}

          {/* Subtotal */}
          {isFood && (variationSummary.count > 0 || addonSummary.count > 0) && (
            <>
              <Grid item xs={8}>
                {t("Subtotal")}
              </Grid>
              <Grid item xs={4} align="right">
                <span>
                  ₹{""}
                  {newPrice % 1 === 0
                    ? Math.floor(newPrice)
                    : newPrice.toFixed(2)}
                </span>
              </Grid>
            </>
          )}
        </>
      )}

      {/* Coupon Discount */}
      {couponDiscount && (
        <>
          <Grid item xs={8}>
            {t("Coupon discount")}
          </Grid>
          <Grid item xs={4} align="right">
            {couponDiscount.coupon_type === "free_delivery"
              ? t("Free Delivery")
              : `(-) ${handleCouponDiscount()}`}
          </Grid>
        </>
      )}

      {/* TAX */}
      <>
        <Grid item xs={8}>
          {t("GST")} {storeData?.tax !== undefined && `(${storeData.tax}%)`}
        </Grid>

        <Grid item xs={4} align="right">
          (+) {getAmountWithSign(taxAmount)}
        </Grid>
      </>

      {/* Delivery Tip */}
      {Number(configData?.dm_tips_status) === 1 && (
        <>
          <Grid item xs={8}>
            {t("Deliveryman tips")}
          </Grid>
          <Grid item xs={4} align="right">
            (+) {getAmountWithSign(Number(deliveryTip))}
          </Grid>
        </>
      )}

      {/* Delivery Fee */}
      <Grid item xs={8}>
        {t("Delivery fee")}
      </Grid>
      <Grid item xs={4} align="right">
        {deliveryFee === 0 ? (
          <Typography>{t("Free")}</Typography>
        ) : (
          <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
            <Typography>(+)</Typography>
            <Typography>{getAmountWithSign(deliveryFee)}</Typography>
          </Stack>
        )}
      </Grid>

      <CustomDivider border="1px" />

      {/* TOTAL */}
      <Grid item xs={8} fontWeight={700} color="#1A914B" mt={0.5}>
        {t("To Pay")}
      </Grid>
      <Grid item xs={4} align="right" fontWeight={700} color="#1A914B">
        {getAmountWithSign(
          Number.isFinite(finalTotalAmount) ? finalTotalAmount : 0,
          true,
        )}
      </Grid>

      {/* Partial Payment */}
      {usePartialPayment && payableAmount > walletBalance && (
        <>
          <Grid item xs={8}>
            {t("Paid by wallet")}
          </Grid>
          <Grid item xs={4} align="right">
            (-) {getAmountWithSign(walletBalance)}
          </Grid>

          <Grid item xs={8}>
            {t("Due Payment")}
          </Grid>
          <Grid item xs={4} align="right">
            {getAmountWithSign(totalAmountAfterPartial)}
          </Grid>
        </>
      )}

      {/* Cashback */}
      {token && cashbackAmount?.cashback_amount > 0 && (
        <Grid item xs={12}>
          <Box
            borderLeft={`2px solid ${theme.palette.primary.main}`}
            padding="0.5rem"
            backgroundColor={alpha(theme.palette.primary.main, 0.05)}
          >
            {t("You will receive cashback")}
          </Box>
        </Grid>
      )}
    </CalculationGrid>
  );
};

export default OrderCalculation;
