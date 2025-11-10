
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, CircleDot, HelpCircle, CalendarClock, User, Wallet, Tv, Languages, Shield, Wrench, Search, Star, FileText, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const visitorTopics = [
    { id: "faq-bookings", href: "#faq-bookings", title: "Bookings & Sessions", description: "Help with scheduling, session types, and cancellations.", icon: CalendarClock },
    { id: "faq-account", href: "#faq-account", title: "Account & Login", description: "Manage your profile, password, and login issues.", icon: User },
    { id: "faq-billing", href: "#faq-billing", title: "Billing & Pricing", description: "Understand per-minute rates, wallet, and payments.", icon: Wallet },
    { id: "faq-conferences", href: "#faq-conferences", title: "Conferences & Replays", description: "Questions about free events, RSVPs, and recordings.", icon: Tv },
    { id: "faq-content", href: "#faq-content", title: "Content Hub", description: "Find articles, podcasts, and manage your bookmarks.", icon: HelpCircle },
    { id: "faq-language", href: "#faq-language", title: "Language & Timezones", description: "Settings for language, region, and notifications.", icon: Languages },
    { id: "faq-safety", href: "#faq-safety", title: "Trust, Safety & Reporting", description: "Report issues, understand content moderation.", icon: Shield },
    { id: "faq-technical", href: "#faq-technical", title: "Technical Issues", description: "Troubleshoot chat, audio, or video problems.", icon: Wrench },
];

const consultantTopics = [
    { id: "faq-availability", href: "#faq-availability", title: "Availability & Scheduling", description: "Manage your calendar, session types, and bookings.", icon: CalendarClock },
    { id: "faq-account-consultant", href: "#faq-account-consultant", title: "Profile & Account", description: "Update your bio, specialties, and account details.", icon: User },
    { id: "faq-billing-consultant", href: "#faq-billing-consultant", title: "Payouts & Invoices", description: "Understand earnings, invoice acceptance, and payouts.", icon: Wallet },
    { id: "faq-conferences-consultant", href: "#faq-conferences-consultant", title: "Hosting Conferences", description: "Propose and manage live events for the community.", icon: Tv },
    { id: "faq-content-consultant", href: "#faq-content-consultant", title: "Publishing Content", description: "Submit articles/podcasts and understand the approval flow.", icon: HelpCircle },
    { id: "faq-language-consultant", href: "#faq-language-consultant", title: "Language & Visibility", description: "Understand how language gating affects your profile visibility.", icon: Languages },
    { id: "faq-safety-consultant", href: "#faq-safety-consultant", title: "Trust, Safety & Vetting", description: "Our policies on KYC, content moderation, and disputes.", icon: Shield },
    { id: "faq-technical-consultant", href: "#faq-technical-consultant", title: "Technical Best Practices", description: "Tips for ensuring smooth chat, audio, and video sessions.", icon: Wrench },
];

const visitorQuickLinks = [
    { label: "Discover consultants", href: "/discover"},
    { label: "Free conferences", href: "/conferences"},
    { label: "How it works", href: "/how-it-works"},
    { label: "Pricing", href: "/pricing"},
    { label: "Privacy (GDPR)", href: "/privacy"},
    { label: "Terms", href: "/terms"},
];

const consultantQuickLinks = [
    { label: "Set availability", href: "/consultant/dashboard/availability"},
    { label: "Create a promotion", href: "/consultant/dashboard/promotions"},
    { label: "Download invoices", href: "/consultant/dashboard/payouts"},
    { label: "How it works (Consultants)", href: "/how-it-works"},
    { label: "Pricing", href: "/pricing"},
    { label: "Privacy (GDPR)", href: "/privacy"},
    { label: "Terms", href: "/terms"},
];

const faqData = {
    visitor: [
        { id: "faq-bookings", title: "Bookings & Sessions", questions: [{ q: "How do I book a session?", a: "Find a consultant on the Discover page and use their calendar." }, { q: "How do I cancel?", a: "Go to your appointments page." }] },
        { id: "faq-account", title: "Account & Login", questions: [{ q: "How do I reset my password?", a: "Use the 'Forgot Password' link on the login page." }] },
        { id: "faq-billing", title: "Billing & Pricing", questions: [{ q: "How does per-minute billing work?", a: "You are only charged for the time you are actively in a session." }] },
    ],
    consultant: [
        { id: "faq-availability", title: "Availability & Scheduling", questions: [{ q: "How do I set my availability?", a: "Go to your consultant dashboard under the 'Availability' tab." }] },
        { id: "faq-account-consultant", title: "Profile & Account", questions: [{ q: "How do I update my profile?", a: "In your dashboard, go to the 'Profile' section." }] },
        { id: "faq-billing-consultant", title: "Payouts & Invoices", questions: [{ q: "When do I get paid?", a: "Payouts are processed monthly." }] },
    ]
}


