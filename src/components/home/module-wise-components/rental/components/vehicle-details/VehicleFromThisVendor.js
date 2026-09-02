// src/components/module-wise-components/rental/components/vehicle-details/VehicleFromThisVendor.js

import { Grid, Skeleton, Typography } from "@mui/material";
import { t } from "i18next";
import { Stack } from "@mui/system";
import useGetVehicleFromThisVendor from "components/home/module-wise-components/rental/rental-api-manage/hooks/react-query/vehicle-from-this-vendor/useGetVehicleFromThisVendor";
import VehicleCard from "../../New-Rental-pages/Top-rating-Vehicles/VehiclesCard";

/**
 * ⭐ UPDATED: Correct price mapping for rental vehicles
 */
const mapVehicleToCardShape = (v) => {
  if (!v) return null;

  const name = v?.name || v?.title || "";
  const rating = v?.avg_rating ?? v?.rating ?? 0;
  const trips = v?.total_trip ?? v?.total_trips ?? 0;

  // ⭐ FIXED PRICE — RIGHT RENTAL API FIELDS
  const price =
    v?.hourly_price ??
    v?.distance_price ??
    v?.base_fare ??
    v?.price_per_km ??
    0;

  const image =
    v?.thumbnail_full_url ||
    v?.vehicle_images?.[0]?.full_url ||
    v?.image ||
    "/placeholder-vehicle.png";

  const features = {
    auto: (v?.transmission_type || "").toLowerCase() === "automatic",
    persons: v?.seating_capacity ?? v?.capacity ?? 4,
    ac:
      Number(v?.air_condition) === 1 ||
      !!v?.ac ||
      v?.air_condition === true,
    fuel: v?.fuel_type || v?.fuel || "Petrol",
  };

  return {
    id: v?.id,
    name,
    rating,
    trips,
    price,
    type: v?.vehicle_type || v?.type || "Sedan",
    image,
    features,
  };
};

const VehicleFromThisVendor = ({ vehicleDetails }) => {
  const provider_id = vehicleDetails?.provider?.id;

  const { data } = useGetVehicleFromThisVendor(() => {}, provider_id);

  const vehicles = data?.vehicles ?? [];

  return (
    <Stack>
      <Typography
        sx={{
          fontWeight: "600",
          color: (theme) => theme.palette.neutral[500],
          fontSize: "22px",
          mb: "15px",
          mt: "40px",
        }}
      >
        {t("Vehicles From This Vendor")}
      </Typography>

      <Grid container spacing={3}>
        {vehicles.length > 0 ? (
          vehicles.slice(0, 6).map((vehicle) => {
            const mapped = mapVehicleToCardShape(vehicle);

            // 💡 FIX: Combine the original API data (for buttons/context) 
            // and the mapped display data (for image/price/features) 
            // into a single object, ensuring the VehicleCard has all necessary fields.
            const combinedVehicleData = {
                ...vehicle, // Original data (for button logic)
                ...mapped,  // Mapped data (overrides for display fields like price, image, features)
            };

            return (
              <Grid item xs={12} sm={6} md={4} lg={4} key={vehicle?.id}>
                {/* Passing only the combined object */}
                <VehicleCard data={combinedVehicleData} /> 
              </Grid>
            );
          })
        ) : (
          [...Array(3)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={4} key={index}>
              <Skeleton variant="rounded" height={383} width="100%" />
            </Grid>
          ))
        )}
      </Grid>
    </Stack>
  );
};

export default VehicleFromThisVendor;