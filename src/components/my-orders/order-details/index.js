// src/components/my-orders/order-details/index.js
import { useRouter } from "next/router";
import React, { useEffect, useState, useRef } from "react";
import useGetOrderDetails from "../../../api-manage/hooks/react-query/order/useGetOrderDetails";
import useGetTrackOrderData from "../../../api-manage/hooks/react-query/order/useGetTrackOrderData";
import OtherOrder from "./other-order";
import { getGuestId } from "helper-functions/getToken";
import { useSelector } from "react-redux";
import PushNotificationLayout from "../../PushNotificationLayout";
import {
  subscribeToDriverTracking,
  subscribeToOrderStatus,
} from "../../../services/socketService";
import { isOrderStatusFinal } from "../../../services/orderStatusConstants";

const OrderDetails = ({ configData, id, page }) => {
  const router = useRouter();
  const guestId = getGuestId();
  const { guestUserInfo } = useSelector((state) => state.guestUserInfo);
  const phone = guestUserInfo?.contact_person_number;

  const {
    refetch,
    data,
    isRefetching,
    isLoading: dataIsLoading,
  } = useGetOrderDetails(id, guestId);

  const { refetch: refetchTrackOrder, data: trackOrderData } =
    useGetTrackOrderData(id, phone, guestId);

  const driverId = trackOrderData?.delivery_man?.id;

  // socket se aane wala driver location data yahan store hoga (UI me dikhane ke liye)
  const [driverLocation, setDriverLocation] = useState(null);

  // is ref me current order-status subscription ka "unsubscribe" function
  // store rehta hai, taaki final status milte hi hum khud ise call karke
  // turant listener band kar sakein (na ki wait karein component unmount ka)
  const unsubscribeStatusRef = useRef(null);

  useEffect(() => {
    refetch();
    refetchTrackOrder();
  }, [id]);

  // ---- SINGLE order-status subscription point ----
  // FIX: pehle yahan manual socket.on/off likha jata tha, aur kahi
  // "socket.off('order_status_update')" bina handler pass kiye call hota
  // tha — jo is event ke SAARE listeners hata deta tha (TrackOrder page
  // ka listener bhi), isliye status updates achanak aana band ho jate the.
  // Ab hum sirf socketService.subscribeToOrderStatus() use karte hain,
  // jo apna hi specific handler register/cleanup karta hai.
  useEffect(() => {
    if (!id) return;

    const handleOrderUpdate = (payload) => {
      console.log("Socket payload:", payload);
      console.log("Socket status:", payload?.status);

      refetch();
      refetchTrackOrder();

      if (isOrderStatusFinal(payload?.status)) {
        // final status aate hi turant unsubscribe kar do
        if (unsubscribeStatusRef.current) {
          unsubscribeStatusRef.current();
          unsubscribeStatusRef.current = null;
        }
      }
    };

    unsubscribeStatusRef.current = subscribeToOrderStatus(id, handleOrderUpdate);

    return () => {
      if (unsubscribeStatusRef.current) {
        unsubscribeStatusRef.current();
        unsubscribeStatusRef.current = null;
      }
    };
  }, [id]);

  // ---- Driver live location tracking — sirf jab delivery man assign ho ----
  useEffect(() => {
    if (!id || !driverId) return;

    const handleLocationUpdate = (data) => {
      setDriverLocation(data);
    };

    const cleanup = subscribeToDriverTracking(id, driverId, handleLocationUpdate);

    return () => {
      if (cleanup) cleanup();
    };
  }, [id, driverId]);

  // ---- Safety-net cleanup agar fetched data khud final status dikhaye ----
  // (e.g. page load pe hi order already delivered/cancelled nikla, socket
  // event ka wait kiye bina hi hume subscription band karni chahiye)
  useEffect(() => {
    if (!data) return;

    if (isOrderStatusFinal(data?.order_status)) {
      if (unsubscribeStatusRef.current) {
        unsubscribeStatusRef.current();
        unsubscribeStatusRef.current = null;
      }
    }
  }, [data?.order_status]);

  return (
    <div>
      <PushNotificationLayout
        refetchTrackOrder={refetchTrackOrder}
        pathName="profile"
      >
        <OtherOrder
          configData={configData}
          data={data}
          refetch={refetch}
          id={id}
          dataIsLoading={dataIsLoading}
          page={page}
          driverLocation={driverLocation}
        />
      </PushNotificationLayout>
    </div>
  );
};

export default OrderDetails;