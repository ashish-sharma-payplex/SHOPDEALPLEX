import React, { useEffect, useRef, useState } from "react";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import { useTheme } from "@emotion/react";
import { useDispatch, useSelector } from "react-redux";
import { t } from "i18next";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";
import dayjs from "dayjs";
import { toast } from "react-hot-toast";
import MapModal from "components/Map/MapModal";
import useGetAutocompletePlace from "api-manage/hooks/react-query/google-api/usePlaceAutoComplete";
import useGetPlaceDetails from "api-manage/hooks/react-query/google-api/useGetPlaceDetails";
import useGetDistance from "api-manage/hooks/react-query/google-api/useGetDistance";
import { setRentalSearch } from "redux/slices/rentalSearch";
import { updateDestinationLocations } from "components/home/module-wise-components/rental/components/utils/bookingHepler";
import RentalBanner from "../Rental-Banner/Rentalbanner";
import RentalSearchPanel from "../Rental-Searchbar/RentalSearchPanel";
import { Box } from "@mui/system";

const SentalCategories = ({ isSticky, searchPanelRef, scrolling }) => {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const mode = "driving";
  const [openMap, setOpenMap] = useState(false);
  const { configData } = useSelector((state) => state.configData);
  const { rentalSearch } = useSelector((state) => state?.rentalSearch);
  const [open, setOpen] = useState(false);
  const [tripType, setTripType] = useState(rentalSearch?.tripType || "distance_wise");
  const [duration, setDuration] = useState(rentalSearch?.duration || "");
  const [selectedDate, setSelectedDate] = useState(rentalSearch?.selectedDate || dayjs());
  const [locations, setLocations] = useState({
    ...configData?.default_location,
  });
  const [searchKey, setSearchKey] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [expand, setExpand] = useState(false);
  const [showArrowButton, setShowArrowButton] = useState(false);

  const formControlRef = useRef(null);
  const inputRef = useRef(null);

  const pickup_location =
    typeof window !== "undefined" ? JSON.parse(localStorage.getItem("currentLatLng")) : false;

  const location_name = typeof window !== "undefined" ? window.localStorage.getItem("location") : false;

  const { data: places } = useGetAutocompletePlace(searchKey, !!searchKey);
  const { data: placeDetails } = useGetPlaceDetails(placeId, !!placeId);
  const { data: distanceData, refetch } = useGetDistance(pickup_location, locations, mode);

  useEffect(() => {
    if (places) setPredictions(places.predictions);
  }, [places]);

  useEffect(() => {
    if (placeDetails?.result?.geometry?.location) {
      setLocations({
        location_name: placeDetails.result.formatted_address,
        lat: placeDetails.result.geometry.location.lat,
        lng: placeDetails.result.geometry.location.lng,
      });
    }
  }, [placeDetails]);

  useEffect(() => {
    refetch();
  }, [locations]);

  useEffect(() => {
    dispatch(
      setRentalSearch({
        ...rentalSearch,
        destination_location: locations,
      })
    );
  }, [locations]);

  useEffect(() => {
    if (rentalSearch?.destination_location?.location_name) {
      setSearchKey(rentalSearch.destination_location.location_name);
    }
  }, [rentalSearch?.destination_location?.location_name]);

  const handleLocationChange = (field, value) => {
    if (value && value.place_id) {
      setPlaceId(value.place_id);
      setSearchKey(value.description);
    } else {
      setSearchKey("");
      setPlaceId("");
      setLocations({ ...configData?.default_location });
    }
  };

  const handleSearchChange = (event) => setSearchKey(event.target.value);
  const handleFocus = () => setIsFocused(true);

 const pickLocationFormAddress = (value) => {
  const description =
    value?.description ||
    value?.address ||
    value?.location_name ||
    "";

  setSearchKey(description);

  setLocations({
    lat: value?.latitude ?? value?.lat ?? null,
    lng: value?.longitude ?? value?.lng ?? null,
    location_name: description,
  });
};

const handleLocation = (location, name) => {
  pickLocationFormAddress({
    latitude: location.lat,
    longitude: location.lng,
    description: name,
  });

  setOpenMap(false);
};


  const handleDateChange = (val) => setSelectedDate(val);

  useEffect(() => {
    dispatch(
      setRentalSearch({
        ...rentalSearch,
        selectedDate,
      })
    );
  }, [selectedDate]);

  const handleTripTypeChange = (e) => setTripType(e.target.value);

  useEffect(() => {
    dispatch(
      setRentalSearch({
        ...rentalSearch,
        tripType,
      })
    );
  }, [tripType]);

  const handleOpen = () => setOpen(true);

  const handleClick = (e, type) => {
    e.stopPropagation();
    setTripType(type);
    setOpen(type === "hourly");
  };

  const handleDurationChange = (e) => setDuration(e.target.value);

  useEffect(() => {
    dispatch(
      setRentalSearch({
        ...rentalSearch,
        duration,
      })
    );
  }, [duration]);

  const handleSearchClick = () => {
    if (!searchKey) return toast.error("Please Add Destination Address!");
    if (!selectedDate) return toast.error("Please Select the Date!");
    if (!tripType) return toast.error("Please Select a Trip Type!");

    if (tripType === "hourly" && (!duration || isNaN(duration) || duration <= 0)) {
      return toast.error("Please enter a valid duration.");
    }

    updateDestinationLocations(locations);

    dispatch(
      setRentalSearch({
        selectedDate,
        destination_location: locations,
        pickup_location: {
          location_name,
          ...pickup_location,
        },
        tripType,
        duration,
        distanceData,
      })
    );

    router.push({
      pathname: "/rental/vehicle-search",
      query: { from: "from_search" },
    });
  };

  return (
    <CustomStackFullWidth sx={{ position: "relative", width: "100%" }}>
      {/* Banner */}
      <Box sx={{ position: "relative" }}>
        <RentalBanner />

        {/* CLEAN OVERLAP SEARCH PANEL */}
        <Box
          sx={{
            position: "absolute",
            bottom: { xs: "-90px", md: "-40px" },
            left: 0,
            right: 0,
            zIndex: 50,
          }}
        >
          <RentalSearchPanel
            rentalSearch={rentalSearch}
            searchKey={searchKey}
            locations={locations}
            selectedDate={selectedDate}
            tripType={tripType}
            duration={duration}
            open={open}
            isFocused={isFocused}
            handleLocationChange={handleLocationChange}
            handleSearchChange={handleSearchChange}
            handleDateChange={handleDateChange}
            handleTripTypeChange={handleTripTypeChange}
            handleDurationChange={handleDurationChange}
            handleSearchClick={handleSearchClick}
            handleOpen={handleOpen}
            handleClick={handleClick}
            handleFocus={handleFocus}
            setOpenMap={setOpenMap}
            pickLocationFormAddress={pickLocationFormAddress}
            getCurrentLocation={pickLocationFormAddress}
            formControlRef={formControlRef}
            inputRef={inputRef}
            isSticky={isSticky}
            searchPanelRef={searchPanelRef}
            scrolling={scrolling}
            pathname={pathname}
            showArrowButton={showArrowButton}
            expand={expand}
            setExpand={setExpand}
            predictions={predictions}
          />
        </Box>
      </Box>

      {/* 👉 Added space BELOW the search bar (search bar position unchanged) */}
      <Box sx={{ height: { xs: "120px", md: "80px" } }} />

      {/* Map Modal */}
      {openMap && (
        <MapModal
          handleLocation={handleLocation}
          open={openMap}
          handleClose={() => setOpenMap(false)}
          toparcel="1"
          fromReceiver="1"
        />
      )}
    </CustomStackFullWidth>
  );
};

export default SentalCategories;
