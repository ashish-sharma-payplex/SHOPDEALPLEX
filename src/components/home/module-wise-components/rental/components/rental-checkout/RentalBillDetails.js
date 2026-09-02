// src\components\home\module-wise-components\rental\components\rental-checkout\RentalBillDetails.js
import { fontWeight } from "@mui/system";
import H3 from "components/typographies/H3";
import React from "react";
import { CustomBoxFullWidth } from "styled-components/CustomStyles.style";
import ErrorIcon from "@mui/icons-material/Error";
import { Box, Grid, Skeleton, Stack, Tooltip, Typography } from "@mui/material";
import { t } from "i18next";
import { PrimaryToolTip } from "components/cards/QuickView";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { getAmountWithSign } from "helper-functions/CardHelpers";
import { getTaxableTotalPrice } from "utils/CustomFunctions";
import { useSelector } from "react-redux";
const RentalBillDetails = ({
  showTotal = true,
  tripDiscount,
  tripCost,
  subTotal,
  rentalCoupon,
  vatTax,
  storeData,
  totalPrice,
  couponDiscount,
  vatPer,
  additionalCharge,
}) => {
  const { configData } = useSelector((state) => state.configData);
  const isLoading =
    tripCost === undefined ||
    subTotal === undefined ||
    totalPrice === undefined;
  if (isLoading) {
    return (
      <>
        {/* Header Skeleton */}
        <CustomBoxFullWidth
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Skeleton width="150px" height={28} />
          <Skeleton variant="circular" width={20} height={20} />
        </CustomBoxFullWidth>

        {/* Bill Card Skeleton */}
        <CustomBoxFullWidth
          sx={{
            border: (theme) => `1px solid ${theme.palette.neutral[200]}`,
            my: "10px",
            borderRadius: "10px",
            p: "20px",
          }}
        >
          {[1, 2, 3, 4, 5].map((item) => (
            <Stack
              key={item}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: "15px" }}
            >
              <Skeleton width="40%" height={20} />
              <Skeleton width="80px" height={20} />
            </Stack>
          ))}

          {/* Total Skeleton */}
          {showTotal && (
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mt: "20px" }}
            >
              <Skeleton width="60px" height={25} />
              <Skeleton width="100px" height={25} />
            </Stack>
          )}
        </CustomBoxFullWidth>
      </>
    );
  }

  return (
    <>
      <CustomBoxFullWidth
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          width="100%"
          mb={2.5}
          mt={3}
        >
          {/* Title + Gradient Line */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            flex={1} // take remaining space
          >
            <Typography
              fontSize="18px"
              fontWeight={700}
              color={(theme) => theme.palette.neutral[1000]}
              whiteSpace="nowrap"
            >
              {t("Bill Details")}
            </Typography>

            {/* Gradient line */}
            <Stack
              flex={1}
              height="2px"
              sx={{
                background:
                  "linear-gradient(to right, #e0e0e0 0%, #e0e0e0 60%, rgba(224,224,224,0) 100%)",
              }}
            />
          </Stack>

          {/* Tooltip at far end */}
          <Tooltip
            title={t(
              "Price may vary based on time or distance and total trip cost calculated accordingly."
            )}
            placement="bottom"
            arrow
            componentsProps={{
              tooltip: {
                sx: {
                  bgcolor: (theme) => theme.palette.toolTipColor,
                  "& .MuiTooltip-arrow": {
                    color: (theme) => theme.palette.toolTipColor,
                  },
                },
              },
            }}
          >
            <ErrorIcon
              sx={{
                fontSize: "18px",
                cursor: "pointer",
                color: (theme) => theme.palette.primary.main,
              }}
            />
          </Tooltip>
        </Stack>
      </CustomBoxFullWidth>
      <CustomBoxFullWidth
        sx={{
          border: (theme) => `1px solid ${theme.palette.neutral[200]}`,
          my: "10px",
          borderRadius: "10px",
          p: "20px",
        }}
      >
        <Box
          sx={{
            borderBottom: (theme) => `1px solid ${theme.palette.neutral[200]}`,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: "15px" }}
          >
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: "400",
                color: (theme) => theme.palette.neutral[600],
              }}
            >
              {t("Trip Cost")}
            </Typography>
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: "400",
                color: (theme) => theme.palette.neutral[600],
              }}
            >
              {getAmountWithSign(tripCost)}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: "15px" }}
          >
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: "400",
                color: (theme) => theme.palette.neutral[600],
              }}
            >
              {t("Trip Discount")}
            </Typography>
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: "400",
                color: (theme) => theme.palette.neutral[600],
              }}
            >
              -{getAmountWithSign(tripDiscount)}
            </Typography>
          </Stack>
          {rentalCoupon || couponDiscount ? (
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: "15px" }}
            >
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: "400",
                  color: (theme) => theme.palette.neutral[600],
                }}
              >
                {t("Coupon Discount")}
              </Typography>
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: "400",
                  color: (theme) => theme.palette.neutral[600],
                }}
              >
                - {getAmountWithSign(rentalCoupon)}
              </Typography>
            </Stack>
          ) : (
            ""
          )}
        </Box>
        <Box
          sx={{
            borderBottom: (theme) =>
              showTotal && `1px solid ${theme.palette.neutral[200]}`,
            mt: "15px",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: "15px" }}
          >
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: "600",
                color: (theme) => theme.palette.neutral[500],
              }}
            >
              {t("Subtotal")}
            </Typography>
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: "600",
                color: (theme) => theme.palette.neutral[500],
              }}
            >
              {getAmountWithSign(subTotal)}
            </Typography>
          </Stack>

          {/*{storeData ? (*/}
          {/*    storeData?.tax ? (*/}
          {/*        <>*/}
          {/*            <Grid item md={8} xs={8}>*/}
          {/*                {t("TAX")} ({storeData?.tax}%{" "}*/}
          {/*                {configData?.tax_included === 1 && t("Included")})*/}
          {/*            </Grid>*/}
          {/*            <Grid item md={4} xs={4} align="right">*/}
          {/*                <Stack*/}
          {/*                    direction="row"*/}
          {/*                    alignItems="center"*/}
          {/*                    justifyContent="flex-end"*/}
          {/*                    spacing={0.5}*/}
          {/*                >*/}
          {/*                    {configData?.tax_included === 0 && (*/}
          {/*                        <Typography>{"(+)"}</Typography>*/}
          {/*                    )}*/}
          {/*                    <Typography>*/}
          {/*                        {storeData &&*/}
          {/*                            getAmountWithSign(*/}
          {/*                                getTaxableTotalPrice(*/}
          {/*                                    cartList,*/}
          {/*                                    couponDiscount,*/}
          {/*                                    storeData,*/}
          {/*                                    referDiscount*/}
          {/*                                )*/}
          {/*                            )}*/}
          {/*                    </Typography>*/}
          {/*                </Stack>*/}
          {/*            </Grid>*/}
          {/*        </>*/}
          {/*    ) : null*/}
          {/*) : null}*/}

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: "15px" }}
          >
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: "400",
                color: (theme) => theme.palette.neutral[600],
              }}
            >
              {t("GST")}{" "}
              <Typography
                component={"span"}
                sx={{
                  fontSize: "14px",
                  fontWeight: "400",
                  color: (theme) => theme.palette.neutral[600],
                }}
              >
                ( {`${vatPer}%`}
                {configData?.tax_included === 1 && ` ${t("Included")}`})
              </Typography>
            </Typography>
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: "400",
                color: (theme) => theme.palette.neutral[600],
              }}
            >
              {configData?.tax_included === 0 && <>{"+"}</>}
              {getAmountWithSign(vatTax)}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: "15px" }}
          >
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: "400",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                color: (theme) => theme.palette.neutral[600],
              }}
            >
              {t("Service Fee")}{" "}
              <Tooltip
                title={t("This amount is for service maintenance.")}
                placement="bottom"
                arrow
                componentsProps={{
                  tooltip: {
                    sx: {
                      bgcolor: (theme) => theme.palette.toolTipColor,
                      "& .MuiTooltip-arrow": {
                        color: (theme) => theme.palette.toolTipColor,
                      },
                    },
                  },
                }}
              >
                <InfoOutlinedIcon
                  sx={{
                    fontSize: "14px",
                    color: (theme) => theme.palette.neutral[1000],
                  }}
                />
              </Tooltip>
            </Typography>
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: "400",
                color: (theme) => theme.palette.neutral[600],
              }}
            >
              + {getAmountWithSign(additionalCharge)}
            </Typography>
          </Stack>
        </Box>
        {showTotal && (
          <Box
            sx={{
              mt: "15px",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: "15px" }}
            >
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: (theme) => theme.palette.neutral[500],
                }}
              >
                {t("Total")}
              </Typography>
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: (theme) => theme.palette.neutral[500],
                }}
              >
                {getAmountWithSign(totalPrice)}
              </Typography>
            </Stack>

            {/*<Stack*/}
            {/*	direction="row"*/}
            {/*	justifyContent="space-between"*/}
            {/*	alignItems="center"*/}
            {/*	sx={{ mb: "15px" }}*/}
            {/*>*/}
            {/*	<Typography*/}
            {/*		sx={{ fontSize: "14px", fontWeight: "400" }}*/}
            {/*	>*/}
            {/*		{t("Due Amount")}*/}
            {/*	</Typography>*/}
            {/*	<Typography*/}
            {/*		sx={{ fontSize: "14px", fontWeight: "400" }}*/}
            {/*	>*/}
            {/*		$500.00*/}
            {/*	</Typography>*/}
            {/*</Stack>*/}
          </Box>
        )}
      </CustomBoxFullWidth>
    </>
  );
};

export default RentalBillDetails;