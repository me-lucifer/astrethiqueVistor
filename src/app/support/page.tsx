
"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle, CalendarClock, User, Wallet, Tv, Languages, Shield, Wrench, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SupportContactForm } from "@/components/support/contact-form";
import { SystemStatus } from "@/components/support/system-status";
import { ReportingCta } from "@/components/support/reporting-cta";

const visitorTopics = [
    { id: "faq-bookings", href: "#faq-bookings", title: "Bookings & Sessions", description: "Help with scheduling, session types, and cancellations.", icon: CalendarClock },
    { id: "faq-account", href: "#faq-account", title: "Account & Login", description: "Manage your profile, password, and login issues.", icon: User },
    { id: "faq-billing", href: "#faq-billing", title: "Billing & Pricing", description: "Understand per-minute rates, wallet, and payments.", icon: Wallet },
    { id: "faq-conferences", href: "#faq-conferences", title: "Conferences & Replays", description: "Questions about free events, RSVPs, and recordings.", icon: Tv },
    { id: "faq-content", href: "#faq-content", title: "Content Hub", description: "Find articles, podcasts, and manage your bookmarks.", icon: Wrench },
    { id: "faq-language", href: "#faq-language", title: "Language & Timezones", description: "Settings for language, region, and notifications.", icon: Languages },
    { id: "faq-safety", href: "#faq-safety", title: "Trust, Safety & Reporting", description: "Report issues, understand content moderation.", icon: Shield },
    { id: "faq-technical", href: "#faq-technical", title: "Technical Issues", description: "Troubleshoot chat, audio, or video problems.", icon: Wrench },
];

