import React, { useState, useEffect } from "react";
import { PrimaryButton } from "../Map/map.style";
import { Stack } from "@mui/system";
import { useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { setCartList } from "redux/slices/cart";
import GuestCheckoutModal from "../cards/GuestCheckoutModal";
import dynamic from "next/dynamic";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
const AuthModal = dynamic(() => import("components/auth/AuthModal"));
const CartActions = (props) => {
    const { setSideDrawerOpen, cartList, text } = props;
    const { configData } = useSelector((state) => state.configData);
    const token = localStorage.getItem("token");
    const [open, setOpen] = useState(false);
    const [openAuth, setOpenAuth] = useState(false);
    const [modalFor, setModalFor] = useState("sign-in");
    const [confirmClearOpen, setConfirmClearOpen] = useState(false);
    const theme = useTheme();
    const { t } = useTranslation();
    const router = useRouter();
    const dispatch = useDispatch();

    function scrollup() {
        const isBrowser = () => typeof window !== 'undefined';
        if (!isBrowser()) return;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    useEffect(() => {
        scrollup();
    }, []);

    const handleRoute = () => {
        router.push("/checkout?page=cart", undefined, { shallow: true });
    };
    const handleCheckout = () => {
//   console.log("Cart List Length: ", cartList?.length);  // Log for cartList length
//   console.log("Cart List Items: ", cartList);  // Log the actual cart items
  
  if (
      cartList?.length > 0 &&
      !token &&
      configData?.guest_checkout_status === 1
  ) {
      setOpen(true);  // Show guest checkout modal
  } else if (cartList?.length > 0 && token) {
    //   console.log("Proceeding to checkout with cart data");
      router.push("/checkout?page=cart", undefined, { shallow: true });
      setSideDrawerOpen(false);
  } else {
      if (cartList?.length === 0) {
          setSideDrawerOpen(false);
          router.push("/home", undefined, { shallow: true });
      } else {
          setOpenAuth(true);
      }
  }
};

    // const handleCheckout = () => {
    // if (cartList?.length > 0) {
    // router.push("/checkout?page=cart", undefined, { shallow: true });
    // setSideDrawerOpen(false);
    // } else {
    // if (router.pathname === "/home") {
    // setSideDrawerOpen(false);
    // } else {
    // router.push("/home", undefined, { shallow: true });
    // }
    // }
    // };
    const handleClearAll = () => {
        setConfirmClearOpen(true);
    };
    const handleConfirmClear = () => {
        dispatch(setCartList([]));
        setConfirmClearOpen(false);
    };
    const handleCancelClear = () => {
        setConfirmClearOpen(false);
    };
    return (
        <Stack
            direction="row"
            width="100%"
            spacing={1}
            pb="1rem"
            sx={{position:"sticky", bottom:0, margin: "10px", marginBottom:"0px"}}
        >
            <PrimaryButton
                onClick={handleCheckout}
                variant="contained"
                size="large"
                fullWidth
                borderRadius="7px"
                sx={{ backgroundColor: "#1A914B" }}
            >
                {text ? (
                    text
                ) : (
                    <>
                        {cartList?.length > 0
                            ? t("Proceed to Checkout")
                            : t("Continue Shopping")}
                    </>
                )}
            </PrimaryButton>
            {/* {cartList?.length > 0 && (
                <PrimaryButton
                    onClick={handleClearAll}
                    variant="contained"
                    size="large"
                    fullWidth
                    borderRadius="7px"
                    sx={{ backgroundColor: "#d32f2f" }}
                >
                    {t("Clear Cart")}
                </PrimaryButton>
            )} */}
            <Dialog
                open={confirmClearOpen}
                onClose={handleCancelClear}
                aria-labelledby="confirm-clear-cart-title"
                aria-describedby="confirm-clear-cart-description"
            >
                <DialogTitle id="confirm-clear-cart-title">{t("Clear Cart")}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="confirm-clear-cart-description">
                        {t("Are you sure you want to clear all items from your cart?")}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelClear} color="primary">
                        {t("Cancel")}
                    </Button>
                    <Button onClick={handleConfirmClear} color="#ffffff" backgroundColor="#1A914B" autoFocus>
                        {t("Yes, Clear Cart")}
                    </Button>
                </DialogActions>
            </Dialog>
            {open && (
                <GuestCheckoutModal
                    open={open}
                    setOpen={setOpen}
                    setSideDrawerOpen={setSideDrawerOpen}
                    handleRoute={handleRoute}
                    setModalFor={setModalFor}
                    setOpenAuth={setOpenAuth}
                />
            )}
            <AuthModal
                modalFor={modalFor}
                setModalFor={setModalFor}
                open={openAuth}
                handleClose={() => setOpenAuth(false)}
            />
        </Stack>
    );
};

CartActions.propTypes = {};

export default CartActions;

