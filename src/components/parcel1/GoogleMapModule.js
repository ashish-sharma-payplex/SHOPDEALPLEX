import React, { useCallback, useEffect, useMemo, useState } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import {
  CircularProgress,
  IconButton,
  Stack,
  Button,
  useMediaQuery,
  Box,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { darkStyles, grayMapStyle } from "../mapColor.js";

const GoogleMapModule = ({
  setDisablePickButton,
  setLocationEnabled,
  setLocation,
  locationLoading,
  location,
  setPlaceDetailsEnabled,
  placeDetailsEnabled,
  setPlaceDescription,
  height,
  isModalExpand,
  left,
  bottom,
  polygonPaths,
  markerLabel = "Pickup",
}) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  const containerStyle = {
    width: "100%",
    height: "100%",
    minHeight: "400px",
  };

  const center = useMemo(
    () => ({
      lat: parseFloat(location?.lat),
      lng: parseFloat(location?.lng),
    }),
    [location?.lat, location?.lng],
  );

  const options = useMemo(
    () => ({
      zoomControl: false,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
      styles: theme.palette.mode === "dark" ? darkStyles : grayMapStyle,
    }),
    [],
  );

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY,
  });

  const [map, setMap] = useState(null);
  const [zoom, setZoom] = useState(polygonPaths ? 9 : 17);
  const [centerPosition, setCenterPosition] = useState(center);
  const [tempCenter, setTempCenter] = useState(center);

  useEffect(() => {
    if (location?.lat && location?.lng) {
      const loc = {
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lng),
      };
      setTempCenter(loc);
      setCenterPosition(loc);
    }
  }, [location]);

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 1, 21));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 1, 1));

  const handleDragEnd = () => {
    if (!map) return;
    const lat = map.center?.lat();
    const lng = map.center?.lng();
    setTempCenter({ lat, lng });
    setCenterPosition({ lat, lng });
  };

  const handleCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const loc = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
      setTempCenter(loc);
      setCenterPosition(loc);
      setLocation?.(loc);
    });
  };

  // Pickup = green, Drop = red
  const markerColor = markerLabel === "Drop" ? "#e53935" : "#1f8f4a";
  const displayText = markerLabel === "Drop" ? "Drop" : "Pick";

  return isLoaded ? (
    <Stack
      sx={{
        height: "100%",
        minHeight: "400px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ZOOM + LOCATION CONTROLS */}
      <Stack
        position="absolute"
        zIndex={2}
        left="10px"
        bottom="10px"
        spacing={1}
      >
        <IconButton onClick={handleZoomIn}>
          <AddIcon />
        </IconButton>
        <IconButton onClick={handleZoomOut}>
          <RemoveIcon />
        </IconButton>
        <IconButton onClick={handleCurrentLocation}>
          <MyLocationIcon />
        </IconButton>
      </Stack>

      {/* BOTTOM BUTTON */}
      <Stack
        position="absolute"
        bottom="10px"
        left="50%"
        sx={{ transform: "translateX(-50%)", zIndex: 2 }}
      >
        <Button
          variant="contained"
          sx={{
            background: markerColor,
            borderRadius: "8px",
            textTransform: "none",
            whiteSpace: "nowrap",
            "&:hover": {
              background: markerLabel === "Drop" ? "#c62828" : "#187a3e",
            },
          }}
          onClick={() => {
            if (!tempCenter) return;
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: tempCenter }, (results, status) => {
              if (status === "OK" && results[0]) {
                const address = results[0].formatted_address;
                setLocation?.({ ...tempCenter, address });
                setPlaceDescription?.(address);
              } else {
                setLocation?.(tempCenter);
              }
            });
            setPlaceDetailsEnabled?.(false);
          }}
        >
          {markerLabel === "Drop" ? "Drop Location" : "Pick Location"}
        </Button>
      </Stack>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={tempCenter || centerPosition}
        zoom={zoom}
        onLoad={onLoad}
        onDragEnd={handleDragEnd}
        options={options}
      >
        {!locationLoading ? (
          <Box
            sx={{
              position: "absolute",
              left: "50%",
              top: "50%",
              // pin ki tip center pe ho isliye -100% top aur -50% left
              transform: "translate(-50%, -100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              zIndex: 3,
              pointerEvents: "none",
            }}
          >
            {/*
              SVG marker — PNG image hatai kyunki uspe "Pick" hardcoded tha.
              Ab "Pick" ya "Drop" dynamically dikhega markerLabel ke basis pe.
            */}
            <svg
              width="56"
              height="70"
              viewBox="0 0 56 70"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Drop shadow */}
              <ellipse cx="28" cy="68" rx="10" ry="3" fill="rgba(0,0,0,0.2)" />
              {/* Pin body */}
              <path
                d="M28 2C15.85 2 6 11.85 6 24C6 40 28 68 28 68C28 68 50 40 50 24C50 11.85 40.15 2 28 2Z"
                fill={markerColor}
              />
              {/* White inner circle */}
              <circle cx="28" cy="23" r="13" fill="white" />
              {/* Dynamic Pick / Drop text */}
              <text
                x="28"
                y="27"
                textAnchor="middle"
                fill={markerColor}
                fontSize="9"
                fontWeight="bold"
                fontFamily="Inter, Arial, sans-serif"
              >
                {displayText}
              </text>
            </svg>
          </Box>
        ) : (
          <CircularProgress
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 3,
            }}
          />
        )}
      </GoogleMap>
    </Stack>
  ) : (
    <div>Loading map...</div>
  );
};

export default GoogleMapModule;
