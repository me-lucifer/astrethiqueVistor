
"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeaturedConsultants } from "@/components/featured-consultants";
import { FeaturedConferences } from "@/components/featured-conferences";
import { FeaturedContent } from "@/components/featured-content";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GlobalSearch } from "@/components/global-search";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getSession, setSession } from "@/lib/session";
import { Button } from "@/components/ui/button";

export default function DiscoverPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    
    // Default to 'consultants' if tab param is missing or invalid
    const validTabs = ['consultants', 'conferences', 'content'];
    const tabParam = searchParams.get('tab');
    const activeTab = validTabs.includes(tabParam as string) ? tabParam : 'consultants';
    
    const query = searchParams.get('query') || '';

    useEffect(() => {
        const coachmarkShown = getSession("discoverCoachmarkShown");
        if (!coachmarkShown) {
            const { dismiss } = toast({
                title: "Tip",
                description: "Use filters to quickly narrow results. You can save searches you reuse.",
                duration: Infinity,
                action: <Button variant="outline" size="sm" onClick={() => dismiss()}>Got it</Button>,
            });
            setSession("discoverCoachmarkShown", true);
        }
    }, [toast]);

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(window.location.search);
        params.set('tab', value);
        // Reset query when changing tabs to avoid confusion
        params.delete('query'); 
        router.push(`?${params.toString()}`, { scroll: false });
    };

    return (
        <TooltipProvider>
            <div className="container py-8">
                <div className="flex items-center gap-2 mb-2">
                    <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Find guidance that fits you.
                    </h1>
                    <Tooltip>
                    <TooltipTrigger asChild>
                        <Info className="h-5 w-5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Tips: Use filters to narrow results. You can start instantly if a consultant is online.</p>
                    </TooltipContent>
                    </Tooltip>
                </div>
                <p className="text-lg text-foreground/80 max-w-2xl mb-8">
                    Filter by specialty, language, price, and availability.
                </p>

                <div className="mb-6">
                    <GlobalSearch />
                </div>

                <Tabs value={activeTab} className="w-full" onValueChange={handleTabChange}>
                    <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
                        <TabsTrigger value="consultants">Consultants</TabsTrigger>
                        <TabsTrigger value="conferences">Conferences</TabsTrigger>
                        <TabsTrigger value="content">Content</TabsTrigger>
                    </TabsList>
                    <TabsContent value="consultants" className="mt-6">
                        <FeaturedConsultants initialQuery={query} />
                    </TabsContent>
                    <TabsContent value="conferences" className="mt-6">
                         <FeaturedConferences />
                    </TabsContent>
                    <TabsContent value="content" className="mt-6">
                         <FeaturedContent displayFilters={true} />
                    </TabsContent>
                </Tabs>
            </div>
        </TooltipProvider>
    );
}
