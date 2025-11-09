
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
import Link from "next/link";
import { Info, LogIn, UserPlus } from "lucide-react";

export function StartNowModal({
  isOpen,
  onOpenChange
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) {

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mx-auto mb-4">
            <Info className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Per-Minute Billing</DialogTitle>
          <DialogDescription className="text-center">
             Sessions (chat/audio/video) are billed per minute. Please log in or register to start a session.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center flex-col sm:flex-col sm:space-x-0 gap-2">
            <div className="grid grid-cols-2 gap-2">
                 <Button asChild>
                    <Link href="/login">
                        <LogIn className="mr-2 h-4 w-4"/>
                        Login
                    </Link>
                </Button>
                <Button asChild>
                    <Link href="/register">
                        <UserPlus className="mr-2 h-4 w-4"/>
                        Register
                    </Link>
                </Button>
            </div>
            <DialogClose asChild>
                <Button type="button" variant="outline">
                    Continue browsing
                </Button>
            </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
