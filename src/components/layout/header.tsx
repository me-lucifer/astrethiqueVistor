"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/language-toggle';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Gem } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

const translations = {
  en: {
    nav: [
      { href: '/discover', label: 'Discover' },
      { href: '/conferences', label: 'Conferences' },
      { href: '/how-it-works', label: 'How It Works' },
      { href: '/content-hub', label: 'Content Hub' },
      { href: '/pricing', label: 'Pricing' },
    ],
    actions: [
      { href: '/wallet', label: 'Wallet' },
      { href: '/appointments', label: 'Appointments' },
    ],
    dashboard: 'Dashboard',
    support: 'Support',
    menu: 'Open menu',
  },
  fr: {
    nav: [
      { href: '/discover', label: 'Découvrir' },
      { href: '/conferences', label: 'Conférences' },
      { href: '/how-it-works', label: 'Comment ça marche' },
      { href: '/content-hub', label: 'Contenus' },
      { href: '/pricing', label: 'Tarifs' },
    ],
    actions: [
      { href: '/wallet', label: 'Portefeuille' },
      { href: '/appointments', label: 'Rendez-vous' },
    ],
    dashboard: 'Tableau de bord',
    support: 'Support',
    menu: 'Ouvrir le menu',
  },
};

export function Header() {
  const { language } = useLanguage();
  const t = translations[language];

  const allNavLinks = [...t.nav, { href: '/support', label: t.support }];
  const allActionLinks = [...t.actions, { href: '/dashboard', label: t.dashboard }];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-headline text-lg font-bold text-primary transition-transform hover:scale-[1.01]">
            <Gem className="h-6 w-6" />
            <span className="hidden sm:inline">Astrethique</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-4 text-sm font-medium">
            {allNavLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-foreground/70 hover:text-foreground transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden lg:flex items-center gap-2">
           {allActionLinks.map((link) => (
              <Button key={link.href} variant="ghost" asChild className="transition-transform hover:scale-[1.01]">
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          <LanguageToggle />
        </div>

        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">{t.menu}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[340px]">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b">
                   <Link href="/" className="flex items-center gap-2 font-headline text-lg font-bold text-primary">
                      <Gem className="h-6 w-6" />
                      <span>Astrethique</span>
                   </Link>
                </div>
                <nav className="flex-1 p-4 flex flex-col gap-2">
                  {[...allNavLinks, ...allActionLinks].map((link) => (
                    <Button key={link.href} variant="ghost" className="justify-start text-base" asChild>
                      <Link href={link.href}>
                        {link.label}
                      </Link>
                    </Button>
                  ))}
                </nav>
                <div className="p-4 border-t">
                  <LanguageToggle />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
