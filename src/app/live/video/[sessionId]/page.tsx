
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

export default function VideoRoomPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [consultant, setConsultant] = useState<Consultant | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [isEndConfirmOpen, setIsEndConfirmOpen] = useState(false);
  
  const { time, isRunning, startTimer, stopTimer } = useSessionTimer();

  useEffect(() => {
    // In a real app, you'd fetch session data. For this demo, we'll use stored consultant data.
    const allConsultants = getSession<Consultant[]>("discover.seed.v1");
    if (allConsultants) {
      // Find consultant based on session ID for demo purposes
      const foundConsultant = allConsultants.find(c => sessionId.includes(c.slug));
      if (foundConsultant) {
        setConsultant(foundConsultant);
        startTimer();
      } else {
        router.push("/discover");
      }
    } else {
        router.push("/discover");
    }

    return () => {
        stopTimer();
    }
  }, [sessionId, router, startTimer, stopTimer]);
  
  const handleEndCall = () => {
    stopTimer();
    router.push('/discover');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsEndConfirmOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);


  if (!consultant) {
    return <PlaceholderPage title="Loading Session..." />;
  }

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col overflow-hidden">
      <TopBar
        consultant={consultant}
        sessionTime={time}
        isSidePanelOpen={isSidePanelOpen}
        toggleSidePanel={() => setIsSidePanelOpen(!isSidePanelOpen)}
      />
      <main className="flex-1 flex overflow-hidden">
        <VideoArea isSidePanelOpen={isSidePanelOpen} />
        <SidePanel isOpen={isSidePanelOpen} />
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
    </div>
  );
}
