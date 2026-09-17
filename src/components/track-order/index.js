// src\components\track-order\index.js
import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { useRouter } from "next/router";
import useGetTrackOrderData from "../../api-manage/hooks/react-query/order/useGetTrackOrderData";
import { useSelector } from "react-redux";
import { subscribeToOrderStatus } from "../../services/socketService";
import { ORDER_FINAL_STATUSES, isOrderStatusFinal } from "../../services/orderStatusConstants";
import { getGuestId } from "helper-functions/getToken";
import {
  CustomPaperBigCard,
  CustomStackFullWidth,
} from "../../styled-components/CustomStyles.style";
import {
  alpha,
  Divider,
  Grid,
  IconButton,
  Skeleton,
  Step,
  StepConnector,
  stepConnectorClasses,
  StepContent,
  StepLabel,
  Stepper,
  styled,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { HeadingBox } from "../my-orders/myorders.style";
import CustomFormatedDateTime from "../date/CustomFormatedDateTime";
import CustomFormatedTime from "../date/CustomFormatedTime";
import { useTranslation } from "react-i18next";
import DeliverymanInfo from "./DeliverymanInfo";
import DeliverymanShimmer from "./DeliverymanShimmer";
import MapComponent from "../Map/location-view/MapComponent";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { CustomStepperStyled, StepBox } from "./trackOrder.style";
import { useTheme } from "@emotion/react";
import { t } from "i18next";
import orderConfirmImage from "../my-orders/assets/order-confirmed.png";
import shippedImage from "../my-orders/assets/shhiped.png";
import outForDelivery from "../my-orders/assets/out-for-delivery.png";
import delivered from "../my-orders/assets/delivery.png";
import { StepperCustomBorder } from "../checkout/CheckOut.style";
import { Check } from "@mui/icons-material";
import CustomImageContainer from "../CustomImageContainer";
import { Stack } from "@mui/system";
import moment from "moment";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import PhoneIcon from "@mui/icons-material/Phone";
import { useGeolocated } from "react-geolocated";
import TrackOrderMap from "components/track-order/TrackOrderMap";

const CustomStepperLabels = styled(Stepper)(({ theme }) => ({
  "& .MuiStepLabel-label.MuiStepLabel-alternativeLabel": {
    marginTop: "-90px",
  },
  "& .MuiStepLabel-label.Mui-completed": {
    color: theme.palette.primary.main,
  },
}));

const QontoConnector = styled(StepConnector)(({ theme, isMobile }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: "calc(-50% + 16px)",
    right: "calc(50% + 16px)",
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#FF6600",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#FF6600",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: "#FF6600",
    borderTopWidth: 2,
    borderRadius: 1,
    borderLeftWidth: isMobile === "true" && 3,
    marginTop: isMobile === "true" && "-41px",
    marginBottom: isMobile === "true" && "-41px",
    minHeight: isMobile === "true" && "100px",
  },
}));

const QontoStepIconRoot = styled("div")(({ theme, ownerState }) => ({
  color: theme.palette.primary.main,
  display: "flex",
  height: 22,
  alignItems: "center",
  ...(ownerState.active && {
    color: theme.palette.primary.main,
  }),
  "& .QontoStepIcon-completedIcon": {
    color: "#FF6600",
    zIndex: 1,
    fontSize: 0,
    padding: "7px",
  },
}));

function QontoStepIcon(props) {
  const { active, completed, className } = props;
  const theme = useTheme();
  return (
    <QontoStepIconRoot ownerState={{ active }} className={className}>
      {completed ? (
        <StepperCustomBorder
          background="#FF6600"
          padding="5px"
          border={`3px solid ${theme.palette.neutral[100]}`}
          boxshadow={`0px 4px 10px ${alpha(theme.palette.neutral[400], 0.3)}`}
        >
          <Check className="QontoStepIcon-completedIcon" />
        </StepperCustomBorder>
      ) : (
        <StepperCustomBorder
          background={theme.palette.neutral[400]}
          padding="10px"
          border={`3px solid ${theme.palette.neutral[100]}`}
          boxshadow={`0px 4px 10px ${alpha(theme.palette.neutral[400], 0.3)}`}
        >
          <div className="QontoStepIcon-circle" />
        </StepperCustomBorder>
      )}
    </QontoStepIconRoot>
  );
}

// FIX: ab yeh local array nahi, shared ORDER_FINAL_STATUSES hai
// (services/orderStatusConstants.js) — pehle yahan alag spelling wala
// array tha jo doosri files ke array se match nahi karta tha.
const TERMINAL_STATUSES = ORDER_FINAL_STATUSES;

