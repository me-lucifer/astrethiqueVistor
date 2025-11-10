
"use client";

import { useState, useEffect } from "react";
import { PlaceholderPage } from "@/components/placeholder-page";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSession, removeSession, setSession } from "@/lib/session";
import { format } from "date-fns";
import { Video, Phone, MessageSquare, Trash2 } from "lucide-react";
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

interface Appointment {
    id: string;
    consultantId: string;
    consultantName: string;
    slug: string;
    mode: 'chat' | 'audio' | 'video';
    startIso: string;
    durationMin: number;
    pricePerMin: number;
}


const modeIcons = {
    chat: MessageSquare,
    audio: Phone,
    video: Video,
}

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedAppointments = getSession<Appointment[]>('schedule.holds.v1') || [];
        // Sort by date, soonest first
        storedAppointments.sort((a,b) => new Date(a.startIso).getTime() - new Date(b.startIso).getTime());
        setAppointments(storedAppointments);
        setLoading(false);
    }, []);

    const handleCancelAppointment = (appointmentId: string) => {
        const updatedAppointments = appointments.filter(apt => apt.id !== appointmentId);
        setAppointments(updatedAppointments);
        // This is a session-only prototype, so we just update the session storage
        setSession('schedule.holds.v1', updatedAppointments);
    }
    
    if (loading) {
        return <PlaceholderPage title="Appointments" description="Loading your appointments..." />
    }

    if (appointments.length === 0) {
        return <PlaceholderPage title="Appointments" description="You have no upcoming appointments." />;
    }

    return (
        <div className="container py-12">
            <div className="flex flex-col items-start gap-4 mb-8">
                <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Your Appointments
                </h1>
                <p className="text-lg text-foreground/80 max-w-2xl">
                Here are your upcoming scheduled sessions. We'll send you a reminder before they start.
                </p>
            </div>
            <div className="space-y-6">
                {appointments.map(apt => {
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
                                            <Trash2 className="mr-2 h-4 w-4" /> Cancel
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
                                        <AlertDialogAction onClick={() => handleCancelAppointment(apt.id)}>
                                            Yes, Cancel
                                        </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>
        </div>
    );
}
