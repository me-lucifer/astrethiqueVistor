
"use client";

import { useEffect, Suspense } from "react";
import { FeaturedConsultants } from "@/components/featured-consultants";
import { seedConsultants } from "@/lib/consultants-seeder";
import { useSearchParams } from "next/navigation";

function DiscoverContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('query') || "";

    useEffect(() => {
        seedConsultants();
    }, []);

    return (
        <div className="container py-8">
            <div className="flex items-center gap-2 mb-2">
                <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Discover
                </h1>
            </div>
            <p className="text-lg text-foreground/80 max-w-2xl mb-8">
                Find the right consultant to guide you.
            </p>
            
            <div className="lg:grid lg:grid-cols-[320px_1fr] lg:gap-8">
                <FeaturedConsultants initialQuery={query} />
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

    