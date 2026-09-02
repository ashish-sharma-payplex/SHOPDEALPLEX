
// src\components\header\top-navbar\address-reselect\AddressReselectPopover.js
import React, { useEffect, useReducer, useState } from "react";
import GoogleMapReact from "google-map-react";

import { useTranslation } from "react-i18next";
import "simplebar-react/dist/simplebar.min.css";
import { DeliveryCaption } from "../CheckOut.style";
import useGetAddressList from "../../../api-manage/hooks/react-query/address/useGetAddressList";
import AddressSelectionList from "./AddressSelectionList";
import { IconButton, Typography, useTheme, Tooltip, Fade, Paper, Box } from "@mui/material";
import { Stack } from "@mui/system";
import AddNewAddress from "../../address/add-new-address";
import AdditionalAddresses from "../item-checkout/AdditionalAddresses";
import CustomModal from "../../modal";
import SaveAddressModal from "../item-checkout/SaveAddressModal";
import { initialState, reducer } from "../../address/states";
import usePostAddress from "../../../api-manage/hooks/react-query/address/usePostAddress";
import toast from "react-hot-toast";
import { onErrorResponse } from "../../../api-manage/api-error-response/ErrorResponses";
import { useDispatch, useSelector } from "react-redux";
import AddNewAddressButton from "../../address/add-new-address/AddNewAddressButton";
import { setOpenAddressModal } from "../../../redux/slices/addAddress";
import CheckOutSelectedAddress from "../item-checkout/CheckOutSelectedAddress";
import CheckoutSelectedAddressGuest from "../item-checkout/CheckoutSelectedAddressGuest";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AddLocationIcon from "@mui/icons-material/AddLocation";
import MapIcon from "@mui/icons-material/Map";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const getZoneWiseAddresses = (addresses, restaurantId) => {
  const newArray = [];
  addresses?.forEach(
    (item) => item.zone_ids.includes(restaurantId) && newArray.push(item)
  );
  return newArray;
};

