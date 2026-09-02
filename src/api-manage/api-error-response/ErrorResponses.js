import toast from "react-hot-toast";
import { t } from "i18next";
import Router from "next/router";

export const handleTokenExpire = (item, status) => {
  if (status === 401) {
    if (window.localStorage.getItem("token")) {
      toast.error(t("Your account is inactive or Your token has been expired"));
      window?.localStorage.removeItem("token");
      Router.push("/home", undefined, { shallow: true });
    }
  } else {
    toast.error(item?.message, {
      id: "error",
    });
  } 
};

export const onErrorResponse = (error) => {
  const status = error?.response?.status;
  const responseData = error?.response?.data;
  const errors = responseData?.errors;

  if (Array.isArray(errors) && errors.length > 0) {
    // Validation-style errors: { errors: [{ message: "..." }, ...] }
    errors.forEach((item) => {
      handleTokenExpire(item, status);
    });
  } else {
    // ✅ FIX: backend ka top-level message uthao
    // (e.g. { success: false, message: "You can not cancel after confirm" })
    // agar wo bhi na mile tabhi Axios ka generic error.message use karo (last resort)
    let message = responseData?.message;

    // agar backend ne errors ko object ki tarah bheja ho (non-array), usko bhi handle karo
    if (!message && errors && typeof errors === "object") {
      const firstKey = Object.keys(errors)[0];
      message = Array.isArray(errors[firstKey]) ? errors[firstKey][0] : errors[firstKey];
    }

    // agar response hi nahi aaya (network/timeout), tabhi Axios ka generic message use hoga
    if (!message) {
      message = error?.message || "Something went wrong";
    }

    handleTokenExpire({ message }, status);
  }
};

// api-manage/api-error-response/ErrorResponses.js
export const onSingleErrorResponse = (error) => {
  // console.log("Error handler triggered");
  // console.error("API Error:", error);
  if (error.response) {
    console.error("API Response of ErrorResponse:", error.response);
  }
};