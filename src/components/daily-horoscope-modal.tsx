"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PlaceholderPage } from "./placeholder-page";

export function DailyHoroscopeModal({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <PlaceholderPage title="Daily Horoscope" description="Today's outlook, just for you."/>
      </DialogContent>
    </Dialog>
  );
}