const getStatusColor = (theme, order_status) => {
  if (order_status === "pending") return theme.palette.info.main;
  if (order_status === "confirmed") return theme.palette.footer.inputButtonHover;
  if (
    [
      "processing",
      "handover",
      "picked_up",
      "accepted",
      "arrived_at_pickup",
      "drop_arrived",
      "drop_verified",
    ].includes(order_status)
  ) {
    return theme.palette.warning.dark;
  }
  if (["delivered", "completed"].includes(order_status)) return theme.palette.primary.main;
  if (order_status === "canceled" || order_status === "cancelled") return theme.palette.error.main;
  if (["refund_requested", "refund_request_canceled"].includes(order_status))
    return theme.palette.error.main;
  if (order_status === "refunded") return theme.palette.primary.main;
  if (order_status === "failed") return theme.palette.error.main;
  return theme.palette.neutral[400];
};

const capitalizeText = (text) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const TrackOrder = ({ configData, trackOrderData }) => {
  const [userLocation, setUserLocation] = useState({});
  const { t } = useTranslation();
  const [actStep, setActStep] = useState(1);
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));

  const guestId = getGuestId();
  const { guestUserInfo } = useSelector((state) => state.guestUserInfo);
  const phone = guestUserInfo?.contact_person_number;
  const router = useRouter();
  const orderId = router.query.id || trackOrderData?.id;

  const { refetch: refetchTrackOrder } = useGetTrackOrderData(
    orderId,
    phone,
    guestId
  );

  // is ref me current order-status subscription ka unsubscribe function
  // store hota hai taaki final status milte hi turant clean-up kar sakein
  const unsubscribeStatusRef = useRef(null);

  let currentLatLng = undefined;
  if (typeof window !== "undefined") {
    currentLatLng = JSON.parse(window.localStorage.getItem("currentLatLng"));
  }

  useEffect(() => {
    setUserLocation({
      lat: trackOrderData?.delivery_address?.latitude,
      lng: trackOrderData?.delivery_address?.longitude,
    });
  }, [trackOrderData?.delivery_address?.latitude, trackOrderData?.delivery_address?.longitude]);

  const steps = [
    {
      key: "confirmed",
      label: "Order Confirmed",
      time: trackOrderData?.confirmed,
      img: orderConfirmImage.src,
    },
    {
      key: "accepted",
      label: "Delivery Man Accepted",
      time: trackOrderData?.accepted,
      img: shippedImage.src,
    },
    {
      key: "arrived_at_pickup",
      label: "Arrived at Pickup",
      time: trackOrderData?.arrived_at_pickup,
      img: outForDelivery.src,
    },
    {
      key: "picked_up",
      label: `${
        trackOrderData?.module?.module_type === "food" ? "Foods" : "Items"
      } Picked Up`,
      time: trackOrderData?.picked_up,
      img: outForDelivery.src,
    },
    {
      key: "drop_arrived",
      label: "Arrived at Drop Location",
      time: trackOrderData?.drop_arrived,
      img: outForDelivery.src,
    },
    {
      key: "drop_verified",
      label: "Drop Verified",
      time: trackOrderData?.drop_verified,
      img: outForDelivery.src,
    },
    {
      key: "delivered",
      label: "Delivered",
      time: trackOrderData?.delivered,
      img: delivered.src,
    },
  ];

  const handleStepper = () => {
    const status = trackOrderData?.order_status;

    switch (status) {
      case "pending":
        setActStep(1);
        break;
      case "confirmed":
        setActStep(2);
        break;
      case "processing":
        setActStep(3);
        break;
      case "accepted":
        setActStep(4);
        break;
      case "arrived_at_pickup":
        setActStep(5);
        break;
      case "picked_up":
      case "handover":
        setActStep(6);
        break;
      case "drop_arrived":
        setActStep(7);
        break;
      case "drop_verified":
        setActStep(8);
        break;
      case "delivered":
      case "completed":
        setActStep(steps.length + 1);
        break;
      default:
        // canceled/failed/refunded waghera — stepper progress freeze
        // rehta hai jaha tak pahuncha tha, banner alag se dikhega neeche
        break;
    }
  };

  useEffect(() => {
    handleStepper();
  }, [trackOrderData?.order_status]);

  // ---- SINGLE order-status subscription point ----
  // FIX: pehle yahan manual socket.on/off tha, aur kahi
  // "socket.off('order_status_update')" bina handler ke call hota tha —
  // jo is event ke SAARE listeners hata deta tha (OrderDetails page ka
  // listener bhi). Ab hum sirf socketService.subscribeToOrderStatus()
  // use karte hain jo apna khud ka specific handler register/cleanup
  // karta hai, aur join/leave dono consistent payload bhejte hain.
  useEffect(() => {
    if (!orderId) return;

    const handleOrderUpdate = (payload) => {
      refetchTrackOrder();

      if (isOrderStatusFinal(payload?.status)) {
        if (unsubscribeStatusRef.current) {
          unsubscribeStatusRef.current();
          unsubscribeStatusRef.current = null;
        }
      }
    };

    unsubscribeStatusRef.current = subscribeToOrderStatus(orderId, handleOrderUpdate);

    return () => {
      if (unsubscribeStatusRef.current) {
        unsubscribeStatusRef.current();
        unsubscribeStatusRef.current = null;
      }
    };
  }, [orderId, refetchTrackOrder]);

  // Safety-net: agar fetched data khud hi final status dikhaye (page load
  // pe hi order already terminal nikla), turant subscription band karo
  useEffect(() => {
    if (!trackOrderData) return;

    if (isOrderStatusFinal(trackOrderData?.order_status)) {
      if (unsubscribeStatusRef.current) {
        unsubscribeStatusRef.current();
        unsubscribeStatusRef.current = null;
      }
    }
  }, [trackOrderData?.order_status]);

  const { coords, isGeolocationAvailable, isGeolocationEnabled, getPosition } =
    useGeolocated({
      positionOptions: {
        enableHighAccuracy: false,
      },
      userDecisionTimeout: 5000,
      isGeolocationEnabled: true,
    });

  const getCurrentLocation = () => {
    setUserLocation({ lat: coords.latitude, lng: coords.longitude });
  };

  const currentStatus = trackOrderData?.order_status;
  const isTerminalStatus = TERMINAL_STATUSES.includes(currentStatus);

  return (
    <CustomStackFullWidth
      mt={{ xs: "20px", md: "70px" }}
      minHeight="30vh"
      alignItems={isSmall ? "center" : "initial"}
      spacing={4}
    >
      {isTerminalStatus ? (
        <Typography
          fontSize={{ xs: "12px", md: "14px" }}
          fontWeight="600"
          sx={{
            padding: "8px 16px",
            borderRadius: "6px",
            display: "inline-block",
            width: "fit-content",
            color: (theme) => theme.palette.whiteContainer.main,
            backgroundColor: (t) => getStatusColor(t, currentStatus),
          }}
        >
          {t(capitalizeText(currentStatus))}
        </Typography>
      ) : isSmall ? (
        <Stepper
          activeStep={actStep}
          orientation="vertical"
          connector={<QontoConnector isMobile="true" />}
        >
          {steps.map((labels, index) => (
            <Step key={labels.key}>
              <StepLabel StepIconComponent={QontoStepIcon}>
                <Stack
                  justifyContent="center"
                  alignItems="center"
                  gap={{ xs: "3px", md: "4px" }}
                  marginBottom="10px"
                >
                  {t(labels?.label)}
                  {labels?.time && (
                    <Typography mt="4px" variant="body2" textAlign="center">
                      {moment(labels?.time).format("ddd, Do MMM")}
                    </Typography>
                  )}
                </Stack>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      ) : (
        <CustomStepperLabels
          activeStep={actStep}
          alternativeLabel
          connector={<QontoConnector />}
        >
          {steps.map((labels, index) => (
            <Step key={labels.key}>
              <StepLabel StepIconComponent={QontoStepIcon}>
                <Stack
                  justifyContent="center"
                  alignItems="center"
                  gap={{ xs: "3px", md: "4px" }}
                >
                  <CustomImageContainer
                    src={labels.img}
                    width="29px"
                    height="29px"
                    alt={labels.label}
                  />
                  {t(labels?.label)}
                </Stack>
              </StepLabel>
              {labels?.time && (
                <Typography mt="4px" variant="body2" textAlign="center">
                  {moment(labels?.time).format("ddd, Do MMM")}
                </Typography>
              )}
            </Step>
          ))}
        </CustomStepperLabels>
      )}
      <TrackOrderMap
        getCurrentLocation={getCurrentLocation}
        trackOrderData={trackOrderData}
        userLocation={userLocation}
      />
    </CustomStackFullWidth>
  );
};

TrackOrder.propTypes = {};

export default TrackOrder;