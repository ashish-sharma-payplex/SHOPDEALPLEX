// pages\my-travel-trips\BusBooking.jsx
import React, { useEffect, useState } from "react";
import { Box, Typography, Skeleton } from "@mui/material";
import Swal from "sweetalert2";
import { getBusBookingList, getBusBookingDetails, cancelBusBooking } from "travel-api/busApi";
import BusBookingCard from "./BusBookingCard";
import BusBookingDetailsDialog from "./BusBookingDialog";

const BusBooking = () => {
  const [loading, setLoading] = useState(false);
  const [busBookings, setBusBookings] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  const fetchBusBookings = async () => {
    try {
      setLoading(true);

      const response = await getBusBookingList();

      if (response?.results?.length === 0) {
        // console.log("No Bus Bookings Available");
      }

      setBusBookings(response.results || []);
    } catch (error) {
      // console.log("Bus Booking Error :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusBookings();
  }, []);

  const handleCardClick = async (booking) => {
    setDialogOpen(true);
    setDetailsLoading(true);
    setBookingDetails(null);
    try {
      const response = await getBusBookingDetails(booking?.trace_id, booking?.bus_id);
      setBookingDetails(response);
    } catch (error) {
      // console.log("Bus Booking Details Error :", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setBookingDetails(null);
  };

  const handleCancelBooking = async (traceId, busId, remarks) => {
    const response = await cancelBusBooking(traceId, busId, remarks);

    // ✅ FIX — MUI Dialog aur SweetAlert2 dono apne alag stacking
    // context/portal use karte hain. Agar Dialog open rehte hue Swal
    // fire karo, to Swal uske peeche "chhup" jata hai (chahe z-index
    // set ho) — sirf Dialog manually band karne par visible hota hai.
    //
    // Solution: pehle Dialog ko close karo, uske exit-transition
    // (MUI default ~225ms) complete hone do, TABHI Swal dikhao.
    // Isse dono libraries kabhi ek saath screen pe overlap hi nahi
    // karengi aur z-index conflict ka sawaal hi khatam ho jata hai.
    // Ye dono cases (success + failure) me consistently follow kiya
    // gaya hai taaki behavior predictable rahe.
    handleCloseDialog();

    setTimeout(() => {
      // ✅ FIX — API 200 status ke saath bhi `success: false` return
      // kar sakta hai (e.g. { success:false, message:"...", code:"2" }).
      // Pehle response.success check hi nahi hota tha, isliye failure
      // case me bhi "Booking Cancelled" success popup dikh raha tha.
      if (response?.success === false) {
        Swal.fire({
          icon: "error",
          title: "Cancellation Failed",
          text: response?.message || "The booking could not be cancelled.",
          confirmButtonText: "OK",
        });
        // list refresh nahi karni — booking cancel hi nahi hui,
        // status waisa hi rahega jaisa pehle tha
        return;
      }

      Swal.fire({
        icon: "success",
        title: "Booking Cancelled",
        text: response?.message || "Your bus booking has been cancelled successfully.",
        confirmButtonText: "OK",
      });

      fetchBusBookings(); // list refresh so cancelled status reflect ho
    }, 300); // Dialog ke close transition se thoda zyada (225ms + buffer)
  };

  return (
    <Box>
      <Typography
        sx={{
          fontSize: { xs: 18, sm: 22 },
          fontWeight: 700,
          mb: { xs: 2, sm: 3 },
        }}
      >
        🚌 Bus Bookings
      </Typography>

      {loading ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "1fr 1fr 1fr",
              lg: "1fr 1fr 1fr",
            },
            gap: 2,
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={`bus-skel-${i}`}
              variant="rounded"
              sx={{ height: 260, borderRadius: "16px" }}
            />
          ))}
        </Box>
      ) : busBookings.length > 0 ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "1fr 1fr 1fr",
              lg: "1fr 1fr 1fr",
            },
            gap: 2,
          }}
        >
          {busBookings.map((booking) => (
            <BusBookingCard key={booking.id} booking={booking} onClick={handleCardClick} />
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "500px",
          }}
        >
          <Box
            component="img"
            src="/no-bus.png"
            alt="No Bus"
            sx={{
              width: 220,
              height: 220,
              objectFit: "contain",
              mb: 2,
            }}
          />
          <Typography
            sx={{
              maxWidth: "452px",
              minHeight: "48px",
              fontFamily: "Inter,sans-serif",
              fontWeight: 400,
              fontSize: "20px",
              lineHeight: "24px",
              letterSpacing: 0,
              textAlign: "center",
              color: "#4B5563",
              mx: "auto",
            }}
          >
            Oops! No bus bookings found.
          </Typography>
        </Box>
      )}

      <BusBookingDetailsDialog
        open={dialogOpen}
        data={bookingDetails}
        loading={detailsLoading}
        onClose={handleCloseDialog}
        onCancelBooking={handleCancelBooking}
      />
    </Box>
  );
};

export default BusBooking;