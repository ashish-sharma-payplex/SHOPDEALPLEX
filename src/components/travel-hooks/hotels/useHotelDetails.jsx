import { useState, useCallback } from "react";
import { ENDPOINTS, hotelFetch } from "travel-api/hotelApi";

// ✅ Helper — Date object ya ISO string dono ko YYYY-MM-DD me convert karo
// ✅ Local date use karo — timezone safe
const toYMD = (date, fallbackDaysOffset = 0) => {
  const d = date
    ? (date instanceof Date ? date : new Date(date))
    : new Date(Date.now() + fallbackDaysOffset * 86400000);

  const year  = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day   = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`; 
};

export function useHotelDetails() {
  const [hotelDetail, setHotelDetail] = useState(null);
  const [roomsData,   setRoomsData]   = useState(null);
   const [searchId,    setSearchId]    = useState(null); 
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);

  const fetchDetails = useCallback(async (hotelCode, searchParams = {}) => {
    if (!hotelCode) return;

    const {
      checkIn          = null,
      checkOut         = null,
      adults           = 2,
      children         = 0,
      childrenAges     = [],
      guestNationality = "IN",
    } = searchParams;

  //   console.log("📥 Raw searchParams:", searchParams);
  // console.log("📅 Raw checkIn:", checkIn, "| type:", typeof checkIn);
  // console.log("📅 Raw checkOut:", checkOut, "| type:", typeof checkOut);

  const formattedCheckIn  = toYMD(checkIn,  0);
  const formattedCheckOut = toYMD(checkOut, 1);

  // console.log("✅ Formatted CheckIn:", formattedCheckIn);
  // console.log("✅ Formatted CheckOut:", formattedCheckOut);

  //   console.log("📅 CheckIn:", formattedCheckIn, "| CheckOut:", formattedCheckOut);

    setLoading(true);
    setError(null);
    setHotelDetail(null);
    setRoomsData(null);

    try {
      const [detailResult, searchResult] = await Promise.allSettled([
        hotelFetch(ENDPOINTS.HOTEL_DETAILS, {
          method: "POST",
          body: {
            hotel_codes:          hotelCode,
            language:             "en",
            IsRoomDetailRequired: "true",
          },
          
        }),
        
        hotelFetch(ENDPOINTS.HOTEL_SEARCH, {
          method: "POST",
          body: {
            CheckIn:             formattedCheckIn,   // ✅ "2026-05-16"
            CheckOut:            formattedCheckOut,  // ✅ "2026-05-17"
            HotelCodes:          Number(hotelCode),  // ✅ number hona chahiye
            GuestNationality:    guestNationality,
            PaxRooms: [
              {
                Adults:       Number(adults),
                Children:     Number(children),
                ChildrenAges: childrenAges,
              },
            ],
            ResponseTime:       23,
            IsDetailedResponse: true,
            Filters:            {},
          },
          
        }),
        
      ]);
// console.log("Adults:", adults);
// console.log("Children:", children);
// console.log("PaxRooms:", [
//   {
//     Adults: Number(adults),
//     Children: Number(children),
//     ChildrenAges: childrenAges,
//   },])
      if (detailResult.status === "fulfilled") {
        setHotelDetail(detailResult.value);
      } else {
        // console.error("❌ Hotel detail API failed:", detailResult.reason);
      }

      if (searchResult.status === "fulfilled") {
        // console.log("✅ Rooms data:", searchResult.value);
        setRoomsData(searchResult.value);
      } else {
        // console.error("❌ Search API failed:", searchResult.reason);
      }

      if (detailResult.status === "rejected" && searchResult.status === "rejected") {
        throw new Error("Both APIs failed");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { hotelDetail, roomsData, loading, error, fetchDetails };
}