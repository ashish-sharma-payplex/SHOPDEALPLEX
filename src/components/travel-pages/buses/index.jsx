// pages\buses\index.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import BusSearch from "components/travel-components/buses/BusSearch";
import PopularDestinations from "components/travel-components/buses/PopularDestinations";

const Index = () => {
  const location = useLocation();
  const { fromCity, toCity } = location.state || {};

  return (
    <>
      <BusSearch initialFrom={fromCity} initialTo={toCity} />
      <PopularDestinations />
    </>
  );
};

export default Index;