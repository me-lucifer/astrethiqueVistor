
"use client";

import { useState, useEffect } from 'react';
import { add, format, set } from 'date-fns';
import { Consultant } from '@/lib/consultants';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Video, Phone, Clock } from 'lucide-react';
import { StartNowModal } from '../start-now-modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { getSession, setSession } from '@/lib/session';

const communicationModes = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'audio', label: 'Audio', icon: Phone },
  { id: 'video', label: 'Video', icon: Video },
];

const durations = [15, 30, 45, 60];

export function ConsultantAvailability({ consultant }: { consultant: Consultant }) {
  const [selectedMode, setSelectedMode] = useState('chat');
  const [selectedDuration, setSelectedDuration] = useState('30');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isStartNowModalOpen, setIsStartNowModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const lastMode = getSession<string>('schedule.last-mode.v1');
    if (lastMode) {
      setSelectedMode(lastMode);
    }
  }, []);

  const handleModeChange = (mode: string) => {
    setSelectedMode(mode);
    setSession('schedule.last-mode.v1', mode);
  };

  const handleScheduleClick = () => {
    const isLoggedIn = getSession('userRegistered') === 'true';
    if (!isLoggedIn) {
        setIsStartNowModalOpen(true);
        return;
    }
    setIsDrawerOpen(true);
  };

  const handleSlotSelect = (slot: Date) => {
    const appointments = getSession<any[]>('schedule.holds.v1') || [];
    
    const newAppointment = {
      id: `${consultant.id}-${slot.getTime()}`,
      consultantId: consultant.id,
      consultantName: consultant.name,
      slug: consultant.slug,
      mode: selectedMode,
      startIso: slot.toISOString(),
      durationMin: parseInt(selectedDuration),
      pricePerMin: consultant.pricePerMin,
    };
    
    setSession('schedule.holds.v1', [...appointments, newAppointment]);

    const notifyList = getSession<string[]>("notify.me.v1") || [];
    if (notifyList.includes(consultant.id)) {
        const newNotifyList = notifyList.filter(id => id !== consultant.id);
        setSession("notify.me.v1", newNotifyList);
    }
    
    setIsDrawerOpen(false);
    toast({
      title: 'Session Scheduled!',
      description: `Your ${selectedMode} session with ${consultant.name} for ${format(slot, 'PPP p')} is confirmed.`,
    });
  };

  const availableSlots = consultant.availability.slots.slice(0, 4).map(s => new Date(s));
  const drawerSlots = consultant.availability.slots.map(s => new Date(s));

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
                    onClick={() => handleModeChange(mode.id)}
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
              <div className="flex gap-2 flex-wrap sm:justify-end overflow-x-auto sm:overflow-visible pb-2 sm:pb-0">
                  {availableSlots.map((slot, i) => (
                      <Button key={i} variant="outline" onClick={handleScheduleClick}>
                          {format(slot, 'p')}
                      </Button>
                  ))}
                  <Button onClick={handleScheduleClick}>
                      <Clock className="mr-2 h-4 w-4" />
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
            <SheetTitle>Schedule with {consultant.name}</SheetTitle>
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
