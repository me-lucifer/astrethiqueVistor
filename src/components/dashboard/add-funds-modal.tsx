
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getWallet, setWallet, Wallet } from "@/lib/local";

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
            setBalance(wallet?.balance_cents || 0);
        }
    }, [isOpen]);
    
    const handleTopUp = (amount: number) => {
        const currentWallet = getWallet();
        const newBalanceCents = currentWallet.balance_cents + (amount * 100);
        
        const newWalletState: Wallet = {
            ...currentWallet,
            balance_cents: newBalanceCents
        };

        setWallet(newWalletState);

        toast({
            title: "Funds Added",
            description: `€${amount.toFixed(2)} has been added. Your new balance is €${(newBalanceCents / 100).toFixed(2)}.`,
        });

        // Close modal if funds are now sufficient
        if ((newBalanceCents / 100) >= neededAmount) {
            onOpenChange(false);
        } else {
            // Update the balance displayed in the modal
            setBalance(newBalanceCents);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Insufficient Funds</DialogTitle>
                    <DialogDescription>
                        Your balance is €{(balance / 100).toFixed(2)}. You need at least €{neededAmount.toFixed(2)} to view your detailed horoscope.
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
