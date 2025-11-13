
"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/video-room/top-bar";
import { VideoArea } from "@/components/video-room/video-area";
import { Controls } from "@/components/video-room/controls";
import { SidePanel } from "@/components/video-room/side-panel";
import { Consultant } from "@/lib/consultants";
import { useSessionTimer } from "@/hooks/use-session-timer";
import { getWallet, setWallet } from "@/lib/local";
import { useToast } from "@/hooks/use-toast";
import { SessionSummaryModal } from "@/components/video-room/session-summary-modal";
import { useRouter } from "next/navigation";

// Mock data for the demo page
const demoConsultant: Consultant = {
    id: "demo-consultant",
    slug: "demo-consultant",
    name: "Aeliana Rose",
    rating: 4.9,
    pricePerMin: 2.50,
    languages: ["EN", "FR"],
    availability: {
        online: true,
        slots: [],
    },
    specialties: ["Love", "Life Path"],
    types: ["Tarot Reading"],
    specializesInSigns: ["Aries"],
    cover: "https://picsum.photos/seed/aeliana-rose/400/300",
    kycVerified: true,
    adminApproved: true,
    lastReviewDate: new Date().toISOString(),
    bio: "A demo bio.",
    reviews: [],
    content: { articles: [], podcasts: [], conferences: [] },
    joinedAt: new Date().toISOString(),
    yearsExperience: 10,
    country: "USA",
    contentCounts: { articles: 0, podcasts: 0, conferences: 0 },
};

export default function VideoConsultDemoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const { time, startTimer, stopTimer } = useSessionTimer();

  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, [startTimer, stopTimer]);
  
  const handleEndCall = () => {
    stopTimer();
    setIsSummaryModalOpen(true);
  };

  const handleDemoAction = (action: string) => {
      const wallet = getWallet();
      switch (action) {
          case 'low-balance':
              const oneMinCost = demoConsultant.pricePerMin * 100;
              setWallet({...wallet, balance_cents: oneMinCost - 1});
              toast({
                  title: "Low Balance Emulated",
                  description: "Wallet balance is now less than 1 minute of call time.",
              });
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

  return (
    <>
      <div className="h-screen w-screen bg-black text-white flex flex-col overflow-hidden">
        <TopBar
          consultant={demoConsultant}
          sessionTime={time}
          isSidePanelOpen={isSidePanelOpen}
          toggleSidePanel={() => setIsSidePanelOpen(!isSidePanelOpen)}
          onDemoAction={handleDemoAction}
        />
        <main className="flex-1 flex overflow-hidden">
          <VideoArea isSidePanelOpen={isSidePanelOpen} />
          <SidePanel isOpen={isSidePanelOpen} onEndCall={handleEndCall} />
        </main>
        <Controls 
          onEndCall={handleEndCall}
          isSidePanelOpen={isSidePanelOpen}
          onToggleNotes={() => setIsSidePanelOpen(!isSidePanelOpen)}
        />
      </div>
       <SessionSummaryModal
            isOpen={isSummaryModalOpen}
            onOpenChange={setIsSummaryModalOpen}
            duration={time}
            rate={demoConsultant.pricePerMin}
            consultantName={demoConsultant.name}
            onClose={() => router.push('/discover')}
        />
    </>
  );
}
