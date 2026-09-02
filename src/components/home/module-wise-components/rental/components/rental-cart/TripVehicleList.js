import { Box, Button, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/system";
import CustomImageContainer from "components/CustomImageContainer";
import React from "react";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { t } from "i18next";
import { getAmountWithSign, getDiscountedAmount } from "helper-functions/CardHelpers";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import usePostLocationUpdate from "components/home/module-wise-components/rental/rental-api-manage/hooks/react-query/confirm-booking/usePostLocationUpdate";
import { useMutation } from "react-query";
import useDeleteMultipleItem from "components/home/module-wise-components/rental/rental-api-manage/hooks/react-query/confirm-booking/useDeleteMultipleItem";
import { onErrorResponse } from "api-manage/api-error-response/ErrorResponses";
import { setCartList } from "redux/slices/cart";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { LoadingButton } from "@mui/lab";
import { bookingConfirm } from "../global/search/searchHepler";
import { getGuestId, getToken } from "helper-functions/getToken";

const TripVehicleList = ({
  cartLists,
  ids,
  onCloseModal,
  updateCartObject,
  card,
  confirmMutate,
}) => {
  const dispatch = useDispatch();
  const { mutate: userDataUpdateMutate, isLoading: userDataIsLoading } =
    usePostLocationUpdate();
  const { mutate, isLoading } = useDeleteMultipleItem();

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
    distance:
      updateCartObject?.data?.rows?.[0]?.elements[0]?.distance?.value / 1000,
    guest_id: getToken() ? null : getGuestId(),
  };

  const removeAndAdd = () => {
    if (card) {
      mutate(ids, {
        onSuccess: (data) => {
          userDataUpdateMutate(tempUpdateCartObject, {
            onSuccess: (res) => {
              bookingConfirm({
                ...updateCartObject,
                confirmMutate,
                dispatch,
                setCartList,
                toast,
                handleClose: onCloseModal,
                onErrorResponse,
              });
            },
            onError: onErrorResponse,
          });
        },
        onError: onErrorResponse,
      });
    } else {
      mutate(ids, {
        onSuccess: (data) => {
          userDataUpdateMutate(updateCartObject, {
            onSuccess: (res) => {
              dispatch(setCartList(res));
              toast.success("updated successfully!");
              onCloseModal?.();
            },
            onError: onErrorResponse,
          });
        },
        onError: onErrorResponse,
      });
    }
  };

  return (
    <CustomStackFullWidth
      sx={{
        maxWidth: "480px",
        bgcolor: "#ffffff",
        borderRadius: "16px",
        p: { xs: "20px 16px", sm: "28px 24px 24px" },
      }}
    >
      {/* Vehicle List */}
      <Box sx={{
        maxHeight: "240px", overflowY: "auto", pr: "2px",
        "&::-webkit-scrollbar": { width: "4px" },
        "&::-webkit-scrollbar-thumb": { background: "#ddd", borderRadius: "4px" },
        "&::-webkit-scrollbar-track": { background: "transparent" },
      }}>
        {cartLists?.map((item) => (
          <Vehicle key={item?.id} item={item} ids={ids} cartList={cartLists} />
        ))}
      </Box>

      {/* Divider */}
      <Box sx={{ height: "1px", bgcolor: "#f0f0f0", my: "20px" }} />

      {/* Warning Notice */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
          bgcolor: "#fffbf0",
          border: "0.5px solid #fde9a0",
          borderRadius: "10px",
          p: "12px 14px",
        }}
      >
        <ReportProblemIcon
          sx={{ color: "#d08a00", fontSize: "16px", mt: "2px", flexShrink: 0 }}
        />
        <Typography
          sx={{
            fontSize: "12px",
            color: "#7a5c00",
            lineHeight: 1.6,
            fontWeight: "400",
          }}
        >
          {t(
            "One of the vehicles in your list doesnt have a distance wise trip. If you proceed with a distance wise trip this vehicle will be removed."
          )}
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ mt: "20px" }}
      >
        <Button
          onClick={onCloseModal}
          sx={{
            borderRadius: "10px",
            fontSize: "14px",
            py: "13px",
            px: "20px",
            fontWeight: "500",
            color: "red",
            bgcolor: "#f5f5f5",
            border: "0.5px solid #ddd",
            flexShrink: 0,
            width: { xs: "100%", sm: "110px" },   // fixed smaller width
            "&:hover": {
              bgcolor: "#ececec",
            },
          }}
        >
          {t("Cancel")}
        </Button>
        <LoadingButton
          onClick={removeAndAdd}
          variant="contained"
          fullWidth                                // baaki saari jagah le lega
          loading={userDataIsLoading}
          sx={{
            borderRadius: "10px",
            py: "13px",
            fontSize: "14px",
            fontWeight: "500",
            whiteSpace: "nowrap",
            bgcolor: "#1A914B",
            boxShadow: "none",
            "&:hover": {
              bgcolor: "#177d40",
              boxShadow: "none",
            },
            "&:active": {
              opacity: 0.88,
            },
          }}
        >
          {t("Remove & Continue")}
        </LoadingButton>
      </Stack>
    </CustomStackFullWidth>
  );
};

