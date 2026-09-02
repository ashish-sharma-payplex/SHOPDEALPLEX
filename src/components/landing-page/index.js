import { NoSsr, useMediaQuery, useTheme, Box, Grid } from "@mui/material";
import AvailableZoneSection from "components/landing-page/AvailableZoneSection";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useGeolocated } from "react-geolocated";
import CookiesConsent from "../CookiesConsent";
import PushNotificationLayout from "../PushNotificationLayout";
import AppDownloadSection from "./app-download-section/index";
import Banners from "./Banners";
import Caro from "./Cara";
import ComponentOne from "./ComponentOne";
import ComponentTwo from "./ComponentTwo";
import DiscountBanner from "./DiscountBanner";
import HeroSection from "./hero-section/HeroSection";
import Registration from "./Registration";
import QualityContainer from "./QualityContainer";
import AdvertSection from "./AdvertSection";
import Brands from "./brands.js";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import Blogsession from "./Blogsession";
import HeroSection1 from "./herosession";
import GrocerySession from "./grocerysession";
import PharmacySession from "./pharmacysession";
import CuisineCategories from "./foodsession";
import BookingUI from "./travelsession";
import CourierService from "./courier";
import WhyChooseUs from "./whychosemesession";
import HomeServiceSection from "./HandimanSession";
import CarRentalSection from "./Rentalsession";
import BusinessOwnerSection from "./BecomeSeller";
import DeliveryPartnerSection from "./Deliman";
import CarRental from "./CarRental";
import BannerSection from "./BannerSection";
import GroceryCategories from "./GroceryCategories";
import LocationScreen from "./LocationScreen";
import { Leaderboard } from "@mui/icons-material";
import Leader from "../../../pages/leader";
import Valuepage from "../../../pages/val-page";
import FAQSection from "components/home/module-wise-components/utility/Help_Support/FAQSection";
import Faq from "../../../pages/faqs";
import GoogleAdSlot from "./GoogleAdSlot";

const MapModal = dynamic(() => import("../Map/MapModal"));

