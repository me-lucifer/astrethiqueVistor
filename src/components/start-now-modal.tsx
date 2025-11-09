
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import { Consultant } from "@/lib/consultants-seeder";
import Link from "next/link";
import { Info, LogIn, UserPlus } from "lucide-react";

const translations = {
  en: {
    title: "Per-Minute Billing",
    description: (rate: number) => `You are about to start a session with this consultant. Your account will be billed at a rate of €${rate.toFixed(2)} per minute.`,
    loginPrompt: "Please log in or register to continue.",
    login: "Login",
    register: "Register",
    close: "Close",
  },
  fr: {
    title: "Facturation à la minute",
    description: (rate: number) => `Vous êtes sur le point de démarrer une session avec ce consultant. Votre compte sera facturé au tarif de ${rate.toFixed(2)} € par minute.`,
    loginPrompt: "Veuillez vous connecter ou vous inscrire pour continuer.",
    login: "Connexion",
    register: "S'inscrire",
    close: "Fermer",
  },
};

export function StartNowModal({
  isOpen,
  onOpenChange,
  consultant
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  consultant: Consultant;
}) {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mx-auto mb-4">
            <Info className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">{t.title}</DialogTitle>
          <DialogDescription className="text-center">
            {t.description(consultant.ratePerMin)}
            <br/>
            {t.loginPrompt}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center flex-col sm:flex-col sm:space-x-0 gap-2">
            <div className="grid grid-cols-2 gap-2">
                 <Button asChild>
                    <Link href="/login">
                        <LogIn className="mr-2 h-4 w-4"/>
                        {t.login}
                    </Link>
                </Button>
                <Button asChild>
                    <Link href="/register">
                        <UserPlus className="mr-2 h-4 w-4"/>
                        {t.register}
                    </Link>
                </Button>
            </div>
            <DialogClose asChild>
                <Button type="button" variant="outline">
                {t.close}
                </Button>
            </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