export default TripVehicleList;

const Vehicle = ({ item, ids, cartList }) => {
  const isNotMatchItem = () => {
    return ids.includes(item?.id);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        border: "0.5px solid",
        borderColor: isNotMatchItem() ? "#fde2d4" : "#e8e8e8",
        bgcolor: isNotMatchItem() ? "#fff8f5" : "#fafafa",
        borderRadius: "10px",
        p: "12px 14px",
        mb: "8px",
        transition: "border-color 0.15s",
      }}
    >
      {/* Left: Image + Info */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <CustomImageContainer
          src={item?.vehicle?.images_full_url[0]}
          width="56px"
          height="56px"
          borderRadius="8px"
          objectFit="cover"
        />
        <Box>
          <Typography sx={{ fontWeight: "500", fontSize: "13px", color: "#111", mb: "5px" }}>
            {item?.vehicle?.name}
          </Typography>

          {/* Hourly Price */}
          {item?.vehicle?.trip_hourly === 1 && (
            <Stack direction="row" alignItems="center" spacing={0.6} sx={{ mb: "2px" }}>
              <Typography sx={{ fontSize: "11px", color: "#888" }}>
                {t("Hourly")}:
              </Typography>
              {(item?.vehicle?.discount_price > 0 ||
                item?.vehicle?.provider?.discount?.discount > 0) && (
                  <Typography
                    component="span"
                    sx={{
                      fontSize: "10px",
                      color: "#bbb",
                      textDecoration: "line-through",
                    }}
                  >
                    {getAmountWithSign(item?.vehicle?.hourly_price)}
                  </Typography>
                )}
              <Typography
                component="span"
                sx={{ fontSize: "12px", fontWeight: "500", color: "#555" }}
              >
                {getAmountWithSign(
                  getDiscountedAmount(
                    item?.vehicle?.hourly_price,
                    item?.vehicle?.discount_price,
                    item?.vehicle?.discount_type,
                    item?.provider?.discount,
                    1
                  )
                )}
              </Typography>
            </Stack>
          )}

          {/* Distance Price */}
          {item?.vehicle?.trip_distance === 1 && (
            <Stack direction="row" alignItems="center" justifyContent={"center"} spacing={0.6}>
              <Typography sx={{ fontSize: "11px", color: "#888" }}>
                {t("Distance")}:
              </Typography>
              {(item?.vehicle?.discount_price > 0 ||
                item?.vehicle?.provider?.discount?.discount > 0) && (
                  <Typography
                    component="span"
                    sx={{
                      fontSize: "10px",
                      color: "#bbb",
                      textDecoration: "line-through",
                    }}
                  >
                    {getAmountWithSign(item?.vehicle?.distance_price)}
                  </Typography>
                )}
              <Typography
                component="span"
                sx={{ fontSize: "12px", fontWeight: "500", color: "#555" }}
              >
                {getAmountWithSign(
                  getDiscountedAmount(
                    item?.vehicle?.distance_price,
                    item?.vehicle?.discount_price,
                    item?.vehicle?.discount_type,
                    item?.provider?.discount,
                    1
                  )
                )}
              </Typography>
            </Stack>
          )}
        </Box>
      </Box>

      {/* Right: Status Icon */}
      <Box
        sx={{
          flexShrink: 0,
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: isNotMatchItem() ? "#fff0eb" : "#e8f7ee",
          ml: "10px",
        }}
      >
        {isNotMatchItem() ? (
          <ReportProblemIcon sx={{ color: "#d0600a", fontSize: "16px" }} />
        ) : (
          <CheckCircleIcon sx={{ color: "#1A914B", fontSize: "16px" }} />
        )}
      </Box>
    </Box>
  );
};