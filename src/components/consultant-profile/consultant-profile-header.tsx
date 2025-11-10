
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ConsultantProfile } from '@/lib/consultant-profile';
import { getSession, setSession } from '@/lib/session';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Heart, CheckCircle, ShieldCheck, CalendarCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

export function ConsultantProfileHeader({ consultant: initialConsultant }: { consultant: ConsultantProfile }) {
    const [consultant, setConsultant] = useState(initialConsultant);
    const [isFavorite, setIsFavorite] = useState(consultant.favorite);
    const { toast } = useToast();
    
    useEffect(() => {
        setConsultant(initialConsultant);
        setIsFavorite(initialConsultant.favorite);
    }, [initialConsultant]);

    const toggleFavorite = () => {
        const newIsFavorite = !isFavorite;
        setIsFavorite(newIsFavorite);
        
        const updatedConsultant = { ...consultant, favorite: newIsFavorite };
        setConsultant(updatedConsultant);
        setSession("consultantProfile", updatedConsultant);
        
        let favorites = getSession<string[]>("consultantFavorites") || [];
        if (newIsFavorite) {
            if (!favorites.includes(consultant.id)) {
                favorites.push(consultant.id);
            }
            toast({
                title: "Added to your favorites",
            });
        } else {
            favorites = favorites.filter(id => id !== consultant.id);
            toast({
                title: "Removed from your favorites",
            });
        }
        setSession("consultantFavorites", favorites);
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
                                <div className="flex gap-2">
                                    {consultant.languages.map(lang => (
                                        <Badge key={lang} variant="outline" className="rounded-md text-xs" aria-label={`Language: ${lang}`}>{lang}</Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="text-left sm:text-right shrink-0">
                            {consultant.prevPricePerMin && (
                                <p className="text-muted-foreground line-through text-sm">€{consultant.prevPricePerMin.toFixed(2)}/min</p>
                            )}
                            <p className="text-2xl font-bold text-primary">€{consultant.pricePerMin.toFixed(2)}<span className="text-base font-medium text-muted-foreground">/min</span></p>
                        </div>
                    </div>
                    
                    <p className="mt-4 text-foreground/80 max-w-prose text-sm">{consultant.summary}...</p>
                    
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
                         <div className="flex items-center gap-1.5">
                            <CalendarCheck className="h-3.5 w-3.5" />
                            <span>Last review: {new Date(consultant.verifications.lastReview).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
