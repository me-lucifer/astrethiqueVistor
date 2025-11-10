
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Consultant } from "@/lib/consultants";
import { ConsultantCard } from "./consultant-card";
import { StartNowModal } from "./start-now-modal";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Checkbox } from "./ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Briefcase, HeartPulse, CircleDollarSign, Filter, Info, BookOpen, Mic, Video, Star, BadgeCheck, Languages, Clock, ChevronDown } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "./ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import { getSession, setSession } from "@/lib/session";
import { isWithinInterval, addDays, startOfDay, endOfDay, isFuture, parseISO } from 'date-fns';

const specialties = [
    { id: "Love", name: "Love", icon: Heart },
    { id: "Work", name: "Work", icon: Briefcase },
    { id: "Health", name: "Health", icon: HeartPulse },
    { id: "Money", name: "Money", icon: CircleDollarSign },
    { id: "Life Path", name: "Life Path", icon: Star },
];

const badges = [
    { id: "Top Rated", name: "Top Rated" },
    { id: "Rising Star", name: "Rising Star" },
    { id: "New", name: "New" },
    { id: "Promo 24h", name: "Promo 24h" },
];

const contentFilters = [
    { id: "hasArticles", name: "Has Articles", icon: BookOpen },
    { id: "hasPodcasts", name: "Has Podcasts", icon: Mic },
    { id: "hasUpcomingConference", name: "Has UpcomingConference", icon: Video },
];

const availabilityFilters = [
    { id: 'Online now', name: 'Online now' },
    { id: 'Today', name: 'Today' },
    { id: 'This week', name: 'This week' }
];

const ratingFilters = [
    { value: "0", label: "Any" },
    { value: "4", label: "4.0+" },
    { value: "4.5", label: "4.5+" },
    { value: "4.8", label: "4.8+" },
];


const sortOptions = {
    recommended: "Recommended",
    rating_desc: "Rating ↓",
    price_asc: "Price ↑",
    price_desc: "Price ↓",
    online_first: "Online first",
    newest: "Newest",
};

type SortKey = keyof typeof sortOptions;

interface Filters {
    myFavorites: boolean;
    specialties: string[];
    price: number[];
    minPrice: string;
    maxPrice: string;
    rating: string;
    badges: string[];
    languages: {
        EN?: "basic" | "fluent" | "native";
        FR?: "basic" | "fluent" | "native";
    };
    availability: string[];
    content: string[];
    frOnlyVisibility: boolean;
    aPlusPlusOnly: boolean;
    onPromo: boolean;
}

const defaultFilters: Filters = {
    myFavorites: false,
    specialties: [],
    price: [0, 10],
    minPrice: "0",
    maxPrice: "10",
    rating: "0",
    badges: [],
    languages: {},
    availability: [],
    content: [],
    frOnlyVisibility: false,
    aPlusPlusOnly: false,
    onPromo: false,
};

