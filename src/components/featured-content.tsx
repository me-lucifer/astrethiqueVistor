
"use client";

import { useState, useEffect, useMemo } from "react";
import { getLocal } from "@/lib/local";
import { ContentHubItem, seedContentHub } from "@/lib/content-hub-seeder";
import { ContentHubCard } from "@/components/content-hub/card";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import Link from "next/link";

export function FeaturedContent() {
    const [allContent, setAllContent] = useState<ContentHubItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        seedContentHub();
        const storedContent = getLocal<ContentHubItem[]>("ch_items");
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
    
    if (!featuredContent.length) return (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No featured content available right now.</p>
        </div>
    );

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
           <div className="mt-12 text-center">
               <Button asChild>
                   <Link href="/content-hub">View All Content</Link>
               </Button>
           </div>
       </>
    );
}
