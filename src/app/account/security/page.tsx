
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import * as authLocal from "@/lib/authLocal";
import { CheckCircle, MailWarning, AlertTriangle } from "lucide-react";
import { ChangeEmailModal } from "@/components/account/change-email-modal";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SecurityPage() {
    const { toast } = useToast();
    const [user, setUser] = useState<authLocal.User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingEmail, setPendingEmail] = useState<string | null>(null);

    const refreshUser = () => {
        setUser(authLocal.getCurrentUser());
    };

    useEffect(() => {
        refreshUser();
    }, []);

    const handleEmailChangeSuccess = (newEmail: string) => {
        setPendingEmail(newEmail);
        setIsModalOpen(false);
    };

    const handleResend = () => {
        if (!pendingEmail) return;
        toast({
            title: "Verification Email Resent",
            description: `A new verification link has been sent to ${pendingEmail}.`,
        });
    }

    if (!user) {
        return <div>Loading security settings...</div>
    }

    return (
        <div className="space-y-8">
            {pendingEmail && (
                 <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Verification Pending</AlertTitle>
                    <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <span>Check your inbox at <strong>{pendingEmail}</strong> to complete the change.</span>
                        <div className="mt-2 sm:mt-0">
                           <Button variant="link" size="sm" className="h-auto p-0" onClick={handleResend}>Resend</Button>
                           <span className="mx-2 text-muted-foreground">|</span>
                           <Button variant="link" size="sm" className="h-auto p-0" onClick={() => setIsModalOpen(true)}>Change again</Button>
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Login & Security</CardTitle>
                    <CardDescription>Manage your account's security settings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border gap-4">
                        <div>
                            <p className="font-medium">Email Address</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
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
                            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>Change</Button>
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
            <ChangeEmailModal
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                currentUser={user}
                onSuccess={handleEmailChangeSuccess}
            />
        </div>
    );
}
