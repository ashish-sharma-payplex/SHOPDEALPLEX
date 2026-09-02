import { CustomCarCard } from "components/home/module-wise-components/rental/components/Rental.style";
import { Box, Stack } from "@mui/system";
import {
  alpha,
  Button,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { useMediaQuery } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Skeleton from "@mui/material/Skeleton";
import StarIcon from "@mui/icons-material/Star";
import GroupIcon from "@mui/icons-material/Group";
import DirectionsCarFilledIcon from "@mui/icons-material/DirectionsCarFilled";
import AirIcon from "@mui/icons-material/Air";
import ManageHistoryIcon from "@mui/icons-material/ManageHistory";
import EvStationIcon from "@mui/icons-material/EvStation";
import InfoIcon from "@mui/icons-material/Info";
import QuickView from "components/cards/QuickView";
import { CustomOverLay } from "components/cards/Card.style";
import RentWithIncrementDecrement from "components/home/module-wise-components/rental/components/global/RentWithIncrementDecrement";
import { t } from "i18next";
import WarningIcon from '@mui/icons-material/Warning';
import React, { useEffect, useReducer, useState } from "react";
import {
  ACTIONS,
  carCardInitialState,
  carCardReducer,
} from "components/home/module-wise-components/rental/components/global/carCardState";
import CustomModal from "components/modal";
import { useRouter } from "next/router";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useDispatch, useSelector } from "react-redux";
import useUpdateBookingCart from "components/home/module-wise-components/rental/rental-api-manage/hooks/react-query/confirm-booking/useUpdateBookingCart";
import useDeleteItemFromBooking from "components/home/module-wise-components/rental/rental-api-manage/hooks/react-query/confirm-booking/useDeleteItemFromBooking";
import {
  removeItemFromCart,
  updateCart,
} from "components/home/module-wise-components/rental/components/rental-cart/helper";
import { setCartList } from "redux/slices/cart";
import {
  getAmountWithSign,
  getDiscountedAmount,
} from "helper-functions/CardHelpers";
import useConfirmBooking from "components/home/module-wise-components/rental/rental-api-manage/hooks/react-query/confirm-booking/useConfirmBooking";
import { bookingConfirm } from "components/home/module-wise-components/rental/components/global/search/searchHepler";
import { toast, Toaster } from "react-hot-toast";
import { onErrorResponse } from "api-manage/api-error-response/ErrorResponses";
import { useAddWishlist } from "components/home/module-wise-components/rental/rental-api-manage/hooks/react-query/wishlist/useAddWishlist";
import { mainPrice } from "components/home/module-wise-components/rental/components/utils/bookingHepler";
import CustomImageContainer from "components/CustomImageContainer";
import { not_logged_in_message } from "utils/toasterMessages";
import {
  addWishListVehicle,
  removeWishListVehicle,
} from "redux/slices/wishList";
import { useRemoveRentalWishList } from "components/home/module-wise-components/rental/rental-api-manage/hooks/react-query/wishlist/useRemoveWishlist";
import { getGuestId, getToken } from "helper-functions/getToken";
import CustomBadge from "components/cards/CustomBadge";
import dynamic from "next/dynamic";
import ProviderCheck from "components/home/module-wise-components/rental/components/global/ProviderCheck";
import usePostLocationUpdate from "../../rental-api-manage/hooks/react-query/confirm-booking/usePostLocationUpdate";
import { LoadingButton } from "@mui/lab";
import HorizontalCarCard from "../../components/global/HorizontalCarCard";
import TripModalContent from "../../components/rental-cart/TripModalContent";
import TripVehicleList from "../../components/rental-cart/TripVehicleList";
import Link from "next/link";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
const CarBookingModal = dynamic(() =>
  import("components/home/module-wise-components/rental/components/global/CarBookingModal")
);




// ----------------------------------------------------
// ✅ SKELETON CARD (NO LOGIC TOUCH)
// ----------------------------------------------------
const VehicleCardSkeleton = () => {

  const guesthere = getGuestId();

  return (
    <CustomCarCard sx={{ border: "1px solid #E3E8EE", boxShadow: "none" }}>
      <Box p={2}>
        <Skeleton variant="rectangular" height={220} sx={{ borderRadius: "10px", mb: 1 }} />
        <Skeleton width="40%" height={16} />
        <Stack direction="row" justifyContent="space-between" mt={1}>
          <Stack gap={1}>
            <Skeleton width={160} height={22} />
            <Skeleton width={80} height={14} />
          </Stack>
          <Stack alignItems="flex-end">
            <Skeleton width={70} height={22} />
            <Skeleton width={50} height={14} />
          </Stack>
        </Stack>

        <Stack
          direction="row"
          flexWrap="wrap"
          rowGap={1}
          sx={{
            mt: 2,
            background: "#F4F6F8",
            borderRadius: "12px",
            padding: "12px",
            "& > div": {
              width: "25%",
              alignItems: "center",
            },
          }}
        >
          {[1, 2, 3, 4].map((_, i) => (
            <Stack key={i}>
              <Skeleton variant="circular" width={18} height={18} />
              <Skeleton width={40} height={12} />
            </Stack>
          ))}
        </Stack>
      </Box>

      <Stack p={2}>
        <Skeleton variant="rectangular" height={38} sx={{ borderRadius: "999px" }} />
      </Stack>
    </CustomCarCard>
  );
};


