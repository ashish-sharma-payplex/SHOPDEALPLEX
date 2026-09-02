import React, { useEffect, useRef, useState } from "react";
import {
  CustomStackFullWidth,
} from "../../../styled-components/CustomStyles.style";
import CloseIcon from "@mui/icons-material/Close";
import CustomTextFieldWithFormik from "../../form-fields/CustomTextFieldWithFormik";
import { t } from "i18next";
import AuthHeader from "../AuthHeader";
import { getLanguage } from "../../../helper-functions/getLanguage";
import SinUp from "../asset/signinimg.png";
import LockIcon from "@mui/icons-material/Lock";
import {
  InputAdornment,
  useTheme,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  IconButton,
  Dialog,
  DialogContent,
} from "@mui/material";
import CustomPhoneInputManual from "components/custom-component/CustomPhoneInputManual";
import toast, { Toaster } from "react-hot-toast";
import { CustomTypography } from "components/landing-page/hero-section/HeroSection.style";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  loadRememberMePreference,
  saveRememberMePreference,
  saveUserDetails,
  loadUserDetails,
  clearUserDetails,
} from "utils/cartPersistence";
import PhoneOrEmailIcon from "components/auth/asset/PhoneOrEmailIcon";
import SocialLogins from "components/auth/sign-in/social-login/SocialLogins";
import { Stack } from "@mui/system";
import { useMediaQuery } from "@mui/material";
import AcceptTermsAndConditions from "../AcceptTermsAndConditions";
import ForgotPassword from "components/auth/ForgotPassword/ForgotPassword";

