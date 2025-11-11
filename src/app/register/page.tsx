"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Gem, CheckCircle } from "lucide-react";
import * as storage from "@/lib/storage";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input, PasswordInput } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PasswordStrength from "@/components/auth/password-strength";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { AuthModal } from "@/components/auth-modal";

const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .refine((password) => /[a-zA-Z]/.test(password), { message: "Password must contain at least one letter" })
  .refine((password) => /[0-9]/.test(password), { message: "Password must contain at least one number" });

const createAccountSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  language: z.enum(["EN", "FR"]),
  timezone: z.string().min(1, "Please select your timezone"),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms and privacy policy" }),
  }),
  is18OrOlder: z.literal(true, {
    errorMap: () => ({ message: "You must be 18 or older to register" }),
  }),
  marketingOptIn: z.boolean(),
});

type CreateAccountFormData = z.infer<typeof createAccountSchema>;

function RegisterPageContent() {
    const router = useRouter();
    const { toast } = useToast();
    const { language } = useLanguage();
    
    const [user, setUser] = useState<storage.User | null>(null);
    const [isClient, setIsClient] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [defaultTimezone, setDefaultTimezone] = useState('');
    const [showVerification, setShowVerification] = useState(false);
    const [tempUserEmail, setTempUserEmail] = useState<string | null>(null);


    useEffect(() => {
        setIsClient(true);
        const currentUser = storage.getCurrentUser();
        setUser(currentUser);
        if (typeof window !== 'undefined') {
            setDefaultTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
        }
    }, []);

    const form = useForm<CreateAccountFormData>({
        resolver: zodResolver(createAccountSchema),
        defaultValues: {
            fullName: "", email: "", password: "",
            language: language.toUpperCase() as "EN" | "FR",
            timezone: '', agreeToTerms: false, is18OrOlder: false, marketingOptIn: false,
        },
    });

    useEffect(() => {
        if (defaultTimezone) {
            form.setValue("timezone", defaultTimezone);
        }
    }, [defaultTimezone, form]);


    const handleLogout = () => {
        storage.setCurrentUser(null);
        window.dispatchEvent(new Event('storage_change'));
        setUser(null);
        toast({ title: "You have been signed out." });
    };

    async function handleCreateAccount(values: CreateAccountFormData) {
        if (storage.findUserByEmail(values.email)) {
            form.setError("email", { type: "manual", message: "An account with this email already exists." });
            return;
        }

        const passwordHash = await storage.hashPassword(values.password);
        const newUser: storage.User = {
            id: storage.createId('usr_'),
            role: 'visitor',
            name: values.fullName,
            email: values.email,
            passwordHash,
            createdAt: new Date().toISOString(),
            emailVerified: false,
            kycStatus: "n/a",
        };

        const users = storage.getUsers();
        storage.saveUsers([...users, newUser]);
        
        const prefs = storage.getStorageItem<Record<string, storage.Preferences>>('ast_prefs') || {};
        prefs[newUser.id] = { language: values.language, timezone: values.timezone, marketingOptIn: values.marketingOptIn };
        storage.setStorageItem('ast_prefs', prefs);
        
        const favorites = storage.getStorageItem<Record<string, storage.Favorites>>('ast_favorites') || {};
        favorites[newUser.id] = { consultants: [], content: [], conferences: [] };
        storage.setStorageItem('ast_favorites', favorites);

        const wallets = storage.getStorageItem<Record<string, storage.Wallet>>('ast_wallets') || {};
        wallets[newUser.id] = { balance: 0, currency: '€' };
        storage.setStorageItem('ast_wallets', wallets);

        setTempUserEmail(newUser.email);
        toast({
          title: "Account created",
          description: "Please verify your email to continue.",
        });
        setShowVerification(true);
    }
    
    function handleVerify(code: string) {
        if (!tempUserEmail) return;

        if (code !== '123456') { // Demo code
            toast({ variant: 'destructive', title: "Invalid verification code." });
            return;
        }

        const userToVerify = storage.findUserByEmail(tempUserEmail);
        if (!userToVerify) return;
        
        const updatedUsers = storage.getUsers().map(u => u.id === userToVerify.id ? { ...u, emailVerified: true } : u);
        storage.saveUsers(updatedUsers);

        storage.setCurrentUser(userToVerify.id);
        toast({ title: "Email verified. Welcome!" });
        window.dispatchEvent(new Event('storage_change'));
        router.push('/discover');
    }

    const heroImage = PlaceHolderImages.find(p => p.id === 'hero-background');
    const watchedPassword = form.watch("password");

    if (!isClient) {
        return null; // Render nothing on the server
    }

    if (user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-center">
                 <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle>You're already logged in</CardTitle>
                        <CardDescription>Welcome back, {user.name.split(' ')[0]}!</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        <Button asChild><Link href="/discover">Go to Discover</Link></Button>
                        <Button variant="ghost" onClick={handleLogout}>Sign out</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-2">
            <div className="hidden lg:block relative">
                 {heroImage && (
                    <Image
                        src={heroImage.imageUrl}
                        alt={heroImage.description}
                        data-ai-hint={heroImage.imageHint}
                        fill
                        className="object-cover"
                        priority
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative z-10 flex flex-col justify-end h-full p-12 text-white">
                    <Link href="/" className="flex items-center gap-2 font-headline text-lg font-bold text-primary mb-4">
                        <Gem className="h-6 w-6" />
                        <span>ASTRETHIQUE</span>
                    </Link>
                    <h1 className="font-headline text-4xl font-bold tracking-tight text-white drop-shadow-md">
                        Create Your Visitor Account
                    </h1>
                    <p className="mt-2 text-lg text-white/80 drop-shadow-sm">
                        Join our community and start your journey.
                    </p>
                </div>
            </div>
            <div className="flex items-center justify-center p-4 sm:p-8">
                 <div className="w-full max-w-lg">
                    {showVerification ? (
                        <Card>
                            <CardHeader className="text-center">
                                <CardTitle>Verify Your Email</CardTitle>
                                <CardDescription>Enter the 6-digit code sent to {tempUserEmail}.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Input 
                                    placeholder="123456" 
                                    className="text-center text-lg tracking-[0.5em]"
                                    onChange={(e) => {
                                        if (e.target.value.length === 6) {
                                            handleVerify(e.target.value);
                                        }
                                    }}
                                />
                                <p className="text-xs text-muted-foreground text-center mt-2">For demo, the code is: 123456</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl">Create an account</CardTitle>
                                <CardDescription>
                                    Already have an account?{' '}
                                    <Button variant="link" className="p-0" onClick={() => setIsAuthModalOpen(true)}>
                                        Sign in
                                    </Button>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleCreateAccount)} className="space-y-4">
                                    <FormField control={form.control} name="fullName" render={({ field }) => (
                                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Your full name" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="password" render={({ field }) => (
                                    <FormItem><FormLabel>Password</FormLabel><FormControl><PasswordInput {...field} /></FormControl><PasswordStrength password={watchedPassword} /><FormMessage /></FormItem>
                                    )} />
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name="language" render={({ field }) => (
                                        <FormItem><FormLabel>Language</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="EN">English</SelectItem><SelectItem value="FR">Français</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="timezone" render={({ field }) => (
                                        <FormItem><FormLabel>Timezone</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value={defaultTimezone}>{defaultTimezone.replace(/_/g, " ")}</SelectItem><SelectItem value="Europe/London">Europe/London</SelectItem><SelectItem value="America/New_York">America/New_York</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                                        )} />
                                    </div>

                                    <FormField control={form.control} name="agreeToTerms" render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>I agree to the <Link href="/legal-hub/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Terms</Link> and <Link href="/legal-hub/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy</Link>.</FormLabel><FormMessage /></div></FormItem>
                                    )} />
                                    <FormField control={form.control} name="is18OrOlder" render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>I confirm I am 18 years of age or older.</FormLabel><FormMessage /></div></FormItem>
                                    )} />
                                    <FormField control={form.control} name="marketingOptIn" render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Send me tips and updates (optional).</FormLabel></div></FormItem>
                                    )} />
                                    
                                    <div className="pt-4">
                                        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>Create Account</Button>
                                    </div>
                                </form>
                                </Form>
                            </CardContent>
                             <CardFooter className="text-center">
                                <p className="text-xs text-muted-foreground">
                                    Prototype only — accounts are stored locally on your device. Don’t use real passwords.
                                </p>
                            </CardFooter>
                        </Card>
                    )}
                 </div>
            </div>
            <AuthModal isOpen={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} onLoginSuccess={() => router.push('/discover')} />
        </div>
    );
}

export default RegisterPageContent;
