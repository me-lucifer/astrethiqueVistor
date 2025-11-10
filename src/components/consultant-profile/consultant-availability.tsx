
"use client";

import { useState, useEffect } from 'react';
import { add, format, set } from 'date-fns';
import { Consultant } from '@/lib/consultants';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Video, Phone, Clock, Bell, CheckCircle } from 'lucide-react';
import { StartNowModal } from '../start-now-modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { getSession, setSession } from '@/lib/session';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const communicationModes = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'audio', label: 'Audio', icon: Phone },
  { id: 'video', label: 'Video', icon: Video },
];

const durations = [15, 30, 45, 60];

export function ConsultantAvailability({ consultant }: { consultant: Consultant }) {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState('chat');
  const [selectedDuration, setSelectedDuration] = useState('30');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isStartNowModalOpen, setIsStartNowModalOpen] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const lastMode = getSession<string>('schedule.last-mode.v1');
    if (lastMode) {
      setSelectedMode(lastMode);
    }
    const notifyList = getSession<string[]>("notify.me.v1") || [];
    setIsNotifying(notifyList.includes(consultant.id));
  }, [consultant.id]);

  const handleModeChange = (mode: string) => {
    setSelectedMode(mode);
    setSession('schedule.last-mode.v1', mode);
  };

  const handleScheduleClick = () => {
    router.push(`/discover/consultant/${consultant.slug}/schedule`);
  };
  
  const handleStartNowClick = () => {
      const isLoggedIn = getSession('userRegistered') === 'true';
      if (!isLoggedIn) {
          setIsStartNowModalOpen(true);
          return;
      }
      toast({
        title: 'Starting Session...',
        description: `Connecting you for a ${selectedMode} session with ${consultant.name}.`,
      });
  }
  
  const handleNotifyClick = () => {
    const notifyList = getSession<string[]>("notify.me.v1") || [];
    const newNotifyList = isNotifying
        ? notifyList.filter(id => id !== consultant.id)
        : [...notifyList, consultant.id];
    
    setIsNotifying(!isNotifying);
    setSession("notify.me.v1", newNotifyList);

    if (!isNotifying) {
        setIsNotifyModalOpen(true);
    } else {
         toast({
            title: "Notification removed",
            description: `You will no longer be notified when ${consultant.name} is online.`,
        });
    }
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

  const isOnline = consultant.availability.online;

  return (
    <div id="availability-section" className="scroll-mt-24">
      <Card className="p-6 bg-card/50">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row gap-6 justify-between">
            {/* Left side */}
            <div className="space-y-4 flex-1">
              <h2 className="font-headline text-xl font-bold">1. Select a mode</h2>
              <div className="flex gap-2 flex-wrap">
                {communicationModes.map((mode) => (
                  <Button
                    key={mode.id}
                    variant={selectedMode === mode.id ? 'secondary' : 'outline'}
                    onClick={() => handleModeChange(mode.id)}
                    aria-pressed={selectedMode === mode.id}
                    className="gap-2"
                  >
                    <mode.icon className="h-5 w-5" />
                    {mode.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Right side */}
            <div className="space-y-4 flex-1 md:text-right">
              <h2 className="font-headline text-xl font-bold">2. Choose an availability</h2>
              <div className="flex flex-col sm:flex-row gap-2 md:justify-end items-stretch">
                {isOnline ? (
                    <>
                        <Button onClick={handleStartNowClick} size="lg">Start Now</Button>
                        <Button onClick={handleScheduleClick} variant="outline" size="lg">
                            <Clock className="mr-2 h-4 w-4" />
                            Schedule
                        </Button>
                    </>
                ) : (
                    <>
                         <Button 
                            variant="outline" 
                            size="lg" 
                            onClick={handleNotifyClick}
                        >
                            {isNotifying ? <CheckCircle className="mr-2 h-4 w-4" /> : <Bell className="mr-2 h-4 w-4" />}
                            {isNotifying ? "I'll be notified" : "Notify me"}
                        </Button>
                        <Button onClick={handleScheduleClick} size="lg">
                            <Clock className="mr-2 h-4 w-4" />
                            Schedule
                        </Button>
                    </>
                )}
              </div>
            </div>
          </div>
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
              {consultant.availability.slots.map((slot, i) => (
                <Button key={i} variant="outline" onClick={() => handleSlotSelect(new Date(slot))}>
                  {format(new Date(slot), 'p')}
                </Button>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <StartNowModal isOpen={isStartNowModalOpen} onOpenChange={setIsStartNowModalOpen} />
      
      <AlertDialog open={isNotifyModalOpen} onOpenChange={setIsNotifyModalOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Notification set!</AlertDialogTitle>
            <AlertDialogDescription>
                We'll let you know when {consultant.name} is back online.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </div>
  );
}
