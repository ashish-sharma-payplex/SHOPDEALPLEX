// src\components\address\add-new-address\AddressForm.js
import React, { useEffect } from "react";
import { Grid, Stack, Typography } from "@mui/material";
import { useFormik } from "formik";
import CustomTextFieldWithFormik from "../../form-fields/CustomTextFieldWithFormik";

import CustomPhoneInput from "../../custom-component/CustomPhoneInput";
import ValidationSchemaForAddAddress from "./ValidationSchemaForAddAddress";

import usePostAddress from "../../../api-manage/hooks/react-query/address/usePostAddress";
import toast from "react-hot-toast";
import { onErrorResponse } from "../../../api-manage/api-error-response/ErrorResponses";
import { getLanguage } from "../../../helper-functions/getLanguage";
import FormSubmitButton from "../../profile/FormSubmitButton";

import useUpdatedAddress from "../../../api-manage/hooks/react-query/address/useUpdatedAddress";
import { useDispatch, useSelector } from "react-redux";
import { setGuestUserInfo } from "../../../redux/slices/guestUserInfo";
import { setOpenAddressModal } from "../../../redux/slices/addAddress";
import { t } from "i18next";

const AddressForm = ({
  configData,
  deliveryAddress,
  personName,
  phone,
  lat,
  lng,
  popoverClose,
  refetch,
  isRefetcing,
  atModal,
  addressType,
  editAddress,
  setAddAddress,
  email,
  setAddressType,
}) => {
  const typeData = [
    {
      label: "home",
      value: "home",
    },
    {
      label: "others",
      value: "office",
    },
    {
      label: "others",
      value: "other",
    },
  ];
  const token = localStorage.getItem("token");
  const dispatch = useDispatch();
  const { guestUserInfo } = useSelector((state) => state.guestUserInfo);
  const { mutate, isLoading } = usePostAddress();
  const { mutate: updateMutate, isLoading: isUpdateLoading } =
    useUpdatedAddress();

  const handleClick = (name) => {
    setAddressType(name);
  };

  const addAddressFormik = useFormik({
    initialValues: {
      contact_person_email: token
        ? email
          ? email
          : ""
        : guestUserInfo
          ? guestUserInfo.contact_person_email
          : "",
      address: "",
      address_type: token
        ? addressType
          ? addressType
          : ""
        : guestUserInfo
          ? guestUserInfo.address_type
          : "",
      address_label: token
        ? ""
        : guestUserInfo
          ? guestUserInfo.address_label
          : "",
      contact_person_name: token
        ? personName && personName !== "undefined undefined"
          ? personName
          : ""
        : guestUserInfo
          ? guestUserInfo.contact_person_name
          : "",
      contact_person_number: token
        ? editAddress
          ? editAddress?.contact_person_number
          : phone
            ? phone
            : ""
        : guestUserInfo
          ? guestUserInfo.contact_person_number
          : "",
      additional_information: token
        ? editAddress
          ? editAddress?.additional_information
          : ""
        : guestUserInfo
          ? guestUserInfo.additional_information
          : "",
      latitude: lat,
      longitude: lng,
      road: token
        ? editAddress
          ? editAddress?.road
          : ""
        : guestUserInfo
          ? guestUserInfo.road
          : "",
      house: token
        ? editAddress
          ? editAddress?.house
          : ""
        : guestUserInfo
          ? guestUserInfo.house
          : "",
      floor: token
        ? editAddress
          ? editAddress?.floor
          : ""
        : guestUserInfo
          ? guestUserInfo.floor
          : "",
    },
    validationSchema: ValidationSchemaForAddAddress(),
    onSubmit: async (values, helpers) => {


      try {
        // ✅ LOCATION VALIDATION (use props lat lng, not only formik values)
        if (!lat || !lng) {
          toast.error("Please select location from map or current location");
          return;
        }

        // ✅ LABEL VALIDATION
        if (!addressType) {
          toast.error("Please select address label (Home / Office / Other)");
          return;
        }

        // ✅ OTHER LABEL VALIDATION
        if (addressType === "other" && !values.address_label) {
          toast.error("Please enter label name");
          return;
        }

        const newData = {
          ...values,
          latitude: lat,
          longitude: lng,
          address_type:
            values.address_label && values.address_label !== ""
              ? values.address_label
              : addressType,
        };

        // console.log("FINAL DATA:", newData);

        formSubmitOnSuccess(newData);
      } catch (err) {
        // console.error("Address submit error:", err);
      }
    },
  });

  const formSubmitOnSuccess = (values) => {
    if (token) {
      if (editAddress && editAddress?.address_type) {
        const newValue = { ...values, id: editAddress?.id };
        updateMutate(newValue, {
          onSuccess: (response) => {
            if (atModal === "true") {
              toast.success(response?.message);
              popoverClose();
              refetch?.();
            } else {
              toast.success(response?.message);
              refetch?.();
              setAddAddress(false);
            }

            // if (response?.data) {
            //   refetch();
            //   setOpen(false);
            // }
          },
          onError: onErrorResponse,
        });
      } else {
        mutate(values, {
          onSuccess: (response) => {
            if (response) {
              if (atModal === "true") {
                toast.success(response?.message);
                popoverClose?.();
                refetch?.();
              } else {
                toast.success(response?.message);
                refetch?.();
                setAddAddress(false);
              }
            }

            // if (response?.data) {
            //   refetch();
            //   setOpen(false);
            // }
          },
          onError: onErrorResponse,
        });
      }
    } else {
      dispatch(setGuestUserInfo(values));
      dispatch(setOpenAddressModal(false));
    }
  };

  const nameHandler = (value) => {
  if (!value) {
    addAddressFormik.setFieldValue("contact_person_name", "");
    return;
  }

  // 1. remove digits + special chars
  let filtered = value.replace(/[^A-Za-z\s]/g, "");

  // 2. remove leading spaces
  filtered = filtered.replace(/^\s+/, "");

  // 3. replace multiple spaces with single
  filtered = filtered.replace(/\s{2,}/g, " ");

  // 4. max length
  filtered = filtered.slice(0, 60);

  addAddressFormik.setFieldValue("contact_person_name", filtered);
};



  const numberHandler = (value) => {
    addAddressFormik.setFieldValue("contact_person_number", value);
  };
  const addressTypeHandler = (value) => {
    addAddressFormik.setFieldValue("address_type", value);
    addAddressFormik.setFieldTouched("address_type", true);
  };
  const addressLabelHandler = (value) => {
    addAddressFormik.setFieldValue("address_label", value);
  };
  const additionalHandler = (value) => {
    addAddressFormik.setFieldValue("additional_information", value);
  };
  const roadHandler = (value) => {
    addAddressFormik.setFieldValue("road", value);
  };
  const houseHandler = (value) => {
    addAddressFormik.setFieldValue("house", value);
  };
  const floorHandler = (value) => {
    addAddressFormik.setFieldValue("floor", value);
  };
  const emailHandler = (value) => {
    addAddressFormik.setFieldValue("email", value);
  };
  useEffect(() => {
    addAddressFormik.setFieldValue("address", deliveryAddress);
    addAddressFormik.setFieldValue("address_type", addressType);
    addAddressFormik.setFieldValue("latitude", lat);
    addAddressFormik.setFieldValue("longitude", lng);
  }, [deliveryAddress, addressType, lat, lng]);
  const lanDirection = getLanguage() ? getLanguage() : "ltr";

  const handleReset = () => {
    addAddressFormik.setFieldValue("contact_person_name", "");
    addAddressFormik.setFieldValue("contact_person_number", "");
    addAddressFormik.setFieldValue("additional_information", "");
    addAddressFormik.setFieldValue("house", "");
    addAddressFormik.setFieldValue("floor", "");
    //setAddressType("");
  };

  return (
    <Stack>
      {addAddressFormik.errors.address_type && addAddressFormik.touched.address_type && (
        <Typography color="error" fontSize="12px">
          {addAddressFormik.errors.address_type}
        </Typography>
      )}

      {addAddressFormik.errors.latitude && (
        <Typography color="error" fontSize="12px">
          {addAddressFormik.errors.latitude}
        </Typography>
      )}

      <form noValidate onSubmit={addAddressFormik.handleSubmit}>
        <Grid container spacing={2.8} mt={1}>
          {addressType === "other" && (
            <Grid item xs={12} md={12}>
              {" "}
              <CustomTextFieldWithFormik
                type="text"
                label={t("Label Name *")}
                touched={addAddressFormik.touched.address_label}
                errors={addAddressFormik.errors.address_label}
                fieldProps={addAddressFormik.getFieldProps("address_label")}
                onChangeHandler={addressLabelHandler}
                value={addAddressFormik.values.address_label}
              />
            </Grid>
          )}

          <Grid item xs={12} md={6} mt={1}>
            <CustomTextFieldWithFormik
              required="true"
              type="text"
              label={`${t("Contact Person Name")} `}
              touched={addAddressFormik.touched.contact_person_name}
              errors={addAddressFormik.errors.contact_person_name}
              fieldProps={addAddressFormik.getFieldProps("contact_person_name")}
              onChangeHandler={nameHandler}
              value={addAddressFormik.values.contact_person_name}
              immediateChange={true}
              maxLength={60}
             
            />
          </Grid>
        <Grid item xs={12} md={6} mt={1}>
            <Stack spacing={0.5} sx={{ position: "relative" }}>
              <Typography
                variant="caption"
                sx={{
                  position: "absolute",
                  top: "-9px",
                  left: "12px",
                  px: "5px",
                  fontSize: "10px",
                  fontWeight: 400,
                  backgroundColor: "background.paper",
                  zIndex: 2,
                  color: (theme) =>
                    addAddressFormik.touched.contact_person_number &&
                    addAddressFormik.errors.contact_person_number
                      ? theme.palette.error.main
                      : theme.palette.text.secondary,
                }}
              >
                {t("Phone Number *")}
              </Typography>

              <CustomPhoneInput
                value={addAddressFormik.values.contact_person_number}
                onHandleChange={numberHandler}
                initCountry="in"
                touched={addAddressFormik.touched.contact_person_number}
                errors={addAddressFormik.errors.contact_person_number}
                rtlChange="true"
                lanDirection={lanDirection}
                height="45px !important"
                showBorder={true}
              />

              {addAddressFormik.touched.contact_person_number &&
                addAddressFormik.errors.contact_person_number && (
                  <Typography color="error" fontSize="12px" sx={{ ml: 1 }}>
                    {addAddressFormik.errors.contact_person_number}
                  </Typography>
                )}
            </Stack>
          </Grid>

          {!token && (
            <Grid item xs={12} md={6} mt={1}>
              <CustomTextFieldWithFormik
                label={t("Email")}
                touched={addAddressFormik.touched.contact_person_email}
                errors={addAddressFormik.errors.contact_person_email}
                fieldProps={addAddressFormik.getFieldProps(
                  "contact_person_email"
                )}
                onChangeHandler={emailHandler}
                value={addAddressFormik.values.contact_person_email}
              />
            </Grid>
          )}

          <Grid item xs={12} md={6} sx={{ minHeight: '90px' }} mt={1}>
            <CustomTextFieldWithFormik
              required="true"
              type="text"
              label={`${t("House")} `}
              touched={addAddressFormik.touched.house}
              errors={addAddressFormik.errors.house}
              fieldProps={addAddressFormik.getFieldProps("house")}
              onChangeHandler={houseHandler}
              value={addAddressFormik.values.house}
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ minHeight: '90px' }} mt={1}>
            <CustomTextFieldWithFormik
              required="true"
              type="text"
              label={`${t("Floor")} `}
              touched={addAddressFormik.touched.floor}
              errors={addAddressFormik.errors.floor}
              fieldProps={addAddressFormik.getFieldProps("floor")}
              onChangeHandler={floorHandler}
              value={addAddressFormik.values.floor}
            />
          </Grid>
          <Grid item xs={12} md={token ? "12" : "6"} sx={{ minHeight: '90px' }} mt={1}>
            <CustomTextFieldWithFormik
              required="true"
              type="text"
              label={`${t("Road")} `}
              touched={addAddressFormik.touched.road}
              errors={addAddressFormik.errors.road}
              fieldProps={addAddressFormik.getFieldProps("road")}
              onChangeHandler={roadHandler}
              value={addAddressFormik.values.road}
            />
          </Grid>
          <Grid item xs={12} md={12} sx={{ minHeight: '100px' }} mt={1}>
            <CustomTextFieldWithFormik
              required="true"
              type="text"
              label={`${t("Additional Information")} `}
              touched={addAddressFormik.touched.additional_information}
              errors={addAddressFormik.errors.additional_information}
              fieldProps={addAddressFormik.getFieldProps(
                "additional_information"
              )}
              onChangeHandler={additionalHandler}
              value={addAddressFormik.values.additional_information}
              height="60px"
            />
          </Grid>

          <Grid item xs={12}>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                width: "100%",
                "& button": {
                  flex: 1,
                  whiteSpace: "nowrap",     // ✅ keeps text in one line
                  minWidth: 0,
                  padding: { xs: "8px 6px", sm: "7px 16px" },
                  fontSize: { xs: "13px", sm: "14px" },
                },
              }}
            >
              <FormSubmitButton
                handleReset={handleReset}
                isLoading={
                  editAddress && editAddress?.address_type
                    ? isUpdateLoading
                    : isLoading
                }
                reset={t("Reset")}
                submit={
                  token
                    ? editAddress && editAddress?.address_type
                      ? t("Update Address")
                      : t("Add Address")
                    : guestUserInfo
                      ? t("Update Address")
                      : t("Add Address")
                }
              />
            </Stack>
          </Grid>

        </Grid>
      </form>
    </Stack>
  );
};
export default AddressForm;
