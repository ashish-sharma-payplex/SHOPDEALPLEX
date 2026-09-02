import { useState, useCallback, useRef } from "react";
import { ENDPOINTS, hotelFetch } from "travel-api/hotelApi";


export function useHotelSearch() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const currentCityCode = useRef(null);

  // ─── Init — Results page ke liye bina API call ke state set karo ───
  const init = useCallback((cityCode, initialHotels, totalCount) => {
    currentCityCode.current = cityCode;
    setHotels(initialHotels); // ✅ initial hotels set karo
    setCurrentPage(1);
    setTotal(totalCount);
    setHasMore(initialHotels.length < totalCount);
  }, []);

  // ─── Initial search (page 1) ───────────────
  const search = useCallback(async (cityCode) => {
    if (!cityCode) return;
    currentCityCode.current = cityCode;

    setLoading(true);
    setError(null);
    setHotels([]);
    setCurrentPage(1);
    setHasMore(false);
    setTotal(0);

    try {
      const data = await hotelFetch(ENDPOINTS.HOTEL_CODES, {
        method: "POST",
        params: { page: 1, page_size: 10 },
        body: { CityCode: cityCode, IsDetailedResponse: true },
      });

      const mappedHotels = mapHotels(data?.data ?? []);
      const totalCount =
        data?.meta?.total ?? data?.count ?? mappedHotels.length;

      setHotels(mappedHotels);
      setTotal(totalCount);
      setHasMore(mappedHotels.length < totalCount);
      setCurrentPage(1);

      return { ...data, data: mappedHotels, total: totalCount };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Load more (page 2, 3, ...) ───────────
  const loadMore = useCallback(async () => {
    const code = currentCityCode.current;
    if (!code || loadingMore || !hasMore) return;

    const nextPage = currentPage + 1;
    setLoadingMore(true);

    try {
      const data = await hotelFetch(ENDPOINTS.HOTEL_CODES, {
        method: "POST",
        params: { page: nextPage, page_size: 10 },
        body: { CityCode: code, IsDetailedResponse: true },
      });

      const newHotels = mapHotels(data?.data ?? []);
      const totalCount = data?.meta?.total ?? total ?? 0;

      setHotels((prev) => {
        const updated = [...prev, ...newHotels];
        setHasMore(updated.length < totalCount);
        return updated;
      });
      setCurrentPage(nextPage);
    } catch (err) {
      // console.error("❌ Load more failed:", err.message);
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, loadingMore, hasMore, total]);

  return {
    hotels,
    loading,
    loadingMore,
    hasMore,
    error,
    search,
    loadMore,
    init,
  };
}

// ─── Helper ────────────────────────────────────
function mapHotels(rawList) {
  return rawList.map((hotel) => ({
    id: hotel.HotelCode,
    name: hotel.HotelName,
    stars: mapRatingToNumber(hotel.HotelRating),
    location: hotel.Address,
    area: hotel.CityName + ", " + hotel.CountryName,
    type: "Hotel",
    image: null,
    amenities: [],
    price: 0,
    taxes: 0,
    _raw: hotel,
  }));
}

function mapRatingToNumber(rating) {
  const map = {
    OneStar: 1,
    TwoStar: 2,
    ThreeStar: 3,
    FourStar: 4,
    FiveStar: 5,
  };
  return map[rating] ?? rating ?? "";
}
