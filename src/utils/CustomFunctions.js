import moment from "moment";
import { currentDate, nextday, today } from "./formatedDays";
import { t } from "i18next";
import {
  getCurrentModuleId,
  getCurrentModuleType,
} from "helper-functions/getCurrentModuleType";
import { store } from "redux/store";
import { getDiscountedAmount } from "helper-functions/CardHelpers";

const getSafeFoodVariations = (product) => {
  if (Array.isArray(product?.food_variations)) return product.food_variations;
  if (Array.isArray(product?.variation)) return product.variation;
  return [];
};


export const getNumberWithConvertedDecimalPoint = (
  amount,
  digitAfterDecimalPoint
) => {
  if (amount === 0) {
    return amount;
  } else {
    return ((amount * 100) / 100).toFixed(
      Number.parseInt(digitAfterDecimalPoint)
    );
  }
};
export const isAvailable = (start, end) => {
  const startTime = moment(start, "HH:mm:ss");
  const endTime = moment(end, "HH:mm:ss");
  let currentTime = moment();
  return moment(currentTime).isBetween(startTime, endTime);
};
export const handleTotalAmountWithAddons = (
  mainTotalAmount,
  selectedAddOns
) => {
  if (selectedAddOns?.length > 0) {
    let selectedAddonsTotalPrice = 0;
    selectedAddOns?.forEach(
      (item) => (selectedAddonsTotalPrice += item?.price * item?.quantity)
    );
    return mainTotalAmount + selectedAddonsTotalPrice;
  } else {
    return mainTotalAmount;
  }
};

export const getDateFormat = (date) => {
  return moment(date).format("LL");
};
export const getDateFormatAnotherWay = (date) => {
  return moment(date).format("ll");
};

export const getIndexFromArrayByComparision = (arrayOfObjects, object) => {
  return arrayOfObjects.findIndex(
    (item) =>
      JSON.stringify(item.food_variations) === JSON.stringify(object.food_variations) &&
      item.id === object.id
  );
};

export const calculateItemBasePrice = (item, selectedOptions) => {
  let basePrice = item?.price;
  if (selectedOptions.length > 0) {
    selectedOptions?.forEach((option) => {
      if (option.isSelected === true) {
        basePrice += Number.parseInt(option?.optionPrice);
      }
    });
  }
  return basePrice;
  // if(item)
};
export const FormatedDateWithTime = (date) => {
  let dateString = moment(date).format("YYYY-MM-DD hh:mm a");
  return dateString;
};
export const onlyTimeFormat = (date) => {
  let timeString = moment(date, "YYYY-MM-DD hh:mm a").format("hh:mm");
  return timeString;
};

export const getDayNumber = (day) => {
  switch (day) {
    case "Sunday": {
      return 0;
    }
    case "Monday": {
      return 1;
    }
    case "Tuesday": {
      return 2;
    }
    case "Wednesday": {
      return 3;
    }
    case "Thursday": {
      return 4;
    }
    case "Friday": {
      return 5;
    }
    case "Saturday": {
      return 6;
    }
  }
};
const handleVariationValuesSum = (productVariations = []) => {
  let sum = 0;

  if (!Array.isArray(productVariations)) return 0;

  productVariations.forEach((pVal) => {
    if (!pVal) return;

    // 🟢 OLD STRUCTURE: pVal.values = []
    if (Array.isArray(pVal.values)) {
      pVal.values.forEach((cVal) => {
        if (cVal?.isSelected) {
          sum += Number(cVal?.optionPrice || 0);
        }
      });
      return;
    }

    // 🟢 NEW STRUCTURE: direct option object
    if (pVal?.optionPrice) {
      sum += Number(pVal.optionPrice || 0);
    }
  });

  return sum;
};

const handleValuesSum = (productVariations) => {
  let sum = 0;
  if (productVariations.length > 0) {
    productVariations?.forEach((pVal) => (sum += Number.parseInt(pVal.price)));
  }
  return sum;
};

export const handleProductValueWithOutDiscount = (product) => {
  // console.log("Handling product without discount:", product);

  let basePrice = 0;

  // If the module type is grocery or pharmacy, use variation price
  if (getCurrentModuleType() === "grocery" || getCurrentModuleType() === "pharmacy") {
    // Use the price from variations (assuming variations exist)
    basePrice = product?.variation?.[0]?.price || product?.price || 0;
    // console.log("Using variation price for grocery/pharmacy:", basePrice);
  } else {
    // Default to the product's base price if it's food
    basePrice = product?.price || 0;
    // console.log("No grocery/pharmacy module, using product price:", basePrice);

    if (getCurrentModuleType() === "food") {
      // If module type is food, check for food variations
      const variations = getSafeFoodVariations(product);
      // console.log("Food variations found:", variations);

      // If variations exist, calculate the variation values
      if (variations.length > 0) {
        const variationPrice = handleVariationValuesSum(variations);
        // console.log("Adding variation price for food:", variationPrice);
        basePrice += variationPrice;
      }
    }
  }

  // console.log("Final Base Price without Discount:", basePrice);
  return basePrice;
};


