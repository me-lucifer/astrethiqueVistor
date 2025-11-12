
"use client";

import { useState, useEffect } from 'react';
import { Wallet } from "lucide-react";
import { Progress } from "../ui/progress";
import { getWallet } from "@/lib/local";
import { cn } from '@/lib/utils';

interface WalletDisplayProps {
    sessionTime: number;
    ratePerMin: number;
}

export function WalletDisplay({ sessionTime, ratePerMin }: WalletDisplayProps) {
    const [initialBalance, setInitialBalance] = useState(0);
    const [currentBalance, setCurrentBalance] = useState(0);

    useEffect(() => {
        const wallet = getWallet();
        setInitialBalance(wallet.balance_cents);
        setCurrentBalance(wallet.balance_cents);
    }, []);

    useEffect(() => {
        const costPerSecond = (ratePerMin * 100) / 60;
        const totalCost = costPerSecond * sessionTime;
        const newBalance = initialBalance - totalCost;
        setCurrentBalance(Math.max(0, newBalance));
    }, [sessionTime, ratePerMin, initialBalance]);
    
    const balancePercentage = initialBalance > 0 ? (currentBalance / initialBalance) * 100 : 0;
    
    const progressColor = balancePercentage > 50 
        ? "bg-success" 
        : balancePercentage > 20
        ? "bg-yellow-500"
        : "bg-destructive";

    return (
        <div className="flex items-center gap-3">
            <Wallet className="w-5 h-5 text-primary" />
            <div className="w-32">
                <p className="text-sm font-semibold">€{(currentBalance / 100).toFixed(2)}</p>
                <Progress value={balancePercentage} className="h-1 mt-1" indicatorClassName={cn("transition-all duration-1000 ease-linear", progressColor)} />
            </div>
        </div>
    );
}
