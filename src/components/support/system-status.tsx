
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const StatusItem = ({ service, status }: { service: string, status: 'Operational' | 'Issues' }) => (
    <div className="flex items-center justify-between py-2">
      <p className="text-foreground/90">{service}</p>
      <div className="flex items-center gap-2">
        <div className={cn("h-2.5 w-2.5 rounded-full", status === 'Operational' ? 'bg-success' : 'bg-destructive')} />
        <span className={cn(status === 'Operational' ? 'text-success' : 'text-destructive')}>{status}</span>
      </div>
    </div>
);

export function SystemStatus() {
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    return (
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
    );
}
