import React from "react";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import { styled, Typography } from "@mui/material";
import { getAmountWithSign } from "helper-functions/CardHelpers";
import { Stack } from "@mui/system";
import { useSelector } from "react-redux";

export const OrderSummaryCalculationCard = styled(CustomStackFullWidth)(
  ({ theme }) => ({
    paddingInline: "20px",
    paddingBlock: "25px",
    backgroundColor: theme.palette.background.custom6,
    borderRadius: "10px",
  })
);

// Calculate discounted item price
const getItemsPrice = (items) => {
  return items?.reduce((total, product) => {

    // ✅ correct variation price
    const variation = product?.variation?.[0];

    const basePrice =
      variation?.price || product?.price || 0;

    const discount = product?.item_details?.discount || 0;
    const discountType = product?.item_details?.discount_type;

    let finalPrice = basePrice;

    if (discount > 0) {
      if (discountType === "percent") {
        finalPrice = (basePrice * (100 - discount)) / 100;
      } else {
        finalPrice = basePrice - discount;
      }
    }

    // ✅ store correct values
    product._displayPrice = finalPrice;
    product._basePrice = basePrice;

    return total + finalPrice * product?.quantity;
  }, 0);
};

// Calculate addons and variation
const getAddOnsPrice = (items) => {
  let totalAddons = 0;
  let totalVariation = 0;

  items?.forEach(product => {
    const addonsTotal =
      product?.add_ons?.reduce(
        (sum, addon) => sum + addon?.price * addon?.quantity,
        0
      ) || 0;

    const variationTotal =
      product?.variation?.reduce((sum, variation) => {
        const valueTotal =
          variation?.values?.reduce(
            (vSum, val) => vSum + Number(val?.optionPrice || 0),
            0
          ) || 0;
        return sum + valueTotal;
      }, 0) || 0;

    totalAddons += addonsTotal * product?.quantity;
    totalVariation += variationTotal * product?.quantity;
  });

  return { totalAddons, totalVariation };
};

// Subtotal = items + addons + variation
const getSubTotalPrice = (dataList) => {
  const itemsPrice = getItemsPrice(dataList);
  const { totalAddons, totalVariation } = getAddOnsPrice(dataList);
  return itemsPrice + totalAddons + totalVariation;
};

function getRestaurantValue(data, key) {
  return data?.[0]?.item_details?.[key];
}

