
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Euro, Wallet, Lock, Heart, Briefcase, HeartPulse, CircleDollarSign } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/language-context";
import { DailyHoroscopeModal } from "@/components/daily-horoscope-modal";
import { useState } from "react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const translations = {
  en: {
    headline: "Guidance you can feel good about.",
    subheadline:
      "Speak with vetted consultants by chat, audio, or video — pay per minute, budget-friendly, and GDPR-respectful.",
    startNow: "Start Now",
    checkHoroscope: "Check Free Daily Horoscope",
    pricingInfo:
      "Transparent per-minute pricing. Optional monthly ‘Budget Lock’.",
    valuePillars: {
      title: "Clarity and Control, by Design.",
      subtitle: "Our commitment to ethical, transparent practices empowers you to connect with confidence.",
      pillars: [
        {
          icon: Euro,
          title: "Per-Consultant Rate",
          description: "Each expert sets a clear €/min rate shown before you start."
        },
        {
          icon: Wallet,
          title: "Prepaid Wallet & Live Meter",
          description: "Top up once, watch your remaining minutes in real time."
        },
        {
          icon: Lock,
          title: "Optional Budget Lock",
          description: "Cap monthly spend; enable one emergency top-up if needed."
        }
      ]
    },
    categories: {
        title: "Find the Right Guidance, Faster.",
        subtitle: "Focus on what matters most to you right now. Our consultants cover a wide range of life's challenges and questions.",
        items: [
            { name: "Love", icon: Heart, description: "Focused guidance on relationships.", query: "Love" },
            { name: "Work", icon: Briefcase, description: "Focused guidance on career.", query: "Work" },
            { name: "Health", icon: HeartPulse, description: "Focused guidance on well-being.", query: "Health" },
            { name: "Money", icon: CircleDollarSign, description: "Focused guidance on finances.", query: "Money" },
        ]
    }
  },
  fr: {
    headline: "Des conseils qui font du bien.",
    subheadline:
      "Échangez avec des consultants certifiés par chat, audio ou vidéo. Payez à la minute, respectez votre budget et vos données (RGPD).",
    startNow: "Commencer",
    checkHoroscope: "Voir l'horoscope du jour",
    pricingInfo:
      "Tarification transparente à la minute. ‘Verrouillage de budget’ mensuel en option.",
    valuePillars: {
      title: "Clarté et contrôle, par conception.",
      subtitle: "Notre engagement envers des pratiques éthiques et transparentes vous permet de vous connecter en toute confiance.",
      pillars: [
        {
          icon: Euro,
          title: "Tarif par consultant",
          description: "Chaque expert fixe un tarif clair en €/min, affiché avant de commencer."
        },
        {
          icon: Wallet,
          title: "Portefeuille prépayé & compteur en direct",
          description: "Rechargez une fois, suivez vos minutes restantes en temps réel."
        },
        {
          icon: Lock,
          title: "Verrouillage de budget optionnel",
          description: "Plafonnez vos dépenses mensuelles ; activez une recharge d'urgence si besoin."
        }
      ]
    },
    categories: {
        title: "Trouvez les bons conseils, plus rapidement.",
        subtitle: "Concentrez-vous sur ce qui compte le plus pour vous en ce moment. Nos consultants couvrent un large éventail de défis et de questions de la vie.",
        items: [
            { name: "Amour", icon: Heart, description: "Conseils ciblés sur les relations.", query: "Love" },
            { name: "Travail", icon: Briefcase, description: "Conseils ciblés sur la carrière.", query: "Work" },
            { name: "Santé", icon: HeartPulse, description: "Conseils ciblés sur le bien-être.", query: "Health" },
            { name: "Argent", icon: CircleDollarSign, description: "Conseils ciblés sur les finances.", query: "Money" },
        ]
    }
  },
};

export default function Home() {
  const { language } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t = translations[language];

  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-background');

  return (
    <>
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
              {t.headline}
            </h1>
            <p className="mt-6 text-lg leading-8 text-white/90 drop-shadow-sm">
              {t.subheadline}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="transition-transform hover:scale-[1.01] w-full sm:w-auto">
                <Link href="/discover">
                  {t.startNow}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 text-white transition-transform hover:scale-[1.01] w-full sm:w-auto"
                onClick={() => setIsModalOpen(true)}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                {t.checkHoroscope}
              </Button>
            </div>
            <p className="mt-8 text-xs text-white/70">{t.pricingInfo}</p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-background">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t.valuePillars.title}
            </h2>
            <p className="mt-4 text-lg text-foreground/80">
              {t.valuePillars.subtitle}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {t.valuePillars.pillars.map((pillar) => (
              <Link href="/how-it-works" key={pillar.title} className="group">
                <Card className="h-full transition-all duration-300 ease-in-out group-hover:border-primary group-hover:shadow-lg group-hover:scale-[1.01] bg-card/50 hover:bg-card">
                  <CardHeader className="flex flex-col items-center text-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full border border-primary/20">
                      <pillar.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-lg">{pillar.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-foreground/70">{pillar.description}</p>
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
                    {t.categories.title}
                </h2>
                <p className="mt-4 text-lg text-foreground/80">
                    {t.categories.subtitle}
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {t.categories.items.map((category) => (
                    <Link href={`/discover?category=${category.query}`} key={category.name} className="group">
                        <Card className="h-full transition-all duration-300 ease-in-out group-hover:border-primary group-hover:shadow-lg group-hover:scale-[1.01] bg-card/50 hover:bg-card">
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

      <DailyHoroscopeModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
