
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import * as storage from "@/lib/storage";
import { CheckCircle, MailWarning } from "lucide-react";

export default function SecurityPage() {
    const { toast } = useToast();
    const [user, setUser] = useState<storage.User | null>(null);

    useEffect(() => {
        setUser(storage.getCurrentUser());
    }, []);

    const handleResendCode = () => {
        if (!user) return;
        toast({
            title: "Verification Code Sent",
            description: `A new code has been sent to ${user.email}. For this demo, the code is: 123456`,
        });
    };

    if (!user) {
        return <div>Loading security settings...</div>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your account's security settings.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                        <p className="font-medium">Email Address</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div>
                        <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                            <CheckCircle className="mr-1 h-3.5 w-3.5" />
                            Verified
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
