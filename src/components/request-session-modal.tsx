
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Consultant } from '@/lib/consultants';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { XCircle, Clock } from 'lucide-react';
import { getInitials } from '@/lib/utils';

interface RequestSessionModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    consultant: Consultant;
    onSchedule: () => void;
}

type RequestStatus = 'requesting' | 'unavailable';

const CountdownCircle = ({ onComplete }: { onComplete: () => void }) => {
    const [countdown, setCountdown] = useState(60);
    const [ariaMessage, setAriaMessage] = useState("60 seconds remaining");

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            onComplete();
        }
    }, [countdown, onComplete]);

    useEffect(() => {
        if (countdown % 10 === 0 && countdown > 0) {
            setAriaMessage(`${countdown} seconds remaining`);
        }
        if (countdown === 0) {
            setAriaMessage("Time has expired.");
        }
    }, [countdown]);

    return (
        <div className="relative w-40 h-40">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                <circle
                    className="text-muted/30"
                    strokeWidth="5"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                />
                <motion.circle
                    className="text-primary"
                    strokeWidth="5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                    initial={{ pathLength: 1 }}
                    animate={{ pathLength: 0 }}
                    transition={{ duration: 60, ease: "linear" }}
                    style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold">{countdown}</span>
            </div>
            <div role="status" aria-live="polite" className="sr-only">
                {ariaMessage}
            </div>
        </div>
    );
}


export function RequestSessionModal({ isOpen, onOpenChange, consultant, onSchedule }: RequestSessionModalProps) {
    const [status, setStatus] = useState<RequestStatus>('requesting');
    
    // Simulate a decline after some seconds for demonstration
    useEffect(() => {
        if (status === 'requesting' && isOpen) {
            const randomTimeout = Math.random() * 8000 + 4000; // 4-12 seconds
            const declineTimer = setTimeout(() => {
                setStatus('unavailable');
            }, randomTimeout);
            return () => clearTimeout(declineTimer);
        }
    }, [status, isOpen]);
    
     useEffect(() => {
        if (!isOpen) {
            // Reset status when modal is closed
            const timer = setTimeout(() => setStatus('requesting'), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleTimeout = () => {
        setStatus('unavailable');
    };
    
    const handleScheduleAndClose = () => {
        onSchedule();
        onOpenChange(false);
    }
    
    const renderContent = () => {
        switch (status) {
            case 'requesting':
                return (
                    <div className="flex flex-col items-center gap-6 py-6">
                        <div className="relative">
                            <CountdownCircle onComplete={handleTimeout} />
                             <Avatar className="absolute inset-0 m-auto w-24 h-24 border-4 border-background">
                                <AvatarImage src={consultant.cover} alt={consultant.name} />
                                <AvatarFallback>{getInitials(consultant.name)}</AvatarFallback>
                            </Avatar>
                        </div>
                        <DialogHeader>
                            <DialogTitle className="text-center">Requesting Session…</DialogTitle>
                            <DialogDescription className="text-center">Waiting for {consultant.name} to accept.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Cancel Request</Button>
                            </DialogClose>
                        </DialogFooter>
                    </div>
                );
            case 'unavailable':
                return (
                     <div className="flex flex-col items-center gap-4 py-6 text-center">
                        <XCircle className="w-12 h-12 text-destructive" />
                        <DialogHeader>
                            <DialogTitle>Consultant Unavailable</DialogTitle>
                            <DialogDescription>{consultant.name} is currently unavailable. Would you like to schedule a time instead?</DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="w-full sm:justify-center flex-col sm:flex-row gap-2">
                           <DialogClose asChild><Button variant="outline" className="w-full">Close</Button></DialogClose>
                           <Button onClick={handleScheduleAndClose} className="w-full">Schedule</Button>
                        </DialogFooter>
                    </div>
                );
        }
    };


    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xs p-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={status}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
