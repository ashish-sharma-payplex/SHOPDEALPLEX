import React, { useRef, useEffect } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "12px",
};

const PickupMap = ({ location, setLocation }) => {
  const mapRef = useRef(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY,
    libraries: ["places"],
  });

  const onLoad = (map) => {
    mapRef.current = map;
  };

  // 🔥 Jab bhi location change ho → map center update + zoom
  useEffect(() => {
    if (mapRef.current && location.lat && location.lng) {
      mapRef.current.panTo({
        lat: location.lat,
        lng: location.lng,
      });

      mapRef.current.setZoom(16); // zoomed in view
    }
  }, [location]);

  const handleDragEnd = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        setLocation({
          lat,
          lng,
          address: results[0].formatted_address,
        });
      }
    });
  };

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={{ lat: location.lat, lng: location.lng }}
      zoom={16}
      onLoad={onLoad}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      {/* 🔴 THIS IS IMPORTANT — Visible Marker */}
      <Marker
        position={{ lat: location.lat, lng: location.lng }}
        draggable
        onDragEnd={handleDragEnd}
      />
    </GoogleMap>
  );
};

export default PickupMap;
