// components/travel-hooks/my-trips/hotelCancelStatus.js

export const HOTEL_CANCEL_STATUS = {
  0: { label: "Not Set", color: "#9e9e9e" },
  1: { label: "Pending", color: "#f59e0b" },
  2: { label: "In Progress", color: "#3b82f6" },
  3: { label: "Processed", color: "#16a34a" },
  4: { label: "Rejected", color: "#dc2626" },
};

export const getHotelCancelStatus = (statusCode) => {
  return HOTEL_CANCEL_STATUS[statusCode] || HOTEL_CANCEL_STATUS[0];
};