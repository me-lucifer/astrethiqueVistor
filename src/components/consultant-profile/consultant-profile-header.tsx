
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ConsultantProfile } from '@/lib/consultant-profile';
import { getSession, setSession } from '@/lib/session';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ConsultantProfileHeader({ consultant: initialConsultant }: { consultant: ConsultantProfile }) {
    const [consultant, setConsultant] = useState(initialConsultant);
    const [isFavorite, setIsFavorite] = useState(consultant.favorite);
    
    // This effect ensures that if the parent component somehow passes a new consultant,
    // the state is updated.
    useEffect(() => {
        setConsultant(initialConsultant);
        setIsFavorite(initialConsultant.favorite);
    }, [initialConsultant]);

    const toggleFavorite = () => {
        const newIsFavorite = !isFavorite;
        setIsFavorite(newIsFavorite);
        
        // Update the favorite status in the component's state
        const updatedConsultant = { ...consultant, favorite: newIsFavorite };
        setConsultant(updatedConsultant);
        
        // Persist the change to sessionStorage
        setSession("consultantProfile", updatedConsultant);
        
        // Also update the global favorites list if it exists
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
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            <div className="relative shrink-0">
                <Image
                    src={consultant.avatar}
                    alt={consultant.name}
                    width={160}
                    height={160}
                    className="rounded-full object-cover aspect-square border-4 border-card"
                />
                 {consultant.isOnline && (
                    <div className="absolute bottom-2 right-2 flex items-center gap-2 bg-success/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold border border-white/20">
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
                        className="rounded-full h-10 w-10 shrink-0 transition-transform motion-safe:hover:scale-110 active:scale-95"
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
                        <span className="text-sm text-muted-foreground ml-1">({consultant.reviewsCount} reviews)</span>
                    </div>
                     <div className="flex gap-2">
                        {consultant.languages.map(lang => (
                            <Badge key={lang} variant="secondary">{lang}</Badge>
                        ))}
                    </div>
                </div>

                <div className="mt-4">
                    <p className="text-muted-foreground">{consultant.specialties.join(' · ')}</p>
                </div>
            </div>
        </div>
    );
}
