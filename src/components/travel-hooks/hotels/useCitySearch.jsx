// src\hooks\hotelhooks\useCitySearch.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { ENDPOINTS, hotelFetch } from "travel-api/hotelApi";


const STATIC_BODY = { CountryCode: "IN" };

/**
 * useCitySearch
 * - Page load pe (search="") pehli 10 cities fetch karta hai
 * - User kuch type kare to debounce ke saath search param se call karta hai
 */
export function useCitySearch() {
  const [query, setQuery] = useState("");
  const [cities, setCities] = useState([]);   // [{ code, name }]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debounceTimer = useRef(null);

  const fetchCities = useCallback(async (search = "") => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: 1, page_size: 10 };
      if (search.trim()) params.search = search.trim();

      const data = await hotelFetch(ENDPOINTS.CITIES, {
        method: "POST",
        params,
        body: STATIC_BODY,
      });

      setCities(data?.data ?? []);
    } catch (err) {
      setError(err.message);
      setCities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Page load pe — default cities
  useEffect(() => {
    fetchCities("");
  }, [fetchCities]);

  // Debounced search — user type karne pe
  const handleQueryChange = useCallback((val) => {
    setQuery(val);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchCities(val);
    }, 400); 
  }, [fetchCities]);

  return { query, setQuery: handleQueryChange, cities, loading, error };
}