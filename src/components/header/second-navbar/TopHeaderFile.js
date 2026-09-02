// src\components\header\second-navbar\TopHeaderFile.js
import React, { useEffect, useState } from "react";
import {
  Grid,
  IconButton,
  Typography,
  Tooltip,
  Avatar,
  alpha,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import GlobalSearchBox from "../../../components/home/module-wise-components/food/foodUpdateComp/globsearch";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";

import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import { SignInButton } from "components/header/NavBar.style";
import LogoSide from "../../logo/LogoSide";
import LocationSelector from "components/header/second-navbar/locationselector";

import NavBarIcon from "./NavBarIcon";
import CardView from "../../added-cart-view";
import TaxiView from "components/home/module-wise-components/rental/components/home/TaxiView";
import Track from "./assets/track-order.png";
import { getCartListModuleWise } from "helper-functions/getCartListModuleWise";

import Popover from "@mui/material/Popover";
import MenuIcon from "@mui/icons-material/Menu";
import { setModalFor } from "redux/slices/utils";
import { fetchCartFromApi } from "redux/slices/cart";

const TopHeaderBar = ({
  configData,
  isBlog,
  t,
  router,
  moduleType,
  token,
  profileInfo,
  anchorRef,
  handleOpenPopover,
  dispatch,
  setSignInModalOpen,
  cartList,
  /* ✅ RENTAL DATA */
  bookingLists,
  bookingListsIsLoading,
  handleTrackOrder,
  sideDrawerOpen,
  handleCartOpen,
  handleCartClose,
  openCategoryMenu,
  setOpenCategoryMenu,
  currentModule,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:768px)", { noSsr: true });

  const mobileMenuRef = React.useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // const [badgeCount, setBadgeCount] = useState(0);

  // useEffect(() => {
  //   console.group("🔍 TopHeaderBar Debug");

  //   console.log("📦 Full configData:", configData);

  //   console.log("🖼 Logo from configData:", {
  //     logo: configData?.logo,
  //     logo_full_url: configData?.logo_full_url,
  //     favicon: configData?.favicon,
  //   });

  //   console.log("🧾 Module Type:", moduleType);
  //   console.log("🛒 Cart List:", cartList);
  //   console.log(
  //     "🛍 Cart Count:",
  //     getCartListModuleWise(cartList)?.length ?? 0
  //   );

  //   console.log("🚕 Rental Booking Lists:", bookingLists);
  //   console.log("🚕 Rental Loading:", bookingListsIsLoading);

  //   console.log("👤 Profile Info:", profileInfo);
  //   console.log("🔐 Token Available:", !!token);

  //   console.groupEnd();
  // }, [configData, cartList, bookingLists, profileInfo, token]);

  useEffect(() => {
    // console.log("🔄 Module changed → Fetching cart");
    dispatch(fetchCartFromApi());
  }, [moduleType]); // ✅ yaha change

  // ---------------- RENTAL CART COUNT ----------------
  const rentalCartCount = React.useMemo(() => {
    if (bookingListsIsLoading) return null;

    const bookingData = Array.isArray(bookingLists)
      ? bookingLists[0]
      : bookingLists;

    return bookingData?.carts?.length ?? null;
  }, [bookingLists, bookingListsIsLoading]);

  // Badge ke liye
  //  useEffect(() => {
  //     setBadgeCount(cartList?.carts?.length || 0);
  //   }, [cartList]);

  // const MemoizedTaxiIcon = React.useMemo(() => (
  //   <DirectionsCarOutlinedIcon sx={{ fontSize: "30px" }} />
  // ), []);

  useEffect(() => {
    const handleRefresh = () => {
      bookingListsRefetch(); // 🔥 ye line add karo
    };

    window.addEventListener("REFRESH_RENTAL_CART_API", handleRefresh);
    return () =>
      window.removeEventListener("REFRESH_RENTAL_CART_API", handleRefresh);
  }, []);

  /* -----------------------------------------------------
     MOBILE HEADER
  ------------------------------------------------------ */
  if (isMobile) {
    return (
      <>
        <Grid
          container
          alignItems="center"
          wrap="nowrap"
          sx={{
            width: "100%",
            padding: "8px 8px",
            backgroundColor: "#fff",
            borderBottom: "1px solid #ececec",
            height: "52px",
          }}
        >
          {/* LOGO */}
          <Grid item sx={{ width: "62px" }}>
            <LogoSide width="62px" height="26px" configData={configData} isBlog={isBlog} />
          </Grid>

          {/* LOCATION */}
          <Grid item sx={{ width: "26px", ml: 1 }}>
            <LocationSelector color="black" iconColor="#279d44" />
          </Grid>

          {/* SEARCH BOX */}
          <Grid item xs sx={{ ml: 1, mr: 1 }}>
            <GlobalSearchBox />
          </Grid>

          {/* CATEGORY TOGGLE ICON */}
          <Grid item sx={{ width: "28px", ml: 1 }}>
            <IconButton
              size="small"
              onClick={() => setOpenCategoryMenu((prev) => !prev)}
              sx={{ padding: "4px" }}
            >
              <img
                src="./icons/allcategory.svg"
                alt="categories"
                style={{ width: 15, height: 15 }}
              />
            </IconButton>
          </Grid>

          {/* HAMBURGER / PROFILE */}
          {!token ? (
            <Grid item sx={{ width: "28px", ml: 1 }}>
              <IconButton
                size="small"
                ref={mobileMenuRef}
                onClick={() => setMobileMenuOpen(true)}
              >
                <MenuIcon sx={{ fontSize: 24, color: "#279d44" }} />
              </IconButton>
            </Grid>
          ) : (
            <Grid item sx={{ width: "30px", ml: 1 }}>
              <IconButton
                size="small"
                ref={anchorRef}
                onClick={handleOpenPopover}
              >
                {profileInfo?.image ? (
                  <Avatar
                    sx={{ width: 30, height: 30 }}
                    src={profileInfo?.image_full_url}
                  />
                ) : (
                  <AccountCircleIcon sx={{ fontSize: 28, color: "#279d44" }} />
                )}
              </IconButton>
            </Grid>
          )}
        </Grid>

        {/* MOBILE MENU POPOVER */}
        {!token && (
          <Popover
            open={mobileMenuOpen}
            anchorEl={mobileMenuRef.current}
            onClose={() => setMobileMenuOpen(false)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{ sx: { width: 200, p: 1 } }}
          >
            <Box
              sx={{ display: "flex", alignItems: "center", p: 1, gap: 1 }}
              onClick={() => {
                handleTrackOrder();
                setMobileMenuOpen(false);
              }}
            >
              <DirectionsCarOutlinedIcon sx={{ fontSize: 22 }} />
              <span>Track Order</span>
            </Box>

            <Box
              sx={{ display: "flex", alignItems: "center", p: 1, gap: 1 }}
              onClick={() => {
                handleCartOpen();
                setMobileMenuOpen(false);
              }}
            >
              <ShoppingCartOutlinedIcon sx={{ fontSize: 22 }} />
              <span>Cart</span>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                p: 1,
                gap: 1,
                border: "1px solid #03963F",
                borderRadius: "6px",
              }}
              onClick={() => {
                dispatch(setModalFor("sign-in"));
                dispatch(setSignInModalOpen(true));
                setMobileMenuOpen(false);
              }}
            >
              <LockOutlinedIcon sx={{ fontSize: 22 }} />
              <span>Login / Signup</span>
            </Box>
          </Popover>
        )}

        {/* MOBILE CART DRAWER */}
        {sideDrawerOpen &&
          (moduleType === "rental" ? (
            <TaxiView
              isLoading={bookingListsIsLoading}
              bookingLists={bookingLists} // ✅ Rental ke liye
              sideDrawerOpen={sideDrawerOpen}
              setSideDrawerOpen={handleCartClose}
            />
          ) : (
            <CardView
              isLoading={false}
              sideDrawerOpen={sideDrawerOpen}
              setSideDrawerOpen={handleCartClose}
              cartList={cartList} // ✅ Food/Grocery ke liye
            />
          ))}
      </>
    );
  }

  /* -----------------------------------------------------
     DESKTOP HEADER
  ------------------------------------------------------ */
  return (
    <>
      <Grid
        container
        alignItems="center"
        spacing={2}
        sx={{
          width: "100%",
          padding: "12px 30px",
          backgroundColor: "#fff",
          borderBottom: "1px solid #ececec",
        }}
      >
        <Grid item xs="auto">
          <LogoSide width="220px" height="55px" configData={configData} isBlog={isBlog} />
        </Grid>

        <Grid item xs="auto">
          <Box sx={{ width: "230px" }}>
            <LocationSelector color="black" iconColor="#279d44" />
          </Box>
        </Grid>

        <Grid item xs sx={{ pl: 2, pr: 2 }}>
          <GlobalSearchBox />
        </Grid>

        <Grid item xs="auto">
          <IconButton onClick={handleTrackOrder}>
            <Tooltip title={t("Track order")} arrow>
              <img
                src="/trackorder.svg"
                alt="Track Order"
                style={{ width: "30px", height: "30px" }}
              />
            </Tooltip>
          </IconButton>
        </Grid>

        <Grid item xs="auto">
          {moduleType !== "parcel" && moduleType !== "rental" && (
            <NavBarIcon
              icon={
                <img
                  src="/cart.svg"
                  alt="Cart"
                  style={{ width: "26px", height: "26px" }}
                />
              }
              label="Cart"
              handleClick={handleCartOpen}
              // ✅ YEH CHANGE KARO - currentModule pass karo
              badgeCount={
                moduleType !== "rental"
                  ? getCartListModuleWise(cartList, currentModule)?.length ??
                  null
                  : null
              }
            />
          )}

          {moduleType === "rental" && (
            <NavBarIcon
              key="rental-taxi-icon"
              icon={<DirectionsCarOutlinedIcon sx={{ fontSize: 30 }} />}
              label="Trip Cart"
              handleClick={handleCartOpen}
              badgeCount={rentalCartCount}
            />
          )}
        </Grid>

        <Grid item xs="auto">
          {token ? (
            <IconButton ref={anchorRef} onClick={handleOpenPopover}>
              {profileInfo?.image ? (
                <Avatar
                  src={profileInfo?.image_full_url}
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: "transparent",
                    "& img": {
                      objectFit: "contain"
                    }
                  }}
                />
              ) : (
                <AccountCircleIcon
                  color="primary"
                  sx={{
                    fontSize: "30px",
                    backgroundColor: (theme) =>
                      alpha(theme.palette.primary.main, 0.1),
                    borderRadius: "50%",
                  }}
                />
              )}
              <Typography sx={{ ml: 1 }} textTransform="capitalize">
                {profileInfo?.f_name}
              </Typography>
            </IconButton>
          ) : (
            <SignInButton
              onClick={() => {
                dispatch(setModalFor("sign-in"));
                dispatch(setSignInModalOpen(true));
                setMobileMenuOpen(false);
              }}
              variant="contained"
              sx={{
                backgroundColor: "#1A914B",
                borderRadius: "8px !important",
              }}
            >
              <CustomStackFullWidth direction="row" spacing={1}>
                <LockOutlinedIcon fontSize="small" style={{ color: "#fff" }} />
                <Typography color="#fff">{t("Sign In")}</Typography>
              </CustomStackFullWidth>
            </SignInButton>
          )}
        </Grid>
      </Grid>

      {sideDrawerOpen &&
        (moduleType === "rental" ? (
          <TaxiView
            isLoading={bookingListsIsLoading}
            bookingLists={bookingLists}
            sideDrawerOpen={sideDrawerOpen}
            setSideDrawerOpen={handleCartClose}
          />
        ) : (
          <CardView
            isLoading={false}
            sideDrawerOpen={sideDrawerOpen}
            setSideDrawerOpen={handleCartClose}
            cartList={cartList}
          />
        ))}
    </>
  );
};

export default TopHeaderBar;
