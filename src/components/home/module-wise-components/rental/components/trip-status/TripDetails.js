// src\components\home\module-wise-components\rental\components\trip-status\TripDetails.js
import React from "react";
import { Box, Grid, Stack, Typography, IconButton, Skeleton } from "@mui/material";
import RoomIcon from "@mui/icons-material/Room";
import NearMeIcon from "@mui/icons-material/NearMe";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import BorderColorOutlinedIcon from "@mui/icons-material/BorderColorOutlined";
import AccessTimeIcon from '@mui/icons-material/AccessTime'; // Added for time icon
import { t } from "i18next";
import { isCurrentTime } from "../rental-checkout/checkoutHeplerFunction";
import { useSelector } from "react-redux";
import { FormatedDateWithTime } from "utils/CustomFunctions";
import moment from "moment";
import CardDetailsSingleCard from "../global/CardDetailsSingleCard";
import RentalCardWrapper from "../global/RentalCardWrapper";
import { useTheme } from "@mui/material/styles";

const TripDetails = ({
  tripDetails,
  setModalType,
  setOpenModal,
  checkOut,
  setOpenTripChange,
  setOpenModalCheckout,
}) => {
  const { cartList } = useSelector((state) => state.cart);
  const theme = useTheme();
  // Image में हल्का हरा रंग #1A914B जैसा है, लेकिन मैंने थीम प्राइमरी का उपयोग किया है।
  const GREEN = checkOut ? theme.palette.success.main : theme.palette.primary.main;
  const isLoading =
  !tripDetails ||
  !tripDetails?.pickup_location ||
  !tripDetails?.destination_location;


  // यदि checkOut prop true है, तो कॉम्पैक्ट डिज़ाइन का उपयोग करें।
  if (checkOut) {
  if (isLoading) {
    return (
      <Box sx={{ mt: 0 }}>
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={6} key={item}>
              <Stack spacing={1}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Skeleton variant="circular" width={24} height={24} />
                  <Skeleton width="60%" height={20} />
                </Box>
                <Skeleton
                  width="80%"
                  height={20}
                  sx={{ ml: "28px" }}
                />
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

    // --- कॉम्पैक्ट चेकआउट डिज़ाइन (जैसा इमेज में है) ---
    return (
      <Box sx={{ mt: 0 }}>
        {/* Title and Edit Button - अब RentalCheckoutPage में हैंडल किया जाएगा
        लेकिन, यदि आप इसे Component के अंदर ही चाहते हैं, तो यह पुराना कोड वापस ला सकते हैं: 
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography fontWeight={600} fontSize="1rem">
            {t("Trip Details")}
          </Typography>
          <IconButton
            onClick={() => setOpenModalCheckout?.(true)}
            size="small"
            sx={{ color: GREEN }}
            aria-label="edit trip"
          >
            <BorderColorOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
        */}
        
        <Grid container spacing={2}>
          {/* Pickup Address */}
          <Grid item xs={6}>
            <Stack spacing={0.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RoomIcon sx={{ fontSize: 22, color: GREEN }} />
                <Typography variant="body1" color="text.secondary" fontWeight="500">
                  {t("Pickup Address")}
                </Typography>
              </Box>
              <Typography fontWeight="500" fontSize="15px" sx={{ ml: '28px !Important' }}>
                {tripDetails?.pickup_location?.location_name}
              </Typography>
            </Stack>
          </Grid>
          
          {/* Drop-off Address */}
          <Grid item xs={6}>
            <Stack spacing={0.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NearMeIcon sx={{ fontSize: 22, color: GREEN }} />
                <Typography variant="body1" color="text.secondary" fontWeight="500">
                  {t("Drop-off Address")}
                </Typography>
              </Box>
              <Typography fontWeight="500" fontSize="15px" sx={{ml: '28px !Important'}}>
                {tripDetails?.destination_location?.location_name}
              </Typography>
            </Stack>
          </Grid>

          {/* Pickup Time */}
          <Grid item xs={6}>
            <Stack spacing={0.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon sx={{ fontSize: 22, color: GREEN }} />
                <Typography variant="body1" color="text.secondary" fontWeight="500">
                  {t("Pickup Time")}
                </Typography>
              </Box>
              <Typography fontWeight="500" fontSize="15px" sx={{ ml: '28px !Important' }}>
                {/* Time logic as per your previous implementation */}
                {isCurrentTime(cartList)
                  ? FormatedDateWithTime(cartList?.user_data?.pickup_time)
                  : FormatedDateWithTime(new Date())}
              </Typography>
            </Stack>
          </Grid>
          
          {/* Rent Type */}
          <Grid item xs={6}>
            <Stack spacing={0.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HourglassEmptyOutlinedIcon sx={{ fontSize: 22, color: GREEN }} />
                <Typography variant="body1" color="text.secondary" fontWeight="500">
                  {t("Rent Type")}
                </Typography>
              </Box>
              <Typography 
                fontWeight="500" 
                fontSize="14px" 
                sx={{ ml: '28px !Important', textTransform: "capitalize" }}
              >
                {tripDetails?.trip_type?.replace("_", " ")}
                {(tripDetails?.estimated_hours > 0 && tripDetails?.trip_type === "hourly") && (
                  <Typography component="span" sx={{ fontWeight: 400, fontSize: 14, color: (theme) => theme.palette.neutral[400] }}>
                    {` (${tripDetails?.estimated_hours} hr)`}
                  </Typography>
                )}
              </Typography>
            </Stack>
          </Grid>
          
        </Grid>
      </Box>
    );
  }

  // --- default/original design (जब checkOut prop false है) ---
  return (
    <Box sx={{ mt: 3 }}>
      <RentalCardWrapper
        sx={{
          background: "#FFFFFF",
          border: "1px solid #E7E7E7",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          borderRadius: "12px",
          p: { xs: 2, md: 3 },
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography fontWeight={600} fontSize="1rem">
            {t("Trip Details")}
          </Typography>

          {setOpenModalCheckout && ( // Use setOpenModalCheckout to control Edit icon visibility
            <IconButton
              onClick={() => setOpenModalCheckout(true)}
              size="small"
              sx={{ color: GREEN }}
              aria-label="edit trip"
            >
              <BorderColorOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          )}
        </Stack>

        {/* Trip Information Section */}
        <Box
          sx={{
            borderRadius: 2,
            mt: 3,
            mb: 2,
            border: "1px solid #F0F0F0",
            p: 1,
            background: "#FAFAFA",
          }}
        >
          <CardDetailsSingleCard
            sx={{ justifyContent: "space-between" }}
            isShowEdit={false}
            icon={<RoomIcon sx={{ fontSize: 18, color: GREEN }} />}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
              <Typography sx={{ fontWeight: 500, fontSize: 14 }}>
                {tripDetails?.pickup_location?.location_name}
              </Typography>
            </Box>

            {!checkOut && (
              <Typography
                onClick={() => {
                  setModalType("map");
                  setOpenModal(true);
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: { xs: "12px", md: "14px" },
                  color: (theme) => theme.palette.info.main,
                  textDecoration: "underline",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {t("Map View")}
                <RoomIcon sx={{ color: (theme) => theme.palette.primary.main, ml: 0.5, fontSize: 16 }} />
              </Typography>
            )}
          </CardDetailsSingleCard>

          <CardDetailsSingleCard
            isShowEdit={false}
            icon={<NearMeIcon sx={{ fontSize: 18, color: GREEN }} />}
            sx={{ position: "relative", mt: 1 }}
          >
            <Box
              sx={{
                width: "1px",
                borderLeft: `1px dashed rgba(0,0,0,0.08)`,
                height: "50%",
                position: "absolute",
                top: "-15px",
                left: { xs: "11%", md: "4%" },
              }}
            />
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <Typography sx={{ fontWeight: 500, fontSize: 14 }}>
                <Typography
                  sx={{
                    fontWeight: 500,
                    fontSize: 14,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {tripDetails?.destination_location?.location_name}
                </Typography>
              </Typography>
            </Box>
          </CardDetailsSingleCard>
        </Box>

        {/* Time Details Section */}
        <Grid container spacing={2}>
          <Grid item xs={12} lg={6}>
            <CardDetailsSingleCard
              sx={{
                borderRadius: 2,
                justifyContent: "space-between",
                border: "1px solid #F0F0F0",
              }}
              isShowEdit={false}
              icon={<RoomIcon sx={{ fontSize: 18, color: GREEN }} />}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Typography sx={{ fontWeight: 500, fontSize: 14 }}>
                  {isCurrentTime(cartList) ? t("Schedule at") : !checkOut ? t("Pickup Time") : t("Pickup Now")}
                </Typography>
                <Typography component="span" sx={{ fontWeight: 400, fontSize: 14, color: (theme) => theme.palette.neutral[400] }}>
                  {checkOut
                    ? isCurrentTime(cartList)
                      ? FormatedDateWithTime(cartList?.user_data?.pickup_time)
                      : FormatedDateWithTime(new Date())
                    : moment(tripDetails?.schedule_at, "YYYY-MM-DD HH:mm:ss").format("DD MMM, YYYY, hh:mm a")}
                </Typography>
              </Box>
            </CardDetailsSingleCard>
          </Grid>

          <Grid item xs={12} lg={6}>
            <CardDetailsSingleCard
              sx={{
                borderRadius: 2,
                justifyContent: "space-between",
                border: "1px solid #F0F0F0",
              }}
              isShowEdit={false}
              icon={<HourglassEmptyOutlinedIcon sx={{ fontSize: 18, color: GREEN }} />}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Typography sx={{ fontWeight: 500, fontSize: 14, textTransform: "capitalize" }}>
                  {tripDetails?.trip_type?.replace("_", " ")}
                </Typography>

                {tripDetails?.estimated_hours > 0 && tripDetails?.trip_type === "hourly" && (
                  <Typography component="span" sx={{ fontWeight: 400, fontSize: 14, color: (theme) => theme.palette.neutral[400] }}>
                    {t("Estimated")} {tripDetails?.estimated_hours} hr
                  </Typography>
                )}

                {tripDetails?.trip_type === "distance_wise" && tripDetails?.distance > 0 && (
                  <Typography component="span" sx={{ fontWeight: 400, fontSize: 14, color: (theme) => theme.palette.neutral[400] }}>
                    {tripDetails?.distance?.toFixed(3)} Km
                  </Typography>
                )}
              </Box>
            </CardDetailsSingleCard>
          </Grid>
        </Grid>
      </RentalCardWrapper>
    </Box>
  );
};

export default TripDetails;