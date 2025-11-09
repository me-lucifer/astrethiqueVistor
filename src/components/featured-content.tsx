
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getLocal, seedOnce } from "@/lib/local";
import { ContentItem, seedContentItems } from "@/lib/content-seeder";
import { ContentCard } from "./content-card";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Filter, BookOpen, Mic, Video } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMediaQuery } from "@/hooks/use-media-query";

const contentTypes = [
    { name: "Article", icon: BookOpen },
    { name: "Podcast", icon: Mic },
    { name: "Video", icon: Video },
];
const languages = ["EN", "FR"];
const tags = ["Love", "Work", "Health", "Money", "Astrology", "Tarot", "Numerology", "Clairvoyance"];
const sortOptions = {
    newest: "Newest",
    most_read: "Most Read",
    editors_picks: "Editor's Picks",
};

type SortKey = keyof typeof sortOptions;

interface Filters {
    types: string[];
    languages: string[];
    tags: string[];
    sort: SortKey;
}

const defaultFilters: Filters = {
    types: [],
    languages: [],
    tags: [],
    sort: "newest",
};

export function FeaturedContent({ displayFilters = false }: { displayFilters?: boolean }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isDesktop = useMediaQuery("(min-width: 1024px)");

    const [allContent, setAllContent] = useState<ContentItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const [filters, setFilters] = useState<Filters>(() => {
        if (typeof window === "undefined" || !displayFilters) return defaultFilters;
        const savedFilters = sessionStorage.getItem('discover.content.filters');
        return savedFilters ? JSON.parse(savedFilters) : defaultFilters;
    });

    useEffect(() => {
        seedOnce("content_seeded", seedContentItems);
        const storedContent = getLocal<ContentItem[]>("contentItems");
        if (storedContent) {
            setAllContent(storedContent);
        }

        if(displayFilters) {
            const urlFilters: Partial<Filters> = {};
            const typeParam = searchParams.get('type');
            if (typeParam) urlFilters.types = typeParam.split(',');
            const langParam = searchParams.get('lang');
            if (langParam) urlFilters.languages = langParam.split(',');
            const tagParam = searchParams.get('tags');
            if (tagParam) urlFilters.tags = tagParam.split(',');
            const sortParam = searchParams.get('sort');
            if (sortParam && Object.keys(sortOptions).includes(sortParam)) urlFilters.sort = sortParam as SortKey;
    
            const sessionState = sessionStorage.getItem('discover.content.filters');
            const initialState = {...defaultFilters, ...(sessionState ? JSON.parse(sessionState) : {}), ...urlFilters};
            setFilters(initialState);
            sessionStorage.setItem('discover.content.filters', JSON.stringify(initialState));
        }

        setIsLoading(false);
    }, [searchParams, displayFilters]);

    const createQueryString = useCallback((newFilters: Partial<Filters>) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        const allFilters = { ...filters, ...newFilters };

        current.set("tab", "content");
        if(allFilters.types.length > 0) current.set('type', allFilters.types.join(',')); else current.delete('type');
        if(allFilters.languages.length > 0) current.set('lang', allFilters.languages.join(',')); else current.delete('lang');
        if(allFilters.tags.length > 0) current.set('tags', allFilters.tags.join(',')); else current.delete('tags');
        if(allFilters.sort !== defaultFilters.sort) current.set('sort', allFilters.sort); else current.delete('sort');

        return current.toString();
    }, [searchParams, filters]);

    const updateFilters = (newFilters: Partial<Filters>) => {
        const updated = { ...filters, ...newFilters };
        setFilters(updated);
        sessionStorage.setItem('discover.content.filters', JSON.stringify(updated));
        if(displayFilters) {
            router.push(`${pathname}?${createQueryString(newFilters)}`, { scroll: false });
        }
    };
    
    const handleChipToggle = (group: 'types' | 'languages' | 'tags', value: string) => {
        const current = filters[group] as string[];
        const newValues = current.includes(value) ? current.filter((v: string) => v !== value) : [...current, value];
        updateFilters({ [group]: newValues });
    };

    const handleResetFilters = () => updateFilters(defaultFilters);
    
    const filteredContent = useMemo(() => {
        setIsLoading(true);
        let result = displayFilters ? [...allContent] : allContent.filter(item => item.featured).slice(0, 6);

        if (displayFilters) {
            if (filters.types.length > 0) {
                result = result.filter(c => filters.types.includes(c.type));
            }
            if (filters.languages.length > 0) {
                result = result.filter(c => filters.languages.includes(c.language));
            }
            if (filters.tags.length > 0) {
                result = result.filter(c => filters.tags.some(t => c.tags.includes(t)));
            }

            switch(filters.sort) {
                case 'newest':
                    result.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
                    break;
                case 'most_read': // Faked
                    result.sort((a, b) => (b.id.charCodeAt(0) % 5) - (a.id.charCodeAt(0) % 5));
                    break;
                case 'editors_picks': // Faked with featured flag
                    result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
                    break;
            }
        }
        
        setTimeout(() => setIsLoading(false), 300);
        return result;

    }, [allContent, filters, displayFilters]);

    const FilterControls = () => (
         <div className="space-y-4">
            <div className="flex flex-col lg:flex-row items-center gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">Type:</span>
                    {contentTypes.map(({name, icon: Icon}) => (
                        <Button key={name} variant={filters.types.includes(name) ? "secondary" : "outline"} size="sm" onClick={() => handleChipToggle('types', name)} className="rounded-full gap-2">
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
            <div className="flex flex-col lg:flex-row items-center gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">Tags:</span>
                    {tags.map((tag) => (
                        <Button key={tag} variant={filters.tags.includes(tag) ? "secondary" : "outline"} size="sm" onClick={() => handleChipToggle('tags', tag)} className="rounded-full">
                            {tag}
                        </Button>
                    ))}
                </div>
                <Button variant="link" onClick={handleResetFilters} className="p-0 h-auto lg:ml-4">Reset all</Button>
            </div>
        </div>
    );

    const mobileSheet = (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
                 <Button variant="outline" className="lg:hidden gap-2 w-full">
                    <Filter className="h-4 w-4" />
                    Filters ({filteredContent.length} results)
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

    if (isLoading) {
        return (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                     <div key={i} className="space-y-3">
                        <Skeleton className="h-[180px] w-full rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    
    if (!filteredContent.length && !displayFilters) return null;

    return (
       <>
           {displayFilters && (
               <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60 py-4 mb-6">
                   {isDesktop ? <FilterControls /> : mobileSheet}
               </div>
           )}
           
           <div role="status" aria-live="polite">
                {filteredContent.length > 0 ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredContent.map((item) => (
                            <ContentCard key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg">
                        <h3 className="font-headline text-2xl font-bold">No matching content.</h3>
                        <p className="text-muted-foreground mt-2 mb-4">Try widening your filters.</p>
                        <Button onClick={handleResetFilters}>Clear filters</Button>
                    </div>
                )}
           </div>
       </>
    );
}
