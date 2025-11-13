"use client";

import { TopBar } from "@/components/video-room/top-bar";
import { VideoArea } from "@/components/video-room/video-area";
import { Controls } from "@/components/video-room/controls";
import { SidePanel } from "@/components/video-room/side-panel";
import { Consultant } from "@/lib/consultants";
import { useState } from "react";

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
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col overflow-hidden">
      <TopBar
        consultant={demoConsultant}
        sessionTime={125} // Static time for demo
        isSidePanelOpen={isSidePanelOpen}
        toggleSidePanel={() => setIsSidePanelOpen(!isSidePanelOpen)}
        onDemoAction={(action) => console.log("Demo action:", action)}
      />
      <main className="flex-1 flex overflow-hidden">
        <VideoArea isSidePanelOpen={isSidePanelOpen} />
        <SidePanel isOpen={isSidePanelOpen} onEndCall={() => alert("End call clicked")} />
      </main>
      <Controls 
        onEndCall={() => alert("End call clicked")}
        isSidePanelOpen={isSidePanelOpen}
        onToggleNotes={() => setIsSidePanelOpen(!isSidePanelOpen)}
      />
    </div>
  );
}
