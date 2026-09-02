// src\components\home\module-wise-components\rental\components\global\CarBookingModal.jsx
import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Grid,
  useTheme,
  Box,
  alpha,
  useMediaQuery,
  IconButton,
  Typography,
  Stack,
} from "@mui/material";
import useGetAutocompletePlace from "api-manage/hooks/react-query/google-api/usePlaceAutoComplete";
import useGetPlaceDetails from "api-manage/hooks/react-query/google-api/useGetPlaceDetails";
import useGetGeoCode from "api-manage/hooks/react-query/google-api/useGetGeoCode";
import RoomIcon from "@mui/icons-material/Room";
import NearMeOutlinedIcon from "@mui/icons-material/NearMeOutlined";
import {
  CustomStackFullWidth,
  CustomTextField,
} from "styled-components/CustomStyles.style";
import RentalSearchLocation from "components/home/module-wise-components/rental/components/global/search/RentalSearchLocation";
import RentalMap from "components/home/module-wise-components/rental/components/global/RentalMap";
import CustomModal from "components/custom-component/CustomModal";
import DateTimePicker from "components/home/module-wise-components/rental/components/global/DateTimePicker";
import { PrimaryButton } from "components/Map/map.style";
import { t } from "i18next";
import TripTypeSelector from "components/home/module-wise-components/rental/components/global/TripTypeSelector";
import useConfirmBooking from "components/home/module-wise-components/rental/rental-api-manage/hooks/react-query/confirm-booking/useConfirmBooking";
import { onErrorResponse } from "api-manage/api-error-response/ErrorResponses";
import { toast } from "react-hot-toast";
import { setCartList } from "redux/slices/cart";
import useGetDistance from "api-manage/hooks/react-query/google-api/useGetDistance";
import usePostLocationUpdate from "components/home/module-wise-components/rental/rental-api-manage/hooks/react-query/confirm-booking/usePostLocationUpdate";
import CloseIcon from "@mui/icons-material/Close";
import {
  bookingConfirm,
  formattedDate,
} from "components/home/module-wise-components/rental/components/global/search/searchHepler";
import dayjs from "dayjs";
import LoadingButton from "@mui/lab/LoadingButton";
import useGetZoneList from "api-manage/hooks/react-query/zone-list/zone-list";
import { getGuestId, getToken } from "helper-functions/getToken";
import { useGeolocated } from "react-geolocated";
import ProviderCheck from "components/home/module-wise-components/rental/components/global/ProviderCheck";
import { isCurrentTime } from "../rental-checkout/checkoutHeplerFunction";
import useGetZoneId from "api-manage/hooks/react-query/google-api/useGetZone";
import useDeleteAllCarts from "../../../../../../api-manage/hooks/react-query/useDeleteAllCarts";
import { useRouter } from "next/router";
import { setModalFor, setSignInModalOpen } from "redux/slices/utils";

import Link from "next/link";
import useGetBookingList from "api-manage/hooks/react-query/useGetBookingList";
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 280,
    },
  },
};

export const calculateDestination = (pickup) => {
  const metersToDegreesLat = 100 / 111111; // Convert 100 meters to latitude degrees
  const metersToDegreesLng =
    100 / (111111 * Math.cos((parseFloat(pickup.lat) * Math.PI) / 180)); // Adjust for longitude at the given latitude

  return {
    lat: parseFloat(pickup.lat) + metersToDegreesLat, // Move 100m north
    lng: parseFloat(pickup.lng) + metersToDegreesLng, // Move 100m east
  };
};

export function isPointInPolygon(point, polygon) {
  const { lat, lng } = point;
  const coordinates = polygon.coordinates[0]; // Outer ring of the polygon
  let intersects = 0;

  for (let i = 0; i < coordinates.length - 1; i++) {
    const x1 = coordinates[i][1];
    const y1 = coordinates[i][0];
    const x2 = coordinates[i + 1][1];
    const y2 = coordinates[i + 1][0];

    // Check if the ray intersects with the edge
    if (
      lng > Math.min(y1, y2) &&
      lng <= Math.max(y1, y2) &&
      lat <= Math.max(x1, x2) &&
      y1 !== y2
    ) {
      const xinters = ((lng - y1) * (x2 - x1)) / (y2 - y1) + x1;
      if (x1 === x2 || lat <= xinters) {
        intersects++;
      }
    }
  }

  return intersects % 2 !== 0;
}

