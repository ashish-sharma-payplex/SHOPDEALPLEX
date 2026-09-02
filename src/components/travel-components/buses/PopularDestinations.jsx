// src/components/travel-components/buses/PopularDestinations.jsx
import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { BUS_ENDPOINTS, busFetch } from "travel-api/busApi";

// 🔥 NOTE — BusSearch.jsx ke andar jo bhi outer px aur Paper ka maxWidth
// hai, wahi values yahan bhi honi chahiye taaki dono sections align
// karein. Yahan filhaal SAME pattern use kiya hai jo FlightSearch/
// PopularRoutes me tha (px:"60px" wahi rakha hai jo pehle se yahan tha,
// kyunki bus wala px flight se already alag — "60px" — tha; agar
// BusSearch.jsx ka outer px isse alag hai to ye value wahi karni hogi).
const SECTION_PX = { xs: 1.5, sm: 2, md: "60px" };

// 🔥 BusSearch ke Paper (search card) ka maxWidth jo bhi hai, WAHI value
// yahan honi chahiye — tabhi ye section us card ke saath exactly align
// karega wide laptop screens (1366px, 1440px, 1920px) par. Agar
// BusSearch.jsx me Paper ka maxWidth 1280 se alag hai, to isko update
// karna zaroori hai.
const CONTENT_MAX_WIDTH = 1280;

// Images from public folder
const routes = [
  { city: "Bengaluru", to: "Hyderabad, Mumbai, Goa, Chennai, Pune", img: "/bengaluru.svg" },
  { city: "Hyderabad", to: "Bengaluru, Mumbai, Goa, Chennai, Pune", img: "/hyderabad.svg" },
  { city: "Pune", to: "Mumbai, Bengaluru, Goa, Indore, Hyderabad", img: "/pune.svg" },
  { city: "Chennai", to: "Bengaluru, Coimbatore, Hyderabad, Madurai", img: "/chennai.svg" },
  { city: "Delhi", to: "Manali, Jaipur, Amritsar, Lucknow, Shimla", img: "/delhi.svg" },
  { city: "Mumbai", to: "Bengaluru, Goa, Hyderabad", img: "/mumbai.svg" },
  { city: "Jaipur", to: "Delhi, Luknow, Jodhpur", img: "/jaipur.svg" },
  { city: "Goa", to: "Hyderabad, Bengaluru, Pune, Mumbai, Kolhapur", img: "/goa.svg" },
  { city: "Ahmedabad", to: "Porbandar, Jamnagar, Udaipur, Indore, Rajkot", img: "/ahmedabad.svg" },
  { city: "Coimbatore", to: "Chennai, Bengaluru, Hyderabad, Sivakasi", img: "/coimbatore.svg" },
  { city: "Indore", to: "Mumbai, Pune, Nagpur, Ahmedabad, Ahmednagar", img: "/indore.svg" },
  { city: "Nagpur", to: "Mumbai, Bengaluru, Goa, Indore, Hyderabad", img: "/nagpur.svg" },
];

// ─── Agar "popular routes" wala naam aur bus-API wala naam alag ho, yahan alias daalo
// (flight wale PopularRoutes me bhi yahi Bengaluru→Bangalore mila tha) ───
const CITY_SEARCH_ALIASES = {
  Bengaluru: "Bangalore",
  Delhi: "New Delhi",
};

// ─── city name se bus city-list /search karke {id, name} object banata hai ───
async function fetchBusCityByName(cityName) {
  if (!cityName) return null;
  const searchTerm = CITY_SEARCH_ALIASES[cityName] || cityName;

  try {
    const data = await busFetch(BUS_ENDPOINTS.CITY_LIST, {
      method: "GET",
      params: { search: searchTerm, page: 1, page_size: 100 },
    });

    const results = data?.data?.results ?? data?.results ?? [];
    const target = searchTerm.trim().toLowerCase();
    const match =
      results.find((c) => (c.CityName || "").toLowerCase().startsWith(target)) ||
      results[0];

    if (!match) return null;

    return { id: match.CityId, name: match.CityName };
  } catch (err) {
    console.error(`Bus city search failed for "${cityName}" (query: "${searchTerm}"):`, err);
    return null;
  }
}

