import { alpha, Box, IconButton, Typography } from "@mui/material";
import CustomImageContainer from "components/CustomImageContainer";
import H3 from "components/typographies/H3";
import { CustomBoxFullWidth } from "styled-components/CustomStyles.style";
import FavoriteIcon from "@mui/icons-material/Favorite";
import StarIcon from "@mui/icons-material/Star";
import ShareIcon from "@mui/icons-material/Share";
import { t } from "i18next";
import { Stack } from "@mui/system";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { IconButtonStyled, PrimaryToolTip } from "components/cards/QuickView";
import React, { useEffect, useState } from "react";
import { useTheme } from "@emotion/react";
import {
  addWishListProvider,
  removeWishListProvider,
  setWishList,
} from "redux/slices/wishList";
import { toast } from "react-hot-toast";
import { not_logged_in_message } from "utils/toasterMessages";
import { getToken } from "helper-functions/getToken";
import { useAddWishlist } from "components/home/module-wise-components/rental/rental-api-manage/hooks/react-query/wishlist/useAddWishlist";
import { useRemoveRentalWishList } from "components/home/module-wise-components/rental/rental-api-manage/hooks/react-query/wishlist/useRemoveWishlist";
import { useDispatch, useSelector } from "react-redux";
import { useGetWishList } from "components/home/module-wise-components/rental/rental-api-manage/hooks/react-query/wishlist/useGetWishlist";
import CustomModal from "components/modal";
import RentalCarReviewModal from "../global/RentalReviewModal";
import CloseIcon from "components/icons/CloseIcon";
import ClosedNowScheduleWise from "components/closed-now/ClosedNowScheduleWise";

