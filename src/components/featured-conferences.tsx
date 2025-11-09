
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Conference, seedConferences } from "@/lib/conferences-seeder";
import { getLocal, setLocal, seedOnce } from "@/lib/local";
import { isWithinInterval, addDays, startOfDay, endOfDay, endOfWeek, endOfMonth, isFuture, differenceInMinutes } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Ticket, CheckCircle, Bell, X, Heart, Briefcase, HeartPulse, CircleDollarSign, Filter } from "lucide-react";
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useNotifications } from "@/contexts/notification-context";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";
import { Switch } from "./ui/switch";
import { useMediaQuery } from "@/hooks/use-media-query";


interface Rsvp {
    eventId: string;
    title: string;
    remind24h: boolean;
    remind1h: boolean;
    remind10m: boolean;
}

interface Filters {
    topics: string[];
    languages: string[];
    when: string;
    freeOnly: boolean;
}

const defaultFilters: Filters = {
    topics: [],
    languages: [],
    when: "All",
    freeOnly: false,
};

const topics = [
    { name: "Love", icon: Heart },
    { name: "Work", icon: Briefcase },
    { name: "Health", icon: HeartPulse },
    { name: "Money", icon: CircleDollarSign },
];
const languages = ["EN", "FR"];
const whenOptions = ["Today", "This week", "This month", "All"];


