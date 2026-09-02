import React, { useEffect, useState } from "react";
import {
  CustomListItem,
  CustomStackFullWidth,
} from "styled-components/CustomStyles.style";
import Radio from "@mui/material/Radio";
import ListItemText from "@mui/material/ListItemText";
import { IconButton, Typography, useTheme } from "@mui/material";
import { setOpenAddressModal } from "redux/slices/addAddress";
import CreateIcon from "@mui/icons-material/Create";
import { useDispatch, useSelector } from "react-redux";
import { t } from "i18next";
import AddNewAddress from "../../address/add-new-address";

import CustomModal from "../../modal";
import SaveAddressModal from "../item-checkout/SaveAddressModal";
import useGetAddressList from "../../../api-manage/hooks/react-query/address/useGetAddressList";

const CheckOutSelectedAddress = ({
  setAddress,
  address,
  renderOnNavbar,
  configData,
  storeZoneId,
  orderType,
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { openAddressModal } = useSelector((state) => state.addressModel);
  const { profileInfo } = useSelector((state) => state.profileInfo);
  const [allAddress, setAllAddress] = useState([]);
  const [data, setData] = useState(null);
  const [openSaveAddress, setOpenSaveAddress] = useState(false);
  const [editAddress, setEditAddress] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({ lat: 0, lng: 0 });

  // Handle opening address modal for editing
  const handleClick = () => {
    setEditAddress(address);
    dispatch(setOpenAddressModal(true));
  };

  // Function to handle success of address data retrieval
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

  // Assuming `useGetAddressList` hook is defined elsewhere
  const { refetch, isRefetching, isLoading } = useGetAddressList(handleSuccess);

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    if (data) {
      setAllAddress([address, ...data.addresses]);
    }
  }, [data]);

  // Function to handle address update based on geolocation
  const handleLatLng = (values) => {
    if (renderOnNavbar === "true") {
      setAddress({ ...values, lat: values.latitude, lng: values.longitude });
      window.location.reload();
    } else {
      setAddress({ ...values, lat: values.latitude, lng: values.longitude });
    }
  };

  // Save address function
  const saveAddress = () => {
    let formData = {
      address: address?.address,
      address_type: address?.address_type,
      contact_person_name: `${profileInfo?.f_name} ${profileInfo?.l_name}`,
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
    dispatch(setOpenAddressModal(true));
  };

  // Function to get current location using geolocation API
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
        }
      );
    } else {
      // console.error("Geolocation is not supported by this browser.");
    }
  };

  // Handle modal close for saving address
  const saveAddressModalClose = () => {
    setOpenSaveAddress(false);
  };

  return (
    <div>
      <CustomListItem
        border={`1px solid ${theme.palette.primary.main}`}
        alignItems="flex-start"
      >
        <CustomStackFullWidth direction="row" alignItems="flex-start">
          <Radio
            checked
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
            sx={{ marginTop: "14px" }}
          />
          <ListItemText
            primary={
              <Typography
                textTransform="capitalize"
                fontSize="16px"
                fontWeight="600"
              >
                {t(address?.address_type)}
              </Typography>
            }
            secondary={
              <Typography
                sx={{
                  lineHeight: 1.5,   // 👈 yahi tumhe chahiye
                  mt: 0.5
                }}
                fontSize="14px"
                color="text.secondary"
              >
                {address?.address}
              </Typography>
            }
          />

          <Typography
            onClick={() => setOpenSaveAddress(true)}
            sx={{
              cursor: "pointer",
              color: "primary.main",
              fontSize: "14px",
              fontWeight: 600,
              mr: 2,
              "&:hover": {
                textDecoration: "underline",

              },
            }}
          >
            Change
          </Typography>

        </CustomStackFullWidth>
      </CustomListItem>

      <AddNewAddress
        openAddressModal={openAddressModal}
        refetch={refetch}
        t={t}
        configData={configData}
        editAddress={editAddress}
        setEditAddress={setEditAddress}
      />

      <CustomModal openModal={openSaveAddress} handleClose={saveAddressModalClose}>
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
    </div>
  );
};

export default CheckOutSelectedAddress;