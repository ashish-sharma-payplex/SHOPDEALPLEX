// src\components\home\module-wise-components\rental\components\rental-cart\CartContentCart.js
import React from "react";
import { CustomRentalCard } from "components/home/module-wise-components/rental/components/global/CustomRentalCard";
import { Box } from "@mui/system";
import { Stack, Typography } from "@mui/material";
import useUpdateBookingCart from "components/home/module-wise-components/rental/rental-api-manage/hooks/react-query/confirm-booking/useUpdateBookingCart";
import useDeleteItemFromBooking from "components/home/module-wise-components/rental/rental-api-manage/hooks/react-query/confirm-booking/useDeleteItemFromBooking";
import { setCartList } from "redux/slices/cart";
import { onErrorResponse } from "api-manage/api-error-response/ErrorResponses";
import { useDispatch } from "react-redux";
import { useTheme } from "@mui/styles";
import { removeItemFromCart, updateCart } from "components/home/module-wise-components/rental/components/rental-cart/helper";
import toast from "react-hot-toast";
import Link from "next/link";
import { t } from "i18next";

const CartContentCart = ({ item, userData, isPriceShow, isTaxiView, onItemRemoved }) => {
// console.group("Rental cart view :",item)

    const rentalType = userData?.rental_type || 'hourly';
    // console.log("rental_type:", rentalType);
    const displayPrice =
        rentalType === 'hourly'
            ? item.vehicle?.hourly_price || 0
            : rentalType === 'distance'
                ? item.vehicle?.distance_price || 0
                : item.price || 0;

    // console.log("Determined displayPrice:", displayPrice);

    const discountType = item?.vehicle?.discount_type;
    const discountValue = item?.vehicle?.discount_price || 0;

    let derivedPrice = displayPrice;

    if (discountType === "percent") {
        derivedPrice = displayPrice - (displayPrice * discountValue) / 100;
    } else if (discountType === "amount") {
        derivedPrice = displayPrice - discountValue;
    }

    // Prevent negative price
    if (derivedPrice < 0) derivedPrice = 0;


    const theme = useTheme();
    const dispatch = useDispatch();
    const { mutate: updateMutate, isLoading: updateIsLoading } = useUpdateBookingCart();
    const { mutate } = useDeleteItemFromBooking();

    // --- Counter Handlers (MODIFIED to ensure data integrity) ---
    const handleUpdateQuantity = (cartItem, newQuantity) => {
        // Log cartItem and newQuantity
        // console.log("handleUpdateQuantity cartItem:", cartItem);
        // console.log("handleUpdateQuantity newQuantity:", newQuantity);

        // 1. Validation for Increment
        if (newQuantity > cartItem?.quantity) {
            if (item?.vehicle?.total_vehicle_count < newQuantity) {
                toast.error(t(`You can't add more than ${item.vehicle?.total_vehicle_count} quantities of this vehicle.`));
                return; // Stop execution if max quantity reached
            }
        }

        // 2. Critical Check: Ensure cart ID is available
        if (!cartItem?.id) {
            // console.error("ERROR: Cart Item ID is missing for API call.", cartItem);
            toast.error(t("Cannot update cart. Item ID not found."));
            return;
        }

        // 3. Call the helper function with all necessary data
        updateCart(
            cartItem,
            userData,
            dispatch,
            setCartList,
            newQuantity, // Pass the calculated new quantity
            updateMutate
        );
    };

    const handleIncrement = (cartItem) => {
        const updateQuantity = cartItem?.quantity + 1;
        // console.log("handleIncrement newQuantity:", updateQuantity); 
        handleUpdateQuantity(cartItem, updateQuantity);
    };

    const handleDecrement = (cartItem) => {
        const updateQuantity = cartItem?.quantity - 1;
        // console.log("handleDecrement newQuantity:", updateQuantity); 
        // Check if quantity is 0, if so, we might want to delete it or stop decrement
        if (updateQuantity < 1) {
            removeItemCart(cartItem); // Delete item if quantity goes to 0
            return;
        }
        handleUpdateQuantity(cartItem, updateQuantity);
    };

    const removeItemCart = (cartItem) => {
        // console.log("removeItemCart cartItem:", cartItem);

        // ✅ UI ko turant update karo
        onItemRemoved?.(cartItem.id);

        // ✅ backend + redux ko background me sync hone do
        removeItemFromCart(cartItem, mutate, dispatch, setCartList);

        // 🔥 Trigger badge refresh
        window.dispatchEvent(new Event("REFRESH_RENTAL_CART"));
    };

    // console.log("Vehicle hourly_price:", item.vehicle?.hourly_price);
    // console.log("Vehicle distance_price:", item.vehicle?.distance_price);
    // console.log("Determined displayPrice:", displayPrice);

    // --- Component Rendering (Same as previous fix) ---
    return (
        <CustomRentalCard.root
            isTaxiView={isTaxiView}
            sx={
                isTaxiView
                    ? {
                        borderRadius: "1px solid red",
                        background: "transparent",
                        borderBottom: (theme) => `1px solid ${theme.palette.neutral[200]}`,
                        boxShadow: "none",
                        mb: "20px",
                        width: "100%",
                        padding: "16px 0",
                        alignItems: "flex-start",
                    }
                    : {}
            }
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "start",
                    alignItems: "start",
                    gap: "12px",
                    width: "100%",
                    borderRadius: "1px solid blue",
                }}
            >
                {/* Log the item data for the image */}
                {/* {console.log("item in CartContentCart:", item)} */}

                {/* Image */}
                <Link href={`/rental/vehicle-details/${item?.vehicle?.id}`} passHref>
                    <Stack>
                        <CustomRentalCard.image
                            itemImage={item?.vehicle?.thumbnail_full_url}
                              alt={item?.vehicle?.name || "Vehicle Image"}
                                title={item?.vehicle?.name || "Vehicle Image"}
                        />
                    </Stack>
                </Link>

                {/* Details, Price, and Counter Stack */}
                <Stack direction="column" flexGrow={1}>
                    {/* Log item and userData */}
                    {/* {console.log("item details:", item)}
                    {console.log("vehicle userData:", userData)} */}

                    {/* Vehicle Details */}
                    <CustomRentalCard.details item={{
                        ...item,
                        rental_type: rentalType
                    }} />

                    {/* Inline Price + Counter (TaxiView) */}
                    {isTaxiView && (
                        <Box
                            sx={{
                                mt: 1,
                                display: "flex",
                                justifyContent: "space-between", // price left, counter right
                                alignItems: "center",
                            }}
                        >
                            {/* Price left side (same component, same props as before) */}
                            <CustomRentalCard.price
                                item={{
                                    ...item,
                                    rental_type: rentalType,
                                }}
                            />

                            {/* Counter right side */}
                            <CustomRentalCard.counter
                                isShowPrice={isPriceShow}
                                isVerticle={false}
                                quantity={item.quantity}
                                handleIncrement={() => handleIncrement(item)}
                                handleDecrement={() => handleDecrement(item)}
                                updateIsLoading={updateIsLoading}
                                removeItemCart={() => removeItemCart(item)}
                                itemId={item?.id}
                            />
                        </Box>
                    )}
                </Stack>

                {/* Counter for Cart Page (Default view - positioned to the right side) */}
                {!isTaxiView && (
                    <CustomRentalCard.counter
                        isShowPrice={isPriceShow}
                        isVerticle={true}
                        quantity={item.quantity}
                        handleIncrement={() => handleIncrement(item)}
                        handleDecrement={() => handleDecrement(item)}
                        updateIsLoading={updateIsLoading}
                        removeItemCart={() => removeItemCart(item)}
                        itemId={item?.id}
                    />
                )}
            </Box>
        </CustomRentalCard.root>
    );
};

export default CartContentCart;
