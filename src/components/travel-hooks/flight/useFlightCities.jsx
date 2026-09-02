import { useState, useEffect, useCallback } from "react";
import { FLIGHT_ENDPOINTS, flightFetch } from "travel-api/flightApi";


// Fetch all pages and combine results
async function fetchAllCountries() {
  const allResults = [];
  let nextUrl = FLIGHT_ENDPOINTS.COUNTRIES; // first page
  let pageNum = 1;

  while (nextUrl) {
    // Use page param after first call
    const endpoint =
      pageNum === 1
        ? FLIGHT_ENDPOINTS.COUNTRIES
        : `${FLIGHT_ENDPOINTS.COUNTRIES}?page=${pageNum}`;

    const data = await flightFetch(endpoint);

    if (!data?.success || !data?.data?.results) break;

    allResults.push(...data.data.results);

    // Check if next page exists
    if (data.data.next) {
      pageNum++;
    } else {
      break;
    }
  }

  return allResults;
}

export function useFlightCities() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchAllCountries();
      // console.log(
      //   "[useFlightCities] total fetched:",
      //   list.length,
      //   "| sample:",
      //   list[0],
      // );
      setCities(list);
    } catch (err) {
      // console.error("[useFlightCities] error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  return { cities, loading, error, refetch: fetchCities };
}
