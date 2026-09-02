import * as Yup from "yup";

// 🚫 Leading space validation rule
export const noLeadingSpace = (message) =>
  Yup.string().test(
    "no-leading-space",
    message,
    (value) => {
      if (!value) return true; // required will handle empty
      return !/^\s/.test(value); // start me space allowed nahi
    }
  );