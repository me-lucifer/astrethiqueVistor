
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlaceholderPage } from "@/components/placeholder-page";

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState("visitor");

  const VisitorContent = () => (
    <div className="mt-8 p-8 border-2 border-dashed border-border rounded-lg w-full min-h-[40vh] flex items-center justify-center">
        <p className="text-foreground/60">Visitor content to be added here...</p>
    </div>
  );

  const ConsultantContent = () => (
    <div className="mt-8 p-8 border-2 border-dashed border-border rounded-lg w-full min-h-[40vh] flex items-center justify-center">
        <p className="text-foreground/60">Consultant content to be added here...</p>
    </div>
  );

  return (
    <div className="container py-16 max-w-7xl">
      <div className="flex flex-col items-center text-center gap-4 mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          How it works
        </h1>
        <p className="text-lg text-foreground/80 max-w-3xl">
          Book vetted consultants in minutes. Transparent per-minute billing,
          optional budget lock, timezone-smart scheduling, and GDPR-respectful
          privacy.
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
          <Button
            onClick={() => setActiveTab("visitor")}
            variant={activeTab === "visitor" ? "background" : "ghost"}
            className={cn("px-6", activeTab === 'visitor' && 'shadow-sm')}
          >
            For Visitors
          </Button>
          <Button
            onClick={() => setActiveTab("consultant")}
            variant={activeTab === "consultant" ? "background" : "ghost"}
            className={cn("px-6", activeTab === 'consultant' && 'shadow-sm')}
          >
            For Consultants
          </Button>
        </div>
      </div>

      <div>
        {activeTab === "visitor" ? <VisitorContent /> : <ConsultantContent />}
      </div>
    </div>
  );
}
