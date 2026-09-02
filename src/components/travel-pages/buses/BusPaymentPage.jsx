// travel-pages/buses/BusPaymentPage.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

import QRPaymentPage from "components/travel-components/buses/BusPaymentQRModal";
import { useBusPayment } from "components/travel-hooks/bus/useBusPayment";
import { useBusBook } from "components/travel-hooks/bus/useBusBook";

const GREEN = "#16a34a";

const BusPaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    bus,
    contact,
    billing,
    passengers,
    selectedSeatObjects = [],
    selectedBoardingPoint,
    selectedDroppingPoint,
    traceId,
    resultIndex,
  } = location.state || {};

  const { initiatePayment, startPolling, stopPolling } = useBusPayment();
  const { bookTicket } = useBusBook();

  // ✅ QRPaymentPage ke props ke exact shape ke hisaab se state
  const [paymentData, setPaymentData] = useState(null); // { amount, orderId, upiIntentUrl, expiryDate }
  const [paymentStatus, setPaymentStatus] = useState("PENDING");
  const [retrying, setRetrying] = useState(true); // pehli baar QR generate hote waqt bhi spinner dikhana hai
  const [cancelling, setCancelling] = useState(false);

  const startedRef = useRef(false);

  // ✅ Zaroori state missing ho (direct URL hit / refresh) toh safe redirect
  useEffect(() => {
    if (!traceId || !resultIndex) {
      navigate("/buses", { replace: true });
    }
  }, [traceId, resultIndex, navigate]);

  const launchPaymentQR = useCallback(async () => {
    setRetrying(true);
    setPaymentStatus("PENDING");
    try {
      const res = await initiatePayment({ traceId, resultIndex });

      if (res?.success && res?.data) {
        setPaymentData(res.data);
        setRetrying(false);

        startPolling({
          traceId,
          resultIndex,
          intervalMs: 3000,
          onStatus: (statusData) => {
            setPaymentStatus(statusData?.status ?? "PENDING");
          },
          onSuccess: async () => {
            setPaymentStatus("SUCCESS");
            try {
              const bookRes = await bookTicket(traceId, resultIndex);
              setTimeout(() => {
                navigate("/buses/ticket", {
                  state: {
                    bookingResponse: bookRes,
                    bus,
                    contact,
                    billing,
                    passengers,
                    selectedSeatObjects,
                    selectedBoardingPoint,
                    selectedDroppingPoint,
                  },
                });
              }, 1200);
            } catch (err) {
              const msg =
                err?.message ||
                "Payment was successful but booking confirmation failed. Please contact support.";
              Swal.fire({
                icon: "error",
                title: "Booking Failed",
                text: msg,
                confirmButtonColor: GREEN,
              }).then(() => {
                navigate("/buses/ticket", {
                  state: {
                    bookingResponse: { success: false, message: msg },
                    bus,
                    contact,
                    billing,
                    passengers,
                    selectedSeatObjects,
                    selectedBoardingPoint,
                    selectedDroppingPoint,
                  },
                });
              });
            }
          },
          onExpired: () => {
            setPaymentStatus("EXPIRED");
          },
          onFailed: (statusData) => {
            setPaymentStatus("FAILED");
            stopPolling();
            // ✅ QRPaymentPage khud hi "Payment Failed" overlay + Retry button
            // dikha deta hai (paymentStatus="FAILED" ke through), isliye
            // yaha alag se Swal popup zaroori nahi — bas status set kar diya.
          },
        });
      } else {
        setRetrying(false);
        setPaymentStatus("FAILED");
        Swal.fire({
          icon: "error",
          title: "Payment Init Failed",
          text: res?.error?.message || res?.message || "Could not initiate payment.",
          confirmButtonColor: GREEN,
        });
      }
    } catch (err) {
      setRetrying(false);
      setPaymentStatus("FAILED");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Could not initiate payment. Please try again.",
        confirmButtonColor: GREEN,
      });
    }
  }, [
    traceId,
    resultIndex,
    initiatePayment,
    startPolling,
    stopPolling,
    bookTicket,
    navigate,
    bus,
    contact,
    billing,
    passengers,
    selectedSeatObjects,
    selectedBoardingPoint,
    selectedDroppingPoint,
  ]);

  // ✅ Page mount hote hi ek hi baar payment initiate karo
  useEffect(() => {
    if (traceId && resultIndex && !startedRef.current) {
      startedRef.current = true;
      launchPaymentQR();
    }
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [traceId, resultIndex]);

  const handleRetry = () => {
    stopPolling();
    launchPaymentQR();
  };

  const handleCancelPayment = async () => {
    setCancelling(true);
    try {
      stopPolling();
      // ✅ Agar backend pe koi explicit "cancel payment" API ho, use yaha
      // await karo (jaise: await cancelPayment({ traceId, resultIndex }))
      setTimeout(() => {
        navigate("/buses", { replace: true });
      }, 500);
    } finally {
      setCancelling(false);
    }
  };

  // ✅ Right panel ke liye optional data — Cart = selected seats
  const cartItems = selectedSeatObjects.map((seat) => ({
    name: `Seat ${seat.SeatName}`,
    sub: bus?.operatorName,
    qty: 1,
    price: seat.SeatFare || 0,
  }));

  const totalFare = selectedSeatObjects.reduce(
    (s, seat) => s + (seat.SeatFare || 0),
    0,
  );

  const paymentSummary = {
    itemPrice: totalFare,
    total: paymentData?.amount ?? totalFare,
  };

  const deliveryAddress = contact
    ? {
        name: passengers?.[0]?.name || "Guest",
        phone: contact.phone,
        address: billing?.address
          ? `${billing.address}${billing.city ? ", " + billing.city : ""}${
              billing.state ? ", " + billing.state : ""
            }`
          : `${bus?.from || ""} → ${bus?.to || ""}`,
      }
    : undefined;

  return (
    <QRPaymentPage
      paymentData={paymentData}
      onRetry={handleRetry}
      onCancelPayment={handleCancelPayment}
      retrying={retrying}
      cancelling={cancelling}
      paymentStatus={paymentStatus}
      deliveryAddress={deliveryAddress}
      cartItems={cartItems}
      paymentSummary={paymentSummary}
    />
  );
};

export default BusPaymentPage;