// IMPORTANT: The component now accepts 'sx' to handle external styling like margin
const RentalCarVehicleRating = ({ data, configData, sx }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { wishLists } = useSelector((state) => state?.wishList);
  const [open, setOpen] = useState(false);

  // Destructure data early for use in logic
  const {
    logo_full_url,
    address,
    name,
    avg_rating,
    rating_count,
    delivery_time
  } = data;

  // Wishlist Logic setup (simplified for context, assumed imports are correct)
  const onSuccessHandler = (response) => {
    dispatch(setWishList(response));
  };
  const { refetch } = useGetWishList(onSuccessHandler);
  const token = getToken();
  const refetchWishlist = async () => {
    await refetch();
  };
  useEffect(() => {
    if (token) {
      refetchWishlist();
    }
  }, [token]);

  const { mutate: addFavoriteMutation } = useAddWishlist();
  const { mutate: removeFavoriteMutation } = useRemoveRentalWishList();

  const checkIsWishListed = () => {
    return wishLists?.providers?.find(
      (wishItem) => wishItem.id === data?.id
    );
  };

  const addToWishlistHandler = (e) => {
    e.stopPropagation();
    if (getToken()) {
      addFavoriteMutation(
        { key: "provider_id", id: data?.id },
        {
          onSuccess: (response) => {
            if (response) {
              dispatch(addWishListProvider(data));
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
      dispatch(removeWishListProvider(data?.id));
      toast.success(res.message, {
        id: "wishlist_removeWishlist",
      });
    };
    removeFavoriteMutation(
      { key: "provider_id", id: data?.id },
      {
        onSuccess: onSuccessHandlerForDelete,
        onError: (error) => {
          toast.error(error.response.data.message);
        },
      }
    );
  };

  // *** UPDATED SHARE HANDLER: Copies provider address ***
  const handleShare = () => {
    const providerAddress = address || t('Provider address not available.');

    navigator.clipboard.writeText(providerAddress)
      .then(() => {
        // Changed toast message to confirm address copy
        toast.success(t("Provider address copied to clipboard"));
      })
      .catch((err) => {
        // console.error('Could not copy text: ', err);
        toast.error(t("Failed to copy address."));
      });
  };


  return (
    <>
      {/* Main Container with Thin Stroke/Border and external SX prop applied */}
      <CustomBoxFullWidth
        sx={{
          backgroundColor: (theme) => theme.palette.background.paper,
          border: `1px solid ${theme.palette.neutral[300]}`,
          borderRadius: "10px",
          ...sx, // Apply margin-bottom from parent component
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            py: { xs: "10px", sm: "20px" },
            px: { xs: "10px", sm: "20px" },
          }}
        >
          {/* Logo and Provider Details (Left Side) */}
          <Stack
            direction="row"
            justifyContent="start"
            alignItems="center"
            spacing={{ xs: 1, sm: 2 }}
          >
            {/* Logo */}
            <Box sx={{ position: "relative", display: "inline-block" }}>
              <CustomImageContainer
                width={{ xs: "40px", sm: "50px" }}
                height={{ xs: "40px", sm: "50px" }}
                borderRadius="50%"
                src={logo_full_url}
                alt={name || "Provider Logo"}
                title={name || "Provider Logo"}
              />
              {data?.active !== undefined && (
                <ClosedNowScheduleWise
                  active={data?.active}
                  schedules={data?.schedules}
                  borderRadius="49%"
                />
              )}
            </Box>

            {/* Name, Address, Pickup Time */}
            <Box>
              <H3
                text={name}
                sx={{
                  fontWeight: "700",
                  textTransform: "capitalize",
                  color: (theme) => theme.palette.neutral[1000],
                  fontSize: { xs: "16px", sm: "18px" },
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden"
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "400",
                  fontSize: "14px",
                  lineHeight: "1.2",
                  color: (theme) => theme.palette.neutral[700],
                  mt: "2px",
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden"
                }}
              >
                {address}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "500",
                  fontSize: "13px",
                  mt: "4px",
                  lineHeight: "1.2",
                  color: (theme) => theme.palette.success.main,
                }}
              >
                Open now
                <Typography
                  component="span"
                  sx={{
                    fontWeight: "400",
                    fontSize: "13px",
                    color: (theme) => theme.palette.neutral[700],
                    ml: "5px",
                  }}
                >
                  | Approx. Pickup Time : {delivery_time}
                </Typography>
              </Typography>
            </Box>
          </Stack>

          {/* Right Side: Rating and Action Buttons */}
          <Stack
            direction="row"
            alignItems="center"
            sx={{
              borderRadius: '8px',
              p: '0',
              overflow: 'hidden',
            }}
          >
            {/* Rating Section (Exact required look) */}
            <Stack
              alignItems="center"
              justifyContent="center"
              spacing={0.2}
              onClick={() => setOpen(true)}
              sx={{
                px: { xs: "10px", sm: "12px" },
                py: { xs: "8px", sm: "10px" },
                cursor: 'pointer',
              }}
            >
              <Stack direction="row" spacing={0.5} alignItems="center">
                <StarIcon sx={{ color: theme.palette.success.main, fontSize: { xs: '18px', sm: '20px' } }} />
                <Typography fontSize={{ xs: "14px", sm: "16px" }} fontWeight="600">
                  {avg_rating?.toFixed(1) || 0}
                </Typography>
              </Stack>
              <Typography fontSize="10px" fontWeight="400" color={theme.palette.neutral[700]}>
                {rating_count}+ ratings
              </Typography>
            </Stack>

            {/* Vertical Separator */}
            <Box
              sx={{
                height: '40px',
                width: '1px',
                backgroundColor: theme.palette.neutral[300]
              }}
            />

            {/* Wishlist Button (Heart) */}
            <PrimaryToolTip
              text={checkIsWishListed() ? "Remove from wishlist" : "Add to wishlist"}
            >
              <IconButton
                onClick={checkIsWishListed() ? removeFromWishlistHandler : addToWishlistHandler}
                sx={{
                  borderRadius: 0,
                  width: { xs: '40px', sm: '48px' },
                  height: { xs: '40px', sm: '48px' },
                  color: checkIsWishListed() ? "#ff0000" : theme.palette.neutral[500],
                  transition: '0.3s',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.neutral[300], 0.3),
                  },
                }}
              >
                {checkIsWishListed() ? (
                  <FavoriteIcon fontSize="small" />
                ) : (
                  <FavoriteBorderIcon fontSize="small" />
                )}
              </IconButton>
            </PrimaryToolTip>

            {/* Share Button (Copies URL to clipboard on click) */}
            <PrimaryToolTip text="Share">
              <IconButton
                onClick={handleShare}
                sx={{
                  borderRadius: 0,
                  width: { xs: '40px', sm: '48px' },
                  height: { xs: '40px', sm: '48px' },
                  color: theme.palette.neutral[500],
                  transition: '0.3s',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.neutral[300], 0.3),
                  },
                }}
              >
                <ShareIcon fontSize="small" />
              </IconButton>
            </PrimaryToolTip>

          </Stack>
        </Stack>

        {/* Review Modal */}
        <CustomModal openModal={open} handleClose={() => setOpen(false)}>
          <IconButton
            onClick={() => setOpen(false)}
            sx={{ position: "absolute", top: 0, right: 0 }}
          >
            <CloseIcon sx={{ fontSize: "16px" }} />
          </IconButton>
          <RentalCarReviewModal
            product_avg_rating={avg_rating}
            reviews_comments_count={data?.reviews_comments_count}
            rating_count={rating_count}
            id={data?.id}
            restaurantDetails={data}
            configData={configData}
          />
        </CustomModal>
      </CustomBoxFullWidth>
    </>
  );
};

export default RentalCarVehicleRating;