// src/components/my-orders/order-details/index.js
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import useGetOrderDetails from "../../../api-manage/hooks/react-query/order/useGetOrderDetails";
import useGetTrackOrderData from "../../../api-manage/hooks/react-query/order/useGetTrackOrderData";
import OtherOrder from "./other-order";
import { getGuestId } from "helper-functions/getToken";
import { useSelector } from "react-redux";
import PushNotificationLayout from "../../PushNotificationLayout";
import {
  connectSocket,
  getSocket,
  subscribeToDriverTracking,
} from "../../../services/socketService";

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

  // 👇 socket se aane wala driver location data yahan store hoga (UI me dikhane ke liye)
  const [driverLocation, setDriverLocation] = useState(null);

  useEffect(() => {
    refetch();
    refetchTrackOrder();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const socket = connectSocket();

    const handleOrderUpdate = (payload) => {
      // 👇 BAS YEH DEKHO CONSOLE MEIN
       console.log("🔴 RAW PAYLOAD:", JSON.stringify(payload));
      console.log("📦 Socket payload:", payload);
      console.log("📌 Socket status:", payload?.status);

      refetch();
      refetchTrackOrder();

      const finalStatuses = [
        "delivered",
        "completed",
        "cancelled",
        "failed",
        "refunded",
      ];

      if (finalStatuses.includes(payload?.status)) {
        socket.emit("leave_order_room", { order_id: id });
        socket.off("order_status_update", handleOrderUpdate);
        // console.log("🚪 Left room:", id);
      }
    };

    socket.emit("join_order_room", { order_id: id });
    // console.log("🚪 Joined room:", id);

    socket.off("order_status_update", handleOrderUpdate);
    socket.on("order_status_update", handleOrderUpdate);

    return () => {
      // console.log("🚪 Leaving room:", id);
      socket.emit("leave_order_room", { order_id: id });
      socket.off("order_status_update", handleOrderUpdate);
    };
  }, [id]);

  // 🟢 Driver live location tracking — sirf jab delivery man assign ho
  useEffect(() => {
    if (!id || !driverId) return;

    const handleLocationUpdate = (data) => {
      // console.log("📍 Driver Location:", data);
      setDriverLocation(data); // 👈 UI me dikhane ke liye state update
    };

    const cleanup = subscribeToDriverTracking(id, driverId, handleLocationUpdate);

    return () => {
      if (cleanup) cleanup();
    };
  }, [id, driverId]);

  useEffect(() => {
    if (!data) return;

    const finalStatuses = ["delivered", "canceled", "failed", "refunded"];

    if (finalStatuses.includes(data?.order_status)) {
      const socket = getSocket();
      if (socket) {
        // console.log(
        //   "✅ Order complete — leaving room & stopping listeners:",
        //   data?.order_status
        // );
        socket.emit("leave_order_room", { order_id: id });
        socket.off("order_status_update");
        socket.off("delivery_man_updated");
        socket.off("order_updated");
      }
    }
  }, [data?.order_status]);

  useEffect(() => {
    if (!data) return;

    // console.log("📦 Full Order Data:", data);

    const orderStatus = data?.order_status;
    // console.log("📌 Current Order Status:", orderStatus);

    const finalStatuses = [
      "delivered",
      "completed",
      "cancelled",
      "canceled",
      "failed",
      "refunded",
    ];

    if (finalStatuses.includes(orderStatus?.toLowerCase?.())) {
      // console.log(
      //   `✅ Order complete — leaving room & stopping listeners: ${orderStatus}`
      // );

      const socket = getSocket();

      if (socket) {
        socket.emit("leave_order_room", { order_id: id });
        socket.off("order_status_update");
        socket.off("delivery_man_updated");
        socket.off("order_updated");
      }
    }
  }, [data, id]);

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