export function FeaturedConsultants({ initialQuery }: { initialQuery?: string }) {
    const isDesktop = useMediaQuery("(min-width: 1024px)");

    const [allConsultants, setAllConsultants] = useState<Consultant[]>([]);
    const [isStartNowModalOpen, setIsStartNowModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [query, setQuery] = useState(initialQuery || "");

    const [filters, setFilters] = useState<Filters>(() => {
        const sessionState = getSession('discover.filters.v1');
        return { ...defaultFilters, ...(sessionState || {}) };
    });
    const [sort, setSort] = useState<SortKey>(() => getSession('discover.sort.v1') || 'recommended');
    const [priceBounds, setPriceBounds] = useState<[number, number]>([0, 10]);

    useEffect(() => {
        const storedConsultants = getSession<Consultant[]>('discover.consultants.v1');
        if (storedConsultants) {
            setAllConsultants(storedConsultants);
            const prices = storedConsultants.map(c => c.pricePerMin);
            const min = Math.floor(Math.min(...prices));
            const max = Math.ceil(Math.max(...prices));
            setPriceBounds([min, max]);

            const savedFilters = getSession<Filters>('discover.filters.v1');
            if (!savedFilters || !savedFilters.price) {
                updateFilters({ price: [min, max], minPrice: String(min), maxPrice: String(max) });
            } else {
                 setFilters({ ...defaultFilters, ...savedFilters });
            }
        }
        setIsLoading(false);
    }, []);

    const updateFilters = (newFilters: Partial<Filters>) => {
        setFilters(prev => {
            const updated = { ...prev, ...newFilters };
            setSession('discover.filters.v1', updated);
            return updated;
        });
    };
    
    const updateSort = (newSort: SortKey) => {
        setSort(newSort);
        setSession('discover.sort.v1', newSort);
    }

    const filteredAndSortedConsultants = useMemo(() => {
        setIsLoading(true);
        const favorites = getSession<string[]>("discover.favorites.v1") || [];
        const langLevels = { basic: 1, fluent: 2, native: 3 };

        let result = allConsultants.filter(c => {
            // Favorites
            if (filters.myFavorites && !favorites.includes(c.id)) return false;
            
            // Specialties
            if (filters.specialties.length > 0 && !filters.specialties.some(s => c.specialties.includes(s as any))) return false;
            
            // Price
            if (c.pricePerMin < filters.price[0] || c.pricePerMin > filters.price[1]) return false;

            // Rating
            if (parseFloat(filters.rating) > 0 && c.rating < parseFloat(filters.rating)) return false;

            // Badges
            if (filters.badges.length > 0 && !filters.badges.every(b => c.badges && c.badges.includes(b as any))) return false;

            // Languages
            for (const [langCode, minLevel] of Object.entries(filters.languages)) {
                const consultantLang = c.languages.find(l => l.code === langCode);
                if (!consultantLang || langLevels[consultantLang.level] < langLevels[minLevel]) {
                    return false;
                }
            }

            // Availability
            if (filters.availability.length > 0) {
                const isOnline = c.availability === 'online';
                const isBusy = c.availability === 'busy';
                const isOffline = c.availability === 'offline';
                
                const checks = {
                    'Online now': isOnline,
                    'Busy': isBusy,
                    'Offline': isOffline,
                };
                
                if (!filters.availability.some(filterKey => checks[filterKey as keyof typeof checks])) {
                    return false;
                }
            }

            // Content
            if (filters.content.length > 0) {
                const checks = {
                    hasArticles: c.contentCounts.articles > 0,
                    hasPodcasts: c.contentCounts.podcasts > 0,
                    hasUpcomingConference: c.contentCounts.conferences > 0,
                };
                if (!filters.content.every(filterKey => checks[filterKey as keyof typeof checks])) {
                    return false;
                }
            }

            // Admin Filters
            if (filters.frOnlyVisibility && !c.languages.some(l => l.code === 'FR')) return false;
            if (filters.aPlusPlusOnly && c.rating < 4.8) return false;
            if (filters.onPromo && !c.promo24h) return false;

            return true;
        });

        result.sort((a, b) => {
            const availabilityOrder = { 'online': 1, 'busy': 2, 'offline': 3 };
            const aAvail = typeof a.availability === 'string' ? a.availability : 'offline';
            const bAvail = typeof b.availability === 'string' ? b.availability : 'offline';

            switch (sort) {
                case 'price_asc':
                    return a.pricePerMin - b.pricePerMin || b.rating - a.rating;
                case 'price_desc':
                    return b.pricePerMin - a.pricePerMin || b.rating - a.rating;
                case 'rating_desc':
                    return b.rating - a.rating || a.pricePerMin - b.pricePerMin;
                case 'newest':
                    return parseISO(b.lastReviewDate).getTime() - parseISO(a.lastReviewDate).getTime();
                case 'online_first':
                    return availabilityOrder[aAvail] - availabilityOrder[bAvail] || b.rating - a.rating;
                case 'recommended':
                default:
                    const scoreA = (availabilityOrder[aAvail] === 1 ? 1000 : 0) + (a.rating * 100) - a.pricePerMin;
                    const scoreB = (availabilityOrder[bAvail] === 1 ? 1000 : 0) + (b.rating * 100) - b.pricePerMin;
                    return scoreB - scoreA;
            }
        });
        
        setTimeout(() => setIsLoading(false), 300);
        return result;
    }, [allConsultants, filters, sort]);

    const handleResetFilters = () => {
        const newFilters = {...defaultFilters, price: priceBounds, minPrice: String(priceBounds[0]), maxPrice: String(priceBounds[1])};
        setFilters(newFilters);
        setSort('recommended');
        setSession('discover.filters.v1', newFilters);
        setSession('discover.sort.v1', 'recommended');
    };

    const handleMultiSelectToggle = (group: 'specialties' | 'badges' | 'availability' | 'content', value: string) => {
        const current = filters[group] as string[];
        const newValues = current.includes(value) ? current.filter((v: string) => v !== value) : [...current, value];
        updateFilters({ [group]: newValues });
    };

    const handlePriceInputChange = (type: 'min' | 'max', value: string) => {
        const numericValue = parseFloat(value);
        const newPrice = [...filters.price];
        const key = type === 'min' ? 'minPrice' : 'maxPrice';
        const priceIndex = type === 'min' ? 0 : 1;

        updateFilters({ [key]: value });

        if (!isNaN(numericValue)) {
            newPrice[priceIndex] = numericValue;
            updateFilters({ price: newPrice });
        }
    }

    const FilterControls = () => (
        <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-120px)] lg:overflow-y-auto lg:pr-4 -mr-4 lg:mr-0">
            <div className="space-y-6 p-4 lg:p-0">
                <Accordion type="multiple" defaultValue={['general', 'specialty', 'price', 'rating', 'availability']} className="w-full">
                    <AccordionItem value="general">
                        <AccordionTrigger className="font-semibold text-sm">General</AccordionTrigger>
                        <AccordionContent>
                             <div className="flex items-center justify-between">
                                <Label htmlFor="my-favorites" className="flex items-center gap-2">
                                    <Heart className="h-4 w-4" /> My favorites
                                </Label>
                                <Switch id="my-favorites" checked={filters.myFavorites} onCheckedChange={(c) => updateFilters({ myFavorites: c })} />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="specialty">
                        <AccordionTrigger className="font-semibold text-sm">Specialty</AccordionTrigger>
                        <AccordionContent className="space-y-2">
                             {specialties.map(({ id, name }) => (
                                <div key={id} className="flex items-center space-x-2">
                                    <Checkbox id={`spec-${id}`} checked={filters.specialties.includes(id)} onCheckedChange={() => handleMultiSelectToggle('specialties', id)} />
                                    <Label htmlFor={`spec-${id}`} className="font-normal text-foreground/80">{name}</Label>
                                </div>
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="price">
                        <AccordionTrigger className="font-semibold text-sm">Price per minute</AccordionTrigger>
                        <AccordionContent>
                            <div className="flex justify-between items-center mb-2">
                                <Label className="text-primary font-bold">€{filters.price[0]} &mdash; €{filters.price[1]}/min</Label>
                            </div>
                            <Slider min={priceBounds[0]} max={priceBounds[1]} step={0.5} value={filters.price} onValueChange={(v) => updateFilters({ price: v, minPrice: String(v[0]), maxPrice: String(v[1]) })} />
                             <div className="flex gap-2 mt-2">
                                <Input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => handlePriceInputChange('min', e.target.value)} />
                                <Input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => handlePriceInputChange('max', e.target.value)} />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="rating">
                        <AccordionTrigger className="font-semibold text-sm">Rating</AccordionTrigger>
                        <AccordionContent>
                            <RadioGroup value={filters.rating} onValueChange={(v) => updateFilters({ rating: v })}>
                                {ratingFilters.map(r => (
                                    <div key={r.value} className="flex items-center space-x-2">
                                        <RadioGroupItem value={r.value} id={`rating-${r.value}`} />
                                        <Label htmlFor={`rating-${r.value}`} className="font-normal text-foreground/80">{r.label}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="badges">
                        <AccordionTrigger className="font-semibold text-sm">Badges</AccordionTrigger>
                        <AccordionContent className="space-y-2">
                             {badges.map(b => (
                                <div key={b.id} className="flex items-center space-x-2">
                                    <Checkbox id={`badge-${b.id}`} checked={filters.badges.includes(b.id)} onCheckedChange={() => handleMultiSelectToggle('badges', b.id)} />
                                    <Label htmlFor={`badge-${b.id}`} className="font-normal text-foreground/80">{b.name}</Label>
                                </div>
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="languages">
                        <AccordionTrigger className="font-semibold text-sm">Languages & fluency</AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-2">
                                {['EN', 'FR'].map(langCode => (
                                    <div key={langCode}>
                                        <Label className="font-semibold">{langCode}</Label>
                                        <RadioGroup value={filters.languages[langCode as 'EN' | 'FR']} onValueChange={(v) => updateFilters({ languages: { ...filters.languages, [langCode]: v as any } })}>
                                            {['basic', 'fluent', 'native'].map(level => (
                                                <div key={level} className="flex items-center space-x-2">
                                                    <RadioGroupItem value={level} id={`lang-${langCode}-${level}`} />
                                                    <Label htmlFor={`lang-${langCode}-${level}`} className="capitalize font-normal text-foreground/80">{level}</Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                        <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => {
                                            const newLangs = {...filters.languages};
                                            delete newLangs[langCode as 'EN' | 'FR'];
                                            updateFilters({languages: newLangs});
                                        }}>Clear</Button>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="availability">
                        <AccordionTrigger className="font-semibold text-sm">Availability</AccordionTrigger>
                        <AccordionContent className="space-y-2">
                             {['Online now', 'Busy', 'Offline'].map(a => (
                                <div key={a} className="flex items-center space-x-2">
                                    <Checkbox id={`avail-${a}`} checked={filters.availability.includes(a)} onCheckedChange={() => handleMultiSelectToggle('availability', a)} />
                                    <Label htmlFor={`avail-${a}`} className="font-normal text-foreground/80">{a}</Label>
                                </div>
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="content">
                        <AccordionTrigger className="font-semibold text-sm">Content</AccordionTrigger>
                        <AccordionContent className="space-y-2">
                             {contentFilters.map(f => (
                                <div key={f.id} className="flex items-center space-x-2">
                                    <Checkbox id={`content-${f.id}`} checked={filters.content.includes(f.id)} onCheckedChange={() => handleMultiSelectToggle('content', f.id)} />
                                    <Label htmlFor={`content-${f.id}`} className="font-normal text-foreground/80">{f.name}</Label>
                                </div>
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="admin">
                        <AccordionTrigger className="font-semibold text-sm">Admin</AccordionTrigger>
                        <AccordionContent className="space-y-2">
                             <div className="flex items-center justify-between">
                                <Label htmlFor="fr-only">FR-only visibility</Label>
                                <Switch id="fr-only" checked={filters.frOnlyVisibility} onCheckedChange={(c) => updateFilters({ frOnlyVisibility: c })} />
                            </div>
                             <div className="flex items-center justify-between">
                                <Label htmlFor="a-plus-plus">A++ only (rating ≥ 4.8)</Label>
                                <Switch id="a-plus-plus" checked={filters.aPlusPlusOnly} onCheckedChange={(c) => updateFilters({ aPlusPlusOnly: c })} />
                            </div>
                             <div className="flex items-center justify-between">
                                <Label htmlFor="on-promo">On promo</Label>
                                <Switch id="on-promo" checked={filters.onPromo} onCheckedChange={(c) => updateFilters({ onPromo: c })} />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                <div className="pt-4 space-y-2 lg:hidden">
                    <Button onClick={() => setIsSheetOpen(false)} className="w-full">Apply filters</Button>
                    <Button variant="outline" onClick={handleResetFilters} className="w-full">Clear all</Button>
                </div>
            </div>
        </aside>
    );

    const mobileSheet = (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
                 <Button variant="outline" className="lg:hidden gap-2 w-full mb-6">
                    <Filter className="h-4 w-4" />
                    Filters ({filteredAndSortedConsultants.length} results)
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px] flex flex-col p-0">
                <SheetHeader className="text-left p-4 border-b">
                    <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto">
                    <FilterControls />
                </div>
                <SheetFooter className="p-4 border-t">
                    <Button onClick={() => setIsSheetOpen(false)} className="w-full">Apply filters</Button>
                    <Button variant="outline" onClick={handleResetFilters} className="w-full">Clear all</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
    
    return (
        <>
            {isDesktop ? <FilterControls /> : mobileSheet}
            
            <main>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <p className="text-sm text-muted-foreground w-full sm:w-auto" aria-live="polite">
                        Showing {filteredAndSortedConsultants.length} consultants
                    </p>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Select value={sort} onValueChange={(v: SortKey) => updateSort(v)}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Sort by..." />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(sortOptions).map(([key, value]) => (
                                    <SelectItem key={key} value={key}>{value}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {isDesktop && <Button variant="link" onClick={handleResetFilters} className="text-muted-foreground">Clear all</Button>}
                    </div>
                </div>
                <div role="status" aria-live="polite">
                    {isLoading ? (
                        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                 <div key={i} className="space-y-3">
                                    <Skeleton className="h-[225px] w-full rounded-xl" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredAndSortedConsultants.length > 0 ? (
                        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                            {filteredAndSortedConsultants.map((consultant) => (
                                <ConsultantCard 
                                    key={consultant.id}
                                    consultant={consultant}
                                    onStartNow={() => setIsStartNowModalOpen(true)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg col-span-full">
                            <h3 className="font-headline text-2xl font-bold">No matches yet</h3>
                            <p className="text-muted-foreground mt-2 mb-4">Try clearing a filter or raising your max price.</p>
                            <Button onClick={handleResetFilters}>Reset filters</Button>
                        </div>
                    )}
                </div>
            </main>

            <StartNowModal 
                isOpen={isStartNowModalOpen}
                onOpenChange={setIsStartNowModalOpen}
            />
        </>
    );
}

    