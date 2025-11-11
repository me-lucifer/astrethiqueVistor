
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
import * as authLocal from "@/lib/authLocal";
import PasswordStrength from "@/components/auth/password-strength";
import { useRouter } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Shield, User as UserIcon } from "lucide-react";

const pseudonymSchema = z.string()
    .min(3, "Pick 3–24 characters (letters, numbers, dot, underscore, or dash).")
    .max(24, "Pick 3–24 characters (letters, numbers, dot, underscore, or dash).")
    .regex(/^[a-zA-Z0-9._-]+$/, "Pick 3–24 characters (letters, numbers, dot, underscore, or dash).")
    .refine(val => !authLocal.reservedPseudonyms.includes(val.toLowerCase()), "This word isn’t allowed as a pseudonym.");


const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  pseudonym: z.string().optional(),
  displayNamePreference: z.enum(['pseudonym', 'realName']).default('realName'),
  language: z.enum(["EN", "FR"]),
  timezone: z.string().min(1, "Timezone is required."),
}).superRefine((data, ctx) => {
    if (data.displayNamePreference === 'pseudonym') {
        const result = pseudonymSchema.safeParse(data.pseudonym);
        if (!result.success) {
            result.error.issues.forEach(issue => {
                ctx.addIssue({
                    ...issue,
                    path: ['pseudonym'],
                });
            });
        }
    }
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
    const [user, setUser] = useState<authLocal.User | null>(null);
    const [defaultTimezone, setDefaultTimezone] = useState('');

    useEffect(() => {
        const currentUser = authLocal.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
            profileForm.reset({
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
                pseudonym: currentUser.pseudonym || '',
                displayNamePreference: currentUser.displayNamePreference || 'realName',
                language: currentUser?.language || 'EN',
                timezone: currentUser?.timezone || '',
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
        if (!user) return;
        
        const updatedUser: authLocal.User = { 
            ...user, 
            ...data,
            updatedAt: new Date().toISOString()
        };
        
        authLocal.updateUser(updatedUser);
        setUser(updatedUser);

        toast({ title: "Profile updated successfully." });
    };

    const onPasswordSubmit = async (data: PasswordFormData) => {
        if (!user) return;
        
        try {
            await authLocal.changePassword(user.id, data.currentPassword, data.newPassword);
            toast({ title: "Password changed successfully." });
            passwordForm.reset();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        }
    };
    
    const {formState: {errors}} = profileForm;
    const watchedPseudonym = profileForm.watch("pseudonym");
    const isPseudonymValid = !!watchedPseudonym && watchedPseudonym.length >= 3 && !errors.pseudonym;


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
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                               <FormField control={profileForm.control} name="firstName" render={({ field }) => (
                                    <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={profileForm.control} name="lastName" render={({ field }) => (
                                    <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>

                             <FormField control={profileForm.control} name="pseudonym" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pseudonym (public name)</FormLabel>
                                    <FormControl><Input placeholder="e.g., StarSeeker" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField
                                control={profileForm.control}
                                name="displayNamePreference"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                    <FormLabel>Public Identity</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                                        >
                                        <FormItem>
                                            <FormControl>
                                                <RadioGroupItem value="pseudonym" id="pseudonym" className="sr-only" disabled={!isPseudonymValid} />
                                            </FormControl>
                                            <Label htmlFor="pseudonym" className={cn("flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-colors", field.value === 'pseudonym' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50', !isPseudonymValid && 'opacity-50 cursor-not-allowed')}>
                                                <div className="flex items-center gap-2 font-semibold">
                                                    <Shield className="w-4 h-4" />
                                                    Pseudonym
                                                </div>
                                            </Label>
                                        </FormItem>
                                        <FormItem>
                                            <FormControl>
                                                <RadioGroupItem value="realName" id="realName" className="sr-only" />
                                            </FormControl>
                                            <Label htmlFor="realName" className={cn("flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-colors", field.value === 'realName' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}>
                                                    <div className="flex items-center gap-2 font-semibold">
                                                    <UserIcon className="w-4 h-4" />
                                                    Real name
                                                </div>
                                            </Label>
                                        </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />

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
