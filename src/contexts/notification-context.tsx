
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { getSession, setSession, seedOnce } from "@/lib/session";

export interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const seedNotifications = () => {
  const now = new Date();
  const initialNotifications: Notification[] = [
    {
      id: "1",
      title: "Welcome to Astrethique!",
      description: "We are excited to have you on board.",
      timestamp: new Date(now.getTime() - 1000 * 60 * 5).toISOString(),
      isRead: false,
    },
    {
      id: "2",
      title: "Your profile is incomplete",
      description: "Complete your profile to get the best experience.",
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
      isRead: false,
    },
    {
      id: "3",
      title: "New conference announced",
      description: "Check out the new conference on 'The Future of Aesthetics'.",
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
      isRead: true,
    },
  ];
  setSession("notifications", initialNotifications);
  return initialNotifications;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    seedOnce("notifications_seeded", () => {
        const seeded = seedNotifications();
        setNotifications(seeded);
    });

    const storedNotifications = getSession<Notification[]>("notifications");
    if (storedNotifications) {
      setNotifications(storedNotifications);
    }
  }, []);

  useEffect(() => {
    const count = notifications.filter(n => !n.isRead).length;
    setUnreadCount(count);
  }, [notifications]);

  const updateNotifications = (updated: Notification[]) => {
      setNotifications(updated);
      setSession("notifications", updated);
  }

  const markAsRead = useCallback((id: string) => {
    const newNotifications = notifications.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    );
    updateNotifications(newNotifications);
  }, [notifications]);

  const markAllAsRead = useCallback(() => {
    const newNotifications = notifications.map(n => ({ ...n, isRead: true }));
    updateNotifications(newNotifications);
  }, [notifications]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: Notification = {
        ...notification,
        id: new Date().getTime().toString(),
        timestamp: new Date().toISOString(),
        isRead: false,
    };
    const newNotifications = [newNotification, ...notifications];
    updateNotifications(newNotifications);
  }, [notifications]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
