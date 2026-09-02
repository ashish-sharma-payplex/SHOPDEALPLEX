import React, { useEffect, useState } from "react";
import {
  CustomPaperBigCard,
  CustomStackFullWidth,
} from "styled-components/CustomStyles.style";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import useGetOrderDetails from "../../api-manage/hooks/react-query/order/useGetOrderDetails";
import GroupButtonsRateAndReview from "./GroupButtonsRateAndReview";
import ItemForm from "./ItemsFrom";
import Shimmer from "./Shimmer";
import DeliverymanForm from "./DeliverymanForm";
import useGetTrackOrderData from "../../api-manage/hooks/react-query/order/useGetTrackOrderData";
import { Box, Skeleton, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import CustomEmptyResult from "../custom-empty-result";
import nodata from "../../../public/static/nodata.png";
import { Stack } from "@mui/system";
import StarRoundedIcon from "@mui/icons-material/StarRounded";

const RateAndReview = () => {
  const { deliveryManInfo } = useSelector((state) => state.searchFilterStore);
  const [type, setType] = useState("items");
  const router = useRouter();
  const { id } = router.query;
  const theme = useTheme();
  const { t } = useTranslation();
  const { refetch, data, isRefetching } = useGetOrderDetails(id);
  const {
    refetch: refetchTrackOrder,
    data: trackOrderData,
    isRefetching: refetchingTrackOrder,
  } = useGetTrackOrderData(id);

  useEffect(() => {
    if (id) {
      refetch();
      refetchTrackOrder();
    }
  }, [id]);

  const itemCount = Array.isArray(data?.items) ? data.items.length : 0;

  return (
    <CustomStackFullWidth
      alignItems="center"
      justifyContent="center"
      spacing={2.5}
      mt="1rem"
      mb="2rem"
      sx={{
        maxWidth: "720px",
        mx: "auto",
        px: { xs: "1rem", sm: 0 },
        mt: { xs: "1rem", sm: "3rem" },
      }}
    >
      {/* Page header */}
      <CustomStackFullWidth alignItems="center" spacing={0.5} mb="0.25rem">
        <Box
          sx={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: "0.4rem",
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark || theme.palette.primary.main})`,
            boxShadow: `0 6px 16px -4px ${theme.palette.primary.main}90`,
          }}
        >
          <StarRoundedIcon sx={{ color: "#fff", fontSize: "24px" }} />
        </Box>
        <Typography
          fontSize={{ xs: "16px", sm: "18px" }}
          fontWeight="700"
          color={theme.palette.neutral[800] || theme.palette.text.primary}
          textAlign="center"
        >
          {t("Rate & Review")}
        </Typography>
        <Typography
          fontSize={{ xs: "11.5px", sm: "13px" }}
          fontWeight="400"
          color={theme.palette.neutral[600]}
          textAlign="center"
          sx={{ maxWidth: "360px" }}
        >
          {type === "items" && data?.module_type !== "parcel"
            ? t("Tell us what you thought about each item")
            : t("Tell us how your delivery experience was")}
        </Typography>
      </CustomStackFullWidth>

      <>
        {isRefetching ? (
          <Skeleton
            variant="rounded"
            width="220px"
            height="42px"
            sx={{ borderRadius: "12px" }}
          />
        ) : (
          deliveryManInfo &&
          data?.module_type !== "parcel" && (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                p: "6px",
                borderRadius: "14px",
                backgroundColor: theme.palette.neutral[100] || "#f5f5f5",
                border: `1px solid ${theme.palette.neutral[200] || "rgba(0,0,0,0.05)"}`,
              }}
            >
              <GroupButtonsRateAndReview
                setType={setType}
                type={type}
                moduleType={data?.module_type}
              />
            </Box>
          )
        )}

        <CustomStackFullWidth
          alignItems="center"
          justifyContent="center"
          spacing={2.5}
        >
          {type === "items" && data?.module_type !== "parcel" ? (
            data ? (
              itemCount > 0 ? (
                <>
                  <CustomStackFullWidth
                    direction="row"
                    alignItems="center"
                    justifyContent="flex-start"
                    sx={{ px: "0.25rem" }}
                  >
                    <Typography
                      fontSize="12px"
                      fontWeight="600"
                      color={theme.palette.neutral[500] || theme.palette.text.secondary}
                      sx={{ textTransform: "uppercase", letterSpacing: "0.04em" }}
                    >
                      {itemCount} {itemCount === 1 ? t("item") : t("items")}
                    </Typography>
                  </CustomStackFullWidth>

                  {data.items.map((item, index) => {
                    return (
                      <CustomPaperBigCard
                        key={item?.id ?? index}
                        sx={{
                          width: "100%",
                          borderRadius: "16px",
                          border: `1px solid ${theme.palette.neutral[200] || "rgba(0,0,0,0.06)"}`,
                          boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
                          transition: "box-shadow 0.2s ease, transform 0.2s ease",
                          "&:hover": {
                            boxShadow: "0 8px 24px rgba(0,0,0,0.09)",
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        <ItemForm data={item} orderId={id} />
                      </CustomPaperBigCard>
                    );
                  })}
                </>
              ) : (
                <CustomStackFullWidth
                  justifyContent="center"
                  alignItems="center"
                >
                  <Stack
                    width="100%"
                    alignItems="center"
                    justifyContent="center"
                    height="100%"
                    sx={{
                      py: "2.5rem",
                      borderRadius: "18px",
                      backgroundColor: theme.palette.neutral[50] || "#fafafa",
                      border: `1px dashed ${theme.palette.neutral[200] || "rgba(0,0,0,0.08)"}`,
                    }}
                  >
                    <CustomEmptyResult
                      label="No items found to review for this order."
                      image={nodata}
                    />
                  </Stack>
                </CustomStackFullWidth>
              )
            ) : (
              <Shimmer />
            )
          ) : (
            <CustomPaperBigCard
              sx={{
                width: "100%",
                borderRadius: "16px",
                border: `1px solid ${theme.palette.neutral[200] || "rgba(0,0,0,0.06)"}`,
                boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
              }}
            >
              {trackOrderData?.delivery_man ? (
                <DeliverymanForm
                  data={trackOrderData?.delivery_man}
                  orderId={id}
                />
              ) : (
                <CustomStackFullWidth
                  justifyContent="center"
                  alignItems="center"
                >
                  <Stack
                    width="100%"
                    alignItems="center"
                    justifyContent="center"
                    height="100%"
                    sx={{
                      py: "2.5rem",
                      borderRadius: "18px",
                      backgroundColor: theme.palette.neutral[50] || "#fafafa",
                      border: `1px dashed ${theme.palette.neutral[200] || "rgba(0,0,0,0.08)"}`,
                    }}
                  >
                    <CustomEmptyResult
                      label="No delivery man assigned for the delivery."
                      image={nodata}
                    />
                  </Stack>
                </CustomStackFullWidth>
              )}
            </CustomPaperBigCard>
          )}
        </CustomStackFullWidth>
      </>
    </CustomStackFullWidth>
  );
};

export default RateAndReview;