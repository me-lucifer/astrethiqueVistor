
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
import { useNotifications } from "@/contexts/notification-context";
import { getLocal, setLocal } from "@/lib/local";
import { seedContentItems } from "@/lib/content-seeder";
import { seedConferences } from "@/lib/conferences-seeder";
import { Terminal, Database, Trash2, BellPlus, CheckCircle, RefreshCw, LogIn } from "lucide-react";
import consultantsData from "@/lib/consultants.json";
import { Consultant } from "@/lib/consultants";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import React from "react";

export function DemoControlsModal({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) {
  const { addNotification } = useNotifications();
  const { toast } = useToast();

  const [counts, setCounts] = useState({ consultants: 0, contentItems: 0, conferences: 0, guestEmails: 0, rsvps: 0, notifyList: 0 });

  const updateCounts = useCallback(() => {
    setCounts({
      consultants: consultantsData.length || 0,
      contentItems: getLocal<any[]>("contentItems")?.length || 0,
      conferences: getLocal<any[]>("conferences")?.length || 0,
      guestEmails: getLocal<any[]>("leads")?.length || 0,
      rsvps: getLocal<any[]>("rsvps")?.length || 0,
      notifyList: getLocal<string[]>("notifyList")?.length || 0,
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      updateCounts();
    }
  }, [isOpen, updateCounts]);

  const handleSeedData = () => {
    localStorage.removeItem("content_seeded");
    localStorage.removeItem("conferences_seeded");
    seedContentItems();
    seedConferences();
    updateCounts();
    window.location.reload();
  };

  const handleClearStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };
  
  const handleSimulateNotification = () => {
      addNotification({
          title: 'Test Notification',
          body: 'This is a test notification generated from the demo panel.',
          category: 'system',
      })
  }

  const handleAcceptCookies = () => {
      setLocal('cookieConsent', {
        necessary: true,
        analytics: true,
        marketing: true,
        setAt: new Date().toISOString()
      });
      window.location.reload();
  }

  const handleSimulateOnline = () => {
    const notifyList = getLocal<string[]>("notifyList") || [];
    if (notifyList.length === 0) {
      toast({
        title: "Notify List Empty",
        description: "Add a consultant to your notify list first.",
      });
      return;
    }

    const consultantIdToBringOnline = notifyList[0];
    const consultant = consultantsData.find(c => c.id === consultantIdToBringOnline);

    if (consultant) {
        toast({
            title: `${consultant.nameAlias} is online!`,
            description: "They are now available for a session.",
            action: (
                <Button asChild size="sm">
                    <Link href={`/consultant/${consultant.slug}`}>Start Now</Link>
                </Button>
            )
        });
        const updatedNotifyList = notifyList.filter(id => id !== consultantIdToBringOnline);
        setLocal("notifyList", updatedNotifyList);
        updateCounts();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mx-auto mb-4">
                <Terminal className="h-6 w-6 text-primary" />
            </div>
          <DialogTitle className="text-center">Demo Controls</DialogTitle>
          <DialogDescription className="text-center">
            Use these controls to simulate different states for demonstration purposes.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2 my-4">
          <Button onClick={handleSeedData}><RefreshCw /> Seed Demo Data</Button>
          <Button variant="destructive" onClick={handleClearStorage}><Trash2 /> Clear Storage</Button>
          <Button variant="outline" onClick={handleSimulateNotification}><BellPlus /> Test Notification</Button>
          <Button variant="outline" onClick={handleSimulateOnline}><LogIn /> Simulate Online</Button>
          <Button variant="outline" className="col-span-2" onClick={handleAcceptCookies}><CheckCircle /> Mark Cookies Accepted</Button>
        </div>
        <DialogFooter className="!flex-col gap-2 border-t pt-4">
            <h3 className="font-semibold text-center text-sm text-foreground">Local Storage Counts</h3>
            <div className="flex justify-around text-xs text-muted-foreground text-center flex-wrap gap-2">
                <div>
                    <p className="font-bold text-lg text-primary">{counts.consultants}</p>
                    <p>Consultants</p>
                </div>
                <div>
                    <p className="font-bold text-lg text-primary">{counts.contentItems}</p>
                    <p>Content</p>
                </div>
                <div>
                    <p className="font-bold text-lg text-primary">{counts.conferences}</p>
                    <p>Conferences</p>
                </div>
                <div>
                    <p className="font-bold text-lg text-primary">{counts.guestEmails}</p>
                    <p>Leads</p>
                </div>
                <div>
                    <p className="font-bold text-lg text-primary">{counts.rsvps}</p>
                    <p>RSVPs</p>
                </div>
                 <div>
                    <p className="font-bold text-lg text-primary">{counts.notifyList}</p>
                    <p>Notify List</p>
                </div>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
