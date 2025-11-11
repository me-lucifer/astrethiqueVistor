
"use client";

import { useState, useEffect, useCallback, useMemo, useTransition } from "react";
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
import { Heart, Briefcase, HeartPulse, CircleDollarSign, Filter, Info, BookOpen, Mic, Video, Star, BadgeCheck, Languages, Clock, ChevronDown, Sparkles } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "./ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import { getSession, setSession } from "@/lib/session";
import { parseISO } from 'date-fns';
import * as storage from '@/lib/storage';
import { useToast } from "@/hooks/use-toast";

const specialties = [
    { id: "Love", name: "Love", icon: Heart },
    { id: "Work", name: "Work", icon: Briefcase },
    { id: "Health", name: "Health", icon: HeartPulse },
    { id: "Money", name: "Money", icon: CircleDollarSign },
    { id: "Life Path", name: "Life Path", icon: Star },
];

const zodiacSigns = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

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
    types: string[];
    price: [number, number];
    minPrice: string;
    maxPrice: string;
    zodiac: string;
    rating: string;
    badges: string[];
    languages: {
        EN?: boolean;
        FR?: boolean;
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
    types: [],
    price: [0, 10],
    minPrice: "0",
    maxPrice: "10",
    zodiac: "",
    rating: "0",
    badges: [],
    languages: {},
    availability: [],
    content: [],
    frOnlyVisibility: false,
    aPlusPlusOnly: false,
    onPromo: false,
};

const INITIAL_VISIBLE_COUNT = 9;

