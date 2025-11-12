
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { getSession, setSession } from "@/lib/session";
import { ConsultantProfile } from "@/lib/consultant-profile";


const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "18:00", "18:30"
];

const durations = ["15", "30", "45", "60"];

export default function SchedulePage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { toast } = useToast();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timeZone, setTimeZone] = useState<string>("");
  const [duration, setDuration] = useState<string>("30");
  const [consultant, setConsultant] = useState<ConsultantProfile | null>(null);

  useEffect(() => {
    // Auto-detect user's timezone
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);

    // Fetch consultant name for the toast message
    const profile = getSession<ConsultantProfile>("consultantProfile");
    if(profile && (profile.id === id || profile.name.toLowerCase().replace(/\s/g, '-') === id)) {
        setConsultant(profile);
    }
  }, [id]);

  const handleRequestBooking = () => {
    // Save to session storage for appointments page
    const holds = getSession<any[]>('schedule.holds.v1') || [];
    const newHold = {
        id: `hold_${Date.now()}`,
        consultantId: consultant?.id,
        consultantName: consultant?.name,
        slug: id,
        mode: 'video', // Defaulting for now
        startIso: new Date(`${format(date || new Date(), 'yyyy-MM-dd')}T${selectedTime}:00`).toISOString(),
        durationMin: parseInt(duration),
        pricePerMin: consultant?.pricePerMin,
        type: 'session'
    }
    setSession('schedule.holds.v1', [...holds, newHold]);


    toast({
      title: "Request sent!",
      description: `Your request has been sent to ${consultant?.name || 'the consultant'}. You'll receive confirmation shortly.`,
    });
    router.push(`/discover/consultant/${id}`);
  };

  return (
    <div className="container py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Request a Booking with {consultant?.name}</CardTitle>
          <CardDescription>Select your preferred time and details for the session. Times are shown in your local timezone.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 1. Select a Date */}
          <div className="space-y-2">
            <Label className="font-semibold">1. Select a Date</Label>
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
                  onSelect={setDate}
                  initialFocus
                  disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* 2. Select a Time Slot */}
          <div className="space-y-2">
            <Label className="font-semibold">2. Select a Time Slot</Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "secondary" : "outline"}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </Button>
              ))}
              <Button variant="outline" className="text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" />
                More
              </Button>
            </div>
          </div>

          {/* 3. Timezone */}
          <div className="space-y-2">
            <Label className="font-semibold" htmlFor="timezone-select">3. Timezone</Label>
            <Select value={timeZone} onValueChange={setTimeZone}>
              <SelectTrigger id="timezone-select">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={timeZone}>{timeZone.replace(/_/g, " ")} (Auto-detected)</SelectItem>
                 <SelectItem value="Europe/London">Europe/London (GMT+1)</SelectItem>
                <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
                All appointment times automatically convert to your selected timezone.
            </p>
          </div>

          {/* 4. Select Duration */}
          <div className="space-y-2">
            <Label className="font-semibold">4. Select Duration</Label>
            <RadioGroup
              value={duration}
              onValueChange={setDuration}
              className="flex flex-wrap gap-4"
            >
              {durations.map((d) => (
                <div key={d} className="flex items-center space-x-2">
                  <RadioGroupItem value={d} id={`duration-${d}`} />
                  <Label htmlFor={`duration-${d}`} className="font-normal">{d} min</Label>
                </div>
              ))}
            </RadioGroup>
            <p className="text-sm text-muted-foreground pt-2">
                A minimum hold of €{(parseInt(duration) * (consultant?.pricePerMin || 0)).toFixed(2)} will be placed on your wallet. You can reuse or release it if the booking is cancelled.
            </p>
          </div>

          {/* 5. Add a Note */}
          <div className="space-y-2">
            <Label className="font-semibold" htmlFor="booking-note">5. Add a Note (optional)</Label>
            <Textarea
              id="booking-note"
              placeholder="What would you like to focus on?"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-4 border-t pt-6">
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2">
                <Button variant="ghost" asChild>
                    <Link href={`/discover/consultant/${id}`}>Cancel</Link>
                </Button>
                <Button onClick={handleRequestBooking} disabled={!date || !selectedTime}>
                    Request Booking
                </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center pt-4">
            Readings are for guidance only and not a substitute for professional advice (medical, legal, financial, or emergency).
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
