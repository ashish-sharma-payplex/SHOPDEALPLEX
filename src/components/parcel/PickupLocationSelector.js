import React, { useEffect, useState } from "react";
import { Box, Autocomplete, TextField } from "@mui/material";
import toast from "react-hot-toast";
import useGetAutocompletePlace from "../../api-manage/hooks/react-query/google-api/usePlaceAutoComplete";
import useGetPlaceDetails from "../../api-manage/hooks/react-query/google-api/useGetPlaceDetails";
import GoogleMapModule from "./GoogleMapModule";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";

// Only India addresses are allowed for pickup/drop. Google's autocomplete
// description for an Indian address ends with ", India" (in the default
// / english locale this API responds with), so we use that as a quick
// list-level filter. The stronger check happens on place-details, using
// the actual address_components country code.
const isIndianDescription = (description = "") =>
  description.trim().toLowerCase().endsWith("india");

const isIndianAddressComponents = (addressComponents = []) =>
  addressComponents.some(
    (component) =>
      component.types?.includes("country") &&
      component.short_name?.toUpperCase() === "IN",
  );

const PickupLocationSelector = ({
  value,
  onChange,
  searchText,
  setSearchText,
  label = "Pickup",
}) => {
  const [searchKey, setSearchKey] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [predictions, setPredictions] = useState([]);

  const [placeId, setPlaceId] = useState("");
  const [placeDetailsEnabled, setPlaceDetailsEnabled] = useState(false);

  const { data: places } = useGetAutocompletePlace(searchKey, enabled);
  const { data: placeDetails } = useGetPlaceDetails(
    placeId,
    placeDetailsEnabled,
  );

  useEffect(() => {
    if (places) {
      // ✅ Only show India results in the suggestions list
      const indiaOnly = (places.predictions || []).filter((prediction) =>
        isIndianDescription(prediction.description),
      );
      setPredictions(indiaOnly);
    }
  }, [places]);

  useEffect(() => {
    if (placeDetails) {
      const loc = placeDetails?.result?.geometry?.location;
      const address = placeDetails?.result?.formatted_address;
      const addressComponents = placeDetails?.result?.address_components;

      // ✅ Hard check on the actual place details — reject anything
      // outside India even if it somehow slipped past the list filter.
      if (!isIndianAddressComponents(addressComponents)) {
        toast.error("Please select a location within India");
        return;
      }

      setSearchText(address);

      onChange?.({
        lat: loc.lat,
        lng: loc.lng,
        address,
      });
    }
  }, [placeDetails]);

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "500px", // 🔥 HEIGHT CONTROL
      }}
    >
      {/* 🔍 SEARCH */}
      <Box
        sx={{
          position: "absolute",
          top: 10,
          left: 10,
          right: 10,
          zIndex: 10,
        }}
      >
        <Autocomplete
          freeSolo
          options={predictions}
          inputValue={searchText}
          onInputChange={(e, val) => {
            setSearchText(val);
            setSearchKey(val);
            setEnabled(!!val);
          }}
          onChange={(e, val) => {
            if (val?.place_id) {
              setPlaceId(val.place_id);
              setPlaceDetailsEnabled(true);
            }
          }}
          getOptionLabel={(option) => option.description || ""}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              placeholder="Search a new address"
              sx={{
                background: "#fff",
                borderRadius: "12px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  paddingLeft: "14px",
                },
              }}
              InputProps={{
                ...params.InputProps,
                startAdornment: !searchText ? ( // ✅ CONDITION
                  <InputAdornment position="start">
                    <Box
                      component="img"
                      src="/search.svg"
                      sx={{
                        width: "25px",
                        height: "25px",
                        opacity: 0.7,
                      }}
                    />
                  </InputAdornment>
                ) : null,
              }}
            />
          )}
        />
      </Box>

      {/* 🗺 MAP */}
      <Box
        sx={{
          width: "100%",
          height: "100%",
          minHeight: "500px",
        }}
      >
        {value && (
          <GoogleMapModule
            location={value}
            setLocation={(val) => onChange?.(val)}
            setPlaceDetailsEnabled={setPlaceDetailsEnabled}
            markerLabel={label}
          />
        )}
      </Box>
    </Box>
  );
};

export default PickupLocationSelector;