const consultantTopics = [
    { id: "faq-availability", href: "#faq-availability", title: "Availability & Scheduling", description: "Manage your calendar, session types, and bookings.", icon: CalendarClock },
    { id: "faq-account-consultant", href: "#faq-account-consultant", title: "Profile & Account", description: "Update your bio, specialties, and account details.", icon: User },
    { id: "faq-billing-consultant", href: "#faq-billing-consultant", title: "Payouts & Invoices", description: "Understand earnings, invoice acceptance, and payouts.", icon: Wallet },
    { id: "faq-conferences-consultant", href: "#faq-conferences-consultant", title: "Hosting Conferences", description: "Propose and manage live events for the community.", icon: Tv },
    { id: "faq-content-consultant", href: "#faq-content-consultant", title: "Publishing Content", description: "Submit articles/podcasts and understand the approval flow.", icon: Wrench },
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
        { 
            id: "faq-bookings", 
            title: "Bookings & Sessions", 
            questions: [
                { q: "Can I cancel or reschedule a booking?", a: "Yes, you can cancel or reschedule up to 24 hours before a session from your 'My Appointments' page. Please check the consultant's specific cancellation policy, as some may differ." },
                { q: "How does per-minute billing work during a live session?", a: "You are only charged for the time you are actively connected with a consultant. Your prepaid wallet balance is updated in real-time, and the session ends automatically if your balance runs out." },
                { q: "What if the consultant doesn’t join on time?", a: "If a consultant is more than 5 minutes late, the session is automatically canceled and you will not be charged. You are free to book with another available consultant." },
                { q: "How do timezones and reminders work?", a: "All times shown on the platform are automatically converted to your local timezone. You can manage your notification preferences for reminders in your account settings or on the specific event page." },
                { q: "Can I request a specific consultant?", a: "Yes, you can browse and filter consultants on our 'Discover' page to find the one that best suits your needs." }
            ]
        },
        { 
            id: "faq-account", 
            title: "Account & Login", 
            questions: [
                { q: "I didn’t receive the verification email.", a: "Please check your spam or junk folder. If you still can't find it, try resending the verification email from your account settings. If the issue persists, contact our support team." },
                { q: "How do I change my email or display name?", a: "You can update your display name and other profile information in your account settings page." },
                { q: "How do I delete my account?", a: "To delete your account, please go to your account settings and select 'Delete Account'. Please note that this action is irreversible." }
            ] 
        },
        { 
            id: "faq-billing", 
            title: "Billing & Pricing", 
            questions: [
                { q: "Where can I see my wallet balance and receipts?", a: "Your current wallet balance is visible in your account dashboard. A full history of your transactions and receipts for every session are available in the 'Billing' section." },
                { q: "How do promotions/discounts apply?", a: "Promotional rates from consultants are applied automatically. Any discount codes can be entered at the time of topping up your wallet." },
                { q: "What is Budget Lock?", a: "Budget Lock is an optional feature that helps you manage your spending by preventing you from exceeding a monthly amount that you set. You can manage this in your wallet settings." }
            ] 
        },
        {
            id: "faq-conferences",
            title: "Conferences & Replays",
            questions: [
                 { q: "Are conferences free?", a: "Yes, all live conferences are free to attend. Just RSVP to save your spot!" },
                 { q: "Are replays available for conferences?", a: "Availability of replays depends on the host and is mentioned on the conference detail page. If available, replays can be accessed for a limited time after the event." },
            ]
        },
        {
            id: "faq-content",
            title: "Content Hub",
            questions: [
                { q: "How do I comment on articles/podcasts?", a: "You need to be logged into your account to post comments. If you're logged in, a comment box will appear below the content." }
            ]
        },
        {
            id: "faq-technical",
            title: "Technical Issues",
            questions: [
                { q: "My microphone/camera is not detected.", a: "Please ensure you have granted camera and microphone permissions to your browser for our site. You may need to check your browser settings and refresh the page. Also, ensure no other application is using your camera." },
                { q: "My messages are not sending in chat.", a: "First, check your internet connection. If your connection is stable, try refreshing the page. If the problem continues, please contact our technical support team through the help widget." }
            ]
        }
    ],
    consultant: [
        { 
            id: "faq-availability", 
            title: "Availability & Scheduling", 
            questions: [
                { q: "How do I set my working hours and blackout dates?", a: "You can manage your entire schedule from the 'Availability' tab in your consultant dashboard. Set recurring weekly hours, add specific one-off slots, and block out dates for vacation or personal time." },
                { q: "What are some timezone tips?", a: "Set your primary timezone in your profile. All booking requests will be shown to you in your timezone, and to clients in theirs. We handle all conversions automatically to prevent confusion." }
            ]
        },
        { 
            id: "faq-billing-consultant", 
            title: "Rates, Wallet & Payouts", 
            questions: [
                { q: "How often can I change my per-minute rate?", a: "You can adjust your per-minute rate once every 30 days. This policy ensures price stability for clients while giving you flexibility." },
                { q: "What is the monthly payout timeline?", a: "On the 1st of each month, an invoice for the previous month's earnings is generated. You must review and approve it in your dashboard by the 15th. Approved funds are then transferred to your wallet for payout." }
            ] 
        },
        { 
            id: "faq-conferences-consultant", 
            title: "Promotions & Visibility", 
            questions: [
                { q: "How do promotions affect Discover sorting?", a: "Running a promotion gives your profile a temporary boost in our 'Recommended' sort order on the Discover page, increasing your visibility to potential clients." },
                { q: "Why is my profile is hidden in some regions?", a: "Our platform uses 'language gating.' Your profile is only shown to users in regions that speak the languages you have listed in your profile. This ensures clients can connect with consultants they can understand." }
            ] 
        },
        {
            id: "faq-content-consultant",
            title: "Content & Conferences",
            questions: [
                 { q: "How do I publish articles or podcasts?", a: "You can submit articles and podcast ideas through your dashboard. For podcasts, we require a link to the content hosted on YouTube. All content is reviewed by our team before being published." },
                 { q: "How do I host a conference?", a: "Propose a conference topic and preferred dates via the 'Conferences' section in your dashboard. Our team will work with you to schedule and promote the event. Replays are optional and can be enabled upon request." },
            ]
        },
        {
            id: "faq-safety-consultant",
            title: "Compliance & Trust",
            questions: [
                { q: "What are the KYC/ID verification steps?", a: "To ensure a trusted marketplace, all consultants must complete a Know Your Customer (KYC) process by submitting a valid government-issued ID through our secure portal. This is a one-time process." },
                { q: "How are user reports and content moderation handled?", a: "We have a dedicated team that reviews all user reports for profiles and content. We take action based on our community guidelines, which may include content removal or account suspension." }
            ]
        }
    ]
}


export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<"visitor" | "consultant">("visitor");
  const [searchQuery, setSearchQuery] = useState("");

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
          <SystemStatus />
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
            <a key={topic.id} href={topic.href} className="block">
              <Card className="group h-full hover:shadow-lg hover:shadow-primary/10 transition-shadow bg-card/50 flex flex-col">
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
                  <span className="text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Browse FAQs
                  </span>
                </CardFooter>
              </Card>
            </a>
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
        
        <ReportingCta />

        <div id="contact-support" className="mt-24 pt-16 border-t scroll-mt-24">
             <h2 className="text-center font-headline text-3xl font-bold mb-4">
                Still need help?
            </h2>
            <p className="text-center text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
                If you couldn't find your answer in the FAQs, please submit a ticket and our support team will get back to you.
            </p>
            <SupportContactForm activeTab={activeTab} />
        </div>
    </div>
  );
}
