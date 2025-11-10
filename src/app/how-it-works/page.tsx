
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Search, CalendarClock, Wallet, Star, Heart, Tv, HelpCircle, ShieldCheck, Languages, BadgeCheck } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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

  const quickLinks = [
    { label: "Discover consultants", href: "/discover", icon: Search },
    { label: "Start instantly", href: "/discover", icon: CalendarClock },
    { label: "Favorites & notes", href: "/discover?myFavorites=true", icon: Heart },
    { label: "Free Conferences", href: "/conferences", icon: Tv },
    { label: "Help Desk", href: "/support", icon: HelpCircle },
  ];

  const trustItems = [
    { icon: BadgeCheck, label: "KYC-verified consultants" },
    { icon: ShieldCheck, label: "GDPR-compliant data" },
    { icon: Wallet, label: "Transparent pricing" },
    { icon: Languages, label: "Language & region smart" },
    { icon: Search, label: "Moderated content" },
  ];
  
  const faqs = [
    {
      question: "Can I cancel or reschedule a session?",
      answer: "Yes, you can typically cancel or reschedule up to 24 hours before your scheduled session time directly from your appointments page. Please check the specific consultant's policy, as some may differ."
    },
    {
      question: "How does per-minute billing work?",
      answer: "You only pay for the time you are connected with a consultant in a live session (chat, audio, or video). The charge is deducted from your prepaid wallet balance, and a live meter is always visible."
    },
    {
      question: "What happens if my wallet runs out mid-session?",
      answer: "The session will automatically end when your wallet balance reaches zero, ensuring you never pay more than you've budgeted. You can easily top up your wallet to continue the session if you wish."
    },
    {
      question: "What is Budget Lock & emergency top-up?",
      answer: "Budget Lock is an optional feature that prevents you from spending over a set monthly amount. If enabled, one pre-approved emergency top-up may be allowed per month for critical situations."
    },
    {
      question: "Are timezones and languages handled automatically?",
      answer: "Yes, all scheduling and availability are automatically converted to your local timezone. You can also filter consultants by the languages they speak to ensure clear communication."
    },
    {
      question: "Can I record my session?",
      answer: "For privacy and safety reasons, we do not permit session recordings by either party. This ensures a confidential and secure space for both you and the consultant."
    },
    {
      question: "Are live conferences free to attend?",
      answer: "Yes, all live conferences listed on our platform are free to attend. Simply RSVP to reserve your spot and receive reminders."
    },
    {
      question: "How do I get invoices and receipts?",
      answer: "After every paid session, a detailed invoice is automatically sent to your registered email address. You can also view your full session history and invoices in your account dashboard."
    }
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
      
      <div className="mt-16 grid lg:grid-cols-2 gap-12 items-start">
        <div>
          <h3 className="font-headline text-2xl font-bold mb-6">Quick Links</h3>
          <div className="space-y-3">
            {quickLinks.map(link => (
              <Link key={link.label} href={link.href}>
                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors">
                  <link.icon className="h-5 w-5 text-primary" />
                  <span className="font-medium">{link.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-headline text-2xl font-bold mb-6">What to Expect</h3>
          <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>Before your session</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-5 space-y-2 text-foreground/80">
                  <li>Check the consultant's profile, including their bio, specialties, and reviews.</li>
                  <li>Ensure your device has a stable internet connection for a smooth experience.</li>
                  <li>Prepare a few questions or topics you wish to discuss to make the most of your time.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>During your session</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-5 space-y-2 text-foreground/80">
                  <li>Be open and honest to receive the most accurate guidance.</li>
                  <li>A live per-minute meter will be visible, so you can track your spending.</li>
                  <li>Feel free to ask for clarification if you don't understand something.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>After your session</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-5 space-y-2 text-foreground/80">
                  <li>You will receive an email with a detailed invoice.</li>
                  <li>Take a moment to rate and review your consultant to help others.</li>
                  <li>Add the consultant to your favorites for easy access next time.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
      
      <div className="mt-16">
         <h3 className="font-headline text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h3>
         <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
        <div className="text-center mt-6">
            <Button asChild variant="outline">
                <Link href="/support">Read all FAQs</Link>
            </Button>
        </div>
      </div>

      <div className="mt-16 border-t pt-10">
        <h3 className="font-headline text-2xl font-bold text-center mb-8">Trust &amp; Safety</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
            {trustItems.map(item => (
                <div key={item.label} className="flex flex-col items-center gap-3">
                    <div className="bg-primary/10 p-3 rounded-full border border-primary/20">
                        <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-foreground/90">{item.label}</p>
                </div>
            ))}
        </div>
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
