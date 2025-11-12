
"use client";

import { useState, useEffect } from 'react';
import { Wallet } from "lucide-react";
import { Progress } from "../ui/progress";
import { getWallet } from "@/lib/local";
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';

interface WalletDisplayProps {
    sessionTime: number;
    ratePerMin: number;
}

export function WalletDisplay({ sessionTime, ratePerMin }: WalletDisplayProps) {
    const { toast } = useToast();
    const [initialBalance, setInitialBalance] = useState(0);
    const [currentBalance, setCurrentBalance] = useState(0);
    const [gracePeriodToastId, setGracePeriodToastId] = useState<string | null>(null);

    useEffect(() => {
        const wallet = getWallet();
        setInitialBalance(wallet.balance_cents);
        setCurrentBalance(wallet.balance_cents);
    }, []);

    useEffect(() => {
        const costPerSecond = (ratePerMin * 100) / 60;
        const totalCost = costPerSecond * sessionTime;
        const newBalance = initialBalance - totalCost;
        const newBalanceClamped = Math.max(0, newBalance);
        setCurrentBalance(newBalanceClamped);

        // Check for low balance (less than one minute of call time remaining)
        const minuteRateCents = ratePerMin * 100;
        if (newBalanceClamped > 0 && newBalanceClamped < minuteRateCents && !gracePeriodToastId) {
            console.log('low_balance');
            const toastId = toast({
                title: "Low Balance",
                description: "About 1 minute left. Top up to continue.",
                variant: 'destructive',
                duration: 10000, // 10 second grace period
            }).id;
            setGracePeriodToastId(toastId);
        }
        
        if (newBalanceClamped === 0 && sessionTime > 0) {
            // Logic to end call would be triggered here in a real app
            // For now, we'll just show a toast
            if (gracePeriodToastId) {
                toast.dismiss(gracePeriodToastId);
            }
             toast({
                title: "Session Ended",
                description: "Your wallet balance reached zero.",
                variant: 'destructive',
            });
        }
    }, [sessionTime, ratePerMin, initialBalance, toast, gracePeriodToastId]);
    
    const balancePercentage = initialBalance > 0 ? (currentBalance / initialBalance) * 100 : 0;
    
    const progressColor = balancePercentage > 50 
        ? "bg-success" 
        : balancePercentage > 20
        ? "bg-yellow-500"
        : "bg-destructive";

    return (
        <Badge variant="outline" className="flex items-center gap-3 p-0 h-9">
            <div className="pl-2.5">
                <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div className="w-28 pr-2.5">
                <p className="text-sm font-semibold">€{(currentBalance / 100).toFixed(2)}</p>
                <Progress value={balancePercentage} className="h-1 mt-1" indicatorClassName={cn("transition-all duration-1000 ease-linear", progressColor)} />
            </div>
        </Badge>
    );
}
