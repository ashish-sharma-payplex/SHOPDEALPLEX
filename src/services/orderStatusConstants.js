// src/services/orderStatusConstants.js

/**
 * ⚠️ SINGLE SOURCE OF TRUTH for "final / terminal" order statuses.
 *
 * PEHLE: har file (OrderDetails, TrackOrder) me alag-alag hardcoded array tha
 *   - kahi "completed" missing tha
 *   - kahi "canceled" likha tha, kahi "cancelled" (double L)
 *   - isse status match fail hota tha aur socket listener sahi time pe
 *     clean-up nahi hota tha (ya galat time pe ho jata tha)
 *
 * AB: sab jagah yahi ek array import karo. Kahi bhi naya hardcoded
 * finalStatuses array MAT banao.
 *
 * Yeh saari possible spellings/variants cover karta hai jo backend bhej sakta hai.
 */
export const ORDER_FINAL_STATUSES = [
  "delivered",
  "completed",
  "cancelled",
  "canceled",
  "failed",
  "refunded",
  "refund_requested",
  "refund_request_canceled",
];

/**
 * Helper — case-insensitive check, kyunki backend kabhi "Delivered" /
 * "DELIVERED" bhej sakta hai aur direct === match fail ho jata tha.
 */
export const isOrderStatusFinal = (status) => {
  if (!status) return false;
  return ORDER_FINAL_STATUSES.includes(String(status).toLowerCase());
};