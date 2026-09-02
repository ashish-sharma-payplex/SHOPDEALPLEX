// src\components\home\module-wise-components\rental\components\global\CustomRentalCard.js
import { Grid, Typography, useTheme } from "@mui/material";
import { alpha, Box, maxHeight, Stack } from "@mui/system";
import CustomImageContainer from "components/CustomImageContainer";
import H3 from "components/typographies/H3";
import DirectionsCarFilledIcon from "@mui/icons-material/DirectionsCarFilled";
import { CustomBoxFullWidth } from "styled-components/CustomStyles.style";
import RentWithIncrementDecrement from "./RentWithIncrementDecrement";
import { t } from "i18next";
import GroupIcon from "@mui/icons-material/Group";
import AirIcon from "@mui/icons-material/Air";
import ManageHistoryIcon from "@mui/icons-material/ManageHistory";
import EvStationIcon from "@mui/icons-material/EvStation";
import {
  getAmountWithSign,
  getDiscountedAmount,
} from "helper-functions/CardHelpers";
import { useSelector } from "react-redux";
import {
  calculateTotalDiscount,
  cartItemDiscount,
  cartItemPrice,
} from "components/home/module-wise-components/rental/components/rental-checkout/checkoutHeplerFunction";
import { mainPrice } from "../utils/bookingHepler";

const Price = ({ item }) => {
  const hourlyPrice = item?.vehicle?.hourly_price;
  const distancePrice = item?.vehicle?.distance_price;

  let basePrice = 0;
  let unit = "";

  if (
    item?.rental_type === "distance_wise" ||
    item?.rental_type === "distance"
  ) {
    basePrice = distancePrice || 0;
    unit = "/Km";
  } else if (item?.rental_type === "hourly") {
    basePrice = hourlyPrice || 0;
    unit = "/Hr";
  }

  const discountType = item?.vehicle?.discount_type;
  const discountValue = item?.vehicle?.discount_price || 0;

  let discountedPrice = basePrice;

  if (discountType === "percent") {
    discountedPrice = basePrice - (basePrice * discountValue) / 100;
  } else if (discountType === "amount") {
    discountedPrice = basePrice - discountValue;
  }
  console.log("🟢 CARD PRICE DEBUG", {
    basePrice,
    discountedPrice,
    rental_type: item?.rental_type,
    discountType,
    discountValue,
  });
  if (discountedPrice < 0) discountedPrice = 0;

  return (
    <Stack direction="column" spacing={0.5}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography
          sx={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#1a914b",
          }}
        >
          {getAmountWithSign(Number(discountedPrice.toFixed(2)))}

          {basePrice !== discountedPrice && (
            <Box
              component="span"
              sx={{
                textDecoration: "line-through",
                color: "#a7a3a3",
                ml: 1,
              }}
            >
              {getAmountWithSign(Number(basePrice.toFixed(2)))}
            </Box>
          )}

          <Box
            component="span"
            sx={{
              color: (theme) => theme.palette.text.primary,
              fontWeight: 400,
              ml: 1,
            }}
          >
            {unit}
          </Box>
        </Typography>
      </Stack>

      {/* 👇 YEH ADD KARO (price ke niche) */}
      <Typography
        sx={{
          fontSize: "14px",
          color: "#555",
          fontWeight: 500,
        }}
      >
        Total: {getAmountWithSign(item?.price || 0)}
      </Typography>
    </Stack>
  );
};

const Image = ({ imgWidth = "110px", imgHeight = "80px", itemImage }) => {
  return (
    <CustomImageContainer
      src={itemImage}
      width={imgWidth}
      height={imgHeight}
    // sx={{
    //   border: (theme) =>
    //     `1px solid ${alpha(theme.palette.neutral[400], 0.4)} !important`,
    //   borderRadius: "5px",
    // }}
    />
  );
};

