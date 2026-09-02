import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CustomStackFullWidth } from "../../../styled-components/CustomStyles.style";
import { useTheme } from "@emotion/react";
import LoadingButton from "@mui/lab/LoadingButton";
import Link from "next/link";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { setOfflineInfoStep } from "../../../redux/slices/offlinePaymentData";
import { CustomTypography } from "../../landing-page/hero-section/HeroSection.style";

const PlaceOrder = (props) => {
  const {
    placeOrder,
    orderLoading,
    zoneData,
    isStoreOpenOrNot,
    storeData,
    isSchedules,
    page,
    storeCloseToast,
    isLoading,
  } = props;

  const [disabled, setDisabled] = useState(true);

  const { offlineInfoStep } = useSelector((state) => state.offlinePayment);
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useDispatch();
  const [checked, setChecked] = useState(false);

  // ✅ NAYA: jab tak storeData API se load nahi hota, button ko disable
  // rakho aur ek chota "loading" indication do. Isse premature click se
  // galat "store closed" toast nahi aayega (race condition fix ka
  // frontend/UX hissa — index.js me bhi guard already laga hua hai).
  const isStoreDataLoading = !storeData;

  const handleChange = (e) => {
    setChecked(e.target.checked);
  };

  const handleOffline = (e) => {
    // Store data abhi load ho raha hai to kuch mat karo (button waise bhi disabled rahega)
    if (isStoreDataLoading) return;

    if (storeData?.active) {
      if (isSchedules()) {
        setChecked(e.target.checked);
        dispatch(setOfflineInfoStep(2)); // Debug action
        router.push(
          {
            pathname: "/checkout",
            query: { page: page, method: "offline" },
          },
          undefined,
          { shallow: true },
        );
      } else {
        storeCloseToast();
      }
    } else {
      storeCloseToast();
    }
  };

  const primaryColor = theme.palette.primary.main;

  // console.group("🧾 PlaceOrder Component Data");

  // console.groupEnd();

  return (
    <CustomStackFullWidth alignItems="center" spacing={2}>
      <FormGroup>
        {/* <FormControlLabel
          control={<Checkbox checked={checked} onChange={handleChange} />}
          label={
            <CustomTypography fontSize="12px">
              {t(`I agree that placing the order places me under`)}{" "}
              <Link href="/terms-and-conditions" style={{ color: primaryColor }}>
                {t("Terms and Conditions")}
              </Link>{" "}
              {t("&")}
              <Link href="/privacy-policy" style={{ color: primaryColor }}>
                {" "}
                {t("Privacy Policy")}
              </Link>
            </CustomTypography>
          }
        /> */}
      </FormGroup>

      {/* ✅ Chota loading hint jab tak store details nahi aaye */}
      {isStoreDataLoading && (
        <CustomTypography fontSize="12px" color="text.secondary">
          {t("Loading store details, please wait...")}
        </CustomTypography>
      )}

      {offlineInfoStep === 0 ? (
        <LoadingButton
          sx={{ background: "#1A914B" }}
          type="submit"
          fullWidth
          variant="contained"
          onClick={() => {
            placeOrder(); // Execute placeOrder function
          }}
          loading={orderLoading || isLoading}
          disabled={isStoreDataLoading}
        >
          {t("Place Order")}
        </LoadingButton>
      ) : (
        <LoadingButton
          fullWidth
          variant="contained"
          sx={{
            backgroundColor: "#1A914B",
            "&:hover": { backgroundColor: "#1A914B" },
          }}
          onClick={handleOffline}
          loading={orderLoading || isLoading}
          disabled={!checked || isStoreDataLoading}
        >
          {t("Confirm Order")}
        </LoadingButton>
      )}
    </CustomStackFullWidth>
  );
};

PlaceOrder.propTypes = {};

export default PlaceOrder;





