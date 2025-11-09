"use client";

import Link from "next/link";
import { Gem, Twitter, Facebook, Instagram, Linkedin } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

const translations = {
  en: {
    rightsReserved: "All rights reserved.",
    legalHub: "Legal Hub",
    pricing: "Pricing",
    privacy: "Privacy (GDPR)",
    terms: "Terms",
    support: "Support",
  },
  fr: {
    rightsReserved: "Tous droits réservés.",
    legalHub: "Pôle Juridique",
    pricing: "Tarifs",
    privacy: "Confidentialité (RGPD)",
    terms: "Conditions",
    support: "Support",
  },
};

const footerLinks = (t: any) => [
  { href: "/legal-hub", label: t.legalHub },
  { href: "/pricing", label: t.pricing },
  { href: "/privacy", label: t.privacy },
  { href: "/terms", label: t.terms },
  { href: "/support", label: t.support },
];

const socialLinks = [
  { href: "#", icon: Twitter },
  { href: "#", icon: Facebook },
  { href: "#", icon: Instagram },
  { href: "#", icon: Linkedin },
];

export function Footer() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container py-8 flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <Gem className="h-5 w-5 text-primary" />
          <p className="text-sm text-foreground/60 font-headline">
            &copy; 2025 ASTRETHIQUE. {t.rightsReserved}
          </p>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          {footerLinks(t).map((link) => (
            <Link key={link.href} href={link.href} className="text-foreground/60 hover:text-foreground transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex gap-4">
          {socialLinks.map((link, i) => (
             <Link key={i} href={link.href} className="text-foreground/60 hover:text-primary transition-colors">
              <link.icon className="h-5 w-5" />
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
