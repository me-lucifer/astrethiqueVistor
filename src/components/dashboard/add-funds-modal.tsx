
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getWallet, setWallet } from "@/lib/local";

interface AddFundsModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    neededAmount: number;
}

export function AddFundsModal({ isOpen, onOpenChange, neededAmount }: AddFundsModalProps) {
    const { toast } = useToast();
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        if (isOpen) {
            const wallet = getWallet();
            setBalance(wallet?.balanceEUR || 0);
        }
    }, [isOpen]);
    
    const handleTopUp = (amount: number) => {
        const newBalance = balance + amount;
        setBalance(newBalance);
        setWallet({ balanceEUR: newBalance });
        window.dispatchEvent(new Event('storage')); // Notify other components

        toast({
            title: "Funds Added",
            description: `€${amount.toFixed(2)} has been added. Your new balance is €${newBalance.toFixed(2)}.`,
        });

        // Close modal if funds are now sufficient
        if (newBalance >= neededAmount) {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Insufficient Funds</DialogTitle>
                    <DialogDescription>
                        Your current balance is €{balance.toFixed(2)}. You need at least €{neededAmount.toFixed(2)} to complete this purchase.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <p className="text-sm font-medium">Quick Top-up:</p>
                    <div className="grid grid-cols-3 gap-2">
                        <Button onClick={() => handleTopUp(5)}>€5</Button>
                        <Button onClick={() => handleTopUp(10)}>€10</Button>
                        <Button onClick={() => handleTopUp(25)}>€25</Button>
                    </div>
                </div>
                 <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