export const selectedAddonsTotal = (addOns) => {
  if (addOns?.length > 0) {
    let vv = addOns?.reduce(
      (total, addOn) => addOn.price * addOn.quantity + total,
      0
    );

    return vv;
  } else {
    return 0;
  }
};
const handleValueWithOutDiscount = (product) => {
  let productPrice = product.price;
  if (product.selectedOption.length > 0) {
    productPrice = handleValuesSum(product.selectedOption);
    return productPrice;
  } else {
    return productPrice;
  }
};
export const handlePurchasedAmount = (cartList) => {
  if (getCurrentModuleType() === "food") {
    return cartList.reduce(
      (total, product) =>
        (getSafeFoodVariations(product).length > 0
          ? handleProductValueWithOutDiscount(product)
          : product.price)
        *
        product.quantity +
        selectedAddonsTotal(product.selectedAddons) +
        total,
      0
    );
  } else {
    return cartList.reduce(
      (total, product) =>
        (product?.selectedOption?.length > 0
          ? handleValueWithOutDiscount(product)
          : product.price) *
        product.quantity +
        total,
      0
    );
  }
};
export const getCouponDiscount = (couponDiscount, storeData, cartList) => {
  if (couponDiscount) {
    let purchasedAmount = handlePurchasedAmount(cartList);
    if (purchasedAmount >= couponDiscount.min_purchase) {
      switch (couponDiscount.coupon_type) {
        case "zone_wise":
          let zoneId = JSON.parse(localStorage.getItem("zoneid"));
          if (
            Number.parseInt(zoneId[0]) ===
            Number.parseInt(couponDiscount.zoneId[0])
          ) {
            if (couponDiscount && couponDiscount.discount_type === "amount") {
              if (couponDiscount.max_discount === 0) {
                return couponDiscount.discount;
              } else {
                return couponDiscount.discount;
              }
            } else {
              let percentageWiseDis =
                (purchasedAmount - getProductDiscount(cartList, storeData)) *
                (couponDiscount.discount / 100);
              if (couponDiscount.max_discount === 0) {
                return percentageWiseDis;
              } else {
                if (percentageWiseDis >= couponDiscount.max_discount) {
                  return couponDiscount.max_discount;
                } else {
                  return percentageWiseDis;
                }
              }
            }
          } else {
            return 0;
          }
          break;
        case "store_wise":
          let storeId = JSON.parse(couponDiscount.data);
          if (Number.parseInt(storeId[0]) === storeData?.id) {
            if (couponDiscount && couponDiscount.discount_type === "amount") {
              if (couponDiscount.max_discount === 0) {
                return couponDiscount.discount;
              } else {
              }
            } else {
              let percentageWiseDis =
                (purchasedAmount - getProductDiscount(cartList, storeData)) *
                (couponDiscount.discount / 100);
              if (couponDiscount.max_discount === 0) {
                return percentageWiseDis;
              } else {
                if (percentageWiseDis >= couponDiscount.max_discount) {
                  return couponDiscount.max_discount;
                } else {
                  return percentageWiseDis;
                }
              }
            }
          } else {
            return 0;
          }
          break;
        case "free_delivery":
          return 0;
        case "default":
          if (couponDiscount && couponDiscount.discount_type === "amount") {
            if (couponDiscount.max_discount === 0) {
              return couponDiscount.discount;
            } else {
              return couponDiscount.discount;
            }
          } else if ("percent") {
            let percentageWiseDis =
              (purchasedAmount - getProductDiscount(cartList, storeData)) *
              (couponDiscount.discount / 100);
            if (couponDiscount.max_discount === 0) {
              return percentageWiseDis;
            } else {
              if (percentageWiseDis >= couponDiscount.max_discount) {
                return couponDiscount.max_discount;
              } else {
                return percentageWiseDis;
              }
            }
          }
      }
    } else {
      return 0;
    }
  }
};

