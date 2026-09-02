import { store } from "redux/store";



export const getAmountWithSign = (amount, needDecimal = true) => {
  if (amount == null || isNaN(Number(amount))) return "";

  const { configData } = store?.getState()?.configData || {};
  const symbol = configData?.currency_symbol || "";
  const direction = configData?.currency_symbol_direction || "left";

  const numAmount = Number(amount);
  let formattedAmount = "";

 if (needDecimal) {
  // Round to 2 decimal places
  const roundedAmount = Number(numAmount.toFixed(2));

  // Remove trailing zeros (.00, .0)
  formattedAmount = roundedAmount.toString();
} else {
  formattedAmount = Math.trunc(numAmount).toString();
}

formattedAmount = Number(formattedAmount).toLocaleString();

return direction === "left"
  ? `${symbol}${formattedAmount}`
  : `${formattedAmount}${symbol}`;
};

// Function to get the discounted price
export const getDiscountedAmount = (
  price,
  discount,
  discountType,
  storeDiscount,
  quantity = 1
) => {
  if (!price || !discount) return price;

  let mainPrice = price;

  if (discount > 0) {
    if (discountType === "amount") {
      mainPrice = price - discount * quantity; // multiply by quantity
    } else if (discountType === "percent" || discountType === "fixed") {
      mainPrice = price - (discount / 100) * price; // already totalPrice includes quantity, no need to multiply
    }
  }

  // Remove decimal part if the price is a whole number (e.g., 33.00 should be shown as 33)
  if (mainPrice % 1 === 0) {
    mainPrice = Math.floor(mainPrice);
  }

  // Return discounted price ensuring proper formatting
  return mainPrice % 1 === 0 ? Math.floor(mainPrice) : mainPrice.toFixed(2);
};

// Function to get selected add-ons (not related to price formatting, but here for reference)
export const getSelectedAddOn = (add_ons) => {
  let add_on = "";
  if (add_ons?.length > 0) {
    add_ons?.map((item, index) => {
      if (item?.isChecked) {
        add_on += `${index !== 0 ? ", " : ""}${item.name}`;
      }
    });
  }
  return add_on;
};

// Function to calculate the referral discount based on total amount and discount percentage
export const getReferDiscount = (
  totalAmountForRefer,
  refDiscount,
  refPercentage
) => {
  if (refPercentage === "percentage") {
    return (refDiscount / 100) * totalAmountForRefer;
  } else {
    // Ensure that the discount is displayed without decimals when it's a whole number
    return refDiscount % 1 === 0 ? Math.floor(refDiscount) : refDiscount;
  }
};