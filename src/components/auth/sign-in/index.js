import { IconButton, NoSsr, styled, Typography, useTheme } from "@mui/material";
import { Box, Stack } from "@mui/system";
import React, { useEffect, useReducer, useState } from "react";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";

import { t } from "i18next";
import { CustomTypography } from "../../landing-page/hero-section/HeroSection.style";
import SignInFrm from "./SignInFrm";
import {
  onErrorResponse,
  onSingleErrorResponse,
} from "api-manage/api-error-response/ErrorResponses";

import { useFireBaseOtpVerify } from "api-manage/hooks/react-query/forgot-password/useFIreBaseOtpVerify";
import { useVerifyPhone } from "api-manage/hooks/react-query/forgot-password/useVerifyPhone";
import { useWishListGet } from "api-manage/hooks/react-query/wish-list/useWishListGet";

import { useFormik } from "formik";
import { getGuestId } from "helper-functions/getToken";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setCartList } from "redux/slices/cart";
import { setUser } from "redux/slices/profileInfo";
import { setWishList } from "redux/slices/wishList";
import {
  checkInput,
  formatPhoneNumber,
  handleProductValueWithOutDiscount,
} from "utils/CustomFunctions";
import {
  loginSuccessFull,
  moduleSelected,
  SigninSuccessFull,
} from "utils/toasterMessages";
import useGetAllCartList from "../../../api-manage/hooks/react-query/add-cart/useGetAllCartList";
import useGetProfile from "../../../api-manage/hooks/react-query/profile/useGetProfile";
import { getSelectedVariations } from "../../header/second-navbar/SecondNavbar";
import { ModuleSelection } from "../../landing-page/hero-section/module-selection";
import CustomModal from "../../modal";
import AuthHeader from "../AuthHeader";
import OtpForm from "../sign-up/OtpForm";
import SocialLogins from "./social-login/SocialLogins";
import {
  ACTIONS,
  loginInitialState,
  loginReducer,
} from "components/auth/state";
import {
  getActiveLoginStatus,
  getLoginUserCheck,
} from "components/auth/sign-in/loginHepler";
import OtpLogin from "components/auth/sign-in/OtpLogin";
import SignInValidation from "./SignInValidation";
import * as Yup from "yup";

import CloseIcon from "@mui/icons-material/Close";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { getCurrentModuleType } from "helper-functions/getCurrentModuleType";
import useGetBookingList from "api-manage/hooks/react-query/useGetBookingList";
import { useGetWishList } from "api-manage/hooks/react-query/rental-wishlist/useGetWishlist";
import { setAuthToken } from "redux/slices/authSlice";

