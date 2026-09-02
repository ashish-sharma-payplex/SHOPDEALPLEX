
// src\components\my-orders\order\index.js
import StarBorderSharpIcon from "@mui/icons-material/StarBorderSharp";
import {
  Button,
  Chip,
  Grid,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Stack } from "@mui/system";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { getAmountWithSign } from "helper-functions/CardHelpers";
import { setDeliveryManInfoByDispatch } from "redux/slices/searchFilter";
import {
  CustomPaperBigCard,
  CustomStackFullWidth,
  StoreImageBox,
} from "styled-components/CustomStyles.style";
import CustomImageContainer from "../../CustomImageContainer";
import CustomFormatedDateTime from "../../date/CustomFormatedDateTime";
import TrackParcelOrderDrawer from "../../home/module-wise-components/parcel/TrackParcelOrderDrawer";
import trackOrderIcon1 from "../assets/Maskroup.svg";
import trackOrderIcon from "../assets/trackOrderIcon.png";
import { DateTypography, TrackOrderButton } from "../myorders.style";
import { getImageUrl } from "utils/CustomFunctions";
import { hasChatAndReview } from "components/my-orders/order-details/other-order/StoreDetails";
import { toast } from "react-hot-toast";
import { no_chatting_plan, no_review_plan } from "utils/toasterMessages";
import { t } from "i18next";
export const CustomPaper = styled(CustomPaperBigCard)(({ theme }) => ({
  padding: "10px 10px 10px 0px",
  // backgroundColor: alpha(theme.palette.neutral[300], 0.4),
  boxShadow: "none",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.palette.neutral[100],
    boxShadow: " 0px 4px 12px rgba(88, 110, 125, 0.1)",
  },
  [theme.breakpoints.down("md")]: {
    // backgroundColor: theme.palette.neutral[100],
    // boxShadow: " 0px 4px 12px rgba(88, 110, 125, 0.1)",
  },
  [theme.breakpoints.down("sm")]: {
    maxWidth: "100%",
    // padding: "12px 10px",
  },

}));
const OrderStatusTypography = styled(Typography)(({ theme, color }) => ({
  color: color,
  fontWeight: 600,
  fontSize: "14px",
  textTransform: "capitalize",
  [theme.breakpoints.down("md")]: {
    fontSize: "12px",
  },
}));

