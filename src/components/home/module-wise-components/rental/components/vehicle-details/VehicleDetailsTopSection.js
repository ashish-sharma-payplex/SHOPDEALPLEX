import React, { useState } from "react";
import {
  Grid,
  Stack,
  Typography,
  Box,
  useTheme,
  IconButton,
} from "@mui/material";


/* IMAGE GALLERY */
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import CustomImageContainer from "components/CustomImageContainer";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";

import StarIcon from "@mui/icons-material/Star";
import GroupIcon from "@mui/icons-material/Group";
import DirectionsCarFilledIcon from "@mui/icons-material/DirectionsCarFilled";
import AirIcon from "@mui/icons-material/Air";
import ManageHistoryIcon from "@mui/icons-material/ManageHistory";
import EvStationIcon from "@mui/icons-material/EvStation";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";

import VehicleDetailsRentThisCar from "./VehicleDetailsRentThisCar";
import RentalCardWrapper from "../global/RentalCardWrapper";

import { useDispatch, useSelector } from "react-redux";
import {
  addWishListVehicle,
  removeWishListVehicle,
} from "redux/slices/wishList";

import { useAddWishlist } from "components/home/module-wise-components/rental/rental-api-manage/hooks/react-query/wishlist/useAddWishlist";
import { useRemoveRentalWishList } from "components/home/module-wise-components/rental/rental-api-manage/hooks/react-query/wishlist/useRemoveWishlist";

import { getToken } from "helper-functions/getToken";
import { not_logged_in_message } from "utils/toasterMessages";
import toast from "react-hot-toast";
import { t } from "i18next";

import VendorProfile from "../global/VendorProfile";
import VehicleFromThisVendor from "./VehicleFromThisVendor";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DetailsAndReviews from "components/product-details/details-and-reviews/DetailsAndReviews";
import { mainPrice } from "../utils/bookingHepler";
import { getAmountWithSign, getDiscountedAmount } from "helper-functions/CardHelpers";