const CardDetailsSection = ({
  gap = "15px",
  showIcons = true,
  quantity,
  item,
  showPrice,
  priceRight = false, // ⭐ new prop
}) => {
  const { cartList } = useSelector((state) => state.cart);
  // console.log("item details in CardDetailsSection:", item);
  // console.log("Rental Type in CustomRentalCard:", item?.rental_type);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          gap: "20px",
        }}
      >
        {/* Provider Name */}
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: "normal",
            color: (theme) => theme.palette.neutral[500],
          }}
        >
          {item?.provider?.name}
        </Typography>

        {/* Price Section */}
      </Box>

      <H3
        text={item?.vehicle?.name}
        sx={{
          color: (theme) => alpha(theme.palette.neutral[1000], 0.8),
          maxHeight: "none",
        }}
      />

      {showIcons ? (
        <Grid
          container
          spacing={1}
          sx={{
            mt: "4px",
            color: (theme) => theme.palette.neutral[400],
            "& svg": { fontSize: "16px" },
          }}
        >
          {/* 1. Seats */}
          {item?.vehicle?.seating_capacity && (
            <Grid item xs={4}>
              <Stack direction="row" spacing={1} alignItems="center">
                <GroupIcon />
                <Typography variant="body2">
                  {item?.vehicle?.seating_capacity} {t("Seats")}
                </Typography>
              </Stack>
            </Grid>
          )}

          {/* 2. Vehicle Type */}
          {item?.vehicles?.type && (
            <Grid item xs={4}>
              <Stack direction="row" spacing={1} alignItems="center">
                <DirectionsCarFilledIcon />
                <Typography variant="body2">{item?.vehicles?.type}</Typography>
              </Stack>
            </Grid>
          )}

          {/* 3. AC / Non AC */}
          {item?.vehicle?.air_condition !== undefined && (
            <Grid item xs={4}>
              <Stack direction="row" spacing={1} alignItems="center">
                <AirIcon />
                <Typography
                  variant="body2"
                  sx={{ textTransform: "capitalize" }}
                >
                  {item?.vehicle?.air_condition > 0 ? t("ac") : t("non ac")}
                </Typography>
              </Stack>
            </Grid>
          )}

          {/* 4. Transmission (Next line mein auto aayega) */}
          {item?.vehicle?.transmission_type && (
            <Grid item xs={4}>
              <Stack direction="row" spacing={1} alignItems="center">
                <ManageHistoryIcon />
                <Typography
                  variant="body2"
                  sx={{ textTransform: "capitalize" }}
                >
                  {item?.vehicle?.transmission_type.replace("_", " ")}
                </Typography>
              </Stack>
            </Grid>
          )}

          {/* 5. Fuel Type */}
          {item?.vehicle?.fuel_type && (
            <Grid item xs={4}>
              <Stack direction="row" spacing={1} alignItems="center">
                <EvStationIcon />
                <Typography
                  variant="body2"
                  sx={{ textTransform: "capitalize" }}
                >
                  {item?.vehicle?.fuel_type.replace("_", " ")}
                </Typography>
              </Stack>
            </Grid>
          )}
        </Grid>
      ) : (
        <Typography
          sx={{
            mt: "5px",
            color: (theme) => theme.palette.neutral[500],
            fontWeight: "400",
            fontSize: "14px",
            whiteSpace: "nowrap",
          }}
        >
          {t("Quantity")}:{" "}
          <Typography
            component="span"
            sx={{
              fontWeight: "700",
              fontSize: "14px",
              color: (theme) => theme.palette.neutral[500],
            }}
          >
            {item?.quantity}
          </Typography>
        </Typography>
      )}
      {/* Checkout page price  */}
      {priceRight &&
        (() => {
          const basePrice = mainPrice(
            item?.vehicle,
            item?.rental_type
          );

          const discountedPrice = getDiscountedAmount(
            basePrice,
            item?.vehicle?.discount_price,
            item?.vehicle?.discount_type,
            item?.provider?.discount,
            1,
          );


          // console.log("🔵 CHECKOUT PRICE DEBUG", {
          //   basePrice,
          //   discountedPrice,
          //   rental_type: cartList?.user_data?.rental_type,
          //   vehicle: item?.vehicle,
          // });

          const unit =
            item?.rental_type === "distance_wise"
              ? "/Km"
              : item?.rental_type === "hourly"
                ? "/Hr"
                : "";

          return (
            <Stack direction="column" spacing={0.5}>
              {/* Price row */}
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography
                  sx={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#1a914b",
                  }}
                >
                  {getAmountWithSign(Number(Number(discountedPrice).toFixed(2)))}

                  {basePrice !== discountedPrice && (
                    <Typography
                      component="span"
                      sx={{
                        textDecoration: "line-through",
                        color: "#a7a3a3",
                        ml: 1,
                      }}
                    >
                      {getAmountWithSign(Number(Number(basePrice).toFixed(2)))}
                    </Typography>
                  )}

                  <Box
                    component="span"
                    sx={{
                      color: (theme) => theme.palette.text.primary,
                      fontWeight: 400,
                      ml: 1,
                    }}
                  >
                    {unit}
                  </Box>
                </Typography>
              </Stack>

              {/* 👇 Total yaha add karo */}
              <Typography
                sx={{
                  fontSize: "14px",
                  color: "#555",
                  fontWeight: 500,
                }}
              >
                Total: {getAmountWithSign(item?.price || 0)}
              </Typography>
            </Stack>
          );
        })()}

      {showPrice ? (
        <Stack
          direction="row"
          flexWrap="wrap"
          alignItems="baseline"
          columnGap={0.5}
        >
          {item?.vehicle?.discount_price > 0 ||
            item?.vehicle?.provider?.discount?.discount > 0 ? (
            <Typography
              className="original-price"
              sx={{
                fontSize: "16px",
                fontWeight: "400",
                textDecoration: "line-through",
                color: (theme) => theme.palette.neutral[400],
              }}
            >
              {getAmountWithSign(
                mainPrice(item?.vehicle, cartList?.user_data?.rental_type),
              )}
            </Typography>
          ) : null}
          <Typography
            sx={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#1a914b",
            }}
          >
            {getAmountWithSign(
              getDiscountedAmount(
                mainPrice(item?.vehicle, cartList?.user_data?.rental_type),
                item?.vehicle?.discount_price,
                item?.vehicle?.discount_type,
                item?.provider?.discount,
                1,
              ),
            )}{" "}
          </Typography>

          {item?.rental_type === "distance_wise" && (
            <Typography>/km</Typography>
          )}

          {item?.rental_type === "hourly" && <Typography>/Per Hr</Typography>}
        </Stack>
      ) : null}
    </Box>
  );
};
const Counter = ({
  isVerticle,
  isShowPrice = true,
  quantity,
  handleIncrement,
  itemId,
  handleDecrement,
  updateIsLoading,
  removeItemCart,
  price,
  item,
}) => {
  return (
    <Stack
      direction={{ xs: "row", sm: "column" }}
      sx={{ gap: "15px", alignItems: "flex-end" }}
      justifyContent={{ xs: "space-between", md: "flex-end" }}
    >
      {isShowPrice && <Price price={price} item={item} />}

      <RentWithIncrementDecrement
        isProductExist={true}
        isVerticle={isVerticle}
        count={quantity}
        handleIncrement={handleIncrement}
        itemId={itemId}
        handleDecrement={handleDecrement}
        updateLoading={updateIsLoading}
        removeItemCart={removeItemCart}
      />
    </Stack>
  );
};

