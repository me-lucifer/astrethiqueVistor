
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

export function ConsultantProfileHeader({ consultant: initialConsultant }: { consultant: ConsultantProfile }) {
    const [consultant, setConsultant] = useState(initialConsultant);
    const [isFavorite, setIsFavorite] = useState(consultant.favorite);
    
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
        } else {
            favorites = favorites.filter(id => id !== consultant.id);
        }
        setSession("consultantFavorites", favorites);
    }
    
    return (
        <TooltipProvider>
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-start">
                {/* Left Column */}
                <div className="w-full lg:w-[320px] shrink-0 space-y-6">
                    <div className="relative shrink-0 w-40 h-40 mx-auto">
                        <Image
                            src={consultant.avatar}
                            alt={consultant.name}
                            width={160}
                            height={160}
                            className="rounded-full object-cover aspect-square border-4 border-card"
                        />
                         {consultant.isOnline && (
                            <div title="Online" aria-label="Consultant is online" className="absolute bottom-2 right-2 flex items-center gap-2 bg-success text-success-foreground px-3 py-1 rounded-full text-xs font-bold border border-background/20">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                                </span>
                                Online
                            </div>
                        )}
                    </div>
                    <div className="text-center">
                        {consultant.prevPricePerMin && (
                            <p className="text-muted-foreground line-through">€{consultant.prevPricePerMin.toFixed(2)}/min</p>
                        )}
                        <p className="text-3xl font-bold text-primary">€{consultant.pricePerMin.toFixed(2)}<span className="text-base font-medium text-muted-foreground">/min</span></p>
                    </div>
                </div>

                {/* Right Column */}
                <div className="w-full">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                             <h1 className="font-headline text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{consultant.name}</h1>
                             <div className="mt-3 flex flex-wrap items-center gap-2">
                                {consultant.badges.map(badge => (
                                    <Badge key={badge} variant={badge === 'Promo 24h' ? 'default' : 'secondary'} className="text-xs rounded-md">
                                        {badge}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="rounded-full h-10 w-10 shrink-0 transition-transform motion-safe:hover:scale-110 active:scale-95"
                            onClick={toggleFavorite}
                            aria-label={isFavorite ? `Remove ${consultant.name} from favorites` : `Add ${consultant.name} to favorites`}
                        >
                            <Heart className={cn("h-6 w-6 transition-all", isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground")} />
                        </Button>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                        <div className="flex items-center gap-1.5 text-primary">
                            <Star className="w-5 h-5 fill-current" />
                            <span className="font-bold text-lg text-foreground">{consultant.rating.toFixed(1)}</span>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="text-sm text-muted-foreground ml-1 cursor-help">({consultant.reviewsCount})</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{consultant.reviewsCount} consultations</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                         <div className="flex gap-2">
                            {consultant.languages.map(lang => (
                                <Badge key={lang} variant="outline" className="rounded-md text-xs" aria-label={`Language: ${lang}`}>{lang}</Badge>
                            ))}
                        </div>
                    </div>

                    <p className="mt-4 text-foreground/80 max-w-prose">{consultant.summary}</p>
                    
                    <div className="mt-4 text-sm">
                        <span className="font-semibold text-foreground/90">Specialties: </span>
                        <span className="text-foreground/80">
                            {consultant.specialties.map((spec, i) => (
                                <React.Fragment key={spec}>
                                    <Link href={`/discover?query=${spec}`} className="underline hover:text-primary">{spec}</Link>
                                    {i < consultant.specialties.length - 1 && ', '}
                                </React.Fragment>
                            ))}
                        </span>
                    </div>

                    <div className="mt-6 border-t border-border/50 pt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        {consultant.verifications.adminApproved && (
                             <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-success" />
                                <span>Admin approved</span>
                            </div>
                        )}
                        {consultant.verifications.kycVerified && (
                             <div className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-success" />
                                <span>KYC/ID verified</span>
                            </div>
                        )}
                         <div className="flex items-center gap-2">
                            <CalendarCheck className="h-4 w-4" />
                            <span>Last review: {consultant.verifications.lastReview}</span>
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
