import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { CustomBoxFullWidth } from "components/chat/Chat.style";
import {
  alpha,
  Grid,
  InputAdornment,
  Typography,
  useTheme,
} from "@mui/material";
import CustomTextFieldWithFormik from "components/form-fields/CustomTextFieldWithFormik";
import CustomPhoneInput from "components/custom-component/CustomPhoneInput";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import { getLanguage } from "helper-functions/getLanguage";
import RoomIcon from "@mui/icons-material/Room";
import React from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CustomDivider from "components/CustomDivider";

const OwnerForm = ({
  RestaurantJoinFormik,
  fNameHandler,
  lNameHandler,
  phoneHandler,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { configData } = useSelector((state) => state.configData);
  const lanDirection = getLanguage() ? getLanguage() : "ltr";

  return (
    <CustomStackFullWidth
      sx={{
          marginLeft: { xs: "5px", sm: "20px", md: "30px" },
        marginRight: { xs: "5px", sm: "20px", md: "40px" },
        marginTop: "20px",
        minWidth: "100%",  // Ensures minimum width
      }}
    >
      {/* Form wrapper */}
      <form onSubmit={RestaurantJoinFormik.handleSubmit}>
        <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid item xs={12}>
            <Typography fontSize={{ xs: "14px", sm: "16px" }} fontWeight="500">
              {t("Owner Information")}
            </Typography>
            <CustomDivider border="1px" paddingTop="5px" width="100%" />
          </Grid>

          {/* First Name Field */}
          <Grid item xs={12} sm={6} md={6}>
            <CustomTextFieldWithFormik
              placeholder={t("First name")}
              required="true"
              type="text"
              label={t("First Name")}
              touched={RestaurantJoinFormik.touched.f_name}
              errors={RestaurantJoinFormik.errors.f_name}
              fieldProps={RestaurantJoinFormik.getFieldProps("f_name")}
              onChangeHandler={fNameHandler}
              value={RestaurantJoinFormik.values.f_name}
              fontSize="12px"
              sx={{
                input: {
                  color: "orange",
                  fontSize: "13px",
                  height: "36px",
                },
                "& .MuiOutlinedInput-root": {
                  height: "40px",
                },
                "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#FF6600",
                  backgroundColor: "#FF6600",
                },
              }}
              startIcon={
                <InputAdornment position="start">
                  <AccountCircleIcon
                    sx={{
                      color: "rgb(253, 122, 0)",
                      fontSize: "18px",
                    }}
                  />
                </InputAdornment>
              }
            />
          </Grid>

          {/* Last Name Field */}
          <Grid item xs={12} sm={6} md={6}>
            <CustomTextFieldWithFormik
              required="true"
              type="text"
              placeholder={t("Last name")}
              label={t("Last Name")}
              touched={RestaurantJoinFormik.touched.l_name}
              errors={RestaurantJoinFormik.errors.l_name}
              fieldProps={RestaurantJoinFormik.getFieldProps("l_name")}
              onChangeHandler={lNameHandler}
              value={RestaurantJoinFormik.values.l_name}
              fontSize="12px"
              sx={{
                input: {
                  color: "orange",
                  fontSize: "13px",
                  height: "36px",
                },
                "& .MuiOutlinedInput-root": {
                  height: "40px",
                },
                "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#FF6600",
                  backgroundColor: "#FF6600",
                },
              }}
              startIcon={
                <InputAdornment position="start">
                  <AccountCircleIcon
                    sx={{
                      color: "rgb(253, 122, 0)",
                      fontSize: "18px",
                    }}
                  />
                </InputAdornment>
              }
            />
          </Grid>

          {/* Phone Number Field */}
          <Grid item xs={12}>
            <CustomPhoneInput
              initCountry={configData?.country}
              value={RestaurantJoinFormik.values.phone}
              onHandleChange={phoneHandler}
              touched={RestaurantJoinFormik.touched.phone}
              errors={RestaurantJoinFormik.errors.phone}
              lanDirection={lanDirection}
              height="40px"
              borderRadius="8px"
              sx={{
                "& input": {
                  fontSize: "13px",
                  height: "36px",
                },
                "& .MuiOutlinedInput-root": {
                  height: "40px",
                },
                "&:hover": {
                  borderColor: "#FF6600",
                  backgroundColor: "#FF6600",
                },
              }}
            />
          </Grid>
        </Grid>
      </form>
    </CustomStackFullWidth>
  );
};

export default OwnerForm;
