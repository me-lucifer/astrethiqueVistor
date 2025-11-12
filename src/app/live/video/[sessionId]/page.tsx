
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { TopBar } from "@/components/video-room/top-bar";
import { VideoArea } from "@/components/video-room/video-area";
import { Controls } from "@/components/video-room/controls";
import { SidePanel } from "@/components/video-room/side-panel";
import { getSession } from "@/lib/session";
import { Consultant } from "@/lib/consultants";
import { PlaceholderPage } from "@/components/placeholder-page";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useSessionTimer } from "@/hooks/use-session-timer";
import { PermissionsOverlay } from "@/components/video-room/permissions-overlay";
import { SessionSummaryModal } from "@/components/video-room/session-summary-modal";
import { getWallet, setWallet } from "@/lib/local";
import { useToast } from "@/hooks/use-toast";

export default function VideoRoomPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;
  const { toast } = useToast();

  const [consultant, setConsultant] = useState<Consultant | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [isEndConfirmOpen, setIsEndConfirmOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  
  const { time, isRunning, startTimer, stopTimer } = useSessionTimer();

  useEffect(() => {
    // In a real app, you'd fetch session data. For this demo, we'll use stored consultant data.
    const allConsultants = getSession<Consultant[]>("discover.seed.v1");
    if (allConsultants) {
      // Find consultant based on session ID for demo purposes
      const foundConsultant = allConsultants.find(c => sessionId.includes(c.slug));
      if (foundConsultant) {
        setConsultant(foundConsultant);
      } else {
        router.push("/discover");
      }
    } else {
        router.push("/discover");
    }

    return () => {
        stopTimer();
    }
  }, [sessionId, router, stopTimer]);
  
  const handleJoinCall = () => {
    setHasPermissions(true);
    startTimer();
  }

  const handleEndCall = () => {
    stopTimer();
    setIsEndConfirmOpen(false);
    setIsSummaryModalOpen(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && hasPermissions && !isEndConfirmOpen && !isSummaryModalOpen) {
        e.preventDefault();
        setIsEndConfirmOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasPermissions, isEndConfirmOpen, isSummaryModalOpen]);
  
  const handleDemoAction = (action: string) => {
      const wallet = getWallet();
      switch (action) {
          case 'low-balance':
              if (consultant) {
                  const oneMinCost = consultant.pricePerMin * 100;
                  setWallet({...wallet, balance_cents: oneMinCost - 1});
                   toast({
                      title: "Low Balance Emulated",
                      description: "Wallet balance is now less than 1 minute of call time.",
                    });
              }
              break;
          case 'zero-balance':
              setWallet({...wallet, balance_cents: 0});
              toast({ title: "Zero Balance Emulated", description: "Session will end automatically." });
              setTimeout(handleEndCall, 1000);
              break;
          case 'end-summary':
              handleEndCall();
              break;
      }
  }


  if (!consultant) {
    return <PlaceholderPage title="Loading Session..." />;
  }
  
  if (!hasPermissions) {
      return <PermissionsOverlay onJoin={handleJoinCall} />;
  }

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col overflow-hidden">
      <TopBar
        consultant={consultant}
        sessionTime={time}
        isSidePanelOpen={isSidePanelOpen}
        toggleSidePanel={() => setIsSidePanelOpen(!isSidePanelOpen)}
        onDemoAction={handleDemoAction}
      />
      <main className="flex-1 flex overflow-hidden">
        <VideoArea isSidePanelOpen={isSidePanelOpen} />
        <SidePanel isOpen={isSidePanelOpen} onEndCall={() => setIsEndConfirmOpen(true)} />
      </main>
      <Controls 
        onEndCall={() => setIsEndConfirmOpen(true)}
        isSidePanelOpen={isSidePanelOpen}
        onToggleNotes={() => setIsSidePanelOpen(!isSidePanelOpen)}
      />

       <AlertDialog open={isEndConfirmOpen} onOpenChange={setIsEndConfirmOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>End the session?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to end this consultation? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Stay in call</AlertDialogCancel>
                    <AlertDialogAction onClick={handleEndCall} className="bg-destructive hover:bg-destructive/90">
                        End Session
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <SessionSummaryModal
            isOpen={isSummaryModalOpen}
            onOpenChange={setIsSummaryModalOpen}
            duration={time}
            rate={consultant.pricePerMin}
            consultantName={consultant.name}
            onClose={() => router.push('/discover')}
        />
    </div>
  );
}
