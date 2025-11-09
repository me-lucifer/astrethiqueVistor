"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
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
  },
  fr: {
    headline: "Des conseils qui font du bien.",
    subheadline:
      "Échangez avec des consultants certifiés par chat, audio ou vidéo. Payez à la minute, respectez votre budget et vos données (RGPD).",
    startNow: "Commencer",
    checkHoroscope: "Voir l'horoscope du jour",
    pricingInfo:
      "Tarification transparente à la minute. ‘Verrouillage de budget’ mensuel en option.",
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

      <DailyHoroscopeModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
