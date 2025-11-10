
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Conference, seedConferences } from "@/lib/conferences-seeder";
import { getLocal, setLocal, seedOnce } from "@/lib/local";
import { getSession } from "@/lib/session";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Ticket, CheckCircle, Bell, ExternalLink } from "lucide-react";
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useNotifications } from "@/contexts/notification-context";
import { useToast } from "@/hooks/use-toast";
import { RsvpConfirmationModal } from "./rsvp-confirmation-modal";
import { StartNowModal } from "./start-now-modal";

interface Rsvp {
    eventId: string;
    title: string;
    dateISO: string;
    type: 'conference';
    remind24h: boolean;
    remind1h: boolean;
    remind10m: boolean;
}

export function UpcomingConferences() {
    const [conferences, setConferences] = useState<Conference[]>([]);
    const [rsvps, setRsvps] = useState<Rsvp[]>([]);
    const [selectedConference, setSelectedConference] = useState<Conference | null>(null);
    const [isRsvpModalOpen, setIsRsvpModalOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const { addNotification } = useNotifications();
    const { toast } = useToast();

    useEffect(() => {
        seedOnce("conferences_seeded_v3", seedConferences);
        const storedConferences = getLocal<Conference[]>("conferences");
        if (storedConferences) {
            const sortedConferences = storedConferences
                .filter(c => new Date(c.dateISO) > new Date())
                .sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime());
            setConferences(sortedConferences.slice(0, 3));
        }

        const storedRsvps = getLocal<Rsvp[]>("rsvps");
        if (storedRsvps) {
            setRsvps(storedRsvps);
        }
    }, []);

    const handleRsvpClick = (e: React.MouseEvent, conf: Conference) => {
        e.preventDefault();
        e.stopPropagation();

        const isLoggedIn = getSession('userRegistered') === 'true';
        if (!isLoggedIn) {
            setIsAuthModalOpen(true);
            return;
        }
        
        setSelectedConference(conf);
        
        if (isRsvpd(conf.id)) {
            if(confirm("Are you sure you want to cancel your RSVP?")) {
                handleConfirmRsvp(conf);
            }
        } else {
             setIsRsvpModalOpen(true);
        }
    };
    
    const handleConfirmRsvp = (conf: Conference) => {
        let updatedRsvps;
        if (isRsvpd(conf.id)) {
             updatedRsvps = rsvps.filter(r => r.eventId !== conf.id);
             toast({ title: "RSVP Cancelled" });
        } else {
            const newRsvp: Rsvp = {
                eventId: conf.id,
                title: conf.title,
                dateISO: conf.dateISO,
                type: 'conference',
                remind24h: true,
                remind1h: true,
                remind10m: true
            };
            updatedRsvps = [...rsvps, newRsvp];
            toast({ title: "You're in!", description: "We'll send reminders before it starts." });
        }
        setRsvps(updatedRsvps);
        setLocal("rsvps", updatedRsvps);
        setIsRsvpModalOpen(false);
        setSelectedConference(null);
    };

    const handleReminderChange = (eventId: string, reminder: 'remind24h' | 'remind1h' | 'remind10m', checked: boolean) => {
        const updatedRsvps = rsvps.map(r => r.eventId === eventId ? {...r, [reminder]: checked} : r);
        setRsvps(updatedRsvps);
        setLocal("rsvps", updatedRsvps);

        if(checked) {
            const conference = conferences.find(c => c.id === eventId);
            if (conference) {
                const reminderText = {
                    remind24h: "24 hours",
                    remind1h: "1 hour",
                    remind10m: "10 minutes"
                }
                addNotification({
                    title: `Reminder set for "${conference.title}"`,
                    body: `We'll remind you ${reminderText[reminder]} before the event.`,
                    category: 'session',
                })
            }
        }
    }

    const isRsvpd = (id: string) => rsvps.some(r => r.eventId === id);
    const getRsvp = (id: string) => rsvps.find(r => r.eventId === id);

    const formatDate = (dateISO: string) => {
        return new Intl.DateTimeFormat(undefined, { dateStyle: 'full', timeStyle: 'short' }).format(new Date(dateISO));
    };
    
    if (!conferences.length) {
        return <p className="text-center text-muted-foreground">No upcoming conferences at this time.</p>;
    }

    return (
        <>
            <div className="space-y-6">
                {conferences.map((conference) => {
                    const rsvpDetails = getRsvp(conference.id);
                    return (
                    <Link key={conference.id} href={`/conferences/${conference.slug}`} className="group block">
                         <Card className="transition-all duration-300 ease-in-out hover:shadow-lg bg-card/50 hover:bg-card">
                            <CardHeader>
                                <CardTitle className="font-headline text-xl group-hover:text-primary">{conference.title}</CardTitle>
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
                                <Badge variant="secondary" className="bg-green-600/10 text-green-400 border-green-600/20">Free</Badge>
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={(e) => handleRsvpClick(e, conference)} variant={isRsvpd(conference.id) ? "secondary" : "default"} aria-label={isRsvpd(conference.id) ? `Cancel RSVP for ${conference.title}` : `RSVP for ${conference.title}`}>
                                        {isRsvpd(conference.id) ? <CheckCircle className="mr-2 h-4 w-4" /> : <Ticket className="mr-2 h-4 w-4" />}
                                        {isRsvpd(conference.id) ? "Going" : "RSVP"}
                                    </Button>

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="icon" className="h-9 w-9" disabled={!isRsvpd(conference.id)} onClick={(e) => e.preventDefault()} aria-label={`Set reminders for ${conference.title}`}>
                                                <Bell className="h-4 w-4" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-60">
                                            <div className="grid gap-4">
                                                <div className="space-y-2">
                                                    <h4 className="font-medium leading-none">Reminders</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Set reminders for this event.
                                                    </p>
                                                </div>
                                                <div className="grid gap-2">
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox id={`upcoming-remind-24h-${conference.id}`} checked={rsvpDetails?.remind24h} onCheckedChange={(c) => handleReminderChange(conference.id, "remind24h", c as boolean)} />
                                                        <Label htmlFor={`upcoming-remind-24h-${conference.id}`}>24 hours before</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox id={`upcoming-remind-1h-${conference.id}`} checked={rsvpDetails?.remind1h} onCheckedChange={(c) => handleReminderChange(conference.id, "remind1h", c as boolean)}/>
                                                        <Label htmlFor={`upcoming-remind-1h-${conference.id}`}>1 hour before</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox id={`upcoming-remind-10m-${conference.id}`} checked={rsvpDetails?.remind10m} onCheckedChange={(c) => handleReminderChange(conference.id, "remind10m", c as boolean)}/>
                                                        <Label htmlFor={`upcoming-remind-10m-${conference.id}`}>10 minutes before</Label>
                                                    </div>
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </CardFooter>
                         </Card>
                    </Link>
                )})}
            </div>
            {selectedConference && (
                <RsvpConfirmationModal
                    isOpen={isRsvpModalOpen}
                    onOpenChange={setIsRsvpModalOpen}
                    conference={selectedConference}
                    onConfirm={() => handleConfirmRsvp(selectedConference)}
                />
            )}
            
            <StartNowModal
                isOpen={isAuthModalOpen}
                onOpenChange={setIsAuthModalOpen}
            />
        </>
    );
}
