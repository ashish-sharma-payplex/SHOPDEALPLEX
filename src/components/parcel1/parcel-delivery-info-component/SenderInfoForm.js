import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import { Button, Card, Typography, useTheme, Tooltip, Divider, InputAdornment } from "@mui/material";
import { Stack } from "@mui/system";
import { useTranslation } from "react-i18next";
import CustomTextFieldWithFormik from "../../form-fields/CustomTextFieldWithFormik";
import PinDropIcon from "@mui/icons-material/PinDrop";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ScaleIcon from "@mui/icons-material/Scale";
import HomeIcon from "@mui/icons-material/Home";
import SaveAddress from "../../SaveAddress";
import GetLocationFrom from "./GetLocationFrom";
import CustomPhoneInput from "../../custom-component/CustomPhoneInput";
import { getLanguage } from "helper-functions/getLanguage";
import { getToken } from "helper-functions/getToken";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
const MapModal = dynamic(() => import("../../Map/MapModal"));

const SenderInfoForm = ({
  addAddressFormik,
  senderNameHandler,
  senderPhoneHandler,
  handleLocation,
  coords,
  configData,
  senderFormattedAddress,
  setSenderFormattedAddress,
  setSenderLocation,
  senderRoadHandler,
  senderHouseHandler,
  senderFloorHandler,
  senderEmailHandler,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.profileInfo);
  const [open, setOpen] = useState(false);
  const [currentLocationValue, setCurrentLactionValue] = useState({
    description: null,
  });
  const [senderOptionalAddress, setSenderOptionalAddress] = useState({});
  const [testLocation, setTestLocation] = useState(null);
  const [locationError, setLocationError] = useState(false);
  const [locationTouched, setLocationTouched] = useState(false);
  const theme = useTheme();
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (senderFormattedAddress) {
      setCurrentLactionValue({
        description: senderFormattedAddress,
      });
      setTestLocation(senderFormattedAddress);
      setLocationError(false);
    } else {
      setCurrentLactionValue({
        description: "",
      });
    }
  }, [senderFormattedAddress]);

  useEffect(() => {
    senderRoadHandler(
      senderOptionalAddress?.road
        ? senderOptionalAddress?.road
        : addAddressFormik.values.senderRoad
    );
    senderFloorHandler(
      senderOptionalAddress?.floor
        ? senderOptionalAddress?.floor
        : addAddressFormik.values.senderFloor
    );
    senderHouseHandler(
      senderOptionalAddress?.house
        ? senderOptionalAddress?.house
        : addAddressFormik.values.senderHouse
    );
  }, [senderOptionalAddress]);

  useEffect(() => {
    if (senderFormattedAddress) {
      setLocationError(false);
    }
  }, [senderFormattedAddress]);

  useEffect(() => {
    setLocationError(locationTouched && !senderFormattedAddress);
  }, [locationTouched, senderFormattedAddress]);

  useEffect(() => {
    if (user?.name && !addAddressFormik.values.senderName) {
      senderNameHandler(user.name);
    }
    if (user?.email && !addAddressFormik.values.senderEmail) {
      senderEmailHandler(user.email);
    }
    if (user?.phone && !addAddressFormik.values.senderPhone) {
      senderPhoneHandler(user.phone);
    }
  }, [user]);

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
    if (!senderFormattedAddress) {
      toast.error("Location is required");
      setLocationError(true);
      return;
    }

    // Validate that at least one address field is provided
    if (!formValues.senderRoad && !formValues.senderHouse && !formValues.senderFloor) {
      toast.error("Please provide at least one address detail (street, house, or floor number)");
      return;
    }

    // Validate weight for extra charges warning
    if (formValues.weight > 50) {
      toast.warning("Extra charges will apply for weight above 50 kgs", {
        duration: 5000,
        position: "top-center",
      });
    }

    // Validate email format more strictly
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formValues.senderEmail && !emailRegex.test(formValues.senderEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{8,10}$/;
    if (formValues.senderPhone && !phoneRegex.test(formValues.senderPhone.replace(/\s/g, ''))) {
      toast.error("Please enter a valid phone number");
      return;
    }

    // Validate sender name (only letters and spaces)
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (formValues.senderName && !nameRegex.test(formValues.senderName)) {
      toast.error("Sender name can only contain letters and spaces");
      return;
    }

    // Validate weight is a positive number
    if (formValues.weight && (isNaN(formValues.weight) || formValues.weight <= 0)) {
      toast.error("Weight must be a positive number");
      return;
    }

    // Validate weight doesn't exceed maximum limit
    if (formValues.weight > 1000) {
      toast.error("Weight cannot exceed 1000 kg");
      return;
    }

    // Validate address fields format
    const addressRegex = /^[a-zA-Z0-9\s\-\/,]+$/;
    if (formValues.senderRoad && !addressRegex.test(formValues.senderRoad)) {
      toast.error("Street number can only contain letters, numbers, spaces, hyphens, and slashes");
      return;
    }

    if (formValues.senderHouse && !addressRegex.test(formValues.senderHouse)) {
      toast.error("House number can only contain letters, numbers, spaces, hyphens, and slashes");
      return;
    }

    if (formValues.senderFloor && !addressRegex.test(formValues.senderFloor)) {
      toast.error("Floor number can only contain letters, numbers, spaces, hyphens, and slashes");
      return;
    }

    // Validate name length
    if (formValues.senderName && formValues.senderName.length < 2) {
      toast.error("Sender name must be at least 2 characters long");
      return;
    }

    if (formValues.senderName && formValues.senderName.length > 50) {
      toast.error("Sender name must not exceed 50 characters");
      return;
    }

    // Validate email length
    if (formValues.senderEmail && formValues.senderEmail.length > 100) {
      toast.error("Email must not exceed 100 characters");
      return;
    }

    // Validate address field lengths
    if (formValues.senderRoad && formValues.senderRoad.length > 100) {
      toast.error("Street number must not exceed 100 characters");
      return;
    }

    if (formValues.senderHouse && formValues.senderHouse.length > 20) {
      toast.error("House number must not exceed 20 characters");
      return;
    }

    if (formValues.senderFloor && formValues.senderFloor.length > 10) {
      toast.error("Floor number must not exceed 10 characters");
      return;
    }

    if (onSubmit) {
      onSubmit();
    }
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
                {t("Sender Information")}
              </Typography>
            </Stack>

            {/* Personal Information Section */}
            <CustomStackFullWidth spacing={2}>
              <CustomTextFieldWithFormik
                required="true"
                type="text"
                label={t("Sender Name")}
                placeholder={t("Enter sender's full name")}
                touched={addAddressFormik.touched.senderName}
                errors={addAddressFormik.errors.senderName}
                fieldProps={addAddressFormik.getFieldProps("senderName")}
                onChangeHandler={senderNameHandler}
                value={addAddressFormik.values.senderName}
                startIcon={
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                }
                helperText={t("Name should contain only letters and spaces")}
              />
              <CustomTextFieldWithFormik
                required="true"
                label={t("Email")}
                placeholder={t("Enter sender's email address")}
                touched={addAddressFormik.touched.senderEmail}
                errors={addAddressFormik.errors.senderEmail}
                fieldProps={addAddressFormik.getFieldProps("senderEmail")}
                onChangeHandler={senderEmailHandler}
                value={addAddressFormik.values.senderEmail}
                startIcon={
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                }
                helperText={t("We'll use this for order updates and notifications")}
              />
              <CustomPhoneInput
                value={addAddressFormik.values.senderPhone}
                onHandleChange={senderPhoneHandler}
                initCountry={configData?.country}
                touched={addAddressFormik.touched.senderPhone}
                errors={addAddressFormik.errors.senderPhone}
                rtlChange="true"
                lanDirection={lanDirection}
                height="45px"
                borderRadius="8px"
                placeholder={t("Enter sender's phone number")}
              />
            </CustomStackFullWidth>

            <Divider sx={{ my: 3 }} />

            {/* Pickup Address Section */}
            <CustomStackFullWidth spacing={2}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                pb="5px"
              >
             <Typography>{t("Pickup Address")}</Typography>
                
                <Button
                  onClick={handleOpen}
                  type="button"
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
                handleLocation={handleLocation}
                sender="true"
                fromparcel="true"
                formattedAddress={senderFormattedAddress}
                currentLocationValue={currentLocationValue}
                testLocation={testLocation}
                setCurrentLactionValue={setCurrentLactionValue}
                locationError={locationError}
                setLocationTouched={setLocationTouched}
              />
              <CustomTextFieldWithFormik
                type="text"
                label={t("Street number")}
                placeholder={t("Enter street number or name")}
                touched={addAddressFormik.touched.road}
                errors={addAddressFormik.errors.road}
                fieldProps={addAddressFormik.getFieldProps("senderRoad")}
                onChangeHandler={senderRoadHandler}
                value={addAddressFormik.values.road}
                startIcon={
                  <InputAdornment position="start">
                    <LocationOnIcon color="action" />
                  </InputAdornment>
                }
                helperText={t("Optional - helps delivery person find location")}
              />
              <CustomStackFullWidth direction="row" spacing={1.3}>
                <CustomTextFieldWithFormik
                  type="text"
                  label={t("House no.")}
                  placeholder={t("Enter house/apartment number")}
                  touched={addAddressFormik.touched.house}
                  errors={addAddressFormik.errors.house}
                  fieldProps={addAddressFormik.getFieldProps("senderHouse")}
                  onChangeHandler={senderHouseHandler}
                  value={addAddressFormik.values.senderHouse}
                  startIcon={
                    <InputAdornment position="start">
                      <HomeIcon color="action" />
                    </InputAdornment>
                  }
                  helperText={t("Optional - building or house number")}
                />
                <CustomTextFieldWithFormik
                  type="text"
                  label={t("Floor no.")}
                  placeholder={t("Enter floor number")}
                  touched={addAddressFormik.touched.floor}
                  errors={addAddressFormik.errors.floor}
                  fieldProps={addAddressFormik.getFieldProps("senderFloor")}
                  onChangeHandler={senderFloorHandler}
                  value={addAddressFormik.values.floor}
                  helperText={t("Optional - floor or unit number")}
                />
              </CustomStackFullWidth>
            </CustomStackFullWidth>

            <Divider sx={{ my: 3 }} />

            {/* Parcel Details Section */}
            {/* <CustomStackFullWidth spacing={1}>
              <Tooltip title={t("Extra charges apply for weight above 50 kgs")}>
                <CustomTextFieldWithFormik
                  required="true"
                  type="number"
                  label={t("Weight in kgs")}
                  placeholder={t("Enter parcel weight in kilograms")}
                  touched={addAddressFormik.touched.weight}
                  errors={addAddressFormik.errors.weight}
                  fieldProps={addAddressFormik.getFieldProps("weight")}
                  onChangeHandler={senderFloorHandler}
                  value={addAddressFormik.values.weight}
                  startIcon={
                    <InputAdornment position="start">
                      <ScaleIcon color="action" />
                    </InputAdornment>
                  }
                  inputProps={{
                    min: "0.1",
                    max: "1000",
                    step: "0.1"
                  }}
                />
              </Tooltip>
              <Typography fontSize="12px" color={theme.palette.text.secondary}>
                {t("Maximum weight: 1000 kg | Extra charges above 50 kg")}
              </Typography>
            </CustomStackFullWidth> */}

            {/* {getToken() && (
              <CustomStackFullWidth>
                <Card sx={{ padding: ".5rem" }} elevation={9}>
                  <SaveAddress
                    handleLocation={handleLocation}
                    configData={configData}
                    setSenderFormattedAddress={setSenderFormattedAddress}
                    setSenderLocation={setSenderLocation}
                    setSenderOptionalAddress={setSenderOptionalAddress}
                    sender="true"
                  />
                </Card>
              </CustomStackFullWidth>
            )} */}
            {/* <Button type="submit" variant="contained" color="primary" fullWidth>
              {t("Submit")}
            </Button> */}
          </CustomStackFullWidth>
        </form>
      </Card>
      {open && (
        <MapModal
          open={open}
          handleClose={handleClose}
          coords={coords}
          setSenderFormattedAddress={setSenderFormattedAddress}
          setSenderLocation={setSenderLocation}
          handleLocation={handleLocation}
          toparcel="1"
        />
      )}
    </CustomStackFullWidth>
  );
};

export default SenderInfoForm;