export const getTaxableTotalPrice = (
  items,
  couponDiscount,
  storeData,
  referDiscount
) => {
  let tax = storeData?.tax || 0;
  let total =
    handlePurchasedAmount(items) -
    getProductDiscount(items, storeData) -
    (couponDiscount ? getCouponDiscount(couponDiscount, storeData, items) : 0) -
    (referDiscount ? referDiscount : 0);

  // console.log("Total before tax calculation: ", total);

  if (store?.getState?.()?.configData?.configData?.tax_included === 1) {
    const taxablePrice = (total * tax) / (100 + tax);
    // console.log("Taxable Price with Tax Included: ", taxablePrice);
    return taxablePrice;
  } else {
    const taxablePrice = (total * tax) / 100;
    // console.log("Taxable Price with Tax Excluded: ", taxablePrice);
    return taxablePrice;
  }
};
const handleTotalDiscountBasedOnModules = (items, restaurentDiscount, resDisType) => {
  // console.log("=== handleTotalDiscountBasedOnModules ===");

  if (getCurrentModuleType() === "food") {
    // console.log("Module Type: Food");

    return items.reduce((total, product) => {
      // console.log("Processing food product:", product);

      const hasVariations = getSafeFoodVariations(product).length > 0;
      // console.log("Has food variations:", hasVariations);

      const productPrice = hasVariations
        ? handleProductValueWithOutDiscount(product)
        : product.price;
      // console.log("Product Price Before Discount:", productPrice);

      const discount = getConvertDiscount(
        restaurentDiscount,
        resDisType,
        productPrice,
        product.store_discount
      );
      // console.log("Applied Discount:", discount);

      const finalPriceAfterDiscount = productPrice - discount;
      // console.log("Final Price After Discount:", finalPriceAfterDiscount);

      const productTotal = finalPriceAfterDiscount * product.quantity;
      // console.log("Product Total (Discounted Price * Quantity):", productTotal);

      const accumulatedTotal = total + productTotal;
      // console.log("Accumulated Total Discount So Far:", accumulatedTotal);

      return accumulatedTotal;
    }, 0);
  } else {
    // console.log("Module Type: Non-Food");

    return items.reduce((total, product) => {
      // console.log("Processing non-food product:", product);

      const hasSelectedOption = product?.selectedOption?.length > 0;
      // console.log("Has Selected Options:", hasSelectedOption);

      const productPrice = hasSelectedOption
        ? handleValueWithOutDiscount(product)
        : product.price;
      // console.log("Product Price Before Discount:", productPrice);

      const discount = getConvertDiscount(
        restaurentDiscount,
        resDisType,
        productPrice,
        product.store_discount
      );
      // console.log("Applied Discount:", discount);

      const finalPriceAfterDiscount = productPrice - discount;
      // console.log("Final Price After Discount:", finalPriceAfterDiscount);

      const productTotal = finalPriceAfterDiscount * product.quantity;
      // console.log("Product Total (Discounted Price * Quantity):", productTotal);

      const accumulatedTotal = total + productTotal;
      // console.log("Accumulated Total Discount So Far:", accumulatedTotal);

      return accumulatedTotal;
    }, 0);
  }
};



const handleProductWiseDiscount = (items) => {
  // console.log("=== handleProductWiseDiscount ===");
  let totalDiscount = 0;

  items?.forEach((item) => {
    // console.log(`Processing Product: ${item?.product?.name}`);

    const productDiscount = item?.discount || item?.product?.discount || 0;
    const productDiscountType = item?.discount_type || item?.product?.discount_type || "amount";
    // console.log(`Product Discount: ${productDiscount}, Discount Type: ${productDiscountType}`);

    if (productDiscount > 0) {
      if (productDiscountType === "amount") {
        // console.log(`Applying Amount Discount: ${productDiscount} * Quantity: ${item.quantity}`);
        totalDiscount += productDiscount * item.quantity;
      } else if (productDiscountType === "percent") {
        const productPrice = handleProductValueWithOutDiscount(item);

        // console.log("product price demo", productPrice);
        const discountAmount = (productPrice * productDiscount) / 100;
        // console.log(`Applying Percent Discount: ${discountAmount} * Quantity: ${item.quantity}`);
        totalDiscount += discountAmount * item.quantity;
      }
    } else {
      // console.log(`No discount applied for Product: ${item?.product?.name}`);
    }
  });

  // console.log(`Total Discount from Products: ${totalDiscount}`);
  return totalDiscount;
};




