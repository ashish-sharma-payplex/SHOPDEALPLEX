import React from "react";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import CustomTextFieldWithFormik from "../../form-fields/CustomTextFieldWithFormik";
import CustomPhoneInput from "../../custom-component/CustomPhoneInput";
import { t } from "i18next";
import { alpha, Grid, InputAdornment, NoSsr, useTheme, useMediaQuery } from "@mui/material"; // Fixed import of theme
import { getLanguage } from "helper-functions/getLanguage";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MailIcon from "@mui/icons-material/Mail";
import LockIcon from "@mui/icons-material/Lock";
import GroupIcon from "@mui/icons-material/Group";

const SignUpForm = ({
  configData,
  handleOnChange,
  passwordHandler,
  lNameHandler,
  fNameHandler,
  confirmPasswordHandler,
  emailHandler,
  ReferCodeHandler,
  signUpFormik,
}) => {
  const theme = useTheme(); // Initialize theme first
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // Check for small screen size

  const lanDirection = getLanguage() ? getLanguage() : "ltr";

  const greenBorderStyle = {
    border: '2px solid #00c20d', // Green border color
    borderRadius: '5px', // Rounded corners
    '&:hover': {
      borderColor: '#00c20d', // Green border on hover
    },
    '&.Mui-focused': {
      borderColor: '#00c20d', // Green border when focused
    },
  };

  const blackTextStyle = {
    '& label': {
      color: 'black !important',
    },
    '& input': {
      color: 'black !important',
    },
    '& .MuiInputBase-input': {
      color: 'black !important',
      height: "28px !important", // Reduced height for the input fields
      fontSize: isSmallScreen ? "0.9rem" : "1rem", // Smaller font size for smaller screens
    },
    '& .MuiInputLabel-root': {
      color: 'black !important',
    },
  };

  return (
    <NoSsr>
      <Grid container spacing={1.6}>
        <Grid item xs={12} md={12}>
          <CustomTextFieldWithFormik
            required
            label={t("User Name")}
            placeholder={t("Enter user name")}
            fieldProps={signUpFormik.getFieldProps("name")}
            onChangeHandler={fNameHandler}
            value={signUpFormik.values.name}
            startIcon={
              <InputAdornment position="start">
                <AccountCircleIcon
                  sx={{
                    color:
                      signUpFormik.touched.name && !signUpFormik.errors.name
                        ? theme.palette.primary.main
                        : alpha(theme.palette.neutral[500], 0.4),
                    fontSize: isSmallScreen ? "20px" : "24px", // Responsive font size for smaller screens
                  }}
                />
              </InputAdornment>
            }
            sx={blackTextStyle}
          />

          {signUpFormik.touched.name && signUpFormik.errors.name && (
            <div style={{
              color: 'red',
              paddingTop: '0px',
              paddingBottom: '2px',
              fontSize: isSmallScreen ? "0.7rem" : "0.75rem"
            }}>
              {signUpFormik.errors.name}
            </div>
          )}
        </Grid>

        {/* {configData?.customer_wallet_status === 1 &&
          configData?.ref_earning_status === 1 && (
            <Grid item xs={12} md={12}>
              <CustomTextFieldWithFormik
                label={t("Refer Code (Optional)")}
                fieldProps={signUpFormik.getFieldProps("ref_code")}
                onChangeHandler={ReferCodeHandler}
                value={signUpFormik.values.ref_code}
                placeholder={t("Refer Code")}
                startIcon={
                  <InputAdornment position="start">
                    <GroupIcon
                      sx={{
                        color:
                          signUpFormik.touched.ref_code &&
                            !signUpFormik.errors.ref_code
                            ? theme.palette.primary.main
                            : alpha(theme.palette.neutral[500], 0.4),
                      }}
                    />
                  </InputAdornment>
                }
                sx={{ ...greenBorderStyle, ...blackTextStyle }}
              />
              {signUpFormik.touched.ref_code && signUpFormik.errors.ref_code && (
                <div style={{
                  color: 'red',
                  paddingTop: '2px',
                  paddingBottom: '8px',
                  fontSize: isSmallScreen ? "0.7rem" : "0.75rem"
                }}>
                  {signUpFormik.errors.ref_code}
                </div>
              )}
            </Grid>
          )} */}

        <Grid item xs={12} md={12}>
          <CustomTextFieldWithFormik
            required
            label={t("Email")}
            placeholder={t("Email")}
            fieldProps={signUpFormik.getFieldProps("email")}
            onChangeHandler={emailHandler}
            value={signUpFormik.values.email}
            startIcon={
              <InputAdornment position="start">
                <MailIcon
                  sx={{
                    color:
                      signUpFormik.touched.email && !signUpFormik.errors.email
                        ? theme.palette.primary.main
                        : alpha(theme.palette.neutral[500], 0.4),
                  }}
                />
              </InputAdornment>
            }
            sx={{ ...greenBorderStyle, ...blackTextStyle }}
          />
          {signUpFormik.touched.email && signUpFormik.errors.email && (
            <div style={{
              color: 'red',
              paddingTop: '0px',
              paddingBottom: '5px',
              fontSize: isSmallScreen ? "0.7rem" : "0.75rem"
            }}>
              {signUpFormik.errors.email}
            </div>
          )}
        </Grid>

        <Grid item xs={12} md={12}>
          <CustomPhoneInput
            value={signUpFormik.values.phone}
            onHandleChange={handleOnChange}
            initCountry={configData?.country}
            lanDirection={lanDirection}
            height="50px !important" // Reduced height for phone input
            borderRadius="10px"
          />
          {signUpFormik.touched.phone && signUpFormik.errors.phone && (
            <div style={{
              color: 'red',
              paddingTop: '1px',
              paddingBottom: '5px',
              fontSize: isSmallScreen ? "0.7rem" : "0.75rem"
            }}>
              {signUpFormik.errors.phone}
            </div>
          )}
        </Grid>

        <Grid item xs={12} md={12}>
          <CustomTextFieldWithFormik
            required
            type="password"
            label={t("Password")}
            placeholder={t("Password")}
            fieldProps={signUpFormik.getFieldProps("password")}
            onChangeHandler={passwordHandler}
            value={signUpFormik.values.password}
            startIcon={
              <InputAdornment position="start">
                <LockIcon
                  sx={{
                    color:
                      signUpFormik.touched.password &&
                        !signUpFormik.errors.password
                        ? theme.palette.primary.main
                        : alpha(theme.palette.neutral[500], 0.4),
                  }}
                />
              </InputAdornment>
            }
            sx={blackTextStyle}
          />
          {signUpFormik.touched.password && signUpFormik.errors.password && (
            <div style={{
              color: 'red',
              paddingTop: '1px',
              paddingBottom: '5px',
              fontSize: isSmallScreen ? "0.7rem" : "0.75rem"
            }}>
              {signUpFormik.errors.password}
            </div>
          )}
        </Grid>

        <Grid item xs={12} md={12}>
          <CustomTextFieldWithFormik
            required
            type="password"
            label={t("Confirm Password")}
            placeholder={t("Confirm Password")}
            fieldProps={signUpFormik.getFieldProps("confirm_password")}
            onChangeHandler={confirmPasswordHandler}
            value={signUpFormik.values.confirm_password}
            startIcon={
              <InputAdornment position="start">
                <LockIcon
                  sx={{
                    color:
                      signUpFormik.touched.confirm_password &&
                        !signUpFormik.errors.confirm_password
                        ? theme.palette.primary.main
                        : alpha(theme.palette.neutral[500], 0.4),
                  }}
                />
              </InputAdornment>
            }
            sx={{ ...greenBorderStyle, ...blackTextStyle }}
          />
          {signUpFormik.touched.confirm_password && signUpFormik.errors.confirm_password && (
            <div style={{
              color: 'red',
              paddingTop: '1px',
              paddingBottom: '5px',
              fontSize: isSmallScreen ? "0.7rem" : "0.75rem"
            }}>
              {signUpFormik.errors.confirm_password}
            </div>
          )}
        </Grid>
      </Grid>
    </NoSsr>
  );
};

export default SignUpForm;
