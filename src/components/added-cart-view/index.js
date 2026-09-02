import { useSelector, useDispatch } from "react-redux";
import React, { useState, useEffect } from "react";
import EmptyCart from "./EmptyCart";
import CartActions from "./CartActions";
import { CustomStackFullWidth } from "../../styled-components/CustomStyles.style";
import CartContents from "./CartContents";
import { getCartListModuleWise } from "../../helper-functions/getCartListModuleWise";
import { useRouter } from "next/router";
import CustomSideDrawer from "../side-drawer/CustomSideDrawer";
import DrawerHeader from "./DrawerHeader";
import CartIcon from "./assets/CartIcon";
import FreeDeliveryProgressBar from "./FreeDeliveryProgressBar";
import CartTotalPrice from "./CartTotalPrice";
import { useTheme } from "@emotion/react";
import DotSpin from "../DotSpin";
import { Stack } from "@mui/system";
import OrderSummaryDetails from "../../components/home/module-wise-components/parcel/parcelNewComp/bannerTop";
import { setCartList } from "redux/slices/cart"; // Import the clear cart action
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button"; // For dialog buttons
import useDeleteAllCartItem from "api-manage/hooks/react-query/add-cart/useDeleteAllCartItem";

const CardView = (props) => {
  const theme = useTheme();
  const { sideDrawerOpen, setSideDrawerOpen, cartList, refetch, isLoading, userId } = props;
  const { configData } = useSelector((state) => state.configData);
  const imageBaseUrl = configData?.base_urls?.item_image_url;
  const router = useRouter();
  const dispatch = useDispatch(); // To dispatch clear cart action
  const closeHandler = () => {
    setSideDrawerOpen(false);
  };

  // State to control the dialog visibility
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  // Use delete all cart item hook
  const { mutateAsync: deleteAllCartItems, isLoading: deleteLoading, error } = useDeleteAllCartItem();

  const getModuleWiseCartContent = () => {
    return (
      <CartContents
        cartList={getCartListModuleWise(cartList)}
        imageBaseUrl={imageBaseUrl}
        refetch={refetch}
        handleClearCart={handleClearCart}
        deleteLoading={deleteLoading}
      />
    );
  };

  // Handle clearing the cart
  const handleClearCart = () => {
    // console.log("Before Clear Cart:", cartList); // Log cart list before clearing
    setClearConfirmOpen(true); // Show confirmation dialog
  };

  const handleConfirmClearCart = async () => {
    try {
      // console.log("Before API Call - Clear Cart:", cartList); // Log before API call
      await deleteAllCartItems(userId); // Pass the guestId (or userId) here
      // console.log("After API Call - Clear Cart:", []); // Log after API call (cart is cleared)
      // After successful API call, clear the Redux cart state
      dispatch(setCartList([])); // Clear cart from Redux store
      setClearConfirmOpen(false); // Close the confirmation dialog
      setSideDrawerOpen(false); // Close the side drawer after clearing cart
    } catch (error) {
      // console.error("Error clearing cart:", error); // Handle any errors
    }
  };

  const handleCancelClearCart = () => {
    setClearConfirmOpen(false); // Close the dialog without clearing the cart
  };

  return (
    <>
      <CustomSideDrawer
        anchor="right"
        open={sideDrawerOpen}
        onClose={closeHandler}
        variant="temporary"
        maxWidth="400px"
        height="100%"
        width="100%"
      >
        <DrawerHeader title="Your Cart" closeHandler={closeHandler} />

        <CustomStackFullWidth
          alignItems="center"
          justifyContent="flex-start"
          sx={{
            height: "100vh",
            px: "10px",
            gap: "2px", // Reduce spacing between components
            paddingBottom: "50px", // Make space for the fixed CartActions button
            backgroundColor: "#F5F7FD",
          }}
        >
          {/* Show the cart contents or loading */}
          {isLoading ? (
            <Stack height="214px" width="100%" justifyContent="center">
              <DotSpin />
            </Stack>
          ) : getCartListModuleWise(cartList)?.length === 0 ? (
            <EmptyCart
              cartList={getCartListModuleWise(cartList)}
              setSideDrawerOpen={setSideDrawerOpen}
            />
          ) : (
            getModuleWiseCartContent()
          )}

          {/* Free delivery progress bar */}
          {getCartListModuleWise(cartList).length > 0 && configData?.free_delivery_over && (
            <FreeDeliveryProgressBar configData={configData} cartList={cartList} />
          )}

          {/* Order Summary */}
          {getCartListModuleWise(cartList).length > 0 && (
            <OrderSummaryDetails sx={{ width: "300px !important" }} cartList={cartList} isSmall={false} />
          )}

          {/* Cart Actions fixed to bottom */}
          {getCartListModuleWise(cartList).length > 0 && (
            <CartActions
              setSideDrawerOpen={setSideDrawerOpen}
              cartList={getCartListModuleWise(cartList)}
              sx={{
                position: "sticky",
                bottom: "10px",
                width: "100%",
                zIndex: 10,
              }}
            />
          )}
        </CustomStackFullWidth>
      </CustomSideDrawer>

      {/* Clear Cart Confirmation Dialog */}
      <Dialog
        open={clearConfirmOpen}
        onClose={handleCancelClearCart}
        aria-labelledby="confirm-clear-cart-title"
        aria-describedby="confirm-clear-cart-description"
        sx={{

        }}
      >
        <DialogTitle id="confirm-clear-cart-title">Clear Cart</DialogTitle>
        <DialogContent >
          <DialogContentText id="confirm-clear-cart-description">
            Are you sure you want to clear all items from your cart?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancelClearCart}
            sx={{
              border: '1px solid grey',
              color: 'grey',
              backgroundColor: 'white',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'white',
              },
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleConfirmClearCart}
            sx={{
              border: '1px solid grey',
              color: 'white',
              backgroundColor: '#1A914B',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#17703c',
              },
            }}
            autoFocus
          >
            Yes, Clear Cart
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CardView;
