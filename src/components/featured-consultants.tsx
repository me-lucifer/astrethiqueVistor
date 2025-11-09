
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Consultant } from "@/lib/consultants";
import consultantsData from "@/lib/consultants.json";
import { ConsultantCard } from "./consultant-card";
import { StartNowModal } from "./start-now-modal";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Briefcase, HeartPulse, CircleDollarSign, Filter, Info } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";

const specialties = [
    { name: "Love", icon: Heart },
    { name: "Work", icon: Briefcase },
    { name: "Health", icon: HeartPulse },
    { name: "Money", icon: CircleDollarSign },
];
const languages = ["EN", "FR"];
const availabilities = ["Online now", "Today", "This week"];
const sortOptions = {
    recommended: "Recommended",
    price_asc: "Price (low to high)",
    rating_desc: "Rating (high to low)",
    most_reviewed: "Most reviewed",
    newest: "Newest",
};

type SortKey = keyof typeof sortOptions;

interface Filters {
    specialties: string[];
    languages: string[];
    availability: string;
    promoOnly: boolean;
    rate: number[];
    highRatingOnly: boolean;
    sort: SortKey;
}

const defaultFilters: Filters = {
    specialties: [],
    languages: [],
    availability: "",
    promoOnly: false,
    rate: [12],
    highRatingOnly: false,
    sort: "recommended",
};

const INITIAL_LOAD_COUNT = 8;

