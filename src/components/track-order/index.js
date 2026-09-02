// src\components\track-order\index.js
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useRouter } from "next/router";
import useGetTrackOrderData from "../../api-manage/hooks/react-query/order/useGetTrackOrderData";
import { useSelector } from "react-redux"; // ✅ Add this
import { connectSocket, getSocket } from "../../services/socketService"; // ✅ Add this
import { getGuestId } from "helper-functions/getToken"; // ✅ Add this
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

// ✅ STYLED COMPONENTS (yaha pe the original code se)
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

// ✅ NAYA: TopDetails.js jaisa hi status-set, terminal (non-linear) statuses
// jo stepper me progress ki tarah nahi, alag banner ki tarah dikhaye jaate hain
const TERMINAL_STATUSES = [
  "canceled",
  "cancelled",
  "failed",
  "refund_requested",
  "refund_request_canceled",
  "refunded",
];

// ✅ NAYA: TopDetails.js ki tarah hi color mapping — same colors use kiye taaki
// TrackOrder page aur Order Details page dono me consistent dikhe
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

  // ✅ SOCKET - Required variables
  const guestId = getGuestId();
  const { guestUserInfo } = useSelector((state) => state.guestUserInfo);
  const phone = guestUserInfo?.contact_person_number;
  const router = useRouter();
  const orderId = router.query.id || trackOrderData?.id;

  // ✅ Direct hook call for refetch capability
  const { refetch: refetchTrackOrder } = useGetTrackOrderData(
    orderId,
    phone,
    guestId
  );

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

  // ✅ NAYA: poora status-driven step list — TopDetails.js jaise hi delivery-man
  // statuses (accepted, arrived_at_pickup, drop_arrived, drop_verified waghera)
  // include kiye. Har status ka apna step hai taaki jaise hi socket se naya
  // status aaye, yeh stepper bhi turant sahi jagah pe progress dikhaye.
  const steps = [
    {
      key: "confirmed",
      label: "Order Confirmed",
      time: trackOrderData?.confirmed,
      img: orderConfirmImage.src,
    },
    // {
    //   key: "processing",
    //   label: `Preparing ${
    //     trackOrderData?.module?.module_type === "food" ? "foods" : "items"
    //   }`,
    //   time: trackOrderData?.processing,
    //   img: shippedImage.src,
    // },
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

  // ✅ NAYA: order_status ke hisaab se active step index (TopDetails jaisa hi
  // status-set match karta hai, bas yaha progression order me hai)
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
        setActStep(steps.length + 1); // sab steps complete
        break;
      default:
        // canceled/failed/refunded waghera — stepper progress freeze rehta hai
        // jaha tak pahuncha tha, banner alag se dikhega neeche
        break;
    }
  };

  useEffect(() => {
    handleStepper();
  }, [trackOrderData?.order_status]);

  // ✅ SOCKET CONNECTION - Room join + continuous listen
  useEffect(() => {
    if (!orderId) return;

    const socket = connectSocket();

    const handleOrderUpdate = (payload) => {
      // console.log("📦 Order update received:", payload);

      // Refresh data
      refetchTrackOrder();

      // Auto leave room when order finishes
      const finalStatuses = [
        "delivered",
        "completed",
        "cancelled",
        "failed",
        "refunded",
      ];

      if (finalStatuses.includes(payload?.status)) {
        socket.emit("leave_order_room", {
          order_id: orderId,
        });

        socket.off("order_status_update", handleOrderUpdate);

        // console.log("🚪 Left room:", orderId);
      }
    };

    // Join room
    socket.emit("join_order_room", {
      order_id: orderId,
    });

    // console.log("🚪 Joined room:", orderId);

    // Remove old listener
    socket.off("order_status_update", handleOrderUpdate);

    // Add listener
    socket.on("order_status_update", handleOrderUpdate);

    return () => {
      // console.log("🚪 Leaving room:", orderId);

      socket.emit("leave_order_room", {
        order_id: orderId,
      });

      socket.off("order_status_update", handleOrderUpdate);
    };
  }, [orderId, refetchTrackOrder]);

  // ✅ CLEANUP - Order complete hone par
  useEffect(() => {
    if (!trackOrderData) return;

    const finalStatuses = ["delivered", "canceled", "failed", "refunded"];

    if (finalStatuses.includes(trackOrderData?.order_status)) {
      const socket = getSocket();
      if (socket) {
        // console.log(
        //   "✅ Order complete — leaving room & stopping listeners:",
        //   trackOrderData?.order_status
        // );
        socket.emit("leave_order_room", { order_id: orderId });
        socket.off("order_status_update");
        socket.off("delivery_man_updated");
        socket.off("order_updated");
      }
    }
  }, [trackOrderData?.order_status, orderId]);

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
      {/* ✅ NAYA: agar order cancel/failed/refunded hai toh stepper ki jagah
          TopDetails jaisa hi status banner dikhao — linear progress in cases
          me confusing hota hai */}
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
                  {/* <CustomImageContainer
                    src={labels.img}
                    width="29px"
                    height="29px"
                    alt={labels.label}
                  /> */}
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