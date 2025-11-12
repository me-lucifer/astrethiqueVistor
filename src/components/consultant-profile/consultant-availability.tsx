
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Consultant } from '@/lib/consultants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Video, Phone, Clock, Bell, CheckCircle } from 'lucide-react';
import { StartNowModal } from '../start-now-modal';
import { getSession, setSession } from '@/lib/session';
import { AuthModal } from '../auth-modal';
import * as authLocal from '@/lib/authLocal';
import { getWallet, spendFromWallet } from '@/lib/local';
import { BudgetWizardModal } from '../budget/budget-wizard-modal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../ui/dialog';
import { TopUpModal } from '../dashboard/top-up-modal';
import { RequestSessionModal } from '../request-session-modal';
import { EmergencyTopUpModal } from '../dashboard/emergency-top-up-modal';
import { ConsultantProfile } from '@/lib/consultant-profile';

const communicationModes = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'audio', label: 'Audio', icon: Phone },
  { id: 'video', label: 'Video', icon: Video },
];

export function ConsultantAvailability({ consultant }: { consultant: Consultant }) {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState('video');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [isFundsModalOpen, setIsFundsModalOpen] = useState(false);
  const [isEmergencyTopUpOpen, setIsEmergencyTopUpOpen] = useState(false);
  const [isRequestingModalOpen, setIsRequestingModalOpen] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const { toast } = useToast();
  const [user, setUser] = useState<authLocal.User | null>(null);
  const [intendedAction, setIntendedAction] = useState<(() => void) | null>(null);

  const checkUser = useCallback(() => {
    setUser(authLocal.getCurrentUser());
  }, []);

  useEffect(() => {
    checkUser();
    window.addEventListener('storage_change', checkUser);
    return () => window.removeEventListener('storage_change', checkUser);
  }, [checkUser]);


  useEffect(() => {
    const lastMode = getSession<string>('consultant.selectedMode');
    if (lastMode) {
      setSelectedMode(lastMode);
    }
    const notifyList = getSession<boolean>(`notify:${consultant.id}`);
    setIsNotifying(!!notifyList);
  }, [consultant.id]);

  const onLoginSuccess = () => {
    checkUser();
    if(intendedAction) {
        intendedAction();
        setIntendedAction(null);
    }
  }

  const handleModeChange = (mode: string) => {
    setSelectedMode(mode);
    setSession('consultant.selectedMode', mode);
  };

  const handleScheduleClick = () => {
    if(!user) {
        setIntendedAction(() => () => router.push(`/discover/consultant/${consultant.slug}/schedule`));
        setIsAuthModalOpen(true);
        return;
    }
    const profileData: ConsultantProfile = {
        id: consultant.id,
        name: consultant.name,
        avatar: consultant.cover,
        isOnline: consultant.availability.online,
        badges: consultant.badges || [],
        rating: consultant.rating,
        reviewsCount: consultant.reviews.length,
        languages: consultant.languages,
        pricePerMin: consultant.pricePerMin,
        summary: consultant.bio.substring(0, 100),
        specialties: consultant.specialties,
        types: consultant.types,
        verifications: { adminApproved: consultant.adminApproved, kycVerified: consultant.kycVerified },
        nextSlots: consultant.availability.slots,
        content: consultant.content,
        reviews: [],
        favorite: false,
        yearsExperience: consultant.yearsExperience,
        country: consultant.country,
        aboutHtml: consultant.bio,
    };
    setSession('consultantProfile', profileData);
    router.push(`/discover/consultant/${consultant.slug}/schedule`);
  };
  
  const handleStartNowClick = () => {
      if (!user) {
          setIntendedAction(() => handleStartNowClick);
          setIsAuthModalOpen(true);
          return;
      }
      
      const wallet = getWallet();
      if (!wallet.budget_set) {
          setIsBudgetModalOpen(true);
          return;
      }

      // Pre-auth check for at least 1 minute of funds
      const minRequiredCents = consultant.pricePerMin * 100;
      const spendResult = spendFromWallet(minRequiredCents, "consultation", `Pre-auth for ${consultant.name}`, true);
      
      if (!spendResult.ok) {
        if (spendResult.message.includes("locked")) {
            const wallet = getWallet();
            if (wallet.budget_lock.enabled && !wallet.budget_lock.emergency_used) {
                setIsEmergencyTopUpOpen(true);
            } else {
                setIsLockModalOpen(true);
            }
        } else { // Insufficient funds or other issues
            setIsFundsModalOpen(true);
        }
        return;
      }
      setIsRequestingModalOpen(true);
  }
  
  const handleNotifyClick = () => {
    if (!user) {
        setIntendedAction(() => handleNotifyClick);
        setIsAuthModalOpen(true);
        return;
    }
    if (isNotifying) {
        toast({
            title: `You'll be notified when ${consultant.name} is online.`,
        });
        return;
    }
    setSession(`notify:${consultant.id}`, true);
    setIsNotifying(true);

    toast({
        title: `We'll notify you when ${consultant.name} is online.`,
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
                    aria-label={`Select ${mode.label} mode`}
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
                        <Button onClick={handleStartNowClick} size="lg" aria-label="Start a session now">Start Now</Button>
                        <Button onClick={handleScheduleClick} variant="outline" size="lg" id="schedule-button" aria-label="Schedule a future session">
                            <Clock className="mr-2 h-4 w-4" />
                            Schedule
                        </Button>
                    </>
                ) : (
                    <>
                         <Button 
                            variant='outline'
                            size="lg" 
                            onClick={handleNotifyClick}
                            disabled={isNotifying}
                            aria-label={isNotifying ? `You are set to be notified when ${consultant.name} is online` : `Notify me when ${consultant.name} is online`}
                        >
                            {isNotifying ? <CheckCircle className="mr-2 h-4 w-4" /> : <Bell className="mr-2 h-4 w-4" />}
                            {isNotifying ? "Notifying" : "Notify me"}
                        </Button>
                        <Button onClick={handleScheduleClick} size="lg" id="schedule-button" aria-label="Schedule a future session">
                            <Clock className="mr-2 h-4 w-4" />
                            Schedule
                        </Button>
                    </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-0 pt-4">
            <p className="text-xs text-muted-foreground">Readings are for guidance only and not a substitute for professional advice (medical, legal, financial, or emergency).</p>
        </CardFooter>
      </Card>
      
      <AuthModal isOpen={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} onLoginSuccess={onLoginSuccess} />
      <BudgetWizardModal isOpen={isBudgetModalOpen} onOpenChange={setIsBudgetModalOpen} />
      
      <Dialog open={isLockModalOpen} onOpenChange={setIsLockModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Budget Locked</DialogTitle>
            <DialogDescription>
              Your budget for this month is locked, and your emergency top-up has been used. You can schedule future sessions but cannot start a new one right now.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Got it</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
       <TopUpModal
            isOpen={isFundsModalOpen}
            onOpenChange={setIsFundsModalOpen}
        />

        <EmergencyTopUpModal
            isOpen={isEmergencyTopUpOpen}
            onOpenChange={setIsEmergencyTopUpOpen}
        />
        
       {isRequestingModalOpen && (
            <RequestSessionModal
                isOpen={isRequestingModalOpen}
                onOpenChange={setIsRequestingModalOpen}
                consultant={consultant}
                onSchedule={() => {
                    setIsRequestingModalOpen(false);
                    handleScheduleClick();
                }}
            />
       )}
    </div>
  );
}
