
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import * as authLocal from "@/lib/authLocal";

export default function WalletPage() {
    const { toast } = useToast();
    const [user, setUser] = useState<any | null>(null);
    const [budgetLockValue, setBudgetLockValue] = useState([50]);

    useEffect(() => {
        const currentUser = authLocal.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
            if (currentUser.wallet.budgetLock) {
                setBudgetLockValue([currentUser.wallet.budgetLock]);
            }
        }
    }, []);

    const handleAddCredit = () => {
        if (!user) return;

        const updatedUser = { 
            ...user,
            wallet: { ...user.wallet, balanceCents: user.wallet.balanceCents + 1000 }
        };
        
        setUser(updatedUser);
        authLocal.updateUser(updatedUser);

        toast({
            title: "Funds Added",
            description: `€10.00 has been added to your wallet.`,
        });
    };

    const handleSaveBudgetLock = () => {
        if (!user) return;

        const updatedUser = { 
            ...user,
            wallet: { ...user.wallet, budgetLock: budgetLockValue[0] }
        };
        
        setUser(updatedUser);
        authLocal.updateUser(updatedUser);

        toast({
            title: "Budget Lock Updated",
            description: `Your monthly budget is now set to €${budgetLockValue[0]}.`,
        });
    }

    if (!user) {
        return <div>Loading wallet...</div>
    }

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
                        <p className="text-4xl font-bold">€{(user.wallet.balanceCents / 100).toFixed(2)}</p>
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
                        <Label htmlFor="budget-slider" className="text-lg font-bold text-primary">€{budgetLockValue[0]}</Label>
                        <p className="text-sm text-muted-foreground">Per calendar month</p>
                    </div>
                    <Slider
                        id="budget-slider"
                        max={200}
                        step={10}
                        value={budgetLockValue}
                        onValueChange={setBudgetLockValue}
                    />
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSaveBudgetLock}>Save Budget Limit</Button>
                </CardFooter>
            </Card>
        </div>
    );
}
