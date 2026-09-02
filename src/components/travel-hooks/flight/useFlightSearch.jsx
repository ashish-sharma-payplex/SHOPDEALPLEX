// ─── useFlightSearch.jsx ───────────────────────────────────────────────────────
// src\hooks\flighthooks\useFlightSearch.jsx
import { useState, useCallback } from "react";
import { FLIGHT_ENDPOINTS, flightFetch } from "travel-api/flightApi";

const CABIN_CLASS_MAP = {
  Economy: 1,
  "Premium Economy": 2,
  Business: 3,
  "First Class": 4,
};

const SEARCH_TIMEOUT_MS = 45000;

function formatSegmentDate(date) {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T00:00:00`;
}

function withTimeout(promise, ms, errorMsg = "Request timed out") {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(errorMsg)), ms),
    ),
  ]);
}

function isCombinedRoundTripResult(result) {
  const segArrays = result?.Segments || [];
  const indicators = segArrays.map((leg) => leg?.[0]?.TripIndicator);
  return indicators.includes(1) && indicators.includes(2);
}

export function normalizeFlightResponse(data) {
  if (!data)
    return {
      onwardFlights: [],
      returnFlights: [],
      isRoundTrip: false,
      isCombinedRoundTrip: false,
      onwardMeta: null,
      returnMeta: null,
    };

  // New format
  if (data.Outbound !== undefined) {
    const outbound = data.Outbound?.results || [];
    const inbound  = data.Inbound?.results  || [];
    const hasInboundBlock = !!data.Inbound;

    // ── International round-trip: koi alag Inbound block nahi aata,
    //    har result apne Segments array mein DONO legs bundle karke
    //    deta hai (TripIndicator 1 = onward, TripIndicator 2 = return),
    //    same ResultIndex ke saath, ek hi Fare ke saath (poori roundtrip
    //    ka ek hi bookable fare). Domestic round-trip (jaha Inbound
    //    block separately aata hai, har leg ka apna ResultIndex/Fare
    //    hota hai) is branch se bilkul untouched rehta hai kyunki neeche
    //    wali condition ke liye `!hasInboundBlock` zaroori hai.
    //
    //    IMPORTANT: Pehle yeh code isCombinedRoundTripResult() true hone
    //    par result ko onward/return do pseudo-flights mein SPLIT kar
    //    deta tha (taaki domestic jaisa 2-column selection UI dikhe).
    //    Lekin international ke liye yeh galat hai — ek hi Segments
    //    array poore round-trip ke liye ek hi bookable fare represent
    //    karta hai, isliye ab hum ise split NAHI karte. Result ko as-is
    //    rakha jaata hai (Fare bhi original, double nahi hota) taaki UI
    //    ise EK flight ki tarah treat kare, jisme dono legs (onward +
    //    return) ek hi card/sidebar mein dikhen. ─────────────────────────
    const combinedSample = !hasInboundBlock
      ? outbound.find((r) => isCombinedRoundTripResult(r))
      : null;

    if (!hasInboundBlock && combinedSample) {
      return {
        onwardFlights: outbound,
        returnFlights: [],
        isRoundTrip: true,
        isCombinedRoundTrip: true,
        onwardMeta: data.Outbound
          ? {
              count: data.Outbound.count,
              page: data.Outbound.page,
              pageSize: data.Outbound.page_size,
              next: data.Outbound.next,
            }
          : null,
        returnMeta: null,
      };
    }

    const isRoundTrip = hasInboundBlock;

    return {
      onwardFlights: outbound,
      returnFlights: inbound,
      isRoundTrip,
      isCombinedRoundTrip: false,
      onwardMeta: data.Outbound
        ? {
            count: data.Outbound.count,
            page: data.Outbound.page,
            pageSize: data.Outbound.page_size,
            next: data.Outbound.next,
          }
        : null,
      returnMeta: data.Inbound
        ? {
            count: data.Inbound.count,
            page: data.Inbound.page,
            pageSize: data.Inbound.page_size,
            next: data.Inbound.next,
          }
        : null,
    };
  }

  // Old format
  const flat = data.results?.Results || [];
  return {
    onwardFlights: flat,
    returnFlights: [],
    isRoundTrip: false,
    isCombinedRoundTrip: false,
    onwardMeta: null,
    returnMeta: null,
  };
}

export function useFlightSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const searchFlights = useCallback(
    async ({
      fromCity,
      toCity,
      departureDate,
      returnDate,
      passengers,
      cabinClass,
      tripType,

      outboundPage      = 1,
      outboundPageSize  = 500,
      inboundPage       = 1,
      inboundPageSize   = 500,
    }) => {
      setLoading(true);
      setError(null);

      try {
        const journeyType = tripType === "roundtrip" ? 2 : 1;
        const cabinCode   = CABIN_CLASS_MAP[cabinClass] || 1;
        const depDate     = formatSegmentDate(departureDate);

        const segments = [
          {
            Origin: fromCity.code,
            Destination: toCity.code,
            FlightCabinClass: cabinCode,
            PreferredDepartureTime: depDate,
            PreferredArrivalTime: depDate,
          },
        ];

        if (tripType === "roundtrip" && returnDate) {
          const retDate = formatSegmentDate(returnDate);
          segments.push({
            Origin: toCity.code,
            Destination: fromCity.code,
            FlightCabinClass: cabinCode,
            PreferredDepartureTime: retDate,
            PreferredArrivalTime: retDate,
          });
        }

        const body = {
          EndUserIp:        "192.168.10.10",
          TokenId:          "ac2751e9-4cc3-406f-b678-c947e4f57a00",
          AdultCount:       String(passengers.adults   || 1),
          ChildCount:       String(passengers.children || 0),
          InfantCount:      String(passengers.infants  || 0),
          DirectFlight:     "false",
          OneStopFlight:    "false",
          JourneyType:      journeyType,
          PreferredAirlines: [],
          Segments:         segments,
          Sources:          [],
        };

        // ── Pagination & filters query params ke through jaate hain, body mein nahi ──
        const params = {
          outbound_page:      outboundPage,
          outbound_page_size: outboundPageSize,
          inbound_page:       inboundPage,
          inbound_page_size:  inboundPageSize,
        };

        // 👇 BAS YEH DEKHO CONSOLE MEIN — request jaane se pehle ka pura data
        // console.log("🚀 [FlightSearch] Endpoint:", FLIGHT_ENDPOINTS.SEARCH);
        // console.log("📦 [FlightSearch] Request Body:", JSON.stringify(body, null, 2));
        // console.log("🔍 [FlightSearch] Query Params:", JSON.stringify(params, null, 2));

        const result = await withTimeout(
          flightFetch(FLIGHT_ENDPOINTS.SEARCH, { method: "POST", body, params }),
          SEARCH_TIMEOUT_MS,
          "Flight search timed out. Please try again.",
        );

        return result;
      } catch (err) {
        setError(err.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { searchFlights, loading, error };
}