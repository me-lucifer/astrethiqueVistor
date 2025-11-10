
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, FileText, Shield, User, Database, Globe, Scale, CircleUser, Info, Calendar, Gavel, AlertTriangle, Wallet, Copyright, UserX, Power, Mail, Euro, Cookie, Tv, Wrench, CalendarOff, Users, Handshake, MessageSquare, Megaphone, Flag, LifeBuoy, UserCheck, Clock, Lock, ServerCog, DatabaseZap } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { PlaceholderPage } from "@/components/placeholder-page";


const PrivacyPolicyContent = () => {
    const { language } = useLanguage();
    const t = translations[language].privacyPolicy;

    const sections = [
        { id: "data-controller", title: t.dataController.title, icon: Shield },
        { id: "data-we-collect", title: t.dataWeCollect.title, icon: User },
        { id: "why-we-process", title: t.whyWeProcess.title, icon: Database },
        { id: "international-transfers", title: t.internationalTransfers.title, icon: Globe },
        { id: "data-retention", title: t.dataRetention.title, icon: Calendar },
        { id: "your-rights", title: t.yourRights.title, icon: Scale },
        { id: "other-info", title: t.otherInfo.title, icon: Info },
    ];
    
    const [activeSection, setActiveSection] = useState("data-controller");

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, { rootMargin: "-50% 0px -50% 0px" });

        sections.forEach(section => {
            const el = document.getElementById(section.id);
            if (el) observer.observe(el);
        });

        return () => {
            sections.forEach(section => {
                const el = document.getElementById(section.id);
                if (el) observer.unobserve(el);
            });
        };
    }, [sections]);

    const lastUpdated = new Date("2024-07-26T10:00:00Z");

    return (
        <div className="container py-12">
            <div className="flex justify-between items-start mb-6 gap-4">
                <div>
                    <Button asChild variant="ghost" className="-ml-4">
                        <Link href="/legal-hub">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {translations[language].legalHub}
                        </Link>
                    </Button>
                    <h1 className="font-headline text-3xl md:text-4xl font-bold mt-2">{t.title}</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <p className="text-sm text-muted-foreground">
                            {t.lastUpdated}: {format(lastUpdated, language === 'fr' ? 'dd MMMM yyyy' : 'MMMM dd, yyyy')}
                        </p>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Updated</Badge>
                    </div>
                </div>
                 <Button variant="ghost" className="hidden md:inline-flex">
                    <Printer className="mr-2 h-4 w-4" />
                    {t.printDownload}
                </Button>
            </div>
            
            <div className="grid lg:grid-cols-[1fr_280px] gap-12 items-start">
                <div className="prose prose-invert max-w-none text-foreground/80 prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80">
                    <Accordion type="multiple" defaultValue={sections.map(s => s.id)} className="w-full">
                        
                        <AccordionItem value="data-controller" id="data-controller">
                            <AccordionTrigger className="text-xl font-headline">{t.dataController.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.dataController.content[0]}</p>
                                <ul className="list-none p-0">
                                    <li><strong>{t.dataController.address}:</strong> ASTRETHIQUE LTD, 221B Baker Street, London NW1 6XE, United Kingdom</li>
                                    <li><strong>{t.dataController.email}:</strong> <a href="mailto:privacy@astrethique.com">privacy@astrethique.com</a></li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="data-we-collect" id="data-we-collect">
                             <AccordionTrigger className="text-xl font-headline">{t.dataWeCollect.title}</AccordionTrigger>
                            <AccordionContent>
                               <p>{t.dataWeCollect.intro}</p>
                                <ul>
                                    <li><strong>{t.dataWeCollect.accountInfo.title}:</strong> {t.dataWeCollect.accountInfo.text}</li>
                                    <li><strong>{t.dataWeCollect.kyc.title}:</strong> {t.dataWeCollect.kyc.text}</li>
                                    <li><strong>{t.dataWeCollect.usage.title}:</strong> {t.dataWeCollect.usage.text}</li>
                                    <li><strong>{t.dataWeCollect.payments.title}:</strong> {t.dataWeCollect.payments.text}</li>
                                    <li><strong>{t.dataWeCollect.content.title}:</strong> {t.dataWeCollect.content.text}</li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="why-we-process" id="why-we-process">
                            <AccordionTrigger className="text-xl font-headline">{t.whyWeProcess.title}</AccordionTrigger>
                            <AccordionContent>
                               <p>{t.whyWeProcess.intro}</p>
                                <ul>
                                    <li><strong>{t.whyWeProcess.contract.title}:</strong> {t.whyWeProcess.contract.text}</li>
                                    <li><strong>{t.whyWeProcess.consent.title}:</strong> {t.whyWeProcess.consent.text}</li>
                                    <li><strong>{t.whyWeProcess.legitInterests.title}:</strong> {t.whyWeProcess.legitInterests.text}</li>
                                    <li><strong>{t.whyWeProcess.legalObligation.title}:</strong> {t.whyWeProcess.legalObligation.text}</li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                        
                         <AccordionItem value="international-transfers" id="international-transfers">
                             <AccordionTrigger className="text-xl font-headline">{t.internationalTransfers.title}</AccordionTrigger>
                            <AccordionContent>
                               <p>{t.internationalTransfers.content[0]}</p>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="data-retention" id="data-retention">
                            <AccordionTrigger className="text-xl font-headline">{t.dataRetention.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.dataRetention.intro}</p>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t.dataRetention.table.category}</TableHead>
                                            <TableHead>{t.dataRetention.table.window}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {t.dataRetention.table.rows.map((row, i) => (
                                            <TableRow key={i}>
                                                <TableCell>{row.category}</TableCell>
                                                <TableCell>{row.window}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="your-rights" id="your-rights">
                             <AccordionTrigger className="text-xl font-headline">{t.yourRights.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.yourRights.intro}</p>
                                <ul>
                                    {t.yourRights.rightsList.map((right: string, i: number) => <li key={i}>{right}</li>)}
                                </ul>
                                <h4>{t.yourRights.howToExercise.title}</h4>
                                <p>
                                    {t.yourRights.howToExercise.text[0]} <a href="mailto:privacy@astrethique.com">privacy@astrethique.com</a>.
                                </p>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="other-info" id="other-info">
                             <AccordionTrigger className="text-xl font-headline">{t.otherInfo.title}</AccordionTrigger>
                            <AccordionContent>
                                <h4>{t.otherInfo.agePolicy.title}</h4>
                                <p>{t.otherInfo.agePolicy.text}</p>
                                <h4>{t.otherInfo.cookies.title}</h4>
                                <p>{t.otherInfo.cookies.text[0]} <Link href="/legal-hub/cookie-policy">{t.otherInfo.cookies.linkText}</Link>.</p>
                                <h4>{t.otherInfo.policyChanges.title}</h4>
                                <p>{t.otherInfo.policyChanges.text}</p>
                                <h4>{t.otherInfo.contact.title}</h4>
                                <p>{t.otherInfo.contact.text[0]} <a href="mailto:privacy@astrethique.com">privacy@astrethique.com</a>.</p>
                            </AccordionContent>
                        </AccordionItem>

                    </Accordion>
                </div>
                <aside className="hidden lg:block sticky top-24 self-start">
                    <h3 className="font-semibold mb-4">{t.toc}</h3>
                    <nav>
                        <ul className="space-y-2">
                            {sections.map(section => (
                                <li key={section.id}>
                                    <a 
                                        href={`#${section.id}`}
                                        className={`flex items-center gap-2 p-2 rounded-md text-sm transition-colors ${activeSection === section.id ? 'bg-muted font-semibold' : 'text-muted-foreground hover:bg-muted/50'}`}
                                    >
                                        <section.icon className="h-4 w-4" />
                                        {section.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>
            </div>
        </div>
    )
}

const TermsOfServiceContent = () => {
    const { language } = useLanguage();
    const t = translations[language].termsOfService;

    const sections = [
        { id: "eligibility", title: t.eligibility.title, icon: User },
        { id: "disclaimer", title: t.disclaimer.title, icon: AlertTriangle },
        { id: "platform", title: t.platform.title, icon: Info },
        { id: "billing", title: t.billing.title, icon: Wallet },
        { id: "content", title: t.content.title, icon: Copyright },
        { id: "conduct", title: t.conduct.title, icon: UserX },
        { id: "termination", title: t.termination.title, icon: Power },
        { id: "governing-law", title: t.governingLaw.title, icon: Gavel },
        { id: "contact", title: t.contact.title, icon: Mail },
    ];
    
    const [activeSection, setActiveSection] = useState("eligibility");

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, { rootMargin: "-50% 0px -50% 0px" });

        sections.forEach(section => {
            const el = document.getElementById(section.id);
            if (el) observer.observe(el);
        });

        return () => {
            sections.forEach(section => {
                const el = document.getElementById(section.id);
                if (el) observer.unobserve(el);
            });
        };
    }, [sections]);

    const lastUpdated = new Date("2024-07-26T10:00:00Z");

    return (
        <div className="container py-12">
            <div className="flex justify-between items-start mb-6 gap-4">
                <div>
                    <Button asChild variant="ghost" className="-ml-4">
                        <Link href="/legal-hub">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {translations[language].legalHub}
                        </Link>
                    </Button>
                    <h1 className="font-headline text-3xl md:text-4xl font-bold mt-2">{t.title}</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <p className="text-sm text-muted-foreground">
                            {t.lastUpdated}: {format(lastUpdated, language === 'fr' ? 'dd MMMM yyyy' : 'MMMM dd, yyyy')}
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="grid lg:grid-cols-[1fr_280px] gap-12 items-start">
                <div className="prose prose-invert max-w-none text-foreground/80 prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80">
                    <Accordion type="multiple" defaultValue={sections.map(s => s.id)} className="w-full">
                        
                        <AccordionItem value="eligibility" id="eligibility">
                            <AccordionTrigger className="text-xl font-headline">{t.eligibility.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.eligibility.content}</p>
                            </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="disclaimer" id="disclaimer">
                            <AccordionTrigger className="text-xl font-headline">{t.disclaimer.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.disclaimer.content}</p>
                            </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="platform" id="platform">
                            <AccordionTrigger className="text-xl font-headline">{t.platform.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.platform.content}</p>
                            </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="billing" id="billing">
                            <AccordionTrigger className="text-xl font-headline">{t.billing.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.billing.content} <Link href="/legal-hub/refunds-and-cancellations">{t.billing.link}</Link>.</p>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="content" id="content">
                            <AccordionTrigger className="text-xl font-headline">{t.content.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.content.content}</p>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="conduct" id="conduct">
                            <AccordionTrigger className="text-xl font-headline">{t.conduct.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.conduct.content}</p>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="termination" id="termination">
                            <AccordionTrigger className="text-xl font-headline">{t.termination.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.termination.content}</p>
                            </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="governing-law" id="governing-law">
                            <AccordionTrigger className="text-xl font-headline">{t.governingLaw.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.governingLaw.content}</p>
                            </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="contact" id="contact">
                            <AccordionTrigger className="text-xl font-headline">{t.contact.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.contact.content} <a href="mailto:legal@astrethique.com">legal@astrethique.com</a>.</p>
                            </AccordionContent>
                        </AccordionItem>

                    </Accordion>
                </div>
                <aside className="hidden lg:block sticky top-24 self-start">
                    <h3 className="font-semibold mb-4">{t.toc}</h3>
                    <nav>
                        <ul className="space-y-2">
                            {sections.map(section => (
                                <li key={section.id}>
                                    <a 
                                        href={`#${section.id}`}
                                        className={`flex items-center gap-2 p-2 rounded-md text-sm transition-colors ${activeSection === section.id ? 'bg-muted font-semibold' : 'text-muted-foreground hover:bg-muted/50'}`}
                                    >
                                        <section.icon className="h-4 w-4" />
                                        {section.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>
            </div>
        </div>
    )
}

const PricingAndFeesContent = () => {
    const { language } = useLanguage();
    const t = translations[language].pricingAndFees;

    const sections = [
        { id: "model", title: t.model.title, icon: Euro },
        { id: "wallet", title: t.wallet.title, icon: Wallet },
        { id: "fees", title: t.fees.title, icon: Info },
        { id: "example", title: t.example.title, icon: Calendar },
    ];
    
    const [activeSection, setActiveSection] = useState("model");

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, { rootMargin: "-50% 0px -50% 0px" });

        sections.forEach(section => {
            const el = document.getElementById(section.id);
            if (el) observer.observe(el);
        });

        return () => {
            sections.forEach(section => {
                const el = document.getElementById(section.id);
                if (el) observer.unobserve(el);
            });
        };
    }, [sections]);

    const lastUpdated = new Date("2024-07-26T10:00:00Z");

    const exampleSessions = [
        { duration: 10, rate: 2.50 },
        { duration: 25, rate: 4.00 },
        { duration: 45, rate: 1.99 },
    ];

    return (
        <div className="container py-12">
            <div className="flex justify-between items-start mb-6 gap-4">
                <div>
                    <Button asChild variant="ghost" className="-ml-4">
                        <Link href="/legal-hub">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {translations[language].legalHub}
                        </Link>
                    </Button>
                    <h1 className="font-headline text-3xl md:text-4xl font-bold mt-2">{t.title}</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <p className="text-sm text-muted-foreground">
                            {t.lastUpdated}: {format(lastUpdated, language === 'fr' ? 'dd MMMM yyyy' : 'MMMM dd, yyyy')}
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="grid lg:grid-cols-[1fr_280px] gap-12 items-start">
                <div className="prose prose-invert max-w-none text-foreground/80 prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80">
                    <Accordion type="multiple" defaultValue={sections.map(s => s.id)} className="w-full">
                        
                        <AccordionItem value="model" id="model">
                            <AccordionTrigger className="text-xl font-headline">{t.model.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.model.content}</p>
                            </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="wallet" id="wallet">
                            <AccordionTrigger className="text-xl font-headline">{t.wallet.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.wallet.content}</p>
                            </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="fees" id="fees">
                            <AccordionTrigger className="text-xl font-headline">{t.fees.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.fees.content[0]}</p>
                                <p>{t.fees.content[1]}</p>
                            </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="example" id="example">
                            <AccordionTrigger className="text-xl font-headline">{t.example.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.example.intro}</p>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t.example.table.duration}</TableHead>
                                            <TableHead>{t.example.table.rate}</TableHead>
                                            <TableHead className="text-right">{t.example.table.cost}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {exampleSessions.map((session, i) => (
                                            <TableRow key={i}>
                                                <TableCell>{session.duration} min</TableCell>
                                                <TableCell>€{session.rate.toFixed(2)}/min</TableCell>
                                                <TableCell className="text-right">€{(session.duration * session.rate).toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <p className="text-xs mt-2">{t.example.note}</p>
                            </AccordionContent>
                        </AccordionItem>

                    </Accordion>
                     <div className="mt-8 text-sm">
                        <p>{t.footer.text} <Link href="/legal-hub/terms-of-service">{t.footer.link1}</Link> {language === 'en' ? 'and' : 'et'} <Link href="/legal-hub/refunds-and-cancellations">{t.footer.link2}</Link>.</p>
                    </div>
                </div>
                <aside className="hidden lg:block sticky top-24 self-start">
                    <h3 className="font-semibold mb-4">{t.toc}</h3>
                    <nav>
                        <ul className="space-y-2">
                            {sections.map(section => (
                                <li key={section.id}>
                                    <a 
                                        href={`#${section.id}`}
                                        className={`flex items-center gap-2 p-2 rounded-md text-sm transition-colors ${activeSection === section.id ? 'bg-muted font-semibold' : 'text-muted-foreground hover:bg-muted/50'}`}
                                    >
                                        <section.icon className="h-4 w-4" />
                                        {section.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>
            </div>
        </div>
    )
}

const CookiePolicyContent = () => {
    const { language } = useLanguage();
    const t = translations[language].cookiePolicy;
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);


    const sections = [
        { id: "what-are-cookies", title: t.whatAreCookies.title, icon: Cookie },
        { id: "how-we-use", title: t.howWeUse.title, icon: Info },
        { id: "managing", title: t.managing.title, icon: User },
    ];
    
    const [activeSection, setActiveSection] = useState("what-are-cookies");

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, { rootMargin: "-50% 0px -50% 0px" });

        sections.forEach(section => {
            const el = document.getElementById(section.id);
            if (el) observer.observe(el);
        });

        return () => {
            sections.forEach(section => {
                const el = document.getElementById(section.id);
                if (el) observer.unobserve(el);
            });
        };
    }, [sections]);

    const lastUpdated = new Date("2024-07-26T10:00:00Z");

    const handleManageClick = () => {
        // This is a bit of a hack for the prototype. In a real app, this might use a global context.
        const trigger = document.getElementById('cookie-consent-manage-trigger');
        if (trigger) {
            trigger.click();
        } else {
            setIsManageModalOpen(true);
        }
    };
    
    return (
        <div className="container py-12">
             {/* The button in the banner is the primary trigger. This is a fallback. */}
            <div id="cookie-consent-manage-trigger" style={{ display: 'none' }} onClick={() => setIsManageModalOpen(true)} />
            
            <div className="flex justify-between items-start mb-6 gap-4">
                <div>
                    <Button asChild variant="ghost" className="-ml-4">
                        <Link href="/legal-hub">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {translations[language].legalHub}
                        </Link>
                    </Button>
                    <h1 className="font-headline text-3xl md:text-4xl font-bold mt-2">{t.title}</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <p className="text-sm text-muted-foreground">
                            {t.lastUpdated}: {format(lastUpdated, language === 'fr' ? 'dd MMMM yyyy' : 'MMMM dd, yyyy')}
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="grid lg:grid-cols-[1fr_280px] gap-12 items-start">
                <div className="prose prose-invert max-w-none text-foreground/80 prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80">
                    <Accordion type="multiple" defaultValue={sections.map(s => s.id)} className="w-full">
                        
                        <AccordionItem value="what-are-cookies" id="what-are-cookies">
                            <AccordionTrigger className="text-xl font-headline">{t.whatAreCookies.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.whatAreCookies.content}</p>
                            </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="how-we-use" id="how-we-use">
                            <AccordionTrigger className="text-xl font-headline">{t.howWeUse.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.howWeUse.intro}</p>
                                <ul>
                                    <li><strong>{t.howWeUse.essential.title}:</strong> {t.howWeUse.essential.text}</li>
                                    <li><strong>{t.howWeUse.analytics.title}:</strong> {t.howWeUse.analytics.text}</li>
                                    <li><strong>{t.howWeUse.preferences.title}:</strong> {t.howWeUse.preferences.text}</li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="managing" id="managing">
                            <AccordionTrigger className="text-xl font-headline">{t.managing.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.managing.content}</p>
                                <Button onClick={handleManageClick} className="mt-4">{t.managing.buttonText}</Button>
                            </AccordionContent>
                        </AccordionItem>
                        
                    </Accordion>
                     <div className="mt-8 text-sm">
                        <p>{t.footer.text} <Link href="/legal-hub/privacy-policy">{t.footer.linkText}</Link>.</p>
                    </div>
                </div>
                <aside className="hidden lg:block sticky top-24 self-start">
                    <h3 className="font-semibold mb-4">{t.toc}</h3>
                    <nav>
                        <ul className="space-y-2">
                            {sections.map(section => (
                                <li key={section.id}>
                                    <a 
                                        href={`#${section.id}`}
                                        className={`flex items-center gap-2 p-2 rounded-md text-sm transition-colors ${activeSection === section.id ? 'bg-muted font-semibold' : 'text-muted-foreground hover:bg-muted/50'}`}
                                    >
                                        <section.icon className="h-4 w-4" />
                                        {section.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>
            </div>
        </div>
    )
}

const RefundsAndCancellationsContent = () => {
    const { language } = useLanguage();
    const t = translations[language].refundsAndCancellations;

    const sections = [
        { id: "consultant-no-show", title: t.consultantNoShow.title, icon: UserX },
        { id: "user-cancellations", title: t.userCancellations.title, icon: CalendarOff },
        { id: "technical-failures", title: t.technicalFailures.title, icon: Wrench },
        { id: "conferences", title: t.conferences.title, icon: Tv },
        { id: "how-to-request", title: t.howToRequest.title, icon: Mail },
    ];
    
    const [activeSection, setActiveSection] = useState(sections[0].id);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, { rootMargin: "-50% 0px -50% 0px" });

        sections.forEach(section => {
            const el = document.getElementById(section.id);
            if (el) observer.observe(el);
        });

        return () => {
            sections.forEach(section => {
                const el = document.getElementById(section.id);
                if (el) observer.unobserve(el);
            });
        };
    }, [sections]);

    const lastUpdated = new Date("2024-07-26T10:00:00Z");

    return (
        <div className="container py-12">
            <div className="flex justify-between items-start mb-6 gap-4">
                <div>
                    <Button asChild variant="ghost" className="-ml-4">
                        <Link href="/legal-hub">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {translations[language].legalHub}
                        </Link>
                    </Button>
                    <h1 className="font-headline text-3xl md:text-4xl font-bold mt-2">{t.title}</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <p className="text-sm text-muted-foreground">
                            {t.lastUpdated}: {format(lastUpdated, language === 'fr' ? 'dd MMMM yyyy' : 'MMMM dd, yyyy')}
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="grid lg:grid-cols-[1fr_280px] gap-12 items-start">
                <div className="prose prose-invert max-w-none text-foreground/80 prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80">
                    <Accordion type="multiple" defaultValue={sections.map(s => s.id)} className="w-full">
                        
                        <AccordionItem value="consultant-no-show" id="consultant-no-show">
                            <AccordionTrigger className="text-xl font-headline">{t.consultantNoShow.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.consultantNoShow.content}</p>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="user-cancellations" id="user-cancellations">
                            <AccordionTrigger className="text-xl font-headline">{t.userCancellations.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.userCancellations.content}</p>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="technical-failures" id="technical-failures">
                            <AccordionTrigger className="text-xl font-headline">{t.technicalFailures.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.technicalFailures.content}</p>
                            </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="conferences" id="conferences">
                            <AccordionTrigger className="text-xl font-headline">{t.conferences.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.conferences.content}</p>
                            </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="how-to-request" id="how-to-request">
                            <AccordionTrigger className="text-xl font-headline">{t.howToRequest.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.howToRequest.content} <a href="mailto:support@astrethique.com">support@astrethique.com</a>.</p>
                            </AccordionContent>
                        </AccordionItem>
                        
                    </Accordion>
                </div>
                <aside className="hidden lg:block sticky top-24 self-start">
                    <h3 className="font-semibold mb-4">{t.toc}</h3>
                    <nav>
                        <ul className="space-y-2">
                            {sections.map(section => (
                                <li key={section.id}>
                                    <a 
                                        href={`#${section.id}`}
                                        className={`flex items-center gap-2 p-2 rounded-md text-sm transition-colors ${activeSection === section.id ? 'bg-muted font-semibold' : 'text-muted-foreground hover:bg-muted/50'}`}
                                    >
                                        <section.icon className="h-4 w-4" />
                                        {section.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>
            </div>
        </div>
    )
}

const ContentAndCommunityGuidelinesContent = () => {
    const { language } = useLanguage();
    const t = translations[language].communityGuidelines;

    const sections = [
        { id: "respect", title: t.respectfulConduct.title, icon: Users },
        { id: "boundaries", title: t.professionalBoundaries.title, icon: Handshake },
        { id: "authenticity", title: t.authenticity.title, icon: Shield },
        { id: "comments", title: t.commentingRules.title, icon: MessageSquare },
        { id: "enforcement", title: t.enforcement.title, icon: Gavel },
        { id: "reporting", title: t.reporting.title, icon: Megaphone },
    ];
    
    const [activeSection, setActiveSection] = useState(sections[0].id);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, { rootMargin: "-50% 0px -50% 0px" });

        sections.forEach(section => {
            const el = document.getElementById(section.id);
            if (el) observer.observe(el);
        });

        return () => {
            sections.forEach(section => {
                const el = document.getElementById(section.id);
                if (el) observer.unobserve(el);
            });
        };
    }, [sections]);

    const lastUpdated = new Date("2024-07-26T10:00:00Z");

    return (
        <div className="container py-12">
            <div className="flex justify-between items-start mb-6 gap-4">
                <div>
                    <Button asChild variant="ghost" className="-ml-4">
                        <Link href="/legal-hub">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {translations[language].legalHub}
                        </Link>
                    </Button>
                    <h1 className="font-headline text-3xl md:text-4xl font-bold mt-2">{t.title}</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <p className="text-sm text-muted-foreground">
                            {t.lastUpdated}: {format(lastUpdated, language === 'fr' ? 'dd MMMM yyyy' : 'MMMM dd, yyyy')}
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="grid lg:grid-cols-[1fr_280px] gap-12 items-start">
                <div className="prose prose-invert max-w-none text-foreground/80 prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80">
                    <Accordion type="multiple" defaultValue={sections.map(s => s.id)} className="w-full">
                        
                        <AccordionItem value="respect" id="respect">
                            <AccordionTrigger className="text-xl font-headline">{t.respectfulConduct.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.respectfulConduct.content}</p>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="boundaries" id="boundaries">
                            <AccordionTrigger className="text-xl font-headline">{t.professionalBoundaries.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.professionalBoundaries.content}</p>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="authenticity" id="authenticity">
                            <AccordionTrigger className="text-xl font-headline">{t.authenticity.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.authenticity.content}</p>
                            </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="comments" id="comments">
                            <AccordionTrigger className="text-xl font-headline">{t.commentingRules.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.commentingRules.content}</p>
                            </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="enforcement" id="enforcement">
                            <AccordionTrigger className="text-xl font-headline">{t.enforcement.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.enforcement.content}</p>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="reporting" id="reporting">
                            <AccordionTrigger className="text-xl font-headline">{t.reporting.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.reporting.content} <a href="mailto:support@astrethique.com">support@astrethique.com</a>.</p>
                            </AccordionContent>
                        </AccordionItem>
                        
                    </Accordion>
                </div>
                <aside className="hidden lg:block sticky top-24 self-start">
                    <h3 className="font-semibold mb-4">{t.toc}</h3>
                    <nav>
                        <ul className="space-y-2">
                            {sections.map(section => (
                                <li key={section.id}>
                                    <a 
                                        href={`#${section.id}`}
                                        className={`flex items-center gap-2 p-2 rounded-md text-sm transition-colors ${activeSection === section.id ? 'bg-muted font-semibold' : 'text-muted-foreground hover:bg-muted/50'}`}
                                    >
                                        <section.icon className="h-4 w-4" />
                                        {section.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>
            </div>
        </div>
    )
}

const SafetyAndReportingContent = () => {
    const { language } = useLanguage();
    const t = translations[language].safetyAndReporting;

    const sections = [
        { id: "emergency-disclaimer", title: t.emergencyDisclaimer.title, icon: AlertTriangle },
        { id: "how-to-report", title: t.howToReport.title, icon: Flag },
        { id: "blocking-and-muting", title: t.blockingAndMuting.title, icon: UserX },
        { id: "law-enforcement", title: t.lawEnforcement.title, icon: Gavel },
    ];
    
    const [activeSection, setActiveSection] = useState(sections[0].id);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, { rootMargin: "-50% 0px -50% 0px" });

        sections.forEach(section => {
            const el = document.getElementById(section.id);
            if (el) observer.observe(el);
        });

        return () => {
            sections.forEach(section => {
                const el = document.getElementById(section.id);
                if (el) observer.unobserve(el);
            });
        };
    }, [sections]);

    const lastUpdated = new Date("2024-07-26T10:00:00Z");

    return (
        <div className="container py-12">
            <div className="flex justify-between items-start mb-6 gap-4">
                <div>
                    <Button asChild variant="ghost" className="-ml-4">
                        <Link href="/legal-hub">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {translations[language].legalHub}
                        </Link>
                    </Button>
                    <h1 className="font-headline text-3xl md:text-4xl font-bold mt-2">{t.title}</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <p className="text-sm text-muted-foreground">
                            {t.lastUpdated}: {format(lastUpdated, language === 'fr' ? 'dd MMMM yyyy' : 'MMMM dd, yyyy')}
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="grid lg:grid-cols-[1fr_280px] gap-12 items-start">
                <div className="prose prose-invert max-w-none text-foreground/80 prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80">
                    <Accordion type="multiple" defaultValue={sections.map(s => s.id)} className="w-full">
                        
                        <AccordionItem value="emergency-disclaimer" id="emergency-disclaimer">
                            <AccordionTrigger className="text-xl font-headline">{t.emergencyDisclaimer.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.emergencyDisclaimer.content}</p>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="how-to-report" id="how-to-report">
                            <AccordionTrigger className="text-xl font-headline">{t.howToReport.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.howToReport.content} <a href="mailto:support@astrethique.com">support@astrethique.com</a>.</p>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="blocking-and-muting" id="blocking-and-muting">
                            <AccordionTrigger className="text-xl font-headline">{t.blockingAndMuting.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.blockingAndMuting.content}</p>
                            </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="law-enforcement" id="law-enforcement">
                            <AccordionTrigger className="text-xl font-headline">{t.lawEnforcement.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.lawEnforcement.content} <a href="mailto:legal@astrethique.com">legal@astrethique.com</a>.</p>
                            </AccordionContent>
                        </AccordionItem>
                        
                    </Accordion>
                </div>
                <aside className="hidden lg:block sticky top-24 self-start">
                    <h3 className="font-semibold mb-4">{t.toc}</h3>
                    <nav>
                        <ul className="space-y-2">
                            {sections.map(section => (
                                <li key={section.id}>
                                    <a 
                                        href={`#${section.id}`}
                                        className={`flex items-center gap-2 p-2 rounded-md text-sm transition-colors ${activeSection === section.id ? 'bg-muted font-semibold' : 'text-muted-foreground hover:bg-muted/50'}`}
                                    >
                                        <section.icon className="h-4 w-4" />
                                        {section.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>
            </div>
        </div>
    )
}

const KycIdVerificationContent = () => {
    const { language } = useLanguage();
    const t = translations[language].kycIdVerification;

    const sections = [
        { id: "what-we-verify", title: t.whatWeVerify.title, icon: UserCheck },
        { id: "when-and-why", title: t.whenAndWhy.title, icon: Clock },
        { id: "data-flow", title: t.dataFlow.title, icon: Lock },
        { id: "retention-rights", title: t.retentionAndRights.title, icon: Scale },
    ];
    
    const [activeSection, setActiveSection] = useState(sections[0].id);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, { rootMargin: "-50% 0px -50% 0px" });

        sections.forEach(section => {
            const el = document.getElementById(section.id);
            if (el) observer.observe(el);
        });

        return () => {
            sections.forEach(section => {
                const el = document.getElementById(section.id);
                if (el) observer.unobserve(el);
            });
        };
    }, [sections]);

    const lastUpdated = new Date("2024-07-26T10:00:00Z");

    return (
        <div className="container py-12">
            <div className="flex justify-between items-start mb-6 gap-4">
                <div>
                    <Button asChild variant="ghost" className="-ml-4">
                        <Link href="/legal-hub">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {translations[language].legalHub}
                        </Link>
                    </Button>
                    <h1 className="font-headline text-3xl md:text-4xl font-bold mt-2">{t.title}</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <p className="text-sm text-muted-foreground">
                            {t.lastUpdated}: {format(lastUpdated, language === 'fr' ? 'dd MMMM yyyy' : 'MMMM dd, yyyy')}
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="grid lg:grid-cols-[1fr_280px] gap-12 items-start">
                <div className="prose prose-invert max-w-none text-foreground/80 prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80">
                    <Accordion type="multiple" defaultValue={sections.map(s => s.id)} className="w-full">
                        
                        <AccordionItem value="what-we-verify" id="what-we-verify">
                            <AccordionTrigger className="text-xl font-headline">{t.whatWeVerify.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.whatWeVerify.content}</p>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="when-and-why" id="when-and-why">
                            <AccordionTrigger className="text-xl font-headline">{t.whenAndWhy.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.whenAndWhy.content}</p>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="data-flow" id="data-flow">
                            <AccordionTrigger className="text-xl font-headline">{t.dataFlow.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.dataFlow.content}</p>
                            </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="retention-rights" id="retention-rights">
                            <AccordionTrigger className="text-xl font-headline">{t.retentionAndRights.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.retentionAndRights.content} <Link href="/legal-hub/privacy-policy">{t.retentionAndRights.link}</Link>.</p>
                            </AccordionContent>
                        </AccordionItem>
                        
                    </Accordion>
                </div>
                <aside className="hidden lg:block sticky top-24 self-start">
                    <h3 className="font-semibold mb-4">{t.toc}</h3>
                    <nav>
                        <ul className="space-y-2">
                            {sections.map(section => (
                                <li key={section.id}>
                                    <a 
                                        href={`#${section.id}`}
                                        className={`flex items-center gap-2 p-2 rounded-md text-sm transition-colors ${activeSection === section.id ? 'bg-muted font-semibold' : 'text-muted-foreground hover:bg-muted/50'}`}
                                    >
                                        <section.icon className="h-4 w-4" />
                                        {section.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>
            </div>
        </div>
    )
}

const DataProcessingContent = () => {
    const { language } = useLanguage();
    const t = translations[language].dataProcessing;

    const sections = [
        { id: "controller-processor", title: t.controllerProcessor.title, icon: DatabaseZap },
        { id: "subprocessors", title: t.subprocessors.title, icon: ServerCog },
    ];
    
    const [activeSection, setActiveSection] = useState(sections[0].id);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, { rootMargin: "-50% 0px -50% 0px" });

        sections.forEach(section => {
            const el = document.getElementById(section.id);
            if (el) observer.observe(el);
        });

        return () => {
            sections.forEach(section => {
                const el = document.getElementById(section.id);
                if (el) observer.unobserve(el);
            });
        };
    }, [sections]);

    const lastUpdated = new Date("2024-07-26T10:00:00Z");

    return (
        <div className="container py-12">
            <div className="flex justify-between items-start mb-6 gap-4">
                <div>
                    <Button asChild variant="ghost" className="-ml-4">
                        <Link href="/legal-hub">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {translations[language].legalHub}
                        </Link>
                    </Button>
                    <h1 className="font-headline text-3xl md:text-4xl font-bold mt-2">{t.title}</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <p className="text-sm text-muted-foreground">
                            {t.lastUpdated}: {format(lastUpdated, language === 'fr' ? 'dd MMMM yyyy' : 'MMMM dd, yyyy')}
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="grid lg:grid-cols-[1fr_280px] gap-12 items-start">
                <div className="prose prose-invert max-w-none text-foreground/80 prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80">
                    <Accordion type="multiple" defaultValue={sections.map(s => s.id)} className="w-full">
                        
                        <AccordionItem value="controller-processor" id="controller-processor">
                            <AccordionTrigger className="text-xl font-headline">{t.controllerProcessor.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.controllerProcessor.content}</p>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="subprocessors" id="subprocessors">
                            <AccordionTrigger className="text-xl font-headline">{t.subprocessors.title}</AccordionTrigger>
                            <AccordionContent>
                                <p>{t.subprocessors.intro}</p>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t.subprocessors.table.category}</TableHead>
                                            <TableHead>{t.subprocessors.table.name}</TableHead>
                                            <TableHead>{t.subprocessors.table.region}</TableHead>
                                            <TableHead>{t.subprocessors.table.purpose}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {t.subprocessors.rows.map((row, i) => (
                                            <TableRow key={i}>
                                                <TableCell>{row.category}</TableCell>
                                                <TableCell>{row.name}</TableCell>
                                                <TableCell>{row.region}</TableCell>
                                                <TableCell>{row.purpose}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <p className="mt-4">{t.subprocessors.note}</p>
                            </AccordionContent>
                        </AccordionItem>
                        
                    </Accordion>
                </div>
                <aside className="hidden lg:block sticky top-24 self-start">
                    <h3 className="font-semibold mb-4">{t.toc}</h3>
                    <nav>
                        <ul className="space-y-2">
                            {sections.map(section => (
                                <li key={section.id}>
                                    <a 
                                        href={`#${section.id}`}
                                        className={`flex items-center gap-2 p-2 rounded-md text-sm transition-colors ${activeSection === section.id ? 'bg-muted font-semibold' : 'text-muted-foreground hover:bg-muted/50'}`}
                                    >
                                        <section.icon className="h-4 w-4" />
                                        {section.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>
            </div>
        </div>
    )
}


export default function LegalDetailPage() {
    const params = useParams();
    const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
    
    if (slug === 'privacy-policy') {
        return <PrivacyPolicyContent />;
    }
    
    if (slug === 'terms-of-service') {
        return <TermsOfServiceContent />;
    }

    if (slug === 'pricing-and-fees') {
        return <PricingAndFeesContent />;
    }
    
    if (slug === 'cookie-policy') {
        return <CookiePolicyContent />;
    }
    
    if (slug === 'refunds-and-cancellations') {
        return <RefundsAndCancellationsContent />;
    }

    if (slug === 'community-guidelines') {
        return <ContentAndCommunityGuidelinesContent />;
    }

    if (slug === 'safety-and-reporting') {
        return <SafetyAndReportingContent />;
    }

    if (slug === 'kyc-id-verification') {
        return <KycIdVerificationContent />;
    }
    
    if (slug === 'data-processing') {
        return <DataProcessingContent />;
    }


    const title = slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : "Legal Document";

    return (
        <div className="container py-12">
            <Button asChild variant="ghost" className="mb-6">
                <Link href="/legal-hub">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Legal Hub
                </Link>
            </Button>
            <PlaceholderPage 
                title={title}
                description="This page will contain the full text of the legal document. For now, it is a placeholder."
            />
        </div>
    );
}
