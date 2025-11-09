
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getLocal, seedOnce, setLocal } from "@/lib/local";
import type { Consultant } from "@/lib/consultants-seeder";
import { seedConsultants } from "@/lib/consultants-seeder";
import { ConsultantCard } from "./consultant-card";
import { StartNowModal } from "./start-now-modal";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Briefcase, HeartPulse, CircleDollarSign, Filter, Star, Info } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useToast } from "@/hooks/use-toast";

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
    rating_desc: "Rating (high to low)",
    price_asc: "Price (low to high)",
    price_desc: "Price (high to low)",
};

type SortKey = keyof typeof sortOptions;

interface Filters {
    query: string;
    specialties: string[];
    languages: string[];
    availability: string;
    promoOnly: boolean;
    rate: number[];
    highRatingOnly: boolean;
    sort: SortKey;
}

const defaultFilters: Filters = {
    query: "",
    specialties: [],
    languages: [],
    availability: "Online now",
    promoOnly: false,
    rate: [10],
    highRatingOnly: false,
    sort: "recommended",
};

export function FeaturedConsultants({ initialQuery }: { initialQuery?: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isDesktop = useMediaQuery("(min-width: 1024px)");
    const { toast } = useToast();

    const [allConsultants, setAllConsultants] = useState<Consultant[]>([]);
    const [isStartNowModalOpen, setIsStartNowModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const [filters, setFilters] = useState<Filters>(() => {
        if (typeof window === "undefined") return defaultFilters;
        const savedFilters = sessionStorage.getItem('discover.consultants.filters');
        return savedFilters ? JSON.parse(savedFilters) : defaultFilters;
    });

    const createQueryString = useCallback((newFilters: Partial<Filters>) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        const allFilters = { ...filters, ...newFilters };

        if (allFilters.query) current.set('query', allFilters.query); else current.delete('query');
        if (allFilters.specialties.length > 0) current.set('spec', allFilters.specialties.join(',')); else current.delete('spec');
        if (allFilters.languages.length > 0) current.set('lang', allFilters.languages.join(',')); else current.delete('lang');
        if (allFilters.availability !== defaultFilters.availability) current.set('avail', allFilters.availability.replace(' ', '-').toLowerCase()); else current.delete('avail');
        if (allFilters.rate[0] !== defaultFilters.rate[0]) current.set('max', allFilters.rate[0].toString()); else current.delete('max');
        if (allFilters.sort !== defaultFilters.sort) current.set('sort', allFilters.sort); else current.delete('sort');
        if (allFilters.promoOnly) current.set('promo', 'true'); else current.delete('promo');
        if (allFilters.highRatingOnly) current.set('stars', '4'); else current.delete('stars');

        // Clean up tab parameter if it exists
        if(current.get('tab')) {
            current.delete('tab');
        }

        return current.toString();
    }, [searchParams, filters]);

    const updateFilters = (newFilters: Partial<Filters>) => {
        const updated = { ...filters, ...newFilters };
        setFilters(updated);
        sessionStorage.setItem('discover.consultants.filters', JSON.stringify(updated));
        router.push(`${pathname}?${createQueryString(newFilters)}`, { scroll: false });
    };
    
    useEffect(() => {
        const urlFilters: Partial<Filters> = {};
        const query = searchParams.get('query');
        if(query) urlFilters.query = query; else if (initialQuery) urlFilters.query = initialQuery;

        const spec = searchParams.get('spec');
        if (spec) urlFilters.specialties = spec.split(',');

        const lang = searchParams.get('lang');
        if (lang) urlFilters.languages = lang.split(',');
        
        const avail = searchParams.get('avail');
        if (avail) {
            const availMap: { [key: string]: string } = { 'online-now': 'Online now', 'today': 'Today', 'this-week': 'This week' };
            urlFilters.availability = availMap[avail] || defaultFilters.availability;
        }

        const max = searchParams.get('max');
        if (max) urlFilters.rate = [Number(max)];

        const sort = searchParams.get('sort');
        if (sort && Object.keys(sortOptions).includes(sort)) urlFilters.sort = sort as SortKey;

        urlFilters.promoOnly = searchParams.get('promo') === 'true';
        urlFilters.highRatingOnly = searchParams.get('stars') === '4';
        
        const sessionState = sessionStorage.getItem('discover.consultants.filters');
        const initialState = { ...defaultFilters, ...(sessionState ? JSON.parse(sessionState) : {}), ...urlFilters };

        setFilters(initialState);
        sessionStorage.setItem('discover.consultants.filters', JSON.stringify(initialState));

        seedOnce("consultants_seeded", seedConsultants);
        const storedConsultants = getLocal<Consultant[]>("consultants");
        if (storedConsultants) {
            setAllConsultants(storedConsultants);
        }
        setIsLoading(false);
    }, [searchParams, initialQuery]);

    const filteredAndSortedConsultants = useMemo(() => {
        setIsLoading(true);
        let result = [...allConsultants];

        if (filters.query) {
            const lowercasedQuery = filters.query.toLowerCase();
            result = result.filter(c => 
                c.nameAlias.toLowerCase().includes(lowercasedQuery) ||
                c.shortBlurb.toLowerCase().includes(lowercasedQuery) ||
                c.specialties.some(s => s.toLowerCase().includes(lowercasedQuery))
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
            case 'price_desc':
                result.sort((a, b) => b.ratePerMin - a.ratePerMin);
                break;
            case 'recommended':
            default:
                result.sort((a, b) => {
                    const scoreA = (a.online ? 4 : 0) + (a.promo ? 2 : 0) + a.rating;
                    const scoreB = (b.online ? 4 : 0) + (b.promo ? 2 : 0) + b.rating;
                    return scoreB - scoreA;
                });
                break;
        }

        setTimeout(() => setIsLoading(false), 300);
        return result;
    }, [allConsultants, filters]);

    const handleResetFilters = () => {
        const clearedFilters = {
            ...defaultFilters,
            query: '' // Also clear query on reset
        };
        updateFilters(clearedFilters);
        router.push(`${pathname}`, { scroll: false });
    };

    const handleChipToggle = (group: 'specialties' | 'languages', value: string) => {
        const current = filters[group] as string[];
        const newValues = current.includes(value) ? current.filter((v: string) => v !== value) : [...current, value];
        updateFilters({ [group]: newValues });
    };

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
                    <div className="flex items-center gap-2 flex-wrap bg-muted p-1 rounded-lg">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                    {availabilities.map((avail) => (
                                        <Button
                                            key={avail}
                                            variant={filters.availability === avail ? "background" : "ghost"}
                                            size="sm"
                                            onClick={() => updateFilters({ availability: avail })}
                                            className="flex-1 justify-center shadow-sm"
                                        >
                                            {avail}
                                        </Button>
                                    ))}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Start instantly if the consultant is available.</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <div className="lg:ml-auto">
                        <Select value={filters.sort} onValueChange={(v: SortKey) => updateFilters({ sort: v })}>
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
                    <div className="flex-1 lg:max-w-xs space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="price-range" className="flex items-center gap-1">
                                Max Price
                                 <Tooltip>
                                    <TooltipTrigger asChild><Info className="h-3 w-3 cursor-pointer"/></TooltipTrigger>
                                    <TooltipContent>Maximum rate per minute you’re comfortable paying.</TooltipContent>
                                </Tooltip>
                            </Label>
                            <span className="text-primary font-bold">€{filters.rate[0].toFixed(2)}/min</span>
                        </div>
                        <Slider id="price-range" min={1} max={10} step={0.5} value={filters.rate} onValueChange={(v) => updateFilters({ rate: v })} />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center space-x-2">
                                    <Switch id="promo-only" checked={filters.promoOnly} onCheckedChange={(c) => updateFilters({promoOnly: c})} />
                                    <Label htmlFor="promo-only">On promo</Label>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Discounted per-minute rate for a limited time.</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="rating-only" checked={filters.highRatingOnly} onCheckedChange={(c) => updateFilters({ highRatingOnly: c })}/>
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
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredAndSortedConsultants.map((consultant) => (
                            <ConsultantCard 
                                key={consultant.id}
                                consultant={consultant}
                                onStartNow={() => setIsStartNowModalOpen(true)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg">
                        <h3 className="font-headline text-2xl font-bold">No matching consultants.</h3>
                        <p className="text-muted-foreground mt-2 mb-4">Try widening your filters or clearing ‘On promo’ / ‘4★+’.</p>
                        <Button onClick={handleResetFilters}>Clear filters</Button>
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

    