export default function VehicleDetailsTopSection({ vehicleDetails, userData, from }) {
  const theme = useTheme();

  return (
    <CustomStackFullWidth spacing={4}>
      <Grid container spacing={3}>
        {/* LEFT COLUMN */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            <ImageGallery vehicleDetails={vehicleDetails} />

            {/* Dynamic Vehicle Details and Reviews */}
            <DetailsAndReviews
              description={vehicleDetails?.description || ""}
              productId={vehicleDetails?.id}
              tabsData={["Vehicle Details", "Reviews"]}
              showBackground={false}
              defaultTab={0}
              configData={null}
              storename={vehicleDetails?.provider?.name}
            />
          </Stack>
        </Grid>

        {/* RIGHT COLUMN */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <RightDetailsCard vehicleDetails={vehicleDetails} from={from} />
            <VendorCard vehicleDetails={vehicleDetails} />
          </Stack>
        </Grid>
      </Grid>

      {/* MORE VEHICLES */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <VehicleFromThisVendor vehicleDetails={vehicleDetails} />
        </Grid>
      </Grid>
    </CustomStackFullWidth>
  );
}


/* IMAGE GALLERY */
const ImageGallery = ({ vehicleDetails }) => {
  const [activeImage, setActiveImage] = useState(
    vehicleDetails?.thumbnail_full_url ||
    vehicleDetails?.images_full_url?.[0] ||
    ""
  );

  const theme = useTheme();
  const dispatch = useDispatch();
  const { wishLists } = useSelector((state) => state?.wishList);
  const { mutate: addFav } = useAddWishlist();
  const { mutate: removeFav } = useRemoveRentalWishList();

  const images = vehicleDetails?.images_full_url || [];

  const isWished = wishLists?.vehicles?.some(
    (w) => w?.id === vehicleDetails?.id
  );
  const handleWishlist = (e) => {
    e.stopPropagation();

    // console.log("🔥 Wishlist button clicked");
    // console.log("🚗 Vehicle ID:", vehicleDetails?.id);
    // console.log("📦 Current wishlist vehicles:", wishLists?.vehicles);
    // console.log("⭐ Already wished?", isWished);

    if (!getToken()) {
      // console.log("❌ User not logged in");
      return toast.error(t(not_logged_in_message));
    }

    if (isWished) {
      // console.log("🗑 Removing vehicle from wishlist...");

      removeFav(
        { key: "vehicle_id", id: vehicleDetails?.id },
        {
          onSuccess: (r) => {
            // console.log("✅ Remove API Success:", r);

            dispatch(removeWishListVehicle(vehicleDetails?.id));

            // console.log("🧠 Redux updated after REMOVE:", vehicleDetails?.id);

            toast.success(r.message);
          },
          onError: (err) => {
            // console.log("❌ Remove API Error:", err);
          },
        }
      );
    } else {
      // console.log("➕ Adding vehicle to wishlist...");

      addFav(
        { key: "vehicle_id", id: vehicleDetails?.id },
        {
          onSuccess: (r) => {
            // console.log("✅ Add API Success:", r);

            dispatch(addWishListVehicle(vehicleDetails));

            // console.log("🧠 Redux updated after ADD:", vehicleDetails);

            toast.success(r.message);
          },
          onError: (err) => {
            // console.log("❌ Add API Error:", err);
          },
        }
      );
    }
  };

  return (
    <Stack
      direction={{ xs: "column", sm: "column", md: "row" }}
      spacing={2}
      sx={{
        mt: { xs: 0, sm: 0, md: 0 },    // remove margin for tablet
        pt: { xs: 0, sm: 0, md: 0 },    // remove padding for tablet
      }}
    >

      {/* MAIN IMAGE */}
      <Box
        sx={{
          width: "100%",
          position: "relative",
          order: { xs: 1, sm: 1, md: 2 },

          // REMOVE TOP SPACE ON TABLET
          mt: { xs: 0, sm: 0, md: 0 },   // force no margin-top
          pt: { xs: 0, sm: 0, md: 0 },   // force no padding-top
        }}
      >

        <CustomImageContainer
          src={activeImage}
          height={{
            xs: "280px",   // MOBILE – unchanged
            sm: "300px",   // TABLET – reduced height
            md: "300px",   // TABLET – reduced height
            lg: "430px",   // DESKTOP – original
          }}
          width={{
            xs: "100%",    // MOBILE full width
            sm: "100%",     // TABLET reduced width
            md: "100%",     // TABLET reduced width
            lg: "100%",    // DESKTOP original width
          }}
          objectfit={{
            xs: "cover",
            sm: "cover", // TABLET – make full image visible
            md: "cover", // TABLET – make full image visible
            lg: "cover",
          }}
          borderRadius="10px"
          alt={vehicleDetails?.name || "Vehicle Image"}
          title={vehicleDetails?.name || "Vehicle Image"}
          style={{
            margin: "0 auto", // center tablet image
          }}
        />

        <IconButton
          onClick={handleWishlist}
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            // bgcolor: "#fff",
            // border: "1px solid #ddd",
          }}
        >
          {isWished ? <FavoriteIcon sx={{ color: "#ff0000" }} /> : <FavoriteBorderIcon />}
        </IconButton>
      </Box>

      {/* MOBILE & TABLET SLIDER */}
      <Box
        sx={{
          order: { xs: 2, sm: 2, md: 1 },
          width: "100%",
          display: { xs: "block", sm: "block", md: "none" },
        }}
      >
        <Swiper
          modules={[Autoplay]}
          slidesPerView={4}        // MOBILE → 4 per row
          slidesPerGroup={1}       // slide one at a time
          spaceBetween={8}
          autoplay={{
            delay: 2000,             // slide every 2 seconds
            disableOnInteraction: false, // keep autoplay active even after drag
          }}       // equal spacing
          breakpoints={{
            600: {
              slidesPerView: 5,    // TABLET → 1 per view
              spaceBetween: 16,    // spacing for tablet
            },
          }}
        >
          {images.map((imgUrl, i) => (
            <SwiperSlide key={i}>
              <Box
                sx={{
                  width: "100%",
                  height: 80,
                  borderRadius: "8px",
                  overflow: "hidden",
                  border:
                    activeImage === imgUrl
                      ? `2px solid ${theme.palette.primary.main}`
                      : "1px solid #ddd",
                  cursor: "pointer",
                }}
                onClick={() => setActiveImage(imgUrl)}
              >
                <CustomImageContainer
                  src={imgUrl}
                  alt={vehicleDetails?.name || "Vehicle Image"}
                  title={vehicleDetails?.name || "Vehicle Image"}
                  width="100%"
                  height="100%"
                  objectfit="cover"
                />
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>

      {/* DESKTOP ORIGINAL */}
      <Stack
        spacing={1}
        sx={{ display: { xs: "none", sm: "none", md: "flex" } }}
      >
        {images.map((imgUrl, i) => (
          <Box
            key={i}
            sx={{
              width: 120,
              height: 70,
              borderRadius: "8px",
              overflow: "hidden",
              border:
                activeImage === imgUrl
                  ? `2px solid ${theme.palette.primary.main}`
                  : "1px solid #ddd",
              cursor: "pointer",
            }}
            onClick={() => setActiveImage(imgUrl)}
          >
            <CustomImageContainer
              src={imgUrl}
              alt={vehicleDetails?.name || "Vehicle Image"}
              title={vehicleDetails?.name || "Vehicle Image"}
              width="100%"
              height="100%"
              objectfit="cover"
            />
          </Box>
        ))}
      </Stack>
    </Stack>
  );
};



/* RIGHT DETAILS CARD */
const RightDetailsCard = ({ vehicleDetails }) => {
  const isHourly = vehicleDetails?.trip_hourly;
  const isDistance = vehicleDetails?.trip_distance;

  // default price type
  const [priceType, setPriceType] = useState(
    isHourly ? "hourly" : "distance"
  );


  const tripTypeForPrice =
    priceType === "hourly" ? "hourly" : "distance_wise";

  const basePrice = mainPrice(vehicleDetails, tripTypeForPrice);

  const discountedPrice = getDiscountedAmount(
    basePrice,
    vehicleDetails?.discount_price,
    vehicleDetails?.discount_type,
    vehicleDetails?.provider?.discount,
    1,
    vehicleDetails?.provider?.discount?.max_discount
  );

  const handlePriceToggle = () => {
    if (isHourly && isDistance) {
      setPriceType((prev) =>
        prev === "hourly" ? "distance" : "hourly"
      );
    }
  };

  const price =
    priceType === "hourly"
      ? vehicleDetails?.hourly_price
      : vehicleDetails?.distance_price;

  const unit = priceType === "hourly" ? "hr" : "km";

  return (
    <RentalCardWrapper padding="20px" borderRadius="12px" sx={{ border: "1px solid #E5E7EB" }}>
      <Typography fontSize="22px" fontWeight="700">{vehicleDetails?.name}</Typography>

      <Stack direction="row" alignItems="center" spacing={1} mt={1}>
        <StarIcon sx={{ color: "#00A65A" }} />
        <Typography fontWeight="600">{vehicleDetails?.avg_rating || 0}</Typography>
        <Typography color="gray">({vehicleDetails?.total_trip} Trips)</Typography>
      </Stack>

      <Grid container spacing={2} mt={2}>
        <Spec icon={<GroupIcon />} label="Seats" value={vehicleDetails?.seating_capacity} />
        <Spec icon={<EvStationIcon />} label="Fuel Type" value={vehicleDetails?.fuel_type} />
        <Spec icon={<AirIcon />} label="AC/Non-AC" value={vehicleDetails?.air_condition ? "AC" : "Non-AC"} />
        <Spec icon={<ManageHistoryIcon />} label="Transmission" value={vehicleDetails?.transmission_type} />
        <Spec icon={<DirectionsCarFilledIcon />} label="Vehicle Type" value={vehicleDetails?.type} />
      </Grid>

      {/* PRICE TOGGLE */}
      <Typography mt={3} fontSize="14px" color="gray">Price</Typography>

      <Stack direction="row" spacing={1} alignItems="center">
        {/* Arrow toggle */}
        {vehicleDetails?.trip_hourly === 1 &&
          vehicleDetails?.trip_distance === 1 && (
            <IconButton size="small" onClick={handlePriceToggle}>
              <KeyboardArrowDownIcon />
            </IconButton>
          )}

        {/* Discounted Price */}
        <Typography
          sx={{
            fontSize: "22px",
            fontWeight: 700,
            color: "#1A914B",
          }}
        >
          {getAmountWithSign(discountedPrice)}
        </Typography>

        {/* Base Price Strike */}
        {basePrice !== discountedPrice && (
          <Typography
            sx={{
              fontSize: "16px",
              textDecoration: "line-through",
              color: "#9e9e9e",
            }}
          >
            {getAmountWithSign(basePrice)}
          </Typography>
        )}

        {/* Per Hr / Per Km */}
        <Typography sx={{ fontSize: "13px", color: "#666" }}>
          {priceType === "hourly" ? "Per Hr" : "Per Km"}
        </Typography>

      </Stack>



      <button
        onClick={() => {
          const btn = document.querySelector("#rent-fixed-button-wrapper button");
          if (btn) btn.click();
        }}
        style={{
          width: "99%",
          padding: "12px ",
          borderRadius: "8px",
          border: "1px solid #1A914B",
          background: "#1A914B",
          color: "#fff",
          fontSize: "16px",
          fontWeight: 500,
          cursor: "pointer",
          transition: "0.25s ease-in-out",
          fontFamily: "Inter, sans-serif"
        }}
        onMouseEnter={(e) => {
          e.target.style.background = "#fff";
          e.target.style.color = "#1A914B";
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "#1A914B";
          e.target.style.color = "#fff";
        }}
      >
        Rent this Vehicle
      </button>

      <div id="rent-fixed-button-wrapper" style={{ display: "none" }}>
        <VehicleDetailsRentThisCar vehicleDetails={vehicleDetails} priceType={priceType} />
      </div>
    </RentalCardWrapper>
  );
};

const Spec = ({ icon, label, value }) => (
  <Grid item xs={6}>
    <Stack direction="row" spacing={1} alignItems="center">{icon}
      <Stack><Typography fontSize="12px" color="gray">{label}</Typography><Typography fontWeight="600">{value}</Typography></Stack>
    </Stack>
  </Grid>
);

/* VENDOR CARD */
const VendorCard = ({ vehicleDetails }) => (
  <RentalCardWrapper padding="16px" borderRadius="12px" sx={{ border: "1px solid #E5E7EB" }}>
    <VendorProfile vehicleDetails={vehicleDetails} />
    <Box mt={2}>
      {/* <button
        onClick={() => (window.location.href = `/rental/provider-details/${vehicleDetails?.provider?.id}`)}
        style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid #16A34A", background: "transparent", color: "#16A34A", fontSize: "16px", fontWeight: 600, cursor: "pointer", transition: "0.25s ease-in-out" }}
        onMouseEnter={(e) => { e.target.style.background = "#16A34A"; e.target.style.color = "#fff"; }}
        onMouseLeave={(e) => { e.target.style.background = "transparent"; e.target.style.color = "#16A34A"; }}
      >Visit Vendor</button> */}
    </Box>
  </RentalCardWrapper>
);
