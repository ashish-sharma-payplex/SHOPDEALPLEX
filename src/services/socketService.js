import { io } from "socket.io-client";

let socket = null;
let isConnecting = false;


/**
 * Connect Socket.IO Server
 */
export const connectSocket = () => {

    if (socket?.connected) {
        console.log("🔁 [Socket] Already connected, reusing:", socket.id);
        return socket;
    }


    if (isConnecting) {
        console.log("⏳ [Socket] Already connecting, skipping duplicate call");
        return socket;
    }


    isConnecting = true;

    console.log("🚀 [Socket] Attempting to connect to server...");

    socket = io(
        "http://3.6.142.77",
        {
            path: "/socket.io",

            transports: [
                "websocket",
                "polling"
            ],

            reconnection: true,

            reconnectionAttempts: Infinity,

            reconnectionDelay: 2000,

            timeout: 20000,

            autoConnect: true,

            forceNew: false
        }
    );



    socket.on(
        "connect",
        () => {

            isConnecting = false;

            console.log(
                "✅ [Socket] Connected successfully:",
                socket.id
            );

        }
    );



    socket.on(
        "disconnect",
        (reason) => {

            console.log(
                "❌ [Socket] Disconnected. Reason:",
                reason
            );

        }
    );



    socket.on(
        "connect_error",
        (error) => {

            isConnecting = false;

            console.log(
                "🔴 [Socket] Connection error:",
                error?.message || error
            );

        }
    );


    /*
       Reconnection lifecycle logs
       socket.io (manager) level events
    */

    socket.io.on(
        "reconnect_attempt",
        (attempt) => {

            console.log(
                "🔄 [Socket] Reconnect attempt #",
                attempt
            );

        }
    );


    socket.io.on(
        "reconnect",
        (attempt) => {

            console.log(
                "✅ [Socket] Reconnected successfully after attempt #",
                attempt
            );

        }
    );


    socket.io.on(
        "reconnect_error",
        (error) => {

            console.log(
                "🔴 [Socket] Reconnect error:",
                error?.message || error
            );

        }
    );


    socket.io.on(
        "reconnect_failed",
        () => {

            console.log(
                "🛑 [Socket] Reconnect failed permanently (all attempts exhausted)"
            );

        }
    );


    return socket;

};





/**
 * Existing Driver Live Tracking
 * DO NOT REMOVE
 */
export const subscribeToDriverTracking = (
    orderId,
    driverId,
    onLocationUpdate
) => {


    const socket = connectSocket();


    if (!socket)
        return;



    if (!orderId || !driverId) {

        console.warn(
            "Missing orderId or driverId"
        );

        return;

    }



    /*
       Join order room
       Existing mechanism
    */
    socket.emit(
        "join_order_room",
        {
            order_id: orderId,
            driver_id: driverId
        }
    );



    /*
       Start tracking
    */
    socket.emit(
        "track_driver",
        {
            order_id: orderId,
            driver_id: driverId
        }
    );



    const locationHandler = (
        data
    ) => {


        if (onLocationUpdate) {

            onLocationUpdate(
                data
            );

        }

    };



    socket.on(
        "driver_location_update",
        locationHandler
    );




    return () => {


        socket.emit(
            "leave_order_room",
            {
                order_id: orderId
            }
        );


        socket.off(
            "driver_location_update",
            locationHandler
        );


    };


};








/**
 * NEW
 * Order Status Updates
 * Driver Assigned / Delivered / Pickup etc.
 */
export const subscribeToOrderStatus = (
    orderId,
    onStatusUpdate
) => {


    const socket = connectSocket();


    if (!socket) {
        console.log("🔴 [Socket] subscribeToOrderStatus: socket instance not available");
        return;
    }



    if (!orderId) {

        console.warn(
            "Order ID missing"
        );

        return;

    }



    /*
      FIX: room join IS required here.
      subscribeToDriverTracking is NOT called from BookingStatusCard,
      so nobody was joining the room before this — that's why no
      order_status_update ever arrived even though the socket was
      connected and listening.
    */
    console.log("🚪 [Socket] Joining order room:", orderId);

    socket.emit(
        "join_order_room",
        {
            order_id: orderId
        }
    );


    console.log("👂 [Socket] Listening for 'order_status_update', orderId:", orderId);


    // DEBUG: catch-all listener to see EVERY event the server sends,
    // regardless of name — helps confirm the real event name/payload.
    const debugAnyHandler = (eventName, ...args) => {
        console.log("🛰️ [Socket][onAny] Event received:", eventName, args);
    };

    socket.onAny(debugAnyHandler);


    const statusHandler = (
        data
    ) => {


        console.log(
            "📩 [Socket] ORDER STATUS UPDATE received:",
            data
        );



        if (onStatusUpdate) {

            onStatusUpdate(
                data
            );

        }


    };



    socket.on(
        "order_status_update",
        statusHandler
    );



    return () => {

        console.log("🔇 [Socket] Removing 'order_status_update' listener, orderId:", orderId);

        socket.emit(
            "leave_order_room",
            {
                order_id: orderId
            }
        );

        socket.offAny(debugAnyHandler);

        socket.off(
            "order_status_update",
            statusHandler
        );


    };


};






/**
 * Get Socket Instance
 */
export const getSocket = () => {

    return socket;

};






/**
 * Disconnect Socket
 */
export const disconnectSocket = () => {


    if (socket) {

        console.log("🔌 [Socket] Manually disconnecting socket:", socket.id);

        socket.removeAllListeners();


        socket.disconnect();


        socket = null;


        isConnecting = false;


    }


};