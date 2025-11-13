
"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials } from "@/lib/utils";
import { Consultant } from "@/lib/consultants";
import { SessionTimer } from "./session-timer";
import { WalletDisplay } from "./wallet-display";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { PanelRightOpen, PanelRightClose, WifiOff, Loader2, MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface TopBarProps {
    consultant: Consultant;
    sessionTime: number;
    isSidePanelOpen: boolean;
    toggleSidePanel: () => void;
    onDemoAction?: (action: string) => void;
}

export function TopBar({ consultant, sessionTime, isSidePanelOpen, toggleSidePanel, onDemoAction }: TopBarProps) {
    const { toast, dismiss } = useToast();

    const handleSimulateNetworkDrop = () => {
        const toastId = toast({
            title: "Reconnecting...",
            description: <div className="flex items-center gap-2"><Loader2 className="animate-spin h-4 w-4" /><span>Please wait.</span></div>,
            duration: Infinity,
        }).id;
        
        setTimeout(() => {
            dismiss(toastId);
            toast({
                title: "Connection Unstable",
                description: "You can switch to audio-only or retry video.",
                duration: Infinity,
                action: (
                    <div className="flex flex-col gap-2 w-full">
                        <Button size="sm" onClick={() => dismiss()}>Switch to Audio</Button>
                        <Button size="sm" variant="outline" onClick={() => dismiss()}>Retry Video</Button>
                    </div>
                )
            })
        }, 3000);
    };

    return (
        <header className="h-16 bg-background/30 border-b border-border/50 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                    <AvatarImage src={consultant.cover} alt={consultant.name} />
                    <AvatarFallback>{getInitials(consultant.name)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{consultant.name}</p>
                    <p className="text-xs text-muted-foreground">Live Consultation</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <WalletDisplay sessionTime={sessionTime} ratePerMin={consultant.pricePerMin} />
                <SessionTimer time={sessionTime} />
                <Badge variant="secondary">€{consultant.pricePerMin.toFixed(2)}/min</Badge>
                 {onDemoAction && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-muted-foreground"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Demo Controls</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={handleSimulateNetworkDrop}>Simulate Network Drop</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => onDemoAction('low-balance')}>Emulate Low Balance</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => onDemoAction('zero-balance')}>Emulate Zero Balance</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => onDemoAction('end-summary')}>Open End Summary</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                 )}
                <Button variant="ghost" size="icon" onClick={toggleSidePanel}>
                    {isSidePanelOpen ? <PanelRightClose /> : <PanelRightOpen />}
                </Button>
            </div>
        </header>
    );
}
