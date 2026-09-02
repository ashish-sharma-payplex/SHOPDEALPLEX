import { io } from "socket.io-client";

let socket = null;
let isConnecting = false;

/**
 * Connect to FastAPI Socket.IO server
 */
export const connectSocket = () => {
  // console.log("🚀 [SocketService] connectSocket() called");

  if (socket?.connected) {
    // console.log("♻️ Reusing connected socket:", socket.id);
    return socket;
  }

  if (isConnecting) {
    // console.log("⏳ Socket already connecting... skipping duplicate call");
    return socket;
  }

  isConnecting = true;
  // console.log("🧹 Creating new socket instance...");

  socket = io("http://3.6.142.77", {
    path: "/socket.io",
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
    timeout: 20000,
    autoConnect: true,
    forceNew: false
  });

  // =====================
  // CONNECTION EVENTS
  // =====================
  socket.on("connect", () => {
    isConnecting = false;
    // console.log("🟢 SOCKET CONNECTED");
    // console.log("   Socket ID:", socket.id);
    // console.log("   Transport:", socket.io.engine.transport.name);
  });

  socket.on("disconnect", (reason) => {
    // console.log("🔴 SOCKET DISCONNECTED:", reason);
  });

  socket.on("connect_error", (err) => {
    isConnecting = false;
    // console.log("⚠️ SOCKET CONNECT ERROR:", err.message, err);
  });

  // =====================
  // RECONNECT EVENTS
  // =====================
  socket.io.on("reconnect_attempt", (attempt) => console.log("🔄 Socket reconnect attempt:", attempt));
  socket.io.on("reconnect", (attempt) => console.log("✅ Socket reconnected after attempts:", attempt));
  socket.io.on("reconnect_error", (err) => console.log("❌ Socket reconnect error:", err.message, err));
  socket.io.on("reconnect_failed", () => console.log("💀 Socket reconnect failed permanently"));
  socket.io.on("ping", () => console.log("📡 Ping sent to server"));
  socket.io.on("pong", (latency) => console.log("📶 Pong received, latency:", latency, "ms"));

  return socket;
};

/**
 * Subscribe to driver tracking for a specific order
 * Automatically joins order room and starts emitting track_driver
 */
export const subscribeToDriverTracking = (orderId, driverId, onLocationUpdate) => {
  const socket = connectSocket();
  if (!socket) return;

  if (!orderId || !driverId) {
    // console.warn("⚠️ Cannot subscribe to driver tracking — missing orderId or driverId", { orderId, driverId });
    return;
  }

  // console.log("🔹 Subscribing to driver tracking:", { orderId, driverId });

  // Join order room
  socket.emit("join_order_room", { order_id: orderId, driver_id: driverId });
  // console.log(`🚪 Emitted join_order_room for order ${orderId} and driver ${driverId}`);

  // Emit track_driver once to start receiving updates
  socket.emit("track_driver", { order_id: orderId, driver_id: driverId });
  // console.log(`🚀 Emitted track_driver for order ${orderId} and driver ${driverId}`);

  // Listen for live driver location updates
  const locationHandler = (data) => {
    // console.group("📍 [Driver Location Update]");
    // console.log("Full payload:", data);

    if (!data || data.lat == null || data.lng == null) {
      // console.warn("⚠️ Received invalid location:", data);
    } else {
      // console.log("Latitude:", data.lat, "Longitude:", data.lng);
      // console.log("Driver ID:", data.driver_id);
      // console.log("Speed:", data.speed);
      // console.log("Bearing:", data.bearing);
      // console.log("Accuracy:", data.accuracy);
      // console.log("Timestamp:", data.timestamp);
    }
    // console.groupEnd();
    
    if (onLocationUpdate) onLocationUpdate(data);
  };

  socket.on("driver_location_update", locationHandler);

  // Cleanup function
  return () => {
    // console.log("🚪 Cleaning up driver tracking for order:", orderId);
    socket.emit("leave_order_room", { order_id: orderId });
    socket.off("driver_location_update", locationHandler);
    // console.log("✅ Left order room and removed listener:", orderId);
  };
};


// Get current socket instance
export const getSocket = () => {
  // console.log("📥 getSocket() called", { exists: !!socket, id: socket?.id, connected: socket?.connected });
  return socket;
};

// Disconnect socket safely
export const disconnectSocket = () => {
  // console.log("🚪 disconnectSocket() called");

  if (socket) {
    socket.removeAllListeners(); // remove all events
    socket.disconnect();
    socket = null;
    isConnecting = false;
    // console.log("🧹 Socket fully cleaned");
  } else {
    // console.log("⚠️ No socket to disconnect");
  }
};