export function FeaturedConsultants({ initialQuery, showFilters = false }: { initialQuery?: string, showFilters?: boolean }) {
    const isDesktop = useMediaQuery("(min-width: 1024px)");
    const { toast } = useToast();

    const [allConsultants, setAllConsultants] = useState<Consultant[]>([]);
    const [readingTypes, setReadingTypes] = useState<string[]>([]);
    const [isStartNowModalOpen, setIsStartNowModalOpen] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [query, setQuery] = useState(initialQuery || "");
    const [visibleCount, setVisibleCount] = useState(() => getSession<number>('discover.pageSize.v1') || INITIAL_VISIBLE_COUNT);

    const [isPending, startTransition] = useTransition();
    const isLoading = isPending;

    const [filters, setFilters] = useState<Filters>(() => {
        const sessionState = getSession<Filters>('discover.filters.v1');
        return { ...defaultFilters, ...(sessionState || {}) };
    });
    const [sort, setSort] = useState<SortKey>(() => getSession<SortKey>('discover.sort.v1') || 'recommended');
    const [priceBounds, setPriceBounds] = useState<[number, number]>([0, 10]);

    const loadState = useCallback(() => {
        const storedConsultants = getSession<Consultant[]>('discover.seed.v1');
        if (storedConsultants && Array.isArray(storedConsultants)) {
            setAllConsultants(storedConsultants);
            const prices = storedConsultants.map(c => c.pricePerMin);
            const min = Math.floor(Math.min(...prices, 0));
            const max = Math.ceil(Math.max(...prices, 10));
            setPriceBounds([min, max]);

            const savedFilters = getSession<Filters>('discover.filters.v1');
            const mergedFilters = { ...defaultFilters, ...savedFilters };
            
            if (!savedFilters || !savedFilters.price) {
                 const initialPrice: [number, number] = [min, max];
                 mergedFilters.price = initialPrice;
                 mergedFilters.minPrice = String(initialPrice[0]);
                 mergedFilters.maxPrice = String(initialPrice[1]);
            }
            updateFilters(mergedFilters, true);
        }
        const savedQuery = getSession<string>('discover.search.v1');
        if (savedQuery) {
            setQuery(savedQuery);
        }
        const savedTypes = getSession<string[]>('discover.types.v1');
        if (savedTypes) {
            setReadingTypes(savedTypes);
        }
    }, []);

    useEffect(() => {
        loadState();
        
        const handleStorageChange = () => {
            loadState();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadState]);


    const updateFilters = (newFilters: Partial<Filters>, overwrite = false) => {
        startTransition(() => {
            setFilters(prev => {
                const updated = overwrite ? (newFilters as Filters) : { ...prev, ...newFilters };
                setSession('discover.filters.v1', updated);
                return updated;
            });
            setVisibleCount(INITIAL_VISIBLE_COUNT);
            setSession('discover.pageSize.v1', INITIAL_VISIBLE_COUNT);
        });
    };
    
    const updateSort = (newSort: SortKey) => {
        startTransition(() => {
            setSort(newSort);
            setSession('discover.sort.v1', newSort);
            setVisibleCount(INITIAL_VISIBLE_COUNT);
            setSession('discover.pageSize.v1', INITIAL_VISIBLE_COUNT);
        });
    }

    useEffect(() => {
        startTransition(() => {
            setQuery(initialQuery || "");
            setVisibleCount(INITIAL_VISIBLE_COUNT);
            setSession('discover.pageSize.v1', INITIAL_VISIBLE_COUNT);
        })
    }, [initialQuery])

    const filteredAndSortedConsultants = useMemo(() => {
        const user = storage.getCurrentUser();
        const allFavorites = storage.getStorageItem<Record<string, storage.Favorites>>('ast_favorites') || {};
        const favorites = user ? (allFavorites[user.id]?.consultants || []) : [];
        
        let result = allConsultants;

        // Search Query Filter
        if (query && query.length > 0) {
            const lowerCaseQuery = query.toLowerCase();
            result = result.filter(c => 
                c.name.toLowerCase().includes(lowerCaseQuery) ||
                c.specialties.some(s => s.toLowerCase().includes(lowerCaseQuery)) ||
                (c.types && c.types.some(t => t.toLowerCase().includes(lowerCaseQuery))) ||
                c.bio.toLowerCase().includes(lowerCaseQuery)
            );
        }

        // Standard Filters
        result = result.filter(c => {
            if (filters.myFavorites && !favorites.includes(c.id)) return false;
            
            if (filters.specialties.length > 0 && !filters.specialties.some(s => c.specialties.includes(s as any))) return false;

            if (filters.types.length > 0 && !filters.types.some(t => c.types.includes(t))) return false;
            
            if (c.pricePerMin < filters.price[0] || c.pricePerMin > filters.price[1]) return false;

            if (filters.zodiac && !c.specializesInSigns.includes(filters.zodiac)) return false;

            if (parseFloat(filters.rating) > 0 && c.rating < parseFloat(filters.rating)) return false;

            if (filters.badges.length > 0 && !filters.badges.every(b => c.badges && c.badges.includes(b as any))) return false;

            if (Object.values(filters.languages).some(v => v) && !Object.entries(filters.languages).every(([lang, checked]) => !checked || c.languages.includes(lang as any))) {
              return false;
            }


            if (filters.availability.length > 0) {
                const availabilityString = c.availability.online ? 'Online now' : (getSession<string[]>('busyConsultants')?.includes(c.id) ? 'Busy' : 'Offline');
                if (!filters.availability.includes(availabilityString)) {
                     return false;
                }
            }

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

            if (filters.frOnlyVisibility && !c.languages.some(l => l === 'FR')) return false;
            if (filters.aPlusPlusOnly && c.rating < 4.8) return false;
            if (filters.onPromo && !c.promo24h) return false;

            return true;
        });

        result.sort((a, b) => {
            const availabilityOrder = { 'Online now': 1, 'Busy': 2, 'Offline': 3 };
            const aAvailString = a.availability.online ? 'Online now' : (getSession<string[]>('busyConsultants')?.includes(a.id) ? 'Busy' : 'Offline');
            const bAvailString = b.availability.online ? 'Online now' : (getSession<string[]>('busyConsultants')?.includes(b.id) ? 'Busy' : 'Offline');

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
                    return availabilityOrder[aAvailString as keyof typeof availabilityOrder] - availabilityOrder[bAvailString as keyof typeof availabilityOrder] || b.rating - a.rating;
                case 'recommended':
                default:
                    const scoreA = (a.availability.online ? 1000 : 0) + (a.rating * 100) - a.pricePerMin;
                    const scoreB = (b.availability.online ? 1000 : 0) + (b.rating * 100) - b.pricePerMin;
                    return scoreB - scoreA;
            }
        });
        
        return result;
    }, [allConsultants, filters, sort, query]);

    const handleResetFilters = () => {
        const newFilters = {...defaultFilters, price: priceBounds, minPrice: String(priceBounds[0]), maxPrice: String(priceBounds[1])};
        updateFilters(newFilters, true);
        updateSort('recommended');
    };

    const handleMultiSelectToggle = (group: 'specialties' | 'types' | 'badges' | 'availability' | 'content', value: string) => {
        const current = filters[group] as string[];
        const newValues = current.includes(value) ? current.filter((v: string) => v !== value) : [...current, value];
        updateFilters({ [group]: newValues });
    };

    const handlePriceInputChange = (type: 'min' | 'max', value: string) => {
        const numericValue = parseFloat(value);
        let newPrice: [number, number] = [...filters.price];
        const key = type === 'min' ? 'minPrice' : 'maxPrice';

        if (type === 'min') {
            newPrice[0] = isNaN(numericValue) ? priceBounds[0] : Math.max(priceBounds[0], Math.min(numericValue, filters.price[1] - 0.01));
            updateFilters({ minPrice: value, price: newPrice });
        } else { // max
            newPrice[1] = isNaN(numericValue) ? priceBounds[1] : Math.min(priceBounds[1], Math.max(numericValue, filters.price[0] + 0.01));
            updateFilters({ maxPrice: value, price: newPrice });
        }
    };
    
    const handleSliderChange = (newPrice: [number, number]) => {
        updateFilters({ 
            price: newPrice,
            minPrice: String(newPrice[0]),
            maxPrice: String(newPrice[1])
        });
    };

    const handleLoadMore = () => {
        const newCount = visibleCount + 9;
        setVisibleCount(newCount);
        setSession('discover.pageSize.v1', newCount);
    }
    
    const handleApplyFilters = () => {
        setIsSheetOpen(false);
        setVisibleCount(INITIAL_VISIBLE_COUNT);
        setSession('discover.pageSize.v1', INITIAL_VISIBLE_COUNT);
    }
    
    const handleClearAndApply = () => {
        handleResetFilters();
        setIsSheetOpen(false);
    }

    const handleSaveSearch = () => {
        const user = storage.getCurrentUser();
        if (!user) {
            toast({ variant: 'destructive', title: 'Please log in to save searches.' });
            return;
        }

        storage.trackMetric('favorites');

        const allPrefs = storage.getStorageItem<Record<string, any>>('ast_prefs') || {};
        const userPrefs = allPrefs[user.id] || {};
        
        const savedSearches = userPrefs.savedSearches || [];
        savedSearches.push({
            type: 'consultant',
            query: query,
            filters: filters,
            createdAt: new Date().toISOString()
        });

        userPrefs.savedSearches = savedSearches;
        allPrefs[user.id] = userPrefs;
        storage.setStorageItem('ast_prefs', allPrefs);
        
        toast({
            title: "Search saved!",
            description: "You can find your saved searches in your profile.",
        });
    }

    const FilterControls = () => (
        <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-120px)] lg:overflow-y-auto lg:pr-4 -mr-4 lg:mr-0">
            <div className="space-y-6 p-4 lg:p-0">
                <Accordion type="multiple" defaultValue={['general', 'specialty', 'types', 'price', 'zodiac', 'rating', 'availability']} className="w-full">
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
                    <AccordionItem value="types">
                        <AccordionTrigger className="font-semibold text-sm">Reading Type</AccordionTrigger>
                        <AccordionContent className="space-y-2">
                             {readingTypes.map((type) => (
                                <div key={type} className="flex items-center space-x-2">
                                    <Checkbox id={`type-${type}`} checked={filters.types.includes(type)} onCheckedChange={() => handleMultiSelectToggle('types', type)} />
                                    <Label htmlFor={`type-${type}`} className="font-normal text-foreground/80">{type}</Label>
                                </div>
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="price">
                        <AccordionTrigger className="font-semibold text-sm">Price per minute</AccordionTrigger>
                        <AccordionContent>
                            <div className="flex justify-between items-center mb-2">
                                <Label htmlFor="price-slider" className="text-primary font-bold">€{filters.price[0]} &mdash; €{filters.price[1]}/min</Label>
                            </div>
                            <Slider id="price-slider" aria-label="Price range" min={priceBounds[0]} max={priceBounds[1]} step={0.5} value={filters.price} onValueChange={handleSliderChange} />
                             <div className="flex gap-2 mt-2">
                                <Input type="number" aria-label="Minimum price" placeholder="Min" value={filters.minPrice} onChange={(e) => handlePriceInputChange('min', e.target.value)} />
                                <Input type="number" aria-label="Maximum price" placeholder="Max" value={filters.maxPrice} onChange={(e) => handlePriceInputChange('max', e.target.value)} />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="zodiac">
                        <AccordionTrigger className="font-semibold text-sm">Zodiac Sign</AccordionTrigger>
                        <AccordionContent>
                            <Select value={filters.zodiac} onValueChange={(v) => updateFilters({ zodiac: v === 'any' ? '' : v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a sign..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="any">Any</SelectItem>
                                    {zodiacSigns.map(sign => (
                                        <SelectItem key={sign} value={sign}>{sign}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                        <AccordionTrigger className="font-semibold text-sm">Languages</AccordionTrigger>
                        <AccordionContent className="space-y-2">
                             {(['EN', 'FR'] as const).map(langCode => (
                                <div key={langCode} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`lang-${langCode}`} 
                                        checked={!!filters.languages[langCode]} 
                                        onCheckedChange={(checked) => {
                                            const newLangs = {...filters.languages};
                                            if (checked) {
                                                newLangs[langCode] = true;
                                            } else {
                                                delete newLangs[langCode];
                                            }
                                            updateFilters({languages: newLangs});
                                        }}
                                    />
                                    <Label htmlFor={`lang-${langCode}`} className="font-normal text-foreground/80">{langCode}</Label>
                                </div>
                            ))}
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
            </div>
        </aside>
    );

    const mobileSheet = (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
                 <Button variant="outline" className="lg:hidden gap-2" aria-label="Open filters">
                    <Filter className="h-4 w-4" />
                    Filters
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px] flex flex-col p-0">
                <SheetHeader className="text-left p-4 border-b">
                    <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto">
                    <FilterControls />
                </div>
                <SheetFooter className="p-4 border-t gap-2">
                    <Button onClick={handleApplyFilters} className="w-full">Apply filters</Button>
                    <Button variant="outline" onClick={handleClearAndApply} className="w-full">Clear all</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
    
    return (
        <TooltipProvider>
            {showFilters && (isDesktop ? <FilterControls /> : null)}
            
            <main className={!showFilters ? 'w-full' : ''}>
                {showFilters && (
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <p className="text-sm text-muted-foreground w-full sm:w-auto" aria-live="polite">
                            Showing {filteredAndSortedConsultants.length} consultants
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
                            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleSaveSearch}>
                                <Star className="h-5 w-5" />
                                <span className="sr-only">Save search</span>
                            </Button>
                            {isDesktop && <Button variant="link" onClick={handleResetFilters} className="text-muted-foreground">Clear all</Button>}
                        </div>
                    </div>
                )}
                <div role="status" aria-live="polite">
                    {isLoading || allConsultants.length === 0 ? (
                        <div className="grid gap-6 grid-cols-1 xs:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                            {Array.from({ length: showFilters ? 9 : 4 }).map((_, i) => (
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
                        <>
                            <div className="grid gap-6 grid-cols-1 xs:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                                {filteredAndSortedConsultants.slice(0, visibleCount).map((consultant) => (
                                    <ConsultantCard 
                                        key={consultant.id}
                                        consultant={consultant}
                                    />
                                ))}
                            </div>
                             {visibleCount < filteredAndSortedConsultants.length && (
                                <div className="text-center mt-8">
                                    <Button onClick={handleLoadMore}>Load more</Button>
                                </div>
                            )}
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
        </TooltipProvider>
    );
}
