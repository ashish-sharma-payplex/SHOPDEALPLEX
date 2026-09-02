import * as Yup from "yup";
import { useTranslation } from "react-i18next";

const SignUpValidation = (selectedCountryCode) => {
  const { t } = useTranslation();

  // A mapping of country codes to minimum phone number lengths.
  const countryPhoneLengthMap = {
    'us': 10, // Example: US has a 10-digit number length
    'in': 10, // Example: India has a 10-digit number length
    // Add more country codes and their corresponding minimum lengths here.
  };

  // Get the minimum phone number length for the selected country.
  const minPhoneLength = countryPhoneLengthMap[selectedCountryCode] || 10; // default to 10 if country not found

  return Yup.object({
    name: Yup.string()
      .required(t("First name is required"))
      .min(2, t("Username must be at least 2 characters"))
      .max(50, t("Username must be less than 50 characters"))
      .matches(
        /^[a-zA-Z0-9_]+$/,
        t("Username can only contain letters, numbers, and underscores")
      ),


   email: Yup.string()
  .required(t("Email is required"))
  .matches(
    /^[A-Za-z0-9]+@[A-Za-z][A-Za-z0-9]*\.[A-Za-z]+(\.[A-Za-z]+)*$/,
    t("Please enter a valid email address")
  ),

    phone: Yup.string()
      .required(t("Please enter a phone number"))
      .min(minPhoneLength, t(`Phone number must be at least ${minPhoneLength} digits`))
      .matches(
        /^[0-9+\-\s()]+$/,
        t("Phone number can only contain numbers, spaces, hyphens, parentheses, and +")
      ),
    password: Yup.string()
      .required(t("Password is required"))
      .min(8, t("Password should be 8 chars minimum."))
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        t("Password must contain at least one uppercase letter, one lowercase letter, and one number")
      ),
    confirm_password: Yup.string()
      .required(t("Confirm Password"))
      .oneOf([Yup.ref("password"), null], t("Passwords must match")),
  });
};

export default SignUpValidation;
