import { ACTION } from "./states";
import { getTotalVariationsPrice } from "utils/CustomFunctions";
import { getCurrentModuleType } from "helper-functions/getCurrentModuleType";

/**
 * Initialize modal data with quantity, totalPrice, and selectedOption
 */
export const handleInitialTotalPriceVarPriceQuantitySet = (
  productDetailsData,
  dispatch,
  cartList,
  handleChoices,
  selectedOptions,
  modalData,
) => {
  if (!productDetailsData) return;

  const quantity = productDetailsData?.quantity || 1;

  if (productDetailsData?.selectedOption?.length > 0) {
    dispatch({
      type: ACTION.setModalData,
      payload: {
        ...productDetailsData,
        quantity,
        totalPrice:
          productDetailsData?.totalPrice ||
          productDetailsData?.selectedOption[0]?.price,
      },
    });
  } else if (productDetailsData?.variations?.length > 0) {
    dispatch({
      type: ACTION.setModalData,
      payload: {
        ...productDetailsData,
        selectedOption: [productDetailsData.variations[0]],
        quantity,
        totalPrice:
          productDetailsData?.totalPrice ||
          productDetailsData?.variations?.[0]?.price,
      },
    });
  } else {
    dispatch({
      type: ACTION.setModalData,
      payload: {
        ...productDetailsData,
        quantity,
        totalPrice: productDetailsData?.totalPrice || productDetailsData?.price,
        selectedOption: [],
      },
    });
  }
};

/**
 * Extract selected labels from cart items
 */
export const handleValuesFromCartItems = (variationValues) => {
  if (!Array.isArray(variationValues) || variationValues.length === 0)
    return [];

  let value = variationValues
    .filter((item) => item?.isSelected)
    .map((item) => item.label);

  if (value.length === 0) {
    value.push(variationValues[0]?.label || "");
  }

  return value;
};

/**
 * Format variations for cart payload (backend required)
 */
export const getVariationsForCartData = (newVariation) => {
  if (!Array.isArray(newVariation) || newVariation.length === 0) return [];

  return newVariation.map((variation) => ({
    name: variation.name,
    values: {
      label: handleValuesFromCartItems(variation.values),
    },
  }));
};

/**
 * Convert new variation format to old format { label, isSelected }
 * For backward compatibility
 */
export const transformVariationForOldFormat = (variations) => {
  if (!Array.isArray(variations) || variations.length === 0) return [];

  return variations.map((v) => ({
    ...v,
    values: v.values?.label?.map((label) => ({
      label,
      isSelected: true,
    })),
  }));
};

/**
 * Prepare payload to add product to cart
 */
export const getItemDataForAddToCart = (
  product,
  updateQuantity,
  mainPrice,
  userId,
) => {
  // console.log("==============================");
  // console.log("getItemDataForAddToCart called");
  // console.log("Product:", product);
  // console.log("Quantity:", updateQuantity);
  // console.log("Price:", mainPrice);
  // console.log("User ID:", userId);
  // console.log("==============================");

  let totalQty = 0;

 const isFood = product?.module_type === "food";

const selectedAddons = isFood
  ? product?.addons?.filter(
      (a) => a?.isChecked || a?.isSelected || a?.quantity > 0
    ) || []
  : product?.add_ons || []; // 🔒 old behavior untouched

const payload = {
  guest_id: userId,
  cart_id: product?.cartItemId || null,
  model: product?.available_date_starts ? "ItemCampaign" : "Item",

  add_on_ids: isFood
    ? selectedAddons.map((add) => add.id)
    : selectedAddons.map((add) => add.id),

  add_on_qtys: isFood
    ? selectedAddons.map((add) => add.quantity || 1)
    : selectedAddons.map(() => 1),

  item_id: product?.id,
  price: mainPrice,
  module_id: product?.module_id,
  module_type: product?.module_type,
  quantity: updateQuantity,

  variation:
    product?.module_type === "food" && product?.food_variations?.length > 0
      ? transformVariationForOldFormat(product.food_variations)
      : product?.selectedOption?.length > 0
      ? product.selectedOption
      : [],
};

  // console.log("Generated payload:", payload);
  // console.log("==============================");
  // console.log("PAYLOAD ADDONS:", payload.add_on_ids);

  return payload;
};

/**
 * Calculate total price after quantity change
 */
export const getPriceAfterQuantityChange = (cart, Quantity) => {
  const basePrice =
    cart?.price + getTotalVariationsPrice(cart?.food_variations);
  const productPrice = basePrice * Quantity;

  const mainPrice =
    getCurrentModuleType() === "food"
      ? productPrice
      : (cart?.selectedOption?.length > 0
          ? cart?.selectedOption?.[0]?.price
          : cart?.price) * Quantity;

  return mainPrice;
};

/**
 * Check if variation stock is available
 */
export const isVariationAvailable = (productDetailsData) => {
  if (productDetailsData?.selectedOption?.length > 0) {
    return productDetailsData?.selectedOption[0]?.stock > 0;
  }
  return true;
};

/**
 * Resolve backend model based on module type
 */
export const resolveModelForBackend = (item) => {
  const mt = (item.module_type || "").toLowerCase();

  if (mt === "food") return "App\\Models\\Food";
  if (mt === "grocery" || mt === "item") return "App\\Models\\Item";
  if (mt === "pharmacy") return "App\\Models\\Pharmacy";
  if (mt === "parcel") return "App\\Models\\Parcel";

  return "App\\Models\\Item";
};