export function FeaturedConferences() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isDesktop = useMediaQuery("(min-width: 1024px)");

    const [allConferences, setAllConferences] = useState<Conference[]>([]);
    const [rsvps, setRsvps] = useState<Rsvp[]>([]);
    const { addNotification } = useNotifications();
    const [isLoading, setIsLoading] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const [filters, setFilters] = useState<Filters>(() => {
        if (typeof window === "undefined") return defaultFilters;
        const savedFilters = sessionStorage.getItem('discover.conferences.filters');
        return savedFilters ? JSON.parse(savedFilters) : defaultFilters;
    });

     useEffect(() => {
        seedOnce("conferences_seeded", seedConferences);
        const storedConferences = getLocal<Conference[]>("conferences");
        if (storedConferences) {
            setAllConferences(storedConferences);
        }

        const storedRsvps = getLocal<Rsvp[]>("rsvps");
        if (storedRsvps) {
            setRsvps(storedRsvps);
        }

        const urlFilters: Partial<Filters> = {};
        const topicsParam = searchParams.get('topic');
        if (topicsParam) urlFilters.topics = topicsParam.split(',');
        const langParam = searchParams.get('lang');
        if (langParam) urlFilters.languages = langParam.split(',');
        const whenParam = searchParams.get('when');
        if (whenParam && whenOptions.map(w => w.toLowerCase().replace(' ','-')).includes(whenParam)) {
            const whenMap: {[key: string]: string} = {'today': 'Today', 'this-week': 'This week', 'this-month': 'This month', 'all': 'All'};
            urlFilters.when = whenMap[whenParam];
        }
        urlFilters.freeOnly = searchParams.get('free') === 'true';

        const sessionState = sessionStorage.getItem('discover.conferences.filters');
        const initialState = {...defaultFilters, ...(sessionState ? JSON.parse(sessionState) : {}), ...urlFilters};
        setFilters(initialState);
        sessionStorage.setItem('discover.conferences.filters', JSON.stringify(initialState));

        setIsLoading(false);
    }, [searchParams]);

    const createQueryString = useCallback((newFilters: Partial<Filters>) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        const allFilters = { ...filters, ...newFilters };

        current.set("tab", "conferences");
        if(allFilters.topics.length > 0) current.set('topic', allFilters.topics.join(',')); else current.delete('topic');
        if(allFilters.languages.length > 0) current.set('lang', allFilters.languages.join(',')); else current.delete('lang');
        if(allFilters.when !== defaultFilters.when) current.set('when', allFilters.when.toLowerCase().replace(' ', '-')); else current.delete('when');
        if(allFilters.freeOnly) current.set('free', 'true'); else current.delete('free');

        return current.toString();
    }, [searchParams, filters]);

    const updateFilters = (newFilters: Partial<Filters>) => {
        const updated = { ...filters, ...newFilters };
        setFilters(updated);
        sessionStorage.setItem('discover.conferences.filters', JSON.stringify(updated));
        router.push(`${pathname}?${createQueryString(newFilters)}`, { scroll: false });
    };

    const handleChipToggle = (group: 'topics' | 'languages', value: string) => {
        const current = filters[group] as string[];
        const newValues = current.includes(value) ? current.filter((v: string) => v !== value) : [...current, value];
        updateFilters({ [group]: newValues });
    };
    
    const handleResetFilters = () => updateFilters(defaultFilters);

    const filteredConferences = useMemo(() => {
        setIsLoading(true);
        const now = new Date();
        
        let result = allConferences.filter(c => isFuture(new Date(c.dateISO)));

        if (filters.topics.length > 0) {
            result = result.filter(c => filters.topics.some(t => c.tags.includes(t as any)));
        }
        if (filters.languages.length > 0) {
            result = result.filter(c => filters.languages.includes(c.language as any));
        }
        if (filters.freeOnly) {
            result = result.filter(c => c.isFree);
        }

        const whenIntervals = {
            "Today": { start: startOfDay(now), end: endOfDay(now) },
            "This week": { start: startOfDay(now), end: endOfWeek(now, { weekStartsOn: 1 }) },
            "This month": { start: startOfDay(now), end: endOfMonth(now) },
            "All": null
        }
        const interval = whenIntervals[filters.when as keyof typeof whenIntervals];
        if (interval) {
            result = result.filter(c => isWithinInterval(new Date(c.dateISO), interval));
        }

        result.sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime());

        setTimeout(() => setIsLoading(false), 300);
        return result;

    }, [allConferences, filters]);
    
    const handleRsvp = (conf: Conference) => {
        let updatedRsvps;
        if (isRsvpd(conf.id)) {
             updatedRsvps = rsvps.filter(r => r.eventId !== conf.id);
        } else {
            updatedRsvps = [...rsvps, { eventId: conf.id, title: conf.title, remind24h: false, remind1h: false, remind10m: false }];
        }
        setRsvps(updatedRsvps);
        setLocal("rsvps", updatedRsvps);
    };

    const handleReminderChange = (eventId: string, reminder: 'remind24h' | 'remind1h' | 'remind10m', checked: boolean) => {
        const updatedRsvps = rsvps.map(r => r.eventId === eventId ? {...r, [reminder]: checked} : r);
        setRsvps(updatedRsvps);
        setLocal("rsvps", updatedRsvps);

        if(checked) {
            const conference = allConferences.find(c => c.id === eventId);
            if (conference) {
                const reminderText = { remind24h: "24 hours", remind1h: "1 hour", remind10m: "10 minutes" }
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
    const formatDate = (dateISO: string) => format(new Date(dateISO), "PPP p");

    const FilterControls = () => (
         <div className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">Topic:</span>
                    {topics.map(({name, icon: Icon}) => (
                        <Button key={name} variant={filters.topics.includes(name) ? "secondary" : "outline"} size="sm" onClick={() => handleChipToggle('topics', name)} className="rounded-full gap-2">
                            <Icon className="h-4 w-4" /> {name}
                        </Button>
                    ))}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">Language:</span>
                    {languages.map((lang) => (
                        <Button key={lang} variant={filters.languages.includes(lang) ? "secondary" : "outline"} size="sm" onClick={() => handleChipToggle('languages', lang)} className="rounded-full gap-2">
                             {lang === 'EN' ? '🇬🇧' : '🇫🇷'} {lang}
                        </Button>
                    ))}
                </div>
            </div>
            <div className="flex flex-col lg:flex-row items-center gap-4">
                 <div className="flex items-center gap-2 flex-wrap bg-muted p-1 rounded-lg w-full lg:w-auto">
                    {whenOptions.map((opt) => (
                         <Button key={opt} variant={filters.when === opt ? "background" : "ghost"} size="sm" onClick={() => updateFilters({ when: opt })} className="flex-1 justify-center shadow-sm">
                            {opt}
                        </Button>
                    ))}
                </div>
                <div className="flex items-center space-x-2">
                    <Switch id="free-only" checked={filters.freeOnly} onCheckedChange={(c) => updateFilters({freeOnly: c})} />
                    <Label htmlFor="free-only">Free only</Label>
                </div>
                <Button variant="link" onClick={handleResetFilters} className="p-0 h-auto">Reset all</Button>
            </div>
        </div>
    );

    const mobileSheet = (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
                 <Button variant="outline" className="lg:hidden gap-2 w-full">
                    <Filter className="h-4 w-4" />
                    Filters ({filteredConferences.length} results)
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-lg h-[90vh] flex flex-col">
                 <SheetHeader className="text-left flex-row items-center justify-between pr-6">
                    <SheetTitle>Filters</SheetTitle>
                    <Button variant="link" onClick={handleResetFilters}>Reset</Button>
                </SheetHeader>
                <div className="py-4 flex-1 overflow-y-auto">
                    <FilterControls />
                </div>
                <div className="border-t pt-4">
                     <Button onClick={() => setIsSheetOpen(false)} className="w-full">Apply Filters</Button>
                </div>
            </SheetContent>
        </Sheet>
    );

    const isStartingSoon = (dateISO: string) => {
        const diff = differenceInMinutes(new Date(dateISO), new Date());
        return diff > 0 && diff <= 10;
    }

    return (
       <>
            <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60 py-4 mb-6">
                 {isDesktop ? <FilterControls /> : mobileSheet}
            </div>

            <div role="status" aria-live="polite">
                {isLoading ? (
                     <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Card key={i}><CardHeader><Skeleton className="h-5 w-2/3" /></CardHeader><CardContent><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-1/2 mt-2" /></CardContent><CardFooter><Skeleton className="h-8 w-24" /></CardFooter></Card>
                        ))}
                    </div>
                ) : filteredConferences.length > 0 ? (
                    <div className="space-y-6">
                        {filteredConferences.map((conference) => {
                            const rsvpDetails = getRsvp(conference.id);
                            return (
                            <Card key={conference.id} className={cn("transition-all duration-300 ease-in-out hover:shadow-lg bg-card/50 hover:bg-card relative overflow-hidden", isStartingSoon(conference.dateISO) && "border-primary/50")}>
                                {isStartingSoon(conference.dateISO) && (
                                    <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-primary to-primary/50"></div>
                                )}
                                <div className={cn(isStartingSoon(conference.dateISO) && "pl-4")}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between gap-4">
                                            <CardTitle className="font-headline text-xl">{conference.title}</CardTitle>
                                            {isStartingSoon(conference.dateISO) && <Badge variant="default">Starting soon</Badge>}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="grid gap-4">
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-foreground/80">
                                            <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /><span>{formatDate(conference.dateISO)}</span></div>
                                            <div className="flex items-center gap-2"><span className="font-semibold">Host:</span><span>{conference.hostAlias}</span></div>
                                        </div>
                                        <p className="text-sm text-foreground/70">{conference.excerpt}</p>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline">{conference.language}</Badge>
                                            {!conference.isFree && <Badge variant="outline">Paid</Badge>}
                                            {conference.tags.map(tag => (
                                                <Badge key={tag} variant="secondary" className="bg-secondary/10 text-secondary-foreground/80">{tag}</Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => handleRsvp(conference)} variant={isRsvpd(conference.id) ? "secondary" : "default"}>
                                                {isRsvpd(conference.id) ? <CheckCircle className="mr-2 h-4 w-4" /> : <Ticket className="mr-2 h-4 w-4" />}
                                                {isRsvpd(conference.id) ? "Going" : "RSVP"}
                                            </Button>
                                            <Sheet>
                                                <SheetTrigger asChild><Button variant="outline" size="sm">Details</Button></SheetTrigger>
                                                <SheetContent>
                                                    <SheetHeader>
                                                        <SheetTitle>{conference.title}</SheetTitle>
                                                        <SheetDescription>Hosted by {conference.hostAlias} on {formatDate(conference.dateISO)}</SheetDescription>
                                                    </SheetHeader>
                                                    <div className="py-4 space-y-4">
                                                        <p>{conference.excerpt}</p>
                                                        <p className="text-sm text-muted-foreground">Capacity: {conference.capacity} spots.</p>
                                                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi.</p>
                                                    </div>
                                                </SheetContent>
                                            </Sheet>
                                            <Popover>
                                                <PopoverTrigger asChild><Button variant="outline" size="sm" disabled={!isRsvpd(conference.id)}><Bell className="mr-2 h-4 w-4" /> Remind</Button></PopoverTrigger>
                                                <PopoverContent className="w-60">
                                                    <div className="grid gap-4">
                                                        <div className="space-y-2"><h4 className="font-medium leading-none">Reminders</h4><p className="text-sm text-muted-foreground">Set reminders for this event.</p></div>
                                                        <div className="grid gap-2">
                                                            <div className="flex items-center space-x-2"><Checkbox id={`remind24-${conference.id}`} checked={rsvpDetails?.remind24h} onCheckedChange={(c) => handleReminderChange(conference.id, "remind24h", c as boolean)} /><Label htmlFor={`remind24-${conference.id}`}>24 hours before</Label></div>
                                                            <div className="flex items-center space-x-2"><Checkbox id={`remind1-${conference.id}`} checked={rsvpDetails?.remind1h} onCheckedChange={(c) => handleReminderChange(conference.id, "remind1h", c as boolean)}/><Label htmlFor={`remind1-${conference.id}`}>1 hour before</Label></div>
                                                            <div className="flex items-center space-x-2"><Checkbox id={`remind10-${conference.id}`} checked={rsvpDetails?.remind10m} onCheckedChange={(c) => handleReminderChange(conference.id, "remind10m", c as boolean)}/><Label htmlFor={`remind10-${conference.id}`}>10 minutes before</Label></div>
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </CardFooter>
                                </div>
                            </Card>
                        )})}
                    </div>
                ) : (
                    <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg">
                        <h3 className="font-headline text-2xl font-bold">No matching conferences.</h3>
                        <p className="text-muted-foreground mt-2 mb-4">Try widening your filters.</p>
                        <Button onClick={handleResetFilters}>Clear filters</Button>
                    </div>
                )}
            </div>
       </>
    );
}
