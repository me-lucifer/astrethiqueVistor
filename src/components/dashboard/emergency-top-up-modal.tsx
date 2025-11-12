
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getWallet, setLocal, addSpendLogEntry, EMERGENCY_TOPUP_LIMIT_EUR, Wallet, incrementMetric, WALLET_KEY } from "@/lib/local";
import { Label } from "../ui/label";
import { Zap } from "lucide-react";

interface EmergencyTopUpModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function EmergencyTopUpModal({ isOpen, onOpenChange }: EmergencyTopUpModalProps) {
    const { toast } = useToast();
    const [amount, setAmount] = useState(EMERGENCY_TOPUP_LIMIT_EUR);
    const [error, setError] = useState("");

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        if (isNaN(value)) {
            setAmount(0);
            setError("");
        } else if (value > EMERGENCY_TOPUP_LIMIT_EUR) {
            setError(`Amount cannot exceed €${EMERGENCY_TOPUP_LIMIT_EUR}.`);
            setAmount(EMERGENCY_TOPUP_LIMIT_EUR);
        } else {
            setError("");
            setAmount(value);
        }
    };

    const handleConfirm = () => {
        if (amount <= 0 || amount > EMERGENCY_TOPUP_LIMIT_EUR) {
            setError("Please enter a valid amount.");
            return;
        }

        const wallet = getWallet();
        if (wallet.budget_lock.emergency_used) {
            toast({
                variant: "destructive",
                title: "Emergency Top-up Already Used",
                description: "You can only use the emergency top-up once per locked budget period.",
            });
            onOpenChange(false);
            return;
        }

        const updatedWallet: Wallet = {
            ...wallet,
            balance_cents: wallet.balance_cents + amount * 100,
            budget_lock: {
                ...wallet.budget_lock,
                emergency_used: true,
            }
        };
        setLocal(WALLET_KEY, updatedWallet, true);
        addSpendLogEntry({
            ts: new Date().toISOString(),
            type: "emergency",
            amount_cents: amount * 100,
            note: "Emergency top-up"
        });
        incrementMetric('emergencies');

        toast({
            title: "Emergency top-up used",
            description: `€${amount.toFixed(2)} added. Your new balance is €${(updatedWallet.balance_cents / 100).toFixed(2)}.`,
        });

        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 mb-4">
                        <Zap className="h-6 w-6 text-amber-500" />
                    </div>
                    <DialogTitle className="text-center">Emergency Top-Up</DialogTitle>
                    <DialogDescription className="text-center">
                        Add up to €{EMERGENCY_TOPUP_LIMIT_EUR} once per locked budget period. This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <Label htmlFor="emergency-amount">Amount</Label>
                    <Input
                        id="emergency-amount"
                        type="number"
                        value={amount}
                        onChange={handleAmountChange}
                        max={EMERGENCY_TOPUP_LIMIT_EUR}
                        min="1"
                        step="1"
                        placeholder={`e.g., ${EMERGENCY_TOPUP_LIMIT_EUR}`}
                    />
                    {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
                <DialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2">
                    <Button onClick={handleConfirm} disabled={amount <= 0 || !!error}>
                        Confirm and Add €{amount.toFixed(2)}
                    </Button>
                    <DialogClose asChild>
                        <Button type="button" variant="ghost">Cancel</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
