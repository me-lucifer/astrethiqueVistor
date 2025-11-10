
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Ticket } from "lucide-react";
import { Conference } from "@/lib/conferences-seeder";
import { format } from "date-fns";

export function RsvpConfirmationModal({
  isOpen,
  onOpenChange,
  conference,
  onConfirm,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  conference: Conference;
  onConfirm: () => void;
}) {

  if (!conference) return null;

  const date = new Date(conference.dateISO);
  const endDate = new Date(date.getTime() + conference.durationMin * 60000);
  const timeString = `${new Intl.DateTimeFormat(undefined, { timeStyle: 'short' }).format(date)} - ${new Intl.DateTimeFormat(undefined, { timeStyle: 'short' }).format(endDate)} (${Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, ' ')})`;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mx-auto mb-4">
            <Ticket className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Confirm your RSVP</DialogTitle>
          <DialogDescription className="text-center">
             You are about to register for the following conference.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-2 text-sm text-center">
            <p className="font-bold text-base">{conference.title}</p>
            <p className="text-muted-foreground">{new Intl.DateTimeFormat(undefined, { dateStyle: 'full' }).format(date)}</p>
            <p className="text-muted-foreground">{timeString}</p>
            <p className="font-semibold pt-2">Price: {conference.price === 0 ? 'Free' : `€${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(conference.price).replace('€','')}`}</p>
        </div>

        <p className="text-xs text-muted-foreground text-center">
            We’ll remind you 24h, 1h, and 10m before the start.
        </p>

        <DialogFooter className="sm:justify-center flex-col sm:flex-col sm:space-x-0 gap-2 pt-4">
            <Button onClick={onConfirm}>Confirm RSVP</Button>
            <DialogClose asChild>
                <Button type="button" variant="outline">
                    Cancel
                </Button>
            </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
