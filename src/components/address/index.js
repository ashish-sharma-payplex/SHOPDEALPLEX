// src\components\address\index.js
import React, { useEffect, useState } from "react";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AddIcon from "@mui/icons-material/Add"; // Image ke anusar plus icon ke liye
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import {
  Button,
  Grid,
  NoSsr,
  styled,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import CustomEmptyResult from "../custom-empty-result";
import nodata from "./assets/Group 1597886316.svg";
import Shimmer from "./Shimmer";
import AddressCard from "./address-card";
import { useDispatch, useSelector } from "react-redux";
import { t } from "i18next";
import { SmallDeviceIconButton } from "../profile/basic-information";
import { useTheme } from "@emotion/react";
import { setAllSaveAddress } from "redux/slices/storedData";

// Green text button as per your image
export const AddAddressButton = styled(Button)(({ theme }) => ({
  color: "#008543", // Green color from image
  fontSize: "14px",
  fontWeight: "700",
  textTransform: "none",
  "&:hover": {
    background: "transparent",
    textDecoration: "underline",
  },
}));

// Gray button used in modals (e.g. PartialPaymentModal "No" action)
export const GrayButton = styled(Button)(({ theme }) => ({
  background: "#F1F1F1",
  color: "#1e293b",
  fontSize: "14px",
  fontWeight: "700",
  textTransform: "none",
  borderRadius: "8px",
  "&:hover": {
    background: "#E0E0E0",
  },
}));

const Address = (props) => {
  const {
    configData,
    setAddAddress,
    addAddress,
    setEditAddress,
    data,
    refetch,
    isLoading,
  } = props;
  const { AllSaveAddress } = useSelector((state) => state.storedData);
  const dispatch = useDispatch();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  const { openAddressModal } = useSelector((state) => state.addressModel);

  const [edit, setEdit] = useState(null);

  useEffect(() => {
    if (AllSaveAddress?.length === 0) {
      refetch();
    }
  }, []);

  useEffect(() => {
    if (data) {
      dispatch(setAllSaveAddress(data?.addresses));
    }
  }, [data]);

  const handleClick = () => {
    setEditAddress(null);
    setAddAddress((prvState) => !prvState);
  };

  return (
    <CustomStackFullWidth
      padding={{ xs: "10px", sm: "15px", md: "20px" }}
      spacing={2}
    >
      {/* 1. My Addresses Title - Boundary se Bahar */}
      <Typography
        fontSize={{ xs: "16px", sm: "18px", md: "20px" }}
        fontWeight="700"
        color="#1e293b"
      >
        {t("My Addresses")}
      </Typography>

      {/* 2. Main Border Box */}
      <Box
        sx={{
          border: "1px solid #E0E0E0",
          borderRadius: "12px",
          position: "relative", // Button ko top-right place karne ke liye
          padding: { xs: "15px", md: "25px" },
          paddingTop: "50px", // Button ke liye upar jagah chodi hai
          background: "#fff",
        }}
      >
        {/* 3. Add Address Button - Box ke Andar Top Right */}
        <Box sx={{ position: "absolute", top: "15px", right: "20px" }}>
          {isSmall ? (
            <SmallDeviceIconButton onClick={handleClick}>
              <AddIcon style={{ fontSize: "20px", color: "#008543" }} />
            </SmallDeviceIconButton>
          ) : (
            <AddAddressButton onClick={handleClick} startIcon={<AddIcon />}>
              {t("Add Address")}
            </AddAddressButton>
          )}
        </Box>

        <NoSsr>
          {isLoading ? (
            <Shimmer />
          ) : AllSaveAddress && AllSaveAddress?.length > 0 ? (
            <Grid container spacing={2}>
              {AllSaveAddress?.map((item, index) => (
                <Grid item xs={12} key={item.id} mt={3}>
                  <AddressCard
                    item={item}
                    refetch={refetch}
                    configData={configData}
                    dispatch={dispatch}
                    openAddressModal={openAddressModal}
                    setEditAddress={setEditAddress}
                    edit={edit}
                    setAddAddress={setAddAddress}
                    // Divider logic handle karne ke liye prop bhej sakte hain
                    isLast={index === AllSaveAddress.length - 1}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Stack
              alignItems="center"
              justifyContent="center"
              width="100%"
              minHeight="200px"
            >
              <CustomEmptyResult
                label="No address found"
                image={nodata}
                width="128px"
                height="80"
              />
            </Stack>
          )}
        </NoSsr>
      </Box>
    </CustomStackFullWidth>
  );
};

export default Address;
