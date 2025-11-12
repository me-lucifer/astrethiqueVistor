
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import * as authLocal from "@/lib/authLocal";
import { CheckCircle, MailWarning, AlertTriangle, ShieldCheck, Monitor, Smartphone, Tablet } from "lucide-react";
import { ChangeEmailModal } from "@/components/account/change-email-modal";
import { ChangePasswordModal } from "@/components/account/change-password-modal";
import { TwoFactorModal } from "@/components/account/two-factor-modal";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const sessions = [
  {
    id: "1",
    device: "Desktop Chrome",
    location: "Pune, India",
    lastActive: "Active now",
    icon: Monitor,
    isCurrent: true,
  },
  {
    id: "2",
    device: "Pixel 7",
    location: "Mumbai, India",
    lastActive: "2 hours ago",
    icon: Smartphone,
    isCurrent: false,
  },
  {
    id: "3",
    device: "iPad Pro",
    location: "Unknown",
    lastActive: "Yesterday",
    icon: Tablet,
    isCurrent: false,
  },
];


export default function SecurityPage() {
    const { toast } = useToast();
    const [user, setUser] = useState<authLocal.User | null>(null);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isTwoFactorModalOpen, setIsTwoFactorModalOpen] = useState(false);
    const [pendingEmail, setPendingEmail] = useState<string | null>(null);

    const refreshUser = () => {
        setUser(authLocal.getCurrentUser());
    };

    useEffect(() => {
        refreshUser();
    }, []);

    const handleEmailChangeSuccess = (newEmail: string) => {
        setPendingEmail(newEmail);
        setIsEmailModalOpen(false);
    };

    const handleResend = () => {
        if (!pendingEmail) return;
        toast({
            title: "Verification Email Resent",
            description: `A new verification link has been sent to ${pendingEmail}.`,
        });
    }

    const handleSignOutDevice = (deviceId: string) => {
        toast({
          title: "Device signed out",
          description: `The session on device ${deviceId} has been terminated.`,
        });
      };
    
      const handleSignOutAll = () => {
        toast({
          title: "Signed out of all other devices",
          description: "All other active sessions have been terminated.",
        });
      };

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
                           <Button variant="link" size="sm" className="h-auto p-0" onClick={() => setIsEmailModalOpen(true)}>Change again</Button>
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Login & Security</CardTitle>
                    <CardDescription>Manage your account's security settings.</CardDescription>
                </CardHeader>
                <CardContent className="divide-y divide-border">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 pl-0 gap-4">
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
                            <Button variant="outline" size="sm" onClick={() => setIsEmailModalOpen(true)}>Change</Button>
                        </div>
                    </div>
                     <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 pl-0 gap-4">
                        <div>
                            <p className="font-medium">Password</p>
                            <p className="text-sm text-muted-foreground">Last changed: {new Date(user.updatedAt).toLocaleDateString()}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setIsPasswordModalOpen(true)}>Change</Button>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>Add an extra layer of security to your account.</CardDescription>
                </CardHeader>
                <CardContent>
                    {user.twoFactorEnabled ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="h-5 w-5 text-success" />
                                    <div>
                                        <p className="font-medium">Authenticator App Enabled</p>
                                        <p className="text-xs text-muted-foreground">Device: Astrethique Demo</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                     <Button variant="outline" size="sm">View recovery codes</Button>
                                    <Button variant="destructive" size="sm">Disable</Button>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                You’ll need a code from your authenticator app when signing in.
                            </p>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                            <div>
                                <p className="font-medium">Authenticator App</p>
                                <p className="text-sm text-muted-foreground">Use an app like Google Authenticator or Authy.</p>
                            </div>
                            <Button onClick={() => setIsTwoFactorModalOpen(true)}>Enable</Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Active Sessions & Devices</CardTitle>
                    <CardDescription>This is a list of devices that have logged into your account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Device</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Last active</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sessions.map((session) => (
                                <TableRow key={session.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <session.icon className="h-4 w-4 text-muted-foreground" />
                                            <span>{session.device}</span>
                                            {session.isCurrent && <Badge variant="secondary">This device</Badge>}
                                        </div>
                                    </TableCell>
                                    <TableCell>{session.location}</TableCell>
                                    <TableCell>{session.lastActive}</TableCell>
                                    <TableCell className="text-right">
                                        {!session.isCurrent && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="link" size="sm" className="text-destructive h-auto p-0">Sign out</Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader><AlertDialogTitle>Sign out this device?</AlertDialogTitle><AlertDialogDescription>Are you sure you want to sign out the session on {session.device}?</AlertDialogDescription></AlertDialogHeader>
                                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleSignOutDevice(session.id)}>Sign Out</AlertDialogAction></AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="link" size="sm" className="p-0 h-auto">Sign out of all other devices</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Sign out of all other devices?</AlertDialogTitle><AlertDialogDescription>This will sign you out of all sessions on other devices. You will need to sign in again.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleSignOutAll}>Confirm</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
            </Card>

            <ChangeEmailModal
                isOpen={isEmailModalOpen}
                onOpenChange={setIsEmailModalOpen}
                currentUser={user}
                onSuccess={handleEmailChangeSuccess}
            />
            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onOpenChange={setIsPasswordModalOpen}
                currentUser={user}
                onSuccess={() => {
                    refreshUser();
                    setIsPasswordModalOpen(false);
                    toast({ title: "Password updated." });
                }}
            />
            <TwoFactorModal
                isOpen={isTwoFactorModalOpen}
                onOpenChange={setIsTwoFactorModalOpen}
                onSuccess={() => {
                    refreshUser();
                    setIsTwoFactorModalOpen(false);
                }}
            />
        </div>
    );
}
