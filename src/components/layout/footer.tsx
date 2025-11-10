
"use client";

import Link from "next/link";
import { Gem, Twitter, Facebook, Instagram, Linkedin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const footerLinks = [
  { href: "/legal-hub", label: "Legal Hub" },
  { href: "/pricing", label: "Pricing" },
  { href: "/privacy", label: "Privacy (GDPR)" },
  { href: "/terms", label: "Terms" },
  { href: "/support", label: "Support" },
];

const socialLinks = [
  { href: "#", icon: Twitter },
  { href: "#", icon: Facebook },
  { href: "#", icon: Instagram },
  { href: "#", icon: Linkedin },
];

export function Footer() {
  return (
    <>
      <footer className="border-t border-border/40 bg-background">
        <div className="container py-8 flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Gem className="h-5 w-5 text-primary" />
            <p className="text-sm text-foreground/60 font-headline">
              &copy; 2025 ASTRETHIQUE. All rights reserved.
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
            {socialLinks.map((link, i) => (
              <Link key={i} href={link.href} className="text-foreground/60 hover:text-primary transition-colors">
                <link.icon className="h-5 w-5" />
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
