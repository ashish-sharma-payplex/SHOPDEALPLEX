// MainForm.jsx

import React, { useState, useEffect } from "react";
import StepProgress from "./StepProgress";
import ParcelForm from "./ParcelForm";
import PickUpForm from "./PickUpForm";
import DropForm from "./DropForm";
import CheckoutForm from "./CheckoutForm";
import { Box, CircularProgress } from "@mui/material";
import BookingStatusCard from "./BookingStatusCard";
import DeliveryUnavailable from "./DeliveryUnavailabel";

// ─── Storage keys ─────────────────────────────────────────────────────────────
export const SESSION_KEY = "parcel_booking_session";
export const PARCEL_RAW_KEY = "parcel_form_raw";
export const PICKUP_RAW_KEY = "pickup_form_raw";
export const DROP_RAW_KEY = "drop_form_raw";

// ── helpers ───────────────────────────────────────────────────────────────────
const saveSession = (data) => {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {}
};

// Clear all saved parcel data
export const clearAllParcelStorage = () => {
  [SESSION_KEY, PARCEL_RAW_KEY, PICKUP_RAW_KEY, DROP_RAW_KEY].forEach(
    (k) => {
      try {
        localStorage.removeItem(k);
      } catch {}
    }
  );
};

const MainForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isDropStep, setIsDropStep] = useState(false);
  const [mergedData, setMergedData] = useState({});
  const [bookingResponse, setBookingResponse] = useState(null);

  // ✅ NEW STATE
  const [showUnavailable, setShowUnavailable] = useState(false);

  // Session loading state
  const [sessionLoaded, setSessionLoaded] = useState(false);

  // ── Hydrate localStorage ────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);

      if (raw) {
        const s = JSON.parse(raw);

        if (typeof s.activeStep === "number") {
          setActiveStep(s.activeStep);
        }

        if (typeof s.isDropStep === "boolean") {
          setIsDropStep(s.isDropStep);
        }

        if (s.mergedData && Object.keys(s.mergedData).length) {
          setMergedData(s.mergedData);
        }
      }
    } catch {}

    setSessionLoaded(true);
  }, []);

  // ── Persist session ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionLoaded || bookingResponse) return;

    saveSession({
      activeStep,
      isDropStep,
      mergedData,
    });
  }, [
    activeStep,
    isDropStep,
    mergedData,
    sessionLoaded,
    bookingResponse,
  ]);

  // ── Navigation handlers ────────────────────────────────────────────────────
  const handleNext = (data) => {
    if (data) {
      setMergedData((prev) => ({
        ...prev,
        ...data,
      }));
    }

    if (activeStep === 1 && !isDropStep) {
      setIsDropStep(true);
    } else {
      setActiveStep((prev) => prev + 1);

      if (activeStep === 1 && isDropStep) {
        setIsDropStep(false);
      }
    }
  };

  const handleBackToPickup = () => {
    setIsDropStep(false);
  };

  const handleStepClick = (step) => {
    if (step < activeStep) {
      setActiveStep(step);
      setIsDropStep(false);
    }
  };

  const handleEditParcel = () => {
    setActiveStep(0);
    setIsDropStep(false);
  };

  const handleEditPickup = () => {
    setActiveStep(1);
    setIsDropStep(false);
  };

  const handleEditDrop = () => {
    setActiveStep(1);
    setIsDropStep(true);
  };

  // ── Booking success ────────────────────────────────────────────────────────
  const handleBookingSuccess = (res) => {
    // console.log("✅ Booking done:", res);

    clearAllParcelStorage();

    setBookingResponse(res);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    // ✅ 6 sec baad unavailable screen show hogi
    setTimeout(() => {
      setShowUnavailable(true);
    }, 15000);
  };

  // ── Loading spinner ────────────────────────────────────────────────────────
  if (!sessionLoaded) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 300,
        }}
      >
        <CircularProgress
          size={36}
          sx={{
            color: "#1f8f4a",
          }}
        />
      </Box>
    );
  }

  // ── Booking completed flow ─────────────────────────────────────────────────
  if (bookingResponse) {

    // ✅ After 6 sec show unavailable
    if (showUnavailable) {
      return <DeliveryUnavailable />;
    }

    // ✅ First show booking status card
    return (
      <BookingStatusCard
        bookingId={bookingResponse?.data?.order_id}
        parcelId={bookingResponse?.data?.id}
        amount={bookingResponse?.data?.fare_breakdown?.base_fare}
        payment={bookingResponse?.data?.payment_mode}
        fareBreakdown={bookingResponse?.data?.fare_breakdown}
        otp={bookingResponse?.data?.pickup_otp}
        pickup_latitude={
          bookingResponse?.data?.pickup_details?.latitude
        }
        pickup_longitude={
          bookingResponse?.data?.pickup_details?.longitude
        }
        drop_latitude={
          bookingResponse?.data?.drop_details?.latitude
        }
        drop_longitude={
          bookingResponse?.data?.drop_details?.longitude
        }
      />
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        margin: "0 auto",
        alignItems: "center",
        pt: 5,
      }}
    >
      <StepProgress
        activeStep={activeStep}
        onStepClick={handleStepClick}
      />

      {/* STEP 1 */}
      {activeStep === 0 && (
        <ParcelForm
          onNext={handleNext}
          parcelData={mergedData}
        />
      )}

      {/* STEP 2 - PICKUP */}
      {activeStep === 1 && !isDropStep && (
        <PickUpForm
          onNext={handleNext}
          parcelData={mergedData}
          pickupData={mergedData}
        />
      )}

      {/* STEP 2 - DROP */}
      {activeStep === 1 && isDropStep && (
        <DropForm
          onNext={handleNext}
          onBack={handleBackToPickup}
          parcelData={mergedData}
          dropData={mergedData}
        />
      )}

      {/* STEP 3 - CHECKOUT */}
      {activeStep === 2 && (
        <CheckoutForm
          parcelData={mergedData}
          onEditParcel={handleEditParcel}
          onEditPickup={handleEditPickup}
          onEditDrop={handleEditDrop}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </Box>
  );
};

export default MainForm;