const LandingPage = ({ configData, landingPageData }) => {
  const Testimonials = dynamic(() => import("./Testimonials"), {
    ssr: false,
  });
  const [location, setLocation] = useState(undefined);
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const [zoneId, setZoneId] = useState(null);
  const [zoneLoading, setZoneLoading] = useState(true);

  // ✅ CHANGED — pehle [0] ko invalid maan ke null return karta tha,
  // jisse LocationScreen dikhta tha. Ab [0] ko bhi VALID maanta hai
  // aur "0" string return karta hai (LocationScreen kabhi nahi dikhega
  // is case mein — content hamesha load hoga, zone "0" ke sath).
  const getValidZoneId = () => {
    try {
      const raw = localStorage.getItem("zoneid");
      if (!raw) return null; // zoneid key hi missing hai — sirf yahi case LocationScreen dikhayega

      const parsed = JSON.parse(raw);

      // Agar already "0" string ya number 0 save hai (non-array), usko bhi valid maano
      if (!Array.isArray(parsed)) {
        if (parsed === "0" || parsed === 0) return "0";
        return null;
      }

      const flat = parsed.flat();

      if (flat.length === 0) return null; // genuinely empty — LocationScreen dikhega

      // ✅ [0] wala case ab "0" treat hoga, null nahi — LocationScreen skip
      if (flat.length === 1 && flat[0] === 0) return "0";

      return flat; // normal valid zone array
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const checkZone = () => {
      const zone = getValidZoneId();
      setZoneId(zone);
      setZoneLoading(false);
    };

    checkZone();

    // 🔥 Important: reactively update when localStorage changes
    window.addEventListener("storage", checkZone);

    return () => {
      window.removeEventListener("storage", checkZone);
    };
  }, []);

  const { coords } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: false,
    },
    userDecisionTimeout: 5000,
    isGeolocationEnabled: true,
  });
  useEffect(() => {
    // Set default module to a minimal module object with id 4 if not already set
    if (!localStorage.getItem("module")) {
      const defaultModule = {
        id: 5,
        module_type: "default",
      };
      localStorage.setItem("module", JSON.stringify(defaultModule));
    }
    setLocation(JSON.stringify(localStorage.getItem("location")));
  }, []);
  const handleClose = () => {
    const location = localStorage.getItem("location");
    const isModuleExist = localStorage.getItem("module");
    if (location) {
      isModuleExist && setOpen(false);
    } else {
    }
  };
  const router = useRouter();
  const handleOrderNow = () => {
    if (location) {
      if (location === "null") {
        setOpen(true);
      } else {
        router.push("/home", undefined, { shallow: true });
      }
    } else {
      setOpen(true);
    }
  };

  return (
    <>
      <PushNotificationLayout
        sx={{
          alignItems: "center",
          alignContent: "ceter",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            marginRight: 0,
            paddingRight: 0,
            width: "100%",
            alignItems: "center",
            alignContent: "ceter",
            justifyContent: "center",
            maxWidth: "1280px !important",
          }}
        >
          <Grid container spacing={0}>
            <Grid
              item
              xs={12}
              sx={{
                mt: { xs: "0px", sm: 5 },
                px: { xs: "12px", sm: 0 },
              }}
            >
              <BannerSection />
            </Grid>

            {/* ⏳ Optional: loading state (agar chaho) */}
            {zoneLoading ? null : !zoneId ? (
              // ❌ NO ZONE → show LocationScreen
              <Grid item xs={12}>
                <LocationScreen
                  title="Choose your location to get started"
                  subtext="Explore groceries, food, services, and more available around you."
                />
              </Grid>
            ) : (
              <>
                <Grid
                  item
                  xs={12}
                  sx={{
                    display: { xs: "none", sm: "block" }, // xs = mobile, sm+ = show
                  }}
                >
                  <GroceryCategories />
                </Grid>

                <Grid item xs={12}>
                  {/* <ComponentOne
                landingPageData={landingPageData}
                configData={configData}
                handleOrderNow={handleOrderNow}
              /> */}

                  <GrocerySession />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sx={{
                    pt: { xs: 2.5, md: 4 }, // mobile = 1, laptop/desktop = 2
                  }}
                >
                  <PharmacySession />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sx={{
                    pt: { xs: 2.5, md: 4 }, // mobile = 1, laptop/desktop = 2
                  }}
                >
                  <CuisineCategories />
                </Grid>

                {/* <Grid item xs={12}>

              <CourierService />
            </Grid> */}

                {/* <Grid item xs={12}>

              <HomeServiceSection />
            </Grid> */}

                {/* <Grid item xs={12}>

              <CarRentalSection />
            </Grid> */}

                <Grid
                  item
                  xs={12}
                  sx={{
                    pt: { xs: 2.5, md: 4 }, // mobile = 1, laptop/desktop = 2
                  }}
                >
                  <CarRental />
                </Grid>

                <Grid item xs={12}>
                  <BookingUI />
                </Grid>

                <Grid item xs={12}>
                  <BusinessOwnerSection />
                </Grid>

                <Grid item xs={12}>
                  <DeliveryPartnerSection />
                </Grid>

                <Grid item xs={12}>
                  <WhyChooseUs />
                </Grid>

                <Grid item xs={12} sx={{ my: { xs: 2, md: 3 } }}>
                  <GoogleAdSlot slot="9266006103" />
                </Grid>
                {/* <Grid item xs={12}>

                  <Leader />
                </Grid> */}

                {/* <Grid item xs={12}>

                  <Valuepage />
                </Grid> */}
                {/* <Grid item xs={12}>

                  <FAQSection />
                </Grid> */}

                {/* <Faq/> */}

                {/* 
            {landingPageData?.promotion_banners?.length > 0 && (
              <Grid item xs={12}>
                <Banners landingPageData={landingPageData} isSmall={isSmall} />
              </Grid>
            )} */}

                {/* {landingPageData?.fixed_promotional_banner_full_url && (
              <Grid item xs={12}>
                <DiscountBanner
                  bannerImage={landingPageData?.fixed_promotional_banner_full_url}
                  isSmall={isSmall}
                />
              </Grid>
            )} */}
                {/* <Blogsession/> */}
                {/* {landingPageData?.available_zone_status === 1 &&
              landingPageData?.available_zone_list?.length > 0 && (
                <Grid item xs={12}>
                  <AvailableZoneSection landingPageData={landingPageData} />
                </Grid>
              )} */}
                {/* {(landingPageData?.business_title ||
              landingPageData?.business_sub_title ||
              landingPageData?.business_image) && (
                <Grid item xs={12}>
                  <AppDownloadSection
                    configData={configData}
                    landingPageData={landingPageData}
                  />
                </Grid>
              )} */}

                {/* {(landingPageData?.earning_seller_status ||
              landingPageData?.earning_dm_status) && (
                <Grid item xs={12}>
                  <Registration
                    configData={configData}
                    data={landingPageData}
                    isSmall={isSmall}
                  />
                </Grid>
              )} */}
                {/* {landingPageData?.testimonial_list?.length > 0 && (
              <Grid item xs={12}>
                <Testimonials landingPageData={landingPageData} isSmall={isSmall} />
              </Grid>
            )} */}
                {/* <Grid item xs={12}>
              <Caro />
            </Grid> */}
                {/* <Grid item xs={12}>
              <QualityContainer />
            </Grid> */}
                {/* <Grid item xs={12}>
              <AdvertSection configData={configData} />
            </Grid> */}
                {/* {open && (
              <MapModal
                open={open}
                handleClose={handleClose}
                coords={coords}
                disableAutoFocus
              />
            )} */}
                {/* <NoSsr>
              <CookiesConsent text={configData?.cookies_text} />
            </NoSsr> */}
              </>
            )}
          </Grid>
        </Box>
      </PushNotificationLayout>
    </>
  );
};

export default LandingPage;
