// src\components\home\module-wise-components\rental\components\rental-checkout\RentalCheckoutPage.js
import { alpha, border, Box } from "@mui/system";
import {
  CustomBoxFullWidth,
  CustomPaperBigCard,
  CustomStackFullWidth,
} from "styled-components/CustomStyles.style";
import { CustomRentalCard } from "../global/CustomRentalCard";
import {
  Button,
  Grid,
  InputAdornment,
  NoSsr,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import CustomContainer from "components/container";
import CheckoutStepper from "components/checkout/item-checkout/CheckoutStepper";
import RentalCardWrapper from "../global/RentalCardWrapper";
import RentalProceedtoCheckout from "../global/RentalProceedtoCheckout";
import { t } from "i18next";
import ErrorIcon from "@mui/icons-material/Error";
import H3 from "components/typographies/H3";
import RentalBillDetails from "./RentalBillDetails";
import CustomTextFieldWithFormik from "components/form-fields/CustomTextFieldWithFormik";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import RentalAdditionalNote from "../global/RentalAdditionalNote";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import React, { useEffect, useReducer, useState } from "react";
import styles from "styles/rental.module.css";
import {
  ACTIONS,
  checkoutInitialState,
  rentalCheckoutReducer,
} from "components/home/module-wise-components/rental/components/rental-checkout/state";
import {
  calculateTotalDiscount,
  rentalCouponDiscount,
  getRentalSubTotalPrice,
  getTotalAmount,
  getVat,
  getTotalPrice,
  isCurrentTime,
  calculateProviderWiseDiscount,
} from "components/home/module-wise-components/rental/components/rental-checkout/checkoutHeplerFunction";
import { useTripBooking } from "components/home/module-wise-components/rental/rental-api-manage/hooks/react-query/trip-booking/useTripBooking";
import {
  onErrorResponse,
  onSingleErrorResponse,
} from "api-manage/api-error-response/ErrorResponses";
import { setClearCart } from "redux/slices/cart";
import { toast } from "react-hot-toast";
import { getAmountWithSign } from "helper-functions/CardHelpers";
import Router, { useRouter } from "next/router";
import { getGuestId, getToken } from "helper-functions/getToken";
import useScrollToTop from "api-manage/hooks/custom-hooks/useScrollToTop";
import GuestUserInforForm from "components/address/GuestUserInforForm";
import { fTime } from "components/home/module-wise-components/rental/components/rentalfilter/RentalCarFilterSection";
import useGetCashBackAmount from "api-manage/hooks/react-query/cashback/useGetCashBackAmount";
import { useTheme } from "@mui/material";
import CardDetailsSingleCard from "../global/CardDetailsSingleCard";
import RoomIcon from "@mui/icons-material/Room";
import NearMeIcon from "@mui/icons-material/NearMe";
import TripDetails from "../trip-status/TripDetails";
import CarBookingModal from "../global/CarBookingModal";
import CustomModal from "components/modal";
import TripModalContent from "../rental-cart/TripModalContent";
import TripVehicleList from "../rental-cart/TripVehicleList";
import useGetBookingList from "api-manage/hooks/react-query/useGetBookingList";
import HaveCoupon from "components/checkout/item-checkout/HaveCoupon";

const VehicleCardSkeleton = () => {
  return (
    <Box
      sx={{
        p: "20px",
        mb: "20px",
        display: "flex",
        gap: "20px",
        alignItems: "center",
        borderRadius: "8px",
        background: (theme) => alpha(theme.palette.neutral[200], 0.2),
      }}
    >
      {/* Image Skeleton */}
      <Skeleton
        variant="rectangular"
        width={160}
        height={80}
        sx={{ borderRadius: "8px" }}
      />

      {/* Text Content Skeleton */}
      <Box sx={{ flex: 1 }}>
        <Skeleton width="60%" height={20} />
        <Skeleton width="40%" height={20} sx={{ mt: 1 }} />
        <Skeleton width="80%" height={20} sx={{ mt: 1 }} />
      </Box>
    </Box>
  );
};

const RentalCheckoutPage = () => {
  const { cartList: cartListFromRedux } = useSelector((state) => state.cart);

  const router = useRouter();
  const fromCart = router.query.fromCart;

  useScrollToTop();
  const theme = useTheme();
  const dispatch = useDispatch();
  const { configData } = useSelector((state) => state.configData);
  const { couponInfo } = useSelector((state) => state.profileInfo);
  const { profileInfo } = useSelector((state) => state.profileInfo);
  const { guestUserInfo } = useSelector((state) => state.guestUserInfo);
  const [scheduleAt, setScheduleAt] = React.useState(0);
  const [cashbackAmount, setCashbackAmount] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openTripChange, setOpenTripChange] = React.useState(false);
  const [ids, setIds] = useState(null);
  const [updateCartObject, setUpdateCartObject] = useState(null);
  const { mutate, isLoading } = useTripBooking();
  const [state, checkoutDispatch] = useReducer(
    rentalCheckoutReducer,
    checkoutInitialState,
  );
  const guestId = getGuestId();

  const { data: bookingLists, isLoading: bookingLoading } = useGetBookingList(
    guestId,
    {
      enabled: !cartListFromRedux, // ðŸ”¥ only fetch if redux empty
    },
  );

  // useEffect(() => {
  //   refetchBooking();
  // }, [guestId]);

  const bookingData =
    cartListFromRedux?.carts?.length > 0
      ? cartListFromRedux
      : Array.isArray(bookingLists)
      ? bookingLists[0]
      : bookingLists;

  const cartList = bookingData || {};
  const carts = bookingData?.carts || [];
  const userData = bookingData?.user_data || {};

  // console.log("carlist from carBooking")

  const text1 = t("After completing the trip, you will receive a");
  const text2 = t(
    "cashback. The minimum purchase required to avail this offer is",
  );
  const text3 = t("However, the maximum cashback amount is");

  useEffect(() => {
    if (isCurrentTime(cartList)) {
      setScheduleAt(1);
    } else {
      setScheduleAt(0);
    }
  }, [userData?.pickup_time]);

  const handleAdditionalNotes = (value) => {
    checkoutDispatch({
      type: ACTIONS.setAdditionalNotes,
      payload: value,
    });
  };

  // useEffect(() => {
  //   console.log("🚕 Rental Checkout Cart Data:", cartList);
  //   console.log("🚕 Carts:", carts);
  //   console.log("🚕 User Data:", userData);
  // }, [cartList]);

  const tripCost = getTotalAmount(cartList);

  const calculateProviderWiseDiscounts = calculateProviderWiseDiscount(
    cartList,
    tripCost,
  );
  const isShowDiscount =
    calculateProviderWiseDiscounts > calculateTotalDiscount(cartList, tripCost);
  const tripDiscount =
    calculateProviderWiseDiscounts > calculateTotalDiscount(cartList, tripCost)
      ? calculateProviderWiseDiscounts
      : calculateTotalDiscount(cartList, tripCost);
  const discountDifference =
    calculateProviderWiseDiscounts === 0 ||
    calculateTotalDiscount(cartList, tripCost) === 0
      ? 0
      : Math.abs(
          calculateProviderWiseDiscounts -
            calculateTotalDiscount(cartList, tripCost),
        );

  const rentalCoupon =
    carts?.length > 0 &&
    rentalCouponDiscount(state?.couponDiscount, carts[0]?.provider, cartList);

  const subTotal = getRentalSubTotalPrice(
    cartList,
    rentalCoupon || 0,
    tripCost,
    tripDiscount,
  );
  const storeData = carts?.length > 0 && carts[0]?.provider;
  const referDiscount = null;
  const vat_tax = getVat(cartList, storeData, referDiscount, rentalCoupon);
  const isIncluded = configData?.tax_included === 0 ? vat_tax : 0;
  const totalPrice = getTotalPrice(
    cartList,
    isIncluded,
    rentalCoupon || 0,
    configData?.additional_charge || 0,
    tripCost,
    tripDiscount,
  );

  // Validation function
  const validateTripBooking = () => {
    if (!carts?.length) {
      toast.error(t("No vehicles in cart"));
      return false;
    }

    if (!userData?.pickup_location) {
      toast.error(t("Please select pickup location"));
      return false;
    }

    if (!userData?.destination_location) {
      toast.error(t("Please select destination location"));
      return false;
    }

    if (!getToken() && !guestUserInfo?.contact_person_number) {
      toast.error(t("Please provide contact number"));
      return false;
    }

    if (!getToken() && !guestUserInfo?.contact_person_name) {
      toast.error(t("Please provide contact name"));
      return false;
    }

    if (!getToken() && !guestUserInfo?.contact_person_email) {
      toast.error(t("Please provide contact email"));
      return false;
    }

    return true;
  };

  const handleTripPlace = () => {
    if (!validateTripBooking()) {
      return;
    }

    const tripObject = {
      provider_id: carts[0].provider?.id,
      trip_type: userData?.rental_type,
      trip_amount: totalPrice,
      additional_note: state.additionalNotes,
      coupon_code: state?.couponDiscount?.code,
      coupon_discount_amount: state?.couponDiscount?.discount,
      coupon_discount_title: state?.couponDiscount?.title,
      guest_id: getToken() ? null : getGuestId(),
      contact_person_number: getToken()
        ? null
        : guestUserInfo?.contact_person_number,
      contact_person_name: getToken()
        ? null
        : guestUserInfo?.contact_person_name,
      contact_person_email: getToken()
        ? null
        : guestUserInfo?.contact_person_email,
      schedule_at:
        scheduleAt === 1 ? fTime(userData?.pickup_time) : fTime(new Date()),
      scheduled: scheduleAt,
    };

    mutate(tripObject, {
      onSuccess: (response) => {
        if (response?.data) {
          toast.success(t("Trip booking created successfully!"));
          dispatch(setClearCart());
          // ✅ Fixed - no quotes around place_order
          Router.push(`/rental/trip-status/${response.data}?from=place_order`);
        } else if (response) {
          toast.success(t("Trip booking created successfully!"));
          dispatch(setClearCart());
          // ✅ Fixed - no quotes around place_order
          Router.push(`/rental/trip-status/${response}?from=place_order`);
        }
      },
      onError: (error) => {
        // console.log("Trip Booking Error:", error);
        onErrorResponse(error);
      },
    });
  };

  let zoneId;
  if (typeof window !== "undefined") {
    zoneId = JSON.parse(localStorage.getItem("zoneid"));
  }

  useEffect(() => {
    // ðŸš« Don't redirect while data is loading
    if (bookingLoading || !bookingData) return;

    // ðŸš« Only redirect when confirmed empty cart or missing zoneId
    if (carts?.length === 0 || !zoneId) {
      if (!zoneId) {
        toast.error(t("Please select zone first and retry again"));
      }
      Router.push("/home");
    }
  }, [bookingLoading, bookingData, carts?.length, zoneId]);

  const handleCashbackAmount = (data) => {
    setCashbackAmount(data);
  };

  const { refetch: refetchCashbackAmount } = useGetCashBackAmount({
    amount: totalPrice,
    handleSuccess: handleCashbackAmount,
  });

  useEffect(() => {
    if (totalPrice > 0) {
      refetchCashbackAmount();
    }
  }, [totalPrice]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <CustomContainer>
      <CustomStackFullWidth
        sx={{
          maxWidth: "1200px", // Set the max width
          margin: "30px auto", // Center the container horizontally
          padding: "0px 16px", // Optional: Add padding if needed
          // paddingTop: '50px',   // Add space at the top (adjust as needed)
        }}
      >
        <Grid container spacing={4}>
          {/* Left Section starts  */}
          <Grid item xs={12} md={8}>
            <CustomStackFullWidth>
              {/* <CheckoutStepper
                text2={t("Trip details")}
                text={t("Cart")}
                text1={t("Checkout")}
              /> */}
            </CustomStackFullWidth>
            {/* Vehicle List Title */}
            <Stack
              direction="row"
              alignItems="center"
              width="100%"
              spacing={2}
              mb={2.5}
              mt={3}
            >
              <Typography
                fontSize="18px"
                fontWeight={600}
                color="#000"
                whiteSpace="nowrap"
              >
                Vehicle Listt
              </Typography>
              <Stack
                flex={1}
                height="2px"
                sx={{
                  background:
                    "linear-gradient(to right, #e0e0e0 0%, #e0e0e0 60%, rgba(224,224,224,0) 100%)",
                }}
              />
            </Stack>

            {/* Scrollable Vehicle List */}
            <RentalCardWrapper
              className={styles.rentalCheckoutBox}
              sx={{
                mb: 2,
                borderRadius: "8px",
                p: "12px",
              }}
            >
              <Box
                sx={{
                  maxHeight: carts?.length > 2 ? "335px" : "auto", // show 2 items height
                  minHeight: "180px",
                  overflowY: carts?.length > 2 ? "auto" : "visible",
                  px: "5px",
                }}
              >
                {bookingLoading ? (
                  <>
                    <VehicleCardSkeleton />
                    <VehicleCardSkeleton />
                  </>
                ) : carts?.length > 0 ? (
                  carts.map((item, index) => (
                    <Box
                      key={index}
                      className={styles.rentalTripCard}
                      sx={{
                        mb: "12px", // spacing between items
                        borderRadius: "8px", // rounded corners
                        boxShadow: "0px 1px 4px rgba(0,0,0,0.08)", // subtle inner shadow for separation
                        overflow: "hidden",
                      }}
                    >
                      <CustomRentalCard.root
                        sx={{
                          p: "16px",
                          justifyContent: "start",
                          flexWrap: { xs: "wrap", sm: "nowrap" },
                          alignItems: { xs: "start", md: "center" },
                          gap: "12px",
                          height: "160px",
                        }}
                      >
                        <CustomRentalCard.image
                          itemImage={item?.vehicle?.thumbnail_full_url}
                          imgWidth={{ xs: "100%", sm: "140px", md: "140px" }}
                          imgHeight={{ xs: "140px", md: "70px" }}
                        />
                        <CustomRentalCard.details
                          item={{
                            ...item,
                            rental_type: userData?.rental_type,
                          }}
                          showIcons={false}
                          priceRight
                        />
                      </CustomRentalCard.root>
                    </Box>
                  ))
                ) : null}
              </Box>
            </RentalCardWrapper>
            <Box sx={{ py: 2 }}>
              <TripDetails
                tripDetails={{
                  destination_location: userData?.destination_location,
                  pickup_location: userData?.pickup_location,
                  schedule_at: userData?.pickup_time,
                  trip_type: userData?.rental_type,
                  estimated_hours: userData?.estimated_hours,
                  distance: userData?.distance,
                }}
                setOpenModalCheckout={setOpenModal}
                checkOut
              />
            </Box>

            {!getToken() && (
              <RentalCardWrapper sx={{ mt: "20px" }}>
                <GuestUserInforForm configData={configData} rental />
              </RentalCardWrapper>
            )}

            <RentalAdditionalNote
              handleAdditionalNotes={handleAdditionalNotes}
              value={state.additionalNotes}
            />
          </Grid>
          {/* Left Section ends */}

          {/* Right section starts */}
          <Grid item xs={12} md={4}>
            <Box sx={{ minHeight: { xs: "0", md: "139vh" } }}>
              <RentalCardWrapper sx={{ position: "sticky", top: "80px" }}>
                {bookingLoading ? (
                  <>
                    {/* Coupon Skeleton */}
                    {getToken() && (
                      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                        <Skeleton
                          variant="rectangular"
                          height={45}
                          sx={{ flex: 1 }}
                        />
                        <Skeleton
                          variant="rectangular"
                          height={45}
                          width={100}
                        />
                      </Stack>
                    )}

                    {/* Bill Header Skeleton */}
                    <Skeleton width="150px" height={28} sx={{ mb: 2 }} />

                    {/* Bill Lines Skeleton */}
                    {[1, 2, 3, 4, 5].map((item) => (
                      <Stack
                        key={item}
                        direction="row"
                        justifyContent="space-between"
                        sx={{ mb: 2 }}
                      >
                        <Skeleton width="40%" height={20} />
                        <Skeleton width="80px" height={20} />
                      </Stack>
                    ))}

                    {/* Total Skeleton */}
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      sx={{ mt: 3 }}
                    >
                      <Skeleton width="80px" height={25} />
                      <Skeleton width="120px" height={25} />
                    </Stack>

                    {/* Button Skeleton */}
                    <Skeleton
                      variant="rectangular"
                      height={50}
                      sx={{ mt: 4, borderRadius: "8px" }}
                    />
                  </>
                ) : (
                  <>
                    {/* ðŸ”¥ Original Content Below */}
                    {getToken() && carts?.length > 0 && (
                      <HaveCoupon
                        store_id={carts[0]?.provider?.id}
                        setCouponDiscount={(data) =>
                          checkoutDispatch({
                            type: ACTIONS.setCouponDiscount,
                            payload: data,
                          })
                        }
                        couponDiscount={state?.couponDiscount}
                        totalAmount={tripCost}
                        deliveryFee={0}
                        deliveryTip={0}
                        payableAmount={totalPrice}
                        walletBalance={0}
                        setSwitchToWallet={() => {}}
                      />
                    )}

                    <RentalBillDetails
                      showTotal={false}
                      tripDiscount={tripDiscount}
                      tripCost={tripCost}
                      subTotal={subTotal}
                      rentalCoupon={rentalCoupon}
                      vatTax={vat_tax}
                      storeData={storeData}
                      totalPrice={totalPrice}
                      couponDiscount={state?.couponDiscount}
                      vatPer={storeData?.tax}
                      additionalCharge={configData?.additional_charge}
                    />

                    {getToken() && cashbackAmount?.cashback_amount > 0 && (
                      <Grid item xs={12} my="1rem">
                        <Box
                          borderRadius={"5px"}
                          borderLeft={`2px solid ${theme.palette.primary.main}`}
                          padding={"0.3rem"}
                          paddingLeft={"0.7rem"}
                          backgroundColor={alpha(
                            theme.palette.primary.main,
                            0.051,
                          )}
                          fontSize={{ xs: "0.7rem" }}
                        >
                          {cashbackAmount?.cashback_amount > 0
                            ? `${text1} ${
                                cashbackAmount?.cashback_type === "percentage"
                                  ? cashbackAmount?.cashback_amount + "%"
                                  : getAmountWithSign(
                                      cashbackAmount?.cashback_amount,
                                    )
                              } ${text2} ${getAmountWithSign(
                                cashbackAmount?.min_purchase,
                              )}. ${
                                cashbackAmount?.cashback_type === "percentage"
                                  ? text3 +
                                    " " +
                                    getAmountWithSign(
                                      cashbackAmount?.max_discount,
                                    ) +
                                    "."
                                  : ""
                              }`
                            : ""}
                        </Box>
                      </Grid>
                    )}

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "start",
                        justifyContent: "start",
                        gap: "8px",
                        mb: "20px",
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "12px",
                          color: (theme) => theme.palette.primary.main,
                        }}
                      >
                        *
                      </Typography>
                      <Typography sx={{ fontSize: "12px" }}>
                        {t("By placing the booking you are agreed to the")}{" "}
                        <Link
                          href="/terms-and-conditions"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Typography
                            component="span"
                            sx={{
                              textDecoration: "underline",
                              fontSize: "12px",
                              display: "flex",
                              alignItems: "center",
                              gap: "2px",
                              color: (theme) => theme.palette.primary.main,
                            }}
                          >
                            {t("Terms & Conditions")}
                          </Typography>
                        </Link>
                      </Typography>
                    </Box>

                    <RentalProceedtoCheckout
                      totalAmount={totalPrice}
                      rentalUserData={cartList}
                      text="Confirm Booking"
                      onClick={handleTripPlace}
                      isLoading={isLoading}
                      discountDifference={discountDifference}
                      isShowDiscount={isShowDiscount}
                    />
                  </>
                )}
              </RentalCardWrapper>
            </Box>
          </Grid>
          {/* Right section ends */}
        </Grid>
      </CustomStackFullWidth>
      {openModal && (
        <CarBookingModal
          open={openModal}
          handleClose={() => setOpenModal(false)}
          update
          data={userData}
          setOpenTripChange={setOpenTripChange}
          setIds={setIds}
          setUpdateCartObject={setUpdateCartObject}
          callUpdateUserData={false}
        />
      )}
      <CustomModal
        openModal={openTripChange}
        handleClose={() => setOpenTripChange(false)}
      >
        <TripModalContent
          title="Trip Vehicle List"
          onCloseModal={() => {
            setOpenTripChange(false);
          }}
          content={
            <TripVehicleList
              onCloseModal={() => {
                setOpenTripChange(false);
              }}
              ids={ids}
              cartLists={carts}
              updateCartObject={updateCartObject}
            />
          }
        />
      </CustomModal>
    </CustomContainer>
  );
};

export default RentalCheckoutPage;