const CustomRentalCardWrapper = ({ children, sx, ...rest }) => {
  return (
    <CustomBoxFullWidth
      sx={{
        display: "flex",
        // background: (theme) => alpha(theme.palette.neutral[200], 0.2),
        gap: { xs: "10px", md: "0px" },
        borderRadius: "10px",
        justifyContent: "space-between",
        alignItems: "center",

        ...sx,
      }}
      {...rest}
    >
      {children}
    </CustomBoxFullWidth>
  );
};

const LicenseNumber = ({ sx, licensesNumber }) => {
  return (
    <Box sx={sx}>
      <Typography
        sx={{
          fontWeight: "400",
          fontSize: "14px",
          color: (theme) => theme.palette.neutral[400],
        }}
      >
        {t("Vehicle License Number")}
      </Typography>
      <Stack
        direction="row"
        spacing={{
          xs: 0,
          md: 1,
        }}
        alignItems="center"
        // justifyContent="center"
        flexWrap="wrap"
      >
        {licensesNumber?.map((license, index) => (
          <Typography
            key={license}
            sx={{
              fontWeight: "500",
              fontSize: "14px",

              color: (theme) => theme.palette.neutral[500],
            }}
          >
            {license}
            {index < licensesNumber.length - 1 ? "," : ""}
          </Typography>
        ))}
      </Stack>
    </Box>
  );
};

export const CustomRentalCard = {
  root: CustomRentalCardWrapper,
  image: Image,
  price: Price,
  counter: Counter,
  details: CardDetailsSection,
  licenseNumber: LicenseNumber,
};
