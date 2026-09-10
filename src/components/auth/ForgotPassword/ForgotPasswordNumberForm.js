import React, { useState } from "react";
import { Box, Stack, Typography, TextField } from "@mui/material";
import { useFormik } from "formik";
import { CustomStackFullWidth } from "../../../styled-components/CustomStyles.style";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import LoadingButton from "@mui/lab/LoadingButton";
import * as Yup from "yup";
import toast from "react-hot-toast";

import { useForgotPassword } from "api-manage/hooks/react-query/forgot-password/useForgotPassword";
import {
  onErrorResponse,
  onSingleErrorResponse,
} from "api-manage/api-error-response/ErrorResponses";
import { forgot_password_header } from "utils/staticTexts";
import { getLanguage } from "helper-functions/getLanguage";

const ForgotPasswordNumberForm = ({
  data,
  goNext,
  handleFirstForm,
  id,
  sendOTP,
}) => {
  const { t } = useTranslation();
  const { configData } = useSelector((state) => state.configData);

  const phoneFormik = useFormik({
    initialValues: {
      phone: data ? data.phone : "",
    },
    validationSchema: Yup.object({
      phone: Yup.string()
        .required(t("Please give a phone number"))
        .min(10, "number must be 10 digits"),
    }),
    onSubmit: async (values, helpers) => {
      try {
        formSubmitHandler(values);
      } catch (err) { }
    },
  });

  const onSuccessHandler = (res) => {
    if (res) {
      if (res?.errors?.length > 0) {
        goNext();
        toast.error(res?.errors[0].message);
      } else {
        goNext();
        toast.success(res.message);
      }

      // goNext();
      //toast.success(res.message);
    }
  };

  const { mutate, isLoading } = useForgotPassword({
    onSuccessHandler,
    onError: (errors) => {
      onErrorResponse(errors);
    },
  });

  const formSubmitHandler = (values) => {
    handleFirstForm(values);
    if (configData?.firebase_otp_verification === 1) {
      sendOTP(values?.phone);
    } else {
      mutate(values, { onSuccess: onSuccessHandler, onError: onErrorResponse });
    }
  };

  const lanDirection = getLanguage() ? getLanguage() : "ltr";

  /* ============================================================
     ✅ NAYA PHONE TEXTFIELD — OtpLogin.js wale exact pattern se
     ("+91" box + plain TextField digits-only), react-phone-input-2
     wala CustomPhoneInput yahan se hata diya kyunki uska box
     invisible dikh raha tha. Ab yeh field bhi OtpLogin ki tarah
     border/focus/error state ke sath properly visible hai.
     ============================================================ */
  const initialDigits = (data?.phone || "")
    .replace(/\D/g, "")
    .replace(/^91/, "")
    .slice(-10);
  const [digits, setDigits] = useState(initialDigits);

  const handleDigitsChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setDigits(val);
    phoneFormik.setFieldTouched("phone", true, false);
  };

  const getPhoneError = () => {
    if (!phoneFormik.touched.phone) return null;
    if (digits.length === 0) return t("Please give a phone number");
    if (digits.length > 0 && digits.length < 10) return `${digits.length}/10 digits`;
    return null;
  };

  const isPhoneComplete = digits.length === 10;

  const handlePhoneFormSubmit = (e) => {
    e.preventDefault();
    phoneFormik.setFieldTouched("phone", true);

    if (!isPhoneComplete) return;

    const phoneValue = `+91${digits}`;
    phoneFormik.setFieldValue("phone", phoneValue);
    formSubmitHandler({ phone: phoneValue });
  };

  return (
    <CustomStackFullWidth>
      <Stack>
        <Typography>{t(forgot_password_header)}</Typography>
      </Stack>
      <form noValidate onSubmit={handlePhoneFormSubmit}>
        <CustomStackFullWidth mt="2rem">
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                border: "1px solid var(--border-default)",
                borderRadius: "10px",
                overflow: "hidden",
                bgcolor: "var(--bg-subtle)",
                height: "56px",
                transition: "border-color 0.2s, background-color 0.2s",
                "&:focus-within": {
                  borderColor: "var(--brand-green)",
                  // bgcolor: "var(--bg-card)",
                },
                ...(getPhoneError() && {
                  borderColor: "var(--danger)",
                  // bgcolor: "var(--discount-bg)",
                }),
              }}
            >
              {/* Country Code */}
              <Box
                sx={{
                  px: 2,
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  borderRight: "1px solid var(--border-default)",
                  fontSize: "14px",
                  flexShrink: 0,
                }}
              >
                +91
              </Box>

              <TextField
                type="tel"
                placeholder={t("Enter mobile number")}
                value={digits}
                onChange={handleDigitsChange}
                variant="standard"
                slotProps={{
                  input: {
                    disableUnderline: true,
                  },
                }}
                sx={{
                  flex: 1,
                  "& input": {
                    paddingLeft: "12px !important",
                    fontSize: "14px",
                    color: "var(--text-strong)",

                    "&::placeholder": {
                      color: "var(--text-muted)",
                      opacity: 1,
                    },
                  },

                  "& .MuiInput-root": {
                    fontSize: "14px",

                    "&::before": {
                      display: "none !important",
                    },

                    "&::after": {
                      display: "none !important",
                    },
                  },

                  "& .MuiInput-underline:before": {
                    display: "none !important",
                  },

                  "& .MuiInput-underline:after": {
                    display: "none !important",
                  },
                }}
                inputProps={{
                  maxLength: 10,
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                }}
              />
            </Box>

            {/* Error Message */}
            {getPhoneError() && (
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "var(--danger)",
                  mt: "6px",
                  ml: "4px",
                  fontWeight: 500,
                }}
              >
                {getPhoneError()}
              </Typography>
            )}
          </Box>

          {/* ✅ DARK MODE FIX — #1A914B/#16723c hardcoded hata ke
              globals.css wale brand-green variables use kiye */}
          <LoadingButton
            type="submit"
            fullWidth
            variant="contained"
            disabled={!isPhoneComplete}
            sx={{
              mt: 3,
              mb: 2,
              backgroundColor: isPhoneComplete ? "var(--brand-green)" : "var(--bg-disabled)",
              color: "#ffffff",
              "&:hover": {
                backgroundColor: isPhoneComplete ? "var(--brand-green-hover)" : "var(--text-disabled)",
              },
              "&.Mui-disabled": {
                backgroundColor: "var(--bg-disabled)",
                color: "var(--text-disabled)",
              },
            }}
            loading={isLoading}
            id={id}
          >
            {t("Next")}
          </LoadingButton>
        </CustomStackFullWidth>
      </form>
    </CustomStackFullWidth>
  );
};
export default ForgotPasswordNumberForm;