

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Consultant } from "@/lib/consultants";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Bell, Heart, BookOpen, Mic, Video, CheckCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { getSession, setSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const specialtyMap: Record<string, { icon: string }> = {
    Love: { icon: "💖" },
    Work: { icon: "💼" },
    Health: { icon: "🌿" },
    Money: { icon: "💰" },
    "Life Path": { icon: "🗺️" }
}

const zodiacIconMap: Record<string, string> = {
    Aries: "♈",
    Taurus: "♉",
    Gemini: "♊",
    Cancer: "♋",
    Leo: "♌",
    Virgo: "♍",
    Libra: "♎",
    Scorpio: "♏",
    Sagittarius: "♐",
    Capricorn: "♑",
    Aquarius: "♒",
    Pisces: "♓",
};


export function ConsultantCard({ consultant, onStartNow }: { consultant: Consultant, onStartNow: () => void }) {
    const router = useRouter();
    const { toast } = useToast();
    const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isNotifying, setIsNotifying] = useState(false);

    useEffect(() => {
        const favs = getSession<string[]>("discover.favorites.v1") || [];
        setIsFavorite(favs.includes(consultant.id));
        
        const notifyList = getSession<string[]>("notify.me.v1") || [];
        setIsNotifying(notifyList.includes(consultant.id));
    }, [consultant.id]);

    const toggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        const favs = getSession<string[]>("discover.favorites.v1") || [];
        const newFavorites = isFavorite
            ? favs.filter(id => id !== consultant.id)
            : [...favs, consultant.id];
        
        setIsFavorite(!isFavorite);
        setSession("discover.favorites.v1", newFavorites);
    }

    const handleActionClick = (e: React.MouseEvent, action: () => void) => {
        e.preventDefault();
        e.stopPropagation();
        action();
    }
    
    const handleScheduleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/discover/consultant/${consultant.slug}#availability-section`);
    };

    const handleNotifyClick = () => {
        const notifyList = getSession<string[]>("notify.me.v1") || [];
        const newNotifyList = isNotifying
            ? notifyList.filter(id => id !== consultant.id)
            : [...notifyList, consultant.id];
        
        setIsNotifying(!isNotifying);
        setSession("notify.me.v1", newNotifyList);

        if (!isNotifying) {
            setIsNotifyModalOpen(true);
        } else {
             toast({
                title: "Notification removed",
                description: `You will no longer be notified when ${consultant.name} is online.`,
            });
        }
    };

    const StartNowButton = () => (
        <Button size="sm" onClick={(e) => handleActionClick(e, onStartNow)} aria-label={`Start now with ${consultant.name}`}>Start now</Button>
    );
    const ScheduleButton = () => (
        <Button variant="outline" size="sm" onClick={handleScheduleClick} aria-label={`Schedule a session with ${consultant.name}`}>
            Schedule
        </Button>
    );
     const NotifyButton = () => (
        <Button 
            variant={isNotifying ? "secondary" : "outline"} 
            size="sm" 
            onClick={(e) => handleActionClick(e, handleNotifyClick)}
            aria-label={isNotifying ? `Stop notifications for ${consultant.name}`: `Notify me when ${consultant.name} is online`}
        >
            {isNotifying ? <CheckCircle className="mr-2 h-4 w-4" /> : <Bell className="mr-2 h-4 w-4" />}
            {isNotifying ? "Notifying" : "Notify me"}
        </Button>
    );
    
    const isOnline = consultant.availability.online;
    const availabilityText = isOnline ? "Online" : (getSession<string[]>('busyConsultants')?.includes(consultant.id) ? "Busy" : "Offline");
    const availabilityClass = isOnline ? "bg-success/80" : (availabilityText === "Busy" ? "bg-amber-500/80" : "bg-muted");

    return (
        <TooltipProvider>
            <Link href={`/discover/consultant/${consultant.slug}`} className="group">
                <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg bg-card/50 hover:bg-card">
                    <CardContent className="p-0">
                        <div className="relative">
                            {consultant.cover && (
                                <Image
                                    src={consultant.cover}
                                    alt={consultant.name}
                                    width={400}
                                    height={300}
                                    className="w-full object-cover aspect-[4/3] group-hover:opacity-90 transition-opacity"
                                    data-ai-hint="portrait person"
                                    loading="lazy"
                                />
                            )}
                            <div className={cn(
                                "absolute top-3 left-3 flex items-center gap-2 backdrop-blur-sm text-success-foreground px-3 py-1 rounded-full text-xs font-bold border border-success-foreground/20",
                                availabilityClass
                            )}>
                                {isOnline && (
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75 motion-reduce:animate-none"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                    </span>
                                )}
                                {availabilityText}
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="absolute top-2 right-2 rounded-full h-8 w-8 bg-black/20 text-white hover:bg-black/40 hover:text-white"
                                onClick={toggleFavorite}
                                aria-label={isFavorite ? `Remove ${consultant.name} from favorites` : `Add ${consultant.name} to favorites`}
                            >
                                <Heart className={cn("h-5 w-5", isFavorite ? "fill-red-500 text-red-500" : "text-white")} />
                            </Button>
                            <div className="absolute bottom-3 right-3 flex gap-2">
                                {consultant.promo24h && (
                                    <Badge className="bg-primary text-primary-foreground border-primary-foreground/20">PROMO</Badge>
                                )}
                                {consultant.badges && consultant.badges.includes("Top Rated") && (
                                    <Badge variant="secondary">Top Rated</Badge>
                                )}
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-start gap-2">
                                <h3 className="font-headline text-lg font-bold truncate flex-1 group-hover:text-primary" title={consultant.name}>{consultant.name}</h3>
                                <div className="flex items-center gap-1 text-primary shrink-0">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span className="font-bold text-sm text-foreground">{consultant.rating.toFixed(1)}</span>
                                </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mt-1 truncate" title={consultant.specialties?.join(', ')}>
                                {consultant.specialties?.join(', ')}
                            </p>

                            <div className="mt-2 flex items-center justify-between">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="font-bold text-base text-primary cursor-pointer">
                                            From {consultant.pricePerMin.toFixed(2)}€<span className="text-sm font-normal text-foreground/70">/min</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Per-minute pricing. You only pay for the time you're connected.</p>
                                    </TooltipContent>
                                </Tooltip>
                                <div className="flex flex-wrap gap-2">
                                    {consultant.languages.map(lang => (
                                        <Badge key={lang.code} variant="outline" className="text-xs">{lang.code}</Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-2">
                            {isOnline ? (
                                    <>
                                        <StartNowButton />
                                        <ScheduleButton />
                                    </>
                                ) : (
                                    <>
                                        <ScheduleButton />
                                        <NotifyButton />
                                    </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 mt-auto flex flex-col gap-3">
                         {consultant.specialties && consultant.specialties.length > 0 && (
                            <div className="flex flex-wrap gap-1 w-full">
                                {consultant.specialties.slice(0, 3).map(spec => (
                                    <Badge key={spec} variant="outline" className="text-xs font-normal gap-1.5 bg-background">
                                        {specialtyMap[spec as keyof typeof specialtyMap]?.icon}
                                        {spec}
                                    </Badge>
                                ))}
                                {consultant.specialties.length > 3 && (
                                    <Badge variant="outline" className="text-xs font-normal bg-background">
                                        +{consultant.specialties.length - 3}
                                    </Badge>
                                )}
                            </div>
                        )}
                        <div className="flex flex-wrap gap-1 w-full">
                            {consultant.types?.[0] && (
                                <Badge variant="outline" className="text-xs font-normal bg-background" aria-label={`Reading type: ${consultant.types[0]}`}>
                                    {consultant.types[0]}
                                </Badge>
                            )}
                            {consultant.types && consultant.types.length > 1 && (
                                 <Badge variant="outline" className="text-xs font-normal bg-background">
                                    +{consultant.types.length - 1}
                                </Badge>
                            )}
                             {consultant.specializesInSigns?.[0] && (
                                <Badge variant="outline" className="text-xs font-normal gap-1.5 bg-background" aria-label={`Specializes in: ${consultant.specializesInSigns[0]}`}>
                                    {zodiacIconMap[consultant.specializesInSigns[0]]}
                                    {consultant.specializesInSigns[0]}
                                </Badge>
                            )}
                             {consultant.specializesInSigns && consultant.specializesInSigns.length > 1 && (
                                <Badge variant="outline" className="text-xs font-normal bg-background">
                                    +{consultant.specializesInSigns.length - 1}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground w-full">
                            {consultant.contentCounts.articles > 0 && <div className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5"/><span>{consultant.contentCounts.articles}</span></div>}
                            {consultant.contentCounts.podcasts > 0 && <div className="flex items-center gap-1"><Mic className="h-3.5 w-3.5"/><span>{consultant.contentCounts.podcasts}</span></div>}
                            {consultant.contentCounts.conferences > 0 && <div className="flex items-center gap-1"><Video className="h-3.5 w-3.5"/><span>{consultant.contentCounts.conferences}</span></div>}
                        </div>
                    </CardFooter>
                </Card>
            </Link>

            <AlertDialog open={isNotifyModalOpen} onOpenChange={setIsNotifyModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Notification set!</AlertDialogTitle>
                    <AlertDialogDescription>
                        We'll let you know when {consultant.name} is back online.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </TooltipProvider>
    );
}
