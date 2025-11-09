
"use client";

import { useEffect } from "react";
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
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getSession, setSession } from "@/lib/session";
import { Button } from "@/components/ui/button";

export default function DiscoverPage() {
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const tab = searchParams.get('tab') || 'consultants';
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

                <Tabs value={tab} className="w-full" onValueChange={(value) => {
                    const params = new URLSearchParams(window.location.search);
                    params.set('tab', value);
                    window.history.pushState(null, '', `?${params.toString()}`);
                }}>
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
