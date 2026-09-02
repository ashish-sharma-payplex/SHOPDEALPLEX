import React from "react";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import PhoneInput from "react-phone-input-2";
import { NoSsr } from "@mui/material";
import { useSelector } from "react-redux";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import "react-phone-input-2/lib/style.css";

const CustomPhoneNumberInputStyled = styled(PhoneInput)(
  ({
    theme,
    languageDirection,
    borderRadius,
    hideCountryDropdown,
    showBorder,
  }) => ({
    // 🔹 Remove all borders and backgrounds
    "&.react-tel-input": {
      width: "100%",
    },

    // 🔹 Flag dropdown - hidden
    ...(hideCountryDropdown && {
      "&.react-tel-input .flag-dropdown": {
        display: "none",
      },
    }),

    "&.react-tel-input .flag-dropdown": {
      backgroundColor: "transparent",
      border: "none",
      borderRight: "none",
      height: "100% !important",
      top: "0",
      transition: "border-color 0.2s ease",
    },

    "&.react-tel-input .selected-flag": {
      backgroundColor: "transparent",
      borderRadius: "0 !important",
      width: "0",
      display: "none",
    },

    // 🔹 Label (Phone *) - hide it
    "&.react-tel-input .special-label": {
      display: "none",
    },

    // 🔹 Input field - clean styling
    "&.react-tel-input .form-control": {
      border: "none !important",
      backgroundColor: "transparent !important",
      color: "#1a1a1a !important",
      paddingLeft: "0 !important",
      paddingRight: "12px !important",
      height: "100% !important",
      fontSize: "14px",
      width: "100%",
      borderRadius: "0",
      transition: "border-color 0.2s ease",

      "&::placeholder": {
        color: "#999",
        opacity: 1,
      },

      "&:focus": {
        borderColor: "transparent !important",
        boxShadow: "none",
        outline: "none",
      },

      "&:-webkit-autofill": {
        WebkitBoxShadow: "0 0 0 1000px transparent inset !important",
        WebkitTextFillColor: "#1a1a1a !important",
      },

      ...(languageDirection === "rtl" && {
        textAlign: "left",
        direction: "ltr",
        unicodeBidi: "plaintext",
      }),
    },

    // 🔹 Country dropdown list
    "&.react-tel-input .country-list": {
      display: "none",
    },

    "&.react-tel-input .country-list .country": {
      color: "#000",

      "&:hover": {
        backgroundColor: "#f5f5f5",
      },
    },

    "&.react-tel-input .country-list .country.highlight": {
      backgroundColor: "#e8f5e9",
      color: "#000",
    },

    // 🔹 Country search input
    "&.react-tel-input .country-list .search": {
      backgroundColor: "#fff",
      borderBottom: "1px solid #e7e7e7",
    },

    "&.react-tel-input .country-list .search-box": {
      width: "100%",
      padding: "8px",
      border: "none",
      outline: "none",
      border: "1px solid #e7e7e7",
      backgroundColor: "#fff !important",
      color: "#000 !important",

      "&::placeholder": {
        color: "#555",
        opacity: 1,
      },

      "&:-webkit-autofill": {
        WebkitBoxShadow: "0 0 0 1000px #fff inset !important",
        WebkitTextFillColor: "#000 !important",
      },
    },

    // ✅ showBorder prop — sirf TrackOrderInput mein border aayegi
    ...(showBorder && {
      "&.react-tel-input": {
        width: "100%",
        border: "1px solid #ddd",
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: "#fafafa",
        transition: "border-color 0.2s, background-color 0.2s",
      },
      "&.react-tel-input:focus-within": {
        borderColor: "#1A914B",
        backgroundColor: "#fff",
      },
      "&.react-tel-input .form-control": {
        paddingLeft: "12px !important",
      },
    }),
  }),
);

const CustomPhoneInput = ({
  value,
  onHandleChange,
  initCountry,
  touched,
  errors,
  lanDirection,
  height,
  borderRadius,
  background,
  onCountryChange,
  showCountryCode,
  hideCountryDropdown,
  showBorder, // ✅ naya prop
}) => {
  const { configData } = useSelector((state) => state.configData);
  const { t } = useTranslation();
  const defaultCountry = initCountry?.toLowerCase();

  const changeHandler = (phone, countryData) => {
    const dialCode = countryData.dialCode;
    if (!phone.startsWith(dialCode)) {
      onHandleChange(dialCode);
    } else {
      onHandleChange(phone);
    }

    if (onCountryChange) {
      onCountryChange(countryData.iso2);
    }
  };

  return (
    <NoSsr>
      <CustomStackFullWidth
        alignItems="flex-start"
        spacing={0.8}
        sx={{ height: height ? height : "44px", width: "100%" }}
      >
        {lanDirection && (
          <CustomPhoneNumberInputStyled
            background={background}
            borderRadius={borderRadius ? borderRadius : "0"}
            error={touched && errors}
            autoFormat={true}
            enableLongNumbers={false}
            disableSearchIcon={true}
            placeholder={t("Enter mobile number")}
            value={value}
            enableSearchField
            enableSearch
            countryCodeEditable={false}
            onChange={(phone, countryData) => changeHandler(phone, countryData)}
            inputProps={{
              required: true,
              autoFocus: false,
              maxLength: 15,
            }}
            specialLabel={t("")}
            country={defaultCountry}
            searchStyle={{ margin: "0", width: "95%", height: "50px" }}
            inputStyle={{
              width: "100%",
              height: "43px",
              borderRadius: borderRadius ? borderRadius : "0",
              border: "none",
              padding: "0",
            }}
            languageDirection={lanDirection}
            hideCountryDropdown={hideCountryDropdown || false}
            showBorder={showBorder || false} // ✅ styled component ko pass karo
            {...(configData?.country_picker_status !== 1 && {
              disableDropdown: true,
            })}
          />
        )}
      </CustomStackFullWidth>
    </NoSsr>
  );
};

export default CustomPhoneInput;




