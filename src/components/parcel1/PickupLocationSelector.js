import React, { useEffect, useState } from "react";
import { Box, Autocomplete, TextField } from "@mui/material";
import useGetAutocompletePlace from "../../api-manage/hooks/react-query/google-api/usePlaceAutoComplete";
import useGetPlaceDetails from "../../api-manage/hooks/react-query/google-api/useGetPlaceDetails";
import GoogleMapModule from "./GoogleMapModule";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";

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
      setPredictions(places.predictions || []);
    }
  }, [places]);

  useEffect(() => {
    if (placeDetails) {
      const loc = placeDetails?.result?.geometry?.location;
      const address = placeDetails?.result?.formatted_address;

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
                startAdornment: !searchText ? (   // ✅ CONDITION
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
