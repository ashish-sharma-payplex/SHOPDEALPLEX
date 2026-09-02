import React, { useEffect } from "react";
import { CustomStackFullWidth } from "../../styled-components/CustomStyles.style";
import { Typography, useMediaQuery, useTheme, Button, Stack, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import SimpleBar from "simplebar-react";
import CartContent from "./CartContent";
import cartImage from "./assets/cartImage.png";
import CustomImageContainer from "../CustomImageContainer";
import "simplebar-react/dist/simplebar.min.css";
import { getAmountWithSign } from "../../helper-functions/CardHelpers";
import { cartItemTotalDiscount } from "../../utils/CustomFunctions";
import DeleteIcon from "@mui/icons-material/Delete";
import { Toaster } from "react-hot-toast";

const CartContents = ({
  cartList = [],
  imageBaseUrl,
  refetch,
  handleClearCart,
  deleteLoading,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));

  // ✅ Sirf yahi line change hui hai — localStorage se estimated_delivery_time lo
  const deliveryTime =
    localStorage.getItem("estimated_delivery_time") || "25 mins";
  // console.log("Delivery Time", deliveryTime)
  return (
    <>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            boxShadow: "none",
            WebkitBoxShadow: "none",
            MozBoxShadow: "none",
          },
        }}
      />
      <CustomStackFullWidth
        justifyContent="flex-start"
        sx={{
          backgroundColor: "white",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          padding: "1rem",
        }}
        alignItems="center"
        mt=".7rem"
      >
        <SimpleBar
          style={{
            maxHeight: "60vh",
            width: "100%",
            borderRadius: "12px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              padding: "8px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #EAEAEA",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "400px",
            }}
          >
            <Box
              sx={{
                backgroundColor: "#F8F8F8",
                borderRadius: "12px",
                marginRight: "12px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "40px",
                height: "40px",
              }}
            >
              <img
                src="/clock.svg"
                alt="Delivery Icon"
                style={{ width: "80%", height: "80%", objectFit: "contain" }}
              />
            </Box>

            <Stack spacing={0.5}>
              <Typography variant="h7" sx={{ fontWeight: 600, color: "#1D1D1D" }}>
                Delivery in {deliveryTime}
              </Typography>
              <Typography variant="body2" sx={{ color: "#7A7A7A" }}>
                Shipment of {cartList.length} Items
              </Typography>
            </Stack>

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ padding: "5px", marginLeft: "auto" }}
            >
              <Button
                variant="outlined"
                color="error"
                onClick={handleClearCart}
                sx={{
                  fontWeight: "bold",
                  fontSize: "12px",
                  padding: "6px 6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                disabled={deleteLoading}
              >
                <DeleteIcon sx={{ fontSize: "16px" }} />
                {deleteLoading ? "Clearing..." : "Clear Cart"}
              </Button>
            </Stack>
          </Box>

          {cartList?.length > 0 &&
            cartList.map((item, index) => {
              const uniqueKey = `${item?.id ?? "item"}-${index}`;
              return (
                <CartContent
                  key={uniqueKey}
                  cartItem={item}
                  imageBaseUrl={imageBaseUrl}
                  refetch={refetch}
                />
              );
            })}
        </SimpleBar>
      </CustomStackFullWidth>
    </>
  );
};

export default CartContents;