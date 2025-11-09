
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, User, ArrowRight } from "lucide-react";
import type { Consultant } from "@/lib/consultants";
import consultantsData from "@/lib/consultants.json";
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";

type SearchResult = {
    id: string;
    title: string;
    description: string;
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
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const allConsultants: Consultant[] = consultantsData;

    const debouncedQuery = useDebounce(query, 250);

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
            setResults([]);
            setIsOpen(false);
            return;
        }

        setIsLoading(true);

        const lowercasedQuery = debouncedQuery.toLowerCase();

        const filteredConsultants = allConsultants
            .filter(c => 
                c.nameAlias.toLowerCase().includes(lowercasedQuery) || 
                c.specialties.some(s => s.toLowerCase().includes(lowercasedQuery))
            )
            .map(c => ({ 
                id: c.id, 
                title: c.nameAlias, 
                description: c.specialties.join(", "), 
                url: `/discover?query=${encodeURIComponent(debouncedQuery)}` 
            } as SearchResult))
            .slice(0, 5);

        setResults(filteredConsultants);
        setIsLoading(false);
        setIsOpen(true);

    }, [debouncedQuery, allConsultants]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`/discover?query=${encodeURIComponent(query)}`);
        setIsOpen(false);
    }
    
    const handleResultClick = () => {
        setIsOpen(false);
        setQuery("");
    }

    const ResultItem = ({ item }: { item: SearchResult }) => {
        return (
            <Link href={item.url} onClick={handleResultClick} className="block group">
                <div className="px-3 py-2 rounded-md hover:bg-muted flex items-start gap-3">
                    <User className="w-4 h-4 text-muted-foreground mt-1" />
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
            <form onSubmit={handleFormSubmit}>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search consultants..."
                        className="pl-10 h-12 text-base"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => query.length > 1 && setIsOpen(true)}
                    />
                </div>
            </form>
            {isOpen && (
                <div className="absolute top-full mt-2 w-full bg-background border rounded-lg shadow-lg z-50 p-2">
                    {isLoading ? (
                        <div className="p-2 space-y-3">
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                    ) : (
                        results.length > 0 ? (
                            <>
                                <div className="space-y-1">
                                    <h4 className="px-3 py-1 font-semibold text-sm text-muted-foreground">Consultants</h4>
                                    {results.map(item => <ResultItem key={item.id} item={item} />)}
                                </div>
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
