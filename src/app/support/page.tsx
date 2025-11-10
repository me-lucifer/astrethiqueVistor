
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, CircleDot, HelpCircle, CalendarClock, User, Wallet, Tv, Languages, Shield, Wrench } from "lucide-react";
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

const visitorTopics = [
    { href: "#faq-bookings", title: "Bookings & Sessions", description: "Help with scheduling, session types, and cancellations.", icon: CalendarClock },
    { href: "#faq-account", title: "Account & Login", description: "Manage your profile, password, and login issues.", icon: User },
    { href: "#faq-billing", title: "Billing & Pricing", description: "Understand per-minute rates, wallet, and payments.", icon: Wallet },
    { href: "#faq-conferences", title: "Conferences & Replays", description: "Questions about free events, RSVPs, and recordings.", icon: Tv },
    { href: "#faq-content", title: "Content Hub", description: "Find articles, podcasts, and manage your bookmarks.", icon: HelpCircle },
    { href: "#faq-language", title: "Language & Timezones", description: "Settings for language, region, and notifications.", icon: Languages },
    { href: "#faq-safety", title: "Trust, Safety & Reporting", description: "Report issues, understand content moderation.", icon: Shield },
    { href: "#faq-technical", title: "Technical Issues", description: "Troubleshoot chat, audio, or video problems.", icon: Wrench },
];

const consultantTopics = [
    { href: "#faq-availability", title: "Availability & Scheduling", description: "Manage your calendar, session types, and bookings.", icon: CalendarClock },
    { href: "#faq-account", title: "Profile & Account", description: "Update your bio, specialties, and account details.", icon: User },
    { href: "#faq-billing", title: "Payouts & Invoices", description: "Understand earnings, invoice acceptance, and payouts.", icon: Wallet },
    { href: "#faq-conferences", title: "Hosting Conferences", description: "Propose and manage live events for the community.", icon: Tv },
    { href: "#faq-content", title: "Publishing Content", description: "Submit articles/podcasts and understand the approval flow.", icon: HelpCircle },
    { href: "#faq-language", title: "Language & Visibility", description: "Understand how language gating affects your profile visibility.", icon: Languages },
    { href: "#faq-safety", title: "Trust, Safety & Vetting", description: "Our policies on KYC, content moderation, and disputes.", icon: Shield },
    { href="#faq-technical", title: "Technical Best Practices", description: "Tips for ensuring smooth chat, audio, and video sessions.", icon: Wrench },
];


export default function SupportPage() {
  const [activeTab, setActiveTab] = useState("visitor");
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

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

      {/* Content sections will go here, dependent on activeTab */}
      <div className="p-8 border-2 border-dashed border-border rounded-lg w-full min-h-[40vh] flex items-center justify-center">
          <p className="text-foreground/60">{activeTab === 'visitor' ? 'Visitor content coming soon...' : 'Consultant content coming soon...'}</p>
        </div>

    </div>
  );
}
