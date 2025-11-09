
"use client";

import { useState } from 'react';
import { add, format, set } from 'date-fns';
import { Consultant } from '@/lib/consultants-seeder';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { setLocal, getLocal } from '@/lib/local';
import { ChatBubbleIcon, VideoIcon, SpeakerLoudIcon, ClockIcon } from '@radix-ui/react-icons';
import { StartNowModal } from '../start-now-modal';

const communicationModes = [
  { id: 'chat', label: 'Chat', icon: ChatBubbleIcon },
  { id: 'audio', label: 'Audio', icon: SpeakerLoudIcon },
  { id: 'video', label: 'Video', icon: VideoIcon },
];

export function ConsultantAvailability({ consultant }: { consultant: Consultant }) {
  const [selectedMode, setSelectedMode] = useState('chat');
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
    const appointments = getLocal<any[]>('appointments') || [];
    const newAppointment = {
      id: `${consultant.id}-${slot.getTime()}`,
      consultantId: consultant.id,
      consultantName: consultant.nameAlias,
      time: slot.toISOString(),
      mode: selectedMode,
    };
    setLocal('appointments', [...appointments, newAppointment]);
    setIsDrawerOpen(false);
    toast({
      title: 'Appointment Scheduled!',
      description: `Your ${selectedMode} session with ${consultant.nameAlias} is set for ${format(slot, 'PPP p')}.`,
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
      </Card>
      
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Schedule with {consultant.nameAlias}</SheetTitle>
            <SheetDescription>Select a time for your {selectedMode} session.</SheetDescription>
          </SheetHeader>
          <div className="py-4 grid grid-cols-2 gap-2">
            {drawerSlots.map((slot, i) => (
              <Button key={i} variant="outline" onClick={() => handleSlotSelect(slot)}>
                {format(slot, 'p')}
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <StartNowModal isOpen={isStartNowModalOpen} onOpenChange={setIsStartNowModalOpen} />
    </div>
  );
}
