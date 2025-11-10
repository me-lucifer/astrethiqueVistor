
"use client";

import { useState, useEffect, useMemo, useCallback, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Conference, seedConferences } from "@/lib/conferences-seeder";
import { getLocal, setLocal, seedOnce } from "@/lib/local";
import { getSession } from "@/lib/session";
import { isWithinInterval, addDays, startOfDay, endOfDay, endOfWeek, endOfMonth, isFuture, differenceInMinutes } from 'date-fns';
import { format, toDate } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Ticket, CheckCircle, Bell, X, Heart, Briefcase, HeartPulse, CircleDollarSign, Filter, Star, Clock, Video, Users, Globe } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useNotifications } from "@/contexts/notification-context";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";
import { Switch } from "./ui/switch";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Slider } from "./ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarPicker } from "@/components/ui/calendar"
import { DateRange } from "react-day-picker";
import Image from "next/image";
import { StarRating } from "./star-rating";
import Link from "next/link";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { RsvpConfirmationModal } from "./rsvp-confirmation-modal";
import { StartNowModal } from "./start-now-modal";
import { useToast } from "@/hooks/use-toast";

interface Rsvp {
    eventId: string;
    title: string;
    dateISO: string;
    type: 'conference';
    remind24h: boolean;
    remind1h: boolean;
    remind10m: boolean;
}

interface Filters {
    categories: string[];
    types: string[];
    languages: string[];
    when: string;
    dateRange?: DateRange;
    price: [number, number];
    freeOnly: boolean;
    hostRating: string;
    seatsAvailable: boolean;
    recordingAvailable: boolean;
}

const defaultFilters: Filters = {
    categories: [],
    types: [],
    languages: [],
    when: "All",
    price: [0, 100],
    freeOnly: false,
    hostRating: "0",
    seatsAvailable: false,
    recordingAvailable: false,
};

const categories = [
    { id: "Love", name: "Love", icon: Heart },
    { id: "Work", name: "Work", icon: Briefcase },
    { id: "Health", name: "Health", icon: HeartPulse },
    { id: "Money", name: "Money", icon: CircleDollarSign },
    { id: "Life Path", name: "Life Path", icon: Star },
];
const conferenceTypes = ["Workshop", "Group Reading", "Webinar", "Q&A"];
const languages = ["EN", "FR"];
const whenOptions = ["Today", "This week", "This month", "All"];
const ratingFilters = [
    { value: "0", label: "Any" },
    { value: "4", label: "4.0+" },
    { value: "4.5", label: "4.5+" },
];
const sortOptions = {
    soonest: "Soonest",
    price_asc: "Price (low to high)",
    host_rating_desc: "Host Rating",
};

type SortKey = keyof typeof sortOptions;


