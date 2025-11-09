
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, User, Calendar, FileText, ArrowRight } from "lucide-react";
import { getLocal, seedOnce } from "@/lib/local";
import type { Consultant } from "@/lib/consultants-seeder";
import { seedConsultants } from "@/lib/consultants-seeder";
import type { Conference } from "@/lib/conferences-seeder";
import { seedConferences } from "@/lib/conferences-seeder";
import type { ContentItem } from "@/lib/content-seeder";
import { seedContentItems } from "@/lib/content-seeder";
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";

type SearchResult = {
    id: string;
    title: string;
    description: string;
    type: 'consultant' | 'conference' | 'content';
    url: string;
};

const useDebounce = <T>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

export function GlobalSearch() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<{ consultants: SearchResult[]; conferences: SearchResult[]; content: SearchResult[] }>({ consultants: [], conferences: [], content: [] });
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const [allConsultants, setAllConsultants] = useState<Consultant[]>([]);
    const [allConferences, setAllConferences] = useState<Conference[]>([]);
    const [allContent, setAllContent] = useState<ContentItem[]>([]);

    const debouncedQuery = useDebounce(query, 300);

    useEffect(() => {
        seedOnce("consultants_seeded", seedConsultants);
        setAllConsultants(getLocal<Consultant[]>("consultants") || []);
        seedOnce("conferences_seeded", seedConferences);
        setAllConferences(getLocal<Conference[]>("conferences") || []);
        seedOnce("content_seeded", seedContentItems);
        setAllContent(getLocal<ContentItem[]>("contentItems") || []);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (debouncedQuery.length < 2) {
            setResults({ consultants: [], conferences: [], content: [] });
            setIsOpen(false);
            return;
        }

        setIsLoading(true);

        const lowercasedQuery = debouncedQuery.toLowerCase();

        const filteredConsultants = allConsultants
            .filter(c => c.nameAlias.toLowerCase().includes(lowercasedQuery) || c.shortBlurb.toLowerCase().includes(lowercasedQuery))
            .map(c => ({ id: c.id, title: c.nameAlias, description: c.shortBlurb, type: 'consultant', url: `/discover?tab=consultants&query=${encodeURIComponent(debouncedQuery)}` } as SearchResult))
            .slice(0, 3);

        const filteredConferences = allConferences
            .filter(c => c.title.toLowerCase().includes(lowercasedQuery) || c.excerpt.toLowerCase().includes(lowercasedQuery))
            .map(c => ({ id: c.id, title: c.title, description: c.excerpt, type: 'conference', url: `/discover?tab=conferences&query=${encodeURIComponent(debouncedQuery)}` } as SearchResult))
            .slice(0, 3);

        const filteredContent = allContent
            .filter(c => c.title.toLowerCase().includes(lowercasedQuery))
            .map(c => ({ id: c.id, title: c.title, description: c.author, type: 'content', url: `/discover?tab=content&query=${encodeURIComponent(debouncedQuery)}` } as SearchResult))
            .slice(0, 3);

        setResults({ consultants: filteredConsultants, conferences: filteredConferences, content: filteredContent });
        setIsLoading(false);
        setIsOpen(true);

    }, [debouncedQuery, allConsultants, allConferences, allContent]);

    const handleSeeAll = (tab: string) => {
        router.push(`/discover?tab=${tab}&query=${encodeURIComponent(query)}`);
        setIsOpen(false);
    }
    
    const handleResultClick = () => {
        setIsOpen(false);
        setQuery("");
    }

    const ResultItem = ({ item }: { item: SearchResult }) => {
        const iconMap = {
            consultant: <User className="w-4 h-4 text-muted-foreground" />,
            conference: <Calendar className="w-4 h-4 text-muted-foreground" />,
            content: <FileText className="w-4 h-4 text-muted-foreground" />,
        };
        return (
            <Link href={item.url} onClick={handleResultClick} className="block group">
                <div className="px-3 py-2 rounded-md hover:bg-muted flex items-start gap-3">
                    {iconMap[item.type]}
                    <div className="flex-1">
                        <p className="font-semibold text-sm group-hover:text-primary">{item.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                    </div>
                </div>
            </Link>
        )
    };

    return (
        <div className="relative w-full max-w-xl mx-auto" ref={searchRef}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search consultants, conferences, or content…"
                    className="pl-10 h-12 text-base"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length > 1 && setIsOpen(true)}
                />
            </div>
            {isOpen && (
                <div className="absolute top-full mt-2 w-full bg-background border rounded-lg shadow-lg z-50 p-2">
                    {isLoading ? (
                        <div className="p-2 space-y-3">
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                    ) : (
                        (results.consultants.length > 0 || results.conferences.length > 0 || results.content.length > 0) ? (
                            <>
                                {results.consultants.length > 0 && (
                                    <div className="space-y-1">
                                        <h4 className="px-3 py-1 font-semibold text-sm text-muted-foreground">Consultants</h4>
                                        {results.consultants.map(item => <ResultItem key={item.id} item={item} />)}
                                        <Button variant="link" size="sm" className="w-full" onClick={() => handleSeeAll('consultants')}>See all consultant results <ArrowRight className="ml-2 h-4 w-4" /></Button>
                                    </div>
                                )}
                                {results.conferences.length > 0 && (
                                    <div className="space-y-1 pt-2">
                                        <h4 className="px-3 py-1 font-semibold text-sm text-muted-foreground">Conferences</h4>
                                        {results.conferences.map(item => <ResultItem key={item.id} item={item} />)}
                                        <Button variant="link" size="sm" className="w-full" onClick={() => handleSeeAll('conferences')}>See all conference results <ArrowRight className="ml-2 h-4 w-4" /></Button>
                                    </div>
                                )}
                                {results.content.length > 0 && (
                                    <div className="space-y-1 pt-2">
                                        <h4 className="px-3 py-1 font-semibold text-sm text-muted-foreground">Content</h4>
                                        {results.content.map(item => <ResultItem key={item.id} item={item} />)}
                                        <Button variant="link" size="sm" className="w-full" onClick={() => handleSeeAll('content')}>See all content results <ArrowRight className="ml-2 h-4 w-4" /></Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="text-center text-muted-foreground p-4 text-sm">No results for "{query}"</p>
                        )
                    )}
                </div>
            )}
        </div>
    );
}
