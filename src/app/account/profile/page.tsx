
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input, PasswordInput } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import * as storage from "@/lib/storage";
import PasswordStrength from "@/components/auth/password-strength";
import { useRouter } from "next/navigation";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  language: z.enum(["EN", "FR"]),
  timezone: z.string().min(1, "Timezone is required."),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z.string().min(8, "New password must be at least 8 characters."),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
    const { toast } = useToast();
    const router = useRouter();
    const [user, setUser] = useState<storage.User | null>(null);
    const [prefs, setPrefs] = useState<storage.Preferences | null>(null);
    const [defaultTimezone, setDefaultTimezone] = useState('');

    useEffect(() => {
        const currentUser = storage.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
            const allPrefs = storage.getStorageItem<Record<string, storage.Preferences>>('ast_prefs') || {};
            const userPrefs = allPrefs[currentUser.id];
            setPrefs(userPrefs || null);
            profileForm.reset({
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
                language: userPrefs?.language || 'EN',
                timezone: userPrefs?.timezone || '',
            });
        } else {
            router.push('/');
        }
        if (typeof window !== 'undefined') {
            setDefaultTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
        }
    }, [router]);

    const profileForm = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
    });

    const passwordForm = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { currentPassword: "", newPassword: "" },
    });

    const onProfileSubmit = (data: ProfileFormData) => {
        if (!user || !prefs) return;
        
        // Update user name
        const users = storage.getUsers();
        const updatedUsers = users.map(u => u.id === user.id ? { ...u, firstName: data.firstName, lastName: data.lastName } : u);
        storage.saveUsers(updatedUsers);
        
        // Update preferences
        const allPrefs = storage.getStorageItem<Record<string, storage.Preferences>>('ast_prefs') || {};
        allPrefs[user.id] = { ...prefs, language: data.language, timezone: data.timezone };
        storage.setStorageItem('ast_prefs', allPrefs);
        
        // Update user state locally
        setUser({ ...user, firstName: data.firstName, lastName: data.lastName });
        setPrefs(allPrefs[user.id]);
        window.dispatchEvent(new Event('storage_change')); // To update header

        toast({ title: "Profile updated successfully." });
    };

    const onPasswordSubmit = async (data: PasswordFormData) => {
        if (!user) return;
        
        const currentPasswordHash = await storage.hashPassword(data.currentPassword);
        if (currentPasswordHash !== user.passwordHash) {
            passwordForm.setError("currentPassword", { message: "Incorrect current password." });
            return;
        }

        const newPasswordHash = await storage.hashPassword(data.newPassword);
        const users = storage.getUsers();
        const updatedUsers = users.map(u => u.id === user.id ? { ...u, passwordHash: newPasswordHash } : u);
        storage.saveUsers(updatedUsers);

        toast({ title: "Password changed successfully." });
        passwordForm.reset();
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your name and localization settings.</CardDescription>
                </CardHeader>
                <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                               <FormField control={profileForm.control} name="firstName" render={({ field }) => (
                                    <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={profileForm.control} name="lastName" render={({ field }) => (
                                    <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={profileForm.control} name="language" render={({ field }) => (
                                    <FormItem><FormLabel>Language</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="EN">English</SelectItem><SelectItem value="FR">Français</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                                )} />
                                <FormField control={profileForm.control} name="timezone" render={({ field }) => (
                                    <FormItem><FormLabel>Timezone</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value={defaultTimezone}>{defaultTimezone.replace(/_/g, " ")}</SelectItem><SelectItem value="Europe/London">Europe/London</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                                )} />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit">Save Changes</Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Choose a new strong password.</CardDescription>
                </CardHeader>
                <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                        <CardContent className="space-y-4">
                            <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                                <FormItem><FormLabel>Current Password</FormLabel><FormControl><PasswordInput {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                                <FormItem><FormLabel>New Password</FormLabel><FormControl><PasswordInput {...field} /></FormControl><PasswordStrength password={field.value} /><FormMessage /></FormItem>
                            )} />
                        </CardContent>
                        <CardFooter>
                            <Button type="submit">Update Password</Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    );
}
