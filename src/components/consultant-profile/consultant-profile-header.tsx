
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Consultant } from '@/lib/consultants';
import { getSession, setSession } from '@/lib/session';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Heart, CheckCircle, ShieldCheck, CalendarCheck2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function ConsultantProfileHeader({ consultant }: { consultant: Consultant }) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [favorites, setFavorites] = useState<string[]>([]);

    useEffect(() => {
        const favs = getSession<string[]>("discover.favorites.v1") || [];
        setFavorites(favs);
        setIsFavorite(favs.includes(consultant.id));
    }, [consultant.id]);

    const toggleFavorite = () => {
        const newFavorites = isFavorite
            ? favorites.filter(id => id !== consultant.id)
            : [...favorites, consultant.id];
        
        setIsFavorite(!isFavorite);
        setFavorites(newFavorites);
        setSession("discover.favorites.v1", newFavorites);
    }
    
    return (
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            <div className="relative shrink-0">
                <Image
                    src={consultant.cover}
                    alt={consultant.name}
                    width={150}
                    height={150}
                    className="rounded-full object-cover aspect-square border-4 border-card"
                />
                 {consultant.availability.online && (
                    <div className="absolute bottom-2 right-2 flex items-center gap-2 bg-success/80 backdrop-blur-sm text-success-foreground px-3 py-1 rounded-full text-xs font-bold border border-success-foreground/20">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        Online
                    </div>
                )}
            </div>

            <div className="w-full">
                <div className="flex items-start justify-between gap-4">
                    <h1 className="font-headline text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{consultant.name}</h1>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="rounded-full h-10 w-10 shrink-0"
                        onClick={toggleFavorite}
                        aria-label={isFavorite ? `Remove ${consultant.name} from favorites` : `Add ${consultant.name} to favorites`}
                    >
                        <Heart className={cn("h-6 w-6 transition-all", isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
                    </Button>
                </div>
                
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <div className="flex items-center gap-1 text-primary">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="font-bold text-lg text-foreground">{consultant.rating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground ml-1">({consultant.reviews.length} reviews)</span>
                    </div>
                     <div className="flex gap-2">
                        {consultant.languages.map(lang => (
                            <Badge key={lang.code} variant="secondary">{lang.code}</Badge>
                        ))}
                    </div>
                </div>

                <div className="mt-4">
                    <p className="text-muted-foreground">{consultant.specialties.join(', ')}</p>
                </div>
                
                <div className="mt-4 border-t pt-4">
                     <div className="flex items-baseline gap-2">
                        {consultant.promo24h ? (
                            <>
                                <span className="text-3xl font-bold text-primary">{consultant.pricePerMin.toFixed(2)}€/min</span>
                                {consultant.priceWas && (
                                  <span className="text-xl font-medium text-muted-foreground line-through">{consultant.priceWas.toFixed(2)}€/min</span>
                                )}
                            </>
                        ) : (
                            <span className="text-3xl font-bold text-primary">{consultant.pricePerMin.toFixed(2)}€/min</span>
                        )}
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {consultant.adminApproved && <div className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-success" /> Admin approved</div>}
                    {consultant.kycVerified && <div className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-success" /> KYC/ID verified</div>}
                    {consultant.lastReviewDate && <div className="flex items-center gap-1.5"><CalendarCheck2 className="h-3.5 w-3.5" /> Last review: {format(new Date(consultant.lastReviewDate), "PPP")}</div> }
                </div>

            </div>
        </div>
    );
}
