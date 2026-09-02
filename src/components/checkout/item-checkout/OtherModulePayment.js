// src\components\checkout\item-checkout\OtherModulePayment.js
import React, { useEffect, useState } from "react";
import {
  alpha,
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Stack,
  styled,
  Tooltip,
  Typography,
} from "@mui/material";
import { t } from "i18next";
import { CustomStackFullWidth } from "../../../styled-components/CustomStyles.style";
import CustomImageContainer from "../../CustomImageContainer";
import InfoIcon from "@mui/icons-material/Info";
import { useTheme } from "@emotion/react";
import { useDispatch, useSelector } from "react-redux";
import { setOfflineMethod } from "../../../redux/slices/offlinePaymentData";
import { getToken } from "../../../helper-functions/getToken";
import OfflinePaymentIcon from "../assets/OfflinePaymentIcon";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";

// ─── Shared row styles so every method row looks identical ──────────────────
const ROW_SX = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  px: 2, // consistent horizontal padding
  py: 1.5, // consistent vertical padding
  backgroundColor: "white",
  textTransform: "none",
  borderRadius: 0,
  "&:hover": { background: "rgba(0,0,0,0.03)" },
};

export const PayButton = styled(Button)(({ theme }) => ({
  padding: 0, // padding controlled via sx ROW_SX above
  gap: "5px",
  color: theme.palette.neutral[1000],
  background: "none",
  "&:hover": { background: "none" },
}));

const OfflineButton = styled(Button)(({ theme }) => ({
  padding: "10px 14px",
  gap: "5px",
  color: theme.palette.neutral[1000],
  background: "none",
  border: `1px solid ${alpha(theme.palette.info.light, 0.6)}`,
  borderRadius: "8px",
  "&:hover": { background: "rgba(0,0,0,0.04)" },
}));

// ─── Reusable left-side content for every row ───────────────────────────────
const RowLeft = ({
  iconSrc,
  iconWidth = "24px",
  iconHeight = "24px",
  iconAlt,
  title,
  subtitle,
}) => (
  <Stack direction="row" alignItems="center" spacing={2}>
    <CustomImageContainer
      src={iconSrc}
      width={iconWidth}
      height={iconHeight}
      alt={iconAlt}
    />
    <Stack spacing={0.3} sx={{ textAlign: "left" }}>
      <Typography fontSize="14px" fontWeight={500}>
        {title}
      </Typography>
      <Typography fontSize="12px" color="text.secondary">
        {subtitle}
      </Typography>
    </Stack>
  </Stack>
);

// ─── Radio indicator (right side) ───────────────────────────────────────────
const RadioIndicator = ({ selected }) =>
  selected ? (
    <RadioButtonCheckedIcon sx={{ color: "green", fontSize: "22px" }} />
  ) : (
    <RadioButtonUncheckedIcon sx={{ color: "#c7c7c7", fontSize: "22px" }} />
  );

// ─── Divider line between rows ───────────────────────────────────────────────
const RowDivider = () => (
  <Stack sx={{ borderTop: "1px solid #e0e0e0", mx: 0 }} />
);

// ✅ NAYA: default zone-permissions jab tak Google zone API se real
// isZoneDigital nahi aa jata. Sab methods ko "allowed" maan ke turant
// render karo — jaise hi real zoneData aayega, ye value replace ho
// jayegi aur agar zone me koi method disallowed hai to wo hide ho jayega.
const DEFAULT_ZONE_DIGITAL = {
  digital_payment: true,
  cash_on_delivery: true,
  offline_payment: true,
};

