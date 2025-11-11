
"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Gem, User, LogOut, Globe } from 'lucide-react';
import { NotificationBell } from '@/components/notification-bell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuthModal } from '../auth-modal';
import * as storage from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/language-context';
import { translations } from '@/lib/translations';

function HeaderContent() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<storage.User | null>(null);

  const checkUser = () => {
      setUser(storage.getCurrentUser());
  }

  useEffect(() => {
    checkUser();
    const handleStorageChange = () => checkUser();
    window.addEventListener('storage_change', handleStorageChange);
    return () => window.removeEventListener('storage_change', handleStorageChange);
  }, []);
  
  const handleLoginSuccess = () => {
    checkUser();
    window.dispatchEvent(new Event('storage_change'));
    router.push('/discover');
  };
  
  const handleLogout = () => {
      storage.setCurrentUser(null);
      checkUser();
      window.dispatchEvent(new Event('storage_change'));
      toast({ title: "You've been signed out." });
  }

  const getInitials = (name: string = "") => {
    if (!name || name.trim() === '') return "G";
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }


  const navLinks = [
    { href: '/', label: t.navHome },
    { href: '/discover', label: t.navDiscover },
    { href: '/conferences', label: t.navConferences },
    { href: '/how-it-works', label: t.navHowItWorks },
    { href: '/content-hub', label: t.navContentHub },
    { href: '/support', label: t.navSupport },
  ];
  
  const userNavLinks = [
    { href: '/appointments', label: 'My Appointments' },
  ];

  const isDiscoverActive = (path: string) => {
    return path.startsWith('/discover') || path.startsWith('/consultant/');
  }

  const AuthButtons = () => (
    <>
      <Button variant="ghost" onClick={() => setIsAuthModalOpen(true)} aria-label={t.login}>{t.login}</Button>
      <Button asChild className={pathname === '/register' ? 'bg-primary/80' : ''}>
        <Link href="/register">{t.register}</Link>
      </Button>
    </>
  );

  const UserMenu = () => {
    if (!user) return null;
    const name = `${user.firstName} ${user.lastName}`;
    return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
                <Avatar className="h-6 w-6">
                    <AvatarImage src={`https://i.pravatar.cc/40?u=${user.id}`} alt={name} />
                    <AvatarFallback>{getInitials(name)}</AvatarFallback>
                </Avatar>
                Hi, {user.firstName}
                <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/account/profile"><User className="mr-2 h-4 w-4"/><span>Profile</span></Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4"/>
                <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
    )
  }

  return (
    <>
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-headline text-lg font-bold text-primary transition-transform motion-safe:hover:scale-[1.01]">
            <Gem className="h-6 w-6" />
            <span className="hidden sm:inline">ASTRETHIQUE</span>
          </Link>
          <nav className="hidden xl:flex items-center gap-4 text-sm font-medium">
            {[...navLinks, ...(user ? userNavLinks : [])].map((link) => {
              const isActive = link.href === '/discover' 
                ? isDiscoverActive(pathname)
                : (pathname === '/register' ? link.href === '/register' : (link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)));

              return (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className={cn(
                    "transition-colors",
                    isActive 
                      ? "text-primary font-semibold" 
                      : "text-foreground/70 hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="hidden lg:flex items-center gap-2">
            {user ? <UserMenu /> : (
              pathname === '/register' ? 
              <Button variant="link" onClick={() => setIsAuthModalOpen(true)}>Login</Button>
              : <AuthButtons />
            )}
            <Button variant="ghost" size="icon" onClick={toggleLanguage} aria-label={`Switch to ${language === 'en' ? 'French' : 'English'}`}>
                <Globe className="h-5 w-5" />
            </Button>
            <NotificationBell />
        </div>

        <div className="lg:hidden flex items-center gap-2">
           <NotificationBell />
           <Button variant="ghost" size="icon" onClick={toggleLanguage} aria-label={`Switch to ${language === 'en' ? 'French' : 'English'}`}>
              <Globe className="h-5 w-5" />
           </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[340px] flex flex-col">
              <SheetHeader className="border-b p-4">
                <SheetTitle className="sr-only">Main Menu</SheetTitle>
                 <Link href="/" className="flex items-center gap-2 font-headline text-lg font-bold text-primary">
                    <Gem className="h-6 w-6" />
                    <span>ASTRETHIQUE</span>
                 </Link>
              </SheetHeader>
              <nav className="flex-1 px-4 flex flex-col gap-2 pt-4">
                {[...navLinks, ...(user ? userNavLinks : [])].map((link) => {
                   const isActive = link.href === '/discover'
                    ? isDiscoverActive(pathname)
                    : (pathname === '/register' ? link.href === '/register' : (link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)));
                  return (
                    <Button key={link.href} variant={isActive ? "secondary" : "ghost"} className="justify-start text-base" asChild>
                      <Link href={link.href}>
                        {link.label}
                      </Link>
                    </Button>
                  );
                })}
              </nav>
              <div className="p-4 border-t space-y-2">
                {user ? (
                    <Button variant="outline" className="w-full" onClick={handleLogout}>Sign out</Button>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="ghost" onClick={() => setIsAuthModalOpen(true)}>{t.login}</Button>
                        <Button asChild><Link href="/register">{t.register}</Link></Button>
                    </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
     <AuthModal
        isOpen={isAuthModalOpen}
        onOpenChange={setIsAuthModalOpen}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}

export function Header() {
    return (
        <Suspense fallback={<div className="h-16 border-b" />}>
            <HeaderContent />
        </Suspense>
    )
}