export const getProductDiscount = (items, storeData) => {
  if (storeData?.discount) {
    let endDate = storeData?.discount?.end_date;
    let endTime = storeData?.discount?.end_time;
    let combinedEndDateTime = moment(
      `${endDate} ${endTime}`,
      "YYYY-MM-DD HH:mm:ss"
    ).format();
    let currentDateTime = moment().format();
    // console.log("Current DateTime: ", currentDateTime);
    // console.log("Discount End DateTime: ", combinedEndDateTime);

    if (combinedEndDateTime > currentDateTime) {
      let restaurentDiscount = storeData?.discount?.discount;
      let resDisType = storeData?.discount?.discount_type;
      let restaurentMinimumPurchase = storeData?.discount?.min_purchase;
      let restaurentMaxDiscount = storeData?.discount?.max_discount;

      // console.log("Restaurant Discount: ", restaurentDiscount);
      // console.log("Minimum Purchase: ", restaurentMinimumPurchase);

      let totalDiscount = handleTotalDiscountBasedOnModules(
        items,
        restaurentDiscount,
        resDisType
      );

      let purchasedAmount = items.reduce(
        (total, product) =>
          ((getSafeFoodVariations(product).length > 0
            ? handleProductValueWithOutDiscount(product)
            : product?.price) +
            (product?.selectedAddons?.length > 0
              ? product?.selectedAddons?.reduce(
                (total, addOn) => addOn.price * addOn.quantity + total,
                0
              )
              : 0)) *
          product.quantity +
          total,
        0
      );

      // console.log("Purchased Amount: ", purchasedAmount);
      // console.log("Total Discount: ", totalDiscount);

      if (purchasedAmount >= restaurentMinimumPurchase) {
        if (totalDiscount >= restaurentMaxDiscount) {
          return restaurentMaxDiscount;
        } else {
          return totalDiscount;
        }
      } else {
        return 0;
      }
    } else {
      return handleProductWiseDiscount(items);
    }
  } else {
    return handleProductWiseDiscount(items);
  }
};

export const getConvertDiscount = (dis, disType, price, restaurantDiscount) => {
  // console.log("getConvertDiscount function invoked with:", { dis, disType, price, restaurantDiscount });

  // console.log("Original Price:", price);
  // console.log("Discount (percent):", dis);

  if (restaurantDiscount === 0) {
    if (dis !== 0) {
      if (disType === "amount") {
        price = price - dis;
      } else if (disType === "percent") {
        // Calculate percentage discount
        const discountAmount = (price * dis) / 100;
        // console.log("Calculated Discount Amount:", discountAmount);
        price = price - discountAmount;
      }
    }
  } else {
    // Apply restaurant discount
    price = price - (price * restaurantDiscount) / 100;
    // console.log("Price after Restaurant Discount:", price);
  }

  // console.log("Final Price After Discount:", price);
  return price;
};



export const getFinalTotalPrice = (
  items,
  couponDiscount,
  taxAmount,
  storeData
) => {
  let totalPrice = 0;

  if (items?.length > 0) {
    items.forEach(item => {
      totalPrice += item.price * item.quantity;
    });

    totalPrice =
      totalPrice -
      getProductDiscount(items, storeData) +
      taxAmount;

    if (couponDiscount?.discount) {
      totalPrice -= getCouponDiscount(couponDiscount, storeData, items);
    }
  }

  return totalPrice;
};



export const currentTime = moment(currentDate).format("HH:mm");

function recursive(start, end, close, list, schedule_order_slot_duration, day, depth = 0) {

  const safeDuration = Number(schedule_order_slot_duration);
  if (!safeDuration || safeDuration <= 0 || !Number.isFinite(safeDuration)) {
    // console.warn(
    //   "⚠️ Invalid schedule_order_slot_duration, stopping recursion:",
    //   schedule_order_slot_duration
    // );
    return list;
  }
  if (depth > 200) {
    // console.warn("⚠️ recursive() exceeded max depth, stopping to avoid stack overflow");
    return list;
  }
  if (!end?.isValid?.() || !close?.isValid?.()) {
    // console.warn("⚠️ Invalid moment object passed to recursive(), stopping");
    return list;
  }

  const checkedEnd = moment(end, "HH:mm").subtract(1, "minutes");
  const date =
    getDayNumber(today) === day
      ? moment(currentDate).format("yyyy-MM-DD")
      : nextday;
  if (
    // end.isBefore(close) ||
    moment(end).format("HH:mm") === moment(close).format("HH:mm") ||
    moment(checkedEnd).format("HH:mm") === moment(close).format("HH:mm")
  ) {
    let label = "";
    if (
      currentTime > moment(start).format("HH:mm") &&
      currentTime < moment(end).format("HH:mm")
    ) {
      label = t("Now");
    } else {
      label = `${moment(start).format("HH:mm")} - ${moment(checkedEnd).format(
        "HH:mm"
      )}`;
    }
    if (
      (currentTime < moment(end).format("HH:mm") &&
        getDayNumber(today) === day) ||
      (currentTime > moment(end).format("HH:mm") && getDayNumber(today) !== day)
    ) {
      list.push({
        label: label,
        start: moment(start).format("HH:mm"),
        end:
          moment(checkedEnd).format("HH:mm") === moment(close).format("HH:mm")
            ? moment(checkedEnd).format("HH:mm")
            : moment(end).format("HH:mm"),
        value:
          moment(checkedEnd).format("HH:mm") === moment(close).format("HH:mm")
            ? `${date} ${moment(checkedEnd).format("HH:mm")}`
            : `${date} ${moment(end).format("HH:mm")}`,
      });
    }

    recursive(
      end,
      moment(end, "HH:mm").add(schedule_order_slot_duration, "minutes"),
      close,
      list,
      schedule_order_slot_duration,
      day,
      depth + 1   // 👈 depth counter aage badhao
    );
  } else {
    return list;
  }
}

