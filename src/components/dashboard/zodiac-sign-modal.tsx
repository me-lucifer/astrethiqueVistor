
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import type { User } from "@/lib/authLocal";
import { cn } from "@/lib/utils";

type ZodiacSign = User['zodiacSign'];

const signs: ZodiacSign[] = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

const zodiacDates: { sign: ZodiacSign, start: string, end: string }[] = [
    { sign: 'Aries', start: '03-21', end: '04-19' },
    { sign: 'Taurus', start: '04-20', end: '05-20' },
    { sign: 'Gemini', start: '05-21', end: '06-20' },
    { sign: 'Cancer', start: '06-21', end: '07-22' },
    { sign: 'Leo', start: '07-23', end: '08-22' },
    { sign: 'Virgo', start: '08-23', end: '09-22' },
    { sign: 'Libra', start: '09-23', end: '10-22' },
    { sign: 'Scorpio', start: '10-23', end: '11-21' },
    { sign: 'Sagittarius', start: '11-22', end: '12-21' },
    { sign: 'Capricorn', start: '12-22', end: '01-19' },
    { sign: 'Aquarius', start: '01-20', end: '02-18' },
    { sign: 'Pisces', start: '02-19', end: '03-20' }
];

function getZodiacSign(date: Date): ZodiacSign {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dateStr = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    for (const { sign, start, end } of zodiacDates) {
        if (start > end) { // Capricorn case
            if (dateStr >= start || dateStr <= end) return sign;
        } else {
            if (dateStr >= start && dateStr <= end) return sign;
        }
    }
    return 'Aries'; // Fallback
}


interface ZodiacSignModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (sign: ZodiacSign) => void;
    currentSign?: ZodiacSign;
}

export function ZodiacSignModal({ isOpen, onOpenChange, onSave, currentSign }: ZodiacSignModalProps) {
    const [date, setDate] = useState<Date | undefined>(new Date());
    
    const handleDateSelect = (selectedDate?: Date) => {
        if (selectedDate) {
            setDate(selectedDate);
            const sign = getZodiacSign(selectedDate);
            onSave(sign);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Select Your Zodiac Sign</DialogTitle>
                    <DialogDescription>
                        This helps us provide a more personalized experience.
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="quickPick">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="quickPick">Quick Pick</TabsTrigger>
                        <TabsTrigger value="useBirthday">Use Birthday</TabsTrigger>
                    </TabsList>
                    <TabsContent value="quickPick" className="pt-4">
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {signs.map(sign => (
                                <Button 
                                    key={sign} 
                                    variant={currentSign === sign ? 'secondary' : 'outline'}
                                    onClick={() => onSave(sign)}
                                >
                                    {sign}
                                </Button>
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="useBirthday" className="pt-4">
                        <p className="text-center text-sm text-muted-foreground mb-4">Select your date of birth to determine your sign.</p>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                mode="single"
                                selected={date}
                                onSelect={handleDateSelect}
                                initialFocus
                                captionLayout="dropdown-buttons"
                                fromYear={1920}
                                toYear={new Date().getFullYear()}
                                />
                            </PopoverContent>
                        </Popover>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
