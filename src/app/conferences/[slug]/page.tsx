
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Conference, seedConferences } from '@/lib/conferences-seeder';
import { getLocal, setLocal, seedOnce } from '@/lib/local';
import { getSession } from '@/lib/session';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, Video, Users, Star, Languages, PlusCircle, CheckCircle, Bell, ExternalLink, CalendarPlus, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { StarRating } from '@/components/star-rating';
import { PlaceholderPage } from '@/components/placeholder-page';
import { Skeleton } from '@/components/ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ContentCard } from '@/components/content-card';
import { useToast } from '@/hooks/use-toast';
import { StartNowModal } from '@/components/start-now-modal';
import { RsvpConfirmationModal } from '@/components/rsvp-confirmation-modal';
import { useNotifications } from '@/contexts/notification-context';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface Rsvp {
    eventId: string;
    title: string;
    dateISO: string;
    type: 'conference';
    remind24h: boolean;
    remind1h: boolean;
    remind10m: boolean;
}

export default function ConferenceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { addNotification } = useNotifications();
    const { slug } = params;

    const [conference, setConference] = useState<Conference | null>(null);
    const [relatedConferences, setRelatedConferences] = useState<Conference[]>([]);
    const [rsvps, setRsvps] = useState<Rsvp[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRsvpModalOpen, setIsRsvpModalOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    useEffect(() => {
        seedOnce("conferences_seeded_v3", seedConferences);
        const allConferences = getLocal<Conference[]>("conferences") || [];
        const currentConference = allConferences.find(c => c.slug === slug);

        if (currentConference) {
            setConference(currentConference);
            const related = allConferences.filter(c => 
                c.id !== currentConference.id && 
                (c.tags.some(tag => currentConference.tags.includes(tag)) || c.hostAlias === currentConference.hostAlias)
            ).slice(0, 6);
            setRelatedConferences(related);
        }

        const currentRsvps = getLocal<Rsvp[]>("rsvps") || [];
        setRsvps(currentRsvps);

        setLoading(false);
    }, [slug]);

    const isRsvpd = useMemo(() => {
        if (!conference) return false;
        return rsvps.some(r => r.eventId === conference.id);
    }, [rsvps, conference]);
    

    const handleRsvpClick = () => {
        if (!conference) return;

        const isLoggedIn = getSession('userRegistered') === 'true';
        if (!isLoggedIn) {
            setIsAuthModalOpen(true);
            return;
        }

        if (isRsvpd) {
            // If already going, show confirmation to cancel
            if (confirm("Are you sure you want to cancel your RSVP?")) {
                handleConfirmRsvp();
            }
        } else {
            setIsRsvpModalOpen(true);
        }
    };
    
    const handleConfirmRsvp = () => {
        if (!conference) return;

        let updatedRsvps;
        if (isRsvpd) {
            updatedRsvps = rsvps.filter(r => r.eventId !== conference.id);
            toast({ title: "RSVP Cancelled" });
        } else {
            const newRsvp: Rsvp = {
                eventId: conference.id,
                title: conference.title,
                dateISO: conference.dateISO,
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
    };

    const handleReminderChange = (eventId: string, reminder: 'remind24h' | 'remind1h' | 'remind10m', checked: boolean) => {
        const updatedRsvps = rsvps.map(r => r.eventId === eventId ? {...r, [reminder]: checked} : r);
        setRsvps(updatedRsvps);
        setLocal("rsvps", updatedRsvps);

        if(checked) {
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


    if (loading) {
        return (
            <div className="container py-12">
                <Skeleton className="h-8 w-48 mb-8" />
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <Skeleton className="h-12 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                        <div className="flex gap-2">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-20" />
                        </div>
                        <Skeleton className="h-64 w-full" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-48 w-full" />
                    </div>
                </div>
            </div>
        );
    }
    
    if (!conference) {
        return <PlaceholderPage title="Conference not found" description="We couldn't find the conference you were looking for." />;
    }

    const date = new Date(conference.dateISO);
    const endDate = new Date(date.getTime() + conference.durationMin * 60000);
    const rsvpDetails = rsvps.find(r => r.eventId === conference.id);
    const ariaDate = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);

    return (
        <div className="container py-12">
            <Button variant="ghost" onClick={() => router.push('/conferences')} className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Conferences
            </Button>

            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 items-start">
                <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                            {conference.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                            <Badge variant="outline">{conference.type}</Badge>
                            <Badge variant="default">Free event</Badge>
                        </div>
                        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">{conference.title}</h1>
                        <div className="text-lg text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2">
                            <div className="flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" /> <span>{new Intl.DateTimeFormat(undefined, { dateStyle: 'full' }).format(date)}</span></div>
                            <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-primary" /> <span>{`${new Intl.DateTimeFormat(undefined, { timeStyle: 'short' }).format(date)} - ${new Intl.DateTimeFormat(undefined, { timeStyle: 'short' }).format(endDate)} (${Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, ' ')})`}</span></div>
                        </div>
                         <div className="flex items-center gap-2 text-muted-foreground"><Video className="w-5 h-5 text-primary" /> <span>Duration: {conference.durationMin} minutes</span></div>
                    </div>
                    
                    <Tabs defaultValue="about" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="about">About</TabsTrigger>
                            <TabsTrigger value="agenda">Agenda</TabsTrigger>
                            <TabsTrigger value="host">Host</TabsTrigger>
                            <TabsTrigger value="faqs">FAQs</TabsTrigger>
                        </TabsList>
                        <TabsContent value="about" className="py-6 prose prose-invert max-w-none text-foreground/80">
                            <div dangerouslySetInnerHTML={{ __html: conference.description }} />
                        </TabsContent>
                        <TabsContent value="agenda" className="py-6">
                            <ul className="space-y-4">
                                {conference.agenda.map((item, index) => (
                                    <li key={index} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="bg-primary/20 text-primary text-xs font-bold rounded-full px-2 py-0.5 whitespace-nowrap">{item.time}</div>
                                            {index < conference.agenda.length - 1 && <div className="w-px h-full bg-border my-1"></div>}
                                        </div>
                                        <p className="pt-px text-foreground/90">{item.topic}</p>
                                    </li>
                                ))}
                            </ul>
                        </TabsContent>
                        <TabsContent value="host" className="py-6 space-y-6">
                           <Card className="bg-card/50">
                               <CardContent className="p-6 flex items-start gap-6">
                                   <Image src={`https://i.pravatar.cc/80?u=${encodeURIComponent(conference.hostAlias)}`} alt={conference.hostAlias} width={80} height={80} className="rounded-full" />
                                   <div className="space-y-2">
                                       <h4 className="text-xl font-bold">{conference.hostAlias}</h4>
                                       <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                           <StarRating rating={conference.hostRating} />
                                           <span>({conference.hostRating})</span>
                                           <span>•</span>
                                           <span>{(conference.languages || []).join(' & ')}</span>
                                       </div>
                                       <p className="text-sm text-foreground/80 pt-1">Our host is a seasoned expert in their field, dedicated to providing deep insights and practical guidance.</p>
                                       <Button asChild variant="link" className="p-0 h-auto">
                                            <Link href={`/discover/consultant/${conference.hostId}`}>
                                                View Profile <ExternalLink className="ml-2 h-4 w-4" />
                                            </Link>
                                       </Button>
                                   </div>
                               </CardContent>
                           </Card>
                           <h4 className="font-headline text-lg font-bold">Other events by {conference.hostAlias}</h4>
                           {/* Placeholder for other events */}
                           <p className="text-sm text-muted-foreground">No other upcoming events from this host.</p>
                        </TabsContent>
                        <TabsContent value="faqs" className="py-6">
                            <Accordion type="single" collapsible className="w-full">
                                {conference.faqs.map((faq, index) => (
                                    <AccordionItem key={index} value={`item-${index}`}>
                                        <AccordionTrigger>{faq.question}</AccordionTrigger>
                                        <AccordionContent>{faq.answer}</AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
                     <Card>
                        <CardContent className="p-6 space-y-4">
                           <div className="space-y-2">
                                <Button 
                                    size="lg" 
                                    className="w-full" 
                                    onClick={handleRsvpClick} 
                                    variant={isRsvpd ? "outline" : "default"}
                                    aria-label={isRsvpd ? `Cancel RSVP for ${conference.title}`: `RSVP for ${conference.title} on ${ariaDate}`}
                                >
                                    {isRsvpd ? <CheckCircle className="mr-2 h-4 w-4"/> : <PlusCircle className="mr-2 h-4 w-4"/>}
                                    {isRsvpd ? 'Going / Cancel' : 'RSVP'}
                                </Button>
                           </div>

                           <div className="flex gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full" disabled={!isRsvpd} aria-label="Set reminders">
                                            <Bell className="mr-2 h-4 w-4" />
                                            Reminders
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-60">
                                        <div className="grid gap-4">
                                            <div className="space-y-2">
                                                <h4 className="font-medium leading-none">Reminders</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Reminders are on by default.
                                                </p>
                                            </div>
                                            <div className="grid gap-2">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id={`remind-24h-${conference.id}`} checked={rsvpDetails?.remind24h} onCheckedChange={(c) => handleReminderChange(conference.id, "remind24h", c as boolean)} />
                                                    <Label htmlFor={`remind-24h-${conference.id}`}>24 hours before</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id={`remind-1h-${conference.id}`} checked={rsvpDetails?.remind1h} onCheckedChange={(c) => handleReminderChange(conference.id, "remind1h", c as boolean)}/>
                                                    <Label htmlFor={`remind-1h-${conference.id}`}>1 hour before</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id={`remind-10m-${conference.id}`} checked={rsvpDetails?.remind10m} onCheckedChange={(c) => handleReminderChange(conference.id, "remind10m", c as boolean)}/>
                                                    <Label htmlFor={`remind-10m-${conference.id}`}>10 minutes before</Label>
                                                </div>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                               <Button variant="ghost" className="w-full" aria-label="Add to calendar">
                                   <CalendarPlus className="mr-2 h-4 w-4" />
                                   Add to Calendar
                               </Button>
                           </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {relatedConferences.length > 0 && (
                <div className="mt-16">
                    <h2 className="font-headline text-2xl font-bold mb-6">Related Conferences</h2>
                     <Carousel opts={{ align: "start", slidesToScroll: "auto" }} className="w-full">
                        <CarouselContent>
                            {relatedConferences.map((item) => (
                                <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3">
                                    {/* This is a simplified card for the carousel */}
                                     <Link href={`/conferences/${item.slug}`} className="group block">
                                        <Card className="h-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg bg-card/50 hover:bg-card">
                                            <CardContent className="p-0">
                                                <Image src={`https://picsum.photos/seed/${item.id}/400/225`} alt={item.title} width={400} height={225} className="w-full object-cover aspect-video group-hover:opacity-90" />
                                                <div className="p-4">
                                                    <h3 className="font-bold font-headline group-hover:text-primary line-clamp-2">{item.title}</h3>
                                                    <p className="text-sm text-muted-foreground mt-1">{new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }).format(new Date(item.dateISO))}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                     </Link>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious aria-label="Previous related conference" />
                        <CarouselNext aria-label="Next related conference" />
                    </Carousel>
                </div>
            )}
            
            {conference && (
                <RsvpConfirmationModal
                    isOpen={isRsvpModalOpen}
                    onOpenChange={setIsRsvpModalOpen}
                    conference={conference}
                    onConfirm={handleConfirmRsvp}
                />
            )}
            
            <StartNowModal
                isOpen={isAuthModalOpen}
                onOpenChange={setIsAuthModalOpen}
            />
        </div>
    );
}

    
