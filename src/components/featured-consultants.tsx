
"use client";

import { useState, useEffect } from "react";
import { getSession, seedOnce } from "@/lib/session";
import { Consultant, seedConsultants } from "@/lib/consultants-seeder";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ConsultantCard } from "./consultant-card";

export function FeaturedConsultants() {
    const [consultants, setConsultants] = useState<Consultant[]>([]);

    useEffect(() => {
        seedOnce("consultants_seeded", seedConsultants);
        const storedConsultants = getSession<Consultant[]>("consultants");
        if (storedConsultants) {
            setConsultants(storedConsultants);
        }
    }, []);

    if (!consultants.length) {
        return null; // Or a loading skeleton
    }

    return (
        <Carousel
            opts={{
                align: "start",
                loop: true,
            }}
            className="w-full"
        >
            <CarouselContent>
                {consultants.map((consultant) => (
                    <CarouselItem key={consultant.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                        <div className="p-1">
                           <ConsultantCard consultant={consultant} />
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
        </Carousel>
    );
}
