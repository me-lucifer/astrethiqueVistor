
"use client";

import { useState, useEffect } from "react";
import { getLocal, seedOnce } from "@/lib/local";
import { Consultant, seedConsultants } from "@/lib/consultants-seeder";
import { ConsultantCard } from "./consultant-card";
import { StartNowModal } from "./start-now-modal";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

const specialties = ["Love", "Work", "Health", "Money"];
const languages = ["EN", "FR"];
const availabilities = ["Online", "Today", "This Week"];

export function FeaturedConsultants() {
    const [consultants, setConsultants] = useState<Consultant[]>([]);
    const [filteredConsultants, setFilteredConsultants] = useState<Consultant[]>([]);
    const [isStartNowModalOpen, setIsStartNowModalOpen] = useState(false);
    
    // Filters
    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
    const [promoOnly, setPromoOnly] = useState(false);
    const [rate, setRate] = useState([10]);
    const [highRatingOnly, setHighRatingOnly] = useState(false);

    useEffect(() => {
        seedOnce("consultants_seeded", seedConsultants);
        const storedConsultants = getLocal<Consultant[]>("consultants");
        if (storedConsultants) {
            setConsultants(storedConsultants);
        }
    }, []);

    useEffect(() => {
        let result = [...consultants];

        if (selectedSpecialties.length > 0) {
            result = result.filter(c => selectedSpecialties.some(s => c.specialties.includes(s as any)));
        }
        if (selectedLanguages.length > 0) {
            result = result.filter(c => selectedLanguages.some(s => c.languages.includes(s as any)));
        }
        if (selectedAvailability.includes("Online")) {
            result = result.filter(c => c.online);
        }
        // "Today" and "This Week" are not implemented in seed data
        if (promoOnly) {
            result = result.filter(c => c.promo);
        }
        if(highRatingOnly) {
            result = result.filter(c => c.rating >= 4.5);
        }
        result = result.filter(c => c.ratePerMin <= rate[0]);

        setFilteredConsultants(result);
    }, [consultants, selectedSpecialties, selectedLanguages, selectedAvailability, promoOnly, rate, highRatingOnly]);

    const handleChipToggle = (group: string, value: string) => {
        const setters: any = {
            specialties: setSelectedSpecialties,
            languages: setSelectedLanguages,
            availability: setSelectedAvailability,
        };
        const states: any = {
            specialties: selectedSpecialties,
            languages: selectedLanguages,
            availability: selectedAvailability,
        };

        const current = states[group];
        const setter = setters[group];
        
        if (setter) {
            if (current.includes(value)) {
                setter(current.filter((v: string) => v !== value));
            } else {
                setter([...current, value]);
            }
        }
    };

    if (!consultants.length) {
        return null; // Or a loading skeleton
    }
    
    const Chip = ({ group, value }: { group: string, value: string }) => {
        const states: any = {
            specialties: selectedSpecialties,
            languages: selectedLanguages,
            availability: selectedAvailability,
        };
        const isActive = states[group].includes(value);
        return (
            <Button
                variant={isActive ? "secondary" : "outline"}
                size="sm"
                onClick={() => handleChipToggle(group, value)}
                className="rounded-full"
            >
                {value}
            </Button>
        );
    };

    return (
        <>
        <div className="p-4 border rounded-lg space-y-4 mb-8">
            <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-sm mr-2">Specialties:</span>
                {specialties.map(s => <Chip key={s} group="specialties" value={s} />)}
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-sm mr-2">Languages:</span>
                {languages.map(l => <Chip key={l} group="languages" value={l} />)}
            </div>
            <div className="flex flex-wrap items-center gap-2">
                 <span className="font-semibold text-sm mr-2">Availability:</span>
                {availabilities.map(a => <Chip key={a} group="availability" value={a} />)}
            </div>
            <div className="grid sm:grid-cols-3 gap-4 pt-2">
                 <div className="space-y-2">
                    <Label htmlFor="price-range">Max Price: €{rate[0]}/min</Label>
                    <Slider id="price-range" min={1} max={10} step={0.5} value={rate} onValueChange={setRate} />
                </div>
                <div className="flex items-center space-x-2">
                    <Switch id="promo-only" checked={promoOnly} onCheckedChange={setPromoOnly} />
                    <Label htmlFor="promo-only">Promo only</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <Switch id="rating-only" checked={highRatingOnly} onCheckedChange={setHighRatingOnly} />
                    <Label htmlFor="rating-only">Rating ≥ 4.5</Label>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredConsultants.map((consultant) => (
                <ConsultantCard 
                    key={consultant.id}
                    consultant={consultant}
                    onStartNow={() => setIsStartNowModalOpen(true)}
                />
            ))}
        </div>
        <StartNowModal 
            isOpen={isStartNowModalOpen}
            onOpenChange={setIsStartNowModalOpen}
        />
        </>
    );
}
