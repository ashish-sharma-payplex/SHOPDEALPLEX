import React from "react";
import { CustomStackFullWidth } from "../../styled-components/CustomStyles.style";
import { styled, Typography } from "@mui/material";
import { DeliveryProgressBarStack } from "./Cart.style";
import discountImage from "./assets/discount.png";
import CustomImageContainer from "../CustomImageContainer";
import { useTheme } from "@emotion/react";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import { Stack } from "@mui/system";
import { t } from "i18next";
import { getAmountWithSign } from "../../helper-functions/CardHelpers";
import { cartItemsTotalAmount } from "../../utils/CustomFunctions";
export const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 4,
  marginTop: "3px",
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[theme.palette.primary.light],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.primary.main,
  },
}));
const FreeDeliveryProgressBar = ({ configData, cartList }) => {
  const theme = useTheme();
  const freeDeliveryTargetAmount = (configData, cartList) => {
    let lessAmount =
      Number(configData?.free_delivery_over) - cartItemsTotalAmount(cartList);
    if (
      cartItemsTotalAmount(cartList) >= Number(configData?.free_delivery_over)
    ) {
      return 0;
    } else {
      return lessAmount;
    }
  };
  const reamingAmount = freeDeliveryTargetAmount(configData, cartList);
  const convertedNumberToHundred = Math.round(
    (100 / configData?.free_delivery_over) * cartItemsTotalAmount(cartList)
  );
  const convertedValueToHundred = Math.min(
    Math.max(convertedNumberToHundred, 0),
    100
  );

  return (
    <DeliveryProgressBarStack 
    sx={{
    background: "#fff",
    borderRadius: "16px",
    padding: "14px",
    my:"10px",
    width: "100%",
    boxShadow: "0px 2px 10px rgba(0,0,0,0.06)",
  }}
  spacing={1}>

  

  {/* Top Row */}
  <Stack direction="row" alignItems="center" justifyContent="space-between">
    {/* Left Side */}
    <Stack direction="row" spacing={1} alignItems="center">
      <CustomImageContainer src={"/deliveryperson.svg"} width="36px" height="36px" alt="icon" />

      <Stack spacing={0}>
        <Typography fontSize="14px" fontWeight={600} color="#0B0B0C">
          {t("Get a FREE delivery")}
        </Typography>

        {reamingAmount > 0 ? (
          <Typography fontSize="13px" fontWeight={400} color="#6B7280">
            {t("Add products worth")}{" "}
            <Typography component="span" fontWeight={600} color="#0B0B0C">
              {getAmountWithSign(reamingAmount)}
            </Typography>{" "}
            {t("more")}
          </Typography>
        ) : (
          <Typography fontSize="13px" fontWeight={400} color={theme.palette.primary.main}>
            {t("You have reduced delivery charge")}
          </Typography>
        )}
      </Stack>
    </Stack>

    {/* Arrow icon on right */}
    <Typography fontSize="18px" color="#6B7080">
      ›
    </Typography>
  </Stack>

  {/* Progress Bar */}
  <BorderLinearProgress variant="determinate" value={convertedValueToHundred} />


    </DeliveryProgressBarStack>
  );
};

export default FreeDeliveryProgressBar;
