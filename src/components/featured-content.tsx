
"use client";

import { useState, useEffect } from "react";
import { getLocal, seedOnce } from "@/lib/local";
import { ContentItem, seedContentItems } from "@/lib/content-seeder";
import { ContentCard } from "./content-card";

export function FeaturedContent() {
    const [content, setContent] = useState<ContentItem[]>([]);

    useEffect(() => {
        seedOnce("content_seeded", seedContentItems);
        const storedContent = getLocal<ContentItem[]>("contentItems");
        if (storedContent) {
            setContent(storedContent.filter(item => item.featured).slice(0, 6));
        }
    }, []);

    if (!content.length) {
        return null; // Or a loading skeleton
    }

    return (
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.map((item) => (
                <ContentCard key={item.id} item={item} />
            ))}
        </div>
    );
}
