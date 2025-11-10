
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

function StickyCtaFooter() {
    return (
        <div className="hidden lg:block fixed bottom-0 left-0 right-0 z-40">
             <div className="container">
                <div className="mb-4 bg-card/95 backdrop-blur-sm border rounded-lg p-4 flex justify-between items-center shadow-2xl">
                    <p className="font-semibold text-card-foreground">Ready to begin your journey?</p>
                    <div className="flex items-center gap-2">
                        <Button asChild>
                            <Link href="/discover">
                                Discover consultants
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild variant="secondary">
                            <Link href="/register">Create account</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function Footer() {
  return (
    <>
      <div className="h-28 hidden lg:block" /> {/* Spacer for sticky footer */}
      <StickyCtaFooter />
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
