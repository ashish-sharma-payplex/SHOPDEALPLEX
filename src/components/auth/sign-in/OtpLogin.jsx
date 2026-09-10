import React, { useRef, useState } from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import { t } from "i18next";
import Typography from "@mui/material/Typography";
import { Box, IconButton, TextField } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getLanguage } from "helper-functions/getLanguage";
import toast from "react-hot-toast";

const OtpLogin = ({
  otpLoginFormik,
  otpHandleChange,
  global,
  isLoading,
  handleClick,
  rememberMeHandleChange,
  fireBaseId,
  configData,
  onSubmit,
  onBackClick,
}) => {
  const lanDirection = getLanguage() ? getLanguage() : "ltr";

  // Valid Indian mobile number: exactly 10 digits, first digit must be 6-9
  const VALID_MOBILE_REGEX = /^[6-9]\d{9}$/;

  // Catches: all-same-digit (0000000000, 1111111111...)
  // and 2-digit alternating patterns repeated 5 times (0101010101, 2727272727...)
  const isRepetitivePattern = (digits) => {
    if (digits.length !== 10) return false;

    // All 10 digits same
    if (/^(\d)\1{9}$/.test(digits)) return true;

    // A 2-digit block repeated exactly 5 times (covers alternating patterns)
    if (/^(\d{2})\1{4}$/.test(digits)) return true;

    return false;
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    let digits = value.replace(/\D/g, "");

    // Limit to 10 digits
    digits = digits.slice(0, 10);

    otpLoginFormik.setFieldValue("phone", digits);
    otpLoginFormik.setFieldTouched("phone", true, false);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const digits = (otpLoginFormik.values.phone || "").replace(/\D/g, "");

    if (digits.length !== 10) {
      otpLoginFormik.setFieldError("phone", "Enter valid 10 digit number");
      otpLoginFormik.setFieldTouched("phone", true);
      toast.error("Please enter valid 10 digit mobile number");
      return;
    }

    if (!VALID_MOBILE_REGEX.test(digits)) {
      otpLoginFormik.setFieldError("phone", "Enter a valid mobile number");
      otpLoginFormik.setFieldTouched("phone", true);
      toast.error("Please enter a valid mobile number");
      return;
    }

    if (isRepetitivePattern(digits)) {
      otpLoginFormik.setFieldError("phone", "Enter a valid mobile number");
      otpLoginFormik.setFieldTouched("phone", true);
      toast.error("Please enter a valid mobile number");
      return;
    }

    // ✅ FIX: +91 sirf yahan local variable me jodo, formik ke values.phone
    // ko kabhi mutate mat karo — warna TextField ki display value hi
    // "+91xxxxxxxxxx" ban jaati hai aur baad me edit/delete karte time
    // wahi "91" bhi digit gin liya jata hai (isi wajah se 10-digit limit
    // gadbad ho rahi thi aur pura number type nahi ho pa raha tha).
    const phoneWithCode = `+91${digits}`;

    // ✅ FIX: formik.values.phone ko touch kiye bina seedha onSubmit prop
    // (SignIn.js se pass hota hai) ko sahi payload ke saath call karo.
    // login_type/type yahan explicitly bhejna zaroori hai — pehle ye
    // formik ke apne internal onSubmit se aate the, ab humne wo bypass
    // kar diya hai to yahan khud add karne padenge.
    const payload = {
      phone: phoneWithCode,
      login_type: "otp",
      type: "phone",
    };

    if (onSubmit) {
      onSubmit(payload);
    } else {
      // Fallback: agar kahi onSubmit prop pass nahi hua, tab bhi values
      // ko safe tarike se (setFieldValue se) update karke submit karo,
      // seedha object property assign kabhi nahi karna.
      Promise.all([
        otpLoginFormik.setFieldValue("phone", phoneWithCode),
        otpLoginFormik.setFieldValue("login_type", "otp"),
        otpLoginFormik.setFieldValue("type", "phone"),
      ]).then(() => {
        otpLoginFormik.handleSubmit();
      });
    }
  };

  const getCurrentDigits = () => {
    return (otpLoginFormik.values.phone || "").replace(/\D/g, "");
  };

  const getPhoneError = () => {
    const digits = getCurrentDigits();
    const isTouched = otpLoginFormik.touched.phone;

    if (!isTouched) return null;

    if (digits.length === 0) {
      return "Mobile number is required";
    }

    if (digits.length > 0 && digits.length < 10) {
      return `${digits.length}/10 digits`;
    }

    if (digits.length === 10 && !VALID_MOBILE_REGEX.test(digits)) {
      return "Enter a valid mobile number";
    }

    if (digits.length === 10 && isRepetitivePattern(digits)) {
      return "Enter a valid mobile number";
    }

    return null;
  };

  const isPhoneComplete =
    getCurrentDigits().length === 10 &&
    VALID_MOBILE_REGEX.test(getCurrentDigits()) &&
    !isRepetitivePattern(getCurrentDigits());

  return (
    // ✅ DARK MODE FIX — saare hardcoded hex colors (#fff, #333, #1a1a1a,
    // #666, #ddd, #999 etc.) hata ke globals.css wale CSS variables use
    // kiye hain. Ab yeh form bhi --bg-page/--bg-card/--text-* variables
    // follow karega jo prefers-color-scheme ke hisaab se khud switch
    // hote hain — koi JS/theme-detection logic yahan nahi chahiye.
    <Box
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: "520px",
        mx: "auto",
        py: "24px",
        px: "80px",
        borderRadius: "16px",
        background: "var(--bg-card)",
        boxShadow: "var(--shadow-badge)",
        transition: "background-color 0.2s ease",
      }}
    >
      {/* Back Button */}
      {onBackClick && (
        <IconButton
          onClick={onBackClick}
          sx={{
            position: "absolute",
            top: 16,
            left: 16,
            color: "var(--text-primary)",
            "&:hover": { bgcolor: "var(--bg-subtle)" },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
      )}

      {/* Logo + Heading + Subheading - common consistent spacing */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          mb: 3,
        }}
      >
        <img
          src="/logo.png"
          alt="Dealplex"
          style={{
            maxWidth: "120px",
            height: "auto",
            display: "block",
          }}
        />

        <Typography
          variant="h6"
          sx={{
            fontSize: "18px",
            fontWeight: 600,
            color: "var(--text-strong)",
            lineHeight: 1.4,
            whiteSpace: "nowrap",
          }}
        >
          Every Essential. Just One Click Away
        </Typography>

        <Typography
          variant="body2"
          sx={{
            fontSize: "14px",
            fontWeight: 400,
            color: "var(--text-secondary)",
            whiteSpace: "nowrap",
          }}
        >
          Log in or Sign up
        </Typography>
      </Box>

      {/* Form */}
      <form onSubmit={handleFormSubmit} noValidate>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* Phone Input */}
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                border: "1px solid var(--border-default)",
                borderRadius: "8px",
                overflow: "hidden",
                bgcolor: "var(--bg-subtle)",
                transition: "border-color 0.2s, background-color 0.2s",
                "&:focus-within": {
                  borderColor: "var(--brand-green)",
                  bgcolor: "var(--bg-card)",
                },
                ...(getPhoneError() && {
                  borderColor: "var(--danger)",
                  bgcolor: "var(--discount-bg)",
                }),
              }}
            >
              {/* Country Code */}
              <Box
                sx={{
                  px: 2,
                  py: "12px",
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
                placeholder="Enter mobile number"
                value={otpLoginFormik.values.phone || ""}
                onChange={handlePhoneChange}
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

          {/* Continue Button */}
          <LoadingButton
            type="submit"
            fullWidth
            variant="contained"
            loading={isLoading}
            disabled={!isPhoneComplete || isLoading}
            sx={{
              mt: 0.5,
              height: "44px",
              fontSize: "14px",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: "8px",
              backgroundColor: isPhoneComplete
                ? "var(--brand-green)"
                : "var(--bg-disabled)",
              color: "#ffffff",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: isPhoneComplete
                  ? "var(--brand-green-hover)"
                  : "var(--text-disabled)",
              },
              "&.Mui-disabled": {
                backgroundColor: "var(--bg-disabled)",
                color: "var(--text-disabled)",
              },
            }}
          >
            {t("Continue")}
          </LoadingButton>
        </Box>
      </form>

      {/* Terms & Conditions Text */}
      <Box
        sx={{
          textAlign: "center",
          mt: 2,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontSize: "12px",
            color: "var(--text-secondary)",
            lineHeight: 1.5,
            whiteSpace: "nowrap",
          }}
        >
          By continuing, you agree to our{" "}
          <Box
            component="a"
            onClick={handleClick}
            sx={{
              color: "var(--brand-green)",
              textDecoration: "underline",
              cursor: "pointer",
              fontWeight: 500,
              "&:hover": { color: "var(--brand-green-hover)" },
            }}
          >
            Terms of service
          </Box>
          {" & "}
          <Box
            component="a"
            onClick={handleClick}
            sx={{
              color: "var(--brand-green)",
              textDecoration: "underline",
              cursor: "pointer",
              fontWeight: 500,
              "&:hover": { color: "var(--brand-green-hover)" },
            }}
          >
            Privacy policy
          </Box>
        </Typography>
      </Box>
    </Box>
  );
};

export default OtpLogin;