import React, { useEffect, useState } from "react";
import { CustomStackFullWidth } from "../../../styled-components/CustomStyles.style";
import { Stack, styled } from "@mui/system";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { IconButton, Tooltip, Typography, Zoom } from "@mui/material";
import { t } from "i18next";
import InfoIcon from "@mui/icons-material/Info";
import { DeliveryCaption } from "../CheckOut.style";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import { useTheme } from "@emotion/react";
import CustomModal from "../../modal";
import PaymentMethod from "../PaymentMethod";  // Importing PaymentMethod component
import { useDispatch, useSelector } from "react-redux";
import { setOfflineInfoStep } from "../../../redux/slices/offlinePaymentData";
import CloseIcon from "@mui/icons-material/Close";
import CustomImageContainer from "../../CustomImageContainer";
import wallet from "../assets/wallet.png";
import money from "../assets/money.png";
import OfflinePaymentIcon from "../assets/OfflinePaymentIcon";

const PaymentMethodBox = styled(CustomStackFullWidth)(({ theme }) => ({
  borderRadius: "5px",
  border: "1px solid",
  borderColor: theme.palette.warning.light,
  boxShadow: "px 3px 20px -5px rgba(3, 157, 85, 0.10)",
  padding: "15px",
  alignItems: "center",
  background: theme.palette.neutral[100],
  cursor: "pointer",
}));

const AddPaymentMethod = (props) => {
  const {
    setPaymentMethod,
    paymentMethod,
    zoneData,
    configData,
    orderType,
    usePartialPayment,
    forprescription,
    offlinePaymentOptions,
    setSwitchToWallet,
    isZoneDigital,
    setPaymentMethodImage,
    paymentMethodImage,
    parcel, // Added parcel prop
  } = props;
  const [openModal, setOpenModel] = useState(false);
  const { offlineMethod } = useSelector((state) => state.offlinePayment);

  const theme = useTheme();
  const dispatch = useDispatch();

  const handleClick = () => {
    setOpenModel(true);
  };

  useEffect(() => {
    if (paymentMethod?.match("offline_payment")) {
      dispatch(setOfflineInfoStep(1));
      setPaymentMethodImage(OfflinePaymentIcon);
    } else {
      dispatch(setOfflineInfoStep(0));
    }
    if (paymentMethod === "cash_on_delivery") {
      setPaymentMethodImage(money.src);
    } else if (paymentMethod === "wallet") {
      setPaymentMethodImage(wallet.src);
    }
  }, [paymentMethod]);

  return (
    <CustomStackFullWidth spacing={0}>
      <DeliveryCaption const id="demo-row-radio-buttons-group-label">
        <Stack
          direction="row"
          alignItems="center"
          width="100%"
          spacing={2}
          mb={3}
        >
          <Typography
            fontSize="18px"
            fontWeight={600}
            color="#000"
            whiteSpace="nowrap"
          >
            {t("Payment Methods")}
          </Typography>

          <Stack
            flex={1}
            height="2px"
            sx={{
              background:
                "linear-gradient(to right, #e0e0e0 0%, #e0e0e0 60%, rgba(224,224,224,0) 100%)",
            }}
          />
        </Stack>
      </DeliveryCaption>

      {/* If parcel is not available, show OtherModulePayment directly */}
      {parcel !== "true" ? (
        <PaymentMethod
          setPaymentMethod={setPaymentMethod}
          paymentMethod={paymentMethod}
          zoneData={zoneData}
          configData={configData}
          orderType={orderType}
          usePartialPayment={usePartialPayment}
          setOpenModel={setOpenModel}
          forprescription={forprescription}
          offlinePaymentOptions={offlinePaymentOptions}
          paymentMethodImage={paymentMethodImage}
          setPaymentMethodImage={setPaymentMethodImage}
          setSwitchToWallet={setSwitchToWallet}
          isZoneDigital={isZoneDigital}
          parcel={parcel}  // Passing the parcel value to PaymentMethod
        />
      ) : (
        // ParcelPaymentMethod will be shown here if parcel is "true"
        <PaymentMethod
        
          setPaymentMethod={setPaymentMethod}
          paymentMethod={paymentMethod}
          zoneData={zoneData}
          configData={configData}
          orderType={orderType}
          usePartialPayment={usePartialPayment}
          setOpenModel={setOpenModel}
          forprescription={forprescription}
          offlinePaymentOptions={offlinePaymentOptions}
          paymentMethodImage={paymentMethodImage}
          setPaymentMethodImage={setPaymentMethodImage}
          setSwitchToWallet={setSwitchToWallet}
          isZoneDigital={isZoneDigital}
          parcel={parcel}  // Passing the parcel value to PaymentMethod
        />
      )}
    </CustomStackFullWidth>
  );
};

export default AddPaymentMethod;