export const getAllSchedule = (
  day,
  schedules,
  schedule_order_slot_duration
) => {
  let list = [];

  // 🛑 agar duration hi invalid hai to recursive function call mat karo
  const safeDuration = Number(schedule_order_slot_duration);
  if (!safeDuration || safeDuration <= 0 || !Number.isFinite(safeDuration)) {
    // console.warn("⚠️ getAllSchedule: invalid schedule_order_slot_duration:", schedule_order_slot_duration);
    return list;
  }

  if (schedules && schedules.length > 0) {
    const days = schedules.filter((s) => s.day === day);
    for (let index = 0; index < days.length; index++) {
      let close = moment(days[index].closing_time, "HH:mm");
      let start = moment(days[index].opening_time, "HH:mm");

      // 🛑 invalid time strings ko bhi skip karo
      if (!close.isValid() || !start.isValid()) {
        // console.warn("⚠️ getAllSchedule: invalid opening/closing time at index", index);
        continue;
      }

      let end = moment(start, "HH:mm").add(
        safeDuration,
        "minutes"
      );
      recursive(start, end, close, list, safeDuration, day);
    }
  }
  return list;
};

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function radians(degrees) {
  return degrees * (Math.PI / 180);
}

const degrees = (doubleRadiance) => {
  return doubleRadiance * (180 / Math.PI);
};
const toRadians = (degree) => {
  return (degree * Math.PI) / 180;
};

function distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
  const earthRadius = 6378137.0;
  const startLatitude = lat1;
  const endLatitude = lat2;
  const startLongitude = lon1;
  const endLongitude = lon2;
  const dLat = toRadians(endLatitude - startLatitude);
  const dLon = toRadians(endLongitude - startLongitude);

  const a =
    Math.pow(Math.sin(dLat / 2), 2) +
    Math.pow(Math.sin(dLon / 2), 2) *
    Math.cos(toRadians(startLatitude)) *
    Math.cos(toRadians(endLatitude));
  const c = 2 * Math.asin(Math.sqrt(a));

  return earthRadius * c;
}

export const handleDistance = (distance, origin, destination) => {
  if (distance?.[0]?.distance?.value) {
    return distance?.[0]?.distance?.value / 1000;
  } else if (distance?.[0]?.status === "ZERO_RESULTS") {
    return (
      distanceInKmBetweenEarthCoordinates(
        origin?.latitude || origin?.lat,
        origin?.longitude || origin?.lng,
        destination?.lat || destination?.latitude,
        destination?.lng || destination?.longitude
      ) / 1000
    );
  } else {
    return 0;
  }
};
export const cartItemsTotalAmount = (cartList) => {
  let totalAmount = 0;
  if (cartList?.length > 0) {
    cartList?.forEach((item) => {
      totalAmount += handleTotalAmountWithAddons(
        getDiscountedAmount(
          item?.totalPrice,
          item?.discount,
          item?.discount_type,
          item?.store_discount,
          item?.quantity
        ),
        item?.selectedAddons
      );
    });
  }
  return totalAmount;
};

