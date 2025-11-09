
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Conference, seedConferences } from "@/lib/conferences-seeder";
import { getSession, setSession, seedOnce } from "@/lib/session";
import { useLanguage } from "@/contexts/language-context";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Ticket, CheckCircle, Bell } from "lucide-react";
import { format } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';

const translations = {
    en: {
        rsvp: "RSVP",
        details: "Details",
        rsvpd: "Registered",
        reminderNote: "You’ll get reminders 24h/1h/10m before (prototype)."
    },
    fr: {
        rsvp: "S'inscrire",
        details: "Détails",
        rsvpd: "Inscrit",
        reminderNote: "Vous recevrez des rappels 24h/1h/10m avant (prototype)."
    }
};

export function UpcomingConferences() {
    const [conferences, setConferences] = useState<Conference[]>([]);
    const [myConferences, setMyConferences] = useState<string[]>([]);
    const { language } = useLanguage();
    const t = translations[language];

    useEffect(() => {
        seedOnce("conferences_seeded", seedConferences);
        const storedConferences = getSession<Conference[]>("conferences");
        if (storedConferences) {
            const sortedConferences = storedConferences.sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime());
            setConferences(sortedConferences.slice(0, 3));
        }

        const storedMyConferences = getSession<string[]>("myConferences");
        if (storedMyConferences) {
            setMyConferences(storedMyConferences);
        }
    }, []);

    const handleRsvp = (id: string) => {
        const newMyConferences = [...myConferences, id];
        setMyConferences(newMyConferences);
        setSession("myConferences", newMyConferences);
    };

    const isRsvpd = (id: string) => myConferences.includes(id);

    const formatDate = (dateISO: string) => {
        const date = new Date(dateISO);
        const locale = language === 'fr' ? fr : enUS;
        return format(date, "PPP p", { locale });
    };
    
    if (!conferences.length) {
        return null; // or loading skeleton
    }

    return (
        <div className="space-y-6">
            {conferences.map((conference) => (
                 <Card key={conference.id} className="transition-all duration-300 ease-in-out hover:shadow-lg motion-safe:hover:scale-[1.01] bg-card/50 hover:bg-card">
                    <CardHeader>
                        <CardTitle className="font-headline text-xl">{conference.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="flex items-center gap-4 text-sm text-foreground/80">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-primary" />
                                <span>{formatDate(conference.dateISO)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">Host:</span>
                                <span>{conference.hostAlias}</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{conference.language}</Badge>
                            {conference.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="bg-secondary/10 text-secondary-foreground/80">{tag}</Badge>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
                        <div className="flex gap-2">
                             <Button size="sm" onClick={() => handleRsvp(conference.id)} disabled={isRsvpd(conference.id)}>
                                {isRsvpd(conference.id) ? <CheckCircle className="mr-2 h-4 w-4" /> : <Ticket className="mr-2 h-4 w-4" />}
                                {isRsvpd(conference.id) ? t.rsvpd : t.rsvp}
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/conferences?id=${conference.id}`}>
                                    {t.details}
                                </Link>
                            </Button>
                        </div>
                         {isRsvpd(conference.id) && (
                            <div className="flex items-center gap-2 text-xs text-success animate-in fade-in motion-reduce:animate-none">
                                <Bell className="h-4 w-4" />
                               <span>{t.reminderNote}</span>
                            </div>
                        )}
                    </CardFooter>
                 </Card>
            ))}
        </div>
    );
}

