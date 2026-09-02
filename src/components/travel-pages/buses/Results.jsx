import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BusSearch from "components/travel-components/buses/BusSearch";
import BusSeatSelection from "components/travel-components/buses/BusSeatSelection";

const BusResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};
  const { buses = [], fromCity, toCity, date } = state;

  useEffect(() => {
    if (!location.state) {
      navigate("/buses", { replace: true });
    }
  }, []);

  if (!location.state) return null;

  const journeyDate = date ? new Date(date) : null;

  return (
    <>
      <BusSearch
        initialFrom={fromCity}
        initialTo={toCity}
        initialDate={journeyDate}
        stickyHeader
      />
      <BusSeatSelection
        buses={Array.isArray(buses) ? buses : []}
        from={fromCity?.name || ""}
        to={toCity?.name || ""}
      />
    </>
  );
};

export default BusResultsPage;