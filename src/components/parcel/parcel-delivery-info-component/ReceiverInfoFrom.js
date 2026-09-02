import React, { useEffect, useState } from "react";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import { Button, Card, Typography, useTheme, Tooltip, Divider, InputAdornment } from "@mui/material";
import { Stack } from "@mui/system";
import { useTranslation } from "react-i18next";
import CustomTextFieldWithFormik from "../../form-fields/CustomTextFieldWithFormik";
import PinDropIcon from "@mui/icons-material/PinDrop";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import HomeIcon from "@mui/icons-material/Home";
import GetLocationFrom from "./GetLocationFrom";
import CustomPhoneInput from "../../custom-component/CustomPhoneInput";
import { getLanguage } from "helper-functions/getLanguage";
import { getToken } from "helper-functions/getToken";
import SaveAddress from "../../SaveAddress";
import Link from "next/link";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
const MapModal = dynamic(() => import("../../Map/MapModal"));

const ReceiverInfoFrom = ({
  addAddressFormik,
  receiverNameHandler,
  receiverPhoneHandler,
  roadHandler,
  houseHandler,
  floorHandler,
  handleLocation,
  coords,
  receiverFormattedAddress,
  receiverEmailHandler,
  configData,
  setReceiverFormattedAddress,
  setReceiverLocation,
  setReceiverOptionalAddress: setReceiverOptionalAddressProp,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [receiverOptionalAddress, setReceiverOptionalAddress] = useState({});
  const [open, setOpen] = useState(false);
  const [testLocation, setTestLocation] = useState(null);
  const [currentLocationValue, setCurrentLactionValue] = useState({
    description: null,
  });
  const [locationError, setLocationError] = useState(false);
  const [locationTouched, setLocationTouched] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (receiverFormattedAddress) {
      setCurrentLactionValue({
        description: receiverFormattedAddress,
      });
      setTestLocation(receiverFormattedAddress);
    } else {
      setCurrentLactionValue({
        description: "",
      });
    }
  }, [receiverFormattedAddress]);

  useEffect(() => {
    roadHandler(
      receiverOptionalAddress?.road
        ? receiverOptionalAddress?.road
        : addAddressFormik.values.road
    );
    floorHandler(
      receiverOptionalAddress?.floor
        ? receiverOptionalAddress?.floor
        : addAddressFormik.values.floor
    );
    houseHandler( 
      receiverOptionalAddress?.house
        ? receiverOptionalAddress?.house
        : addAddressFormik.values.house
    );
  }, [receiverOptionalAddress]);

  useEffect(() => {
    if (receiverFormattedAddress) {
      setLocationError(false);
    }
  }, [receiverFormattedAddress]);

  useEffect(() => {
    setLocationError(locationTouched && !receiverFormattedAddress);
  }, [locationTouched, receiverFormattedAddress]);

  const lanDirection = getLanguage() ? getLanguage() : "ltr";

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate the form
    const errors = await addAddressFormik.validateForm();
    if (Object.keys(errors).length > 0) {
      // Show first error
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return;
    }

    // Additional custom validations
    const formValues = addAddressFormik.values;

    // Validate that location is provided
    if (!receiverFormattedAddress) {
      toast.error("Location is required");
      setLocationError(true);
      return;
    }

    // Validate that at least one address field is provided
    if (!formValues.road && !formValues.house && !formValues.floor) {
      toast.error("Please provide at least one address detail (street, house, or floor number)");
      return;
    }

    // Validate email format more strictly
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formValues.receiverEmail && !emailRegex.test(formValues.receiverEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{8,10}$/;
    if (formValues.receiverPhone && !phoneRegex.test(formValues.receiverPhone.replace(/\s/g, ''))) {
      toast.error("Please enter a valid phone number");
      return;
    }

    // Validate receiver name (only letters and spaces)
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (formValues.receiverName && !nameRegex.test(formValues.receiverName)) {
      toast.error("Receiver name can only contain letters and spaces");
      return;
    }

    // Validate name length
    if (formValues.receiverName && formValues.receiverName.length < 2) {
      toast.error("Receiver name must be at least 2 characters long");
      return;
    }

    if (formValues.receiverName && formValues.receiverName.length > 50) {
      toast.error("Receiver name must not exceed 50 characters");
      return;
    }

    // Validate email length
    if (formValues.receiverEmail && formValues.receiverEmail.length > 100) {
      toast.error("Email must not exceed 100 characters");
      return;
    }

    // Validate address field lengths
    if (formValues.road && formValues.road.length > 100) {
      toast.error("Street number must not exceed 100 characters");
      return;
    }

    if (formValues.house && formValues.house.length > 20) {
      toast.error("House number must not exceed 20 characters");
      return;
    }

    if (formValues.floor && formValues.floor.length > 10) {
      toast.error("Floor number must not exceed 10 characters");
      return;
    }

    // If all validations pass, proceed (assuming parent handles actual submission)
  };

  return (
    <CustomStackFullWidth height="100%">
      <Card
        sx={{
          padding: "1.5rem",
          height: "100%",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          borderRadius: "12px",
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <form onSubmit={handleSubmit}>
          <CustomStackFullWidth spacing={3}>
          {/* Header Section */}
          <Stack
            align="center"
            width="100%"
            direction="row"
            spacing={1}
            mb={2}
            sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 1 }}
          >
            <PersonIcon color="primary" fontSize="large" />
            <Typography
              fontWeight={600}
              fontSize="18px"
              textTransform="uppercase"
              color={theme.palette.primary.main}
            >
              {t("Receiver Information")}
            </Typography>
          </Stack>

          {/* Personal Information Section */}
          <CustomStackFullWidth spacing={2}>
            <CustomTextFieldWithFormik
              required="true"
              type="text"
              label={t("Receiver Name")}
              touched={addAddressFormik.touched.receiverName}
              errors={addAddressFormik.errors.receiverName}
              fieldProps={addAddressFormik.getFieldProps("receiverName")}
              onChangeHandler={receiverNameHandler}
              value={addAddressFormik.values.receiverName}
              startIcon={
                <InputAdornment position="start">
                  <PersonIcon color="action" />
                </InputAdornment>
              }
            />
            <CustomTextFieldWithFormik
              required="true"
              label={t("Email")}
              touched={addAddressFormik.touched.receiverEmail}
              errors={addAddressFormik.errors.receiverEmail}
              fieldProps={addAddressFormik.getFieldProps("receiverEmail")}
              onChangeHandler={receiverEmailHandler}
              value={addAddressFormik.values.receiverEmail}
              startIcon={
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              }
            />
            <CustomPhoneInput
              value={addAddressFormik.values.receiverPhone}
              onHandleChange={receiverPhoneHandler}
              initCountry={configData?.country}
              touched={addAddressFormik.touched.receiverPhone}
              errors={addAddressFormik.errors.receiverPhone}
              rtlChange="true"
              lanDirection={lanDirection}
              height="45px"
              borderRadius="8px"
            />
          </CustomStackFullWidth>

          <Divider sx={{ my: 3 }} />

          {/* Delivery Address Section */}
          <CustomStackFullWidth spacing={2}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              pb="5px"
            >
              <Typography>{t("Delivery Address")}</Typography>
              <Button
                onClick={() => handleOpen()}
                variant="outlined"
                size="small"
                sx={{
                  textTransform: "none",
                  fontWeight: "bold",
                  color: theme.palette.primary.main,
                  borderColor: theme.palette.primary.main,
                  "&:hover": {
                    backgroundColor: theme.palette.primary.light,
                    borderColor: theme.palette.primary.dark,
                  },
                }}
              >
                <Stack
                  gap="5px"
                  alignItems="center"
                  justifyContent="center"
                  direction="row"
                >
                  <Typography fontSize="12px">{t("Set from map")}</Typography>
                  <PinDropIcon
                    sx={{ width: "20px", height: "20px" }}
                    color="primary"
                  />
                </Stack>
              </Button>
            </Stack>
            <GetLocationFrom
             required="true"
              fromparcel="true"
              handleLocation={handleLocation}
              formattedAddress={receiverFormattedAddress}
              currentLocationValue={currentLocationValue}
              setCurrentLactionValue={setCurrentLactionValue}
              testLocation={testLocation}
              toReceiver="true"
              locationError={locationError}
              setLocationTouched={setLocationTouched}
            />
            {getToken() && (
              <CustomStackFullWidth>
                <Card sx={{ padding: ".5rem" }} elevation={9}>
                  <SaveAddress
                    handleLocation={handleLocation}
                    configData={configData}
                    setReceiverFormattedAddress={setReceiverFormattedAddress}
                    setReceiverLocation={setReceiverLocation}
                    setReceiverOptionalAddress={setReceiverOptionalAddressProp}
                    receiver="true"
                  />
                </Card>
              </CustomStackFullWidth>
            )}
            <Stack
              sx={{
                padding: ".5rem",
                cursor: "pointer",
                color: theme.palette.primary.main,
                mt: 1,
                p: 1,
                borderRadius: "4px",
                "&:hover": {
                  backgroundColor: theme.palette.primary.light,
                },
              }}
            >
                {/* <Link href="/address">
                  <Typography
                    color={theme.palette.primary.main}
                    sx={{ cursor: "pointer" }}
                    fontSize="18px"
                    textAlign="center"
                  >
                    {t("View Saved Address")}
                  </Typography>
                </Link> */}
            </Stack>
            <CustomTextFieldWithFormik
              type="text"
              label={t("Street number")}
              touched={addAddressFormik.touched.road}
              errors={addAddressFormik.errors.road}
              fieldProps={addAddressFormik.getFieldProps("road")}
              onChangeHandler={roadHandler}
              value={addAddressFormik.values.road}
              startIcon={
                <InputAdornment position="start">
                  <LocationOnIcon color="action" />
                </InputAdornment>
              }
            />
            <CustomStackFullWidth direction="row" spacing={1.3}>
              <CustomTextFieldWithFormik
                type="text"
                label={t("House no.")}
                touched={addAddressFormik.touched.house}
                errors={addAddressFormik.errors.house}
                fieldProps={addAddressFormik.getFieldProps("house")}
                onChangeHandler={houseHandler}
                value={addAddressFormik.values.house}
                startIcon={
                  <InputAdornment position="start">
                    <HomeIcon color="action" />
                  </InputAdornment>
                }
              />
              <CustomTextFieldWithFormik
                type="text"
                label={t("Floor no.")}
                touched={addAddressFormik.touched.floor}
                errors={addAddressFormik.errors.floor}
                fieldProps={addAddressFormik.getFieldProps("floor")}
                onChangeHandler={floorHandler}
                value={addAddressFormik.values.floor}
              />
            </CustomStackFullWidth>
          </CustomStackFullWidth>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            {t("Submit")}
          </Button>
        </CustomStackFullWidth>
        </form>
      </Card>
      {open && (
        <MapModal
          open={open}
          handleClose={handleClose}
          coords={coords}
          toparcel="1"
          handleLocation={handleLocation}
          fromReceiver="1"
        />
      )}
    </CustomStackFullWidth>
  );
};

export default ReceiverInfoFrom;
