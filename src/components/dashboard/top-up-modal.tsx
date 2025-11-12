
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getWallet, setWallet, addSpendLogEntry, Wallet, incrementMetric } from "@/lib/local";
import { Info, Wallet as WalletIcon } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { endOfMonth, format } from "date-fns";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "../ui/alert";

interface TopUpModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

const quickAmounts = [5, 10, 25];

export function TopUpModal({ isOpen, onOpenChange }: TopUpModalProps) {
    const { toast } = useToast();
    const [amount, setAmount] = useState(10);
    const [lockBudget, setLockBudget] = useState(false);
    const [isCustom, setIsCustom] = useState(false);
    const [wallet, setWalletState] = useState<Wallet | null>(null);

    useEffect(() => {
        if(isOpen) {
            setWalletState(getWallet());
            setAmount(10);
            setIsCustom(false);
            setLockBudget(false);
        }
    }, [isOpen]);

    const handleAddFunds = () => {
        if (amount <= 0) {
            toast({ variant: "destructive", title: "Please enter a valid amount." });
            return;
        }

        if (!wallet) return;

        let updatedWallet: Wallet = {
            ...wallet,
            balance_cents: wallet.balance_cents + amount * 100,
        };

        if (lockBudget) {
            updatedWallet.budget_lock = {
                enabled: true,
                until: format(endOfMonth(new Date()), "yyyy-MM-dd'T'HH:mm:ssXXX"),
                emergency_used: false
            };
        }
        
        setWallet(updatedWallet);
        addSpendLogEntry({
            ts: new Date().toISOString(),
            type: "topup",
            amount_cents: amount * 100,
            note: `Wallet top-up`,
        });
        incrementMetric('topups');

        toast({
            title: "Funds Added!",
            description: `Your new balance is €${(updatedWallet.balance_cents / 100).toFixed(2)}.`,
        });
        
        onOpenChange(false);
    };

    const handleQuickAmountClick = (value: number) => {
        setAmount(value);
        setIsCustom(false);
    }
    
    const handleCustomClick = () => {
        setIsCustom(true);
        setAmount(50); // Default custom
    }

    const budgetNotSet = wallet && !wallet.budget_set;
    const walletLocked = wallet && wallet.budget_lock.enabled;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                     <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                        <WalletIcon className="h-6 w-6 text-primary" />
                    </div>
                    <DialogTitle className="text-center">Top Up Your Wallet</DialogTitle>
                    <DialogDescription className="text-center">Select an amount or enter a custom one.</DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="grid grid-cols-4 gap-2">
                        {quickAmounts.map(val => (
                            <Button key={val} variant={!isCustom && amount === val ? "default" : "outline"} onClick={() => handleQuickAmountClick(val)}>
                                €{val}
                            </Button>
                        ))}
                        <Button variant={isCustom ? "default" : "outline"} onClick={handleCustomClick}>Custom</Button>
                    </div>

                    {isCustom && (
                        <div>
                            <Label htmlFor="custom-amount" className="sr-only">Custom Amount</Label>
                            <Input
                                id="custom-amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                                placeholder="Custom amount"
                                min="1"
                            />
                        </div>
                    )}
                    
                    {budgetNotSet && (
                        <Alert className="flex items-center justify-between">
                            <AlertDescription className="text-xs max-w-[80%]">
                                No monthly budget set. You can still lock wallet after this top-up.
                            </AlertDescription>
                             <div className="flex items-center gap-2">
                                <Label htmlFor="lock-budget-toggle" className="text-xs">Lock</Label>
                                <Switch
                                    id="lock-budget-toggle"
                                    checked={lockBudget}
                                    onCheckedChange={setLockBudget}
                                />
                            </div>
                        </Alert>
                    )}
                </div>

                <DialogFooter>
                     <DialogClose asChild>
                        <Button type="button" variant="ghost">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleAddFunds} disabled={amount <= 0}>Add €{amount.toFixed(2)} to Wallet</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