export function FeaturedConferences({ initialQuery = "" }: { initialQuery?: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isDesktop = useMediaQuery("(min-width: 1024px)");
    const { toast } = useToast();
    const { addNotification } = useNotifications();

    const [allConferences, setAllConferences] = useState<Conference[]>([]);
    const [rsvps, setRsvps] = useState<Rsvp[]>([]);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const isLoading = isPending;
    const [query, setQuery] = useState(initialQuery);
    
    const [priceBounds, setPriceBounds] = useState<[number, number]>([0, 100]);
    const [selectedConference, setSelectedConference] = useState<Conference | null>(null);
    const [isRsvpModalOpen, setIsRsvpModalOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const [timeZone, setTimeZone] = useState<string>("");
    useEffect(() => {
        setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }, []);

    const [filters, setFilters] = useState<Filters>(() => {
        if (typeof window === "undefined") return defaultFilters;
        const savedFilters = sessionStorage.getItem('discover.conferences.filters');
        return savedFilters ? JSON.parse(savedFilters) : defaultFilters;
    });
    
    const [sort, setSort] = useState<SortKey>(() => {
        if(typeof window === "undefined") return "soonest";
        const savedSort = sessionStorage.getItem('discover.conferences.sort');
        return savedSort ? (savedSort as SortKey) : 'soonest';
    });

     useEffect(() => {
        seedOnce("conferences_seeded_v2", seedConferences); // Use a new seed key to ensure data update
        const storedConferences = getLocal<Conference[]>("conferences");
        if (storedConferences) {
            setAllConferences(storedConferences);
            const prices = storedConferences.map(c => c.price ?? 0);
            const min = Math.floor(Math.min(...prices, 0));
            const max = Math.ceil(Math.max(...prices, 100));
            setPriceBounds([min, max]);
        }

        const storedRsvps = getLocal<Rsvp[]>("rsvps");
        if (storedRsvps) {
            setRsvps(storedRsvps);
        }

        // Set initial filters from URL params or session storage
        const urlFilters: Partial<Filters> = {}; // You can extend this to parse more filters from URL
        const sessionState = sessionStorage.getItem('discover.conferences.filters');
        const initialState = {...defaultFilters, ...(sessionState ? JSON.parse(sessionState) : {}), ...urlFilters};
        setFilters(initialState);
        sessionStorage.setItem('discover.conferences.filters', JSON.stringify(initialState));

    }, [searchParams]);

    useEffect(() => {
      startTransition(() => {
        setQuery(initialQuery);
      })
    }, [initialQuery]);

    const updateFilters = (newFilters: Partial<Filters>) => {
        startTransition(() => {
            const updated = { ...filters, ...newFilters };
            setFilters(updated);
            sessionStorage.setItem('discover.conferences.filters', JSON.stringify(updated));
        });
    };
    
    const updateSort = (newSort: SortKey) => {
        startTransition(() => {
            setSort(newSort);
            sessionStorage.setItem('discover.conferences.sort', newSort);
        });
    };

    const handleChipToggle = (group: 'categories' | 'types' | 'languages', value: string) => {
        const current = filters[group] as string[];
        const newValues = current.includes(value) ? current.filter((v: string) => v !== value) : [...current, value];
        updateFilters({ [group]: newValues });
    };
    
    const handleResetFilters = () => {
        const newFilters = {...defaultFilters, price: priceBounds};
        updateFilters(newFilters);
        router.push(`${pathname}`, { scroll: false });
    }

    const filteredConferences = useMemo(() => {
        const now = new Date();
        
        let result = allConferences.filter(c => isFuture(new Date(c.dateISO)));

        if(query && query.length > 1) {
            const lowerQuery = query.toLowerCase();
            result = result.filter(c => 
                c.title.toLowerCase().includes(lowerQuery) ||
                c.hostAlias.toLowerCase().includes(lowerQuery) ||
                c.tags.some(t => t.toLowerCase().includes(lowerQuery)) ||
                c.excerpt.toLowerCase().includes(lowerQuery)
            );
        }

        if (filters.categories.length > 0) {
            result = result.filter(c => filters.categories.some(t => c.tags.includes(t as any)));
        }
        if (filters.types.length > 0) {
            result = result.filter(c => filters.types.includes(c.type));
        }
        if (filters.languages.length > 0) {
            result = result.filter(c => filters.languages.includes(c.language as any));
        }

        const whenIntervals = {
            "Today": { start: startOfDay(now), end: endOfDay(now) },
            "This week": { start: startOfDay(now), end: endOfWeek(now, { weekStartsOn: 1 }) },
            "This month": { start: startOfDay(now), end: endOfMonth(now) },
            "All": null
        }
        if (filters.when !== 'Pick a range') {
            const interval = whenIntervals[filters.when as keyof typeof whenIntervals];
            if (interval) {
                result = result.filter(c => isWithinInterval(new Date(c.dateISO), interval));
            }
        } else if (filters.dateRange?.from) {
             result = result.filter(c => {
                const date = new Date(c.dateISO);
                return date >= (filters.dateRange?.from as Date) && date <= (filters.dateRange?.to || filters.dateRange?.from as Date)
            });
        }
        
        if (filters.freeOnly) {
            result = result.filter(c => c.price === 0);
        } else {
            result = result.filter(c => (c.price ?? 0) >= filters.price[0] && (c.price ?? 0) <= filters.price[1]);
        }

        if (parseFloat(filters.hostRating) > 0) {
            result = result.filter(c => c.hostRating >= parseFloat(filters.hostRating));
        }
        if (filters.seatsAvailable) {
            result = result.filter(c => (c.seatsLeft ?? c.capacity) > 0);
        }
        if (filters.recordingAvailable) {
            result = result.filter(c => c.recordingAvailable);
        }
        
        // Sorting
        result.sort((a, b) => {
            switch(sort) {
                case 'price_asc':
                    return (a.price ?? 0) - (b.price ?? 0);
                case 'host_rating_desc':
                    return b.hostRating - a.hostRating;
                case 'soonest':
                default:
                     return new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime();
            }
        })


        return result;

    }, [allConferences, filters, query, sort]);
    
    const handleRsvpClick = (conf: Conference) => {
        const isLoggedIn = getSession('userRegistered') === 'true';
        if (!isLoggedIn) {
            setIsAuthModalOpen(true);
            return;
        }
        setSelectedConference(conf);
        setIsRsvpModalOpen(true);
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
            const conference = allConferences.find(c => c.id === eventId);
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
    
    const formatDate = (dateISO: string, durationMin: number) => {
        const date = new Date(dateISO);
        const endDate = new Date(date.getTime() + durationMin * 60000);
        
        const datePart = new Intl.DateTimeFormat(undefined, {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: false,
            timeZone,
        }).format(date);
        
        const endTimePart = new Intl.DateTimeFormat(undefined, {
            hour: 'numeric',
            minute: 'numeric',
            hour12: false,
            timeZone,
        }).format(endDate);
    
        const tzName = timeZone.replace(/_/g, ' ');
    
        return `${datePart} - ${endTimePart} • ${durationMin} min • ${tzName}`;
    };

    const FilterControls = () => (
         <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-120px)] lg:overflow-y-auto lg:pr-4 -mr-4 lg:mr-0">
            <div className="space-y-6 p-4 lg:p-0">
                <Accordion type="multiple" defaultValue={['category', 'type', 'languages', 'date', 'price']} className="w-full">
                    <AccordionItem value="category">
                        <AccordionTrigger className="font-semibold text-sm">Category</AccordionTrigger>
                        <AccordionContent className="space-y-2 pt-2">
                           <div className="flex flex-wrap gap-2">
                             {categories.map(({id, name}) => (
                                <Button key={id} variant={filters.categories.includes(id) ? "secondary" : "outline"} size="sm" onClick={() => handleChipToggle('categories', id)} className="rounded-full">
                                    {name}
                                </Button>
                            ))}
                           </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="type">
                        <AccordionTrigger className="font-semibold text-sm">Type</AccordionTrigger>
                        <AccordionContent className="space-y-2 pt-2">
                           <div className="flex flex-wrap gap-2">
                             {conferenceTypes.map((type) => (
                                <Button key={type} variant={filters.types.includes(type) ? "secondary" : "outline"} size="sm" onClick={() => handleChipToggle('types', type)} className="rounded-full">
                                    {type}
                                </Button>
                            ))}
                           </div>
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="languages">
                        <AccordionTrigger className="font-semibold text-sm">Languages</AccordionTrigger>
                        <AccordionContent className="space-y-2 pt-2">
                           <div className="flex flex-wrap gap-2">
                             {languages.map((lang) => (
                                <Button key={lang} variant={filters.languages.includes(lang) ? "secondary" : "outline"} size="sm" onClick={() => handleChipToggle('languages', lang)} className="rounded-full">
                                    {lang}
                                </Button>
                            ))}
                           </div>
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="date">
                        <AccordionTrigger className="font-semibold text-sm">Date</AccordionTrigger>
                        <AccordionContent className="pt-2">
                           <RadioGroup value={filters.when} onValueChange={(v) => updateFilters({ when: v, dateRange: undefined })}>
                                {whenOptions.map(o => (
                                    <div key={o} className="flex items-center space-x-2">
                                        <RadioGroupItem value={o} id={`date-${o}`} />
                                        <Label htmlFor={`date-${o}`} className="font-normal text-foreground/80">{o}</Label>
                                    </div>
                                ))}
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Pick a range" id="date-range" />
                                    <Label htmlFor="date-range" className="font-normal text-foreground/80">Pick a range</Label>
                                </div>
                            </RadioGroup>
                             {filters.when === 'Pick a range' && (
                                <div className="pt-4">
                                     <CalendarPicker
                                        mode="range"
                                        selected={filters.dateRange}
                                        onSelect={(range) => updateFilters({ dateRange: range })}
                                    />
                                </div>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="price">
                        <AccordionTrigger className="font-semibold text-sm">Price</AccordionTrigger>
                        <AccordionContent className="pt-2 space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="free-only" checked={filters.freeOnly} onCheckedChange={(c) => updateFilters({ freeOnly: c as boolean })} />
                                <Label htmlFor="free-only">Free only</Label>
                            </div>
                            <div className={cn(filters.freeOnly && "opacity-50 pointer-events-none")}>
                                <div className="flex justify-between items-center mb-2">
                                    <Label htmlFor="price-slider" className="text-primary font-bold">€{filters.price[0]} &mdash; €{filters.price[1]}</Label>
                                </div>
                                <Slider id="price-slider" aria-label="Price range" min={priceBounds[0]} max={priceBounds[1]} step={5} value={filters.price} onValueChange={(v) => updateFilters({ price: v as [number,number] })} />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="host-rating">
                        <AccordionTrigger className="font-semibold text-sm">Host Rating</AccordionTrigger>
                        <AccordionContent className="pt-2">
                            <RadioGroup value={filters.hostRating} onValueChange={(v) => updateFilters({ hostRating: v })}>
                                {ratingFilters.map(r => (
                                    <div key={r.value} className="flex items-center space-x-2">
                                        <RadioGroupItem value={r.value} id={`rating-${r.value}`} />
                                        <Label htmlFor={`rating-${r.value}`} className="font-normal text-foreground/80">{r.label}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="availability">
                        <AccordionTrigger className="font-semibold text-sm">Availability</AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="seats-available">Seats available</Label>
                                <Switch id="seats-available" checked={filters.seatsAvailable} onCheckedChange={(c) => updateFilters({ seatsAvailable: c })} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="recording-available">Recording available</Label>
                                <Switch id="recording-available" checked={filters.recordingAvailable} onCheckedChange={(c) => updateFilters({ recordingAvailable: c })} />
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                </Accordion>
                <div className="flex flex-col gap-2">
                    <Button onClick={isDesktop ? handleResetFilters : ()=>setIsSheetOpen(false)}>Apply Filters</Button>
                    <Button variant="ghost" onClick={handleResetFilters}>Reset All</Button>
                </div>
            </div>
        </aside>
    );

    const mobileSheet = (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
                 <Button variant="outline" className="lg:hidden gap-2 w-full">
                    <Filter className="h-4 w-4" />
                    Filters ({filteredConferences.length} results)
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px] flex flex-col p-0">
                <SheetHeader className="text-left p-4 border-b">
                    <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto">
                    <FilterControls />
                </div>
            </SheetContent>
        </Sheet>
    );

    const isStartingSoon = (dateISO: string) => {
        const diff = differenceInMinutes(new Date(dateISO), new Date());
        return diff > 0 && diff <= 60;
    }

    return (
        <>
            <TooltipProvider>
                {isDesktop ? <FilterControls /> : null}

                <main className="w-full">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <p className="text-sm text-muted-foreground w-full sm:w-auto" aria-live="polite">
                            Showing {filteredConferences.length} conferences
                        </p>
                        <div className="flex gap-2 w-full sm:w-auto items-center">
                            {!isDesktop && mobileSheet}
                            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                                <Globe className="h-4 w-4" />
                                <span>{timeZone.replace(/_/g, ' ')}</span>
                            </div>
                             <Select value={sort} onValueChange={(v: SortKey) => updateSort(v)}>
                                <SelectTrigger className="w-full sm:w-[180px]" aria-label="Sort by">
                                    <SelectValue placeholder="Sort by..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(sortOptions).map(([key, value]) => (
                                        <SelectItem key={key} value={key}>{value}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="flex sm:hidden items-center justify-center gap-2 text-xs text-muted-foreground mb-4">
                        <Globe className="h-4 w-4" />
                        <span>All times shown in: {timeZone.replace(/_/g, ' ')}</span>
                    </div>

                    <div role="status" aria-live="polite">
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Card key={i}><CardHeader><Skeleton className="h-44 w-full" /></CardHeader><CardContent><Skeleton className="h-5 w-2/3" /><Skeleton className="h-4 w-full mt-2" /><Skeleton className="h-4 w-1/2 mt-2" /></CardContent><CardFooter><Skeleton className="h-8 w-24" /></CardFooter></Card>
                                ))}
                            </div>
                        ) : filteredConferences.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredConferences.map((conference) => {
                                    const rsvpDetails = rsvps.find(r => r.eventId === conference.id);
                                    const hasSeats = conference.seatsLeft === undefined || conference.seatsLeft > 0;

                                    return (
                                    <Card key={conference.id} className="h-full flex flex-col overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg bg-card/50 hover:bg-card">
                                        <CardContent className="p-0">
                                            <Link href={`/conferences/${conference.slug}`} className="block group">
                                                <div className="relative">
                                                    <Image
                                                        src={`https://picsum.photos/seed/${conference.id}/400/225`}
                                                        alt={conference.title}
                                                        width={400}
                                                        height={225}
                                                        className="w-full object-cover aspect-video group-hover:opacity-90 transition-opacity"
                                                    />
                                                    <div className="absolute top-2 right-2 flex gap-2">
                                                        {conference.price === 0 && <Badge variant="default" className="bg-green-600">Free</Badge>}
                                                        {isStartingSoon(conference.dateISO) && <Badge variant="default">Starting Soon</Badge>}
                                                    </div>
                                                </div>
                                                <div className="p-4 space-y-3">
                                                    <h3 className="font-headline text-lg font-bold line-clamp-2 h-[56px] group-hover:text-primary">{conference.title}</h3>
                                                    
                                                    <div className="text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> <span>{formatDate(conference.dateISO, conference.durationMin)}</span></div>
                                                    </div>

                                                    <div className="flex items-center gap-3 pt-2">
                                                        <Image src={`https://i.pravatar.cc/40?u=${conference.hostAlias}`} alt={conference.hostAlias} width={40} height={40} className="rounded-full" />
                                                        <div>
                                                            <Link href={`/discover/consultant/${conference.hostId}`} className="font-semibold hover:underline">{conference.hostAlias}</Link>
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <StarRating rating={conference.hostRating} size={14} />
                                                                <span>({conference.hostRating})</span>
                                                                <span>•</span>
                                                                <span>{conference.language}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex flex-wrap gap-2 pt-1">
                                                        {conference.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                                                        <Badge variant="outline">{conference.type}</Badge>
                                                    </div>
                                                </div>
                                            </Link>
                                        </CardContent>
                                        <CardFooter className="p-4 pt-0 mt-auto flex justify-between items-center">
                                            <div className="font-bold text-lg text-primary">{conference.price === 0 ? 'Free' : `€${conference.price}`}</div>
                                            <div className="flex items-center gap-2">
                                                
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!isRsvpd(conference.id)}>
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
                                                
                                                <Button size="sm" onClick={() => handleRsvpClick(conference)} variant={isRsvpd(conference.id) ? "outline" : "default"} disabled={!hasSeats && !isRsvpd(conference.id)}>
                                                    {isRsvpd(conference.id) ? <CheckCircle className="mr-2 h-4 w-4" /> : <Ticket className="mr-2 h-4 w-4" />}
                                                    {isRsvpd(conference.id) ? "Going" : (hasSeats ? "RSVP" : "Waitlist")}
                                                </Button>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                )})}
                            </div>
                        ) : (
                            <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg col-span-full">
                                <h3 className="font-headline text-2xl font-bold">No matching conferences.</h3>
                                <p className="text-muted-foreground mt-2 mb-4">Try widening your filters.</p>
                                <Button onClick={handleResetFilters}>Clear filters</Button>
                            </div>
                        )}
                    </div>
                </main>
            </TooltipProvider>

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
