import React, { useEffect, useReducer, useState } from "react";
import {
  Grid,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Autocomplete,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { BackIconButton } from "../../profile/basic-information/BasicInformationForm";
import { t } from "i18next";
import { initialState, reducer } from "../states";
import { useGeolocated } from "react-geolocated";
import useGetAutocompletePlace from "../../../api-manage/hooks/react-query/google-api/usePlaceAutoComplete";
import useGetGeoCode from "../../../api-manage/hooks/react-query/google-api/useGetGeoCode";
import useGetZoneId from "../../../api-manage/hooks/react-query/google-api/useGetZone";
import useGetPlaceDetails from "../../../api-manage/hooks/react-query/google-api/useGetPlaceDetails";
import GoogleMapComponent from "../../Map/GoogleMapComponent";
import CustomMapSearch from "../../Map/CustomMapSearch";
import { Box } from "@mui/system";
import { handleCloseLocation } from "../HelperFunctions";
import {
  AddressTypeStack,
  CustomStackFullWidth,
} from "../../../styled-components/CustomStyles.style";
import CustomImageContainer from "../../CustomImageContainer";
import home from "../../checkout/assets/image 1256.png";
import office from "../assets/office.png";
import plusIcon from "../assets/plus.png";
import AddressForm from "./AddressForm";
import { styled } from "@mui/material/styles";
import { useSelector } from "react-redux";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import ControlPointOutlinedIcon from "@mui/icons-material/ControlPointOutlined";
import AddIcon from '@mui/icons-material/Add';

export const AddAddressSearchBox = styled(Box)(({ theme }) => ({
  width: "100%",
  marginBottom: "10px",
}));

const AddAddressComponent = ({
  setAddAddress,
  editAddress,
  userData,
  addressRefetch,
  setEditAddress,
}) => {
  const theme = useTheme();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [addressType, setAddressType] = useState(
    editAddress ? editAddress?.address_type : ""
  );
  const { configData } = useSelector((state) => state.configData);
  const [isDisablePickButton, setDisablePickButton] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [location, setLocation] = useState(
    configData?.default_location || { lat: 40.7128, lng: -74.0060 }
  );
  const [searchKey, setSearchKey] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [placeDetailsEnabled, setPlaceDetailsEnabled] = useState(true);
  const [placeDescription, setPlaceDescription] = useState(undefined);
  const [predictions, setPredictions] = useState([]);
  const [placeId, setPlaceId] = useState("");
  const [currentLocation, setCurrentLocation] = useState(undefined);
  const [showCurrentLocation, setShowCurrentLocation] = useState(false);
  const [geoLocationEnable, setGeoLocationEnable] = useState(false);
  const [zoneIdEnabled, setZoneIdEnabled] = useState(false);

  const { coords, isGeolocationAvailable, isGeolocationEnabled, getPosition } =
    useGeolocated({
      positionOptions: {
        enableHighAccuracy: false,
      },
      userDecisionTimeout: 5000,
      isGeolocationEnabled: true,
    });

  const { data: places, isLoading } = useGetAutocompletePlace(
    searchKey,
    enabled
  );

  useEffect(() => {
    if (places) {
      setPredictions(places?.predictions);
    }
  }, [places]);

  const { data: zoneData } = useGetZoneId(location, zoneIdEnabled);
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (zoneData) {
        localStorage.setItem("zoneid", zoneData?.zone_id);
      }
    }
  }, [zoneData]);

  const { isLoading: isLoading2, data: placeDetails } = useGetPlaceDetails(
    placeId,
    placeDetailsEnabled
  );

  useEffect(() => {
    if (placeDetails) {
      setLocation(placeDetails?.result?.geometry?.location);
      setLocationEnabled(true);
    }
  }, [placeDetails]);

  const { data: geoCodeResults, isFetching: isFetchingGeoCode } =
    useGetGeoCode(location, geoLocationEnable);

  useEffect(() => {
    if (geoCodeResults?.results && showCurrentLocation) {
      setCurrentLocation(geoCodeResults?.results[0]?.formatted_address);
    }
  }, [geoCodeResults, location]);

  const handleClick = (name) => {
    setAddressType(name);
    setEditAddress({ ...editAddress, address_type: null });
  };

  const handleChangeForSearchs = (event) => {
    if (event.target.value) {
      setSearchKey(event.target.value);
      setEnabled(true);
      setPlaceDetailsEnabled(true);
    }
  };

  const handleChangeS = (event, value) => {
    if (value) {
      setPlaceId(value?.place_id);
    }
    setPlaceDetailsEnabled(true);
  };

  const handleUseCurrentLocation  = async () => {
    if (!coords) {
      await getPosition(); // browser se coords fetch kare
    }

    if (coords) {
      setLocation({ lat: coords.latitude, lng: coords.longitude });
      setLocationEnabled(true);  // ✅ map render ke liye
      setShowCurrentLocation(true);
      setGeoLocationEnable(true);
      setZoneIdEnabled(true);
    }
  };

  return (
    <Box>
      {/* Main Bordered Container as per Image 1 & 3 */}
      <Box
        sx={{
          borderRadius: "12px",
          p: { xs: 3, md: 0 },
          // backgroundColor: "#fff",
          position: "relative",
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <IconButton onClick={() => setAddAddress(false)} sx={{ p: 0 }}>
                  <ArrowBackIosNewIcon sx={{ fontSize: "16px", color: "text.primary" }} />
                </IconButton>
                <Typography variant="subtitle1" fontWeight="700">
                  {editAddress ? t("Edit Personal Details") : t("Add Address")}
                </Typography>
              </Stack>
            </Stack>
          </Grid>

          {/* Map and Search Section */}
          <Grid item xs={12} md={6}>
            <AddAddressSearchBox>
              <CustomMapSearch
                predictions={predictions}
                handleChange={(event, value) => handleChangeS(event, value, dispatch)}
                HandleChangeForSearch={(event) => handleChangeForSearchs(event, dispatch)}
                handleAgreeLocation={handleUseCurrentLocation}
                currentLocation={currentLocation}
                handleCloseLocation={() => handleCloseLocation(dispatch)}
              />
            </AddAddressSearchBox>
            
            <Box sx={{ position: "relative", borderRadius: "12px", overflow: "hidden", border: "1px solid #E2E8F0" }}>
              {locationEnabled && location && (
                <GoogleMapComponent
                  setLocation={setLocation}
                  location={location}
                  setPlaceDetailsEnabled={setPlaceDetailsEnabled}
                  placeDetailsEnabled={placeDetailsEnabled}
                  locationEnabled={locationEnabled}
                  setPlaceDescription={setPlaceDescription}
                  setLocationEnabled={setLocationEnabled}
                  setDisablePickButton={setDisablePickButton}
                  height="300px"
                />
              )}
              <Button
                onClick={handleUseCurrentLocation}
                variant="contained"
                startIcon={<GpsFixedIcon />}
                sx={{
                  position: "absolute",
                  bottom: "16px",
                  left: "16px",
                  backgroundColor: "white",
                  color: "primary.main",
                  fontWeight: "600",
                  textTransform: "none",
                  "&:hover": { backgroundColor: "#f8f9fa" }
                }}
              >
                {t("Use Current Location")}
              </Button>
            </Box>
          </Grid>

          {/* Form and Details Section */}
          <Grid item xs={12} md={6}>
            <CustomStackFullWidth spacing={2}>
              <Box>
                <Typography variant="body2" fontWeight="600" mb={1}>{t("Search Address")}</Typography>
                <Autocomplete
                  freeSolo
                  disableClearable
                  options={predictions || []}
                  getOptionLabel={(option) => option.description || ""}
                  inputValue={searchKey}
                  onInputChange={(event, newInputValue) => {
                    setSearchKey(newInputValue);
                    setEnabled(!!newInputValue);
                  }}
                  onChange={(event, value) => {
                    if (value) {
                      setPlaceId(value.place_id);
                      setPlaceDetailsEnabled(true);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      size="small"
                      placeholder={t("Enter address here")}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
                        ),
                      }}
                      sx={{ backgroundColor: "#F8FAFC" }}
                    />
                  )}
                />
              </Box>

              <Box>
                <Typography variant="body2" fontWeight="600" mb={1}>{t("Label As")}</Typography>
                <Stack direction="row" spacing={2.5}>
                  {[ 
                    { type: "home", img: home, label: "Home" },
                    { type: "office", img: office, label: "Office" },
                    { type: "other", img: plusIcon, label: "Others" }
                  ].map((item) => (
                    <Stack key={item.type} alignItems="center" spacing={0.5}>
                      <AddressTypeStack
                        value={item.type}
                        addressType={editAddress?.address_type || addressType}
                        onClick={() => handleClick(item.type)}
                        sx={{
                          border: (editAddress?.address_type || addressType) === item.type ? "2px solid" : "1px solid #E2E8F0",
                          borderColor: (editAddress?.address_type || addressType) === item.type ? "primary.main" : "#E2E8F0",
                          p: 1,
                          borderRadius: "8px"
                        }}
                      >
                        <CustomImageContainer src={item.img.src} width="24px" height="24px" />
                      </AddressTypeStack>
                      <Typography variant="caption" fontWeight="500">{item.label}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>

              <AddressForm
                deliveryAddress={geoCodeResults?.results[0]?.formatted_address}
                atModal="false"
                addressType={addressType}
                configData={configData}
                phone={editAddress ? editAddress?.phone : userData?.phone}
                email={editAddress ? editAddress?.email : userData?.email}
                lat={location?.lat || ""}
                lng={location?.lng || ""}
                personName={editAddress ? editAddress?.contact_person_name : userData && `${userData?.f_name} ${userData?.l_name}`}
                editAddress={editAddress}
                setAddAddress={setAddAddress}
                refetch={addressRefetch}
                setAddressType={setAddressType}
              />
            </CustomStackFullWidth>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AddAddressComponent;