export function FeaturedConsultants({ initialQuery }: { initialQuery?: string }) {
    const isDesktop = useMediaQuery("(min-width: 1024px)");

    const allConsultants: Consultant[] = useMemo(() => consultantsData, []);
    const [isStartNowModalOpen, setIsStartNowModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [query, setQuery] = useState(initialQuery || "");
    const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD_COUNT);

    const [filters, setFilters] = useState<Filters>(() => {
        if (typeof window === "undefined") return defaultFilters;
        const savedFilters = sessionStorage.getItem('discoverFilters');
        return savedFilters ? JSON.parse(savedFilters) : defaultFilters;
    });

    useEffect(() => {
        const savedFilters = sessionStorage.getItem('discoverFilters');
        if (savedFilters) {
            setFilters(JSON.parse(savedFilters));
        }
        setIsLoading(false);
    }, []);

    const updateFilters = (newFilters: Partial<Filters>) => {
        setFilters(prev => {
            const updated = { ...prev, ...newFilters };
            if (typeof window !== "undefined") {
                sessionStorage.setItem('discoverFilters', JSON.stringify(updated));
            }
            return updated;
        });
    };

    useEffect(() => {
      setQuery(initialQuery || "");
    }, [initialQuery]);

    const filteredAndSortedConsultants = useMemo(() => {
        setIsLoading(true);
        let result = [...allConsultants];

        if (query) {
            const lowercasedQuery = query.toLowerCase();
            result = result.filter(c => 
                c.nameAlias.toLowerCase().includes(lowercasedQuery) ||
                (c.specialties && c.specialties.some(s => s.toLowerCase().includes(lowercasedQuery)))
            );
        }

        if (filters.specialties.length > 0) {
            result = result.filter(c => filters.specialties.some(s => c.specialties.includes(s as any)));
        }
        if (filters.languages.length > 0) {
            result = result.filter(c => filters.languages.some(s => c.languages.includes(s as any)));
        }
        if (filters.availability === "Online now") {
            result = result.filter(c => c.online);
        }
        // "Today" and "This week" filters would require more complex date logic on seed data.
        if (filters.promoOnly) {
            result = result.filter(c => c.promo);
        }
        if(filters.highRatingOnly) {
            result = result.filter(c => c.rating >= 4.0);
        }
        result = result.filter(c => c.ratePerMin <= filters.rate[0]);

        switch (filters.sort) {
            case 'rating_desc':
                result.sort((a, b) => b.rating - a.rating);
                break;
            case 'price_asc':
                result.sort((a, b) => a.ratePerMin - b.ratePerMin);
                break;
            case 'most_reviewed':
                result.sort((a, b) => b.sessionsCount - a.sessionsCount);
                break;
            case 'newest':
                result.sort((a, b) => (new Date(b.joinedAt)).getTime() - (new Date(a.joinedAt)).getTime());
                break;
            case 'recommended':
            default:
                const maxReviews = Math.max(...result.map(c => c.sessionsCount), 1);
                result.sort((a, b) => {
                    const scoreA = (a.rating / 5 * 0.60) + (a.sessionsCount / maxReviews * 0.25) + (a.online ? 0.10 : 0) + (a.promo ? 0.05 : 0);
                    const scoreB = (b.rating / 5 * 0.60) + (b.sessionsCount / maxReviews * 0.25) + (b.online ? 0.10 : 0) + (b.promo ? 0.05 : 0);
                    return scoreB - scoreA;
                });
                break;
        }

        setTimeout(() => setIsLoading(false), 300);
        return result;
    }, [allConsultants, filters, query]);

    const handleResetFilters = () => {
        updateFilters(defaultFilters);
        if (typeof window !== "undefined") {
            sessionStorage.removeItem('discoverFilters');
        }
        setVisibleCount(INITIAL_LOAD_COUNT);
    };

    const handleChipToggle = (group: 'specialties' | 'languages', value: string) => {
        const current = filters[group] as string[];
        const newValues = current.includes(value) ? current.filter((v: string) => v !== value) : [...current, value];
        updateFilters({ [group]: newValues });
        setVisibleCount(INITIAL_LOAD_COUNT);
    };

    const handleAvailabilityToggle = (value: string) => {
        const newAvailability = filters.availability === value ? "" : value;
        updateFilters({ availability: newAvailability });
        setVisibleCount(INITIAL_LOAD_COUNT);
    };

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + INITIAL_LOAD_COUNT);
    };

    const visibleConsultants = useMemo(() => {
        return filteredAndSortedConsultants.slice(0, visibleCount);
    }, [filteredAndSortedConsultants, visibleCount]);

    const FilterControls = () => (
        <TooltipProvider>
            <div className="space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">Specialties:</span>
                        {specialties.map(({name, icon: Icon}) => (
                             <Button
                                key={name}
                                variant={filters.specialties.includes(name) ? "secondary" : "outline"}
                                size="sm"
                                onClick={() => handleChipToggle('specialties', name)}
                                className="rounded-full gap-2"
                            >
                                <Icon className="h-4 w-4" /> {name}
                            </Button>
                        ))}
                    </div>
                     <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">Languages:</span>
                        {languages.map((lang) => (
                             <Button
                                key={lang}
                                variant={filters.languages.includes(lang) ? "secondary" : "outline"}
                                size="sm"
                                onClick={() => handleChipToggle('languages', lang)}
                                className="rounded-full gap-2"
                            >
                                {lang === 'EN' ? '🇬🇧' : '🇫🇷'} {lang}
                            </Button>
                        ))}
                    </div>
                    <div className="lg:ml-auto">
                        <Select value={filters.sort} onValueChange={(v: SortKey) => { updateFilters({ sort: v }); setVisibleCount(INITIAL_LOAD_COUNT); }}>
                            <SelectTrigger className="w-full lg:w-[180px]">
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
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-center gap-2 flex-wrap bg-muted p-1 rounded-lg">
                        <span className="font-semibold text-sm ml-2">Availability:</span>
                        {availabilities.map((avail) => (
                            <Button
                                key={avail}
                                variant={filters.availability === avail ? "background" : "ghost"}
                                size="sm"
                                onClick={() => handleAvailabilityToggle(avail)}
                                className="flex-1 justify-center shadow-sm"
                            >
                                {avail}
                            </Button>
                        ))}
                    </div>

                    <div className="flex-1 lg:max-w-xs space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="price-range" className="flex items-center gap-1">
                                Max Price
                                 <Tooltip>
                                    <TooltipTrigger asChild><Info className="h-3 w-3 cursor-pointer"/></TooltipTrigger>
                                    <TooltipContent>Maximum rate per minute you’re comfortable paying.</TooltipContent>
                                </Tooltip>
                            </Label>
                            <span className="text-primary font-bold">{filters.rate[0].toFixed(2)}€/min</span>
                        </div>
                        <Slider id="price-range" min={0} max={12} step={0.5} value={filters.rate} onValueChange={(v) => { updateFilters({ rate: v }); setVisibleCount(INITIAL_LOAD_COUNT); }} />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center space-x-2">
                                    <Switch id="promo-only" checked={filters.promoOnly} onCheckedChange={(c) => { updateFilters({promoOnly: c}); setVisibleCount(INITIAL_LOAD_COUNT); }} />
                                    <Label htmlFor="promo-only">On promo</Label>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Discounted per-minute rate for a limited time.</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="rating-only" checked={filters.highRatingOnly} onCheckedChange={(c) => { updateFilters({ highRatingOnly: c }); setVisibleCount(INITIAL_LOAD_COUNT); }}/>
                        <Label htmlFor="rating-only">4★+ only</Label>
                    </div>
                    <Button variant="link" onClick={handleResetFilters} className="p-0 h-auto">Reset all</Button>

                    <div className="lg:ml-auto flex items-center gap-4">
                         <p className="text-sm text-muted-foreground" aria-live="polite">
                            Showing {filteredAndSortedConsultants.length} consultants
                        </p>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );

    const mobileSheet = (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
                 <Button variant="outline" className="lg:hidden gap-2 w-full">
                    <Filter className="h-4 w-4" />
                    Filters ({filteredAndSortedConsultants.length} results)
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
    
    return (
        <>
            <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60 py-4 mb-6">
                 {isDesktop ? <FilterControls /> : mobileSheet}
            </div>

            <div role="status" aria-live="polite">
                {isLoading ? (
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                             <div key={i} className="space-y-3">
                                <Skeleton className="h-[225px] w-full rounded-xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[250px]" />
                                    <Skeleton className="h-4 w-[200px]" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredAndSortedConsultants.length > 0 ? (
                    <>
                        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {visibleConsultants.map((consultant) => (
                                <ConsultantCard 
                                    key={consultant.id}
                                    consultant={consultant}
                                    onStartNow={() => setIsStartNowModalOpen(true)}
                                />
                            ))}
                        </div>
                        {visibleCount < filteredAndSortedConsultants.length && (
                            <div className="mt-10 text-center">
                                <Button onClick={handleLoadMore} size="lg">Load More</Button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg">
                        {query ? (
                            <>
                                <h3 className="font-headline text-2xl font-bold">No results for ‘{query}’</h3>
                                <p className="text-muted-foreground mt-2">Try another term.</p>
                             </>
                        ) : (
                            <>
                                <h3 className="font-headline text-2xl font-bold">No matches yet</h3>
                                <p className="text-muted-foreground mt-2 mb-4">Try clearing a filter or raising your max price.</p>
                                <Button onClick={handleResetFilters}>Reset filters</Button>
                            </>
                        )}
                    </div>
                )}
            </div>

            <StartNowModal 
                isOpen={isStartNowModalOpen}
                onOpenChange={setIsStartNowModalOpen}
            />
        </>
    );
}
