
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { getLocal, setLocal, seedOnce } from "@/lib/local";

export interface Notification {
  id: string;
  title: string;
  body: string;
  category: 'system' | 'content' | 'session';
  createdAt: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const seedNotifications = () => {
  const now = new Date();
  const initialNotifications: Notification[] = [
    {
      id: "1",
      title: "Welcome to Astrethique!",
      body: "We are excited to have you on board.",
      category: 'system',
      createdAt: new Date(now.getTime() - 1000 * 60 * 5).toISOString(),
      read: false,
    },
    {
      id: "2",
      title: "Your profile is incomplete",
      body: "Complete your profile to get the best experience.",
      category: 'system',
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
      read: false,
    },
    {
      id: "3",
      title: "New conference announced",
      body: "Check out the new conference on 'The Future of Aesthetics'.",
      category: 'content',
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
      read: true,
    },
  ];
  setLocal("notifications", initialNotifications);
  return initialNotifications;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    seedOnce("notifications_seeded", () => {
        const seeded = seedNotifications();
        setNotifications(seeded.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    });

    const storedNotifications = getLocal<Notification[]>("notifications");
    if (storedNotifications) {
      setNotifications(storedNotifications.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }
  }, []);

  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const updateNotifications = (updated: Notification[]) => {
      const sorted = updated.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(sorted);
      setLocal("notifications", sorted);
  }

  const markAsRead = useCallback((id: string) => {
    const newNotifications = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    updateNotifications(newNotifications);
  }, [notifications]);

  const markAllAsRead = useCallback(() => {
    const newNotifications = notifications.map(n => ({ ...n, read: true }));
    updateNotifications(newNotifications);
  }, [notifications]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
        ...notification,
        id: new Date().getTime().toString(),
        createdAt: new Date().toISOString(),
        read: false,
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
