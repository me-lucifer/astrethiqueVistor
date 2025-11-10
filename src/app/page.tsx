
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Wallet, Lock, Heart, Briefcase, HeartPulse, CircleDollarSign, ShieldCheck, UserCheck, Info, Gift } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { DailyHoroscopeModal } from "@/components/daily-horoscope-modal";
import { useState, useEffect } from "react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { FeaturedConsultants } from "@/components/featured-consultants";
import { FeaturedContent } from "@/components/featured-content";
import { UpcomingConferences } from "@/components/upcoming-conferences";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast";
import { StartNowModal } from "@/components/start-now-modal";
import { getLocal } from "@/lib/local";
import { getSession, setSession } from "@/lib/session";
import { seedConsultants } from "@/lib/consultants-seeder";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/translations";

const trustItems = [
    { icon: UserCheck, text: "trustPillar1" },
    { icon: Lock, text: "trustPillar2" },
    { icon: ShieldCheck, text: "trustPillar3" }
];


export default function Home() {
  const [isHoroscopeModalOpen, setIsHoroscopeModalOpen] = useState(false);
  const [isStartNowModalOpen, setIsStartNowModalOpen] = useState(false);
  const [showRegistrationBanner, setShowRegistrationBanner] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language];

  const categories = [
    { name: t.catLove, icon: Heart, description: t.catLoveDesc, query: "Love" },
    { name: t.catWork, icon: Briefcase, description: t.catWorkDesc, query: "Work" },
    { name: t.catHealth, icon: HeartPulse, description: t.catHealthDesc, query: "Health" },
    { name: t.catMoney, icon: CircleDollarSign, description: t.catMoneyDesc, query: "Money" },
];

  const valuePillars = [
    {
      icon: Gift,
      title: "pillar1Title",
      description: "pillar1Desc"
    },
    {
      icon: Wallet,
      title: "pillar2Title",
      description: "pillar2Desc"
    },
    {
      icon: Lock,
      title: "pillar3Title",
      description: "pillar3Desc"
    }
  ];

  useEffect(() => {
    // Seed consultant data if it doesn't exist
    seedConsultants();

    // Logic to show registration banner after horoscope submission
    const registrationBannerTimer = setTimeout(() => {
      const leadExists = getLocal("leads");
      const userRegistered = getSession("userRegistered");
      if (leadExists && userRegistered !== 'true') {
        setShowRegistrationBanner(true);
      }
    }, 60000);


    return () => {
      clearTimeout(registrationBannerTimer);
    };
  }, []);
  
  const handleHoroscopeSubmit = () => {
    setIsHoroscopeModalOpen(false);
    toast({
      title: "Your daily horoscope is on the way ✨",
    });
  }

  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-background');

  return (
    <TooltipProvider>
      {showRegistrationBanner && (
        <div className="sticky top-0 z-50 bg-primary text-primary-foreground p-2 text-center text-sm">
          <span>Save your reading & get reminders—create a free account.</span>
          <Button variant="link" asChild className="text-primary-foreground font-bold">
            <Link href="/register">Register</Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowRegistrationBanner(false)} className="ml-2 hover:bg-primary/80">Dismiss</Button>
        </div>
      )}

      <section className="relative h-[80vh] min-h-[500px] w-full flex items-center justify-center text-center text-white overflow-hidden">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            data-ai-hint={heroImage.imageHint}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 container py-24 sm:py-32">
          <div className="mx-auto max-w-3xl">
            <h1 className="font-headline text-4xl font-bold tracking-tight text-white sm:text-6xl drop-shadow-md">
              {t.heroHeadline}
            </h1>
            <p className="mt-6 text-lg leading-8 text-white/90 drop-shadow-sm">
              {t.heroSub}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="transition-transform motion-safe:hover:scale-[1.01] w-full sm:w-auto" onClick={() => setIsStartNowModalOpen(true)}>
                {t.startNow}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 text-white transition-transform motion-safe:hover:scale-[1.01] w-full sm:w-auto"
                onClick={() => setIsHoroscopeModalOpen(true)}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                {t.checkHoroscope}
              </Button>
            </div>
            <div className="mt-8 text-xs text-white/70">
              <p>{t.heroTiny}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-background">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t.valueHeadline}
            </h2>
            <p className="mt-4 text-lg text-foreground/80">
              {t.valueSub}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {valuePillars.map((pillar) => (
              <Link href="/how-it-works" key={pillar.title} className="group">
                <Card className="h-full transition-all duration-300 ease-in-out group-hover:border-primary group-hover:shadow-lg motion-safe:group-hover:scale-[1.01] bg-card/50 hover:bg-card">
                  <CardHeader className="flex flex-col items-center text-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full border border-primary/20">
                      <pillar.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-lg">{t[pillar.title as keyof typeof t]}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-foreground/70 flex items-center justify-center gap-1">
                        <span>{t[pillar.description as keyof typeof t].split(';')[0]}</span>
                        {pillar.title === "pillar3Title" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 cursor-pointer" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t[pillar.description as keyof typeof t].split(';')[1]}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-background/50">
        <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    {t.catHeadline}
                </h2>
                <p className="mt-4 text-lg text-foreground/80">
                    {t.catSub}
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((category) => (
                    <Link href={`/discover?category=${category.query}`} key={category.name} className="group">
                        <Card className="h-full transition-all duration-300 ease-in-out group-hover:border-primary group-hover:shadow-lg motion-safe:group-hover:scale-[1.01] bg-card/50 hover:bg-card">
                            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                                <category.icon className="h-10 w-10 text-primary" />
                                <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground/80">{category.name}</Badge>
                                <p className="text-sm text-foreground/70">{category.description}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-background">
        <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    {t.consultantHeadline}
                </h2>
                <p className="mt-4 text-lg text-foreground/80">
                    {t.consultantSub}
                </p>
            </div>
            <FeaturedConsultants showFilters={false} />
        </div>
      </section>
      
      <section className="py-16 sm:py-24 bg-background/50">
        <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    {t.confHeadline}
                </h2>
                <p className="mt-4 text-lg text-foreground/80">
                    {t.confSub}
                </p>
            </div>
            <UpcomingConferences />
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-background">
        <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    {t.contentHeadline}
                </h2>
                <p className="mt-4 text-lg text-foreground/80">
                    {t.contentSub}
                </p>
            </div>
            <FeaturedContent />
        </div>
      </section>

      <section className="py-16 bg-background/50 border-y">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 items-center text-center md:text-left">
            {trustItems.map((item, index) => (
              <div key={index} className="flex flex-col md:flex-row items-center gap-4">
                <item.icon className="h-8 w-8 text-primary shrink-0" />
                <p className="text-foreground/80">{t[item.text as keyof typeof t]}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="link" asChild>
                <Link href="/how-it-works#trust">
                    {t.learnMore} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
          </div>
        </div>
      </section>

      <DailyHoroscopeModal 
        isOpen={isHoroscopeModalOpen} 
        onOpenChange={setIsHoroscopeModalOpen}
        onSuccessSubmit={handleHoroscopeSubmit}
      />
      <StartNowModal 
          isOpen={isStartNowModalOpen}
          onOpenChange={setIsStartNowModalOpen}
      />
    </TooltipProvider>
  );
}
