
"use client";

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

export default function DiscoverPage() {
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

            <Tabs defaultValue="consultants" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
                    <TabsTrigger value="consultants">Consultants</TabsTrigger>
                    <TabsTrigger value="conferences">Conferences</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                </TabsList>
                <TabsContent value="consultants" className="mt-6">
                    <FeaturedConsultants />
                </TabsContent>
                <TabsContent value="conferences" className="mt-6">
                     <FeaturedConferences />
                </TabsContent>
                <TabsContent value="content" className="mt-6">
                     <FeaturedContent />
                </TabsContent>
            </Tabs>
        </div>
    </TooltipProvider>
  );
}
