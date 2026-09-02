// src\components\home\module-wise-components\rental\components\home\TaxiView.js
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useTheme } from "@emotion/react";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import CustomSideDrawer from "components/side-drawer/CustomSideDrawer";
import DrawerHeader from "components/added-cart-view/DrawerHeader";
import DirectionsCarFilledIcon from "@mui/icons-material/DirectionsCarFilled";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import NearMeIcon from "@mui/icons-material/NearMe";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import { Box } from "@mui/system";
import { Divider, Stack, Typography } from "@mui/material";
import { t } from "i18next";
import RoomIcon from "@mui/icons-material/Room";
import CardDetailsSingleCard from "../global/CardDetailsSingleCard";
import RentalProceedtoCheckout from "../global/RentalProceedtoCheckout";
import CartContentCart from "components/home/module-wise-components/rental/components/rental-cart/CartContentCart";
import { FormatedDateWithTime } from "utils/CustomFunctions";
import BorderColorOutlinedIcon from "@mui/icons-material/BorderColorOutlined";
import TripModalContent from "components/home/module-wise-components/rental/components/rental-cart/TripModalContent";
import TripVehicleList from "components/home/module-wise-components/rental/components/rental-cart/TripVehicleList";
import CustomModal from "components/custom-component/CustomModal";
import dynamic from "next/dynamic";
import EmptyCart from "components/added-cart-view/EmptyCart";
import {
  calculateTotalDiscount,
  getTotalAmount,
} from "components/home/module-wise-components/rental/components/rental-checkout/checkoutHeplerFunction";
import { toast } from "react-hot-toast";

const CarBookingModal = dynamic(() =>
  import(
    "components/home/module-wise-components/rental/components/global/CarBookingModal"
  )
);

