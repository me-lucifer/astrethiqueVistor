
"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format, subDays } from "date-fns";

export default function LegalHubPage() {
  const { language, setLanguage } = useLanguage();
  const t = translations[language];

  const [activeFilters, setActiveFilters] = useState(["Visitors", "Consultants"]);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };
  
  const pageContent = {
    en: {
        title: "Legal Hub",
        subtitle: "All policies in one place — transparent, GDPR-respectful.",
    },
    fr: {
        title: "Pôle Juridique",
        subtitle: "Toutes nos politiques au même endroit — transparentes et respectueuses du RGPD.",
    }
  }

  const policies = [
    { slug: 'privacy-policy', title: 'Privacy Policy (GDPR)', summary: 'How we collect, use, and protect your personal data.', lastUpdated: subDays(new Date(), 5), audience: ['Visitors', 'Consultants'] },
    { slug: 'terms-of-service', title: 'Terms of Service', summary: 'The rules for using our platform and services.', lastUpdated: subDays(new Date(), 5), audience: ['Visitors', 'Consultants'] },
    { slug: 'pricing-and-fees', title: 'Pricing & Fees', summary: 'A detailed breakdown of consultant rates and platform fees.', lastUpdated: subDays(new Date(), 30), audience: ['Visitors', 'Consultants'] },
    { slug: 'cookie-policy', title: 'Cookie Policy', summary: 'Information about the cookies we use and why.', lastUpdated: subDays(new Date(), 90), audience: ['Visitors'] },
    { slug: 'refunds-and-cancellations', title: 'Refunds & Cancellations', summary: 'Our policy on refunds for sessions and wallet top-ups.', lastUpdated: subDays(new Date(), 45), audience: ['Visitors'] },
    { slug: 'community-guidelines', title: 'Content & Community Guidelines', summary: 'Standards for respectful and constructive interaction.', lastUpdated: subDays(new Date(), 120), audience: ['Visitors', 'Consultants'] },
    { slug: 'safety-and-reporting', title: 'Safety & Reporting', summary: 'How to report issues and our safety procedures.', lastUpdated: subDays(new Date(), 15), audience: ['Visitors', 'Consultants'] },
    { slug: 'kyc-id-verification', title: 'KYC / ID Verification', summary: 'Our identity verification policy for consultants.', lastUpdated: subDays(new Date(), 60), audience: ['Consultants'] },
    { slug: 'data-processing', title: 'Data Processing & Sub-processors', summary: 'Our subprocessors and data processing agreements.', lastUpdated: subDays(new Date(), 20), audience: ['Consultants'] },
    { slug: 'copyright-and-takedown', title: 'Copyright & Takedown (DMCA)', summary: 'How we handle copyright infringement claims.', lastUpdated: subDays(new Date(), 180), audience: ['Visitors', 'Consultants'] },
  ];

  const filteredPolicies = policies.filter(policy => 
    (activeFilters.length === 0 || activeFilters.some(filter => policy.audience.includes(filter))) &&
    (searchTerm === "" || policy.title.toLowerCase().includes(searchTerm.toLowerCase()) || policy.summary.toLowerCase().includes(searchTerm.toLowerCase()))
  );


  return (
    <div className="container py-16">
      <div className="flex flex-col items-center text-center gap-4 mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {pageContent[language].title}
        </h1>
        <p className="text-lg text-foreground/80 max-w-2xl">
          {pageContent[language].subtitle}
        </p>
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="inline-flex items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
                <Button variant={language === 'en' ? 'background' : 'ghost'} onClick={() => setLanguage('en')} className="px-4">EN</Button>
                <Button variant={language === 'fr' ? 'background' : 'ghost'} onClick={() => setLanguage('fr')} className="px-4">FR</Button>
            </div>
            <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Search policies..."
                    className="pl-10 h-11 text-base sm:text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
        <div className="flex gap-2">
            <Button 
                variant={activeFilters.includes("Visitors") ? "secondary" : "outline"}
                onClick={() => toggleFilter("Visitors")}
                className="rounded-full"
            >
                Visitors
            </Button>
             <Button 
                variant={activeFilters.includes("Consultants") ? "secondary" : "outline"}
                onClick={() => toggleFilter("Consultants")}
                className="rounded-full"
            >
                Consultants
            </Button>
        </div>
      </div>

       <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPolicies.map(policy => {
            const isRecent = subDays(new Date(), 30) < policy.lastUpdated;
            return (
                <Card key={policy.slug} className="flex flex-col bg-card/50 hover:bg-card transition-colors">
                    <CardHeader>
                        <CardTitle className="font-headline text-lg flex items-center justify-between">
                            <span>{policy.title}</span>
                            {isRecent && <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Updated</Badge>}
                        </CardTitle>
                        <CardDescription>{policy.summary}</CardDescription>
                    </CardHeader>
                    <CardFooter className="mt-auto flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">
                            Last updated: {format(policy.lastUpdated, "MMM dd, yyyy")}
                        </p>
                        <Button asChild variant="link" size="sm">
                            <Link href={`/legal-hub/${policy.slug}`}>
                                View <ExternalLink className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            )
        })}
       </div>
       {filteredPolicies.length === 0 && (
         <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg col-span-full">
            <h3 className="font-headline text-xl font-bold">No policies match your search.</h3>
            <p className="text-muted-foreground mt-2">Try clearing your search or filters.</p>
        </div>
       )}
    </div>
  );
}
