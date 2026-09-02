import {
  getSubTotalPrice,
  getProductDiscount,
  getCouponDiscount,
  getTaxableTotalPrice,
} from "./CustomFunctions";

export const calculateOrderPrice = ({
  cartList,
  storeData,
  couponDiscount,
  referDiscount = 0,
  deliveryFee = 0,
  deliveryTip = 0,
  packagingCharge = 0,
  additionalCharge = 0,
}) => {
  const subTotal = getSubTotalPrice(cartList);

  const discount = getProductDiscount(cartList, storeData) || 0;
  const coupon = getCouponDiscount(couponDiscount, storeData, cartList) || 0;

  const tax = getTaxableTotalPrice(
    cartList,
    couponDiscount,
    storeData,
    referDiscount
  ) || 0;

  const total =
    subTotal -
    discount -
    coupon +
    tax +
    Number(deliveryFee) +
    Number(deliveryTip) +
    Number(packagingCharge) +
    Number(additionalCharge);

  return {
    subTotal,
    discount,
    coupon,
    tax,
    deliveryFee,
    deliveryTip,
    packagingCharge,
    additionalCharge,
    total: Math.max(0, Number(total.toFixed(2))),
  };
};
