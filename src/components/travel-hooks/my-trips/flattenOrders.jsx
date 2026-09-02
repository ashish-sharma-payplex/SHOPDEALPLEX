// src/components/travel-hooks/my-trips/flattenOrders.js
export const flattenOrders = (orders = []) => {
  return (orders || [])
    .filter((order) => order.journeys && order.journeys.length > 0)
    .map((order) => {
      const sortedJourneys = [...order.journeys].sort((a, b) => {
        if (a.journey_type === b.journey_type) return 0;
        return a.journey_type === "OUTBOUND" ? -1 : 1;
      });

      return {
        order_id: order.order_id,
        trace_id: order.trace_id,
        status: order.status,
        payable_amount: order.payable_amount,
        created_at: order.created_at,
        journeys: sortedJourneys.map((journey) => ({
          journey_type: journey.journey_type,
          origin: journey.origin,
          destination: journey.destination,
          status: journey.status || order.status,
          is_lcc: journey.is_lcc,
          booking_id: journey.booking_id,
          pnr: journey.pnr,
          is_ticket: journey.is_ticket,
          fare: journey.fare,
          cancellation: journey.cancellation || null,
          // ✅ NAYA — "Round Trip" chip FlightCard pe dikhane ke liye.
          // ⚠️ IMPORTANT: apna actual getMyTrips list API response check
          // karke field ka sahi naam yaha daalo (TBO convention me
          // JourneyType: 2 = Round Trip hota hai). Jab tak sahi field
          // naam confirm nahi hota, ye hamesha null/undefined rahega
          // aur FlightCard pe chip nahi dikhega.
          trip_type: journey.trip_type ?? journey.journey_type_code ?? journey.JourneyType ?? null,
        })),
      };
    });
};

export const getPrimaryJourney = (journeys = []) =>
  journeys.find((j) => j.journey_type === "OUTBOUND" && j.booking_id) ||
  journeys.find((j) => j.booking_id) ||
  journeys[0];