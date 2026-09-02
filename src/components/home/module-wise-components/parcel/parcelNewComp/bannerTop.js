import React, { useEffect, useMemo, useState } from "react";
import { Grid, Typography, Stack, Divider, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import { getAmountWithSign } from "helper-functions/CardHelpers";

import useGetStoreDetails from "api-manage/hooks/react-query/store/useGetStoreDetails";

import {
  getProductDiscount,
  getCouponDiscount,
  getSubTotalPrice,
  getTaxableTotalPrice,
  getCalculatedTotal,
  getDeliveryFees,
} from "utils/CustomFunctions";

import DeliveryManTip from "../../../../checkout/DeliveryManTip";

const OrderSummaryDetails = ({
  cartList = [],
  configData,
  distanceData,
  couponType,
  orderType,
  freeDelivery,
  zoneData,
  origin,
  destination,
  extraCharge = 0,
  additionalCharge = 0,
  referDiscount = 0,
  isSmall = false,
  setDeliveryFee,
  setPayableAmount,
}) => {
  const { t } = useTranslation();

  const [couponDiscount, setCouponDiscount] = useState(null);
  const [deliveryTip, setDeliveryTip] = useState(0);

  const [subTotal, setSubTotal] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponAmount, setCouponAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [deliveryFeeState, setDeliveryFeeState] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);



  useEffect(() => {
    // console.group("📦 ORDER SUMMARY - INPUT DATA");

    // console.log("🛒 cartList (RAW):", cartList);
    // console.log("🛒 validCartList (FILTERED):", validCartList);

    // console.log("⚙️ configData:", configData);
    // console.log("📏 distanceData:", distanceData);
    // console.log("🎟 couponType:", couponType);
    // console.log("📦 orderType:", orderType);
    // console.log("🆓 freeDelivery:", freeDelivery);

    // console.log("🗺 zoneData:", zoneData);
    // console.log("📍 origin:", origin);
    // console.log("📍 destination:", destination);

    // console.log("➕ extraCharge:", extraCharge);
    // console.log("➕ additionalCharge:", additionalCharge);
    // console.log("👤 referDiscount:", referDiscount);

    // console.groupEnd();
  }, []);
  // Fetch module data from localStorage
  const moduleData = JSON.parse(localStorage.getItem("module"));
  const currentModuleType = moduleData?.module_type;

  // Memoized cart list for valid cart items based on module type

  // validCartList
  const validCartList = useMemo(() => {
    if (!Array.isArray(cartList)) return [];

    return cartList.filter(item => String(item?.module_type) === String(currentModuleType))
      .map(item => ({
        ...item,
        food_variations: item.food_variations ?? [],
        selectedAddons: item.selectedAddons ?? [],
        selectedOption: item.selectedOption ?? [],
      }));
  }, [cartList, currentModuleType]);


  // variationSummary
  const variationSummary = useMemo(() => {
    let count = 0;
    let price = 0;

    validCartList.forEach(item => {
      const itemQty = Number(item.quantity || 1);

      const variations = Array.isArray(item.food_variations)
        ? item.food_variations
        : [];

      variations.forEach(variation => {
        const valuesToShow = Array.isArray(variation.values_to_show)
          ? variation.values_to_show
          : [];

        valuesToShow.forEach(v => {
          if (v?.isSelected) {
            const optionPrice = Number(v.optionPrice || 0);
            count += itemQty;
            price += optionPrice * itemQty;
          }
        });
      });
    });

    // console.log("✅ variationSummary (NEW FORMAT):", { count, price });
    return { count, price };
  }, [validCartList]);

  const discountLabel = useMemo(() => {
    if (!validCartList?.length) return "";

    // multiple items -> label nahi dikhana
    if (validCartList.length > 1) return "";

    const product = validCartList[0]?.product;

    if (!product?.discount) return "";

    return product.discount_type === "percent"
      ? `${product.discount}%`
      : getAmountWithSign(product.discount);
  }, [validCartList]);

  // addonSummary
  const addonSummary = useMemo(() => {
    let count = 0;
    let price = 0;

    validCartList.forEach(item => {
      const itemQty = Number(item.quantity || 1);
      const addons = Array.isArray(item.product?.addons)
        ? item.product.addons
        : [];

      addons.forEach(addon => {
        if (addon?.isChecked && addon.quantity > 0) {
          count += addon.quantity * itemQty;
          price += Number(addon.price || 0) * addon.quantity * itemQty;
        }
      });
    });

    // console.log("✅ addonSummary:", { count, price });
    return { count, price };
  }, [validCartList]);



  const realSubTotal = useMemo(() => {
    return (
      subTotal +
      variationSummary.price +
      addonSummary.price
    );
  }, [subTotal, variationSummary.price, addonSummary.price]);


  useEffect(() => {
    // console.log("validCartList:", validCartList);

    validCartList.forEach((item, index) => {
      // console.log(`Item ${index}:`, item);
    });
  }, [validCartList]);

  const storeId = validCartList?.[0]?.product?.store_id;

  const {
    data: storeData,
    isLoading,
    refetch,
  } = useGetStoreDetails(storeId);


  useEffect(() => {
    if (storeId) refetch();
  }, [storeId, refetch]);

  const calculateOrderSummary = () => {
    // console.log("Starting order summary calculation...");

    if (!validCartList.length || !storeData) {
      // console.log("Invalid Cart List or Store Data");
      return;
    }

    // 1️⃣ Base subtotal (only items)
    const baseSubtotal = getSubTotalPrice(validCartList);

    // 2️⃣ Real subtotal (items + variations + addons)
    const realSubTotalCalc =
      baseSubtotal +
      variationSummary.price +
      addonSummary.price;

    setSubTotal(baseSubtotal);

    // 3️⃣ Product discount
    let discount = getProductDiscount(validCartList, storeData);

    if (currentModuleType === "food") {
      const discountType = validCartList?.[0]?.product?.discount_type;

      const subtotalOriginal =
        baseSubtotal + variationSummary.price + addonSummary.price;

      if (discountType === "percent") {
        const discountPercent = baseSubtotal > 0 ? discount / baseSubtotal : 0;
        discount = subtotalOriginal * discountPercent;
      }

      if (discountType === "amount") {
        discount = discount; // direct amount
      }
    }

    setDiscountAmount(discount);

    // 4️⃣ Coupon discount
    const couponValue = couponDiscount
      ? getCouponDiscount(couponDiscount, storeData, validCartList)
      : 0;
    setCouponAmount(couponValue);

    // 5️⃣ Tax (existing util — base items only)
    // 5️⃣ Tax
    let tax = 0;

    if (currentModuleType === "food") {
      const subtotalOriginal =
        baseSubtotal + variationSummary.price + addonSummary.price;

      const subtotalActual = subtotalOriginal - discount;

      const productTax = validCartList?.[0]?.product?.tax || 0;
      const storeTax = storeData?.tax || 0;

      const gstPercent = productTax > 0 ? productTax : storeTax;

      tax = Number(((subtotalActual * gstPercent) / 100).toFixed(2));
    } else {
      tax = getTaxableTotalPrice(
        validCartList,
        couponDiscount,
        storeData,
        referDiscount
      );
    }

    setTaxAmount(tax);

    // 6️⃣ Delivery fee
    const deliveryFee = getDeliveryFees(
      storeData,
      configData,
      validCartList,
      distanceData?.data,
      couponDiscount,
      couponType,
      orderType,
      zoneData,
      origin,
      destination,
      extraCharge
    );

    setDeliveryFeeState(deliveryFee);
    setDeliveryFee?.(deliveryFee);

    // 7️⃣ ✅ FINAL TOTAL (single source of truth)
    let total;

    if (currentModuleType === "food") {
      const subtotalOriginal =
        baseSubtotal + variationSummary.price + addonSummary.price;

      const subtotalActual = subtotalOriginal - discount;

      total =
        subtotalActual +
        tax +
        deliveryFee +
        Number(deliveryTip) +
        extraCharge +
        additionalCharge;
    } else {
      total =
        realSubTotalCalc
        - discount
        - couponValue
        + tax
        + deliveryFee
        + Number(deliveryTip)
        + extraCharge
        + additionalCharge;
    }

    // console.log("✅ FINAL TOTAL CALCULATION", {
    //   baseSubtotal,
    //   variation: variationSummary.price,
    //   addon: addonSummary.price,
    //   realSubTotalCalc,
    //   discount,
    //   couponValue,
    //   tax,
    //   deliveryFee,
    //   deliveryTip,
    //   extraCharge,
    //   additionalCharge,
    //   total,
    // });

    setFinalTotal(total);
    setPayableAmount?.(total);
  };



  useEffect(() => {
    if (!validCartList.length || !storeData || isLoading) {
      // console.log("Waiting for validCartList or storeData to be ready...");
      return;
    }

    // console.log("validCartList before calculation:", validCartList);
    // console.log("storeData:", storeData);



    calculateOrderSummary();
  }, [
    validCartList,
    storeData,
    couponDiscount,
    deliveryTip,
    extraCharge,
    additionalCharge,
    referDiscount,
    configData,
    distanceData,
    couponType,
    orderType,
    freeDelivery,
    zoneData,
    origin,
    destination,
    isLoading,
  ]);

  if (isLoading) return null;

  // logs for food details : 




  return (
    <CustomStackFullWidth>
      <SimpleBar style={{ maxHeight: "550px", width: "300px !important" }}>
        <Stack spacing={1.3}>
          {/* Bill summary card */}
          <Stack
            sx={{
              bgcolor: "#fff",
              border: "1px solid #EAEAEA",
              borderRadius: "12px",
              px: "16px",
              py: "12px",
            }}
            spacing={0.8}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',

                borderRadius: '8px',

              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#F8F8F8',
                  borderRadius: '8px',
                  marginRight: '12px',
                }}
              >
                <img src="/receipt-item.png" alt="icon" style={{ marginRight: '8px', width: '20px', height: '20px' }} />
              </Box>

              <Box>
                <Typography fontSize="14px" fontWeight={600} color="#1a2027">
                  Bill Summary
                </Typography>
                <Typography fontSize="12px" color="text.secondary">
                  Incl. All Taxes & Charges
                </Typography>
              </Box>
            </Box>


            <Stack mt={1} spacing={0.7}>
              <SummaryRow label="Items Price">
                <Grid sx={{ gap: "1px", display: "flex", flexDirection: "row" }}>
                  <Typography sx={{ marginRight: "2px" }}>
                    {getAmountWithSign(subTotal - discountAmount)} {/* This is the discounted price */}
                  </Typography>

                  <Typography sx={{ textDecoration: "line-through", marginLeft: "5px" }}>
                    {getAmountWithSign(subTotal)} {/* This is the scratched-out original subtotal */}
                  </Typography>
                </Grid>
              </SummaryRow>


              {/* Variations summary */}
              {variationSummary.count > 0 && (
                <SummaryRow label={`Variation x${variationSummary.count}`}>
                  <Typography fontSize="12px">
                    {getAmountWithSign(variationSummary.price)}
                  </Typography>
                </SummaryRow>
              )}

              {/* Addons summary */}
              {addonSummary.count > 0 && (
                <SummaryRow label={`Add On x${addonSummary.count}`}>
                  <Typography fontSize="12px">
                    {getAmountWithSign(addonSummary.price)}
                  </Typography>
                </SummaryRow>
              )}
              {currentModuleType === "food" &&
                (variationSummary.count > 0 || addonSummary.count > 0) && (
                  <SummaryRow label="Subtotal">
                    <Grid sx={{ display: "flex", flexDirection: "row" }}>
                      <Typography>
                        {getAmountWithSign(
                          subTotal +
                          variationSummary.price +
                          addonSummary.price -
                          discountAmount
                        )}
                      </Typography>

                      <Typography sx={{ textDecoration: "line-through", marginLeft: "5px" }}>
                        {getAmountWithSign(
                          subTotal + variationSummary.price + addonSummary.price
                        )}
                      </Typography>
                    </Grid>
                  </SummaryRow>
                )}
              <SummaryRow
                label={
                  currentModuleType === "food" && discountLabel
                    ? `Discount (${discountLabel})`
                    : "Discount"
                }
              >
                <Typography color="#10A669" fontSize="12px">
                  (-) {getAmountWithSign(discountAmount)}
                </Typography>
              </SummaryRow>

              <SummaryRow label="GST">
                <Typography fontSize="12px">
                  (+) {getAmountWithSign(taxAmount)}
                </Typography>
              </SummaryRow>

              <SummaryRow label="Deliveryman Tips">
                <Typography fontSize="12px">
                  (+) {getAmountWithSign(Number(deliveryTip))}
                </Typography>
              </SummaryRow>
            </Stack>

            <Divider sx={{ my: "8px" }} />

            {/* Total */}
            <Grid container>
              <Grid item xs={7}>
                <Typography fontWeight={700} fontSize="13px">
                  Total
                </Typography>
              </Grid>

              <Grid item xs={5} textAlign="right">
                <Typography fontWeight={700} fontSize="15px" color="#1A914B">
                  {getAmountWithSign(finalTotal)}
                </Typography>
              </Grid>
            </Grid>
          </Stack>

          {/* Delivery Tip Card */}
          <Stack
            sx={{
              bgcolor: "#fff",
              border: "1px solid #EAEAEA",
              borderRadius: "12px",
              px: "16px",
              py: "14px",
            }}
          >
            <DeliveryManTip
              deliveryTip={deliveryTip}
              setDeliveryTip={setDeliveryTip}
              isSmall={isSmall}
            />
          </Stack>
        </Stack>
      </SimpleBar>
    </CustomStackFullWidth>
  );
};

// Exact row matcher component for displaying label and value
const SummaryRow = ({ label, children }) => (
  <Grid container alignItems="center">
    <Grid item xs={7}>
      <Typography fontSize="12px" color="#808080" sx={{ lineHeight: "18px" }}>
        {label}
      </Typography>
    </Grid>

    <Grid item xs={5} textAlign="right">
      <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={0.3}>
        {children}
      </Stack>
    </Grid>
  </Grid>
);

export default OrderSummaryDetails;
