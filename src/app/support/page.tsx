
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, CircleDot } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState("visitor");
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const StatusItem = ({ service, status }: { service: string, status: 'Operational' | 'Issues' }) => (
    <div className="flex items-center justify-between py-2">
      <p className="text-foreground/90">{service}</p>
      <div className="flex items-center gap-2">
        <div className={cn("h-2.5 w-2.5 rounded-full", status === 'Operational' ? 'bg-success' : 'bg-destructive')} />
        <span className={cn(status === 'Operational' ? 'text-success' : 'text-destructive')}>{status}</span>
      </div>
    </div>
  );


  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
        <div className="flex-1 space-y-4">
          <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Support
          </h1>
          <p className="text-lg text-foreground/80 max-w-2xl">
            Get help with bookings, billing, content, or your account. Start with the FAQs or send us a request.
          </p>
        </div>
        <div className="shrink-0">
          <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
            <DialogTrigger asChild>
                <div className="flex items-center gap-4 cursor-pointer group">
                     <div className="flex items-center gap-2 text-sm text-success">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75 motion-reduce:animate-none"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
                        </span>
                        <span>All systems operational</span>
                    </div>
                     <Button variant="link" size="sm" className="p-0">View details</Button>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>System Status</DialogTitle>
                </DialogHeader>
                <div className="divide-y divide-border">
                    <StatusItem service="Chat" status="Operational" />
                    <StatusItem service="Audio/Video" status="Operational" />
                    <StatusItem service="Payments" status="Operational" />
                </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex justify-center mb-12">
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
      
      {/* Content sections will go here, dependent on activeTab */}
      <div className="p-8 border-2 border-dashed border-border rounded-lg w-full min-h-[40vh] flex items-center justify-center">
          <p className="text-foreground/60">{activeTab === 'visitor' ? 'Visitor content coming soon...' : 'Consultant content coming soon...'}</p>
        </div>

    </div>
  );
}
