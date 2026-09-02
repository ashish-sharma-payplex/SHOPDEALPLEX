// src\hooks\buseshooks\useBusSearch.jsx
import { useState, useCallback } from "react";
import { BUS_ENDPOINTS, busFetch } from "travel-api/busApi";

/**
 * useBusSearch
 * - Bus search POST API call karta hai
 * - Body: { date_of_journey, source_id, destination_id }
 * - date_of_journey format: "YYYY/MM/DD"
 */
export function useBusSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async ({ sourceId, destinationId, date }) => {
    setLoading(true);
    setError(null);
    try {
      // Format date to "YYYY/MM/DD"
      const d = new Date(date);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const dateOfJourney = `${yyyy}/${mm}/${dd}`;

      const data = await busFetch(BUS_ENDPOINTS.BUS_SEARCH, {
        method: "POST",
        body: {
          date_of_journey: dateOfJourney,
          source_id: String(sourceId),
          destination_id: String(destinationId),
        },
      });

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { search, loading, error };
}