// ─── Main component ──────────────────────────────────────────────────────────
const OtherModulePayment = (props) => {
  const {
    paymentMethod,
    setPaymentMethod,
    paidBy,
    orderPlace,
    isLoading,
    zoneData,
    forprescription,
    configData,
    orderType,
    parcel,
    setOpenModel,
    usePartialPayment,
    offlinePaymentOptions,
    setPaymentMethodImage,
    isZoneDigital,
  } = props;

  const theme = useTheme();
  const dispatch = useDispatch();
  const token = getToken();
  const [openOfflineOptions, setOpenOfflineOptions] = useState(false);
  const { offlineMethod } = useSelector((state) => state.offlinePayment);
  const [isCheckedOffline, setIsCheckedOffline] = useState(
    offlineMethod !== "",
  );

  // ✅ isZoneDigital jab tak load nahi hota (async Google zone call),
  // tab tak optimistic default use karo taaki UI turant render ho.
  const zoneDigital = isZoneDigital ?? DEFAULT_ZONE_DIGITAL;

  // ─── Handlers (unchanged logic) ──────────────────────────────────────────
  const handleClickOffline = () => setOpenOfflineOptions((prev) => !prev);

  const handleClick = (item) => {
    setPaymentMethod(item);
    dispatch(setOfflineMethod(""));
    setIsCheckedOffline(false);
    setOpenModel(false);
  };

  const handleClickOfflineItem = (item) => {
    dispatch(setOfflineMethod(item));
    setIsCheckedOffline(true);
    setPaymentMethod("offline_payment");
    setOpenModel(false);
  };

  // ─── Visibility flags (same conditions as before, ab zoneDigital use ho raha hai) ──
  const showWallet =
    configData?.customer_wallet_status === 1 &&
    forprescription !== "true" &&
    token;

  useEffect(() => {
    if (showWallet) {
      // console.log("Wallet is visible.");
      // console.log("Customer Data: ", configData); // Log configData to inspect
      // console.log("Wallet Balance: ", configData?.customer_wallet_balance); // Assuming wallet balance is in configData
    }
  }, [showWallet, configData]);

  const showDigital =
    zoneDigital?.digital_payment &&
    paidBy !== "receiver" &&
    forprescription !== "true" &&
    configData?.digital_payment_info?.digital_payment &&
    (configData?.partial_payment_method === "digital_payment" ||
      configData?.partial_payment_method === "both" ||
      configData?.partial_payment_method === null);

  const showCOD = usePartialPayment
    ? (zoneDigital?.cash_on_delivery &&
        configData?.cash_on_delivery &&
        configData?.partial_payment_method === "both") ||
      configData?.partial_payment_method === "cod"
    : zoneDigital?.cash_on_delivery && configData?.cash_on_delivery;

  const showOffline =
    configData?.offline_payment_status === 1 &&
    zoneDigital?.offline_payment &&
    forprescription !== "true" &&
    typeof offlinePaymentOptions !== "undefined" &&
    Object.keys(offlinePaymentOptions).length !== 0;

  // Build the visible rows so we can insert dividers only between them
  const rows = [];

  if (showWallet) rows.push("wallet");
  if (showDigital) rows.push("digital");
  if (showCOD) rows.push("cod");
  if (showOffline) rows.push("offline");

  return (
    <CustomStackFullWidth spacing={1.5}>
      <CustomStackFullWidth
        sx={{
          border: "1px solid #e0e0e0",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        {/* ── WALLET ───────────────────────────────────────────────────────── */}
        {showWallet && (
          <>
            <PayButton
              onClick={() => handleClick("wallet")}
              disabled={usePartialPayment}
              sx={ROW_SX}
            >
              <RowLeft
                iconSrc="/paywallet.svg"
                iconAlt="wallet"
                title={t("Pay via wallet")}
                subtitle={t("Use your wallet balance to pay.")}
              />
              <RadioIndicator selected={paymentMethod === "wallet"} />
            </PayButton>
            {(showDigital || showCOD || showOffline) && <RowDivider />}
          </>
        )}

        {/* ── DIGITAL PAYMENTS ─────────────────────────────────────────────── */}
        {showDigital && (
          <>
            <Grid container sx={{ width: "100%" }}>
              {configData?.active_payment_method_list?.map((item, index) => (
                <Grid item xs={12} key={index}>
                  {/* divider between multiple digital options */}
                  {index > 0 && <RowDivider />}
                  <PayButton
                    onClick={() => handleClick(item?.gateway)}
                    sx={ROW_SX}
                  >
                    <RowLeft
                      iconSrc={item?.gateway_image_full_url || "/paywallet.svg"}
                      iconAlt={item?.gateway_title}
                      title={item?.gateway_title}
                      subtitle={
                        item?.gateway_description || t("Pay using this method")
                      }
                    />
                    <RadioIndicator
                      selected={paymentMethod === item?.gateway}
                    />
                  </PayButton>
                </Grid>
              ))}
            </Grid>
            {(showCOD || showOffline) && <RowDivider />}
          </>
        )}

        {/* ── CASH ON DELIVERY ─────────────────────────────────────────────── */}
        {showCOD && (
          <>
            <PayButton
              onClick={() => handleClick("cash_on_delivery")}
              sx={ROW_SX}
            >
              <RowLeft
                iconSrc="/cod.svg"
                iconWidth="26px"
                iconHeight="26px"
                iconAlt="cod"
                title={t("Cash on delivery")}
                subtitle={t("Pay cash at the time of delivery.")}
              />
              <RadioIndicator selected={paymentMethod === "cash_on_delivery"} />
            </PayButton>
            {showOffline && <RowDivider />}
          </>
        )}

        {/* ── OFFLINE PAYMENT ──────────────────────────────────────────────── */}
        {showOffline && (
          <Stack onClick={handleClickOffline} sx={{ cursor: "pointer" }}>
            <Stack
              sx={{
                px: 2,
                py: 1.5,
                backgroundColor: alpha(theme.palette.primary.main, 0.07),
              }}
            >
              <CustomStackFullWidth gap="12px">
                <CustomStackFullWidth
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <FormControl>
                    <RadioGroup name="radio-buttons-group">
                      <FormControlLabel
                        value={t("Pay offline")}
                        control={
                          <Radio
                            sx={{ padding: { xs: "2px", md: "8px" } }}
                            checked={isCheckedOffline}
                            onClick={handleClickOffline}
                          />
                        }
                        label={
                          <Stack
                            flexDirection="row"
                            gap="12px"
                            alignItems="center"
                            pl={1}
                          >
                            <OfflinePaymentIcon />
                            <Typography fontSize="13px" fontWeight={500}>
                              {t("Pay Offline")}
                              <Typography
                                component="span"
                                fontSize="11px"
                                ml="5px"
                                color="text.secondary"
                              >
                                ({t("Select option from below")})
                              </Typography>
                            </Typography>
                          </Stack>
                        }
                      />
                    </RadioGroup>
                  </FormControl>
                  <Tooltip
                    placement="left"
                    title={t(
                      "Offline Payment! Now, with just a click of a button, you can make secure transactions. It's simple, convenient, and reliable.",
                    )}
                  >
                    <InfoIcon
                      fontSize="small"
                      sx={{ color: theme.palette.primary.main }}
                    />
                  </Tooltip>
                </CustomStackFullWidth>

                {openOfflineOptions && (
                  <CustomStackFullWidth>
                    <Stack direction="row" flexWrap="wrap" gap="10px">
                      {offlinePaymentOptions?.map((item, index) => (
                        <OfflineButton
                          key={index}
                          onClick={() => handleClickOfflineItem(item)}
                        >
                          <Typography fontSize="12px">
                            {item.method_name}
                          </Typography>
                        </OfflineButton>
                      ))}
                    </Stack>
                  </CustomStackFullWidth>
                )}
              </CustomStackFullWidth>
            </Stack>
          </Stack>
        )}
      </CustomStackFullWidth>
    </CustomStackFullWidth>
  );
};

export default OtherModulePayment;