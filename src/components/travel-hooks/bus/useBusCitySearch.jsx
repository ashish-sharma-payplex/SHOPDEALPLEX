import { useState, useEffect, useRef, useCallback } from "react";
import { BUS_ENDPOINTS, busFetch } from "travel-api/busApi";

export function useBusCitySearch(open = false) {
  const [query, setQuery] = useState("");
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);
  const debounceTimer = useRef(null);

  const fetchCities = useCallback(async (search = "") => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: 1, page_size: 100 };
      if (search.trim()) params.search = search.trim();

      const data = await busFetch(BUS_ENDPOINTS.CITY_LIST, {
        method: "GET",
        params,
      });

      setCities(data?.data?.results ?? data?.results ?? []);
    } catch (err) {
      setError(err.message);
      setCities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch only when dropdown opens for first time
  useEffect(() => {
    if (open && !hasFetched.current) {
      hasFetched.current = true;
      fetchCities("");
    }
  }, [open, fetchCities]);

  const handleQueryChange = useCallback(
    (val) => {
      setQuery(val);
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        fetchCities(val);
      }, 400);
    },
    [fetchCities],
  );

  return { query, setQuery: handleQueryChange, cities, loading, error };
}