const MapMarker = () => (
  <div style={{ color: 'red', fontSize: '24px' }}>📍</div>
);
const DeliveryAddress = ({
  setAddress,
  address,
  renderOnNavbar,
  configData,
  storeZoneId,
  orderType,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [allAddress, setAllAddress] = useState();
  const [data, setData] = useState(null);
  const reduxDispatch = useDispatch();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { profileInfo } = useSelector((state) => state.profileInfo);
  const [openSaveAddress, setOpenSaveAddress] = useState(false);
  const [editAddress, setEditAddress] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({ lat: 0, lng: 0 });
  const token = localStorage.getItem("token");

  const saveAddressModalClose = () => {
    setOpenSaveAddress(false);
  };
  const { openAddressModal } = useSelector((state) => state.addressModel);
  const mainAddress = {
    ...address,
  };
  const handleSuccess = (addressData) => {
    if (storeZoneId) {
      const newObj = {
        ...addressData,
        addresses: getZoneWiseAddresses(addressData?.addresses, storeZoneId),
      };

      setData(newObj);
    } else {
      setData(addressData);
    }
  };
  const { refetch, isRefetching, isLoading } = useGetAddressList(handleSuccess);

  useEffect(() => {
    refetch();
  }, []);
  useEffect(() => {
    // handleSize(data.total_size)
    data && setAllAddress([mainAddress, ...data.addresses]);
  }, [data]);

  const handleLatLng = (values) => {
    if (renderOnNavbar === "true") {
      setAddress({ ...values, lat: values.latitude, lng: values.longitude });
      window.location.reload();
    } else {
      setAddress({ ...values, lat: values.latitude, lng: values.longitude });
    }

  };

  const { mutate } = usePostAddress();

  const saveAddress = () => {
    let formData = {
      address: address?.address,
      address_type: address?.address_type,
      contact_person_name: `${profileInfo?.f_name} ${profileInfo.l_name}`,
      contact_person_number: profileInfo?.phone,
      latitude: address?.lat,
      longitude: address?.lng,
      additional_information: "",
      house: state?.houseNumber,
      floor: state?.floor,
      road: state?.streetNumber,
    };
    mutate(formData, {
      onSuccess: (response) => {
        toast.success(response?.message);
        refetch?.();
      },
      onError: onErrorResponse,
    });
  };
  const handleAddressModal = () => {
    setEditAddress(null);
    reduxDispatch(setOpenAddressModal(true));
  };
  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          setShowMap(true);
        },
        (error) => {
          // console.error("Error getting location:", error);
          // Handle error, perhaps show a toast
        }
      );
    } else {
      // console.error("Geolocation is not supported by this browser.");
    }
  };
  return (
    <>
      <Fade in={true} timeout={600}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"

        >
          {renderOnNavbar !== "true" && orderType !== "take_away" && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnIcon sx={{ color: theme.palette.primary.main, fontSize: '24px' }} />
              <DeliveryCaption sx={{ fontSize: '18px', fontWeight: 'bold' }}>
                {t("Delivery Addresses")}
              </DeliveryCaption>
            </Box>
          )}
          {/* {token && renderOnNavbar !== "true" && orderType !== "take_away" && (
            <Tooltip title={t("Add a new delivery address")}>
              <Box>
                <AddNewAddressButton
                  align="right"
                  backgroundColor="#FF6600"
                  currentLocation={true}
                  handleCurrentLocation={handleCurrentLocation}
                />
              </Box>
            </Tooltip>
          )} */}

          {openAddressModal && (
            <AddNewAddress
              refetch={refetch}
              t={t}
              configData={configData}
              openAddressModal={openAddressModal}
              editAddress={editAddress}
              setEditAddress={setEditAddress}
            />
          )}
        </Stack>
      </Fade>
      {/*{isLoading && <Skeleton width="100%" height={150} />}*/}
      {/*{isRefetching && <Skeleton width="100%" height={150} />}*/}
      {renderOnNavbar === "true" ? (
        <>
          <AddressSelectionList
            data={data}
            allAddress={allAddress}
            handleLatLng={handleLatLng}
            t={t}
            address={address}
            refetch={refetch}
            configData={configData}
            renderOnNavbar={renderOnNavbar}
          />
        </>
      ) : (
        <>
          {token && orderType !== "take_away" ? (
            <Fade in={true} timeout={800}>
              <Stack spacing={2}
                sx={{
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.grey[200]}`,
                }}>
                {showMap && (
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`,
                      height: '300px',
                    }}
                  >
                    <GoogleMapReact
                      bootstrapURLKeys={{ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY' }}
                      defaultCenter={currentLocation}
                      center={currentLocation}
                      defaultZoom={15}
                    >
                      <MapMarker lat={currentLocation.lat} lng={currentLocation.lng} />
                    </GoogleMapReact>
                  </Paper>
                )}
                {/* <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`,
                    border: `1px solid ${theme.palette.grey[200]}`,
                  }}
                >
                  <CheckOutSelectedAddress
                    address={address}
                    refetch={refetch}
                    configData={configData}
                    editAddress={editAddress}
                    setEditAddress={setEditAddress}
                  />
                </Paper>
                <Tooltip title={t("Browse and select from your saved addresses")}>
                  <Paper
                    elevation={2}
                    sx={{
                      borderRadius: 2,
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                      },
                    }}
                  >
                    <IconButton
                      onClick={() => setOpenSaveAddress(true)}
                      sx={{
                        width: "100%",
                        py: 2,
                        background: `linear-gradient(135deg, #FF6600, #FF9900)`,
                        borderRadius: 2,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                        },
                      }}
                    >

                      <Stack direction="row" alignItems="center" spacing={1}>
                        <MapIcon sx={{ color: theme.palette.whiteContainer.main, fontSize: '20px' }} />
                        <Typography
                          fontSize="14px"
                          fontWeight="600"
                          color={theme.palette.whiteContainer.main}
                          sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
                        >
                          {t("View Saved Address")}
                        </Typography>
                        <ExpandMoreIcon sx={{ color: theme.palette.whiteContainer.main, fontSize: '18px' }} />
                      </Stack>
                    </IconButton>
                  </Paper>
                </Tooltip> */}
              </Stack>
            </Fade>
          ) : (
            <>
              {!token && (
                <Fade in={true} timeout={800}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`,
                      border: `1px solid ${theme.palette.grey[200]}`,
                    }}
                  >
                    <CheckoutSelectedAddressGuest
                      address={address}
                      configData={configData}
                      editAddress={editAddress}
                      setEditAddress={setEditAddress}
                      orderType={orderType}
                    />
                  </Paper>
                </Fade>
              )}
            </>
          )}
        </>
      )}
      {/* {renderOnNavbar !== "true" && token && orderType !== "take_away" && (
        <AdditionalAddresses
          t={t}
          additionalInformationDispatch={dispatch}
          additionalInformationStates={state}
          saveAddress={saveAddress}
          address={address}
          setAddress={setAddress}
        />
      )} */}

      <CustomModal
        openModal={openSaveAddress}
        handleClose={saveAddressModalClose}
      >
        <SaveAddressModal
          handleAddressModal={handleAddressModal}
          handleClose={saveAddressModalClose}
          dispatch={dispatch}
          data={data}
          allAddress={allAddress}
          handleLatLng={handleLatLng}
          t={t}
          address={address}
          isRefetching={isRefetching}
          refetch={refetch}
          configData={configData}
          setAddress={setAddress}
          openAddressModal={openAddressModal}
        />
      </CustomModal>
    </>
  );
};
export default DeliveryAddress;
