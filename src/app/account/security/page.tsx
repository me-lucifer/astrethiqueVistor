
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import * as authLocal from "@/lib/authLocal";
import { CheckCircle, MailWarning } from "lucide-react";

export default function SecurityPage() {
    const { toast } = useToast();
    const [user, setUser] = useState<any | null>(null);

    useEffect(() => {
        setUser(authLocal.getCurrentUser());
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
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Login & Security</CardTitle>
                    <CardDescription>Manage your account's security settings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                            <p className="font-medium">Email Address</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <div>
                            {user.emailVerified ? (
                                <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                                    <CheckCircle className="mr-1 h-3.5 w-3.5" />
                                    Verified
                                </Badge>
                            ) : (
                                 <Badge variant="destructive">
                                    <MailWarning className="mr-1 h-3.5 w-3.5" />
                                    Unverified
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>Add an extra layer of security to your account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50 opacity-60">
                        <p>Authenticator App</p>
                        <Button disabled>Enable</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
