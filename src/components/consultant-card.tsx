
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Consultant } from "@/lib/consultants";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Bell, Heart, BookOpen, Mic, Video } from "lucide-react";
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
import { getLocal, setLocal } from "@/lib/local";
import { cn } from "@/lib/utils";

const specialtyMap: Record<string, { icon: string }> = {
    Love: { icon: "💖" },
    Work: { icon: "💼" },
    Health: { icon: "🌿" },
    Money: { icon: "💰" },
    "Life Path": { icon: "🗺️" }
}

export function ConsultantCard({ consultant, onStartNow }: { consultant: Consultant, onStartNow: () => void }) {
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const favorites = getLocal<string[]>("favorites") || [];
        setIsFavorite(favorites.includes(consultant.id));
    }, [consultant.id]);

    const toggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const favorites = getLocal<string[]>("favorites") || [];
        const newIsFavorite = !isFavorite;
        if (newIsFavorite) {
            setLocal("favorites", [...favorites, consultant.id]);
        } else {
            setLocal("favorites", favorites.filter(id => id !== consultant.id));
        }
        setIsFavorite(newIsFavorite);
    }

    const handleActionClick = (e: React.MouseEvent, action: () => void) => {
        e.preventDefault();
        e.stopPropagation();
        action();
    }

    const StartNowButton = () => (
        <Button size="sm" onClick={(e) => handleActionClick(e, onStartNow)}>Start now</Button>
    );
    const ScheduleButton = () => (
        <Button asChild variant="outline" size="sm" onClick={(e) => e.preventDefault() /* Allow link to handle nav */}>
            <Link href={`/consultant/${consultant.slug}#availability-section`}>Schedule</Link>
        </Button>
    );
     const NotifyButton = () => (
        <Button variant="outline" size="sm" onClick={(e) => handleActionClick(e, () => setIsNotifyModalOpen(true))}><Bell className="mr-2 h-4 w-4" /> Notify me</Button>
    );

    return (
        <TooltipProvider>
            <Link href={`/consultant/${consultant.slug}`} className="group">
                <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg bg-card/50 hover:bg-card">
                    <CardContent className="p-0">
                        <div className="relative">
                            <Image
                                src={consultant.photo}
                                alt={consultant.nameAlias}
                                width={400}
                                height={300}
                                className="w-full object-cover aspect-[4/3] group-hover:opacity-90 transition-opacity"
                                data-ai-hint="portrait person"
                                loading="lazy"
                            />
                            {consultant.online && (
                                <div className="absolute top-3 left-3 flex items-center gap-2 bg-success/80 backdrop-blur-sm text-success-foreground px-3 py-1 rounded-full text-xs font-bold border border-success-foreground/20">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75 motion-reduce:animate-none"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                    </span>
                                    Online
                                </div>
                            )}
                            <Button
                                size="icon"
                                variant="ghost"
                                className="absolute top-2 right-2 rounded-full h-8 w-8 bg-black/20 text-white hover:bg-black/40 hover:text-white"
                                onClick={toggleFavorite}
                                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                            >
                                <Heart className={cn("h-5 w-5", isFavorite ? "fill-red-500 text-red-500" : "text-white")} />
                            </Button>
                            <div className="absolute bottom-3 right-3 flex gap-2">
                                {(consultant.promo || consultant.badges.promo24h) && (
                                    <Badge className="bg-primary text-primary-foreground border-primary-foreground/20">PROMO</Badge>
                                )}
                                {consultant.badges.topRated && (
                                    <Badge variant="secondary">Top Rated</Badge>
                                )}
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-start gap-2">
                                <h3 className="font-headline text-lg font-bold truncate flex-1 group-hover:text-primary" title={consultant.nameAlias}>{consultant.nameAlias}</h3>
                                <div className="flex items-center gap-1 text-primary shrink-0">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span className="font-bold text-sm text-foreground">{consultant.rating.toFixed(1)}</span>
                                </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mt-1 truncate" title={consultant.specialties.join(', ')}>
                                {consultant.specialties.join(', ')}
                            </p>

                            <div className="mt-2 flex items-center justify-between">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="font-bold text-base text-primary cursor-pointer">
                                            From {consultant.ratePerMin.toFixed(2)}€<span className="text-sm font-normal text-foreground/70">/min</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Per-minute pricing. You only pay for the time you're connected.</p>
                                    </TooltipContent>
                                </Tooltip>
                                <div className="flex flex-wrap gap-2">
                                    {consultant.languages.map(lang => (
                                        <Badge key={lang} variant="outline" className="text-xs">{lang}</Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-2">
                            {consultant.online ? (
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
                        <div className="flex flex-wrap gap-1 w-full">
                            {consultant.specialties.slice(0, 3).map(spec => (
                                <Badge key={spec} variant="outline" className="text-xs font-normal gap-1.5 bg-background">
                                    {specialtyMap[spec]?.icon}
                                    {spec}
                                </Badge>
                            ))}
                        </div>
                        {consultant.content && (
                            <div className="flex items-center gap-4 text-xs text-muted-foreground w-full">
                                {consultant.content.articles > 0 && <div className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5"/><span>{consultant.content.articles}</span></div>}
                                {consultant.content.podcasts > 0 && <div className="flex items-center gap-1"><Mic className="h-3.5 w-3.5"/><span>{consultant.content.podcasts}</span></div>}
                                {consultant.content.conferences > 0 && <div className="flex items-center gap-1"><Video className="h-3.5 w-3.5"/><span>{consultant.content.conferences}</span></div>}
                            </div>
                        )}
                    </CardFooter>
                </Card>
            </Link>

            <AlertDialog open={isNotifyModalOpen} onOpenChange={setIsNotifyModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Notification set!</AlertDialogTitle>
                    <AlertDialogDescription>
                        We'll let you know when {consultant.nameAlias} is back online.
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
