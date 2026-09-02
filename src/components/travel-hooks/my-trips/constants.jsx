// src/components/travel-hooks/my-trips/constants.js
import FlightIcon from "@mui/icons-material/Flight";
import TrainIcon from "@mui/icons-material/Train";
import HotelIcon from "@mui/icons-material/Hotel";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";

export const GREEN = "#16a34a";

export const CATEGORIES = [
  { label: "Flights", icon: <FlightIcon /> },
  { label: "Buses", icon: <TrainIcon /> },
  { label: "Hotels", icon: <HotelIcon /> },
  // { label: "Cabs", icon: <DirectionsCarIcon /> },
];

export const STATUS_FILTERS = [
  "All",
  "Booked",
  "Ticketed",
  "Failed",
  "Cancelled",
];

// Flights ke liye UI filter label ko actual API status string se map karna.
export const STATUS_MAP = {
  Booked: "BOOKED",
  Ticketed: "TICKETED",
  Cancelled: "CANCELLED",
  Failed: "BOOK_FAILED",
};

// ✅ NAYA — Hotels ke liye UI filter label ko HotelCard.jsx ke
// `hotel_booking_status` field ke actual value se map karna.
// "All" aur "Cancelled" is map me jaan-bujh kar NAHI hain —
// "All" ka matlab koi filter nahi, "Cancelled" alag API
// (getHotelCancellations) se already handle ho raha hai.
export const HOTEL_STATUS_MAP = {
  Booked: "Confirmed",
  Ticketed: "Pending",
  Failed: "Failed",
};

// ── NOTE: Ye sirf dummy/static data hai — Trains, Cabs abhi
// kisi real API se connected nahi hain. ──
export const STATIC_DATA = {
  Trains: [
    {
      id: 3,
      bookingId: "TR-2024-001",
      from: "Delhi (DLI)",
      to: "Agra (AGR)",
      date: "2024-07-20",
      time: "06:00",
      train: "Rajdhani Express",
      status: "Upcoming",
      price: "₹1,200",
    },
    {
      id: 4,
      bookingId: "TR-2024-002",
      from: "Mumbai (CSMT)",
      to: "Pune (PHC)",
      date: "2024-06-10",
      time: "15:30",
      train: "Intercity Express",
      status: "Cancelled",
      price: "₹800",
    },
  ],
  Cabs: [
    {
      id: 7,
      bookingId: "CB-2024-001",
      pickupLocation: "Mumbai Airport",
      dropLocation: "Bandra",
      date: "2024-07-16",
      time: "18:00",
      carType: "Sedan",
      status: "Upcoming",
      price: "₹800",
    },
    {
      id: 8,
      bookingId: "CB-2024-002",
      pickupLocation: "Colaba",
      dropLocation: "Fort",
      date: "2024-06-15",
      time: "10:30",
      carType: "Hatchback",
      status: "Failed",
      price: "₹400",
    },
  ],
};

export const CHANGE_REQUEST_STATUS = {
  0: { label: "Not Set", bg: "#f3f4f6", color: "#374151" },
  1: { label: "Unassigned", bg: "#fef9c3", color: "#a16207" },
  2: { label: "Assigned", bg: "#dbeafe", color: "#1d4ed8" },
  3: { label: "Acknowledged", bg: "#e0e7ff", color: "#4338ca" },
  4: { label: "Completed", bg: "#dcfce7", color: "#15803d" },
  5: { label: "Rejected", bg: "#fee2e2", color: "#dc2626" },
  6: { label: "Closed", bg: "#f3f4f6", color: "#374151" },
  7: { label: "Pending", bg: "#fef3c7", color: "#b45309" },
  8: { label: "Other", bg: "#f3f4f6", color: "#6b7280" },
};
export const DEFAULT_CHANGE_REQUEST_STATUS = {
  label: "Unknown",
  bg: "#f3f4f6",
  color: "#6b7280",
};
