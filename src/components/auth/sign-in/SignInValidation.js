import React from "react";
import * as Yup from "yup";
import { t } from "i18next";

const SignInValidation = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return Yup.object({
    email_or_phone: Yup.string()
      .required(t("Please enter email or phone"))
      .test(
        "email-or-phone",
        t("Invalid"),
        function (value) {
          if (!value) return false;

          const onlyDigits = /^\d+$/.test(value.trim());

          if (onlyDigits) {
            // ✅ Phone validation
            const digitsOnly = value.replace(/\D/g, "");
            if (digitsOnly.length < 10) {
              return this.createError({ message: t("Invalid phone number") });
            }
            return true;
          } else {
            // ✅ Email validation
            if (!emailRegex.test(value)) {
              return this.createError({ message: t("Invalid email address") });
            }
            return true;
          }
        }
      ),
    password: Yup.string()
      .required(t("Password is required")),
  });
};

export default SignInValidation;