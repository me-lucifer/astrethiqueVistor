"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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

  return (
    <div className="container py-16">
      <div className="flex flex-col items-center text-center gap-4 mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {pageContent[language].title}
        </h1>
        <p className="text-lg text-foreground/80 max-w-2xl">
          {pageContent[language].subtitle}
        </p>
        <div className="mt-4 flex items-center gap-4">
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

      <div className="text-center text-muted-foreground">
        <p>{language === 'en' ? "Policy content would be displayed here..." : "Le contenu des politiques serait affiché ici..."}</p>
      </div>
    </div>
  );
}