const SignIn = ({
  modalFor,
  configData,
  setModalFor,
  setLoginInfo,
  setJwtToken,
  setUserInfo,
  handleSuccess,
  setMedium,
  zoneid,
  loginMutation,
  loginIsLoading,
  verificationId,
  sendOTP,
  handleClose,
}) => {
  const router = useRouter();
  const previousRouteName = router.query.from;
  const guestId = getGuestId();
  const dispatch = useDispatch();
  const [openModuleSelection, setOpenModuleSelection] = useState(false);
  const [openOtpModal, setOpenOtpModal] = useState(false);
  const [loginValue, setLoginValue] = useState(null);
  const [otpData, setOtpData] = useState({ type: "" });
  const [mainToken, setMainToken] = useState(null);
  const [isApiCalling, setIsApiCalling] = useState(false);
  const [isRemember, setIsRemember] = useState(false);
  const [otpErrorMsg, setOtpErrorMsg] = useState(""); // ✅ OTP error state
  const theme = useTheme();

  const [state, loginDispatch] = useReducer(loginReducer, loginInitialState);
  let userDatafor = undefined;
  const moduleType = getCurrentModuleType();
  if (typeof window !== "undefined") {
    userDatafor = JSON.parse(localStorage.getItem("userDatafor"));
  }

  const loginFormik = useFormik({
    initialValues: {
      email_or_phone: userDatafor?.email_or_phone || "",
      password: userDatafor ? userDatafor.password : "",
      tandc: false,
    },
    validationSchema: SignInValidation(),
    onSubmit: async (values, helpers) => {
      try {
        if (isRemember) {
          localStorage.setItem("userDatafor", JSON.stringify(values));
        }
        formSubmitHandler({ ...values, login_type: "manual" });
      } catch (err) {}
    },
  });

  const cartListSuccessHandler = (res) => {
    if (res) {
      const tempCartLists = res?.map((item) => ({
        ...item?.item,
        cartItemId: item?.id,
        totalPrice:
          handleProductValueWithOutDiscount(item?.item) * item?.quantity,
        selectedAddons: item?.item?.addons,
        quantity: item?.quantity,
        food_variations: item?.item?.food_variations,
        itemBasePrice: item?.item?.price,
      }));
      dispatch(setCartList(tempCartLists));
    }
  };

  const {
    data,
    refetch: cartListRefetch,
    isLoading,
  } = useGetAllCartList(cartListSuccessHandler);

  const bookingSuccess = (res) => {
    dispatch(setCartList(res));
  };
  const {
    data: bookingLists,
    isLoading: bookingListsIsLoading,
    refetch: bookingRefetch,
  } = useGetBookingList(getGuestId(), bookingSuccess);

  const userOnSuccessHandler = (res) => {
    dispatch(setUser(res));
  };

  let location = undefined;
  let isModuleSelected = undefined;
  let lanDirection = undefined;
  let languageSetting;
  if (typeof window !== "undefined") {
    location = localStorage.getItem("location");
    isModuleSelected = JSON.parse(localStorage.getItem("module"));
    lanDirection = JSON.parse(localStorage.getItem("settings"));
    languageSetting = JSON.parse(localStorage.getItem("language-setting"));
  }

  const handleOnChange = (value) => {
    loginFormik.setFieldValue("email_or_phone", value);
  };
  const passwordHandler = (value) => {
    loginFormik.setFieldValue("password", value);
  };

  useEffect(() => {
    if (otpData?.type !== "") {
      setOpenOtpModal(true);
    }
  }, [otpData]);

  const onSuccessHandler = (response) => {
    dispatch(setWishList(response));
    setIsApiCalling(false);
  };

  const { refetch: profileRefetch } = useGetProfile(userOnSuccessHandler);
  const { refetch: wishlistRefetch } = useWishListGet(onSuccessHandler);
  const { refetch: rentalWishlistRefetch } = useGetWishList(onSuccessHandler);

  const handleTokenAfterSignIn = async (response) => {
    if (response) {
      localStorage.setItem("token", response?.token);
      dispatch(setAuthToken(response?.token));

      if (moduleType === "rental") {
        await bookingRefetch();
        await rentalWishlistRefetch();
      } else {
        await cartListRefetch();
        await wishlistRefetch();
      }

      await profileRefetch();
      toast.success(t(loginSuccessFull));
      handleClose();
    }
  };

  const handleCloseModuleModal = (item) => {
    if (item) {
      toast.success(t(moduleSelected));
      if (previousRouteName) {
        router.push("/home");
      } else {
        router.back();
      }
    }
    setOpenModuleSelection(false);
  };

  const formSubmitHandler = (values) => {
    const numberOrEmail = checkInput(values?.email_or_phone);
    let newValues = {};

    if (values?.login_type === "otp") {
      if (values?.type === "email") {
        newValues = {
          phone: values.email,
          login_type: "otp",
          type: "email",
          guest_id: guestId,
        };
      } else {
        newValues = {
          ...values,
          type: "phone",
          guest_id: guestId,
        };
      }
    } else {
      newValues = {
        ...values,
        guest_id: guestId,
        field_type: numberOrEmail,
        type: numberOrEmail,
      };
    }

    setLoginValue(newValues);
    loginMutation(newValues, {
      onSuccess: async (response) => {
        if (response?.is_personal_info === 0) {
          handleLoginInfo(response, {
            phone: newValues.email_or_phone,
          });
        } else {
          getLoginUserCheck(
            response,
            newValues,
            handleTokenAfterSignIn,
            setOtpData,
            setMainToken,
            sendOTP,
            configData,
          );
        }
      },
      onError: (error) => {
        if (
          error?.response?.status === 401 ||
          error?.response?.status === 422
        ) {
          toast.error(t("Incorrect password or email"));
        } else {
          onErrorResponse(error);
        }
      },
    });
  };

  const { mutate: otpVerifyMutate, isLoading: isLoadingOtpVerifyApi } =
    useVerifyPhone();
  const { mutate: fireBaseOtpMutation, isLoading: fireIsLoading } =
    useFireBaseOtpVerify();

  const handleLoginInfo = (res, values) => {
    const phoneValue =
      values?.phone || loginValue?.phone || loginValue?.email_or_phone;

    // console.log("=== handleLoginInfo called ===");
    // console.log("res:", res);
    // console.log("values:", values);
    // console.log("loginValue:", loginValue);

    setLoginInfo({
      ...res,
      phone: phoneValue,
      email: values?.email || loginValue?.email,
      login_type: res?.login_type || "otp",
      is_email: loginValue?.type === "email",
    });

    if (res?.is_personal_info === 0) {
      setModalFor("user_info");
    } else if (res?.is_exist_user !== null) {
      setModalFor("is_exist_user");
    } else {
      setOpenOtpModal(false);
      handleClose();
      handleTokenAfterSignIn(res).then();
    }
  };

  const otpFormSubmitHandler = (values) => {
    if (configData?.firebase_otp_verification === 1) {
      const temValue = {
        session_info: verificationId,
        phone: values.phone,
        otp: values.reset_token,
        login_type: "otp",
        guest_id: getGuestId(),
      };
      fireBaseOtpMutation(temValue, {
        onSuccess: (res) => {
          if (res) {
            handleLoginInfo(res, values);
          }
        },
        onError: (error) => {
          // ✅ Firebase OTP error — field ke niche dikhao
          const msg = error?.response?.data?.message || "OTP does not match";
          setOtpErrorMsg(msg);
        },
      });
    } else {
      let tempValues;

      if (loginValue?.type === "email") {
        tempValues = {
          email: loginValue?.phone,
          otp: values.reset_token,
          login_type: "otp",
          verification_type: "email",
          guest_id: getGuestId(),
        };
      } else {
        tempValues = {
          phone: values.phone,
          otp: values.reset_token,
          login_type: otpData?.login_type,
          verification_type: otpData?.verification_type,
          guest_id: getGuestId(),
        };
      }

      const onSuccessHandler = (res) => {
        if (res) {
          handleLoginInfo(res, values);
        }
      };

      otpVerifyMutate(tempValues, {
        onSuccess: onSuccessHandler,
        onError: (error) => {
          // ✅ OTP error — field ke niche dikhao, toast nahi
          const msg = error?.response?.data?.message || "OTP does not match";
          setOtpErrorMsg(msg);
        },
      });
    }
  };

  const rememberMeHandleChange = (e) => {
    if (e.target.checked) {
      setIsRemember(true);
    } else {
      localStorage.removeItem("userDatafor");
    }
  };

  useEffect(() => {
    const { centralize_login } = configData || {};

    if (centralize_login) {
      const { otp_login_status, manual_login_status, social_login_status } =
        centralize_login;

      loginDispatch({
        type: ACTIONS.setActiveLoginType,
        payload: {
          otp: otp_login_status === 1,
          manual: manual_login_status === 1,
          social: social_login_status === 1,
        },
      });
    }
  }, []);

  useEffect(() => {
    getActiveLoginStatus(state, loginDispatch);
  }, [state.activeLoginType]);

  const otpLoginFormik = useFormik({
    initialValues: {
      phone: "",
    },
    validationSchema: Yup.object({
      phone: Yup.string()
        .required(t("Please give a phone number"))
        .matches(/^\+91[6-9]\d{9}$/, t("Please enter a valid mobile number")),
    }),
    onSubmit: async (values, helpers) => {
      try {
        formSubmitHandler({ ...values, login_type: "otp", type: "phone" });
      } catch (err) {}
    },
  });

  const otpHandleChange = (value) => {
    otpLoginFormik.setFieldValue("phone", value);
  };

  const handleClick = () => {
    window.open("/terms-and-conditions");
  };

  const selectedOtp = () => {
    loginDispatch({
      type: ACTIONS.setActiveLoginType,
      payload: {
        otp: true,
        manual: false,
        social: false,
      },
    });
  };

  // ✅ OTP form ka back arrow click - ab ye form ko close karega
  // (back navigation ka matlab yahan close hi hai, kisi doosre login type pe switch nahi)
  const handleBackFromOtp = () => {
    handleClose();
  };

  const handleSignUp = () => {
    setModalFor("sign-up");
  };

  useEffect(() => {
    if (modalFor === "sign-up") {
      handleClose();
    }
  }, [modalFor]);

  const signInFrmCommonProps = {
    loginFormik,
    configData,
    handleOnChange,
    passwordHandler,
    rememberMeHandleChange,
    isLoading: loginIsLoading,
    handleClick,
    handleSignUp,
    selectedOtp,
  };

  const handleFormBasedOnDirection = () => {
    switch (state.status) {
      case "otp":
        return (
          <OtpLogin
            otpHandleChange={otpHandleChange}
            otpLoginFormik={otpLoginFormik}
            configData={configData}
            isLoading={loginIsLoading}
            handleClick={handleClick}
            rememberMeHandleChange={rememberMeHandleChange}
            handleClose={handleClose}
            onSubmit={(payload) => formSubmitHandler(payload)}
          />
        );
      case "manual":
        return (
          <Stack width="100%">
            <SignInFrm
              {...signInFrmCommonProps}
              isApiCalling={isApiCalling}
              isLoading={loginIsLoading}
              only
              handleClick={handleClick}
            />
          </Stack>
        );
      case "social":
        return null;
      case "otp_manual":
        return (
          <Stack width="100%">
            <SignInFrm
              {...signInFrmCommonProps}
              isApiCalling={isApiCalling}
              isLoading={loginIsLoading}
              handleClick={handleClick}
            />
          </Stack>
        );
      case "otp_social":
        return null;
      case "manual_social":
        return (
          <CustomStackFullWidth gap="1rem" border={"1px solid #ff0202"}>
            <SignInFrm
              {...signInFrmCommonProps}
              isApiCalling={isApiCalling}
              isLoading={loginIsLoading}
              handleClick={handleClick}
            />
          </CustomStackFullWidth>
        );
      case "all":
        return (
          <CustomStackFullWidth gap="0.5rem" border={"1px solid #021cff"}>
            <SignInFrm
              {...signInFrmCommonProps}
              isApiCalling={isApiCalling}
              isLoading={loginIsLoading}
              handleClick={handleClick}
            />
          </CustomStackFullWidth>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            boxShadow: "none",
            WebkitBoxShadow: "none",
            MozBoxShadow: "none",
          },
        }}
      />
      <NoSsr>
        <CustomStackFullWidth justifyContent="center" alignItems="center">
          <Box
            sx={{
              Width: "1300px",
              padding: { xs: "0px", md: "0px" },
              position: "relative",
            }}
            width="100%"
          >
            {state.status === "otp" ? (
              // ✅ OTP form ke liye close icon ki jagah back arrow (top-left, same line)
              // click karne pe ab pura form close ho jayega (handleBackFromOtp -> handleClose)
              <IconButton
                onClick={handleBackFromOtp}
                sx={{
                  zIndex: "99",
                  position: "absolute",
                  top: 6,
                  left: 6,
                  backgroundColor: (theme) => theme.palette.neutral[100],
                  borderRadius: "50%",
                  [theme.breakpoints.down("sm")]: {
                    top: 0,
                    left: 0,
                  },
                }}
              >
                <KeyboardBackspaceIcon
                  sx={{
                    fontSize: {
                      xs: "16px",
                      sm: "18px",
                      md: "20px",
                    },
                    fontWeight: "500",
                  }}
                />
              </IconButton>
            ) : (
              /* Close Icon - only for non-OTP forms; OTP form uses back arrow above instead
              <IconButton
                onClick={handleClose}
                sx={{
                  zIndex: "99",
                  position: "absolute",
                  top: 6,
                  right: 6,
                  backgroundColor: (theme) => theme.palette.neutral[100],
                  borderRadius: "50%",
                  [theme.breakpoints.down("sm")]: {
                    top: -0,
                    right: -0,
                  },
                }}
              >
                <CloseIcon
                  sx={{
                    fontSize: {
                      xs: "16px",
                      sm: "18px",
                      md: "20px",
                    },
                    fontWeight: "500",
                  }}
                />
              </IconButton>
              */
              <IconButton
                onClick={handleClose}
                sx={{
                  zIndex: "99",
                  position: "absolute",
                  top: 6,
                  right: 6,
                  backgroundColor: (theme) => theme.palette.neutral[100],
                  borderRadius: "50%",
                  [theme.breakpoints.down("sm")]: {
                    top: -0,
                    right: -0,
                  },
                }}
              >
                <CloseIcon
                  sx={{
                    fontSize: {
                      xs: "16px",
                      sm: "18px",
                      md: "20px",
                    },
                    fontWeight: "500",
                  }}
                />
              </IconButton>
            )}
            <CustomStackFullWidth spacing={2}>
              {handleFormBasedOnDirection()}
            </CustomStackFullWidth>
          </Box>
        </CustomStackFullWidth>
      </NoSsr>
      {openModuleSelection && (
        <ModuleSelection
          location={location}
          closeModal={handleCloseModuleModal}
          disableAutoFocus
        />
      )}
      <CustomModal
        handleClose={() => {
          setOpenOtpModal(false);
          setOtpErrorMsg(""); // ✅ modal band hone par error clear karo
        }}
        openModal={openOtpModal}
      >
        <OtpForm
          data={otpData?.type ? otpData?.type : loginFormik?.values?.phone}
          formSubmitHandler={otpFormSubmitHandler}
          isLoading={isLoadingOtpVerifyApi || fireIsLoading}
          recaptcha="recaptcha-container"
          loginValue={loginValue}
          reSendOtp={formSubmitHandler}
          handleClose={() => {
            setOpenOtpModal(false);
            setOtpErrorMsg(""); // ✅ modal band hone par error clear karo
          }}
          externalError={otpErrorMsg} // ✅ error pass karo
          clearExternalError={() => setOtpErrorMsg("")} // ✅ clear function pass karo
        />
      </CustomModal>
    </>
  );
};

export default SignIn;
