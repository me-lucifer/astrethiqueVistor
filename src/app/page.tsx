
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Euro, Wallet, Lock, Heart, Briefcase, HeartPulse, CircleDollarSign, ShieldCheck, UserCheck, Info } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { DailyHoroscopeModal } from "@/components/daily-horoscope-modal";
import { useState, useEffect } from "react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { FeaturedConsultants } from "@/components/featured-consultants";
import { FeaturedContent } from "@/components/featured-content";
import { UpcomingConferences } from "@/components/upcoming-conferences";
import { DemoControlsModal } from "@/components/demo-controls-modal";
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

const categories = [
    { name: "Love", icon: Heart, description: "Focused guidance on relationships.", query: "Love" },
    { name: "Work", icon: Briefcase, description: "Focused guidance on career.", query: "Work" },
    { name: "Health", icon: HeartPulse, description: "Focused guidance on well-being.", query: "Health" },
    { name: "Money", icon: CircleDollarSign, description: "Focused guidance on finances.", query: "Money" },
];

const trustItems = [
    { icon: UserCheck, text: "Admin-approved & KYC-verified consultants" },
    { icon: Lock, text: "GDPR-compliant data" },
    { icon: ShieldCheck, text: "Transparent pricing before you start" }
];

const valuePillars = [
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
];

export default function Home() {
  const [isHoroscopeModalOpen, setIsHoroscopeModalOpen] = useState(false);
  const [isStartNowModalOpen, setIsStartNowModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [showRegistrationBanner, setShowRegistrationBanner] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsDemoModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Logic to show registration banner after horoscope submission
    const registrationBannerTimer = setTimeout(() => {
      const leadExists = getLocal("leads");
      const userRegistered = getSession("userRegistered");
      if (leadExists && userRegistered !== 'true') {
        setShowRegistrationBanner(true);
      }
    }, 60000);


    return () => {
      window.removeEventListener('keydown', handleKeyDown);
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
              Guidance you can feel good about.
            </h1>
            <p className="mt-6 text-lg leading-8 text-white/90 drop-shadow-sm">
              Speak with vetted consultants by chat, audio, or video — pay per minute, budget-friendly, and GDPR-respectful.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="transition-transform motion-safe:hover:scale-[1.01] w-full sm:w-auto" onClick={() => setIsStartNowModalOpen(true)}>
                Start Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 text-white transition-transform motion-safe:hover:scale-[1.01] w-full sm:w-auto"
                onClick={() => setIsHoroscopeModalOpen(true)}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Check Free Daily Horoscope
              </Button>
            </div>
            <div className="mt-8 text-xs text-white/70">
              <p>Transparent per-minute pricing. Optional monthly ‘Budget Lock’.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-background">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Clarity and Control, by Design.
            </h2>
            <p className="mt-4 text-lg text-foreground/80">
              Our commitment to ethical, transparent practices empowers you to connect with confidence.
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
                    <CardTitle className="font-headline text-lg">{pillar.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-foreground/70 flex items-center justify-center gap-1">
                        <span>{pillar.description.split(';')[0]}</span>
                        {pillar.title === "Optional Budget Lock" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 cursor-pointer" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Cap monthly spend; one emergency top-up may apply, configured by admin.</p>
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
                    Find the Right Guidance, Faster.
                </h2>
                <p className="mt-4 text-lg text-foreground/80">
                    Focus on what matters most to you right now. Our consultants cover a wide range of life's challenges and questions.
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
                    Connect with a Trusted Expert
                </h2>
                <p className="mt-4 text-lg text-foreground/80">
                    Our consultants are here to provide clarity and support, whenever you need it.
                </p>
            </div>
            <FeaturedConsultants />
        </div>
      </section>
      
      <section className="py-16 sm:py-24 bg-background/50">
        <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Upcoming Conferences
                </h2>
                <p className="mt-4 text-lg text-foreground/80">
                    Join live events hosted by our experts to deepen your understanding.
                </p>
            </div>
            <UpcomingConferences />
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-background">
        <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Insights from our Content Hub
                </h2>
                <p className="mt-4 text-lg text-foreground/80">
                    Explore articles and podcasts from our experts to gain clarity and perspective.
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
                <p className="text-foreground/80">{item.text}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="link" asChild>
                <Link href="/how-it-works#trust">
                    Learn more <ArrowRight className="ml-2 h-4 w-4" />
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
      <DemoControlsModal isOpen={isDemoModalOpen} onOpenChange={setIsDemoModalOpen} />
    </TooltipProvider>
  );
}
