import React from "react";
import { CustomStackFullWidth } from "../../styled-components/CustomStyles.style";
import CustomImageContainer from "../CustomImageContainer";
import startImage from "./assets/start.png";
import { Box, Button, IconButton, Stack, Typography, useTheme } from "@mui/material";
import { t } from "i18next";
import ProductMoreView from "./visit-again/ProductMoreView";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import CloseIcon from "@mui/icons-material/Close";

const LastOrderReview = ({
  handleClose,
  handleRateButtonClick,
  productImage,
}) => {
  const theme = useTheme();
  return (
    <CustomStackFullWidth
      position="relative"
      p={{ xs: "1.75rem 1.5rem 1.5rem", sm: "2rem 2rem 1.75rem" }}
      justifyContent="center"
      alignItems="center"
      spacing={0}
      sx={{
        borderRadius: "20px",
        background: `linear-gradient(180deg, ${theme.palette.primary.main}14 0%, ${theme.palette.background.paper} 40%)`,
        overflow: "hidden",
      }}
    >
      <IconButton
        onClick={() => handleClose()}
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          width: { xs: 26, sm: 30 },
          height: { xs: 26, sm: 30 },
          backgroundColor: theme.palette.background.paper,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          "&:hover": {
            backgroundColor: theme.palette.neutral[100],
          },
        }}
      >
        <CloseIcon sx={{ fontSize: { xs: "14px", md: "18px" } }} />
      </IconButton>

      {/* Floating stars around the mascot image for a little visual flourish */}
      <Box sx={{ position: "relative", mb: "0.75rem" }}>
        <StarRoundedIcon
          sx={{
            position: "absolute",
            top: -6,
            left: -14,
            fontSize: "14px",
            color: theme.palette.warning?.main || "#FFB020",
            opacity: 0.9,
          }}
        />
        <StarRoundedIcon
          sx={{
            position: "absolute",
            bottom: -2,
            right: -16,
            fontSize: "10px",
            color: theme.palette.warning?.main || "#FFB020",
            opacity: 0.7,
          }}
        />
        <Box
          sx={{
            width: { xs: "78px", sm: "88px" },
            height: { xs: "78px", sm: "88px" },
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.palette.background.paper,
            boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
          }}
        >
          <CustomImageContainer
            src={startImage.src}
            width="52px"
            height="52px"
          />
        </Box>
      </Box>

      <Typography
        fontSize={{ xs: "14px", sm: "16px" }}
        textAlign="center"
        fontWeight="700"
        color={theme.palette.neutral[800] || theme.palette.text.primary}
        sx={{ maxWidth: "280px", lineHeight: 1.35 }}
      >
        {t("How was your experience with your last order ?")}
      </Typography>
      <Typography
        fontSize={{ xs: "10.5px", sm: "12.5px" }}
        fontWeight="400"
        color={theme.palette.neutral[600]}
        mt="4px"
        textAlign="center"
      >
        {t("Share us your valuable feedbacks")}
      </Typography>

      <Stack
        width="100%"
        direction="row"
        justifyContent="center"
        alignItems="center"
        my={{ xs: "1.1rem", sm: "1.4rem" }}
        py="0.6rem"
        sx={{
          borderTop: `1px dashed ${theme.palette.neutral[200] || "rgba(0,0,0,0.08)"}`,
          borderBottom: `1px dashed ${theme.palette.neutral[200] || "rgba(0,0,0,0.08)"}`,
        }}
      >
        <ProductMoreView
          products={productImage}
          width="55px"
          height="38px"
          justifyContent="center"
        />
      </Stack>

      <Button
        onClick={() => handleRateButtonClick()}
        variant="contained"
        startIcon={
          <StarRoundedIcon
            sx={{
              width: { xs: "17px", sm: "18px", md: "19px" },
              height: "auto",
            }}
          />
        }
        sx={{
          p: {
            xs: "7px 22px",
            sm: "9px 28px",
            md: "9px 28px",
          },
          fontSize: {
            xs: "12.5px",
            sm: "13px",
            md: "14px",
          },
          fontWeight: 600,
          borderRadius: "30px",
          textTransform: "none",
          boxShadow: `0 8px 20px -6px ${theme.palette.primary.main}80`,
          "&:hover": {
            backgroundColor: (theme) => theme.palette.primary.dark,
            color: (theme) => theme.palette.whiteContainer.main,
          },
        }}
      >
        {t("Give Review")}
      </Button>
    </CustomStackFullWidth>
  );
};

export default LastOrderReview;