const OrderCalculation = ({ data, t, trackOrderData }) => {
  const { configData } = useSelector((state) => state.configData);
  const due_amount =
    trackOrderData?.order_amount - trackOrderData?.partially_paid_amount;

  const isFoodModule = trackOrderData?.module?.module_type === "food";

  const { totalAddons, totalVariation } = isFoodModule
    ? getAddOnsPrice(data)
    : { totalAddons: 0, totalVariation: 0 };

  const shouldShowSubtotal =
    isFoodModule && (totalAddons > 0 || totalVariation > 0);
  const formatPrice = (num) => {
    if (!num && num !== 0) return "0";

    const fixed = Number(num).toFixed(2); // max 2 decimal
    return parseFloat(fixed); // trailing zero hata dega
  };

  return (
    <OrderSummaryCalculationCard spacing={1.5}>
      <Typography fontWeight="700">{t("Summary")}</Typography>

      {/* Items Price */}
      <CustomStackFullWidth direction="row" alignItems="center" justifyContent="space-between">
        <Typography fontSize="14px">{t("Items Price")}</Typography>
        <Typography fontSize="14px">
          {data && data.length > 0 && (
            <>
              {getAmountWithSign(getItemsPrice(data))}
              {isFoodModule && (
                <span style={{ textDecoration: "line-through", color: "#888", marginLeft: 5 }}>
                  ₹{data.reduce((sum, item) => sum + (item._basePrice || 0) * item.quantity, 0)}
                </span>
              )}
            </>
          )}
        </Typography>
      </CustomStackFullWidth>

      {/* Food Module Addons & Variation */}
      {isFoodModule && data?.length > 0 && (
        <>
          <CustomStackFullWidth direction="row" alignItems="center" justifyContent="space-between">
            <Typography fontSize="14px">{t("Addons Price")}</Typography>
            <Typography fontSize="14px">{getAmountWithSign(totalAddons)}</Typography>
          </CustomStackFullWidth>

          <CustomStackFullWidth direction="row" alignItems="center" justifyContent="space-between">
            <Typography fontSize="14px">{t("Variation Price")}</Typography>
            <Typography fontSize="14px">{getAmountWithSign(totalVariation)}</Typography>
          </CustomStackFullWidth>

          <CustomStackFullWidth direction="row" alignItems="center" justifyContent="space-between">
            <Typography fontSize="14px">{t("Subtotal")}</Typography>
            <Typography fontSize="14px">
              {getAmountWithSign(formatPrice(getSubTotalPrice(data)))}
              <span style={{ textDecoration: "line-through", color: "#888", marginLeft: 5 }}>
                ₹
                {formatPrice(
                  data.reduce(
                    (sum, item) =>
                      sum +
                      (item._basePrice || 0) * item.quantity +
                      totalAddons +
                      totalVariation,
                    0
                  )
                )}
              </span>
            </Typography>
          </CustomStackFullWidth>

          <CustomStackFullWidth direction="row" alignItems="center" justifyContent="space-between">
            <Typography fontSize="14px">{t("Discount")}</Typography>
            <Typography fontSize="14px">
              -{getAmountWithSign(
                (trackOrderData?.store_discount_amount || 0) +
                (trackOrderData?.flash_admin_discount_amount || 0) +
                (trackOrderData?.flash_store_discount_amount || 0)
              )}
            </Typography>
          </CustomStackFullWidth>

          <CustomStackFullWidth
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography fontSize="14px">{t("Coupon Discount")}</Typography>
            <Typography fontSize="14px">
              -{getAmountWithSign(trackOrderData?.coupon_discount_amount || 0)}
            </Typography>
          </CustomStackFullWidth>

        </>
      )}

      {/* Non-food modules subtotal & discount */}
      {shouldShowSubtotal && (
        <CustomStackFullWidth
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography fontSize="14px">{t("Subtotal")}</Typography>
          <Typography fontSize="14px">
            {getAmountWithSign(getSubTotalPrice(data))}

            <span
              style={{
                textDecoration: "line-through",
                color: "#888",
                marginLeft: 5,
              }}
            >
              ₹
              {data.reduce(
                (sum, item) =>
                  sum + (item._basePrice || 0) * item.quantity,
                0
              )}
            </span>
          </Typography>
        </CustomStackFullWidth>
      )}

      {/* Coupon Discount - All Modules */}
      {trackOrderData?.coupon_discount_amount > 0 && (
        <CustomStackFullWidth
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography fontSize="14px">{t("Coupon Discount")}</Typography>
          <Typography fontSize="14px">
            -{getAmountWithSign(trackOrderData?.coupon_discount_amount)}
          </Typography>
        </CustomStackFullWidth>
      )}


      {/* Remaining charges (GST, tips, delivery, etc.) */}
      {configData?.tax_included === 0 && (
        <CustomStackFullWidth direction="row" alignItems="center" justifyContent="space-between">
          <Typography fontSize="14px">{t("GST")}({getRestaurantValue(data, "tax")}%)</Typography>
          <Typography fontSize="14px">{getAmountWithSign(trackOrderData?.total_tax_amount)}</Typography>
        </CustomStackFullWidth>
      )}

      {Number.parseInt(trackOrderData?.dm_tips) !== 0 && (
        <CustomStackFullWidth direction="row" alignItems="center" justifyContent="space-between">
          <Typography fontSize="14px">{t("Delivery Man Tips")}</Typography>
          <Typography fontSize="14px">{getAmountWithSign(trackOrderData?.dm_tips)}</Typography>
        </CustomStackFullWidth>
      )}

      {configData?.add_fund_status === 1 && (
        <CustomStackFullWidth direction="row" alignItems="center" justifyContent="space-between">
          <Typography fontSize="14px">{configData?.additional_charge_name}</Typography>
          <Typography fontSize="14px">{getAmountWithSign(configData?.additional_charge)}</Typography>
        </CustomStackFullWidth>
      )}

      <CustomStackFullWidth direction="row" alignItems="center" justifyContent="space-between">
        <Typography fontSize="14px">{t("Delivery Fee")}</Typography>
        <Typography fontSize="14px">{getAmountWithSign(trackOrderData?.delivery_charge)}</Typography>
      </CustomStackFullWidth>

      <Stack width="100%" sx={{ mt: "20px", borderBottom: (theme) => `1px dotted ${theme.palette.neutral[400]}` }}></Stack>

      <CustomStackFullWidth direction="row" alignItems="center" justifyContent="space-between">
        <Typography fontWeight="bold" color="primary.main">{t("Total")}</Typography>
        <Typography fontWeight="bold">{getAmountWithSign(trackOrderData?.order_amount)}</Typography>
      </CustomStackFullWidth>
    </OrderSummaryCalculationCard>
  );
};

OrderCalculation.propTypes = {};

export default OrderCalculation;