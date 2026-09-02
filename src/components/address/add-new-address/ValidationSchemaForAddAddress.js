import React from "react";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { noLeadingSpace } from "utils/Validator";

// ✅ Reusable regex: only letters, numbers, spaces, and comma allowed
const NO_SPECIAL_CHAR_MSG = "Special characters are not allowed";
const noSpecialChars = /^[A-Za-z0-9\s,]*$/;

const ValidationSchemaForAddAddress = () => {
  const { t } = useTranslation();

  return Yup.object({
    // ✅ ADDRESS (optional now — Google Maps se aata hai, isliye required/strict check hataya)
    address: Yup.string().nullable().notRequired(),

    // ✅ ADDRESS TYPE
    address_type: Yup.string().required(
      t("Please select label (Home / Office / Other)"),
    ),

    // ✅ ADDRESS LABEL (conditional)
    address_label: Yup.string().when("address_type", {
      is: "other",
      then: noLeadingSpace(t("Space is not allowed"))
        .matches(noSpecialChars, t(NO_SPECIAL_CHAR_MSG))
        .required(t("Please enter label name")),
      otherwise: Yup.string().nullable(),
    }),

    // ✅ NAME — only alphabets + spaces (comma bhi nahi, kyunki naam mein comma nahi hota)
    contact_person_name: noLeadingSpace(t("Space is not allowed"))
      .matches(/^[A-Za-z\s]+$/, t("Only alphabets are allowed"))
      .required(t("Name is required"))
      .max(60, t("Maximum 60 characters allowed")),

    // ✅ PHONE
    contact_person_number: Yup.string()
      .required(t("Phone number is required"))
      .test("phone-valid", t("Invalid phone number"), (value) => {
        if (!value) return false;
        const digits = value.replace(/\D/g, "").replace(/^91/, "");
        return digits.length === 10;
      }),

    // ✅ HOUSE
    house: noLeadingSpace(t("Space is not allowed"))
      .matches(noSpecialChars, t(NO_SPECIAL_CHAR_MSG))
      .required(t("House/Apt is required")),

    // ✅ FLOOR
    floor: noLeadingSpace(t("Space is not allowed"))
      .matches(noSpecialChars, t(NO_SPECIAL_CHAR_MSG))
      .required(t("Floor is required")),

    // ✅ ROAD
    road: noLeadingSpace(t("Space is not allowed"))
      .matches(noSpecialChars, t(NO_SPECIAL_CHAR_MSG))
      .required(t("Road is required")),

    // ✅ ADDITIONAL INFO
    additional_information: noLeadingSpace(t("Space is not allowed"))
      .matches(noSpecialChars, t(NO_SPECIAL_CHAR_MSG))
      .required(t("Additional Information is required")),

    // ✅ LAT / LONG
    latitude: Yup.string().required(t("Please select location from map")),
    longitude: Yup.string().required(t("Please select location from map")),
  });
};

export default ValidationSchemaForAddAddress;
