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
    /* ============================================================
       ✅ FIX #1 — VISIBLE INPUT BOX
       Pehle border/background sirf `showBorder` prop true hone par
       lagta tha — isliye jahan yeh prop pass nahi hoti thi (jaise
       ForgotPasswordNumberForm), wahan poora ".react-tel-input"
       wrapper bilkul invisible tha — sirf number tair raha tha,
       koi box hi nahi dikhta tha.
       Ab yeh border/background hamesha (unconditionally) lagta hai,
       taaki har jagah ek proper visible input box dikhe. Jahan
       `showBorder={true}` already pass ho raha tha (TrackOrderInput),
       unka look bilkul same rahega — kuch nahi tootega, bas ab yeh
       sab jagah by-default ON hai.

       ✅ FIX #2 — DARK MODE
       Saare hardcoded hex colors (#1a1a1a, #999, #ddd, #fafafa,
       #1A914B, #fff, #000, #f5f5f5, #e8f5e9, #e7e7e7, #555) hata ke
       globals.css wale CSS variables use kiye — ab yeh input
       prefers-color-scheme ke sath khud switch hoga.
       ============================================================ */
    "&.react-tel-input": {
      width: "100%",
      border: "1px solid var(--border-default)",
      borderRadius: borderRadius ? borderRadius : "8px",
      overflow: "hidden",
      backgroundColor: "var(--bg-subtle)",
      transition: "border-color 0.2s ease, background-color 0.2s ease",
    },

    "&.react-tel-input:focus-within": {
      borderColor: "var(--brand-green)",
      backgroundColor: "var(--bg-card)",
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
      color: "var(--text-strong) !important",
      paddingLeft: "12px !important",
      paddingRight: "12px !important",
      height: "100% !important",
      fontSize: "14px",
      width: "100%",
      borderRadius: "0",
      transition: "border-color 0.2s ease",

      "&::placeholder": {
        color: "var(--text-muted)",
        opacity: 1,
      },

      "&:focus": {
        borderColor: "transparent !important",
        boxShadow: "none",
        outline: "none",
      },

      "&:-webkit-autofill": {
        WebkitBoxShadow: "0 0 0 1000px transparent inset !important",
        WebkitTextFillColor: "var(--text-strong) !important",
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
      backgroundColor: "var(--bg-card)",
    },

    "&.react-tel-input .country-list .country": {
      color: "var(--text-strong)",

      "&:hover": {
        backgroundColor: "var(--bg-subtle)",
      },
    },

    "&.react-tel-input .country-list .country.highlight": {
      backgroundColor: "var(--brand-green-soft)",
      color: "var(--text-strong)",
    },

    // 🔹 Country search input
    "&.react-tel-input .country-list .search": {
      backgroundColor: "var(--bg-card)",
      borderBottom: "1px solid var(--border-subtle)",
    },

    "&.react-tel-input .country-list .search-box": {
      width: "100%",
      padding: "8px",
      outline: "none",
      border: "1px solid var(--border-subtle)",
      backgroundColor: "var(--bg-card) !important",
      color: "var(--text-strong) !important",

      "&::placeholder": {
        color: "var(--text-secondary)",
        opacity: 1,
      },

      "&:-webkit-autofill": {
        WebkitBoxShadow: "0 0 0 1000px var(--bg-card) inset !important",
        WebkitTextFillColor: "var(--text-strong) !important",
      },
    },
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
  showBorder, // ✅ backward-compat ke liye prop yahin rehne diya (ab default hi border on hai, isliye is prop ka koi functional effect nahi, purana usage break nahi hoga)
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
            showBorder={showBorder || false}
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