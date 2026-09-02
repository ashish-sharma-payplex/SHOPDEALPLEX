// src/components/travel-components/flight/PopularRoutes.jsx
import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { FLIGHT_ENDPOINTS, flightFetch } from "travel-api/flightApi";

// 🔥 SAME value as FlightSearch.jsx's SECTION_PX — keeps this section's
// left/right edge aligned with the search box / category tabs above it
// on every laptop screen size. If FlightSearch.jsx's SECTION_PX ever
// changes, update this one to match (or move both into a shared
// constants file and import it in both places).
const SECTION_PX = { xs: 1.5, sm: 2, md: "40px" };

// Images from public folder
const routes = [
  { city: "Bengaluru", to: "Hyderabad, Mumbai, Goa, Chennai, Pune", img: "/bengaluru.svg" },
  { city: "Hyderabad", to: "Bengaluru, Mumbai, Goa, Chennai, Pune", img: "/hyderabad.svg" },
  { city: "Pune", to: "Mumbai, Bengaluru, Goa,  Hyderabad", img: "/pune.svg" },
  { city: "Chennai", to: "Bengaluru, Coimbatore, Hyderabad, Madurai", img: "/chennai.svg" },
  { city: "Delhi", to: "Jaipur, Amritsar, Lucknow, Shimla", img: "/delhi.svg" },
  { city: "Mumbai", to: "Bengaluru, Goa, Indore, Hyderabad", img: "/mumbai.svg" },
  { city: "Jaipur", to: "Delhi, Bikaner, Lucknow, Jodhpur, Indore", img: "/jaipur.svg" },
  { city: "Goa", to: "Hyderabad, Bengaluru, Pune, Mumbai, Kolhapur", img: "/goa.svg" },
  { city: "Ahmedabad", to: "Porbandar, Jamnagar, Udaipur, Indore, Rajkot", img: "/ahmedabad.svg" },
  { city: "Coimbatore", to: "Chennai, Bengaluru, Hyderabad, Sivakasi", img: "/coimbatore.svg" },
  { city: "Indore", to: "Mumbai, Pune, Nagpur, Ahmedabad, Ahmednagar", img: "/indore.svg" },
  { city: "Nagpur", to: "Mumbai, Bengaluru, Goa, Indore, Hyderabad", img: "/nagpur.svg" },
];

// ─── Kuch cities ka "popular routes" naam aur airport-API ka naam alag hai.
// Yahan wahi mapping — sirf SEARCH ke liye use hoga, display API response se hi aayega ───
const CITY_SEARCH_ALIASES = {
  Bengaluru: "Bangalore",
  Delhi: "DEL",
  Hyderabad: "Rajiv Gandhi International Airport",
  Pune: "PNQ",
  Chennai: "Chennai",
  Lucknow: "LUCK",
};

// ─── city name se airport /search karke {code, name} object banata hai ───
async function fetchAirportByCity(cityName) {
  if (!cityName) return null;
  const searchTerm = CITY_SEARCH_ALIASES[cityName] || cityName;

  try {
    const res = await flightFetch(FLIGHT_ENDPOINTS.COUNTRIES, {
      params: { q: searchTerm, page: 1, page_size: 100 },
    });

    const results = res?.data?.results || [];
    const target = searchTerm.trim().toLowerCase();
    const match =
      results.find((r) => (r.airport || "").toLowerCase().startsWith(target)) ||
      results[0];

    if (!match) return null;

    return {
      code: match.code || match.value || "",
      name: match.country ? `${match.airport}, ${match.country}` : match.airport || cityName,
    };
  } catch (err) {
    console.error(`Airport search failed for "${cityName}" (query: "${searchTerm}"):`, err);
    return null;
  }
}

const PopularRoutes = () => {
  const navigate = useNavigate();
  const [loadingRoute, setLoadingRoute] = useState(null);

  const handleRouteClick = async (mainCityName, toCityName) => {
    if (loadingRoute) return;
    const routeKey = `${mainCityName}->${toCityName}`;
    setLoadingRoute(routeKey);

    try {
      const [fromCity, toCity] = await Promise.all([
        fetchAirportByCity(mainCityName),
        fetchAirportByCity(toCityName),
      ]);

      navigate("/flights", {
        state: {
          fromCity: fromCity || { code: "", name: mainCityName },
          toCity: toCity || { code: "", name: toCityName },
        },
      });
    } finally {
      setLoadingRoute(null);
    }
  };

  return (
    <Box sx={{ mt: 6,mb:5, px: SECTION_PX }}>
      {/* 🔥 NAYA — FlightSearch.jsx ke Paper (Flight Booking card) ka
          maxWidth:1280 hai aur wo apne container ke andar CENTER hota hai
          jab screen 1280px se zyada wide ho (laptop pe common hai:
          1366px, 1440px, 1512px, 1920px). Sirf px (SECTION_PX) match
          karne se alignment nahi bani rehti kyuki Paper wide screens pe
          extra centering-gap le leta hai jo px se bahar hota hai.
          Isliye yahan bhi wahi maxWidth:1280 + mx:"auto" wrapper diya hai
          — ab dono EXACT SAME width pe cap honge aur EXACT SAME jagah
          center honge, chahe screen kitni bhi wide ho. */}
      <Box sx={{ maxWidth: 1280, mx: "auto" }}>
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

export default PopularRoutes;