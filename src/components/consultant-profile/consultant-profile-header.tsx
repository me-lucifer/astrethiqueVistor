
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ConsultantProfile } from '@/lib/consultant-profile';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Heart, CheckCircle, ShieldCheck, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import * as authLocal from '@/lib/authLocal';
import { AuthModal } from '../auth-modal';
import { useLanguage } from '@/contexts/language-context';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';

export function ConsultantProfileHeader({ consultant: initialConsultant, onDemoAction }: { consultant: ConsultantProfile, onDemoAction: (action: string, value?: any) => void }) {
    const [consultant, setConsultant] = useState(initialConsultant);
    const [isFavorite, setIsFavorite] = useState(consultant.favorite);
    const [user, setUser] = useState<authLocal.User | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const { toast } = useToast();
    const { language } = useLanguage();
    const [isDev, setIsDev] = useState(false);

    useEffect(() => {
        setIsDev(process.env.NODE_ENV === 'development');
    }, []);

    const checkUserAndFavorite = () => {
        const currentUser = authLocal.getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
            setIsFavorite(currentUser.favorites.consultants.includes(consultant.id) || false);
        } else {
            setIsFavorite(false);
        }
    }

    useEffect(() => {
        setConsultant(initialConsultant);
        checkUserAndFavorite();
        
        window.addEventListener('storage', checkUserAndFavorite);
        return () => window.removeEventListener('storage', checkUserAndFavorite);
    }, [initialConsultant, consultant.id]);

    const onLoginSuccess = () => {
        checkUserAndFavorite();
        toggleFavorite(); // Re-run the favorite action after login
    }

    const toggleFavorite = () => {
        const currentUser = authLocal.getCurrentUser();
        if (!currentUser) {
            setIsAuthModalOpen(true);
            return;
        }

        const newIsFavorite = !isFavorite;
        
        const updatedFavorites = newIsFavorite
            ? [...currentUser.favorites.consultants, consultant.id]
            : currentUser.favorites.consultants.filter(id => id !== consultant.id);
        
        authLocal.updateUser(currentUser.id, { 
            favorites: {
                ...currentUser.favorites,
                consultants: updatedFavorites
            }
        });
        
        setIsFavorite(newIsFavorite);
        window.dispatchEvent(new Event('storage'));

        toast({
            title: newIsFavorite ? "Added to your favorites" : "Removed from your favorites",
        });
    }

    const formatCurrency = (amount?: number) => {
        if (amount === undefined) return '';
        const locale = language === 'fr' ? 'fr-FR' : 'en-IE';
        return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(amount);
    }
    
    return (
        <TooltipProvider>
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                <div className="relative shrink-0 w-24 h-24 mx-auto md:mx-0">
                    <Image
                        src={consultant.avatar}
                        alt={consultant.name}
                        width={96}
                        height={96}
                        className="rounded-full object-cover aspect-square border-4 border-card"
                    />
                     {consultant.isOnline && (
                        <div title="Online" aria-label="Consultant is online" className="absolute bottom-0 right-0 flex items-center gap-2 bg-success text-success-foreground px-2 py-0.5 rounded-full text-xs font-bold border-2 border-background">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-75 motion-reduce:animate-none"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                            </span>
                        </div>
                    )}
                </div>

                <div className="w-full">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div>
                             <div className="flex items-center gap-3">
                                <h1 className="font-headline text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{consultant.name}</h1>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="rounded-full h-8 w-8 shrink-0 transition-transform motion-safe:hover:scale-110 active:scale-95"
                                    onClick={toggleFavorite}
                                    aria-pressed={isFavorite}
                                    aria-label={isFavorite ? `Remove ${consultant.name} from favorites` : `Add ${consultant.name} to favorites`}
                                >
                                    <Heart className={cn("h-5 w-5 transition-all", isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground")} />
                                </Button>
                             </div>
                             <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                                <div className="flex items-center gap-1.5 text-primary">
                                    <Star className="w-5 h-5 fill-current" />
                                    <span className="font-bold text-base text-foreground">{consultant.rating.toFixed(1)}</span>
                                    <span className="text-sm text-muted-foreground ml-1">({consultant.reviewsCount} reviews)</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="text-left sm:text-right shrink-0">
                                {consultant.prevPricePerMin && (
                                    <p className="text-muted-foreground line-through text-sm">{formatCurrency(consultant.prevPricePerMin)}/min</p>
                                )}
                                <p className="text-2xl font-bold text-primary">{formatCurrency(consultant.pricePerMin)}<span className="text-base font-medium text-muted-foreground">/min</span></p>
                            </div>
                            {isDev && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><MoreHorizontal className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Demo Controls</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onSelect={() => onDemoAction('seed-wallet', 25)}>Seed wallet +€25</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => onDemoAction('seed-wallet', 10)}>Seed wallet +€10</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => onDemoAction('set-balance', 0)}>Set wallet to €0</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onSelect={() => onDemoAction('toggle-lock')}>Toggle Budget Lock</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => onDemoAction('toggle-emergency')}>Toggle Emergency Used</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onSelect={() => onDemoAction('clear-spend-log')}>Clear Spend Log</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </div>
                    
                    <p className="mt-4 text-foreground/80 max-w-prose text-sm">{consultant.summary}...</p>

                    <div className="mt-4 mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
                        {consultant.specialties?.length > 0 && consultant.specialties.map(specialty => (
                            <Badge key={specialty} variant="default" className="text-xs">{specialty}</Badge>
                        ))}
                        {consultant.types?.length > 0 && consultant.types.map(type => (
                             <Badge key={type} variant="outline" className="text-xs">{type}</Badge>
                        ))}
                         {consultant.languages?.length > 0 && consultant.languages.map(lang => (
                             <Badge key={lang} variant="secondary" className="bg-muted text-muted-foreground text-xs">{lang}</Badge>
                        ))}
                    </div>
                    
                    <div className="mt-4 border-t border-border/50 pt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 cursor-help">
                                    <CheckCircle className="h-3.5 w-3.5 text-success" />
                                    <span>Admin approved</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Profile verified by platform admin.</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 cursor-help">
                                    <ShieldCheck className="h-3.5 w-3.5 text-success" />
                                    <span>KYC/ID verified</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Identity documents verified.</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </div>
             <AuthModal isOpen={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} onLoginSuccess={onLoginSuccess} />
        </TooltipProvider>
    );
}
