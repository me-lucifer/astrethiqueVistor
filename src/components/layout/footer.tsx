"use client";

import Link from "next/link";
import { Gem } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

const translations = {
  en: {
    legalHub: "Legal Hub",
    rightsReserved: "All rights reserved.",
  },
  fr: {
    legalHub: "Pôle Juridique",
    rightsReserved: "Tous droits réservés.",
  },
};

export function Footer() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <Gem className="h-5 w-5 text-primary" />
          <p className="text-sm text-foreground/60 font-headline">
            &copy; {new Date().getFullYear()} Astrethique. {t.rightsReserved}
          </p>
        </div>
        <nav className="flex gap-4 text-sm">
          <Link href="/legal-hub" className="text-foreground/60 hover:text-foreground transition-colors">
            {t.legalHub}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
