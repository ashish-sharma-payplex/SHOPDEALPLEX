import React, { memo, useEffect, useState } from "react";
import {
  Autocomplete,
  Backdrop,
  Button,
  IconButton,
  Modal,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  CustomBoxWrapper,
  LocationView,
  PrimaryButton,
  WrapperCurrentLocationPick,
} from "./map.style";
import { SearchLocationTextField } from "../landing-page/hero-section/HeroSection.style";
import UseCurrentLocation from "./UseCurrentLocation";
import CloseIcon from "@mui/icons-material/Close";
import {
  CustomBoxFullWidth,
  CustomStackFullWidth,
  CustomTypographyGray,
} from "src/styled-components/CustomStyles.style";
import RoomIcon from "@mui/icons-material/Room";
import { useTranslation } from "react-i18next";
import useGetAutocompletePlace from "../../api-manage/hooks/react-query/google-api/usePlaceAutoComplete";
import useGetGeoCode from "../../api-manage/hooks/react-query/google-api/useGetGeoCode";
import useGetZoneId from "../../api-manage/hooks/react-query/google-api/useGetZone";
import useGetPlaceDetails from "../../api-manage/hooks/react-query/google-api/useGetPlaceDetails";
import { useDispatch, useSelector } from "react-redux";
import GoogleMapComponent from "./GoogleMapComponent";
import toast from "react-hot-toast";
import "simplebar-react/dist/simplebar.min.css";
import SimpleBar from "simplebar-react";

import { useRouter } from "next/router";
import { ModuleSelection } from "../landing-page/hero-section/module-selection";
import { useGeolocated } from "react-geolocated";
import { module_select_success } from "src/utils/toasterMessages";
import { FacebookCircularProgress } from "../loading-spinners/FacebookLoading";
import { setWishList } from "src/redux/slices/wishList";
import { useWishListGet } from "src/api-manage/hooks/react-query/wish-list/useWishListGet";
import { getToken } from "src/helper-functions/getToken";
import ModalExtendShrink from "./ModalExtendShrink";
import { getCurrentModuleType } from "helper-functions/getCurrentModuleType";
import { useGetWishList } from "api-manage/hooks/react-query/rental-wishlist/useGetWishlist";


