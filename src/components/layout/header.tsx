
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Gem } from 'lucide-react';
import { NotificationBell } from '@/components/notification-bell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlobalSearch } from '../global-search';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/discover', label: 'Discover' },
  { href: '/conferences', label: 'Conferences' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/content-hub', label: 'Content Hub' },
  { href: '/support', label: 'Support' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-headline text-lg font-bold text-primary transition-transform motion-safe:hover:scale-[1.01]">
            <Gem className="h-6 w-6" />
            <span className="hidden sm:inline">ASTRETHIQUE</span>
          </Link>
          <nav className="hidden xl:flex items-center gap-4 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
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
        
        <div className="flex-1 max-w-xl hidden md:flex">
          <GlobalSearch />
        </div>

        <div className="hidden lg:flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Register</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled>
                  Visitor <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Visitor</DropdownMenuItem>
                <DropdownMenuItem>Client</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <NotificationBell />
        </div>

        <div className="lg:hidden flex items-center gap-2">
           <NotificationBell />
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
              <div className='p-4'>
                <GlobalSearch />
              </div>
              <nav className="flex-1 px-4 flex flex-col gap-2">
                {navLinks.map((link) => {
                   const isActive = pathname === link.href;
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
                <div className="grid grid-cols-2 gap-2">
                   <Button variant="ghost" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register">Register</Link>
                  </Button>
                </div>
                 <Button variant="outline" disabled className="w-full">
                  Visitor
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
