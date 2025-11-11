
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import * as authLocal from "@/lib/authLocal";
import { getWallet, setWallet, Wallet } from "@/lib/local";
import { BudgetWizardModal } from "@/components/budget/budget-wizard-modal";

export default function WalletPage() {
    const { toast } = useToast();
    const [user, setUser] = useState<authLocal.User | null>(null);
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

    useEffect(() => {
        const currentUser = authLocal.getCurrentUser();
        setUser(currentUser);
        
        const currentWallet = getWallet();
        setWallet(currentWallet);
    }, []);

    const handleAddCredit = () => {
        if (!wallet) return;

        if (!wallet.budget_set) {
            setIsBudgetModalOpen(true);
            return;
        }

        const newWalletState: Wallet = {
          ...wallet,
          balance_cents: wallet.balance_cents + 1000,
        };
        setWallet(newWalletState); // optimistic update
        setWallet(newWalletState); // persist
        window.dispatchEvent(new Event('storage'));

        toast({
            title: "Funds Added",
            description: `€10.00 has been added to your wallet.`,
        });
    };

    if (!user || !wallet) {
        return <div>Loading wallet...</div>
    }

    const budgetInEuros = wallet.budget_cents / 100;

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Wallet Balance</CardTitle>
                    <CardDescription>Your current balance and transaction history.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-6 rounded-lg bg-muted text-center">
                        <p className="text-sm text-muted-foreground">Current Balance</p>
                        <p className="text-4xl font-bold">€{(wallet.balance_cents / 100).toFixed(2)}</p>
                    </div>
                    <Button onClick={handleAddCredit} className="w-full">Add €10 Demo Credit</Button>
                </CardContent>
                <CardFooter>
                    <p className="text-xs text-muted-foreground">This is a demo wallet. No real money is involved.</p>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Budget Lock</CardTitle>
                    <CardDescription>Set a monthly spending limit to stay in control.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                     <div className="flex justify-between items-center">
                        <Label htmlFor="budget-slider" className="text-lg font-bold text-primary">
                            {wallet.budget_set ? `€${budgetInEuros}` : 'Not Set'}
                        </Label>
                        <p className="text-sm text-muted-foreground">Per calendar month</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Use the budget wizard to calculate a suggested budget based on your income and expenses, and optionally lock it to prevent overspending.
                    </p>
                </CardContent>
                <CardFooter>
                    <Button onClick={() => setIsBudgetModalOpen(true)}>
                        {wallet.budget_set ? 'Change Budget Limit' : 'Set Up Budget'}
                    </Button>
                </CardFooter>
            </Card>
            <BudgetWizardModal isOpen={isBudgetModalOpen} onOpenChange={setIsBudgetModalOpen} />
        </div>
    );
}
