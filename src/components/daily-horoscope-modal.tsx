
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession, setSession } from "@/lib/session";
import { useLanguage } from "@/contexts/language-context";
import { Star, Sparkles, Send, BrainCircuit, Lock } from "lucide-react";

const translations = {
  en: {
    title: "Your Free Daily Horoscope",
    description: "A little cosmic guidance to start your day. Fill in your details below.",
    form: {
      email: "Email Address",
      sunSign: "Sun Sign",
      birthDate: "Birth Date (optional)",
      birthTime: "Birth Time (optional)",
      birthPlace: "Birth Place (optional)",
      submit: "See Today’s Horoscope",
      required: "This field is required",
      invalidEmail: "Invalid email address",
    },
    analysis: {
      title: "Analyzing the Cosmos...",
      description: "Our experts are consulting the stars to align your personalized horoscope. This may take a moment.",
    },
    result: {
      title: "Your Daily Outlook",
      cta: "Get a Personalized Horoscope (Paid)",
      note: "We’ll send helpful tips (unsubscribe anytime).",
    },
    signs: ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"],
  },
  fr: {
    title: "Votre Horoscope Quotidien Gratuit",
    description: "Un petit guide cosmique pour commencer votre journée. Remplissez vos informations ci-dessous.",
    form: {
      email: "Adresse e-mail",
      sunSign: "Signe Solaire",
      birthDate: "Date de naissance (optionnel)",
      birthTime: "Heure de naissance (optionnel)",
      birthPlace: "Lieu de naissance (optionnel)",
      submit: "Voir l'horoscope du jour",
      required: "Ce champ est requis",
      invalidEmail: "Adresse e-mail invalide",
    },
    analysis: {
      title: "Analyse du Cosmos...",
      description: "Nos experts consultent les étoiles pour aligner votre horoscope personnalisé. Cela peut prendre un moment.",
    },
    result: {
      title: "Votre Perspective du Jour",
      cta: "Obtenir un Horoscope Personnalisé (Payant)",
      note: "Nous vous enverrons des conseils utiles (désabonnement à tout moment).",
    },
    signs: ["Bélier", "Taureau", "Gémeaux", "Cancer", "Lion", "Vierge", "Balance", "Scorpion", "Sagittaire", "Capricorne", "Verseau", "Poissons"],
  },
};

const formSchema = (t: typeof translations.en) => z.object({
  email: z.string().email(t.form.invalidEmail),
  sunSign: z.string().min(1, t.form.required),
  birthDate: z.string().optional(),
  birthTime: z.string().optional(),
  birthPlace: z.string().optional(),
});


export function DailyHoroscopeModal({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) {
  const { language } = useLanguage();
  const t = translations[language];

  const [view, setView] = useState<"form" | "loading" | "result">("form");
  const [progress, setProgress] = useState(0);

  const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
    resolver: zodResolver(formSchema(t)),
    defaultValues: {
      email: "",
      sunSign: "",
      birthDate: "",
      birthTime: "",
      birthPlace: "",
    },
  });
  
  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal is closed
      setTimeout(() => {
        setView("form");
        setProgress(0);
        form.reset();
      }, 300);
    }
  }, [isOpen, form]);


  function onSubmit(values: z.infer<ReturnType<typeof formSchema>>) {
    const isRegistered = getSession("isRegistered") === true;
    if (!isRegistered) {
        const guestEmails = getSession<string[]>("guestEmails") || [];
        if (!guestEmails.includes(values.email)) {
            guestEmails.push(values.email);
            setSession("guestEmails", guestEmails);
        }
    }

    setView("loading");
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setView("result");
          return 100;
        }
        return prev + 1.666;
      });
    }, 1000);
  }

  const renderContent = () => {
    switch (view) {
      case "loading":
        return (
          <>
            <DialogHeader className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mx-auto mb-4">
                <BrainCircuit className="h-6 w-6 text-primary animate-pulse motion-reduce:animate-none" />
              </div>
              <DialogTitle>{t.analysis.title}</DialogTitle>
              <DialogDescription>{t.analysis.description}</DialogDescription>
            </DialogHeader>
            <div className="py-8 px-6 space-y-4">
              <Progress value={progress} />
              <p className="text-center text-sm text-muted-foreground">{Math.round(progress)}%</p>
            </div>
          </>
        );
      case "result":
        return (
          <>
            <DialogHeader className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-success/10 mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-success" />
              </div>
              <DialogTitle>{t.result.title}</DialogTitle>
            </DialogHeader>
            <div className="py-4 px-6">
              <Card className="bg-background">
                <CardContent className="p-4 space-y-2 text-sm text-foreground/80">
                  <p>Today is a day for bold moves. Your energy is high, pushing you to take initiative in your projects. Trust your instincts.</p>
                  <p>In relationships, communication is key. A conversation you've been avoiding might lead to a breakthrough.</p>
                </CardContent>
              </Card>
            </div>
            <DialogFooter className="px-6 pb-6 flex-col gap-2">
              <Button disabled size="lg">
                <Star className="mr-2 h-4 w-4" />
                {t.result.cta}
              </Button>
              <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                <Lock className="h-3 w-3"/>
                {t.result.note}
              </p>
            </DialogFooter>
          </>
        );
      case "form":
      default:
        return (
          <>
            <DialogHeader>
               <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle className="text-center">{t.title}</DialogTitle>
              <DialogDescription className="text-center">{t.description}</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4 px-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.form.email}</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sunSign"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.form.sunSign}</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t.form.sunSign} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {t.signs.map(sign => <SelectItem key={sign} value={sign}>{sign}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t.form.birthDate}</FormLabel>
                        <FormControl>
                            <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="birthTime"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t.form.birthTime}</FormLabel>
                        <FormControl>
                            <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                 <FormField
                  control={form.control}
                  name="birthPlace"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.form.birthPlace}</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Paris, France" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" size="lg" className="mt-4">
                  {t.form.submit}
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </Form>
          </>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