export const getInfoFromZoneData = (zoneData) => {
  let chargeInfo;
  if (zoneData?.data?.zone_data?.length > 0) {
    zoneData?.data?.zone_data?.forEach((item, index) => {
      if (item?.modules?.length > 0) {
        item?.modules?.forEach((moduleItem) => {
          if (
            moduleItem?.module_type === getCurrentModuleType() &&
            moduleItem?.id === getCurrentModuleId()
          ) {
            chargeInfo = {
              ...moduleItem,
              increased_delivery_fee_status:
                item?.increased_delivery_fee_status,
              increased_delivery_fee: item?.increased_delivery_fee,
            };
          }
        });
      }
    });
  }
  return chargeInfo;
};
export let bad_weather_fees = 0;
const getDeliveryFeeByBadWeather = (
  charge,
  increasedDeliveryFee,
  increasedDeliveryFeeStatus
) => {
  const totalCharge = charge;
  if (increasedDeliveryFeeStatus === 1) {
    const tempValue = totalCharge * (increasedDeliveryFee / 100);
    bad_weather_fees = tempValue;
    return totalCharge + tempValue;
  } else {
    return totalCharge;
  }
};
export const getDeliveryFees = (
  storeData,
  configData,
  cartList,
  distance,
  couponDiscount,
  couponType,
  orderType,
  zoneData,
  origin,
  destination,
  extraCharge
) => {
  if (orderType === "delivery" || orderType === "schedule_order") {
    //convert m to km
    let convertedDistance = handleDistance(
      distance?.rows?.[0]?.elements,
      origin,
      destination
    );
    let deliveryFee = convertedDistance * configData?.per_km_shipping_charge;

    let totalOrderAmount = cartItemsTotalAmount(cartList);
    //restaurant self delivery system checking
    if (Number.parseInt(storeData?.self_delivery_system) === 1) {
      if (storeData?.free_delivery) {
        return 0;
      } else {
        deliveryFee =
          convertedDistance * storeData?.per_km_shipping_charge || 0;
        if (
          deliveryFee >= storeData?.minimum_shipping_charge &&
          deliveryFee <= storeData.maximum_shipping_charge
        ) {
          return deliveryFee;
        } else {
          if (deliveryFee < storeData?.minimum_shipping_charge) {
            return storeData?.minimum_shipping_charge;
          } else if (
            storeData?.maximum_shipping_charge !== null &&
            deliveryFee > storeData?.maximum_shipping_charge
          ) {
            return storeData?.maximum_shipping_charge;
          }
        }
      }
    } else {
      if (zoneData?.data?.zone_data?.length > 0) {
        const chargeInfo = getInfoFromZoneData(zoneData);
        if (
          chargeInfo?.pivot?.per_km_shipping_charge !== null &&
          chargeInfo?.pivot?.per_km_shipping_charge >= 0
        ) {
          deliveryFee =
            convertedDistance *
            (chargeInfo?.pivot?.per_km_shipping_charge || 0);
          if (
            (configData?.free_delivery_over !== null &&
              configData?.free_delivery_over > 0 &&
              totalOrderAmount >= configData?.free_delivery_over) ||
            orderType === "take_away"
          ) {
            return 0;
          } else if (
            deliveryFee <= chargeInfo?.pivot?.minimum_shipping_charge
          ) {
            return getDeliveryFeeByBadWeather(
              chargeInfo?.pivot?.minimum_shipping_charge + extraCharge,
              chargeInfo?.increased_delivery_fee,
              chargeInfo?.increased_delivery_fee_status
            );
          } else if (
            deliveryFee >= chargeInfo?.pivot?.maximum_shipping_charge &&
            chargeInfo?.pivot?.maximum_shipping_charge !== null
          ) {
            return getDeliveryFeeByBadWeather(
              chargeInfo?.pivot?.maximum_shipping_charge + extraCharge,
              chargeInfo?.increased_delivery_fee,
              chargeInfo?.increased_delivery_fee_status
            );
          } else {
            return getDeliveryFeeByBadWeather(
              deliveryFee + extraCharge,
              chargeInfo?.increased_delivery_fee,
              chargeInfo?.increased_delivery_fee_status
            );
          }
        }
      }
    }
  } else {
    return 0;
  }
};
export const getItemTotalWithoutDiscount = (item) => {
  return item?.price + handleVariationValuesSum(
    getSafeFoodVariations(item)
  );
};


export const getSubTotalPrice = (validCartList) => {
  // console.log('Inside getSubTotalPrice, received validCartList:', validCartList);
  // console.log('Current module type:', getCurrentModuleType());

  let subtotal = 0;

  if (getCurrentModuleType() === "food") {
    // console.log('Processing food items');
    subtotal = validCartList.reduce(
      (total, product) => {
        // console.log('Processing product:', product); // Debugging line
        const itemTotal =
          getSafeFoodVariations(product).length > 0
            ? getItemTotalWithoutDiscount(product)
            : product.price;

        const addonsTotal = selectedAddonsTotal(product.selectedAddons);

        return itemTotal * product.quantity + addonsTotal + total;
      },
      0
    );
  } else {
    // console.log('Processing other items');
    subtotal = validCartList.reduce(
      (total, product) => {
        // console.log('Processing product:', product); // Debugging line
        const selectedOptionPrice = product?.selectedOption?.length > 0
          ? product?.selectedOption?.[0]?.price
          : product.price;

        return selectedOptionPrice * product.quantity + total;
      },
      0
    );
  }

  // console.log('Calculated subtotal:', subtotal); // Debugging line
  return subtotal;
};




