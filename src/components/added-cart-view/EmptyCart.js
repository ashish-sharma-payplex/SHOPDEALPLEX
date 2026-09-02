import React from "react";
import { Stack } from "@mui/system";

import { CustomTypographyBold } from "styled-components/CustomStyles.style";
import { useTranslation } from "react-i18next";
import CartIcon from "./assets/CartIcon";
import { EmptyCartBox } from "./Cart.style";
import { Typography } from "@mui/material";
import { useTheme } from "@emotion/react";
import CartActions from "./CartActions";

const EmptyCart = ({ setSideDrawerOpen, cartList, text, icon, subTitle }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Stack height="614px" width="100%" sx={{px:"12px"}}>
      <Stack
        sx={{
         
          alignItems: "center",
          justifyContent: "center",
         
        
        }}
        container="true"
        spacing={2.5}
      >
        <EmptyCartBox>
          {icon ? (
            icon
          ) : (
            <CartIcon
              width="28px"
              height="30px"
              color={theme.palette.primary.main}
            />
          )}
        </EmptyCartBox>
    <CustomTypographyBold align="center">
  {t("Your Cart is Empty")}
</CustomTypographyBold>

<Typography fontSize="14px" width="300px" align="center">
  {subTitle ??
    t("Add products to start shopping.")}
</Typography>
      </Stack>
      <CartActions
        setSideDrawerOpen={setSideDrawerOpen}
        text={text}
        cartList={cartList}
      />
    </Stack>
  );
};

export default EmptyCart;
