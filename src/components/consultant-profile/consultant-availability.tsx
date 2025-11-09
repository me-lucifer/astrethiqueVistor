
"use client";

import { useState } from 'react';
import { add, format, set } from 'date-fns';
import { Consultant } from '@/lib/consultants-seeder';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { ChatBubbleIcon, VideoIcon, SpeakerLoudIcon, ClockIcon } from '@radix-ui/react-icons';
import { StartNowModal } from '../start-now-modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';

const communicationModes = [
  { id: 'chat', label: 'Chat', icon: ChatBubbleIcon },
  { id: 'audio', label: 'Audio', icon: SpeakerLoudIcon },
  { id: 'video', label: 'Video', icon: VideoIcon },
];

const durations = [15, 30, 45, 60];

export function ConsultantAvailability({ consultant }: { consultant: Consultant }) {
  const [selectedMode, setSelectedMode] = useState('chat');
  const [selectedDuration, setSelectedDuration] = useState('30');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isStartNowModalOpen, setIsStartNowModalOpen] = useState(false);
  const { toast } = useToast();

  const handleScheduleClick = () => {
    // For demo, we check if user is logged in via a simple session flag.
    // In a real app, this would be a proper auth check.
    const isLoggedIn = sessionStorage.getItem('userRegistered') === 'true';
    if (!isLoggedIn) {
        setIsStartNowModalOpen(true);
        return;
    }
    setIsDrawerOpen(true);
  };

  const handleSlotSelect = (slot: Date) => {
    const appointments = JSON.parse(sessionStorage.getItem('appointments') || '[]');
    
    const newAppointment = {
      id: `${consultant.id}-${slot.getTime()}`,
      consultantId: consultant.id,
      consultantName: consultant.nameAlias,
      slug: consultant.id, // Assuming slug is the id
      mode: selectedMode,
      startIso: slot.toISOString(),
      durationMin: parseInt(selectedDuration),
      pricePerMin: consultant.ratePerMin,
      language: consultant.languages.join(', '),
      specialties: consultant.specialties.join(', '),
    };
    
    sessionStorage.setItem('appointments', JSON.stringify([...appointments, newAppointment]));
    
    setIsDrawerOpen(false);
    toast({
      title: 'Session scheduled.',
      description: `We'll remind you. Your ${selectedMode} session with ${consultant.nameAlias} is set for ${format(slot, 'PPP p')}.`,
    });
  };

  // Generate some fake availability for the demo
  const tomorrow = add(new Date(), { days: 1 });
  const baseTime = set(tomorrow, { hours: 9, minutes: 0, seconds: 0, milliseconds: 0 });
  const availableSlots = Array.from({ length: 4 }, (_, i) => add(baseTime, { minutes: i * 30 }));
  const drawerSlots = Array.from({ length: 12 }, (_, i) => add(baseTime, { minutes: i * 15 }));

  return (
    <div id="availability-section" className="scroll-mt-24">
      <Card className="p-6 bg-card/50">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row gap-6 justify-between">
            <div className="space-y-4">
              <h2 className="font-headline text-xl font-bold">Select a mode</h2>
              <div className="flex gap-2 flex-wrap">
                {communicationModes.map((mode) => (
                  <Button
                    key={mode.id}
                    variant={selectedMode === mode.id ? 'secondary' : 'outline'}
                    onClick={() => setSelectedMode(mode.id)}
                    className="gap-2"
                  >
                    <mode.icon className="h-5 w-5" />
                    {mode.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="sm:text-right space-y-4">
              <h2 className="font-headline text-xl font-bold">Choose an availability</h2>
              <div className="flex gap-2 flex-wrap sm:justify-end">
                  {availableSlots.map((slot, i) => (
                      <Button key={i} variant="outline" onClick={handleScheduleClick}>
                          {format(slot, 'p')}
                      </Button>
                  ))}
                  <Button onClick={handleScheduleClick}>
                      <ClockIcon className="mr-2 h-4 w-4" />
                      More times
                  </Button>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-right">Per-minute billing during live sessions.</p>
        </CardContent>
      </Card>
      
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Schedule with {consultant.nameAlias}</SheetTitle>
            <SheetDescription>Select a time for your {selectedMode} session.</SheetDescription>
          </SheetHeader>
          <div className="py-4 grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="duration-select">Duration</Label>
              <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                <SelectTrigger id="duration-select">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {durations.map(d => (
                    <SelectItem key={d} value={String(d)}>{d} minutes</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-2">
              {drawerSlots.map((slot, i) => (
                <Button key={i} variant="outline" onClick={() => handleSlotSelect(slot)}>
                  {format(slot, 'p')}
                </Button>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <StartNowModal isOpen={isStartNowModalOpen} onOpenChange={setIsStartNowModalOpen} />
    </div>
  );
}