const MapModal = ({
  open,
  handleClose,
  locationLoading,
  toparcel,
  handleLocation,
  disableAutoFocus,
  fromReceiver,
  fromStore,
  selectedLocation,
  onLocationSelected,
}) => {
  const router = useRouter();
  const theme = useTheme();
  const isXSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const { configData } = useSelector((state) => state.configData);
  const { t } = useTranslation();
  const [searchKey, setSearchKey] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [geoLocationEnable, setGeoLocationEnable] = useState(true);
  const [predictions, setPredictions] = useState([]);
  const [placeDetailsEnabled, setPlaceDetailsEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [placeId, setPlaceId] = useState("");
  const [placeDescription, setPlaceDescription] = useState(undefined);
  const [location, setLocation] = useState(
    selectedLocation ? selectedLocation : configData?.default_location
  );
  const { selectedModule } = useSelector((state) => state.utilsData);
  const [zoneId, setZoneId] = useState(undefined);
  const [isLoadingCurrentLocation, setLoadingCurrentLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({});
  const [rerenderMap, setRerenderMap] = useState(false);
  const [zoneIdEnabled, setZoneIdEnabled] = useState(true);
  const [loadingAuto, setLoadingAuto] = useState(false);
  const [isDisablePickButton, setDisablePickButton] = useState(false);
  const [isModalExpand, setIsModalExpand] = useState(false);
  const [currentLocationValue, setCurrentLactionValue] = useState({
    description: null,
  });
  const [openModuleSelection, setOpenModuleSelection] = useState(false);
  const [wasModalOpen, setWasModalOpen] = useState(false);
  const { data: places, isLoading: placesIsLoading } = useGetAutocompletePlace(
    searchKey,
    enabled
  );
  const dispatch = useDispatch();

  const { coords, isGeolocationAvailable, isGeolocationEnabled, getPosition } =
    useGeolocated({
      positionOptions: {
        enableHighAccuracy: false,
      },
      userDecisionTimeout: 5000,
      isGeolocationEnabled: true,
    });

  useEffect(() => {
    if (places) {
      setPredictions(places?.predictions);
    }
  }, [places]);
  const { data: geoCodeResults, refetch: refetchCurrentLocation } =
    useGetGeoCode(location, geoLocationEnable);
  useEffect(() => {
    if (geoCodeResults) {
      setCurrentLactionValue({
        description: geoCodeResults?.results[0]?.formatted_address,
      });
    } else {
      setCurrentLactionValue({
        description: "",
      });
    }
  }, [geoCodeResults]);
  const {
    data: zoneData,
    error: errorLocation,
    isLoading,
  } = useGetZoneId(location, zoneIdEnabled);
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (zoneData) {
        setZoneId(zoneData?.zone_id);
        if (fromReceiver !== "1") {
          localStorage.setItem("zoneid", zoneData?.zone_id);
        }
      }
      if (!zoneData) {
        setZoneId(undefined);
      }
    }
  }, [zoneData]);
  const successHandler = () => {
    setLoadingAuto(false);
  };

  const { isLoading: isLoading2, data: placeDetails } = useGetPlaceDetails(
    placeId,
    placeDetailsEnabled,
    successHandler
  );
  //
  useEffect(() => {
    if (placeDetails) {
      setLocation(placeDetails?.result?.geometry?.location);
    }
  }, [placeDetails]);
  useEffect(() => {
    if (placeDescription) {
      setCurrentLocation(placeDescription);
    }
  }, [placeDescription]);
  useEffect(() => {
    if (coords) {
      setCurrentLocation({
        lat: coords.latitude,
        lng: coords.longitude,
      });
    }
  }, []);

  // Track modal open state
  useEffect(() => {
    if (open) {
      setWasModalOpen(true);
      sessionStorage.setItem('mapModalWasOpen', 'true');
    }
  }, [open]);

  // Handle page refresh detection and toast
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (wasModalOpen || sessionStorage.getItem('mapModalWasOpen') === 'true') {
        sessionStorage.setItem('mapModalClosedByRefresh', 'true');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Check if modal was closed by refresh on component mount
    if (sessionStorage.getItem('mapModalClosedByRefresh') === 'true') {
      toast.error(t('add your location to continue'));
      sessionStorage.removeItem('mapModalClosedByRefresh');
      sessionStorage.removeItem('mapModalWasOpen');
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [wasModalOpen, t]);

  // Handle modal close
  const handleModalClose = () => {
    setWasModalOpen(false);
    sessionStorage.removeItem('mapModalWasOpen');
    window.location.reload();
  };

  const handleLocationSelection = (value) => {
    setPlaceId(value?.place_id);
    setPlaceDescription(value?.description);
  };
  const handleLocationSet = (values) => {
    setLocation(values);
  };


  // get module from localstorage
  const moduleType = getCurrentModuleType();
  const onSuccessHandler = (response) => {
    dispatch(setWishList(response));
  };
  const { refetch: wishlistRefetch } = useWishListGet(onSuccessHandler);
  const { refetch: rentalWishlistRefetch } = useGetWishList(onSuccessHandler);

  const handlePickLocationOnClick = () => {

    if (zoneId && geoCodeResults && location) {
      // Validate that the location is in a valid zone
      if (zoneId && zoneId !== "undefined" && zoneId !== "null") {
        if (getToken()) {
          if (moduleType === "rental") {
            rentalWishlistRefetch();
          } else {
            wishlistRefetch();
          }
        }
        if (fromReceiver !== "1") {
          localStorage.setItem("zoneid", zoneId);
        }
        if (fromReceiver !== "1") {
          localStorage.setItem(
            "location",
            geoCodeResults?.results[0]?.formatted_address
          );
          localStorage.setItem("currentLatLng", JSON.stringify(location));
          window.dispatchEvent(new Event("locationUpdated"));
        } else {
          toast.success(t("New location has been set."));
        }

        if (toparcel === "1") {
          handleLocation(location, geoCodeResults?.results[0]?.formatted_address);
          handleModalClose();
        } else {
          if (fromStore) {
            handleModalClose();
          } else {
            // Instead of opening module selection, close modal and redirect
            handleModalClose();
            router.push("/");
          }
        }
      } else {
        // Location is not in a valid zone
        toast.error(t("Selected location is not in our service area. Please choose a location within our service zone."));
      }
    } else {
      // Missing required data
      toast.error(t("Please select a valid location within our service area."));
    }
    if (onLocationSelected) {
      onLocationSelected();
    }// Call the callback to close the AddressReselectPopover
    handleClose();
  };



  const handleCloseModuleModal = (item) => {
    if (item) {
      toast.success(t(module_select_success));
      router.push("/", undefined, { shallow: true });
    }
    setOpenModuleSelection(false);
    handleModalClose?.();
  };

  return (
    <>
      <Modal
        open={open}
        onClose={(event, reason) => {
          // Only close on explicit close actions, not backdrop clicks
          if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
            return;
          }
          handleModalClose(event, reason);
        }}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
        disableEscapeKeyDown
      >
        <CustomBoxWrapper
          expand={isModalExpand ? "true" : "false"}
          sx={{
            display: openModuleSelection ? "none" : "inherit",
            padding: { xs: "15px", md: "1rem" },  // Reduced padding for better fitting
            borderRadius: isModalExpand ? "0px" : { xs: "8px", md: "15px" },  // Reduced border-radius for a more compact design
            position: "relative",
            maxHeight: '90vh',  // Reduced height to fit within the screen (80% of the viewport height)
            width: '95vw',  // Adjust width to fit better, especially on smaller screens
            overflow: 'hidden',  // Disable scrolling
            backgroundColor: "#ffffff",
          }}
        >
          <IconButton
            onClick={handleModalClose}
            sx={{ position: "absolute", top: 5, right: 8, zIndex: 999 }}
          >
            <CloseIcon sx={{ fontSize: { xs: "18px", md: "24px" } }} />
          </IconButton>
          <CustomStackFullWidth spacing={2}>
            <SimpleBar
              style={{
                maxHeight: "80vh",  // Adjusted max height for content, ensuring button is at the bottom
                paddingRight: "15px",
              }}
            >
              <Typography
                fontSize={{ xs: "14px", md: "1rem", }}
                fontWeight={500}
                mb={1.5}
                color={"#111111"}
              >
                {t("Pick Location")}
              </Typography>
              {/* <Typography
          fontSize={{ xs: "12px", md: "14px" }}
          fontWeight={400}
          color={theme.palette.neutral[500]}
        >
          {t(
            "Sharing your accurate location enhances precision in search results and delivery estimates, ensures effortless order delivery."
          )}
        </Typography> */}
              <CustomStackFullWidth>
                {loadingAuto ? (
                  <Skeleton width="100%" height="25px" variant="rectangular" />
                ) : (

                  <Autocomplete
                    fullWidth
                    freeSolo
                    id="combo-box-demo"
                    getOptionLabel={(option) => option.description}
                    options={predictions}
                    onChange={(event, value) => {
                      if (value) handleLocationSelection(value);
                      setPlaceDetailsEnabled(true);
                    }}
                    clearOnBlur={false}
                    value={currentLocationValue}
                    loading={placesIsLoading}
                    loadingText={t("Search suggestions are loading...")}
                    PaperComponent={({ children }) => (
                      <div style={{ backgroundColor: "#ffffff", color: "#000000" }}>
                        {children}
                      </div>
                    )}
                    renderInput={(params) => (
                      <SearchLocationTextField
                        sx={{
                          borderRadius: "4px",
                          border: "1px solid #ececec", // 🔥 border color
                          backgroundColor: "#ffffff", // white background
                          color: "#000000", // text black
                          "& input": {
                            color: "#000000", // input text black
                          },
                          "& .MuiAutocomplete-endAdornment": {
                            color: "#000000", // icons black if needed
                          },
                        }}
                        frommap="true"
                        label={null}
                        {...params}
                        placeholder={t("Search location")}
                        onChange={(event) => {
                          setSearchKey(event.target.value);
                          setEnabled(!!event.target.value);
                        }}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") setSearchKey(e.target.value);
                        }}
                      />
                    )}
                  />
                )}
              </CustomStackFullWidth>
              <CustomBoxFullWidth
                sx={{
                  mt: 2,
                  color: (theme) => theme.palette.neutral[1000],
                  p: "5px",
                  position: "relative",
                }}
              >
                <LocationView>
                  {geoCodeResults?.results?.length > 0 ? (
                    <>
                      <RoomIcon fontSize="small" color="primary" />
                      <Typography>
                        {geoCodeResults?.results[0]?.formatted_address}
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Skeleton variant="rounded" width={300} height={20} />
                    </>
                  )}
                </LocationView>
                {!!location ? (
                  <GoogleMapComponent
                    setDisablePickButton={setDisablePickButton}
                    setLocationEnabled={setLocationEnabled}
                    setLocation={handleLocationSet}
                    setCurrentLocation={setCurrentLocation}
                    locationLoading={locationLoading}
                    location={location}
                    setPlaceDetailsEnabled={setPlaceDetailsEnabled}
                    placeDetailsEnabled={placeDetailsEnabled}
                    locationEnabled={locationEnabled}
                    setPlaceDescription={setPlaceDescription}
                    isModalExpand={isModalExpand}
                    sx={{
                      height: "100px",  // Reduced map size
                      width: "100%",
                      backgroundColor: "#ffffff",
                    }}
                  />
                ) : (
                  <CustomStackFullWidth
                    alignItems="center"
                    justifyContent="center"
                  >
                    <FacebookCircularProgress />
                    <CustomTypographyGray nodefaultfont="true">
                      {t("Please wait sometimes")}
                    </CustomTypographyGray>
                  </CustomStackFullWidth>
                )}
                <WrapperCurrentLocationPick
                  alignItems="center"
                  isXsmall={isXSmall}
                  spacing={{ xs: 1, md: 2 }}
                >
                  <ModalExtendShrink
                    isModalExpand={isModalExpand}
                    setIsModalExpand={setIsModalExpand}
                    t={t}
                  />
                  <UseCurrentLocation
                    setLoadingCurrentLocation={setLoadingCurrentLocation}
                    setLocationEnabled={setLocationEnabled}
                    setLocation={setLocation}
                    coords={coords}
                    refetchCurrentLocation={refetchCurrentLocation}
                    setRerenderMap={setRerenderMap}
                    isLoadingCurrentLocation={isLoadingCurrentLocation}
                    isGeolocationEnabled={isGeolocationEnabled}
                    fromMapModal={true}
                  />
                </WrapperCurrentLocationPick>
              </CustomBoxFullWidth>
            </SimpleBar>
            <CustomStackFullWidth justifyCenter="center" alignItems="center">
              {errorLocation?.response?.data ? (
                <Button
                  aria-label="picklocation"
                  sx={{
                    flex: "1 0",
                    width: "100%",
                    top: "-3rem",
                  }}
                  disabled={locationLoading}
                  variant="contained"
                  color="error"
                  onClick={() => {
                    if (zoneId) {
                      localStorage.setItem("zoneid", zoneId);
                    }
                    handleModalClose();
                  }}
                >
                  {errorLocation?.response?.data?.errors[0]?.message}
                </Button>
              ) : (
                <PrimaryButton
                  disabled={
                    isLoading ||
                    !geoCodeResults?.results[0]?.formatted_address
                  }
                  variant="contained"
                  onClick={() => handlePickLocationOnClick()}
                  sx={{
                    backgroundColor: '#1A914B',
                    '&:hover': {
                      backgroundColor: '#1A914B',
                    },
                  }}
                >
                  {t("Pick Locationn")}
                </PrimaryButton>
              )}
            </CustomStackFullWidth>
          </CustomStackFullWidth>
        </CustomBoxWrapper>
      </Modal>

      {/* {openModuleSelection && (
        <ModuleSelection
          location={currentLocation}
          closeModal={handleCloseModuleModal}
          disableAutoFocus={disableAutoFocus}
          zoneId={zoneId}
        />
      )} */}
    </>
  );
};

export default memo(MapModal);


