import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Notification {
  id: string;
  message: string;
  createdAt: string;
}

interface NotificationContextValue {
  notifications: Notification[];
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const socket: Socket = io('/', { path: '/socket.io' });
    socket.on('notification', (payload: Notification) => {
      setNotifications((prev) => [payload, ...prev].slice(0, 50));
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  return <NotificationContext.Provider value={{ notifications }}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
