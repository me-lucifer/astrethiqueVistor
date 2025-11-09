
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Consultant } from "@/lib/consultants-seeder";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Phone, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { StartNowModal } from "./start-now-modal";

const translations = {
    en: {
        startNow: "Start now",
        schedule: "Schedule",
        online: "Online",
    },
    fr: {
        startNow: "Démarrer",
        schedule: "Planifier",
        online: "En ligne",
    }
}

export function ConsultantCard({ consultant }: { consultant: Consultant }) {
    const { language } = useLanguage();
    const t = translations[language];
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <Card className="h-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-[1.01] bg-card/50 hover:bg-card group">
                <CardContent className="p-0">
                    <div className="relative">
                        <Image
                            src={`https://picsum.photos/seed/${consultant.id}/400/300`}
                            alt={consultant.nameAlias}
                            width={400}
                            height={300}
                            className="w-full object-cover aspect-[4/3] group-hover:opacity-90 transition-opacity"
                            data-ai-hint="portrait person"
                        />
                        {consultant.online && (
                            <div className="absolute top-3 right-3 flex items-center gap-2 bg-success/80 backdrop-blur-sm text-success-foreground px-3 py-1 rounded-full text-xs font-bold border border-success-foreground/20">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                </span>
                                {t.online}
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
                            {consultant.specialties.slice(0, 2).map(spec => (
                                <Badge key={spec} variant="secondary" className="text-xs bg-secondary/10 text-secondary-foreground/80">{spec}</Badge>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                            <div className="font-bold text-lg text-primary">
                                {consultant.ratePerMin.toFixed(2)}€<span className="text-sm font-normal text-foreground/70">/min</span>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                             <Button 
                                size="sm" 
                                disabled={!consultant.online}
                                onClick={() => consultant.online && setIsModalOpen(true)}
                             >
                                <Phone className="mr-2 h-4 w-4"/>
                                {t.startNow}
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/discover?consultant=${consultant.id}`}>
                                    <Calendar className="mr-2 h-4 w-4"/>
                                    {t.schedule}
                                </Link>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <StartNowModal 
                isOpen={isModalOpen} 
                onOpenChange={setIsModalOpen}
                consultant={consultant}
            />
        </>
    );
}
