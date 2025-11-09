"use client";

import { useState, useEffect } from "react";
import { getLocal, setLocal } from "@/lib/local";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Cookie, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  useEffect(() => {
    const consent = getLocal("cookieConsent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    const consent = {
      necessary: true,
      analytics: true,
      marketing: true,
      setAt: new Date().toISOString(),
    };
    setLocal("cookieConsent", consent);
    setShowBanner(false);
  };

  const handleOpenManage = () => {
    setShowBanner(false);
    setIsManageModalOpen(true);
  };

  if (!showBanner) {
    return (
        <ManageCookiesModal 
            isOpen={isManageModalOpen}
            onOpenChange={setIsManageModalOpen}
        />
    );
  }

  return (
    <>
        <div className="fixed bottom-4 left-4 z-50">
            <Card className="bg-background/80 backdrop-blur-sm border-border/50 shadow-2xl max-w-sm">
                <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                    <Cookie className="w-5 h-5 text-primary shrink-0" />
                    <p className="text-sm font-semibold text-foreground">
                        We use cookies to improve your experience.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" onClick={handleAccept} className="flex-1">
                    Accept
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleOpenManage} className="flex-1">
                    Manage
                    </Button>
                </div>
                </CardContent>
            </Card>
        </div>
    </>
  );
}

function ManageCookiesModal({isOpen, onOpenChange}: {isOpen: boolean, onOpenChange: (open: boolean) => void}) {
    const [analytics, setAnalytics] = useState(false);
    const [marketing, setMarketing] = useState(false);

    useEffect(() => {
        const consent = getLocal<{analytics: boolean, marketing: boolean}>("cookieConsent");
        if (consent) {
            setAnalytics(consent.analytics);
            setMarketing(consent.marketing);
        }
    }, [isOpen])

    const handleSave = () => {
        const consent = {
            necessary: true,
            analytics,
            marketing,
            setAt: new Date().toISOString()
        };
        setLocal("cookieConsent", consent);
        onOpenChange(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Manage Cookie Preferences</DialogTitle>
                    <DialogDescription>
                        You can enable or disable different types of cookies below.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <Label htmlFor="necessary-cookies" className="font-semibold">
                            Strictly Necessary
                        </Label>
                        <Switch id="necessary-cookies" checked disabled />
                    </div>
                     <div className="flex items-center justify-between p-3 rounded-lg border">
                        <Label htmlFor="analytics-cookies">
                            Analytics
                        </Label>
                        <Switch id="analytics-cookies" checked={analytics} onCheckedChange={setAnalytics}/>
                    </div>
                     <div className="flex items-center justify-between p-3 rounded-lg border">
                        <Label htmlFor="marketing-cookies">
                           Marketing
                        </Label>
                        <Switch id="marketing-cookies" checked={marketing} onCheckedChange={setMarketing}/>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave} className="w-full">Save Preferences</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

}