export default function SupportPage() {
  const [activeTab, setActiveTab] = useState("visitor");
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const StatusItem = ({ service, status }: { service: string, status: 'Operational' | 'Issues' }) => (
    <div className="flex items-center justify-between py-2">
      <p className="text-foreground/90">{service}</p>
      <div className="flex items-center gap-2">
        <div className={cn("h-2.5 w-2.5 rounded-full", status === 'Operational' ? 'bg-success' : 'bg-destructive')} />
        <span className={cn(status === 'Operational' ? 'text-success' : 'text-destructive')}>{status}</span>
      </div>
    </div>
  );
  
  const topics = activeTab === 'visitor' ? visitorTopics : consultantTopics;
  const quickLinks = activeTab === 'visitor' ? visitorQuickLinks : consultantQuickLinks;
  
  const faqSections = useMemo(() => {
    const sourceFaqs = activeTab === 'visitor' ? faqData.visitor : faqData.consultant;
    if (!searchQuery) {
        return sourceFaqs;
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    
    return sourceFaqs.map(section => {
        const filteredQuestions = section.questions.filter(q => 
            q.q.toLowerCase().includes(lowerCaseQuery) || 
            q.a.toLowerCase().includes(lowerCaseQuery)
        );
        return { ...section, questions: filteredQuestions };
    }).filter(section => section.questions.length > 0);
  }, [activeTab, searchQuery]);


  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
        <div className="flex-1 space-y-4">
          <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Support
          </h1>
          <p className="text-lg text-foreground/80 max-w-2xl">
            Get help with bookings, billing, content, or your account. Start with the FAQs or send us a request.
          </p>
        </div>
        <div className="shrink-0">
          <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
            <DialogTrigger asChild>
                <div className="flex items-center gap-4 cursor-pointer group">
                     <div className="flex items-center gap-2 text-sm text-success">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75 motion-reduce:animate-none"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
                        </span>
                        <span>All systems operational</span>
                    </div>
                     <Button variant="link" size="sm" className="p-0">View details</Button>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>System Status</DialogTitle>
                </DialogHeader>
                <div className="divide-y divide-border">
                    <StatusItem service="Chat" status="Operational" />
                    <StatusItem service="Audio/Video" status="Operational" />
                    <StatusItem service="Payments" status="Operational" />
                </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex justify-center mb-12">
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
      
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {topics.map((topic) => (
            <Card key={topic.title} className="group hover:shadow-lg hover:shadow-primary/10 transition-shadow bg-card/50 flex flex-col">
              <CardHeader className="flex-row items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full border border-primary/20 mt-1">
                      <topic.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-base">{topic.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-foreground/70">{topic.description}</p>
              </CardContent>
              <CardFooter>
                 <Button variant="link" asChild className="p-0 text-sm">
                     <Link href={topic.href}>Browse FAQs</Link>
                 </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mb-16">
            <h3 className="text-center font-headline text-lg font-semibold mb-4">Quick Links</h3>
            <div className="flex flex-wrap justify-center gap-2">
                {quickLinks.map(link => (
                    <Button key={link.label} variant="outline" size="sm" asChild>
                        <Link href={link.href}>{link.label}</Link>
                    </Button>
                ))}
            </div>
        </div>

        <div className="mb-12 max-w-2xl mx-auto">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search help topics..."
                    className="pl-12 h-12 text-base w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>
      
        {faqSections.length > 0 ? (
            faqSections.map(section => (
                <div key={section.id} id={section.id} className="mb-12 scroll-mt-24">
                    <h2 className="font-headline text-2xl font-bold mb-4">{section.title}</h2>
                    <Accordion type="single" collapsible className="w-full">
                        {section.questions.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger>{faq.q}</AccordionTrigger>
                                <AccordionContent>{faq.a}</AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            ))
        ) : (
             <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg col-span-full">
                <p className="text-muted-foreground">No results for "{searchQuery}"—try different keywords.</p>
            </div>
        )}

    </div>
  );
}
