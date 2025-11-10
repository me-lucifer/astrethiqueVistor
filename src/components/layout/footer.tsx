
"use client";

import Link from "next/link";
import { Gem, Twitter, Facebook, Instagram, Linkedin } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/translations";

const socialLinks = [
  { href: "#", icon: Twitter, label: "Twitter" },
  { href: "#", icon: Facebook, label: "Facebook" },
  { href: "#", icon: Instagram, label: "Instagram" },
  { href: "#", icon: Linkedin, label: "LinkedIn" },
];

export function Footer() {
  const { language } = useLanguage();
  const t = translations[language];

  const footerLinks = [
    { href: "/legal-hub", label: t.legalHub },
    { href: "/pricing", label: t.pricing },
    { href: "/privacy", label: t.privacy },
    { href: "/terms", label: t.terms },
    { href: "/support", label: t.support },
  ];

  return (
    <>
      <footer className="border-t border-border/40 bg-background">
        <div className="container py-8 flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Gem className="h-5 w-5 text-primary" />
            <p className="text-sm text-foreground/60 font-headline">
              {t.copyright}
            </p>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-foreground/60 hover:text-foreground transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex gap-4">
            {socialLinks.map((link) => (
              <Link key={link.label} href={link.href} className="text-foreground/60 hover:text-primary transition-colors" aria-label={`Follow us on ${link.label}`}>
                <link.icon className="h-5 w-5" />
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
