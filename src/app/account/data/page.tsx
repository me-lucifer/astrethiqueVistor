
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import * as authLocal from "@/lib/authLocal";
import { getLocal, setLocal, getWallet } from "@/lib/local";

export default function DataPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [deleteConfirmation, setDeleteConfirmation] = useState("");
    
    const handleExportData = () => {
        const user = authLocal.getCurrentUser();
        if(!user) {
            toast({ variant: "destructive", title: "You must be logged in to export data." });
            return;
        }

        const wallet = getWallet();
        
        const { passwordHash, ...userProfile } = user;

        const dataToExport = {
            profile: userProfile,
            wallet: wallet,
            favorites: user.favorites,
        };

        const jsonString = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `astrethique_data_${user.id}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({ title: "Data export started", description: "Your JSON file should begin downloading shortly." });
    };

    const handleDeleteAccount = () => {
        const user = authLocal.getCurrentUser();
        if(!user) return;

        // Anonymize comments
        const allComments = getLocal<authLocal.Comment[]>('ast_comments') || [];
        const updatedComments = allComments.map(c => {
            if (c.userId === user.id) {
                return { ...c, body: '[deleted by user]', userId: 'deleted' };
            }
            return c;
        });
        setLocal('ast_comments', updatedComments);

        // Delete user
        authLocal.deleteUser(user.id);
        authLocal.clearSession();
        
        toast({ title: "Account deleted", description: "Your account and associated data have been removed."});
        router.push('/');
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Export Your Data</CardTitle>
                    <CardDescription>Download a JSON file containing all your personal information, preferences, and content.</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button onClick={handleExportData}>Export My Data (JSON)</Button>
                </CardFooter>
            </Card>
            
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive">Delete Account</CardTitle>
                    <CardDescription>Permanently delete your account and all associated data. This action cannot be undone.</CardDescription>
                </CardHeader>
                <CardFooter>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">Delete My Account</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete your account and all associated data. To proceed, please type "DELETE" in the box below.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <Input 
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                placeholder='Type "DELETE" to confirm'
                                className="mt-2"
                            />
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDeleteConfirmation('')}>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                    className="bg-destructive hover:bg-destructive/90" 
                                    onClick={handleDeleteAccount}
                                    disabled={deleteConfirmation !== "DELETE"}
                                >
                                    Yes, delete my account
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
            </Card>
        </div>
    );
}
