
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
import * as storage from "@/lib/storage";

export default function DataPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [deleteConfirmation, setDeleteConfirmation] = useState("");
    
    const handleExportData = () => {
        const user = storage.getCurrentUser();
        if(!user) {
            toast({ variant: "destructive", title: "You must be logged in to export data." });
            return;
        }

        const prefs = storage.getStorageItem<Record<string, storage.Preferences>>('ast_prefs') || {};
        const wallets = storage.getStorageItem<Record<string, storage.Wallet>>('ast_wallets') || {};
        const favorites = storage.getStorageItem<Record<string, storage.Favorites>>('ast_favorites') || {};
        const allComments = storage.getStorageItem<storage.Comment[]>('ast_comments') || [];
        
        const userComments = allComments.filter(c => c.userId === user.id);

        const dataToExport = {
            profile: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
                emailVerified: user.emailVerified,
            },
            preferences: prefs[user.id] || {},
            wallet: wallets[user.id] || {},
            favorites: favorites[user.id] || {},
            comments: userComments,
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
        const user = storage.getCurrentUser();
        if(!user) return;

        // 1. Remove user from users list
        const users = storage.getUsers().filter(u => u.id !== user.id);
        storage.saveUsers(users);

        // 2. Soft-delete comments
        const allComments = storage.getStorageItem<storage.Comment[]>('ast_comments') || [];
        const updatedComments = allComments.map(c => 
            c.userId === user.id 
            ? { ...c, body: "[deleted by user]", userId: "deleted" }
            : c
        );
        storage.setStorageItem('ast_comments', updatedComments);

        // 3. Remove user-specific data from maps
        const prefs = storage.getStorageItem<Record<string, storage.Preferences>>('ast_prefs') || {};
        delete prefs[user.id];
        storage.setStorageItem('ast_prefs', prefs);
        
        const wallets = storage.getStorageItem<Record<string, storage.Wallet>>('ast_wallets') || {};
        delete wallets[user.id];
        storage.setStorageItem('ast_wallets', wallets);

        const favorites = storage.getStorageItem<Record<string, storage.Favorites>>('ast_favorites') || {};
        delete favorites[user.id];
        storage.setStorageItem('ast_favorites', favorites);

        // 4. Sign out
        storage.setCurrentUser(null);
        window.dispatchEvent(new Event('storage_change'));
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
                                    This will permanently delete your account and anonymize your comments. To proceed, please type "DELETE" in the box below.
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
