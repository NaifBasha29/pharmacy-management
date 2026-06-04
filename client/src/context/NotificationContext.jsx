import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Socket connects to the server base URL (without /api)
      const socketUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5005/api').replace('/api', '');
      const newSocket = io(socketUrl, {
        withCredentials: true
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        newSocket.emit('join-role', user.role);
        if (user.role === 'user') {
          newSocket.emit('join-user', user.id);
        }
      });

      newSocket.on('stock-notification', (data) => {
        addNotification({
          type: 'warning',
          title: 'Low Stock Alert',
          message: data.message || `${data.medicine?.name} is low on stock`,
          data
        });
      });

      newSocket.on('new-order', (data) => {
        addNotification({
          type: 'info',
          title: 'New Order',
          message: `New order #${data.orderNumber} placed`,
          data
        });
      });

      newSocket.on('order-status', (data) => {
        addNotification({
          type: 'success',
          title: 'Order Update',
          message: data.message || `Order ${data.orderNumber} status updated`,
          data
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 50));
    setUnreadCount(prev => prev + 1);
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const value = {
    socket,
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};





