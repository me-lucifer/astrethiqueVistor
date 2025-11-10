
"use client";

import { useState, useEffect, useMemo, useCallback, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Conference, seedConferences } from "@/lib/conferences-seeder";
import { getLocal, setLocal, seedOnce } from "@/lib/local";
import { isWithinInterval, addDays, startOfDay, endOfDay, endOfWeek, endOfMonth, isFuture, differenceInMinutes } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Ticket, CheckCircle, Bell, X, Heart, Briefcase, HeartPulse, CircleDollarSign, Filter, Star } from "lucide-react";
import { format } from 'date-fns';
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


interface Rsvp {
    eventId: string;
    title: string;
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

    const [allConferences, setAllConferences] = useState<Conference[]>([]);
    const [rsvps, setRsvps] = useState<Rsvp[]>([]);
    const { addNotification } = useNotifications();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const isLoading = isPending;
    const [query, setQuery] = useState(initialQuery);
    
    const [priceBounds, setPriceBounds] = useState<[number, number]>([0, 100]);

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
        seedOnce("conferences_seeded", seedConferences);
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
            result = result.filter(c => c.seatsAvailable);
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
        return diff > 0 && diff <= 10;
    }

    return (
       <>
            {isDesktop ? <FilterControls /> : null}

            <main className="w-full">
                 <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <p className="text-sm text-muted-foreground w-full sm:w-auto" aria-live="polite">
                        Showing {filteredConferences.length} conferences
                    </p>
                    <div className="flex gap-2 w-full sm:w-auto">
                        {!isDesktop && mobileSheet}
                        <Select value={sort} onValueChange={(v: SortKey) => updateSort(v)}>
                            <SelectTrigger className="w-full sm:w-[200px]" aria-label="Sort by">
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
                                                <div className="flex items-center gap-2">
                                                    {isStartingSoon(conference.dateISO) && <Badge variant="default">Starting soon</Badge>}
                                                    <Badge variant="outline" className="hidden sm:flex items-center gap-1.5"><Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {conference.hostRating.toFixed(1)}</Badge>
                                                </div>
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
                                                <Badge variant="outline">{conference.type}</Badge>
                                                <Badge variant="outline">{conference.price === 0 ? "Free" : `€${conference.price}`}</Badge>
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
                                                            <p>This event provides an in-depth look at the topic, offering valuable insights and practical advice. Join our expert host for an interactive and enlightening session.</p>
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
                        <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg col-span-full">
                            <h3 className="font-headline text-2xl font-bold">No matching conferences.</h3>
                            <p className="text-muted-foreground mt-2 mb-4">Try widening your filters.</p>
                            <Button onClick={handleResetFilters}>Clear filters</Button>
                        </div>
                    )}
                </div>
            </main>
       </>
    );
}
