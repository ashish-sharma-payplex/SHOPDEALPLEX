import { useState, useCallback, useRef } from "react";
import { FLIGHT_ENDPOINTS, flightFetch } from "travel-api/flightApi";

/**
 * Hook to search/list countries (used for Passport Issue Country).
 * - Empty/short search term -> fetches full country list (default view)
 * - 2+ char search term -> fetches filtered list matching the term
 *
 * API response shape:
 * { success, message, data: { count, page, page_search, results: [...] } }
 */
export function useCountries() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestIdRef = useRef(0);

  const searchCountries = useCallback(async (searchTerm) => {
    const term = (searchTerm || "").trim();
    const currentRequestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);

    try {
      // No search term (or too short) -> fetch full list (all ~194 countries)
      // 2+ chars -> fetch filtered list from API using "q" param
      const params =
        term.length >= 2
          ? { q: term, page: 1, page_search: 100 }
          : { page: 1, page_search: 250 };

      const data = await flightFetch(FLIGHT_ENDPOINTS.COUNTRY_LIST, {
        method: "GET",
        params,
      });

      const rawList =
        data?.data?.results ||
        data?.data?.Countries ||
        data?.results ||
        data ||
        [];

      const normalized = (Array.isArray(rawList) ? rawList : [])
        .map((c) => ({
          name: c.name || c.CountryName || c.Name || c.country_name || "",
          code: (c.code || c.value || c.CountryCode || c.Code || c.iso2 || "")
            .toString()
            .trim()
            .slice(0, 2)
            .toUpperCase(),
        }))
        .filter((c) => c.code && c.name);

      if (currentRequestId === requestIdRef.current) {
        setCountries(normalized);
      }
      return normalized;
    } catch (err) {
      if (currentRequestId === requestIdRef.current) {
        setError(err.message || "Failed to fetch countries");
        setCountries([]);
      }
      return [];
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const clearCountries = useCallback(() => {
    setCountries([]);
    setError(null);
  }, []);

  return { countries, loading, error, searchCountries, clearCountries };
}