const TaxiView = ({
  sideDrawerOpen,
  setSideDrawerOpen,
  bookingLists,
  isLoading,
}) => {
   console.log("🔥 TaxiView RENDERED", { bookingLists, sideDrawerOpen, isLoading });
  const theme = useTheme();
  const router = useRouter();

  const [isOpenModal, setOpenModal] = React.useState(false);
  const [openTripChange, setOpenTripChange] = React.useState(false);
  const [ids, setIds] = React.useState(null);
  const [updateCartObject, setUpdateCartObject] = React.useState({});
  const [localCarts, setLocalCarts] = React.useState([]);
  const [prevDestination, setPrevDestination] = React.useState(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  



  /* --------------------------------------------------
     🔍 DEBUGGING — RENTAL CART DATA
  -------------------------------------------------- */
  useEffect(() => {
    // console.log("🚕 TaxiView | bookingLists:", bookingLists);
    // console.log("🚕 TaxiView | isLoading:", isLoading);
  }, [bookingLists, isLoading]);



  /* --------------------------------------------------
     NORMALIZE BOOKING DATA
  -------------------------------------------------- */
  const bookingData = Array.isArray(bookingLists) 
  ? bookingLists[0]  // ✅ array se pehla element nikala
  : bookingLists;

  const carts = bookingData?.carts || [];
  const userData = bookingData?.user_data || {};

//   console.log("🔥 bookingLists in taxiview:", bookingLists);
// console.log("🔥 bookingData:", bookingData);

  useEffect(() => {
    const refreshCart = () => {
      setLocalCarts([...(bookingData?.carts || [])]);
    };

    window.addEventListener("REFRESH_RENTAL_CART", refreshCart);

    return () => {
      window.removeEventListener("REFRESH_RENTAL_CART", refreshCart);
    };
  }, [bookingData]);


  useEffect(() => {
    setLocalCarts(carts || []);
  }, [carts]);
  useEffect(() => {
    // console.log("🚕 TaxiView | carts:", carts);
    // console.log("🚕 TaxiView | userData:", userData);

    if (!bookingData) {
      // console.warn("⚠️ TaxiView | No booking data found");
    } else if (carts.length === 0) {
      // console.warn("⚠️ TaxiView | Booking exists but cart is empty");
    } else {
      // console.log("✅ TaxiView | Valid rental cart loaded");
    }
  }, [bookingData]);

  const closeHandler = () => {
    setSideDrawerOpen(false);
  };


  useEffect(() => {
    localCarts.forEach((item) => {
      // console.log("🚕 Cart Item of rental cart:", item);
    });
  }, [localCarts]);
  /* --------------------------------------------------
     RENDER
  -------------------------------------------------- */

  useEffect(() => {
    if (!prevDestination) return;

    const currentDestination = userData?.destination_location?.location_name;

    if (prevDestination !== currentDestination && localCarts.length > 0) {
      toast.error(
        "All vehicles updated with new destination. Prices may change."
      );
    }

    setPrevDestination(currentDestination);
  }, [userData?.destination_location]);


  return (
    <>
      <CustomSideDrawer
        anchor="right"
        open={sideDrawerOpen}
        onClose={closeHandler}
        variant="temporary"
        maxWidth="450px"
        width="100%"
      >
        <Box sx={{ height: "100vh", overflowY: "auto" }}>
          <CustomStackFullWidth sx={{ minHeight: "100vh" }}>
            <DrawerHeader
              CartIcon={
                <DirectionsCarFilledIcon
                  sx={{ color: theme.palette.primary.dark }}
                />
              }
              title="Trip Cart"
              closeHandler={closeHandler}
            />

            {/* ---------------- LOADING STATE ---------------- */}
            {isLoading && (
              <CustomStackFullWidth sx={{ mt: 4, alignItems: "center" }}>
                <Typography>{t("Loading your trip cart...")}</Typography>
              </CustomStackFullWidth>
            )}

            {/* ---------------- CART DATA ---------------- */}
            {!isLoading && localCarts.length > 0 && (
              <CustomStackFullWidth sx={{ px: "20px" }}>
                {/* TRIP DETAILS */}
                <Box
                  sx={{
                    backgroundColor: theme.palette.background.paper,
                    boxShadow: "0px 2px 5px rgba(71,71,71,0.07)",
                    borderRadius: "10px",
                    padding: "15px",
                    my: "15px",
                  }}
                >
                  <Stack direction="row" justifyContent="space-between">
                    <Typography fontWeight="600">
                      {t("Trip Details")}
                    </Typography>

                    <BorderColorOutlinedIcon
                      sx={{
                        fontSize: "16px",
                        cursor: "pointer",
                        color: theme.palette.primary.main,
                      }}
                      onClick={() => {
                        if (localCarts.length > 0) {
                          setConfirmOpen(true); // 🔥 open modal
                        } else {
                          setOpenModal(true);
                        }
                      }}
                    />
                  </Stack>

                  <Divider sx={{ mt: "10px" }} />

                  <CardDetailsSingleCard
                    icon={
                      <RoomIcon
                        sx={{
                          fontSize: "16px",
                          color: theme.palette.neutral[500],
                        }}
                      />
                    }
                  >
                    <Typography fontWeight="500" fontSize="14px">
                      {userData?.pickup_location?.location_name}
                    </Typography>
                  </CardDetailsSingleCard>

                  <CardDetailsSingleCard
                    icon={
                      <NearMeIcon
                        sx={{
                          fontSize: "16px",
                          color: theme.palette.neutral[500],
                        }}
                      />
                    }
                  >
                    <Typography fontWeight="500" fontSize="14px">
                      {userData?.destination_location?.location_name}
                    </Typography>

                    {prevDestination &&
                      prevDestination !== userData?.destination_location?.location_name && (
                        <Typography sx={{ color: "orange", fontSize: "12px" }}>
                          Destination updated
                        </Typography>
                      )}
                  </CardDetailsSingleCard>

                  <CardDetailsSingleCard
                    icon={
                      <CalendarTodayIcon
                        sx={{
                          fontSize: "16px",
                          color: theme.palette.neutral[500],
                        }}
                      />
                    }
                  >
                    <Typography fontWeight="500">
                      {FormatedDateWithTime(userData?.pickup_time)}
                    </Typography>
                  </CardDetailsSingleCard>

                  <CardDetailsSingleCard
                    icon={
                      <HourglassEmptyOutlinedIcon
                        sx={{
                          fontSize: "16px",
                          color: theme.palette.neutral[600],
                        }}
                      />
                    }
                  >
                    <Typography fontSize="14px">
                      {t("Rent Type")} —
                      <b style={{ marginLeft: "6px" }}>
                        {userData?.rental_type?.replace("_", " ")}
                      </b>
                    </Typography>
                  </CardDetailsSingleCard>
                </Box>

                {/* CART ITEMS */}
                <CustomStackFullWidth>
                  {localCarts.map((item, index) => {

                    return (
                      <CartContentCart
                        key={item.id}
                        item={item}
                        userData={userData}
                        isPriceShow={false}
                        isTaxiView
                        onItemRemoved={(id) => {
                          setLocalCarts((prev) => prev.filter((c) => c.id !== id));
                        }}
                      />
                    );
                  })}

                </CustomStackFullWidth>
              </CustomStackFullWidth>
            )}

            {/* ---------------- EMPTY STATE ---------------- */}
            {!isLoading && localCarts.length === 0 && (
              <CustomStackFullWidth sx={{ marginBlock: "auto" }}>
                <EmptyCart
                  cartList={[]}
                  setSideDrawerOpen={setSideDrawerOpen}
                  text={t("Continue Booking")}
                  subTitle={t(
                    "No vehicles added in your cart. Please add vehicle to your cart list."
                  )}
                  icon={
                    <DirectionsCarFilledIcon
                      sx={{
                        width: "30px",
                        height: "30px",
                        color: theme.palette.primary.main,
                      }}
                    />
                  }
                />
              </CustomStackFullWidth>
            )}

            {/* ---------------- CHECKOUT BAR ---------------- */}
            {!isLoading && localCarts.length > 0 && (
              <RentalProceedtoCheckout
                rentalUserData={bookingData}
                totalAmount={
                  getTotalAmount(bookingData) -
                  calculateTotalDiscount(bookingData)
                }
                sx={{
                  backgroundColor: theme.palette.background.paper,
                  position: "sticky",
                  bottom: "0px",
                  width: "100%",
                  padding: "10px",
                  pb: "20px",
                  px: "20px",
                  boxShadow: "0px -7px 15px rgba(0,0,0,0.07)",
                }}
                onClick={() => {
                  setSideDrawerOpen(false);
                  // console.log("====== RENTAL PROCEED TO CHECKOUT CLICKED ======");
                  // console.log("Booking Data:", bookingData);
                  // console.log("User Data:", bookingData?.user_data);
                  // console.log("Carts:", carts);
                  // console.log("Total Amount:",
                  //   getTotalAmount(bookingData) -
                  //   calculateTotalDiscount(bookingData)
                  // );
                  // console.log("Router Path: /rental/cart");
                  // console.log("==============================================");
                  router.push("/rental/checkout", undefined, {
                    scroll: false,
                  });
                }}
              />
            )}
          </CustomStackFullWidth>
        </Box>

        {/* ---------------- EDIT MODAL ---------------- */}
        {isOpenModal && (
          <CarBookingModal
            open={isOpenModal}
            handleClose={() => setOpenModal(false)}
            update
            data={userData}
            cartData={bookingData}   // 🔥 IMPORTANT
            setOpenTripChange={setOpenTripChange}
            setIds={setIds}
            setUpdateCartObject={setUpdateCartObject}
            callUpdateUserData={false}
          />
        )}
      </CustomSideDrawer>

      {/* ---------------- TRIP VEHICLE MODAL ---------------- */}
      <CustomModal openModal={openTripChange}>
        <TripModalContent
          title="Trip Vehicle List"
          onCloseModal={() => setOpenTripChange(false)}
          content={
            <TripVehicleList
              ids={ids}
              cartLists={carts}
              updateCartObject={updateCartObject}
            />
          }
        />
      </CustomModal>

      <CustomModal openModal={confirmOpen} setModalOpen={setConfirmOpen}>
  <Box
    sx={{
      padding: "20px",
      borderRadius: "12px",
      backgroundColor: "white",
      textAlign: "center",
      width: "300px",
      margin: "auto",
    }}
  >
    <Typography fontWeight="600" mb={2}>
      Change Destination?
    </Typography>

    <Typography fontSize="14px" mb={3} color="text.secondary">
      Changing the address or trip type will update all vehicles in your cart and remove unmatched trip type vehicles !!!
    </Typography>

    <Stack direction="row" spacing={2} justifyContent="center">
      <Box
        sx={{
          px: 2,
          py: 1,
          borderRadius: "6px",
          border: "1px solid #ccc",
          cursor: "pointer",
        }}
        onClick={() => setConfirmOpen(false)}
      >
        Cancel
      </Box>

      <Box
        sx={{
          px: 2,
          py: 1,
          borderRadius: "6px",
          backgroundColor: theme.palette.primary.main,
          color: "#fff",
          cursor: "pointer",
        }}
        onClick={() => {
          setConfirmOpen(false);
          setOpenModal(true);
        }}
      >
        Continue
      </Box>
    </Stack>
  </Box>
</CustomModal>
    </>
  );
};

export default TaxiView;
