import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.MOBILE_URL,
    "http://localhost:5000",
    "http://localhost:5173", // Vite client
    "http://localhost:4173",
    "http://localhost:8081", // Expo
    "http://192.168.6.88:8081",
  ].filter(Boolean);

  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("Not allowed by Socket.IO CORS"));
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join room based on user role
    socket.on("join-role", (role) => {
      socket.join(role);
      console.log(`👤 User joined ${role} room`);
    });

    // Handle low stock alerts
    socket.on("low-stock-alert", (data) => {
      io.to("admin").to("pharmacist").emit("stock-notification", data);
    });

    // Handle order updates
    socket.on("order-update", (data) => {
      io.to(`user-${data.userId}`).emit("order-status", data);
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

export default { initSocket, getIO };