const handleTaxIncludeExclude = (
  cartList,
  couponDiscount,
  storeData,
  referDiscount
) => {
  const stores = store?.getState();
  const { configData } = stores?.configData;
  if (configData && configData?.tax_included === 0) {
    return getTaxableTotalPrice(
      cartList,
      couponDiscount,
      storeData,
      referDiscount
    );
  } else {
    return 0;
  }
};

export const getCalculatedTotal = (
  cartList,
  couponDiscount,
  storeData,
  global,
  distanceData,
  couponType,
  orderType,
  freeDelivery,
  deliveryTip,
  zoneData,
  origin,
  destination,
  extraCharge,
  additionalCharge,
  packagingCharge,
  referDiscount
) => {
  if (couponDiscount) {
    if (couponDiscount?.coupon_type === "free_delivery") {
      return (
        getSubTotalPrice(cartList) -
        getProductDiscount(cartList, storeData) +
        handleTaxIncludeExclude(
          cartList,
          couponDiscount,
          storeData,
          referDiscount
        ) -
        (couponDiscount
          ? getCouponDiscount(couponDiscount, storeData, cartList)
          : 0)
      );
    } else {
      return (
        getSubTotalPrice(cartList) -
        getProductDiscount(cartList, storeData) +
        handleTaxIncludeExclude(
          cartList,
          couponDiscount,
          storeData,
          referDiscount
        ) -
        (couponDiscount
          ? getCouponDiscount(couponDiscount, storeData, cartList)
          : 0) +
        getDeliveryFees(
          storeData,
          global,
          cartList,
          distanceData?.data,
          couponDiscount,
          couponType,
          orderType,
          zoneData,
          origin,
          destination,
          extraCharge
        ) +
        deliveryTip +
        additionalCharge +
        packagingCharge
      );
    }
  } else {
    return (
      getSubTotalPrice(cartList) -
      getProductDiscount(cartList, storeData) +
      handleTaxIncludeExclude(
        cartList,
        couponDiscount,
        storeData,
        referDiscount
      ) -
      0 +
      getDeliveryFees(
        storeData,
        global,
        cartList,
        distanceData?.data,
        couponDiscount,
        couponType,
        orderType,
        zoneData,
        origin,
        destination,
        extraCharge
      ) +
      deliveryTip +
      additionalCharge +
      packagingCharge
    );
  }
};

export const isFoodAvailableBySchedule = (cart, selectedTime) => {
  if (selectedTime === "now") {
    let currentTime = moment();
    if (cart.length > 0) {
      let isAvailable = cart.every((item) => {
        const startTime = moment(
          item?.available_time_starts || item?.product?.available_time_starts,
          "HH:mm:ss"
        );

        const endTime = moment(
          item?.available_time_ends || item?.product?.available_time_ends,
          "HH:mm:ss"
        );
        return moment(currentTime).isBetween(startTime, endTime);
      });
      return !!isAvailable;
    }
  } else {
    if (selectedTime) {
      const slug = selectedTime.split(" ").pop();
      if (cart.length > 0) {
        const isAvailable = cart.every((item) => {
          const startTime = moment(
            item?.available_time_starts || item?.product?.available_time_starts,
            "HH:mm:ss"
          );

          const endTime = moment(
            item?.available_time_ends || item?.product?.available_time_ends,
            "HH:mm:ss"
          );
          const currentTime = moment(selectedTime, "HH:mm:ss");
          return moment(currentTime).isBetween(startTime, endTime);
        });
        return !!isAvailable;
      }
    }
  }
};

export const getVariation = (variations) => {
  let variation = "";
  if (variations?.length > 0) {
    variations.map((item, index) => {
      // if (index > 1) variation += `-${item.value}`
      // variation += item.value
      const type =
        item?.value?.type ??
        item?.type ??
        item?.label ??
        "";

      variation += `${index !== 0 ? "-" : ""}${type}`;

    });
  }
  return variation;
};

export const getTotalVariationsPrice = (variations) => {
  let value = 0;
  if (variations?.length > 0) {
    variations?.forEach?.((item) => {
      if (item?.values?.length > 0) {
        item?.values?.forEach((itemVal) => {
          if (itemVal?.isSelected) {
            value += Number.parseInt(itemVal?.optionPrice);
          }
        });
      }
    });
  }
  return value;
};

export const isObjectEmpty = (obj) => {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
};

