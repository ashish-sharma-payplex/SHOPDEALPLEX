// src/components/module-wise-components/rental/components/global/VendorProfile.js

import React, { useEffect } from "react";
import { Box, Typography, Stack } from "@mui/material";
import CustomImageContainer from "components/CustomImageContainer";
import { CustomBoxFullWidth } from "styled-components/CustomStyles.style";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { IconButtonStyled, PrimaryToolTip } from "components/cards/QuickView";
import { useDispatch, useSelector } from "react-redux";
import { useAddWishlist } from "components/home/module-wise-components/rental/rental-api-manage/hooks/react-query/wishlist/useAddWishlist";
import { useRemoveRentalWishList } from "components/home/module-wise-components/rental/rental-api-manage/hooks/react-query/wishlist/useRemoveWishlist";
import { getToken } from "helper-functions/getToken";
import { addWishListProvider, removeWishListProvider, setWishList } from "redux/slices/wishList";
import { toast } from "react-hot-toast";
import { t } from "i18next";
import { not_logged_in_message } from "utils/toasterMessages";
import { useGetWishList } from "components/home/module-wise-components/rental/rental-api-manage/hooks/react-query/wishlist/useGetWishlist";

const VendorProfile = ({ vehicleDetails }) => {
  const dispatch = useDispatch();
  const { wishLists } = useSelector((state) => state?.wishList || { wishLists: {} });

  const onSuccessHandler = (response) => {
    dispatch(setWishList(response));
  };
  const { refetch } = useGetWishList(onSuccessHandler);
  const token = getToken();

  useEffect(() => {
    if (token) {
      refetch();
    }
  }, [token]);

  const { mutate: addFavoriteMutation } = useAddWishlist();
  const { mutate: removeFavoriteMutation } = useRemoveRentalWishList();

  const checkIsWishListed = () => {
    return wishLists?.providers?.find((wishItem) => wishItem.id === vehicleDetails?.provider?.id);
  };

  const addToWishlistHandler = (e) => {
    e.stopPropagation();
    if (getToken()) {
      addFavoriteMutation(
        { key: "provider_id", id: vehicleDetails?.provider?.id },
        {
          onSuccess: (response) => {
            if (response) {
              dispatch(addWishListProvider(vehicleDetails?.provider));
              toast.success(response?.message);
            }
          },
          onError: (error) => {
            toast.error(error?.response?.data?.message || error?.message);
          },
        }
      );
    } else {
      toast.error(t(not_logged_in_message));
    }
  };

  const removeFromWishlistHandler = (e) => {
    e.stopPropagation();
    removeFavoriteMutation(
      { key: "provider_id", id: vehicleDetails?.provider?.id },
      {
        onSuccess: (res) => {
          dispatch(removeWishListProvider(vehicleDetails?.provider?.id));
          toast.success(res.message);
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || error?.message);
        },
      }
    );
  };

  return (
    <CustomBoxFullWidth
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: 1,
        borderRadius: 2,
        backgroundColor: (theme) => theme.palette.background.paper,
      }}
    >
      {/* Top: logo, name, wishlist */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" spacing={2} alignItems="center">
          <CustomImageContainer
            src={vehicleDetails?.provider?.logo_full_url}
            width="50px"
            height="50px"
            borderRadius="50%"
          />
          <Box>
            <Typography fontWeight={600} fontSize={14}>
              {vehicleDetails?.provider?.name}
            </Typography>
            <Typography fontSize={12} color="gray">
              <span style={{ color: "#00A65A", fontWeight: 500 }}>★ {vehicleDetails?.provider?.avg_rating || 0}</span>{" "}
              ({vehicleDetails?.provider?.rating_count || 0} Reviews)
            </Typography>
          </Box>
        </Stack>

        <Box>
          {checkIsWishListed() ? (
            <PrimaryToolTip text={t("Remove from wishlist")}>
              <IconButtonStyled color="#f80000ff" onClick={(e) => removeFromWishlistHandler(e)}>
                <FavoriteIcon />
              </IconButtonStyled>
            </PrimaryToolTip>
          ) : (
            <PrimaryToolTip text={t("Add to wishlist")}>
              <IconButtonStyled color="#b1acacff" onClick={(e) => addToWishlistHandler(e)}>
                <FavoriteBorderIcon />
              </IconButtonStyled>
            </PrimaryToolTip>
          )}
        </Box>
      </Stack>

      {/* Bottom row: Response Time & Vehicle Count */}
      <Stack direction="row" justifyContent="space-between" sx={{ fontSize: 12, color: "gray" }}>
        <Box>
          <Typography fontSize={13} color="black" fontWeight={600}>
  Response Time
</Typography>
          <Typography fontSize={14} fontWeight={500}>{vehicleDetails?.provider?.delivery_time || "N/A"}</Typography>
        </Box>
        <Box>
          <Typography fontSize={13} color="black" fontWeight={600}>Vehicle Count</Typography>
          <Typography fontSize={14} fontWeight={500}>{vehicleDetails?.provider?.provider_total_vehicle_count || 0}+</Typography>
        </Box>
      </Stack>

      {/* Visit Vendor Button */}
      <button
        onClick={() => window.location.href = `/rental/provider-details/${vehicleDetails?.provider?.id}`}
        style={{
          width: "100%",
          padding: "13px ",
          borderRadius: "8px",
          border: "1px solid #16A34A",
          background: "transparent",
          color: "#16A34A",
          fontSize: "15px",
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "Inter, sans-serif"
        }}
        onMouseEnter={(e) => { e.target.style.background = "#16A34A"; e.target.style.color = "#fff"; }}
        onMouseLeave={(e) => { e.target.style.background = "transparent"; e.target.style.color = "#16A34A"; }}
      >
        Visit Vendor
      </button>
    </CustomBoxFullWidth>
  );
};

export default VendorProfile;
