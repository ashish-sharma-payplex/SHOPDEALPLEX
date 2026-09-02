import React, { useReducer } from "react";
import GoogleMapComponent from "../../../components/Map/GoogleMapComponent";
import {
  CustomIconButton,
  CustomStackFullWidth,
} from "../../../styled-components/CustomStyles.style";
import { Button, Typography, useMediaQuery } from "@mui/material";
import { handleClick } from "../HelperFunctions";
import AddIcon from "@mui/icons-material/Add";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { t } from "i18next";
import { useTheme } from "@emotion/react";
import { initialState, reducer } from "../states";
import { Box } from "@mui/system";
import { useDispatch, useSelector } from "react-redux";
import { setOpenAddressModal } from "../../../redux/slices/addAddress";

const AddNewAddressButton = ({
  parcel,
  fromModal,
  align,
  handleAddressModal,
  currentLocation,
  handleCurrentLocation,
}) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const { openAddressModal } = useSelector((state) => state.addressModel);
  const dispatch = useDispatch();

  return (
    <Box sx={{ marginInline: fromModal === "true" && "auto !important" }}>
      {parcel === "true" ? (
        <CustomIconButton onClick={currentLocation ? handleCurrentLocation : () => dispatch(setOpenAddressModal(true))}>
          <Typography
            fontSize="15px"
            fontWeight="600"
            color={theme.palette.primary.main}
          >
            {currentLocation ? t("Current Location") : t("Add Neww Address")}
          </Typography>
          <AddCircleOutlineIcon fontSize="12px" color="primary" />
        </CustomIconButton>
      ) : (
        <>
          {fromModal === "true" ? (
            <Button onClick={currentLocation ? handleCurrentLocation : handleAddressModal} variant="contained">
              <AddIcon
                sx={{
                  color: (theme) => theme.palette.whiteContainer.main,
                  width: "20px",
                  height: "22px",
                }}
              />
              <Typography
                fontSize="16px"
                fontWeight="600"
                variant="contained"
                sx={{
                  width: { xs: "61px", sm: "inherit" },
                  color: (theme) => theme.palette.whiteContainer.main,
                }}
              >
                {isSmall ? (currentLocation ? t("Current") : t("Add New")) : (currentLocation ? t("Current Location") : t("Add Address"))}
              </Typography>
            </Button>
          ) : (
            <CustomIconButton onClick={currentLocation ? handleCurrentLocation : handleAddressModal} align={align}>
              <AddCircleOutlineIcon fontSize="14px" color="primary" />
              <Typography
                fontSize={{ xs: "14", md: "12px" }}
                fontWeight="600"
                variant="contained"
                sx={{
                  width: { xs: "62px", sm: "inherit" },
                  color: (theme) => theme.palette.primary.main,
                }}
              >
                {isSmall ? (currentLocation ? t("Current") : t("Add New")) : (currentLocation ? t("Current Location") : t("Add New Address"))}
              </Typography>
            </CustomIconButton>
          )}
        </>
      )}
    </Box>
  );
};

export default AddNewAddressButton;