export const cartItemTotalDiscount = (cartList) => {
  let totalDiscount = 0;
  if (cartList?.length > 0) {
    cartList?.forEach((item) => {
      totalDiscount += getCartTotalDiscount(
        item?.totalPrice,
        item?.discount,
        item?.discount_type,
        item?.store_discount,
        item?.quantity
      );
    });
  }
  return totalDiscount;
};

export const getCartTotalDiscount = (
  price,
  discount,
  discountType,
  storeDiscount,
  quantity
) => {
  let discountTotal = 0;
  let q = quantity ? quantity : 1;
  if (Number.parseInt(storeDiscount) === 0) {
    if (discountType === "amount") {
      discountTotal = discount * q;
    } else if (discountType === "percent") {
      discountTotal = (discount / 100) * price;
    }
  } else {
    discountTotal = (storeDiscount / 100) * price;
  }
  return discountTotal;
};

// Sort products by high to low value
export const getHighToLow = (data) => {
  if (data?.length > 0) {
    return data.sort((a, b) => b.price - a.price);
  }
};
// Sort products by low to high value
const getLowToHigh = (data) => {
  if (data?.length > 0) {
    return data.sort((a, b) => a.price - b.price);
  }
};

export const removeDuplicates = (array, property) => {
  const uniqueValues = {};
  return array.filter((item) => {
    if (!uniqueValues[item[property]]) {
      uniqueValues[item[property]] = true;
      return true;
    }
    return false;
  });
};
export const getImageUrl = (storage, imageType, configData) => {
  if (!configData) return null;
  const storageMapping = {
    s3: configData.s3_base_urls,
    public: configData.base_urls,
    // Add more mappings as needed:
  };

  const baseUrlSet =
    storage === null || !storageMapping[storage?.value]
      ? configData.base_urls
      : storageMapping[storage?.value];

  const url = baseUrlSet?.[imageType];
  return url || null;
};
export const getHeaderImageUrl = (storage, imageType, landingData) => {
  if (!landingData) return null;
  const storageMapping = {
    s3: landingData.s3_base_urls,
    public: landingData.base_urls,
    // Add more mappings as needed:
  };

  const baseUrlSet =
    storage === null || !storageMapping[storage]
      ? landingData.base_urls
      : storageMapping[storage];

  const url = baseUrlSet?.[imageType];
  return url || null;
};

export const getHomePageBannerImageUrl = (storage, imageType, bannerData) => {
  if (storage === null || storage === "public") {
    return (
      bannerData.promotional_banner_url ||
      bannerData?.why_choose_url ||
      bannerData?.banner_video_content_url
    );
  } else if (storage === "s3") {
    return (
      bannerData.promotional_banner_s3_url ||
      bannerData?.why_choose_s3_url ||
      bannerData?.banner_video_content_s3_url
    );
  }
};
export const removeSpecialCharacters = (inputString) => {
  // Define the pattern for special characters
  const pattern = /[^a-zA-Z0-9\s]/g;

  // Use the replace method to remove special characters
  return inputString?.replace(pattern, "");
};
export const getDigitalMethodFromZone = (storeId, zoneData) => {
  if (zoneData?.zone_data?.length > 0) {
    const zone = zoneData?.zone_data?.find((item) => item?.id === storeId);
    if (zone) {
      return zone;
    }
  }
};
export function capitalizeText(text) {
  return text
    .split(" ") // Split the string into an array of words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter and make the rest lowercase
    .join(" "); // Join the words back into a string
}
export function formatPhoneNumber(number) {
  if (number === null || number === undefined) {
    return "";
  }
  const str = number.toString();
  if (str.startsWith("+")) {
    return str;
  } else {
    return `+${str}`;
  }
}

function isEmail(input) {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(input);
}
function isPhoneNumber(input) {
  const phonePattern =
    /^\+?[0-9]{1,4}?[-.s]?(\(?\d{1,3}?\))?[-.s]?\d{1,4}[-.s]?\d{1,4}[-.s]?\d{1,9}$/;
  return phonePattern.test(input);
}
export function checkInput(input) {
  if (isEmail(input)) {
    return "email";
  } else if (isPhoneNumber(input)) {
    return "phone";
  } else {
    return "invalid";
  }
}
export function maskSensitiveInfo(input) {
  if (input) {
    if (input?.includes("@")) {
      const [localPart, domain] = input.split("@");
      const maskedLocalPart =
        localPart.slice(0, 2) + "*".repeat(localPart.length - 2);

      return `${maskedLocalPart}@${domain}`;
    } else {
      const maskedSection = input.slice(4, -3).replace(/\d/g, "*");
      return input.slice(0, 4) + maskedSection + input.slice(-3);
    }
  }
}
