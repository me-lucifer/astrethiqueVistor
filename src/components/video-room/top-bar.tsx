
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials } from "@/lib/utils";
import { Consultant } from "@/lib/consultants";
import { SessionTimer } from "./session-timer";
import { WalletDisplay } from "./wallet-display";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { PanelRightOpen, PanelRightClose } from "lucide-react";

interface TopBarProps {
    consultant: Consultant;
    sessionTime: number;
    isSidePanelOpen: boolean;
    toggleSidePanel: () => void;
}

export function TopBar({ consultant, sessionTime, isSidePanelOpen, toggleSidePanel }: TopBarProps) {
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
                <Button variant="ghost" size="icon" onClick={toggleSidePanel}>
                    {isSidePanelOpen ? <PanelRightClose /> : <PanelRightOpen />}
                </Button>
            </div>
        </header>
    );
}
