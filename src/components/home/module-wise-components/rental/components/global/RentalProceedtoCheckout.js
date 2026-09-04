// src\components\home\module-wise-components\rental\components\global\RentalProceedtoCheckout.js
import React from "react";
import { Box, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { t } from "i18next";
import { getAmountWithSign } from "helper-functions/CardHelpers";
import { useTheme } from "@mui/material/styles";
import styles from "styles/rental.module.css";

const RentalProceedtoCheckout = ({
  onClick,
  text = "Proceed to Checkout",
  sx,
  rentalUserData,
  isLoading,
  totalAmount,
  discountDifference,
  isShowDiscount,
  textKey = "cart",
}) => {
  const theme = useTheme();
  const GREEN = "#1A914B";
  const DARKER_GREEN = "#1A914B";

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "instant" }); // ✅ pehle scroll
    onClick?.(); // phir navigate
  };

  const getText = {
    cart: (
      <Typography
        sx={{
          fontSize: 16,
          fontWeight: 400,
          display: "flex",
          gap: 1,
          color: (theme) => theme.palette.neutral[1000],
        }}
      >
        {rentalUserData?.user_data?.rental_type === "hourly" ? (
          <>
            {t("Estimated")} <b>{rentalUserData?.user_data?.estimated_hours}</b>{" "}
            Hrs
          </>
        ) : (
          <>
            {t("Estimated")}{" "}
            <b>{rentalUserData?.user_data?.distance?.toFixed(2)}</b> Km
          </>
        )}
      </Typography>
    ),
    "trip-status": (
      <Typography sx={{ fontSize: 16, fontWeight: 700 }}></Typography>
    ),
  };

  return (
    <Box sx={sx}>
      {discountDifference && isShowDiscount ? (
        <Typography
          className={styles.rentalBadgeWarning}
          sx={{
            fontSize: 14,
            fontWeight: 400,
            width: "100%",
            padding: "8px 0",
          }}
          align="center"
        >
          {t(
            `You got ${getAmountWithSign(
              discountDifference,
            )} additional discount`,
          )}
        </Typography>
      ) : null}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        {getText[textKey]}
        <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
          {getAmountWithSign(totalAmount)}
        </Typography>
      </Box>

      <LoadingButton
        onClick={handleClick}
        loading={isLoading || false}
        variant="contained"
        fullWidth
        sx={{
          backgroundColor: GREEN,
          "&:hover": { backgroundColor: DARKER_GREEN },
          color: "#fff",
          borderRadius: "8px",
          py: "12px",
          textTransform: "none",
          fontWeight: 600,
          boxShadow: "none",
        }}
      >
        {t(text)}
      </LoadingButton>
    </Box>
  );
};

export default RentalProceedtoCheckout;
