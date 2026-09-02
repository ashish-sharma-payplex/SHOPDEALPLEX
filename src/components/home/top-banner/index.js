// src\components\home\top-banner\index.js
import React, { useEffect, useRef } from "react";
import { useTheme } from "@emotion/react";
import {
  Box,
  Stack,
  Typography,
  useMediaQuery,
  Button,
} from "@mui/material";
import { t } from "i18next";
import LocalTaxiIcon from "@mui/icons-material/LocalTaxi";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useGetCategoryVehicleLists } from "api-manage/hooks/react-query/useGetCategoryVehicleLists";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

const RentalBanner = () => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));


  const router = useRouter();
  const { data } = useGetCategoryVehicleLists();
  const categories = data?.vehicles ?? [];
 const hasShownToast = useRef(false);

useEffect(() => {
  if (hasShownToast.current) return;

  const zoneId = localStorage.getItem("zoneid");

  // if (!zoneId) {
  //   toast.error("Please select a zone first!");
  //   hasShownToast.current = true;
  // }
}, []);



  return (
    <Box
      // Full-Width Container
      sx={{
        pt: { xs: 4, md: 8 },
        pb: { xs: 8, md: 0 },
        width: "100vw",
        marginLeft: "calc(-50vw + 50%)",
        marginRight: "calc(-50vw + 50%)",
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={4}
        alignItems="center"
        justifyContent="space-between"
        sx={{
          maxWidth: "1200px",
          margin: "0 auto",
          px: { xs: 2, md: 6, lg: 12 },
          width: "100%",
        }}
      >
        {/* Left Side: Text + Button */}
        <Stack
          spacing={2}
          sx={{
            width: { xs: "100%", md: "50%" },
            textAlign: { xs: "center", md: "left" },
          }}
        >
          <Typography
            variant={isSmall ? "h4" : "h2"}
            component="h1"
            fontWeight={700}
            lineHeight={1.1}
            color={theme.palette.text.primary}
          >
            <span style={{ color: theme.palette.warning.main }}>
              {t("Easy")}
            </span>{" "}
            {t("Rentals,")}
            <br />
            {t("Anywhere You Go.")}
          </Typography>

          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              justifyContent: { xs: "center", md: "flex-start" },
            }}
          >
            <Typography variant="body1" fontWeight={500}>
              {t("Find Perfect Car To Drive")}
            </Typography>
            <LocalTaxiIcon sx={{ color: theme.palette.text.primary }} />
          </Stack>

          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              maxWidth: "450px",
              margin: { xs: "0 auto", md: 0 },
            }}
          >
            {t(
              "Want to book a car for camping, City riding or Airport? book the best cars from us to get best experience."
            )}
          </Typography>

          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            sx={{
              width: "fit-content",
              alignSelf: { xs: "center", md: "flex-start" },
              mt: 3,
              fontSize: { xs: "0.85rem", sm: "1rem" },
              padding: { xs: "8px 16px", sm: "10px 25px" },
              borderRadius: "8px",
              backgroundColor: "#1A914B",
              "&:hover": {
               backgroundColor: "#117a3d",
              },
            }}
            onClick={() => {
              if (categories.length > 0) {
                router.push({
                  pathname: "/rental/vehicle-search",
                  query: { categoryId: categories[0].id }, // ⭐ first category by default
                });
              }
            }}
          >
            {t("Browse all Categories")}
          </Button>

        </Stack>

        {/* Right Side: Image (Hidden on Mobile) */}
        <Box
          sx={{
            width: { md: "50%" },
            display: { xs: "none", md: "flex" },
            justifyContent: "center",
            alignItems: "center",
            minHeight: "500px",
          }}
        >
          <img
            src="/rentalBanner.png"
            alt="Car Rental"
            title="Car Rental"
            style={{
              width: "100%",
              height: "auto",
              objectFit: "contain",
              maxWidth: "100%",
            }}
          />
        </Box>
      </Stack>
    </Box>
  );
};

export default RentalBanner;
