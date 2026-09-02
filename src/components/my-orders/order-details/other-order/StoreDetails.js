import { Button, Grid, useMediaQuery, useTheme } from "@mui/material";
import { Stack, styled } from "@mui/system";
import { useRouter } from "next/router";
import React from "react";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import { InformationGrid } from "../../myorders.style";
import MessageSvg from "./MessageSvg";
import StoreAndDeliveryManCommon from "./StoreAndDeliveryManCommon";
import StoreFeature from "./StoreFeature";
import { getToken } from "helper-functions/getToken";
import { toast } from "react-hot-toast";
import { no_chatting_plan } from "utils/toasterMessages";

// Add a StoreChatButton with proper styling
export const StoreChatButton = styled(Button)(({ theme, reviewed }) => ({
  height: "42px",
  backgroundColor: reviewed ? theme.palette.grey[400] : theme.palette.primary.main,  // Change color based on review status
  color: reviewed ? theme.palette.text.disabled : theme.palette.whiteContainer.main,  // Change text color for reviewed status
  [theme.breakpoints.down("md")]: {
    height: "33px",
    padding: "6px 6px",
    minWidth: "34px",
  },
  "&:hover": {
    backgroundColor: reviewed ? theme.palette.grey[500] : theme.palette.primary.dark,  // Adjust hover state for reviewed orders
  },
}));

// Function that checks if the order has been reviewed
export const hasChatAndReview = (storeData, order) => {
  let isChat = 0;
  let isReview = 0;
  
  // If store's business model is commission-based, it supports both chat and reviews
  if (storeData?.store_business_model === "commission") {
    isChat = 1;
    isReview = 1;
  } else if (storeData?.store_business_model === "subscription") {
    isChat = storeData.store_sub?.chat ?? 0;
    isReview = storeData.store_sub?.review ?? 0;
  }

  // Check if the order is already reviewed
  const isOrderReviewed = order?.isReviewed ? true : false;

  return { isReview, isChat, isOrderReviewed };
};

const StoreDetails = (props) => {
  const { storeData, order, configData, t } = props;
  const router = useRouter();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));

  const { isChat, isReview, isOrderReviewed } = hasChatAndReview(storeData, order);

  const handleClick = () => {
    if (!getToken()) {
      toast.error(no_chatting_plan);  // Optionally show message if user is not logged in
      return;
    }
    router.push({
      pathname: "/profile",
      query: {
        page: "inbox",
        type: "vendor",
        id: storeData?.vendor_id,
        routeName: "vendor_id",
        chatFrom: "true",
        deliveryman_name: storeData?.name,
        deliveryManData_image: storeData?.logo_full_url,
      },
    });
  };

  const handleReviewButtonClick = () => {
    if (isOrderReviewed) {
      // Logic for handling if already reviewed (optional feedback)
      toast.success("You have already reviewed this order!");
    } else {
      // Logic to navigate to the review page (you can also add more functionality)
      router.push(`/rate-and-review/${order?.id}`, undefined, { shallow: true });
    }
  };

  return (
    <CustomStackFullWidth
      sx={{
        padding: {
          xs: "20px 10px",
          md: "20px 40px",
        },
      }}
    >
      <InformationGrid container spacing={2}>
        <Grid container item md={12} xs={12} spacing={2}>
          <Stack direction="row" width="100%" spacing={1}>
            <StoreAndDeliveryManCommon
              data={storeData}
              configData={configData}
              imageUrl={configData?.base_urls?.store_cover_photo_url}
              image={storeData?.cover_photo_full_url}
            />

            {getToken() && isChat === 1 && (
              <StoreChatButton
                variant="contained"
                startIcon={!isSmall && <MessageSvg />}
                onClick={handleClick}
                sx={{ height: "42px" }}
              >
                {isSmall ? <MessageSvg /> : t("See Chat History")}
              </StoreChatButton>
            )}
          </Stack>

          <Grid item md={12} xs={12}>
            <CustomStackFullWidth
              direction="row"
              gap={{ xs: "15px", sm: "50px", md: "50px" }}
            >
              <StoreFeature count={`${storeData?.positive_rating?.toFixed(2)}%`} title="Positive Review" />
              {storeData?.total_items && (
                <StoreFeature count={storeData?.total_items} title="Products" />
              )}
              <StoreFeature count={storeData?.delivery_time} title="Delivery Time" />
            </CustomStackFullWidth>
          </Grid>

          {/* Review button logic */}
          <Grid item md={12} xs={12}>
            <StoreChatButton
              variant="contained"
              onClick={handleReviewButtonClick}
              reviewed={isOrderReviewed} // Pass the review status to the button for color change
            >
              {isOrderReviewed ? t("Reviewed") : t("Review")}
            </StoreChatButton>
          </Grid>
        </Grid>
      </InformationGrid>
    </CustomStackFullWidth>
  );
};

StoreDetails.propTypes = {};

export default StoreDetails;
