
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getSession, setSession } from "@/lib/session";
import { ContentHubItem, seedContentHub } from "@/lib/content-hub-seeder";
import { ContentHubCard } from "@/components/content-hub/card";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Filter, BookOpen, Mic, Video } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMediaQuery } from "@/hooks/use-media-query";

const sortOptions = {
    newest: "Newest",
    most_read: "Most Read",
    editors_picks: "Editor's Picks",
};

type SortKey = keyof typeof sortOptions;

interface Filters {
    sort: SortKey;
}

const defaultFilters: Filters = {
    sort: "newest",
};

export function FeaturedContent({ displayFilters = false }: { displayFilters?: boolean }) {
    const [allContent, setAllContent] = useState<ContentHubItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        seedContentHub();
        const storedContent = getSession<ContentHubItem[]>("ch_items");
        if (storedContent) {
            setAllContent(storedContent);
        }
        setIsLoading(false);
    }, []);
    
    const featuredContent = useMemo(() => {
        return allContent.filter(item => item.featured && !item.deleted).slice(0, 3);
    }, [allContent]);


    if (isLoading) {
        return (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
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
    
    if (!featuredContent.length) return null;

    return (
       <>
           <div role="status" aria-live="polite">
                {featuredContent.length > 0 ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredContent.map((item) => (
                            <ContentHubCard key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg">
                        <h3 className="font-headline text-2xl font-bold">No matching content.</h3>
                    </div>
                )}
           </div>
       </>
    );
}