const noShadowToast = {
  style: { boxShadow: "none" },
};

const CarBookingModal = ({
  open,
  handleClose,
  id,
  update,
  fromCard,
  setOpenTripChange,
  setIds,
  setUpdateCartObject,
  selectedPricing,
  handleProviderCheck,
  setCartItemData,
  isDifferentProvider,
  isHourly,
  isDistence,
  card,
  setIsSameOpen,
  cartData,
  callUpdateUserData,
}) => {
  const mode = "driving";
  const theme = useTheme();
  const router = useRouter();
  const checkoutLinkRef = useRef(null);
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useDispatch();
  const { cartList: reduxCartList } = useSelector((state) => state.cart);
  const normalizedRedux = Array.isArray(reduxCartList) ? reduxCartList[0] : reduxCartList;
  const token = getToken();
  // ✅ Priority: cartData prop > API fetched > redux
  const { data: bookingListData } = useGetBookingList(token);
  const fetchedCart = Array.isArray(bookingListData) ? bookingListData[0] : bookingListData;
  const cartList = cartData || fetchedCart || normalizedRedux;

  const rentalSearch = useSelector((state) => state?.rentalSearch?.rentalSearch);

  const { configData } = useSelector((state) => state.configData);
  const [locations, setLocations] = useState({
    pickup: {
      lat: JSON.parse(configData?.default_location?.lat),
      lng: JSON.parse(configData?.default_location?.lng),
    },
    // destination: calculateDestination(configData?.default_location),
    destination: null,
  });



  // ✅ Yeh add karo — same hook jo TaxiView use karta hai
  const guestId = getGuestId();







  const [dateValue, setDateValue] = useState(dayjs);
  const [durationValue, setDurationValue] = useState();
  const [searchKey1, setSearchKey1] = useState(""); // For Pickup
  const [predictions1, setPredictions1] = useState([]);
  const [placeId1, setPlaceId1] = useState("");
  const [searchKey2, setSearchKey2] = useState(""); // For Destination
  const [predictions2, setPredictions2] = useState([]);
  const [placeId2, setPlaceId2] = useState("");
  const [tripType, setTripType] = useState(
    isDistence ? "distance_wise" : "hourly",
  );
  const [isFocused, setIsFocused] = useState(false);
  const [focusedField, setFocusedField] = useState("pickup");
  const [sameProviderOpen, setSameProviderOpen] = useState(false);
  const [pickupError, setPickupError] = useState("");
  const [destinationError, setDestinationError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null);
  // API Hooks
  const { data: places1 } = useGetAutocompletePlace(searchKey1, !!searchKey1);
  const { data: places2 } = useGetAutocompletePlace(searchKey2, !!searchKey2);
  const { data: placeDetails1 } = useGetPlaceDetails(placeId1, !!placeId1);
  const { data: placeDetails2 } = useGetPlaceDetails(placeId2, !!placeId2);
  const { data: geoCodeData, isFetching: isFetchingGeoCode } = useGetGeoCode(
    locations[focusedField],
  );
  const {
    data: zoneData,
    error: errorLocation,
    isLoading: zoneLoading,
  } = useGetZoneId(locations?.pickup, true);

  const { mutate } = useDeleteAllCarts();
  const { mutate: confirmMutate, isLoading } = useConfirmBooking();
  const { mutate: userDataUpdateMutate, isLoading: userDataIsLoading } =
    usePostLocationUpdate();
  const { data, refetch } = useGetDistance(
    locations?.pickup,
    locations?.destination,
    mode,
  );

  const distanceValue = data?.rows?.[0]?.elements?.[0]?.distance?.value;

  const {
    data: zoneList,
    isLoading: zoneListLoading,
    refetch: zoneListRefetch,
  } = useGetZoneList();

  const { coords } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: false,
    },
    userDecisionTimeout: 5000,
    isGeolocationEnabled: true,
  });

  let currentLocation = undefined;
  if (typeof window !== "undefined") {
    currentLocation = JSON.parse(localStorage.getItem("currentLatLng"));
  }
  useEffect(() => {
    if (currentLocation) {
      setLocations((prv) => ({
        ...prv,
        pickup: {
          lat: JSON.parse(currentLocation?.lat),
          lng: JSON.parse(currentLocation?.lng),
        },
      }));
    }
  }, []);

  useEffect(() => {
    zoneListRefetch();
  }, []);

  const result = zoneList?.some((zone) =>
    isPointInPolygon(locations?.pickup, zone.coordinates),
  );
  useEffect(() => {
    if (result === false && zoneList) {
      toast.error("Pickup location is not in the service area", noShadowToast);
    }
  }, [result, locations?.pickup]);

  useEffect(() => {
    refetch();
  }, [locations?.pickup, locations?.destination]);
  const isProductExist = () =>
    cartList?.carts?.find((item) => item.vehicle?.id === id);

  useEffect(() => {
    if (selectedPricing) {
      setTripType(selectedPricing);
    }
    if ((update && cartList?.carts?.length > 0) || fromCard) {
      // ✅ YEH SAB EXISTING CODE — TOUCH NAHI KIYA
      setSearchKey1(
        cartList?.user_data?.pickup_location?.location_name ||
        cartList?.pickup_location?.location_name,
      );
      setSearchKey2(
        cartList?.user_data?.destination_location?.location_name ||
        cartList?.destination_location?.location_name,
      );
      setLocations({
        pickup: {
          lat: JSON.parse(cartList?.user_data?.pickup_location?.lat),
          lng: JSON.parse(cartList?.user_data?.pickup_location?.lng),
        },
        destination: {
          lat: JSON.parse(cartList?.user_data?.destination_location?.lat),
          lng: JSON.parse(cartList?.user_data?.destination_location?.lng),
        },
      });
      setDateValue(
        isCurrentTime(cartList) ? cartList?.user_data?.pickup_time : new Date(),
      );
      const rentalType = cartList?.user_data?.rental_type;
      setTripType(
        update
          ? rentalType
          : rentalType
            ? rentalType === "distance_wise" && isDistence
              ? "distance_wise"
              : rentalType === "hourly" && isHourly
                ? "hourly"
                : isDistence
                  ? "distance_wise"
                  : "hourly"
            : isDistence
              ? "distance_wise"
              : "hourly",
      );
      setDurationValue(cartList?.user_data?.estimated_hours || 1);

    } else if (!update && !fromCard && rentalSearch?.destination_location) {
      // ✅ SIRF YEH NAYA BLOCK ADD KIYA — TaxiSearchPanel wala destination autofill
      const dest = rentalSearch.destination_location;
      if (dest?.location_name) {
        setSearchKey2(dest.location_name);
      }
      if (dest?.lat && dest?.lng) {
        setLocations((prev) => ({
          ...prev,
          destination: {
            lat: dest.lat,
            lng: dest.lng,
          },
        }));
      }
    }

  }, [update, cartList?.user_data, selectedPricing]);

  const bookingDetails = {
    id,
    locations,
    searchKey1,
    searchKey2,
    tripType,
    durationValue,
    dateValue,
    data,
  };



  const addToCart = async () => {
    if (!zoneData?.zone_id || zoneData?.zone_id.length === 0) {
      toast.error("Please first select zone to continue", noShadowToast);
      return;
    }

    const token = getToken();

    if (!token) {
      toast.error("Please log in to continue.", noShadowToast);
      setTimeout(() => {
        dispatch(setModalFor("sign-in"));
        dispatch(setSignInModalOpen(true));
      }, 1000);
      return;
    }

    if (!locations?.pickup?.lat || !locations?.pickup?.lng) {
      toast.error("Please select a valid pickup location", noShadowToast);
      return;
    }

    if (!locations?.destination?.lat || !locations?.destination?.lng) {
      toast.error("Please select a valid destination location", noShadowToast);
      return;
    }

    if (
      locations?.pickup?.lat === locations?.destination?.lat &&
      locations?.pickup?.lng === locations?.destination?.lng
    ) {
      toast.error("Pickup and destination cannot be the same", noShadowToast);
      return;
    }

    if (!tripType) {
      toast.error("Please select a trip type", noShadowToast);
      return;
    }

    if (tripType === "distance_wise" && !distanceValue) {
      toast.error("Calculating distance, please wait...", noShadowToast);
      return;
    }

    if (!dateValue) {
      toast.error("Please select a pickup date and time", noShadowToast);
      return;
    }

    if (tripType === "hourly" && (!durationValue || durationValue <= 0)) {
      toast.error("Please enter a valid trip duration", noShadowToast);
      return;
    }

    const existingRentalType =
      cartList?.carts?.[0]?.rental_type ||
      cartList?.carts?.[0]?.vehicle?.rental_type ||
      cartList?.user_data?.rental_type;

    const existingDestination =
      cartList?.user_data?.destination_location?.location_name;

    const isDestinationChanged =
      cartList?.carts?.length > 0 &&
      existingDestination?.trim() &&
      searchKey2?.trim() &&
      existingDestination.trim() !== searchKey2.trim();

    const isTripTypeChanged =
      cartList?.carts?.length > 0 &&
      !!existingRentalType &&
      tripType !== existingRentalType;

    if (isDestinationChanged) {
      setPendingBooking({
        id,
        locations,
        searchKey1,
        searchKey2,
        tripType,
        durationValue,
        dateValue,
        data,
        pendingTripTypeChange: isTripTypeChanged,
      });
      setConfirmOpen(true);
      return;
    }

    if (isTripTypeChanged) {
      setUpdateCartObject?.({
        ...bookingDetails,
        userId: cartList?.user_data?.id,
        id,
      });
      setIsSameOpen?.(true);
      handleClose?.();
      return;
    }

    if (cartList?.carts?.length > 0 && isDifferentProvider) {
      setCartItemData?.(bookingDetails);
      handleProviderCheck?.(true);
      handleClose();
      return;
    }

    try {
      await bookingConfirm({
        ...bookingDetails,
        confirmMutate,
        dispatch,
        setCartList,
        toast,
        handleClose,
        onErrorResponse: (error) => {
          if (error.response?.data?.errors?.length > 0) {
            toast.error(error.response.data.errors[0].message, noShadowToast);
          } else if (error.response?.status === 403) {
            toast.error("Session expired. Please login again.", noShadowToast);
          } else {
            toast.success("Vehicle added to the cart successfully!", noShadowToast);
            handleClose?.();
          }
        },
      });

      setTimeout(() => {
        window.dispatchEvent(new Event("REFRESH_RENTAL_CART"));
      }, 600);
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.", noShadowToast);
      router.push("/payment-failure");
    }
  };


  useEffect(() => {
    // console.log("🚕 cartData changed:", cartData);
    // console.log("🚕 destination:", cartData?.user_data?.destination_location?.location_name);
  }, [cartData]); // cartData change hone pe dobara chalega


  // console.log("🔥 cartData on render:", cartData);
  // console.log("🔥 destination:", cartData?.user_data?.destination_location?.location_name)

  const updateUserData = () => {
    if (!cartList?.carts?.length) {
      toast.error("Cart data not found", noShadowToast);
      return;
    }

    const pickupZoneIds = cartList?.carts?.[0]?.provider?.pickup_zone_id;
    let targetZoneIds = [];

    if (Array.isArray(zoneData?.zone_id)) {
      targetZoneIds = zoneData.zone_id;
    } else if (zoneData?.zone_id) {
      try {
        targetZoneIds = JSON.parse(zoneData.zone_id);
      } catch {
        targetZoneIds = [];
      }
    }

    const inZone = targetZoneIds.some((id) =>
      pickupZoneIds?.includes(id.toString()),
    );
    if (inZone) {
      const updateObject = {
        userId: cartList?.user_data?.id,
        pickup_location: { ...locations?.pickup, location_name: searchKey1 },
        destination_location: {
          ...locations?.destination,
          location_name: searchKey2,
        },
        rental_type: tripType,
        estimated_hours: durationValue,
        pickup_time: formattedDate(dateValue),
        destination_time: Math.floor(
          data?.rows?.[0]?.elements[0]?.duration?.value / (60 * 60),
        ),
        distance: data?.rows?.[0]?.elements[0]?.distance?.value / 1000,
        guest_id: getToken() ? null : getGuestId(),
      };

      userDataUpdateMutate(updateObject, {
        onSuccess: (res) => {
          dispatch(setCartList(res));

          // 🔥 TaxiView ko refresh trigger
          setTimeout(() => {
            window.dispatchEvent(new Event("REFRESH_RENTAL_CART"));
          }, 600);

          toast.success("Update successfully!", noShadowToast);
          handleClose();
        },

        onError: (error) => {
          if (error.response.data?.length > 0) {
            setIds?.(error.response.data);
            setUpdateCartObject?.(updateObject);
            setOpenTripChange?.(true);
            handleClose();
          } else {
            onErrorResponse(error);
          }
        },
      });
    } else {
      //toast.error(t("Your cart has been cleared as the selected zone does not support the previous pickup point."));
      mutate(null, {
        onSuccess: (res) => {
          toast.error(
            t(
              "Your cart has been cleared as the selected zone does not support the previous pickup point.", noShadowToast
            ),
          );
          dispatch(setCartList(res));
          handleClose();
          //router.push("/home");
          //handleClose()
        },
        onError: (error) => {
          toast.error(error.response.data.message, noShadowToast);
        },
      });
    }
  };

  // Update geoCodeResults for the current field
  useEffect(() => {
    if (geoCodeData) {
      if (focusedField === "pickup") {
        setSearchKey1(geoCodeData.results[0]?.formatted_address);
      } else {
        setSearchKey2(geoCodeData.results[0]?.formatted_address);
      }
    }
  }, [geoCodeData]);

  // Update predictions when autocomplete data changes
  useEffect(() => {
    if (places1) setPredictions1(places1.predictions);
    if (places2) setPredictions2(places2.predictions);
  }, [places1, places2]);

  // Update locations when place details change
  useEffect(() => {
    if (placeDetails1?.result) {

      const country = placeDetails1.result.address_components.find(
        (item) => item.types.includes("country")
      );

      if (country?.short_name !== "IN") {
        setPickupError("Service is only available in India");
        return;
      } else {
        setPickupError("");
      }

      setLocations((prev) => ({
        ...prev,
        pickup: {
          lat: placeDetails1.result.geometry.location.lat,
          lng: placeDetails1.result.geometry.location.lng,
        },
      }));
    }
  }, [placeDetails1]);


  useEffect(() => {
    if (placeDetails2?.result) {

      const country = placeDetails2?.result?.address_components?.find(
        (item) => item.types.includes("country")
      );

      if (country?.short_name !== "IN") {
        setDestinationError("Service is only available in India");
        return;
      }

      const newDestination = {
        lat: placeDetails2.result.geometry.location.lat,
        lng: placeDetails2.result.geometry.location.lng,
      };

      // ⭐ pickup and destination same check
      if (
        locations?.pickup?.lat === newDestination.lat &&
        locations?.pickup?.lng === newDestination.lng
      ) {
        setDestinationError("Pickup and destination cannot be the same");
        return;
      }

      setDestinationError("");

      setLocations((prev) => ({
        ...prev,
        destination: newDestination,
      }));
    }
  }, [placeDetails2]);

  const handleSearchChange1 = (event) => setSearchKey1(event.target.value);
  const handleSearchChange2 = (event) => setSearchKey2(event.target.value);

  const handleMarkerDragEnd = async (type, newLocation) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${newLocation.lat},${newLocation.lng}&key=YOUR_API_KEY`
      );
      const data = await res.json();

      const country = data?.results?.[0]?.address_components?.find((item) =>
        item.types.includes("country")
      );

      if (country?.short_name !== "IN") {
        toast.error("Service is only available in India", noShadowToast);
        return;
      }

      if (type === "pickup") {
        if (
          locations?.destination?.lat === newLocation.lat &&
          locations?.destination?.lng === newLocation.lng
        ) {
          setPickupError("Pickup and destination cannot be the same");
          return;
        }
        setPickupError("");
        setLocations((prev) => ({
          ...prev,
          pickup: newLocation,
        }));
      } else {
        if (
          locations?.pickup?.lat === newLocation.lat &&
          locations?.pickup?.lng === newLocation.lng
        ) {
          setDestinationError("Pickup and destination cannot be the same");
          return;
        }
        setDestinationError("");
        setLocations((prev) => ({
          ...prev,
          destination: newLocation,
        }));
      }
    } catch (error) {
      // console.error("Geo validation failed", error);
    }
  };

  const handleLocationChange = (field, value) => {
    if (value) {
      if (field === "pickup") {
        setPlaceId1(value.place_id);
      } else if (field === "destination") {
        setPlaceId2(value.place_id);
      }
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    setFocusedField("destination");
  };
  const pickLocationFormAddress = (value) => {
    setLocations((prev) => ({
      ...prev,
      destination: {
        lat: JSON.parse(value.latitude),
        lng: JSON.parse(value.longitude),
      },
    }));
    setSearchKey2(value?.address);
  };

  const handleDateChange = (newValue) => {
    setDateValue(newValue?.$d);
  };

  return (
    <>
      <CustomModal openModal={open} setModalOpen={handleClose}>
        <IconButton
          onClick={() => handleClose()}
          sx={{ position: "absolute", top: 0, right: 0 }}
        >
          <CloseIcon sx={{ fontSize: "16px" }} />
        </IconButton>
        <Box
          sx={{
            padding: "1.5rem",
            backgroundColor: theme.palette.neutral[100],
            borderRadius: "10px",
            width: { xs: "350px", sm: "650px", md: "1000px" },
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <Grid container spacing={2} sx={{ flexGrow: 1 }}>
            <Grid item xs={12} sm={12} md={4}>
              <CustomStackFullWidth spacing={3} sx={{ flexGrow: 1 }}>
                {/* Pickup Location Field */}
                <RentalSearchLocation
                  predictions={predictions1}
                  handleChange={(event, value) =>
                    handleLocationChange("pickup", value)
                  }
                  HandleChangeForSearch={handleSearchChange1}
                  label={t("Pickup Location")}
                  onFocus={() => setFocusedField("pickup")}
                  value={{ description: searchKey1 }}
                  focusedField={focusedField}
                  error={Boolean(pickupError)}
                  helperText={pickupError}
                  endIcon={
                    <RoomIcon
                      sx={{
                        color: (theme) =>
                          alpha(theme.palette.neutral[400], 0.5),
                      }}
                    />
                  }
                  isFocused={isFocused}
                />


                {/* Destination Field */}
                <RentalSearchLocation
                  getCurrentLocation={(value) =>
                    setLocations?.((prev) => ({
                      ...prev,
                      destination: {
                        lat: value.latitude,
                        lng: value.longitude,
                      },
                    }))
                  }
                  result={result}
                  predictions={predictions2}
                  handleChange={(event, value) =>
                    handleLocationChange("destination", value)
                  }
                  pickLocationFormAddress={pickLocationFormAddress}
                  HandleChangeForSearch={handleSearchChange2}
                  label={t("Destination")}
                  onFocus={handleFocus}
                  disabled={!locations.pickup}
                  value={{ description: searchKey2 }}
                  isFocused={isFocused}
                  focusedField={focusedField}
                  error={Boolean(destinationError)}
                  helperText={destinationError}
                  endIcon={
                    <NearMeOutlinedIcon
                      sx={{
                        color: (theme) =>
                          alpha(theme.palette.neutral[400], 0.5),
                      }}
                    />

                  }

                />

                <DateTimePicker
                  height="45px"
                  handleDateChange={handleDateChange}
                  value={dayjs(dateValue)}
                />
                <TripTypeSelector
                  setDurationValue={setDurationValue}
                  durationValue={durationValue}
                  value={tripType}
                  setValue={setTripType}
                  isHourly={isHourly}
                  isDistence={isDistence}
                  card={card}
                  update={update}
                />

                {(tripType === "hourly" && isHourly) ||
                  (tripType === "hourly" && update) ? (
                  <CustomTextField
                    value={durationValue}
                    sx={{ marginTop: "10px" }}
                    label={t("Trip Duration (hrs)")}
                    type="number"
                    onChange={(event) => {
                      let value = event.target.value;

                      // Ensure only valid numeric input
                      if (value === "" || /^(\d+(\.\d{0,1})?)$/.test(value)) {
                        setDurationValue(value);
                      }
                    }}
                    inputProps={{
                      min: 0.5,
                      step: 0.5,
                    }}
                  />
                ) : null}
              </CustomStackFullWidth>

              <CustomStackFullWidth
                sx={{
                  marginTop: tripType === "hourly" ? "26px" : "88px",
                  display: { xs: "none", sm: "none", md: "block" },
                }}
              >
                {update ? (
                  <LoadingButton
                    sx={{ width: "100%" }}
                    variant="contained"
                    onClick={updateUserData}
                    loading={userDataIsLoading}
                  >
                    {t("Update")}
                  </LoadingButton>
                ) : (
                  <>
                    <LoadingButton
                      sx={{ width: "100%", backgroundColor: "#1A914B" }}
                      variant="contained"
                      onClick={addToCart}
                      loading={isLoading}
                      disabled={tripType === "distance_wise" && !distanceValue}
                    >
                      {t("Add to Cart")}
                    </LoadingButton>
                  </>
                )}
              </CustomStackFullWidth>
            </Grid>
            {/* Right section for the map */}
            <Grid item xs={12} sm={12} md={8}>
              <RentalMap
                location={locations[focusedField]}
                height={
                  isSmall ? "250px" : tripType === "hourly" ? "400px" : "380px"
                }
                onMarkerDragEnd={handleMarkerDragEnd}
                locations={locations}
                focusedField={focusedField}
                setFocusedField={setFocusedField}
                result={result}
                zoneList={zoneList}
              />
              <CustomStackFullWidth
                sx={{
                  display: { xs: "block", sm: "block", md: "none" },
                  marginTop: "10px",
                }}
              >
                {update ? (
                  <PrimaryButton
                    onClick={updateUserData}
                    loading={userDataIsLoading}
                  >
                    {t("Update")}
                  </PrimaryButton>
                ) : (
                  <PrimaryButton onClick={addToCart} loading={isLoading}>
                    {t("Add to Cart")}
                  </PrimaryButton>
                )}
              </CustomStackFullWidth>
            </Grid>
          </Grid>
        </Box>
      </CustomModal>
      <CustomModal openModal={confirmOpen} setModalOpen={setConfirmOpen}>
        <Box
          sx={{
            padding: "20px",
            borderRadius: "12px",
            backgroundColor: "white",
            textAlign: "center",
            width: "300px",
            margin: "auto",
          }}
        >
          <Typography fontWeight="600" mb={2}>
            Change Destination?
          </Typography>

          <Typography fontSize="14px" mb={3} color="text.secondary">
            New destination address will be applicable to all vehicles.
          </Typography>

          <Stack direction="row" spacing={2} justifyContent="center">
            <Box
              sx={{
                px: 2,
                py: 1,
                borderRadius: "6px",
                border: "1px solid #ccc",
                cursor: "pointer",
              }}
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </Box>

            <Box
              sx={{
                px: 2,
                py: 1,
                borderRadius: "6px",
                backgroundColor: theme.palette.primary.main,
                color: "#fff",
                cursor: "pointer",
              }}
              // ✅ BAAD MEIN
              onClick={async () => {
                setConfirmOpen(false);
                if (!pendingBooking) return;

                // ✅ If trip type ALSO changed, chain that popup next
                if (pendingBooking.pendingTripTypeChange) {
                  setUpdateCartObject?.({
                    ...pendingBooking,
                    userId: cartList?.user_data?.id,
                    id: pendingBooking.id,
                  });
                  setIsSameOpen?.(true);
                  handleClose?.();
                  return;
                }

                // ✅ Only destination changed — proceed with booking
                await bookingConfirm({
                  ...pendingBooking,
                  confirmMutate,
                  dispatch,
                  setCartList,
                  toast,
                  handleClose,
                });
              }}
            >
              Continue
            </Box>
          </Stack>
        </Box>
      </CustomModal>
    </>
  );
};

export default CarBookingModal;
