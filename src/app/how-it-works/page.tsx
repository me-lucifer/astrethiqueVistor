
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Search, CalendarClock, Wallet, Star } from "lucide-react";

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState("visitor");

  const visitorSteps = [
    {
      icon: Search,
      title: "Discover & filter",
      description: "Filter by specialty, consultation type, language, rating, and availability.",
      ctas: [
        { label: "Discover", href: "/discover" },
        { label: "Content Hub", href: "/content-hub" },
      ],
    },
    {
      icon: CalendarClock,
      title: "Start now or schedule",
      description: "Chat, audio, or video. Start instantly or book a slot—times auto-convert.",
      ctas: [
        { label: "Start now", href: "/discover" },
        { label: "Schedule", href: "/discover" },
      ],
    },
    {
      icon: Wallet,
      title: "Wallet & Budget",
      description: "Prepaid wallet with a live per-minute meter. Optional Budget Lock.",
      ctas: [
        { label: "Manage wallet", href: "/wallet" },
        { label: "Budget Lock", href: "/wallet" },
      ],
    },
    {
      icon: Star,
      title: "Review & continue",
      description: "Invoice by email after every session. Rate, comment, and favorite.",
      ctas: [
        { label: "My invoices", href: "/appointments" },
        { label: "My favorites", href: "/discover?myFavorites=true" },
      ],
    },
  ];

  const VisitorContent = () => (
    <div className="mt-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visitorSteps.map((step) => (
          <Card key={step.title} className="group hover:shadow-lg hover:shadow-primary/10 transition-shadow bg-card/50 flex flex-col">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full border border-primary/20">
                        <step.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-lg">{step.title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/80">{step.description}</p>
            </CardContent>
            <CardFooter className="mt-auto pt-4">
              <div className="flex flex-wrap gap-2">
                {step.ctas.map((cta) => (
                  <Link key={cta.label} href={cta.href}>
                    <Badge variant="secondary" className="hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer">{cta.label}</Badge>
                  </Link>
                ))}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );

  const ConsultantContent = () => (
    <div className="mt-8 p-8 border-2 border-dashed border-border rounded-lg w-full min-h-[40vh] flex items-center justify-center">
        <p className="text-foreground/60">Consultant content to be added here...</p>
    </div>
  );

  return (
    <div className="container py-16 max-w-7xl">
      <div className="flex flex-col items-center text-center gap-4 mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          How it works
        </h1>
        <p className="text-lg text-foreground/80 max-w-3xl">
          Book vetted consultants in minutes. Transparent per-minute billing,
          optional budget lock, timezone-smart scheduling, and GDPR-respectful
          privacy.
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
          <Button
            onClick={() => setActiveTab("visitor")}
            variant={activeTab === "visitor" ? "background" : "ghost"}
            className={cn("px-6", activeTab === 'visitor' && 'shadow-sm')}
          >
            For Visitors
          </Button>
          <Button
            onClick={() => setActiveTab("consultant")}
            variant={activeTab === "consultant" ? "background" : "ghost"}
            className={cn("px-6", activeTab === 'consultant' && 'shadow-sm')}
          >
            For Consultants
          </Button>
        </div>
      </div>

      <div>
        {activeTab === "visitor" ? <VisitorContent /> : <ConsultantContent />}
      </div>
    </div>
  );
}
