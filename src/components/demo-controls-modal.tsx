
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import { useNotifications } from "@/contexts/notification-context";
import { getSession, setSession, removeSession } from "@/lib/session";
import { seedConsultants } from "@/lib/consultants-seeder";
import { seedContentItems } from "@/lib/content-seeder";
import { seedConferences } from "@/lib/conferences-seeder";
import { Terminal, Database, Trash2, Languages, BellPlus, CheckCircle, RefreshCw } from "lucide-react";

const translations = {
    en: {
        title: "Demo Controls",
        description: "Use these controls to simulate different states for demonstration purposes.",
        seed: "Seed Demo Data",
        clear: "Clear Session & Reload",
        toggleLang: "Toggle EN/FR",
        notification: "Simulate Notification",
        acceptCookies: "Mark Cookies Accepted",
        counts: "Session Counts",
        consultants: "Consultants",
        content: "Content Items",
        conferences: "Conferences",
        guests: "Guest Emails",
    },
    fr: {
        title: "Contrôles de Démo",
        description: "Utilisez ces contrôles pour simuler différents états à des fins de démonstration.",
        seed: "Charger les données de démo",
        clear: "Vider la session et recharger",
        toggleLang: "Basculer EN/FR",
        notification: "Simuler une notification",
        acceptCookies: "Accepter les cookies",
        counts: "Compteurs de session",
        consultants: "Consultants",
        content: "Contenus",
        conferences: "Conférences",
        guests: "E-mails des invités",
    }
}

export function DemoControlsModal({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) {
  const { language, toggleLanguage } = useLanguage();
  const { addNotification } = useNotifications();
  const t = translations[language];

  const [counts, setCounts] = useState({ consultants: 0, contentItems: 0, conferences: 0, guestEmails: 0 });

  const updateCounts = useCallback(() => {
    setCounts({
      consultants: getSession<any[]>("consultants")?.length || 0,
      contentItems: getSession<any[]>("contentItems")?.length || 0,
      conferences: getSession<any[]>("conferences")?.length || 0,
      guestEmails: getSession<any[]>("guestEmails")?.length || 0,
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      updateCounts();
    }
  }, [isOpen, updateCounts]);

  const handleSeedData = () => {
    removeSession("consultants_seeded");
    removeSession("content_seeded");
    removeSession("conferences_seeded");
    seedConsultants();
    seedContentItems();
    seedConferences();
    updateCounts();
    window.location.reload();
  };

  const handleClearSession = () => {
    sessionStorage.clear();
    window.location.reload();
  };
  
  const handleSimulateNotification = () => {
      addNotification({
          title: language === 'fr' ? 'Notification de test' : 'Test Notification',
          description: language === 'fr' ? 'Ceci est une notification de test générée par le panneau de démo.' : 'This is a test notification generated from the demo panel.'
      })
  }

  const handleAcceptCookies = () => {
      setSession('cookies', 'accepted');
      window.location.reload();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mx-auto mb-4">
                <Terminal className="h-6 w-6 text-primary" />
            </div>
          <DialogTitle className="text-center">{t.title}</DialogTitle>
          <DialogDescription className="text-center">
            {t.description}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2 my-4">
          <Button onClick={handleSeedData}><RefreshCw /> {t.seed}</Button>
          <Button variant="destructive" onClick={handleClearSession}><Trash2 /> {t.clear}</Button>
          <Button variant="outline" onClick={toggleLanguage}><Languages /> {t.toggleLang}</Button>
          <Button variant="outline" onClick={handleSimulateNotification}><BellPlus /> {t.notification}</Button>
          <Button variant="outline" className="col-span-2" onClick={handleAcceptCookies}><CheckCircle /> {t.acceptCookies}</Button>
        </div>
        <DialogFooter className="!flex-col gap-2 border-t pt-4">
            <h3 className="font-semibold text-center text-sm text-foreground">{t.counts}</h3>
            <div className="flex justify-around text-xs text-muted-foreground text-center">
                <div>
                    <p className="font-bold text-lg text-primary">{counts.consultants}</p>
                    <p>{t.consultants}</p>
                </div>
                <div>
                    <p className="font-bold text-lg text-primary">{counts.contentItems}</p>
                    <p>{t.content}</p>
                </div>
                <div>
                    <p className="font-bold text-lg text-primary">{counts.conferences}</p>
                    <p>{t.conferences}</p>
                </div>
                <div>
                    <p className="font-bold text-lg text-primary">{counts.guestEmails}</p>
                    <p>{t.guests}</p>
                </div>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