// ----------------------------------------------------
// ✅ MAIN COMPONENT
// ----------------------------------------------------
const VehicleCard = ({
  data,
  setOpenModal,
  currentView = 0,
  direction = "column",
  showSameVehicleText = true,
  from,
  loading = false,
}) => {

  // ✅ render skeleton first
  if (loading) return <VehicleCardSkeleton />;
  // const p_off = t("% off");
  // const discountValue =
  //   data?.discount_type === "percent"
  //     ? data?.discount_price
  //     : data?.discount_type === "amount"
  //       ? `${getAmountWithSign(data?.discount_price)}`
  //       : 0;

  // --------------------------------------------------
  // YOUR EXISTING COMPONENT CODE (100% UNTOUCHED)
  // --------------------------------------------------

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useDispatch();
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [cartItemData, setCartItemData] = useState({});
  const [carDetails, setCarDetails] = useState({});
  const [open, setOpen] = useState(false);
  const [isSameOpen, setIsSameOpen] = useState(false);
  const [openTripChange, setOpenTripChange] = React.useState(false);
  const [ids, setIds] = React.useState(null);
  const [updateCartObject, setUpdateCartObject] = React.useState({});
  const [callUpdateUserData, setCallUpdateUserData] = useState(false);
  const [openHourDiffModal, setOpenHourDiffModal] = useState(false);
  const [disableLink, setDisableLink] = useState(false);
  const [updateOrAdd, setUpdateOrAdd] = useState({
    type: 'add',
    quantity: 0
  });
  const [state, carCardDispatch] = useReducer(
    carCardReducer,
    carCardInitialState
  );
  const rawCartList = useSelector((state) => state.cart.cartList);
  const cartList = Array.isArray(rawCartList) ? rawCartList[0] : rawCartList;
  const rentalSearch = useSelector(
    (state) => state?.rentalSearch?.rentalSearch
  );
  const fromSearch = router?.query?.from;
  const { mutate: addFavoriteMutation } = useAddWishlist();
  const { mutate: removeFavoriteMutation } = useRemoveRentalWishList();
  const { mutate: userDataUpdateMutate, isLoading: userDataIsLoading } =
    usePostLocationUpdate();
  const { wishLists } = useSelector((state) => state?.wishList);
  const [priceType, setPriceType] = useState("hourly"); // default hourly

  useEffect(() => {
    if (data?.trip_hourly === 1) {
      setPriceType("hourly");
    } else if (data?.trip_distance === 1) {
      setPriceType("distance");
    }
  }, [data]);

  const handlePriceToggle = (e) => {
    e.stopPropagation();

    if (data?.trip_hourly === 1 && data?.trip_distance === 1) {
      setPriceType((prev) => (prev === "hourly" ? "distance" : "hourly"));
    }
  };

  useEffect(() => {
    wishlistItemExistHandler();
  }, [wishLists]);

  const wishlistItemExistHandler = () => {
    const vehicles = wishLists?.vehicles || [];

    const isExist = vehicles.some(
      (wishItem) => String(wishItem.id) === String(data?.id)
    );

    setIsWishlisted(isExist);
  };

  const addToWishlistHandler = (e) => {
    e.stopPropagation();
    if (getToken()) {
      addFavoriteMutation(
        { key: "vehicle_id", id: data?.id },
        {
          onSuccess: (response) => {
            if (response) {
              dispatch(addWishListVehicle(data));
              setIsWishlisted(true);
              toast.success(response?.message);
            }
          },
          onError: (error) => {
            toast.error(error.response.data.message);
          },
        }
      );
    } else toast.error(t(not_logged_in_message));
  };

  const removeFromWishlistHandler = (e) => {
    e.stopPropagation();
    const onSuccessHandlerForDelete = (res) => {
      dispatch(removeWishListVehicle(data?.id));
      setIsWishlisted(false);
      toast.success(res.message, {
        id: "wishlist",
      });
    };
    removeFavoriteMutation(
      { key: "vehicle_id", id: data?.id },
      {
        onSuccess: onSuccessHandlerForDelete,
        onError: (error) => {
          toast.error(error.response.data.message);
        },
      }
    );
  };

  const { mutate: confirmMutate, isLoading: confirmIsLoading } = useConfirmBooking();

  const isProductExist = cartList?.carts?.find(
    (item) => item.vehicle?.id === data?.id
  );
  const { mutate: updateMutate, isLoading: updateIsLoading } =
    useUpdateBookingCart();
  const { mutate } = useDeleteItemFromBooking();

  const handleIncrement = (cartItem) => {
    const updateQuantity = cartItem?.quantity + 1;
    if (data?.total_vehicle_count < updateQuantity) {
      toast.error(t(`You can't add more than ${data?.total_vehicle_count} quantities of this vehicle.`));
    } else {
      if (from === "from_search") {
        if (Number(rentalSearch?.duration) === Number(cartList?.user_data?.estimated_hours)) {
          updateCart(
            cartItem,
            cartList?.user_data,
            dispatch,
            setCartList,
            updateQuantity,
            updateMutate
          )
        } else {
          setUpdateOrAdd({
            type: 'update',
            quantity: updateQuantity,
            cartItem: cartItem
          });
          setOpenHourDiffModal(true);
          setOpen(false)
        }
      } else {
        updateCart(
          cartItem,
          cartList?.user_data,
          dispatch,
          setCartList,
          updateQuantity,
          updateMutate
        )
      }
    }
  };

  const handleDecrement = (cartItem) => {
    const updateQuantity = cartItem?.quantity - 1;
    if (from === "from_search") {
      if (Number(rentalSearch?.duration) === Number(cartList?.user_data?.estimated_hours)) {
        updateCart(
          cartItem,
          cartList?.user_data,
          dispatch,
          setCartList,
          updateQuantity,
          updateMutate
        )
      } else {
        setUpdateOrAdd({
          type: 'update',
          quantity: updateQuantity,
          cartItem: cartItem
        })
        setOpenHourDiffModal(true);
      }
    } else {
      updateCart(
        cartItem,
        cartList?.user_data,
        dispatch,
        setCartList,
        updateQuantity,
        updateMutate
      );
    }
  };

  const removeItemCart = (cartItem) => {
    removeItemFromCart(cartItem, mutate, dispatch, setCartList);
  };

  const isDifferentProvider = cartList?.carts?.some(
    (cart) => cart.provider?.id !== data?.provider?.id
  );

  const openCarBookingModal = () => {
    carCardDispatch({ type: ACTIONS.setOpen, payload: true });
    setOpen(false);
  };

  const rentalLocations = {
    pickup: rentalSearch?.pickup_location,
    destination: rentalSearch?.destination_location,
  };

  const bookingDetails = {
    id: data?.id,
    locations: rentalLocations,
    searchKey1: rentalSearch?.pickup_location?.location_name,
    searchKey2: rentalSearch?.destination_location?.location_name,
    tripType: priceType === "hourly" ? "hourly" : "distance_wise",
    durationValue: rentalSearch?.duration,
    dateValue: rentalSearch?.selectedDate?.$d,
    data: rentalSearch?.distanceData,
  };


  const addToCartHandler = () => {
    // Step 1: User type check
    const token = getToken(); // Logged in user token
    const guestId = token ? null : getGuestId(); // Guest ID if not logged in

    // console.log("TOKEN:", token);
    // console.log("GUEST ID:", guestId);
    // console.log("Guest ID:", guestId);
    // console.log("Full localStorage:", { ...localStorage });
    // console.log("Full sessionStorage:", { ...sessionStorage });

    // Step 2: Booking details
    const bookingDetails = {
      id: data?.id,
      locations: {
        pickup: rentalSearch?.pickup_location,
        destination: rentalSearch?.destination_location,
      },
      searchKey1: rentalSearch?.pickup_location?.location_name,  // ✅ ADD
      searchKey2: rentalSearch?.destination_location?.location_name,  // ✅ ADD
      tripType: priceType === "hourly" ? "hourly" : "distance_wise",
      durationValue: rentalSearch?.duration,
      dateValue: rentalSearch?.selectedDate?.$d,
      guest_id: guestId,
      token: token,
      data: rentalSearch?.distanceData,
    };

    // console.log("Booking Details:", bookingDetails);

    // Step 3: Baaki ka addToCart logic
    if (from === "from_search") {
      if (isDifferentProvider) {
        handleDifferentProvider(bookingDetails);
      } else {
        handleSameProvider(bookingDetails);
      }
      setOpen(false);
    } else {
      openCarBookingModal();
      setOpen(false);
    }
  };
  const handleDifferentProvider = (bookingDetails) => {
    carCardDispatch({ type: ACTIONS.setOpenSameProvider, payload: true });
    setCartItemData(bookingDetails);
  };


  const handleSameProvider = (bookingDetails) => {
    if (cartList?.carts?.length > 0) {
      if (rentalSearch?.tripType === cartList?.user_data?.rental_type) {
        if (cartList?.user_data?.rental_type === "hourly") {
          if (Number(rentalSearch?.duration) === Number(cartList?.user_data?.estimated_hours)) {
            bookingConfirm({
              ...bookingDetails,
              confirmMutate,
              dispatch,
              setCartList,
              toast,
              handleClose: null,
              onErrorResponse,
              onSuccessRedirect: () => router.push('/rental/cart'),
            });
          } else {
            setUpdateOrAdd({
              type: 'add',
            });
            setOpenHourDiffModal(true);
          }
        } else {
          bookingConfirm({
            ...bookingDetails,
            confirmMutate,
            dispatch,
            setCartList,
            toast,
            handleClose: null,
            onErrorResponse,
          });
        }
      } else {
        setUpdateCartObject?.({
          ...bookingDetails,
          userId: cartList?.user_data?.id,
          id: data?.id
        });
        setIsSameOpen?.(true);
        handleClose?.();
      }
    } else {
      bookingConfirm({
        ...bookingDetails,
        confirmMutate,
        dispatch,
        setCartList,
        toast,
        handleClose: null,
        onErrorResponse,
      });
    }
  };

  const handleClose = (value) => {
    carCardDispatch({
      type: ACTIONS.setOpen,
      payload: value,
    });
  };

  const handleProviderCheck = (payload) => {
    carCardDispatch({
      type: ACTIONS.setOpenSameProvider,
      payload: payload,
    });
  };

  const handleRentalTripType = (value) => {
    carCardDispatch({
      type: ACTIONS.setSelectedTripType,
      payload: value,
    });
  };

  const handleChangePrvTripType = () => {
    const tempUpdateCartObject = {
      userId: updateCartObject?.userId,
      pickup_location: updateCartObject?.locations?.pickup,
      destination_location: updateCartObject?.locations?.destination,
      rental_type: updateCartObject?.tripType,
      estimated_hours: updateCartObject?.durationValue,
      pickup_time: updateCartObject?.dateValue,
      destination_time: Math.floor(
        updateCartObject?.data?.rows?.[0]?.elements[0]?.duration?.value / (60 * 60)
      ),
      distance: updateCartObject?.data?.rows?.[0]?.elements[0]?.distance?.value / 1000,
      guest_id: getToken() ? null : getGuestId()
    };

    userDataUpdateMutate(tempUpdateCartObject, {
      onSuccess: (res) => {
        bookingConfirm({
          ...updateCartObject,
          confirmMutate,
          dispatch,
          setCartList,
          toast,
          handleClose: setIsSameOpen(false),
          onErrorResponse,
        });
      },
      onError: (error) => {
        if (error.response.data?.length > 0) {
          setIds?.(error.response.data);
          setUpdateCartObject?.(updateCartObject);
          setOpenTripChange?.(true);
          setIsSameOpen(false);
        } else {
          onErrorResponse(error);
        }
      },
    });
  };

  const handleHourDiffModal = (bookingDetails, updateOrAdd) => {
    if (updateOrAdd?.type === 'add') {
      bookingConfirm({
        ...bookingDetails,
        confirmMutate,
        dispatch,
        setCartList,
        toast,
        handleClose: () => setOpenHourDiffModal(false),
        onErrorResponse,
      });
    } else {
      const tempUserData = {
        ...cartList?.user_data,
        estimated_hours: rentalSearch?.duration,
      }
      updateCart(
        updateOrAdd?.cartItem,
        tempUserData,
        dispatch,
        setCartList,
        updateOrAdd?.quantity,
        updateMutate
      )
      setOpenHourDiffModal(false);
    }
  };

  const limitText = (text, limit = 12) => {
    if (!text) return "";
    return text.length > limit ? text.slice(0, limit - 3) + "..." : text;
  };
  return (
    <>
      <Toaster position="top-center" toastOptions={{
        style: {
          boxShadow: "none",
          WebkitBoxShadow: "none",
          MozBoxShadow: "none",
        },
      }} />

      {currentView === 0 ? (

        <CustomCarCard
          sx={{ position: "relative", cursor: "pointer", border: "1px solid #E3E8EE", boxShadow: "none" }}
        >
          {/* 🔥 DISCOUNT BADGE – top-left on card */}

          {data?.discount_price > 0 && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 8,
                background: "green",
                color: "#fff",
                fontWeight: 700,
                fontSize: "12px",
                padding: "10px 8px",
                width: "40px",
                textAlign: "center",
                clipPath: `polygon(0 0, 100% 0, 100% 85%, 90% 100%, 80% 85%, 70% 100%, 60% 85%, 50% 100%, 40% 85%, 30% 100%, 20% 85%, 10% 100%, 0 85%)`,
                zIndex: 5,
              }}
            >
              {data?.discount_type === "percent"
                ? `${data?.discount_price}% OFF`
                : `${getAmountWithSign(data?.discount_price)} OFF`}
            </Box>
          )}
          <Box p={2}>

            {showSameVehicleText && direction === "row" && (
              <Box
                sx={{
                  mt: "12px",
                  px: "8px",
                  py: "4px",
                  background: (theme) => alpha(theme.palette.primary.main, 0.1),
                }}
              >
                <Typography
                  variant="body2"
                  component="div"
                  sx={{
                    color: (theme) => theme.palette.neutral[500],
                    paddingTop: "2px"
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    component="strong"
                    sx={{ mx: "4px" }}
                  >
                    {data?.total_vehicle_count}
                  </Typography>{" "}
                  {t(`Vehicles available`)}
                </Typography>
              </Box>
            )}
            <Stack
              direction={direction === "row" ? "row-reverse" : "column"}
              mt={isMobile ? "0px" : "10px"}
              gap={isMobile ? 0.25 : 0.5}
            >
              <Link
                href={{
                  pathname: `/rental/vehicle-details/${data?.id}`,
                  query: {
                    from: from,
                  },
                }}
                onClick={(e) => {
                  if (disableLink) {
                    e.preventDefault();
                    return;
                  }

                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  setTimeout(() => {
                    window.location.href = e.target.closest("a").href;
                  }, 500);
                }}
              >
                <Stack
                  position="relative"
                  width="100%"
                  sx={{
                    img: {
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      borderRadius: "10px",
                      backgroundColor: "#fff",
                    },
                  }}
                >
                  {/* 
                {data?.new_tag === 1 ? (
                  <CustomBadge
                    top={30}
                    bg_color="#EF8C45"
                    text={t("New Arrival")}
                    fontSize="12px"
                    border_radius="0px 1px 14px 0px"

                  />
                ) : null} */}

                  {/* {handleBadgeRental(data)} */}


                  {/* WISHLIST ICON – Top Right of Image */}
                  <Stack position="relative" width="100%">

                    {/* ✅ WISHLIST ICON – OUTSIDE LINK */}
                    <IconButton
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        isWishlisted
                          ? removeFromWishlistHandler(e)
                          : addToWishlistHandler(e);
                      }}
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        backgroundColor: "rgba(255,255,255,0.9)",
                        zIndex: 10,
                        padding: "4px",
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,1)",
                        },
                      }}
                    >
                      {isWishlisted ? (
                        <FavoriteIcon sx={{ color: "#fd0b07", fontSize: 20 }} />
                      ) : (
                        <FavoriteBorderIcon sx={{ color: "#666", fontSize: 22 }} />
                      )}
                    </IconButton>


                  </Stack>
                  {/* 
                <CustomOverLay
                  border_radius="10px"
                  className="custom_overlay"
                  sx={{
                    display: direction === "row" && "none",
                  }}
                >
                  <QuickView
                    addToWishlistHandler={addToWishlistHandler}
                    removeFromWishlistHandler={removeFromWishlistHandler}
                    isWishlisted={isWishlisted}
                    quickViewHandleClick={(e) => {
                      e.stopPropagation();
                      setOpen(true);
                      setCarDetails(data);
                    }}
                  />
                </CustomOverLay> */}

                  <Box
                    sx={{
                      width: "100%",
                      aspectRatio: "16 / 9",   // ✅ universal ratio
                      borderRadius: "10px",
                      overflow: "hidden",
                      backgroundColor: "#f5f5f5",
                    }}
                  >
                    <Box
                      component="img"
                      src={data?.thumbnail_full_url || ""}
                      alt={data?.name}
                      loading="lazy"
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",     // 🔥 MOST IMPORTANT
                        display: "block",
                      }}
                    />
                  </Box>


                  <Stack direction="row" spacing={2} justifyContent="space-between" mt={1}>
                    <Stack gap={1} width="100%">

                      {/* ⭐ Rating row */}
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <StarIcon sx={{
                          fontSize: isMobile ? "12px" : "14px",
                          color: "#F0A500"
                        }} />


                        <Typography sx={{ fontSize: "13px", fontWeight: 500, color: "#F0A500" }}>
                          {Number(data?.avg_rating || 0).toFixed(1)}
                        </Typography>

                        <Typography sx={{ fontSize: "13px", color: theme.palette.neutral[500], color: "#F0A500" }}>
                          ({data?.total_trip || 0} {t("Trips")})
                        </Typography>
                      </Stack>

                      {/* MAIN 2 COLUMN WRAPPER */}
                      <Stack direction="row" width="100%" alignItems="flex-start">

                        {/* LEFT BLOCK */}
                        <Stack sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            fontFamily="Inter, sans-serif"
                            fontWeight="600"
                              fontSize={isMobile ? 16 : 18}
                            component="h6"
                            sx={{
                              color: "#000000",
                              display: "-webkit-box",
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              wordBreak: "break-word",
                            }}
                          >
                            {limitText(data?.name, 18)}
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: "12px",
                              // color: theme.palette.neutral[600],
                              color: "#000000",
                              textTransform: "capitalize",
                            }}
                          >
                            {data?.type}
                          </Typography>
                        </Stack>


                        {/* RIGHT BLOCK - FLUSH TO IMAGE EDGE */}
                        <Stack
                          alignItems="flex-end"
                          ml="auto"
                          flexShrink={0}
                          onMouseEnter={() => setDisableLink(true)}
                          onMouseLeave={() => setDisableLink(false)}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >

                          {(() => {
                            let basePrice = 0;

                            if (priceType === "hourly") {
                              basePrice = data?.hourly_price || mainPrice(data, "hourly");
                            } else {
                              basePrice = data?.distance_price || mainPrice(data, "distance");
                            }

                            const discountedPrice = getDiscountedAmount(
                              basePrice,
                              data?.discount_price,
                              data?.discount_type,
                              data?.provider?.discount,
                              1,
                              data?.provider?.discount?.max_discount
                            );

                            return (
                              <>
                                {/* PRICE ROW */}
                                <Stack direction="row" spacing={0.5} alignItems="center">

                                  {/* Arrow Icon - only if both supported */}
                                  {data?.trip_hourly === 1 && data?.trip_distance === 1 && (
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handlePriceToggle(e);
                                      }}
                                      sx={{ padding: "2px" }}
                                    >
                                      <KeyboardArrowDownIcon sx={{ fontSize: "18px" }} />
                                    </IconButton>
                                  )}

                                  {/* DISCOUNTED PRICE */}
                                  <Typography
                                    sx={{
                                      fontSize: "16px",
                                      fontWeight: 600,
                                      color: "#1A914B",
                                    }}
                                  >
                                    {getAmountWithSign(discountedPrice)}
                                  </Typography>

                                  {/* BASE PRICE */}
                                  {basePrice !== discountedPrice && (
                                    <Typography
                                      sx={{
                                        fontSize: "13px",
                                        textDecoration: "line-through",
                                        color: theme.palette.neutral[400],
                                      }}
                                    >
                                      {getAmountWithSign(basePrice)}
                                    </Typography>
                                  )}
                                </Stack>
                                {/* TRIP TYPE (UNCHANGED) */}
                                <Typography
                                  sx={{
                                    fontSize: "12px",
                                    color: theme.palette.neutral[500],
                                    textAlign: "right",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {priceType === "hourly"
                                    ? t("Per Hr")
                                    : t("Per Km")}
                                </Typography>
                              </>
                            );
                          })()}

                        </Stack>

                      </Stack>

                    </Stack>


                    <Stack gap={1} alignItems="center">
                      {/* {data?.total_reviews > 0 && (
                      <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                        sx={{
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          padding: "3px 8px",
                          borderRadius: "5px",
                          color: theme.palette.primary.main,
                          svg: { fontSize: "14px" },
                        }}
                      >
                        <StarIcon />
                        <Typography
                          sx={{
                            fontSize: "13px",
                            fontWeight: "500",
                          }}
                        >
                          {data && Number(data?.avg_rating).toFixed(1)}
                        </Typography>
                      </Stack>
                    )}
                    {data?.total_reviews > 0 && (
                      <Typography
                        variant="body2"
                        component="div"
                        sx={{
                          color: (theme) => theme.palette.neutral[500],
                          whiteSpace: "nowrap",
                        }}
                      >
                        {data?.total_reviews} {t("Reviews")}
                      </Typography>
                    )} */}
                    </Stack>
                  </Stack>
                  {showSameVehicleText && direction === "column" && data?.total_vehicle_count !== 1 && (
                    <Box
                      sx={{
                        position: "absolute",
                        right: "0.625rem",
                        bottom: "0.625rem",
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: "50rem",
                        display: "flex",
                        alignItems: "center",
                        zIndex: 0,
                        svg: {
                          color: theme.palette.info.main,
                        },
                      }}
                    >
                      <Typography
                        variant="body2"
                        component="div"
                        className="infoText"
                      >
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          component="strong"
                          sx={{ mx: "3px" }}
                        >
                          {data?.total_vehicle_count}
                        </Typography>
                        {t(`Vehicles available`)}
                      </Typography>
                      {/* <InfoIcon /> */}
                    </Box>
                  )}
                </Stack>

                {/* Features start */}
                <Stack
                  direction="row"
                  flexWrap="wrap"
                  rowGap={isMobile ? 0.5 : 1}
                  columnGap={0}
                  sx={{
                    // background: theme.palette.background.custom7,
                    backgroundColor: "#F6F6F6F7",
                    borderRadius: "12px",
                    padding: isMobile ? "8px" : "12px",
                    marginTop: "5px",

                    "& > div": {
                      width: "25%",            // ✅ keep 4 items per row
                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "column",
                      textAlign: "center",
                      gap: isMobile ? "2px" : "4px",
                    },

                    color: theme.palette.neutral[400],

                    svg: {
                      fontSize: isMobile ? "14px" : "18px",   // ✅ smaller icons on mobile
                      color: "#0f0f0f",
                    },

                    "& p": {
                      fontSize: isMobile ? "10px" : "12px",   // ✅ smaller text on mobile
                      fontWeight: 500,
                      textTransform: "capitalize",
                      color: "#000000",
                      whiteSpace: "nowrap",
                      mt: 0,
                    },
                  }}
                >
                  {data?.transmission_type && (
                    <Stack>
                      <ManageHistoryIcon color={"#0f0f0f"} />
                      <Typography color={"#000000"}>
                        {limitText(data.transmission_type.replace("_", " "))}
                      </Typography>
                    </Stack>
                  )}

                  {data?.seating_capacity && (
                    <Stack>
                      <GroupIcon color={"#0f0f0f"} />
                      <Typography color={"#000000"}>
                        {limitText(`${data.seating_capacity} ${t("Person")}`)}
                      </Typography>
                    </Stack>
                  )}

                  <Stack>
                    <AirIcon color={"#0f0f0f"} />
                    <Typography color={"#000000"}>
                      {limitText(data?.air_condition > 0 ? t("AC") : t("Non AC"))}
                    </Typography>
                  </Stack>

                  {data?.fuel_type && (
                    <Stack>
                      <EvStationIcon color={"#0f0f0f"} />
                      <Typography color={"#000000"}>  {limitText(data.fuel_type.replace("_", " "))}</Typography>
                    </Stack>
                  )}
                </Stack>
                {/* Features End */}
              </Link>

            </Stack>
          </Box>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
            minHeight={30}
            sx={{
              padding: isMobile ? "4px 12px" : "8px 15px",
              marginBottom: "10px ",
              borderRadius: "20px",
              backgroundColor: "transparent",
            }}
          >
            {/* <Box>
              <Typography
                className="original-price"
                sx={{
                  fontSize: "13px",
                  fontWeight: "400",
                  color: (theme) => theme.palette.neutral[400],
                }}
              >
                {t("Start From")}
              </Typography>
              <Stack
                direction="row"
                flexWrap="wrap"
                alignItems="baseline"
                columnGap={0.5}
              >
                {data?.discount_price > 0 ||
                  data?.provider?.discount?.discount > 0 ? (
                  <Typography
                    className="original-price"
                    sx={{
                      fontSize: "13px",
                      fontWeight: "400",
                      textDecoration: "line-through",
                      color: (theme) => theme.palette.neutral[400],
                    }}
                  >
                    {getAmountWithSign(mainPrice(data, rentalSearch?.tripType))}
                  </Typography>
                ) : null}
                <Typography
                  sx={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: (theme) => theme.palette.neutral[1000],
                  }}
                >
                  {getAmountWithSign(
                    getDiscountedAmount(
                      mainPrice(data, rentalSearch?.tripType),
                      data?.discount_price,
                      data?.discount_type,
                      data?.provider?.discount,
                      1,
                      data?.provider?.discount?.max_discount

                    )
                  )}{" "}
                </Typography>

              </Stack>
            </Box> */}
            <RentWithIncrementDecrement
              addToCartHandler={addToCartHandler}
              variations={data?.total_vehicle_count}
              isProductExist={isProductExist}
              count={isProductExist?.quantity}
              handleIncrement={handleIncrement}
              itemId={isProductExist?.id}
              handleDecrement={handleDecrement}
              updateLoading={updateIsLoading}
              removeItemCart={removeItemCart}
              from={from}
              fullWidth={true}
            />
          </Stack>
        </CustomCarCard>

      ) : (
        <HorizontalCarCard
          addToWishlistHandler={addToWishlistHandler}
          removeFromWishlistHandler={removeFromWishlistHandler}
          isWishlisted={isWishlisted}
          addToCartHandler={addToCartHandler}
          variations={data?.total_vehicle_count}
          isProductExist={isProductExist}
          count={isProductExist?.quantity}
          handleIncrement={handleIncrement}
          itemId={isProductExist?.id}
          handleDecrement={handleDecrement}
          updateLoading={updateIsLoading}
          removeItemCart={removeItemCart}
          fromSearch={fromSearch}
          data={data}
          setOpenModal={setOpen}
          setCarDetails={setCarDetails}
        />
      )}

      {state.open && (
        <CarBookingModal
          open={state.open}
          handleClose={handleClose}
          id={data?.id}
          fromCard={cartList?.carts?.length > 0}
          isDifferentProvider={isDifferentProvider}
          handleProviderCheck={handleProviderCheck}
          setCartItemData={setCartItemData}
          selectedPricing={priceType === "hourly" ? "hourly" : "distance_wise"}
          isHourly={data?.trip_hourly}
          isDistence={data?.trip_distance}
          card
          setIsSameOpen={setIsSameOpen}
          setOpenTripChange={setOpenTripChange}
          setIds={setIds}
          setUpdateCartObject={setUpdateCartObject}
        />
      )}
      <CustomModal
        openModal={state.openSameProvider}
        handleClose={() => handleProviderCheck(false)}
      >
        <IconButton
          onClick={() => handleProviderCheck(false)}
          sx={{ position: "absolute", top: 0, right: 0 }}
        >
          <CloseIcon sx={{ fontSize: "16px" }} />
        </IconButton>
        <ProviderCheck
          cartItemData={cartItemData}
          handleProviderCheck={handleProviderCheck}
          confirmMutate={confirmMutate}
          providerId={data?.provider?.id}
        />
      </CustomModal>
      <CustomModal openModal={open} handleClose={() => setOpen(false)} maxWidth="900px">
        <IconButton
          onClick={() => setOpen(false)}
          sx={{ position: "absolute", top: 0, right: 0 }}
        >
          <CloseIcon sx={{ fontSize: "16px" }} />
        </IconButton>
        {/* <RentalCarQuickView
          carDetails={{ ...carDetails, mainPrice: mainPrice(data, rentalSearch?.tripType) }}
          addToCartHandler={addToCartHandler}
          selectedTripType={rentalSearch?.tripType}
          tripHours={
            rentalSearch?.duration ||
            (cartList?.carts?.length > 0 &&
              cartList?.user_data?.estimated_hours)
          }
          quantity={isProductExist?.quantity || 1}
          isProductExist={isProductExist}
          count={isProductExist?.quantity}
          handleIncrement={handleIncrement}
          itemId={isProductExist?.id}
          handleDecrement={handleDecrement}
          updateLoading={updateIsLoading}
          removeItemCart={removeItemCart}
          userData={cartList?.user_data}
          tripDistance={cartList?.user_data?.distance}
          handleRentalTripType={handleRentalTripType}
          handleClose={() => { setOpen(false) }}
          setIsSameOpen={setIsSameOpen}
          setOpenTripChange={setOpenTripChange}
          updateCartObject={updateCartObject}
          setIds={setIds}
          setUpdateCartObject={setUpdateCartObject}
          openCarBookingModal={openCarBookingModal}
          handleIncrementFromCard={handleIncrement}
          handleDecrementFromCard={handleDecrement}
          from={fromSearch}
        /> */}
      </CustomModal>
      <CustomModal openModal={isSameOpen} handleClose={() => { setIsSameOpen(false) }} maxWidth="380px">
        <IconButton
          onClick={() => setIsSameOpen(false)}
          sx={{ position: "absolute", top: 0, right: 0 }}
        >
          <CloseIcon sx={{ fontSize: "16px" }} />
        </IconButton>
        <Stack spacing={2} p="1.5rem">
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
            {/* <InfoIcon sx={{ fontSize: "70px" }} /> */}
            {/* <WarningIcon sx={{ color:theme=>theme.palette.error.main, fontSize: "70px" }} /> */}
          </Stack>
          <Typography textAlign="center" fontSize="18px" fontWeight="600" color={theme => theme.palette.error.main}>
            {t(`Do you want to change trip type`)}
          </Typography>
          <Typography textAlign="center" fontSize="16px" fontWeight="400">
            {(() => {
              const fromType = cartList?.user_data?.rental_type || "";
              const toType = updateCartObject?.tripType || "";

              const getLabel = (type) => {
                if (type === "hourly") return "hourly based";
                if (type === "distance_wise") return "distance based";
                return type.replace("_", " ");
              };

              return t(
                `Are you sure you want to switch trip type to ${getLabel(toType)}?`
              );
            })()}
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button fullWidth variant="outlined" onClick={() => { setIsSameOpen(false) }}>
              {t("No")}
            </Button>
            <LoadingButton backgroundColor="#1A914B" loading={userDataIsLoading} fullWidth variant="contained" onClick={handleChangePrvTripType}>
              {t("Yes")}
            </LoadingButton>
          </Stack>
        </Stack>
      </CustomModal>
      <CustomModal openModal={openTripChange} maxWidth="380px">
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
              cartLists={cartList?.carts}
              updateCartObject={updateCartObject}
              card
              confirmMutate={confirmMutate}
              dispatch={dispatch}
            />
          }
        />
      </CustomModal>
      <CustomModal openModal={openHourDiffModal} handleClose={() => { setOpenHourDiffModal(false) }} maxWidth="350px">
        <IconButton
          onClick={() => setOpenHourDiffModal(false)}
          sx={{ position: "absolute", top: 0, right: 0 }}
        >
          <CloseIcon sx={{ fontSize: "16px" }} />
        </IconButton>
        <Stack spacing={2} p="1.5rem">
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
            {/* <InfoIcon sx={{ fontSize: "70px" }} /> */}
          </Stack>
          <Typography textAlign="center" fontSize="18px" fontWeight="600" color={theme => theme.palette.error.main}>
            {t(`Do you want to change trip duration`)}
          </Typography>
          <Typography textAlign="center" fontSize="16px" fontWeight="400">
            {t(`Are you sure, you want to update trip duration to ${rentalSearch?.duration} hours`)}
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button fullWidth variant="outlined" onClick={() => { setOpenHourDiffModal(false) }}>
              {t("No")}
            </Button>
            <LoadingButton loading={confirmIsLoading} fullWidth variant="contained" onClick={() => { handleHourDiffModal(bookingDetails, updateOrAdd) }}>
              {t("Yes")}
            </LoadingButton>
          </Stack>
        </Stack>
      </CustomModal>
    </>
  );
};

export default VehicleCard;