const SignInFrm = (props) => {
  const {
    loginFormik,
    configData,
    handleOnChange,
    passwordHandler,
    rememberMeHandleChange,
    isApiCalling,
    isLoading,
    handleSignUp,
    handleClose,
    handleClick,
    selectedOtp,
    otpLoginFormik,
    otpHandleChange,
    setJwtToken,
    setUserInfo,
    handleSuccess,
    setModalFor,
    setMedium,
    loginMutation,
    setLoginInfo,
    only = false,
  } = props;

  const phoneRef = useRef(null);
  const lanDirection = getLanguage() ? getLanguage() : "ltr";
  const theme = useTheme();
  const textColor = theme.palette.whiteContainer.main;
  const [isPhone, setIsPhone] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [tandc, setTandc] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [emailOrPhoneError, setEmailOrPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isLaptop = useMediaQuery(theme.breakpoints.up("sm"));

  useEffect(() => {
    const value = loginFormik.values.email_or_phone.trim();
    const onlyDigits = /^\d+$/.test(value);

    if (value === "") {
      setIsPhone(false);
      return;
    }

    if (onlyDigits) {
      if (!isPhone) {
        // Pehli baar phone mode switch — focus phoneRef pe karo
        setIsPhone(true);
        setTimeout(() => {
          if (phoneRef.current) {
            phoneRef.current.focus();
            const len = phoneRef.current.value?.length || 0;
            phoneRef.current.setSelectionRange(len, len);
          }
        }, 20);
      }
    } else {
      setIsPhone(false);
    }
  }, [loginFormik.values.email_or_phone]);

  const validateEmailOrPhone = (value) => {
    const trimmed = value?.trim() || "";
    if (!trimmed) return t("This field is required.");
    if (isPhone) {
      const digits = trimmed.replace(/\D/g, "").replace(/^91/, "");
      if (digits.length < 10) return t("Invalid phone number");
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
        return t("Invalid email address");
    }
    return "";
  };

  const validatePassword = (value) => {
    if (!value || value.trim() === "") return t("Password is required.");
    return "";
  };

  const handlePhoneBlur = () => {
    const digits = loginFormik.values.email_or_phone
      .replace(/\D/g, "")
      .replace(/^91/, "");
    if (digits.length < 10) {
      setTimeout(() => {
        if (phoneRef.current) phoneRef.current.focus();
      }, 10);
    } else {
      setEmailOrPhoneError(validateEmailOrPhone(loginFormik.values.email_or_phone));
    }
  };

  const handleEmailBlur = () => {
    setEmailOrPhoneError(validateEmailOrPhone(loginFormik.values.email_or_phone));
  };

  const handlePasswordBlur = () => {
    setPasswordError(validatePassword(loginFormik.values.password));
  };

  const handleEmailOrPhoneChange = (e) => {
    setEmailOrPhoneError("");
    if (handleOnChange) handleOnChange(e);
  };

  const handlePasswordChange = (e) => {
    setPasswordError("");
    if (passwordHandler) passwordHandler(e);
  };

  useEffect(() => {
    const savedRememberMe = loadRememberMePreference();
    setRememberMe(savedRememberMe);
    if (savedRememberMe) {
      const userDetails = loadUserDetails();
      if (userDetails) {
        loginFormik.setFieldValue("email_or_phone", userDetails.emailOrPhone);
        loginFormik.setFieldValue("password", userDetails.password);
      }
    }
  }, []);

  const handleRememberMeChange = (event) => {
    const isChecked = event.target.checked;
    setRememberMe(isChecked);
    saveRememberMePreference(isChecked);
    if (!isChecked) clearUserDetails();
    if (rememberMeHandleChange) rememberMeHandleChange(event);
  };

  const handleFormSubmit = (values) => {
    const epError = validateEmailOrPhone(values.email_or_phone);
    const passError = validatePassword(values.password);
    setEmailOrPhoneError(epError);
    setPasswordError(passError);
    if (epError || passError) return;
    loginFormik.handleSubmit();
    if (rememberMe) saveUserDetails(values.email_or_phone, values.password);
  };

  if (!isOpen) return null;

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: { boxShadow: "none", WebkitBoxShadow: "none", MozBoxShadow: "none" },
        }}
      />
      <Box
        sx={{
          width: "100%",
          height: "88vh",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "center",
          alignItems: "center",
          padding: isMobile ? "10px" : "15px",
          boxSizing: "border-box",
          overflow: "hidden",
          backgroundColor: "#ffffff",
        }}
      >
        <Dialog
          open={forgotPasswordOpen}
          onClose={() => setForgotPasswordOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: { borderRadius: "16px", overflow: "hidden", maxWidth: "360px", width: "100%", mx: "auto" },
          }}
        >
          <DialogContent sx={{ position: "relative", p: "20px" }}>
            <IconButton
              onClick={() => setForgotPasswordOpen(false)}
              sx={{
                position: "absolute", top: 8, right: 8, zIndex: 10,
                backgroundColor: "#f5f5f5", width: 28, height: 28,
                "&:hover": { backgroundColor: "#e0e0e0" },
              }}
            >
              <CloseIcon sx={{ fontSize: "16px" }} />
            </IconButton>
            <ForgotPassword configData={configData} />
          </DialogContent>
        </Dialog>

        <Box
          sx={{
            flexShrink: 0, flexGrow: 0,
            width: isLaptop ? "50%" : "100%",
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "0px", boxSizing: "border-box",
          }}
        >
          <AuthHeader configData={configData} />

          <Typography
            sx={{
              fontSize: { sm: "0.7rem", md: "1rem" },
              fontWeight: 400, fontFamily: "Montserrat",
              textAlign: "center", pb: 2, color: "#000000",
            }}
          >
            WELCOME BACK
          </Typography>

          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              handleFormSubmit(loginFormik.values);
            }}
          >
            <CustomStackFullWidth sx={{ padding: "0px" }}>
              <CustomStackFullWidth spacing={0}>

                {/* ============================================================
                    EMAIL / PHONE — DONO HAMESHA MOUNTED RAHENGE
                    Sirf display:block / display:none toggle hoga
                    Isse unmount nahi hoga = browser blur chain nahi tutega
                    = pehli digit type karte waqt focus nahi urega
                    ============================================================ */}
                <Box sx={{ minHeight: "60px" }}>

                  {/* EMAIL FIELD — phone mode mein chhupa do */}
                  <Box sx={{ display: isPhone ? "none" : "block" }}>
                    <CustomTextFieldWithFormik
                      required
                      label={t("Email/Phone")}
                      placeholder={t("Email/Phone")}
                      fieldProps={loginFormik.getFieldProps("email_or_phone")}
                      onChangeHandler={handleEmailOrPhoneChange}
                      onBlur={handleEmailBlur}
                      value={loginFormik.values.email_or_phone}
                      startIcon={
                        <InputAdornment position="start">
                          <PhoneOrEmailIcon />
                        </InputAdornment>
                      }
                    />
                  </Box>

                  {/* PHONE FIELD — email mode mein chhupa do, phoneRef hamesha connected */}
                  <Box sx={{ display: isPhone ? "block" : "none" }}>
                    <CustomPhoneInputManual
                      phoneRef={phoneRef}
                      onBlur={handlePhoneBlur}
                      value={loginFormik.values.email_or_phone}
                      onHandleChange={handleEmailOrPhoneChange}
                      initCountry={configData?.country}
                      lanDirection={lanDirection}
                      height="56px"
                      borderRadius="10px"
                    />
                  </Box>

                  {emailOrPhoneError && (
                    <Typography sx={{ color: "red", fontSize: "12px", mt: "4px" }}>
                      {emailOrPhoneError}
                    </Typography>
                  )}
                </Box>

                {/* PASSWORD FIELD */}
                <Box sx={{ minHeight: "80px", mt: "2px" }}>
                  <CustomTextFieldWithFormik
                    type="password"
                    label={t("Password")}
                    placeholder={t("Enter password")}
                    fieldProps={loginFormik.getFieldProps("password")}
                    onChangeHandler={handlePasswordChange}
                    onBlur={handlePasswordBlur}
                    value={loginFormik.values.password}
                    startIcon={
                      <InputAdornment position="start">
                        <LockIcon />
                      </InputAdornment>
                    }
                  />
                  {passwordError && (
                    <Typography sx={{ color: "red", fontSize: "12px", mt: "4px" }}>
                      {passwordError}
                    </Typography>
                  )}
                </Box>
              </CustomStackFullWidth>

              <CustomStackFullWidth mt="1px" spacing={1}>
                <CustomStackFullWidth justifyContent="space-between" alignItems="center" direction="row">
                  <FormControlLabel
                    control={<Checkbox checked={rememberMe} onChange={handleRememberMeChange} />}
                    label={
                      <CustomTypography fontSize="13px" sx={{ color: "#000000" }}>
                        {t("Remember me")}
                      </CustomTypography>
                    }
                  />
                  <Typography
                    onClick={() => setForgotPasswordOpen(true)}
                    sx={{
                      fontWeight: "400", fontSize: "14px",
                      color: theme.palette.primary.main,
                      cursor: "pointer", textDecoration: "underline",
                    }}
                  >
                    {t("Forgot password?")}
                  </Typography>
                </CustomStackFullWidth>

                <Box sx={{ ml: "-10px !important", mt: "-6px" }}>
                  <AcceptTermsAndConditions
                    handleCheckbox={(e) => setTandc(e.target.checked)}
                    handleClick={handleClick}
                    formikType={{ values: { tandc }, touched: {}, errors: {} }}
                  />
                </Box>

                <LoadingButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  loading={isLoading}
                  disabled={!tandc}
                  sx={{ backgroundColor: "#1A914B", color: textColor }}
                >
                  {t("Sign In")}
                </LoadingButton>
              </CustomStackFullWidth>

              <CustomStackFullWidth spacing={1} mt={1}>
                <Stack alignItems="center">
                  <Typography textAlign="center" fontSize="14px" color={theme.palette.neutral[400]}>
                    {t("Or")}
                  </Typography>
                  <Typography
                    component="span" textAlign="center" fontSize="12px" fontWeight="400"
                    color={theme.palette.neutral[400]}
                    sx={{ cursor: "pointer" }}
                    onClick={() => { if (selectedOtp) selectedOtp(); }}
                  >
                    {t("Sign in with")}
                    <Typography
                      component="span"
                      color={theme.palette.primary.main}
                      sx={{ textDecoration: "underline", ml: "5px", fontSize: "13px" }}
                    >
                      {t("OTP")}
                    </Typography>
                  </Typography>
                </Stack>

                {configData?.social_login && configData?.social_login.length > 0 && (
                  <Box>
                    <Typography fontSize="13px" textAlign="center" color={theme.palette.neutral[400]}>
                      {t("or")}
                    </Typography>
                    <SocialLogins
                      socialLogin={configData?.social_login}
                      configData={configData}
                      setJwtToken={setJwtToken}
                      setUserInfo={setUserInfo}
                      handleSuccess={handleSuccess}
                      setModalFor={setModalFor}
                      setMedium={setMedium}
                      loginMutation={loginMutation}
                      setLoginInfo={setLoginInfo}
                    />
                  </Box>
                )}

                <CustomStackFullWidth alignItems="center">
                  <Typography fontSize="12px" color={theme.palette.neutral[400]}>
                    {t("Don't have an account?")}{" "}
                    <span
                      onClick={() => { if (handleSignUp) handleSignUp(); }}
                      style={{
                        color: theme.palette.primary.main,
                        textDecoration: "underline",
                        cursor: "pointer",
                        fontSize: "13px",
                      }}
                    >
                      {t("Sign Up")}
                    </span>
                  </Typography>
                </CustomStackFullWidth>
              </CustomStackFullWidth>
            </CustomStackFullWidth>
          </form>
        </Box>

        <Box
          sx={{
            width: "50%",
            display: isMobile ? "none" : "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "60px !important",
          }}
        >
          <Box
            component="img"
            src={SinUp.src}
            alt="Sign in"
            sx={{ width: "100%", maxHeight: "80vh", objectFit: "contain" }}
          />
        </Box>
      </Box>
    </>
  );
};

export default SignInFrm;