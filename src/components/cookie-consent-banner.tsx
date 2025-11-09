"use client";

import { useState, useEffect } from "react";
import { getSession, setSession } from "@/lib/session";
import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Cookie } from "lucide-react";

const translations = {
  en: {
    message: "We use cookies to enhance your experience. Learn more in our",
    privacyPolicy: "privacy policy",
    manage: "Manage",
    accept: "Accept",
  },
  fr: {
    message: "Nous utilisons des cookies pour améliorer votre expérience. En savoir plus dans notre",
    privacyPolicy: "politique de confidentialité",
    manage: "Gérer",
    accept: "Accepter",
  },
};

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    // We need to check if language is available before rendering
    if (!language) return;

    const consent = getSession("cookies");
    if (consent === null) {
      setShowBanner(true);
    }
  }, [language]);

  const handleAccept = () => {
    setSession("cookies", "accepted");
    setShowBanner(false);
  };

  const handleDecline = () => {
    setSession("cookies", "declined");
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <Card className="bg-background/80 backdrop-blur-sm border-border/50 shadow-2xl">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
             <Cookie className="w-6 h-6 text-primary hidden sm:block" />
            <p className="text-sm text-foreground/80">
              {t.message}{" "}
              <Link href="/privacy" className="underline text-primary hover:text-primary/80">
                {t.privacyPolicy}
              </Link>.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={handleDecline}>
              {t.manage}
            </Button>
            <Button size="sm" onClick={handleAccept}>
              {t.accept}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
