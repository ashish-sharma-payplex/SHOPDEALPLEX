import MainApi from "../MainApi";

export const OrderApi = {
  placeOrder: (formData) => {
    // console.log("placeOrder formData:", formData); // Debugging the formData
    
    // console.log("#############@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",formData);
    
    // console.log("#############@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",formData);
    
    // console.log("#############@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",formData);
    // console.log("#############@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",formData);
    return MainApi.post("/api/v1/customer/order/place", formData);
    
  },
  
  prescriptionPlaceOrder: (orderData) => {
    const {
      store_id,
      distance,
      address,
      longitude,
      latitude,
      prescriptionImages,
      order_note,
      guest_id,
      contact_person_name,
      contact_person_number,
      dm_tips,
    } = orderData;
    
    let formData = new FormData();
    formData.append("store_id", store_id);
    formData.append("distance", distance);
    formData.append("address", address);
    formData.append("longitude", longitude);
    formData.append("latitude", latitude);
    
    prescriptionImages.forEach((prescriptionImage) => {
      formData.append("order_attachment[]", prescriptionImage);
    });
    formData.append("order_note", order_note);
    formData.append("guest_id", guest_id);
    formData.append("contact_person_number", contact_person_number);
    formData.append("contact_person_name", contact_person_name);
    formData.append("dm_tips", dm_tips);

    // console.log("prescriptionPlaceOrder formData:", formData); // Debugging the formData

    // Logging the FormData contents
    formData.forEach((value, key) => {
      // console.log(`FormData key: ${key}, value:`, value); // Debugging FormData content
    });

    return MainApi.post("/api/v1/customer/order/prescription/place", formData);
  },

  orderHistory: (orderType, limit, offset) => {
    return MainApi.get(
      `/api/v1/customer/order/${orderType}?limit=${limit}&offset=${offset}`
    );
  },

  orderDetails: (order_id) => {
    return MainApi.get(`/api/v1/customer/order/details?order_id=${order_id}`);
  },

  orderTracking: (order_id) => {
    return MainApi.get(`/api/v1/customer/order/track?order_id=${order_id}`);
  },

  CancelOrder: (formData) => {
    // console.log("CancelOrder formData:", formData); // Debugging the formData
    return MainApi.post("/api/v1/customer/order/cancel", formData);
  },

  FailedPaymentMethodUpdate: (formData) => {
    // console.log("FailedPaymentMethodUpdate formData:", formData); // Debugging the formData
    return MainApi.post("/api/v1/customer/order/payment-method", formData);
  },

  FailedPaymentMethodCancel: (formData) => {
    // console.log("FailedPaymentMethodCancel formData:", formData); // Debugging the formData
    return MainApi.post("/api/v1/customer/order/cancel", formData);
  },

  updateOrderQuantity: (formData) => {
    // console.log("updateOrderQuantity formData:", formData); // Debugging the formData
    return MainApi.post("/api/v1/customer/order/update-quantity", formData);
  },
};
