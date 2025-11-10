
"use client";

import { useEffect, Suspense, useState, useCallback } from "react";
import { FeaturedConsultants } from "@/components/featured-consultants";
import { seedConsultants } from "@/lib/consultants-seeder";
import { useSearchParams } from "next/navigation";
import { getSession, setSession } from "@/lib/session";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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


function DiscoverContent() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('query') || getSession<string>('discover.search.v1') || "";
    const [query, setQuery] = useState(initialQuery);
    
    const debouncedQuery = useDebounce(query, 200);

    useEffect(() => {
        seedConsultants();
    }, []);

    useEffect(() => {
        setSession('discover.search.v1', debouncedQuery);
        // This is a bit of a hack to trigger the shared component to update
        window.dispatchEvent(new Event('storage'));
    }, [debouncedQuery]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSession('discover.search.v1', query);
        window.dispatchEvent(new Event('storage'));
    }

    return (
        <div className="container py-8">
            <div className="flex flex-col items-start gap-4 mb-8">
                <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Discover
                </h1>
                 <form onSubmit={handleSearchSubmit} className="w-full">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search consultants by name, specialty, or keyword..."
                            className="pl-10 h-12 text-base sm:text-sm w-full"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                </form>
            </div>
            
            <div className="lg:grid lg:grid-cols-[320px_1fr] lg:gap-8">
                <Suspense fallback={<div>Loading filters...</div>}>
                    <FeaturedConsultants initialQuery={debouncedQuery} showFilters={true} />
                </Suspense>
            </div>

        </div>
    );
}


export default function DiscoverPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DiscoverContent />
        </Suspense>
    );
}

    