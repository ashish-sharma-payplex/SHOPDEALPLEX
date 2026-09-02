import { useState, useCallback } from "react";
import { FLIGHT_ENDPOINTS, flightFetch } from "travel-api/flightApi";

function formatCalendarDate(date) {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T00:00:00`;
}

export function useCalendarFare() {
  const [data, setData] = useState(null);
  const [returnData, setReturnData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCalendarFare = useCallback(
    async ({
      fromCode,
      toCode,
      departureDate,
      returnDate,
      tripType,
      cabinClass = 1,
    }) => {
      setLoading(true);
      setError(null);
      setData(null);
      setReturnData(null);

      try {
        // Onward: from → to
        const onwardBody = {
          JourneyType: 1,
          Segments: [
            {
              Origin: fromCode,
              Destination: toCode,
              FlightCabinClass: cabinClass,
              PreferredDepartureTime: formatCalendarDate(departureDate),
            },
          ],
        };

        const onwardRes = await flightFetch(FLIGHT_ENDPOINTS.CALENDAR_FARE, {
          method: "POST",
          body: onwardBody,
        });

        if (onwardRes?.success) {
          setData(onwardRes.data);
        }

        // Return: to → from (only for roundtrip)
        if (tripType === "roundtrip" && returnDate) {
          const returnBody = {
            JourneyType: 1,
            Segments: [
              {
                Origin: toCode,
                Destination: fromCode,
                FlightCabinClass: cabinClass,
                PreferredDepartureTime: formatCalendarDate(returnDate),
              },
            ],
          };

          const returnRes = await flightFetch(FLIGHT_ENDPOINTS.CALENDAR_FARE, {
            method: "POST",
            body: returnBody,
          });

          if (returnRes?.success) {
            setReturnData(returnRes.data);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { data, returnData, loading, error, fetchCalendarFare };
}
