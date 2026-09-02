// src\api-manage\ParcelApi.js
export const parcel_weight_range_api =
  "/api/v1/customer/parcelapi/parcel_weightrange";

export const parcel_details_api = "/api/v1/customer/parcelapi/parceldetails";

export const parcel_pickup_api = (parcelId) =>
  `/api/v1/customer/parcelapi/${parcelId}/pickup-details`;

export const parcel_drop_api = (parcelId) =>
  `/api/v1/customer/parcelapi/${parcelId}/drop-details`;

export const parcel_vehicle_recommendation_api = "/api/v1/customer/parcelapi/vehicle-recommendations";

export const parcel_select_vehicle_api = (parcelId) =>
  `/api/v1/customer/parcelapi/${parcelId}/select-vehicle`;

export const parcel_book_api = "https://dealplex.in/api/v1/customer/parcelapi/confirm-parcel-order";

export const parcel_cancel_reasons_api =
  "/api/v1/customer/parcelapi/cancelation-ressons";

export const parcel_cancel_booking_api = (parcelId) =>
  `/api/v1/customer/parcelapi/${parcelId}/cancel-booking`;