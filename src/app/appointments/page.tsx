
"use client";

import { useState, useEffect } from "react";
import { PlaceholderPage } from "@/components/placeholder-page";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSession, removeSession, setSession } from "@/lib/session";
import { getLocal, setLocal } from "@/lib/local";
import { format } from "date-fns";
import { Video, Phone, MessageSquare, Trash2, Ticket } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge";
import * as storage from '@/lib/storage';
import { AuthModal } from "@/components/auth-modal";

interface Appointment {
    id: string;
    consultantId: string;
    consultantName: string;
    slug: string;
    mode: 'chat' | 'audio' | 'video';
    startIso: string;
    durationMin: number;
    pricePerMin: number;
    type?: 'session'; // For direct bookings
}

interface Rsvp {
    eventId: string;
    title: string;
    dateISO: string;
    type: 'conference';
}

type CombinedAppointment = (Appointment | Rsvp) & { itemType: 'session' | 'conference' };

const modeIcons = {
    chat: MessageSquare,
    audio: Phone,
    video: Video,
}

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<CombinedAppointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<storage.User | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const checkUser = () => {
        const currentUser = storage.getCurrentUser();
        setUser(currentUser);
    };

    useEffect(() => {
        checkUser();
        window.addEventListener('storage_change', checkUser);
        return () => {
            window.removeEventListener('storage_change', checkUser);
        };
    }, []);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        // Fetch direct appointments from session storage
        const storedAppointments = (getSession<Appointment[]>('schedule.holds.v1') || []).map(a => ({...a, itemType: 'session' as const}));
        
        // Fetch conference RSVPs from local storage
        const conferenceRsvps = (getLocal<Rsvp[]>('rsvps') || []).map(r => ({...r, itemType: 'conference' as const}));

        const combined = [...storedAppointments, ...conferenceRsvps];
        
        // Sort by date, soonest first
        combined.sort((a,b) => {
            const dateA = new Date('startIso' in a ? a.startIso : a.dateISO);
            const dateB = new Date('startIso' in b ? b.startIso : b.dateISO);
            return dateA.getTime() - dateB.getTime();
        });

        setAppointments(combined);
        setLoading(false);
    }, [user]);

    const handleCancelAppointment = (id: string, type: 'session' | 'conference') => {
        let updatedAppointments = appointments.filter(apt => {
            if (type === 'session' && apt.itemType === 'session') return apt.id !== id;
            if (type === 'conference' && apt.itemType === 'conference') return apt.eventId !== id;
            return true;
        });

        setAppointments(updatedAppointments);

        // Update the respective storage
        if (type === 'session') {
            const sessionAppointments = getSession<Appointment[]>('schedule.holds.v1') || [];
            const updatedSession = sessionAppointments.filter(apt => apt.id !== id);
            setSession('schedule.holds.v1', updatedSession);
        } else { // conference
            const conferenceRsvps = getLocal<Rsvp[]>('rsvps') || [];
            const updatedRsvps = conferenceRsvps.filter(rsvp => rsvp.eventId !== id);
            setLocal('rsvps', updatedRsvps);
        }
    }
    
    if (loading) {
        return <PlaceholderPage title="Appointments" description="Loading your appointments..." />
    }

    if (!user) {
         return (
            <>
                <PlaceholderPage 
                    title="Appointments" 
                    description="Please log in to see your appointments." 
                />
                <AuthModal isOpen={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} onLoginSuccess={checkUser} />
            </>
        );
    }
    
    if (appointments.length === 0) {
        return <PlaceholderPage title="Appointments" description="You have no upcoming appointments." />;
    }

    const renderSessionCard = (apt: Appointment) => {
        const ModeIcon = modeIcons[apt.mode];
        return (
             <Card key={apt.id}>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>Session with {apt.consultantName}</span>
                        <Link href={`/discover/consultant/${apt.slug}`}>
                            <Button variant="outline" size="sm">View Profile</Button>
                        </Link>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p><strong>Date:</strong> {format(new Date(apt.startIso), 'PPP p')}</p>
                    <p className="flex items-center gap-2"><strong>Mode:</strong> <ModeIcon className="w-4 h-4" /> <span className="capitalize">{apt.mode}</span></p>
                    <p><strong>Duration:</strong> {apt.durationMin} minutes</p>
                    <p><strong>Rate:</strong> €{apt.pricePerMin.toFixed(2)}/min</p>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                                <Trash2 className="mr-2 h-4 w-4" /> Cancel Session
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will cancel your appointment. This action cannot be undone.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Go Back</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleCancelAppointment(apt.id, 'session')}>
                                Yes, Cancel
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
            </Card>
        )
    }
    
    const renderConferenceCard = (rsvp: Rsvp) => {
        const slug = rsvp.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + `-${rsvp.eventId}`;
        return (
             <Card key={rsvp.eventId}>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                            {rsvp.title}
                            <Badge variant="secondary">Conference</Badge>
                        </span>
                        <Link href={`/conferences/${slug}`}>
                            <Button variant="outline" size="sm">View Details</Button>
                        </Link>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p><strong>Date:</strong> {format(new Date(rsvp.dateISO), 'PPP p')}</p>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                                <Trash2 className="mr-2 h-4 w-4" /> Cancel RSVP
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will cancel your RSVP for this conference. This action cannot be undone.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Go Back</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleCancelAppointment(rsvp.eventId, 'conference')}>
                                Yes, Cancel
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
            </Card>
        )
    }

    return (
        <div className="container py-12">
            <div className="flex flex-col items-start gap-4 mb-8">
                <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Your Appointments
                </h1>
                <p className="text-lg text-foreground/80 max-w-2xl">
                Here are your upcoming scheduled sessions and conferences. We'll send you a reminder before they start.
                </p>
            </div>
            <div className="space-y-6">
                {appointments.map(apt => {
                    if (apt.itemType === 'session') {
                        return renderSessionCard(apt as Appointment);
                    }
                    if (apt.itemType === 'conference') {
                        return renderConferenceCard(apt as Rsvp);
                    }
                    return null;
                })}
            </div>
        </div>
    );
}

