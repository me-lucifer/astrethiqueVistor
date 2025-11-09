
"use client";

import { useState, useEffect } from "react";
import { FeaturedConsultants } from "@/components/featured-consultants";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GlobalSearch } from "@/components/global-search";
import { useSearchParams } from "next/navigation";


export default function DiscoverPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get('query') || '';

    return (
        <TooltipProvider>
            <div className="container py-8">
                <div className="flex items-center gap-2 mb-2">
                    <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Find guidance that fits you.
                    </h1>
                </div>
                <p className="text-lg text-foreground/80 max-w-2xl mb-8">
                    Filter by specialty, language, price, and availability.
                </p>

                <div className="mb-6">
                    <GlobalSearch />
                </div>

                <FeaturedConsultants initialQuery={query} />
            </div>
        </TooltipProvider>
    );
}
