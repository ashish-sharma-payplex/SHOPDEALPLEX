import React, { useState, useEffect } from "react";
import { Box, Typography, Modal, RadioGroup, FormControlLabel, Radio, Button } from "@mui/material";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import { t } from "i18next";
import toast from "react-hot-toast";

import SignInFrm from "./SignInFrm";
import GoogleLoginComp from "./social-login/GoogleLoginComp";
import { getGuestId } from "helper-functions/getToken";
import { getLoginUserCheck } from "./loginHepler";
import { useLogin } from "api-manage/hooks/react-query/auth/useLogin";
import useGetProfile from "api-manage/hooks/react-query/profile/useGetProfile";
import { setUser } from "redux/slices/profileInfo";
import { setWelcomeModal } from "redux/slices/utils";
import { loadCartFromStorageAction, loadCartFromStorage } from "redux/slices/cart";
import { handleGuestCartOnLogin, applyCartChoice } from "utils/cartPersistence";

const SignInContainer = ({ configData }) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [otpData, setOtpData] = useState({ type: "" });
  const [mainToken, setMainToken] = useState(null);
  const [openOtpModal, setOpenOtpModal] = useState(false);
  const [loginValue, setLoginValue] = useState(null);
  const [cartChoiceModal, setCartChoiceModal] = useState({
    open: false,
    guestCart: [],
    userCart: [],
    userId: null
  });
  const [selectedChoice, setSelectedChoice] = useState('separate');

  const userOnSuccessHandler = (res) => {
    dispatch(setUser(res));
  };

  const { data: userData, refetch: profileRefetch } = useGetProfile(userOnSuccessHandler);

  const handleTokenAfterLogin = (response) => {
    if (response) {
      localStorage.setItem("token", response?.token);

      // Get user ID from response
      const userId = response?.user?.id;

      if (userId) {
        // Handle guest cart choice instead of automatic merging
        const guestId = getGuestId();
        if (guestId) {
          // Get guest cart from localStorage
          const guestCartData = localStorage.getItem(`cart_${guestId}`);
          const userCartData = localStorage.getItem(`cart_${userId}`);

          let guestCart = [];
          let userCart = [];

          if (guestCartData) {
            try {
              const parsedGuestData = JSON.parse(guestCartData);
              guestCart = parsedGuestData.cartList || [];
            } catch (error) {
              // console.error('Error parsing guest cart data:', error);
            }
          }

          if (userCartData) {
            try {
              const parsedUserData = JSON.parse(userCartData);
              userCart = parsedUserData.cartList || [];
            } catch (error) {
              // console.error('Error parsing user cart data:', error);
            }
          }

          // Only show modal if both carts have items
          if (guestCart.length > 0 && userCart.length > 0) {
            setCartChoiceModal({
              open: true,
              guestCart,
              userCart,
              userId
            });
            return; // Don't complete login until user makes choice
          }
        }

        // Load user's cart into Redux state
        dispatch(loadCartFromStorageAction({ userId }));
      }

      profileRefetch();
      toast.success(t("login_successful"));
      dispatch(setWelcomeModal(true));
      const zoneSelected = JSON.parse(localStorage.getItem("zoneid"));
      if (zoneSelected && configData) {
        // Adjust navigation logic as needed
        router.push("/home");
      } else {
        router.push("/home");
      }
    }
  };

  const { mutate: loginMutation, isLoading: isLoadingLogin } = useLogin();

  const loginFormik = useFormik({
    initialValues: {
      email_or_phone: "",
      password: "",
    },
    onSubmit: (values) => {
      const loginData = {
        email_or_phone: values.email_or_phone,
        password: values.password,
        guest_id: getGuestId(),
      };
      setLoginValue(loginData);
      loginMutation(loginData, {
        onSuccess: (response) => {
          getLoginUserCheck(
            response,
            loginData,
            handleTokenAfterLogin,
            setOtpData,
            setMainToken,
            null, // sendOTP function if needed
            configData
          );
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || t("Login failed. Please try again."));
        },
      });
    },
  });

  useEffect(() => {
    if (otpData?.type !== "") {
      setOpenOtpModal(true);
    }
  }, [otpData]);

  const handleSuccess = (token) => {
    // Handle social login success
    handleTokenAfterLogin({ token });
  };

  const handleCartChoice = () => {
    const { userId, guestCart, userCart } = cartChoiceModal;

    // Apply the user's choice
    const result = applyCartChoice(userId, selectedChoice, guestCart, dispatch);

    // Update Redux state based on choice
    if (selectedChoice === 'merge') {
      // Cart is already merged by applyCartChoice, just switch to user cart
      dispatch(loadCartFromStorageAction({ userId }));
    } else if (selectedChoice === 'replace') {
      // Cart is already replaced by applyCartChoice, just switch to user cart
      dispatch(loadCartFromStorageAction({ userId }));
    } else {
      // Keep separate - switch to user cart and keep guest cart in state
      dispatch(loadCartFromStorageAction({ userId }));
    }

    // Close modal and complete login
    setCartChoiceModal({ open: false, guestCart: [], userCart: [], userId: null });
    profileRefetch();
    toast.success(t("login_successful"));
    dispatch(setWelcomeModal(true));
    const zoneSelected = JSON.parse(localStorage.getItem("zoneid"));
    if (zoneSelected && configData) {
      router.push("/home");
    } else {
      router.push("/home");
    }
  };

  const handleChoiceChange = (event) => {
    setSelectedChoice(event.target.value);
  };

  const getChoiceDescription = (choice) => {
    switch (choice) {
      case 'merge':
        return 'Combine your guest cart items with your existing user cart. Items with the same specifications will be merged together.';
      case 'replace':
        return 'Replace your existing user cart completely with your guest cart items.';
      case 'separate':
      default:
        return 'Keep your carts separate. Your guest cart will be saved and you can switch between them later.';
    }
  };

  const getCartSummary = (cart) => {
    if (!cart || cart.length === 0) return 'Empty cart';
    const itemCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    const totalValue = cart.reduce((total, item) => total + (item.totalPrice || item.price || 0), 0);
    return `${itemCount} item${itemCount !== 1 ? 's' : ''} ($${totalValue.toFixed(2)})`;
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <SignInFrm
        loginFormik={loginFormik}
        isLoading={isLoadingLogin}
        rememberMeHandleChange={() => {}}
        handleSignUp={() => router.push("/sign-up")}
        handleClick={() => window.open("/terms-and-conditions")}
        configData={configData}
        handleClose={() => {
          // This will close the modal backdrop when CloseIcon is clicked
          // The actual implementation depends on how the modal is controlled
          // console.log("Close button clicked - backdrop should close");
        }}
      />
      <Box sx={{ mt: 2, width: "100%", maxWidth: 400 }}>
        <GoogleLoginComp
          handleSuccess={handleSuccess}
          socialLength={1}
          state={{ status: "social" }}
          setJwtToken={() => {}}
          setUserInfo={() => {}}
          setModalFor={() => {}}
          setMedium={() => {}}
          loginMutation={loginMutation}
          setLoginInfo={() => {}}
        />
      </Box>

      {/* Cart Choice Modal */}
      <Modal
        open={cartChoiceModal.open}
        onClose={() => setCartChoiceModal({ open: false, guestCart: [], userCart: [], userId: null })}
        aria-labelledby="cart-choice-modal-title"
        aria-describedby="cart-choice-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            maxWidth: '90vw',
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
            maxHeight: '80vh',
            overflow: 'auto',
          }}
        >
          <Typography id="cart-choice-modal-title" variant="h5" component="h2" gutterBottom>
            Cart Options
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            You have items in your guest cart. How would you like to handle them?
          </Typography>

          {/* Guest Cart Summary */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Guest Cart:
            </Typography>
            <Typography variant="body2">
              {getCartSummary(cartChoiceModal.guestCart)}
            </Typography>
          </Box>

          {/* User Cart Summary */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.light', color: 'white', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              User Cart:
            </Typography>
            <Typography variant="body2">
              {getCartSummary(cartChoiceModal.userCart)}
            </Typography>
          </Box>

          {/* Choice Options */}
          <RadioGroup
            value={selectedChoice}
            onChange={handleChoiceChange}
            sx={{ mb: 3 }}
          >
            <FormControlLabel
              value="merge"
              control={<Radio />}
              label="Merge carts"
              sx={{ mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
              {getChoiceDescription('merge')}
            </Typography>

            <FormControlLabel
              value="replace"
              control={<Radio />}
              label="Replace user cart"
              sx={{ mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
              {getChoiceDescription('replace')}
            </Typography>

            <FormControlLabel
              value="separate"
              control={<Radio />}
              label="Keep separate"
              sx={{ mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
              {getChoiceDescription('separate')}
            </Typography>
          </RadioGroup>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              onClick={() => setCartChoiceModal({ open: false, guestCart: [], userCart: [], userId: null })}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button onClick={handleCartChoice} variant="contained">
              Confirm
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default SignInContainer;
