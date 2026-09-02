import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  useTheme,
  IconButton,
} from "@mui/material";
import {
  CustomStackFullWidth,
} from "styled-components/CustomStyles.style";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import OtpInput from "react-otp-input";

import LoadingButton from "@mui/lab/LoadingButton";

import * as Yup from "yup";
import { maskSensitiveInfo } from "utils/CustomFunctions";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";

const OtpForm = ({
  data,
  formSubmitHandler,
  isLoading,
  loginValue,
  reSendOtp,
  handleClose,     // ✅ ata ha "back" button sathi use hoil (mobile number screen var parat ja)
  externalError,   // ✅ SignIn se aane wala error
  clearExternalError, // ✅ user type kare toh clear karo
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { configData } = useSelector((state) => state.configData);

  const otpFormik = useFormik({
    initialValues: {
      reset_token: "",
      phone: data,
    },
    validationSchema: Yup.object({
      reset_token: Yup.string().required(t("field is empty")),
    }),
    onSubmit: async (values) => {
      try {
        formSubmitHandler(values);
      } catch (err) {}
    },
  });

  const [counter, setCounter] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  // ✅ Auto-submit jevha 6 digit pura bharla jaईl (OTP complete hotach)
  const hasAutoSubmitted = useRef(false);

  useEffect(() => {
    if (counter > 0) {
      const timer = setTimeout(() => setCounter(counter - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsResendDisabled(false);
    }
  }, [counter]);

  useEffect(() => {
    const otpValue = otpFormik.values.reset_token;
    if (
      otpValue &&
      otpValue.length === 6 &&
      !hasAutoSubmitted.current &&
      !isLoading
    ) {
      hasAutoSubmitted.current = true;
      otpFormik.handleSubmit();
    }
    // jar OTP incomplete zali (user ne delete keli) tar flag reset kara
    if (otpValue.length < 6) {
      hasAutoSubmitted.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpFormik.values.reset_token]);

  const handleResendClick = () => {
    if (!isResendDisabled) {
      reSendOtp(loginValue);
      setCounter(60);
      setIsResendDisabled(true);
      hasAutoSubmitted.current = false;
      otpFormik.setFieldValue("reset_token", "");
      if (clearExternalError) clearExternalError();
    }
  };

  // mm:ss format sathi
  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
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
      <CustomStackFullWidth
        position="relative"
        sx={{ background: "#ffffff" }}
      >
        {/* ✅ Header row: back arrow (left) + centered title, jasa Figma madhe ahe */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          position="relative"
          padding="20px 16px"
          sx={{ borderBottom: "1px solid #eeeeee" }}
        >
          <IconButton
            onClick={handleClose} // ✅ back arrow -> mobile number screen var parat
            sx={{
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <ArrowBackIcon sx={{ fontSize: "20px" }} />
          </IconButton>

          <Typography fontSize="16px" fontWeight="600" color="#000000">
            {t("OTP Verification")}
          </Typography>
        </Stack>

        {/* Logo */}
        {/* <Box sx={{ textAlign: "center", mt: 2, mb: 1 }}>
          <img
            src="/logo.png"
            alt="Dealplex"
            style={{
              maxWidth: "110px",
              height: "auto",
              display: "block",
              margin: "0 auto",
            }}
          />
        </Box> */}

        <CustomStackFullWidth
          gap="20px"
          alignItems="center"
          justifyContent="center"
          padding={{ xs: "2rem", md: "2.5rem" }}
        >
          <Stack gap="4px" alignItems="center">
            <Typography textAlign="center" fontSize="13px" color="#000000">
              {t("We have sent a Verification code to")}
            </Typography>
            <Typography
              textAlign="center"
              fontSize="14px"
              fontWeight="700"
              color="#000000"
            >
              {maskSensitiveInfo(loginValue?.phone || data)}
            </Typography>

            {configData?.demo && (
              <Typography
                mt="5px"
                textAlign="center"
                fontSize="12px"
                color="textSecondary"
              >
                {t("For demo purpose use otp 123456")}
              </Typography>
            )}
          </Stack>

          <Stack width="100%">
            <form onSubmit={otpFormik.handleSubmit}>
              <Stack
                alignItems="center"
                justifyContent="center"
                gap="10px"
                width="100%"
              >
                <Box
                  sx={{
                    div: {
                      gap: {
                        xs: "10px",
                        sm: "14px",
                        md: "16px",
                      },
                    },
                    input: {
                      flexGrow: "1",
                      background: externalError ? "#fdf2f2" : "#f3fbf6",
                      color: externalError
                        ? "#ef4444"
                        : theme.palette.primary.main,
                      fontSize: "18px",
                      fontWeight: "600",
                      outline: "none",
                      height: {
                        xs: "44px",
                        sm: "48px",
                        md: "52px",
                      },
                      width: {
                        xs: "44px !important",
                        sm: "48px !important",
                        md: "52px !important",
                      },
                      borderRadius: "14px !important",
                      WebkitBorderRadius: "14px !important",
                      MozBorderRadius: "14px !important",
                      border: externalError
                        ? "1.6px solid #ef4444"
                        : "1.6px solid " + theme.palette.primary.main,
                    },
                  }}
                >
                  <OtpInput
                    value={otpFormik.values.reset_token}
                    onChange={(otp) => {
                      otpFormik.setFieldValue("reset_token", otp);
                      // ✅ User type kare toh external error clear karo
                      if (clearExternalError) clearExternalError();
                    }}
                    numInputs={6}
                    onBlur={otpFormik.handleBlur("reset_token")}
                    renderInput={(props) => <input {...props} />}
                    error={
                      otpFormik.touched.reset_token &&
                      Boolean(otpFormik.errors.reset_token)
                    }
                  />
                </Box>

                {/* ✅ Niche status text: error / resend countdown / resend link */}
                {externalError ? (
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "#ef4444",
                      textAlign: "center",
                    }}
                  >
                    {t("Code invalid")}
                  </Typography>
                ) : isResendDisabled ? (
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: theme.palette.neutral?.[500] || "#757575",
                      textAlign: "center",
                    }}
                  >
                    {t("Code will resend in")} {formatTime(counter)}
                  </Typography>
                ) : (
                  <Typography
                    onClick={handleResendClick}
                    sx={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: theme.palette.primary.main,
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                  >
                    {t("Resend Code")}
                  </Typography>
                )}

                {/* ✅ Verify button lapवला; Loading state dakhvaychi asel tar fakt spinner/text dakhva, button nahi */}
                {isLoading && (
                  <LoadingButton
                    loading
                    sx={{ mt: 1 }}
                  />
                )}
              </Stack>
            </form>
          </Stack>
        </CustomStackFullWidth>
      </CustomStackFullWidth>
    </>
  );
};

export default OtpForm;
