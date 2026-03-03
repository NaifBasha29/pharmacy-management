import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:5173', // Vite client
        'http://localhost:8081', // Expo
        'http://192.168.6.88:8081', // Expo LAN
        'http://localhost:5005'
      ],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join room based on user role
    socket.on('join-role', (role) => {
      socket.join(role);
      console.log(`👤 User joined ${role} room`);
    });

    // Handle low stock alerts
    socket.on('low-stock-alert', (data) => {
      io.to('admin').to('pharmacist').emit('stock-notification', data);
    });

    // Handle order updates
    socket.on('order-update', (data) => {
      io.to(`user-${data.userId}`).emit('order-status', data);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export default { initSocket, getIO };