const Order = (props) => {
  const theme = useTheme();
  const { order, t, configData, dispatch, index } = props;
  //   console.log("ORDER FULL 👉", order);
  // console.log("ITEMS 👉", order?.items);
  // console.log("FIRST ITEM 👉", order?.items?.[0]);
  // console.log("IMAGE 👉", order?.items?.[0]?.image);

  const isMobileTablet = useMediaQuery(theme.breakpoints.down("md")); // 👈 ADD THIS

  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);

  const flag = order?.store?.isReviewed ? 0 : 1;
  const isXSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const storeImage =
    order?.module_type === "parcel"
      ? "parcel_category_image_url"
      : "store_image_url";
  const router = useRouter();
  const label =
    t(order?.order_status).replaceAll("_", " ").length > 15
      ? t(order?.order_status).replaceAll("_", " ").slice(0, 15) + "..."
      : t(order?.order_status).replaceAll("_", " ");
  const handleClick = (e) => {
    if (order?.delivery_man) {
      dispatch(setDeliveryManInfoByDispatch(order?.delivery_man));
    }
    if (order?.module_type === "parcel") {
      if (sideDrawerOpen) {
      } else {
        router.push({
          pathname: "profile",
          query: {
            orderId: order?.id,
            page: "my-orders",
          },
        });
      }
    } else {
      router.push({
        pathname: "profile",
        query: {
          orderId: order?.id,
          page: "my-orders",
        },
      });
    }
  };
  const handleRateButtonClick = (e) => {
    if (hasChatAndReview(order?.store)?.isReview === 1) {
      e.stopPropagation();
      router.push(`/rate-and-review/${order?.id}`, undefined, {
        shallow: true,
      });
    } else {
      toast.error(no_review_plan);
    }
  };
  const handleClickTrackOrder = (e) => {
    e.stopPropagation();
    if (order?.delivery_man) {
      e.stopPropagation();
      dispatch(setDeliveryManInfoByDispatch(order?.delivery_man));
    }
    if (order?.module_type === "parcel") {
      e.stopPropagation();
      setSideDrawerOpen(true);
    } else {
      router.push(
        {
          pathname: "profile",
          query: {
            page: "my-orders",
            orderId: order?.id,
            tab: "track-order",
          },
        },
        undefined,
        { shallow: true }
      );
    }
  };
  const color = () => {
    if (
      order?.order_status === "pending" ||
      order?.order_status === "failed" ||
      order?.order_status === "canceled"
    ) {
      return alpha(theme.palette.error.main, 0.8);
    }
    if (
      order?.order_status === "confirmed" ||
      order?.order_status === "picked_up" ||
      order?.order_status === "delivered"
    ) {
      return theme.palette.primary.main;
    }
  };

  const deliveredInformation = () => (
    <>
      {hasChatAndReview(order?.store)?.isReview === 1 && (
        <Button
          onClick={(e) => handleRateButtonClick(e)}
          variant="outlined"
          startIcon={
            <StarBorderSharpIcon
              sx={{
                width: { xs: "19px", sm: "19px", md: "20px" },
                height: "23px",
                paddingBottom: "3px",
              }}
            />
          }
          sx={{
            p: {
              xs: "5px 10px 5px 10px",
              sm: "8px 15px 8px 15px",
              md: "7px 15px 7px 15px",
            },
            fontSize: {
              xs: "12px",
              sm: "12px",
              md: "14px",
            },
            "&:hover": {
              backgroundColor: (theme) => theme.palette.primary.dark,
              color: (theme) => theme.palette.whiteContainer.main,
            },
          }}
        >
          {flag === 0 ? t("Reviewed") : t("Review")}
        </Button>
      )}
    </>
  );

  const notDeliveredInformation = () => (
    <>
      {order?.order_status !== "delivered" &&
        order?.order_status !== "failed" &&
        order?.order_status !== "canceled" &&
        order?.order_status !== "refund_requested" &&
        order?.order_status !== "refund_request_canceled" &&
        order?.order_status !== "refunded" && (
          <Stack
            flexWrap="wrap"
            paddingRight={{ xs: "0px", md: "20px" }}
            alignItems="center"
          >
            <TrackOrderButton
              variant="outlined"
              size="small"
              fullWidth={isXSmall}
              onClick={(e) => handleClickTrackOrder(e)}
              sx={{
                p: { xs: "6px 0", sm: "6px 12px", md: "7px 15px" },
                fontSize: { xs: "13px", sm: "14px", md: "14px" },
                minWidth: { xs: "100%", sm: "auto" },
              }}
            >
              {t("Track Order")}
            </TrackOrderButton>
          </Stack>
        )}
    </>
  );

  // 🔥 STATUS COLOR HELPER
  const getStatusColor = (status) => {
    switch (status) {
      case "canceled":
      case "failed":
        return theme.palette.error.main;     // red
      case "pending":
        return theme.palette.info.main;      // blue
      case "delivered":
        return "#078A46";                    // green
      default:
        return theme.palette.text.secondary;
    }
  };




  return (
    <CustomPaper onClick={(e) => handleClick(e)}>

      {isMobileTablet ? (
        /* ================= MOBILE + TABLET (CODE 2) ================= */
        <Grid
          container
          spacing={1}
          sx={{
            p: 1,
            border: "1px solid #ddd",
            borderRadius: 1,
            maxWidth: 400,
            mx: "auto",
          }}
        >
          {/* Top row: Status + Track */}
          <Grid item xs={12}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">


              <Button
                variant="contained"
                disableElevation
                sx={{
                  backgroundColor: getStatusColor(order?.order_status),
                  color: "#fff",
                  fontWeight: 600,
                  textTransform: "capitalize",
                  height: 24,
                  borderRadius: "6px",
                  px: 1,
                  py: 0,
                  fontSize: 12,
                  maxWidth: 135,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                {label}
              </Button>

              <Button
                size="small"
                variant="text"
                onClick={handleClickTrackOrder}
                sx={{
                  color: "#078A46",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 13,
                  p: 0,
                  border: "1px solid #078A46",
                  borderRadius: "6px",
                  px: 1,
                  py: 0.3
                }}
              >
                {t("Track Order")}
              </Button>
            </Stack>
          </Grid>

          {/* Bottom row */}
          <Grid item xs={12} container spacing={3} alignItems="center">
            <Grid item xs={4}>
              <StoreImageBox
                borderraduis="10px"
                padding="4px"
                border={`1px solid ${alpha(theme.palette.neutral[400], 0.2)}`}
                sx={{ width: 70, height: 70 }}
              >
                <CustomImageContainer
                  src={
                    order?.items?.length > 0
                      ? order?.items[0]?.image
                      : order?.store?.logo_full_url
                  }
                  width="100%"
                  height="100%"
                  objectfit="contain"
                />
              </StoreImageBox>
            </Grid>

            <Grid item xs={8}>
              <Typography fontWeight={600} fontSize={14} noWrap>
                {order?.store?.name}
              </Typography>

              <Typography fontSize={12} color="text.secondary" noWrap>
                #{order?.id}
              </Typography>

              <Typography fontSize={12} color="text.secondary" noWrap>
                <CustomFormatedDateTime date={order?.created_at} />
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      ) : (
        /* ================= LAPTOP (CODE 1 — UNCHANGED) ================= */
        <Grid container spacing={1} alignItems="flex-start">
          {/* Image Section */}
          <Grid
            item
            md={1.5}
            container
            justifyContent="flex-start"
          >
            <StoreImageBox
              borderraduis="10px"
              padding="2px"
              border={`1px solid ${alpha(theme.palette.neutral[400], 0.2)}`}
              sx={{ width: 100 }}
            >
              <CustomImageContainer
                src={
                  order?.items?.length > 0
                    ? order?.items[0]?.image
                    : order?.store?.logo_full_url
                }
                width="100%"
                height="100%"
                objectfit="contain"
              />
            </StoreImageBox>
          </Grid>

          {/* Details Section */}
          <Grid item md={10.5}>
            <Stack
              spacing={1}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
            >
              {/* Left info */}
              <Stack spacing={0.4} sx={{ flex: 1 }}>
                <Typography fontWeight="600" fontSize="14px" noWrap>
                  {order?.store?.name}
                </Typography>

                {order?.order_type !== "parcel" && (
                  <Typography fontSize="12px" color="text.secondary" noWrap>
                    ( {order?.details_count} {t("Items")} )
                  </Typography>
                )}

                <Typography fontSize="12px" color="text.secondary" noWrap>
                  #{order?.id}
                </Typography>

                <OrderStatusTypography
                  sx={{ color: getStatusColor(order?.order_status) }}
                >
                  {t(order?.order_status).replaceAll("_", " ")}
                </OrderStatusTypography>




                <DateTypography>
                  <CustomFormatedDateTime date={order?.created_at} />
                </DateTypography>
              </Stack>

              {/* Right side */}
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography fontSize="16px" fontWeight="500">
                  {getAmountWithSign(order?.order_amount)}
                </Typography>

                {order?.order_status === "delivered"
                  ? deliveredInformation()
                  : notDeliveredInformation()}
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      )}

      {sideDrawerOpen && (
        <TrackParcelOrderDrawer
          orderId={order?.id}
          sideDrawerOpen={sideDrawerOpen}
          setSideDrawerOpen={setSideDrawerOpen}
          closeHandler={() => setSideDrawerOpen(false)}
        />
      )}
    </CustomPaper>

  );
};
Order.propTypes = {};

export default Order;
