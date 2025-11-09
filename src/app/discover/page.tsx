
"use client";

import { FeaturedConsultants } from "@/components/featured-consultants";
import { FeaturedContent } from "@/components/featured-content";
import { FeaturedConferences } from "@/components/featured-conferences";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDiscoverTabs } from "@/hooks/use-discover-tabs";
import { User, Video, BookOpen } from "lucide-react";

export default function DiscoverPage() {
    const { activeTab, setActiveTab } = useDiscoverTabs();

    return (
        <div className="container py-8">
            <div className="flex items-center gap-2 mb-2">
                <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Discover
                </h1>
            </div>
            <p className="text-lg text-foreground/80 max-w-2xl mb-8">
                Find consultants, explore content, and join live conferences.
            </p>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-1 sm:w-auto sm:grid-cols-3">
                    <TabsTrigger value="consultants"><User className="mr-2 h-4 w-4" />Consultants</TabsTrigger>
                    <TabsTrigger value="conferences"><Video className="mr-2 h-4 w-4" />Conferences</TabsTrigger>
                    <TabsTrigger value="content"><BookOpen className="mr-2 h-4 w-4" />Content</TabsTrigger>
                </TabsList>
                <TabsContent value="consultants" className="py-6">
                   <FeaturedConsultants />
                </TabsContent>
                <TabsContent value="conferences" className="py-6">
                    <FeaturedConferences />
                </TabsContent>
                <TabsContent value="content" className="py-6">
                    <FeaturedContent displayFilters={true} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
