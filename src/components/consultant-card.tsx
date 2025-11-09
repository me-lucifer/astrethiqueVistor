
"use client";

import { useState } from "react";
import Image from "next/image";
import { Consultant } from "@/lib/consultants-seeder";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function ConsultantCard({ consultant, onStartNow }: { consultant: Consultant, onStartNow: () => void }) {
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

    return (
        <>
            <Card className="h-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg group motion-safe:hover:scale-[1.01] bg-card/50 hover:bg-card">
                <CardContent className="p-0">
                    <div className="relative">
                        <Image
                            src={`https://picsum.photos/seed/${consultant.id}/400/300`}
                            alt={consultant.nameAlias}
                            width={400}
                            height={300}
                            className="w-full object-cover aspect-[4/3] group-hover:opacity-90 transition-opacity"
                            data-ai-hint="portrait person"
                            loading="lazy"
                        />
                        {consultant.online && (
                            <div className="absolute top-3 right-3 flex items-center gap-2 bg-success/80 backdrop-blur-sm text-success-foreground px-3 py-1 rounded-full text-xs font-bold border border-success-foreground/20">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75 motion-reduce:animate-none"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                </span>
                                Online
                            </div>
                        )}
                        {consultant.promo && (
                            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground border-primary-foreground/20">PROMO</Badge>
                        )}
                    </div>
                    <div className="p-4">
                        <div className="flex justify-between items-start">
                            <h3 className="font-headline text-lg font-bold">{consultant.nameAlias}</h3>
                            <div className="flex items-center gap-1 text-primary shrink-0">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="font-bold text-sm text-foreground">{consultant.rating.toFixed(1)}</span>
                            </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {consultant.languages.map(lang => (
                                <Badge key={lang} variant="outline" className="text-xs">{lang}</Badge>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                            <div className="font-bold text-lg text-primary">
                                From {consultant.ratePerMin.toFixed(2)}€<span className="text-sm font-normal text-foreground/70">/min</span>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                            <Button size="sm" onClick={onStartNow}>
                                Start now
                            </Button>
                            <AlertDialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
                                <Button variant="outline" size="sm" onClick={() => setIsScheduleModalOpen(true)}>
                                    Schedule
                                </Button>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Scheduling unavailable</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Scheduling is part of the demo—available in the Conferences tab.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Close</AlertDialogCancel>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
