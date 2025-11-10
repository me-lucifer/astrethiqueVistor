
"use client";

import { useEffect, Suspense } from "react";
import { FeaturedConsultants } from "@/components/featured-consultants";
import { seedConsultants } from "@/lib/consultants-seeder";
import { useSearchParams } from "next/navigation";
import { useDiscoverTabs } from "@/hooks/use-discover-tabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlaceholderPage } from "@/components/placeholder-page";
import { FeaturedConferences } from "@/components/featured-conferences";
import { FeaturedContent } from "@/components/featured-content";


function DiscoverContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('query') || "";
    const { activeTab, setActiveTab } = useDiscoverTabs();

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
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList>
                    <TabsTrigger value="consultants">Consultants</TabsTrigger>
                </TabsList>
                <TabsContent value="consultants" className="py-6">
                    <div className="lg:grid lg:grid-cols-[320px_1fr] lg:gap-8">
                        <Suspense fallback={<div>Loading filters...</div>}>
                            <FeaturedConsultants initialQuery={query} />
                        </Suspense>
                    </div>
                </TabsContent>
            </Tabs>

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
