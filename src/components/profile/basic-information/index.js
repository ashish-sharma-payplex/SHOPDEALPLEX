import React, { useState } from "react";
import PropTypes from "prop-types";
import { CustomPaperBigCard } from "../../../styled-components/CustomStyles.style";
import {
  Button,
  Grid,
  IconButton,
  Skeleton,
  Typography,
  useMediaQuery,
} from "@mui/material";
import BasicInformationForm from "./BasicInformationForm";
import { Box, Stack, styled } from "@mui/system";
import CustomAlert from "../../alert/CustomAlert";
import AccountInformation from "./AccountInformation";
import EditIcon from "@mui/icons-material/Edit";
import AddAddress from "../../../redux/slices/addAddress";
import AddAddressComponent from "../../address/add-new-address/AddAddressComponent";
import { useSelector } from "react-redux";
import editIcon from "../asset/editIcon.png";
import CustomImageContainer from "../../CustomImageContainer";
import { useTheme } from "@emotion/react";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import VerifiedIcon from "components/profile/VerifiedIcon";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";

export const SmallDeviceIconButton = styled(IconButton)(({ theme }) => ({
  border: "1px solid",
  borderColor: theme.palette.neutral[400],
  borderRadius: "50%",
  padding: "6px",
}));

const defaultUserImage = "/default-user.png";

const BasicInformation = (props) => {
  const {
    data,
    t,
    refetch,
    setEditProfile,
    editProfile,
    setAddAddress,
    addAddress,
    editAddress,
    addressRefetch,
    setEditAddress,
  } = props;

  // console.log("The user data in profile : ", data);
  const theme = useTheme();
  const { configData } = useSelector((state) => state.configData);
  const isMedium = useMediaQuery(theme.breakpoints.down("md"));
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  // Check for large devices (desktop)
  const isLarge = useMediaQuery(theme.breakpoints.up("lg"));

  const handleClick = () => {
    setEditProfile((prvState) => !prvState);
  };

  // Determine user image or fallback
  const userImage =
    data?.image_full_url && data?.image_full_url !== ""
      ? data.image_full_url
      : defaultUserImage;

  return (
    <>
      <Box sx={{ padding: { xs: "0px", md: "0px" } }}>
        {/* 1. My Profile Heading (Box ke bahar top-left) */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: "700",
            fontSize: "18px",
            marginBottom: "15px",
            color: "#2D3748",
          }}
        >
          {t("My Profile")}
        </Typography>

        {/* 2. Main Rectangular Border Box */}
        <Box
          sx={{
            border: "1px solid #E0E0E0",
            borderRadius: "12px",
            padding: { xs: "10px", md: "40px" },
            position: "relative", // Button ki positioning ke liye
            // backgroundColor: "#FFFFFF",
          }}
        >
          <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
            {addAddress ? (
              <Grid container item xs={12} md={12} spacing={3}>
                <AddAddressComponent
                  setAddAddress={setAddAddress}
                  configData={configData}
                  userData={data}
                  editAddress={editAddress}
                  addressRefetch={addressRefetch}
                  setEditAddress={setEditAddress}
                />
              </Grid>
            ) : (
              <>
                {editProfile ? (
                  <Grid container item xs={12} md={12}>
                    <BasicInformationForm
                      data={data}
                      configData={configData}
                      setEditProfile={setEditProfile}
                      handleClick={handleClick}
                      t={t}
                      refetch={refetch}
                    />
                  </Grid>
                ) : (
                  <>
                    {/* For Tablets, Laptops, and Desktops: Display the "Edit Profile" button */}
                    {!isSmall && (
                      <Button
                        onClick={handleClick}
                        variant="contained"
                        sx={{
                          position: "absolute",
                          top: { xs: "15px", md: "25px" },
                          right: { xs: "15px", md: "25px" },
                          fontSize: "14px",
                          fontWeight: "600",
                          borderRadius: "8px",
                          backgroundColor: "#009846", // Green color as per image
                          textTransform: "none",
                          padding: "8px 20px",
                          "&:hover": {
                            backgroundColor: "#007a38",
                          },
                        }}
                        startIcon={
                          <BorderColorIcon
                            style={{ width: "16px", height: "16px" }}
                          />
                        }
                      >
                        {t("Edit Profile")}
                      </Button>
                    )}

                    {/* CENTERED CONTENT: Image + Info */}
                    <Grid item xs={12}>
                      <Stack
                        spacing={2}
                        alignItems="center"
                        justifyContent="center"
                        sx={{ width: "100%" }}
                      >
                        {/* Avatar/Image */}
                        <Box>
                          <CustomImageContainer
                            src={userImage}
                            width="110px"
                            height="110px"
                            borderRadius="50%"
                            objectfit="contain"
                            alt={
                              data ? `${data?.f_name} ${data?.l_name}` : "User"
                            }
                          />
                        </Box>

                        {/* User Details */}
                        {data ? (
                          <Stack alignItems="center" spacing={0.5}>
                            <Typography
                              fontWeight="700"
                              fontSize={{ xs: "18px", md: "22px" }}
                              color="#1A202C"
                            >
                              {`${data?.f_name || ""} ${data?.l_name || ""}`}
                            </Typography>

                            <Typography
                              fontSize={{ xs: "14px", md: "16px" }}
                              color="#718096"
                            >
                              {data?.phone}
                            </Typography>

                            <Typography
                              fontSize={{ xs: "14px", md: "16px" }}
                              color="#718096"
                            >
                              {data?.email || ""}
                            </Typography>
                          </Stack>
                        ) : (
                          <Stack alignItems="center" spacing={1}>
                            <Skeleton
                              variant="circular"
                              width={110}
                              height={110}
                            />
                            <Skeleton variant="text" width={150} height={30} />
                            <Skeleton variant="text" width={120} height={20} />
                          </Stack>
                        )}
                      </Stack>
                    </Grid>
                  </>
                )}
              </>
            )}
          </Grid>

          {/* For Mobile: Display the "Edit Profilee" button below email */}
          {/* For Mobile: Display the "Edit Profilee" button below email */}
          {isSmall && !addAddress && !editProfile && (
            <Grid
              item
              xs={12}
              sx={{
                marginTop: "15px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Button
                onClick={handleClick}
                variant="contained"
                sx={{
                  fontSize: "12px",
                  fontWeight: "600",
                  borderRadius: "8px",
                  backgroundColor: "#009846",
                  textTransform: "none",
                  padding: "6px 16px",
                  "&:hover": {
                    backgroundColor: "#007a38",
                  },
                }}
                startIcon={
                  <BorderColorIcon style={{ width: "16px", height: "16px" }} />
                }
              >
                {t("Edit Profile")}
              </Button>
            </Grid>
          )}
        </Box>
      </Box>
    </>
  );
};

BasicInformation.propTypes = {};

export default BasicInformation;
