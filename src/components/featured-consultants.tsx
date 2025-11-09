
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Consultant } from "@/lib/consultants";
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
import { getSession, setSession } from "@/lib/session";

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

export function FeaturedConsultants({ initialQuery }: { initialQuery?: string }) {
    const isDesktop = useMediaQuery("(min-width: 1024px)");

    const [allConsultants, setAllConsultants] = useState<Consultant[]>([]);
    const [isStartNowModalOpen, setIsStartNowModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [query, setQuery] = useState(initialQuery || "");

    const [filters, setFilters] = useState<Filters>(() => getSession('discover.filters.v1') || defaultFilters);
    const [sort, setSort] = useState<SortKey>(() => getSession('discover.sort.v1') || 'recommended');

    useEffect(() => {
        const storedConsultants = getSession<Consultant[]>('discover.consultants.v1');
        if (storedConsultants) {
            setAllConsultants(storedConsultants);
        }
        setIsLoading(false);
    }, []);

    const updateFilters = (newFilters: Partial<Omit<Filters, 'sort'>>) => {
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

    useEffect(() => {
      setQuery(initialQuery || "");
    }, [initialQuery]);

    const filteredAndSortedConsultants = useMemo(() => {
        setIsLoading(true);
        let result = [...allConsultants];

        // This filtering logic will be expanded in a later step
        // For now, it just returns all consultants

        setTimeout(() => setIsLoading(false), 300);
        return result;
    }, [allConsultants, filters, query, sort]);

    const handleResetFilters = () => {
        setFilters(defaultFilters);
        setSort('recommended');
        setSession('discover.filters.v1', defaultFilters);
        setSession('discover.sort.v1', 'recommended');
    };

    const handleChipToggle = (group: 'specialties' | 'languages', value: string) => {
        const current = filters[group] as string[];
        const newValues = current.includes(value) ? current.filter((v: string) => v !== value) : [...current, value];
        updateFilters({ [group]: newValues });
    };

    const handleAvailabilityToggle = (value: string) => {
        const newAvailability = filters.availability === value ? "" : value;
        updateFilters({ availability: newAvailability });
    };

    const FilterControls = () => (
        <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-120px)] lg:overflow-y-auto lg:pr-4 space-y-6">
            <h3 className="font-headline text-lg font-bold">Filters</h3>
            <TooltipProvider>
                <div className="space-y-4">
                    <div>
                        <Label className="font-semibold text-sm">Specialties:</Label>
                        <div className="flex flex-wrap gap-2 pt-2">
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
                    </div>
                     <div>
                        <Label className="font-semibold text-sm">Languages:</Label>
                        <div className="flex flex-wrap gap-2 pt-2">
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
                    </div>
                     <div>
                        <Label className="font-semibold text-sm">Availability:</Label>
                        <div className="flex flex-wrap gap-2 pt-2 bg-muted p-1 rounded-lg">
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
                    </div>
                    <div>
                        <div className="flex justify-between items-center">
                            <Label htmlFor="price-range" className="flex items-center gap-1 font-semibold">
                                Max Price
                                 <Tooltip>
                                    <TooltipTrigger asChild><Info className="h-3 w-3 cursor-pointer"/></TooltipTrigger>
                                    <TooltipContent>Maximum rate per minute you’re comfortable paying.</TooltipContent>
                                </Tooltip>
                            </Label>
                            <span className="text-primary font-bold">{filters.rate[0].toFixed(2)}€/min</span>
                        </div>
                        <Slider id="price-range" min={0} max={12} step={0.5} value={filters.rate} onValueChange={(v) => updateFilters({ rate: v })} />
                    </div>
                     <div className="flex items-center justify-between">
                         <Tooltip>
                            <TooltipTrigger asChild>
                                 <Label htmlFor="promo-only" className="flex items-center gap-2 font-semibold">
                                    On promo
                                    <Info className="h-3 w-3 cursor-pointer"/>
                                </Label>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Discounted per-minute rate for a limited time.</p>
                            </TooltipContent>
                        </Tooltip>
                        <Switch id="promo-only" checked={filters.promoOnly} onCheckedChange={(c) => updateFilters({promoOnly: c})} />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="rating-only" className="font-semibold">4★+ only</Label>
                        <Switch id="rating-only" checked={filters.highRatingOnly} onCheckedChange={(c) => updateFilters({ highRatingOnly: c })}/>
                    </div>

                    <div className="pt-4">
                        <Button variant="outline" onClick={handleResetFilters} className="w-full">Reset all filters</Button>
                    </div>
                </div>
            </TooltipProvider>
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
            <SheetContent side="left" className="w-[320px] flex flex-col">
                <SheetHeader className="text-left">
                    <SheetTitle>Filters</SheetTitle>
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
            {isDesktop ? <FilterControls /> : mobileSheet}
            
            <main>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <p className="text-sm text-muted-foreground w-full sm:w-auto" aria-live="polite">
                        Showing {filteredAndSortedConsultants.length} consultants
                    </p>
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
                </div>
                <div role="status" aria-live="polite">
                    {isLoading ? (
                        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
                            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                {filteredAndSortedConsultants.map((consultant) => (
                                    <ConsultantCard 
                                        key={consultant.id}
                                        consultant={consultant}
                                        onStartNow={() => setIsStartNowModalOpen(true)}
                                    />
                                ))}
                            </div>
                        </>
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
