import React, { useEffect, useState } from "react";
import { Stack } from "@mui/system";
import { alpha, Button, Typography, useTheme } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import { CustomStackFullWidth } from "../styled-components/CustomStyles.style";
import { useTranslation } from "react-i18next";
import useGetAddressList from "../api-manage/hooks/react-query/address/useGetAddressList";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import AddNewAddress from "./address/add-new-address";
import { Skeleton } from "@mui/material";
import AddNewAddressButton from "./address/add-new-address/AddNewAddressButton";
import { useSelector } from "react-redux";
import { useGeolocated } from "react-geolocated";
import ControlPointOutlinedIcon from "@mui/icons-material/ControlPointOutlined";
import useGetGeoCode from "../api-manage/hooks/react-query/google-api/useGetGeoCode";
import useGetZoneId from "../api-manage/hooks/react-query/google-api/useGetZone";
const SaveAddress = ({
  handleSenderLocation,
  configData,
  setSenderFormattedAddress,
  setSenderLocation,
  setSenderOptionalAddress,
  setReceiverFormattedAddress,
  setReceiverLocation,
  sender,
  setReceiverOptionalAddress,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { profileInfo } = useSelector((state) => state.profileInfo);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const { data, refetch, isRefetching, isLoading } = useGetAddressList();
  const { openAddressModal } = useSelector((state) => state.addressModel);
  const [location, setLocation] = useState(undefined);
  const [geoLocationEnable, setGeoLocationEnable] = useState(false);
  const [zoneIdEnabled, setZoneIdEnabled] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(undefined);
  const [showCurrentLocation, setShowCurrentLocation] = useState(false);

  const { coords } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: false,
    },
    userDecisionTimeout: 5000,
    isGeolocationEnabled: true,
  });

  const { data: geoCodeResults } = useGetGeoCode(location, geoLocationEnable);
  const { data: zoneData } = useGetZoneId(location, zoneIdEnabled);

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    if (geoCodeResults?.results && showCurrentLocation) {
      setCurrentLocation(geoCodeResults?.results[0]?.formatted_address);
      if (sender === "true") {
        setSenderLocation(location);
        setSenderFormattedAddress(geoCodeResults?.results[0]?.formatted_address);
      } else {
        setReceiverLocation(location);
        setReceiverFormattedAddress(geoCodeResults?.results[0]?.formatted_address);
      }
    }
  }, [geoCodeResults, location]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (zoneData) {
        localStorage.setItem("zoneid", zoneData?.zone_id);
      }
    }
  }, [zoneData]);

  const handleAgreeLocation = () => {
    if (coords) {
      setLocation({ lat: coords?.latitude, lng: coords?.longitude });
      setShowCurrentLocation(true);
      setGeoLocationEnable(true);
      setZoneIdEnabled(true);
    }
    setGeoLocationEnable(true);
    setZoneIdEnabled(true);
  };

  const handleClick = (adds) => {
    let location = { lat: adds?.latitude, lng: adds?.longitude };
    if (sender === "true") {
      setSenderLocation(location);
      setSenderFormattedAddress(adds.address);
      setSenderOptionalAddress(adds);
    } else {
      setReceiverLocation(location);
      setReceiverFormattedAddress(adds.address);
      setReceiverOptionalAddress(adds);
    }

    setSelectedAddress(adds?.id);
  };
  return (
    <CustomStackFullWidth spacing={2.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography fontWeight="bold">{t("Saved Addresses")}</Typography>
        <AddNewAddressButton parcel="true" />
        {openAddressModal && (
          <AddNewAddress
            refetch={refetch}
            t={t}
            configData={configData}
            openAddressModal={openAddressModal}
            profileInfo={profileInfo}
          />
        )}
      </Stack>
      <SimpleBar style={{ maxHeight: 130 }}>
        <Stack
          justifyContent="flex-start"
          direction="row"
          spacing={1}
          sx={{ cursor: "pointer" }}
          onClick={handleAgreeLocation}
          padding="1rem"
        >
          <ControlPointOutlinedIcon
            sx={{ width: "16.5px", height: "16.5px", color: theme.palette.primary.main }}
          />
          <Stack>
            <Typography
              fontSize={{ xs: "12px", md: "14px" }}
              fontWeight="600"
              color={theme.palette.primary.main}
            >
              {t("Use Current Location")}
            </Typography>
            {currentLocation && (
              <Typography fontSize={{ xs: "12px", md: "14px" }}>
                {currentLocation}
              </Typography>
            )}
          </Stack>
        </Stack>
        {data?.addresses?.length > 0 &&
          data.addresses?.map((adds, index) => {
            return (
              <Stack
                key={adds.id}
                // alignItems="center"
                justifyContent="flex-start"
                direction="row"
                spacing={1}
                sx={{ cursor: "pointer" }}
                backgroundColor={
                  adds.id === selectedAddress &&
                  alpha(theme.palette.primary.main, 0.3)
                }
                onClick={() => handleClick(adds)}
                padding="1rem"
              >
                <HomeIcon
                  sx={{ width: "16.5px", height: "16.5px" }}
                  color="primary"
                />
                <Stack>
                  <Typography
                    fontSize={{ xs: "12px", md: "14px" }}
                    fontWeight="600"
                    textTransform="capitalize"
                  >
                    {t(adds?.address_type)}
                  </Typography>
                  <Typography fontSize={{ xs: "12px", md: "14px" }}>
                    {adds?.address}
                  </Typography>
                </Stack>
              </Stack>
            );
          })}
        {isLoading && <Skeleton width="100%" height={120} />}
      </SimpleBar>
    </CustomStackFullWidth>
  );
};

export default SaveAddress;