const PopularDestinations = () => {
  const navigate = useNavigate();
  // "MainCity->ToCity" ke liye — ek time pe ek hi click process ho
  const [loadingRoute, setLoadingRoute] = useState(null);

  const handleRouteClick = async (mainCityName, toCityName) => {
    if (loadingRoute) return;
    const routeKey = `${mainCityName}->${toCityName}`;
    setLoadingRoute(routeKey);

    try {
      // dono cities (From = main city, To = clicked city) ek saath fetch
      const [fromCity, toCity] = await Promise.all([
        fetchBusCityByName(mainCityName),
        fetchBusCityByName(toCityName),
      ]);

      navigate("/buses", {
        state: {
          fromCity: fromCity || { id: null, name: mainCityName },
          toCity: toCity || { id: null, name: toCityName },
        },
      });
    } finally {
      setLoadingRoute(null);
    }
  };

  return (
    <Box sx={{ my: 3, px: SECTION_PX }}>
      {/* 🔥 NAYA — BusSearch.jsx ke Paper (search card) ka maxWidth hota hai
          aur wo apne container ke andar CENTER hota hai jab screen us
          maxWidth se zyada wide ho (laptop pe common: 1366px, 1440px,
          1512px, 1920px). Sirf px match karne se alignment nahi banti,
          kyuki Paper wide screens pe extra centering-gap le leta hai jo
          px se bahar hota hai. Isliye yahan bhi wahi maxWidth + mx:"auto"
          wrapper diya hai — ab dono EXACT SAME width pe cap honge aur
          EXACT SAME jagah center honge, chahe screen kitni bhi wide ho. */}
      <Box sx={{ maxWidth: CONTENT_MAX_WIDTH, mx: "auto" }}>
        <Typography sx={{ fontSize: { xs: 20, sm: 22, md: 24 }, fontWeight: 600, mb: 3, fontFamily: "Inter, sans-serif" }}>
          Popular Routes🔥
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
            gap: { xs: 2, sm: 3, md: 4 },
          }}
        >
          {routes.map((route) => {
            const toCities = route.to.split(",").map((c) => c.trim());
            return (
              <Box
                key={route.city}
                sx={{
                  display: "flex",
                  fontFamily: "Inter, sans-serif",
                  alignItems: "center",
                  gap: { xs: 1.5, sm: 2 },
                }}
              >
                <Box
                  component="img"
                  src={route.img}
                  alt={route.city}
                  sx={{ width: 70, height: 70, borderRadius: 2, objectFit: "cover" }}
                />
                <Box>
                  {/* Main city — clickable NAHI, sirf display text */}
                  <Typography sx={{ fontSize: { xs: 16, sm: 18, md: 20 }, fontWeight: 500, fontFamily: "Inter, sans-serif", lineHeight: "28px" }}>
                    {route.city}
                  </Typography>
                  <Typography
                    component="div"
                    sx={{
                      fontSize: { xs: 14, sm: 15, md: 16 },
                      fontWeight: 400,
                      fontFamily: "Inter, sans-serif",
                      lineHeight: "19px",
                      color: "#5E5E5E",
                    }}
                  >
                    <Box component="span">To: </Box>
                    {toCities.map((toCity, idx) => {
                      const routeKey = `${route.city}->${toCity}`;
                      const isLoading = loadingRoute === routeKey;
                      return (
                        <Box
                          key={toCity}
                          component="span"
                          onClick={() => handleRouteClick(route.city, toCity)}
                          sx={{
                            cursor: loadingRoute ? (isLoading ? "wait" : "default") : "pointer",
                            opacity: loadingRoute && !isLoading ? 0.5 : 1,
                            "&:hover": !loadingRoute ? { color: "#2e7d32", textDecoration: "underline" } : {},
                          }}
                        >
                          {isLoading ? "Loading..." : toCity}
                          {idx < toCities.length - 1 ? ", " : ""}
                        </Box>
                      );
                    })}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default PopularDestinations;