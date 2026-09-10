import React, { useEffect, useState } from "react";
import { Box, Stack, Typography, useTheme } from "@mui/material";
import {
  CustomPaperBigCard,
  CustomStackFullWidth,
  StyledInputBase,
} from "../../../styled-components/CustomStyles.style";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import LoadingButton from "@mui/lab/LoadingButton";
import OtpInput from "react-otp-input";

import * as Yup from "yup";

const OtpForm = ({ data, formSubmitHandler, isLoading }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [otp, setOtp] = useState("");
  const otpFormik = useFormik({
    //here reset_token is otp inputs
    initialValues: {
      reset_token: "",
      phone: data?.phone,
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
  useEffect(() => {
    otpFormik.setFieldValue("reset_token", otp);
  }, [otp]);
  return (
    <CustomPaperBigCard width="auto" noboxshadow="true">
      <CustomStackFullWidth>
        <Stack alignItems="center" justifyContent="center">
          <Typography>
            {t("Enter the verification code (OTP) sent to")}
          </Typography>
          <Typography>{data?.phone}</Typography>
        </Stack>
        <form noValidate onSubmit={otpFormik.handleSubmit}>
          <Stack
            mt="2rem"
            padding="0 0px"
            alignItems="center"
            justifyContent="center"
          >
            {/* ✅ FIX — pehle sirf underline (border-bottom) style thi,
                jisse input boxes ka default width alignment bikhar
                jaata tha aur digits "hilte"/misaligned dikhte the.
                Ab proper fixed-size boxed inputs hain (jaisa doosre
                OtpForm mein hai) — har digit apni fixed width/height
                box mein center mein rahega, kabhi shift nahi hoga.
                Dark mode ke liye bhi CSS variables use kiye hain. */}
            <Box
              sx={{
                mt: 3,
                mb: 1,
                mx: "auto",
                div: {
                  display: "flex",
                  justifyContent: "center",
                  gap: {
                    xs: "10px",
                    sm: "14px",
                    md: "16px",
                  },
                },
                input: {
                  flexGrow: "0",
                  background: "var(--brand-green-soft)",
                  color: theme.palette.primary.main,
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
                  border: "1.6px solid " + theme.palette.primary.main,
                },
              }}
            >
              <OtpInput
                value={otp}
                onChange={setOtp}
                numInputs={6}
                renderInput={(props) => <input {...props} />}
              />
            </Box>

            <LoadingButton
              disabled={!otpFormik.values.reset_token}
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                backgroundColor: "var(--brand-green)",
                color: "#ffffff",
                "&:hover": { backgroundColor: "var(--brand-green-hover)" },
                "&.Mui-disabled": {
                  backgroundColor: "var(--bg-disabled)",
                  color: "var(--text-disabled)",
                },
              }}
              loading={isLoading}
            >
              {t("Verify")}
            </LoadingButton>
          </Stack>
        </form>
      </CustomStackFullWidth>
    </CustomPaperBigCard>
  );
};
export default OtpForm;