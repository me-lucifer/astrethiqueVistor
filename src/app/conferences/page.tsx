
"use client";
import { FeaturedConferences } from "@/components/featured-conferences";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getSession, setSession } from "@/lib/session";

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

export default function ConferencesPage() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('query') || getSession<string>('conferences.search.v1') || "";
    const [query, setQuery] = useState(initialQuery);
    
    const debouncedQuery = useDebounce(query, 300);

    useEffect(() => {
        setSession('conferences.search.v1', debouncedQuery);
    }, [debouncedQuery]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSession('conferences.search.v1', query);
    }


  return (
    <div className="container py-12">
        <div className="flex flex-col items-start gap-4 mb-8">
            <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Learn live with our experts.
            </h1>
            <p className="text-lg text-foreground/80 max-w-2xl">
                Join live workshops, group readings, and Q&A sessions—shown in your timezone.
            </p>
            <form onSubmit={handleSearchSubmit} className="w-full">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search conferences, hosts, or topics..."
                        className="pl-10 h-12 text-base sm:text-sm w-full"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            </form>
        </div>
        <FeaturedConferences initialQuery={debouncedQuery} />
    </div>
  );
}
