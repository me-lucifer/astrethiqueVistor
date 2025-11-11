
"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Gem, LogIn, UserPlus } from "lucide-react";
import * as authLocal from "@/lib/authLocal";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input, PasswordInput } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PasswordStrength from "@/components/auth/password-strength";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { AuthModal } from "@/components/auth-modal";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .refine((password) => /[a-zA-Z]/.test(password), { message: "Password must contain at least one letter" })
  .refine((password) => /[0-9]/.test(password), { message: "Password must contain at least one number" });

const createAccountSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  language: z.enum(["EN", "FR"]),
  timezone: z.string().min(1, "Please select your timezone"),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms and privacy policy" }),
  }),
  marketingOptIn: z.boolean().default(false),
});

type CreateAccountFormData = z.infer<typeof createAccountSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const { toast } = useToast();
    const language = "en"; // Simplified for now
    
    const [user, setUser] = useState<any>(null);
    const [isClient, setIsClient] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [defaultTimezone, setDefaultTimezone] = useState('');
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        setIsClient(true);
        const currentUser = authLocal.getCurrentUser();
        setUser(currentUser);
        if (typeof window !== 'undefined') {
            setDefaultTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
        }
    }, []);

    const form = useForm<CreateAccountFormData>({
        resolver: zodResolver(createAccountSchema),
        defaultValues: {
            firstName: "", lastName: "", email: "", password: "",
            language: language.toUpperCase() as "EN" | "FR",
            timezone: '', agreeToTerms: false, marketingOptIn: false,
        },
        mode: "onBlur"
    });

    useEffect(() => {
        if (defaultTimezone) {
            form.setValue("timezone", defaultTimezone);
        }
    }, [defaultTimezone, form]);

    const handleLogout = () => {
        authLocal.clearSession();
        setUser(null);
        toast({ title: "You have been signed out." });
    };

    async function handleCreateAccount(values: CreateAccountFormData) {
        startTransition(async () => {
            try {
                const newUser = await authLocal.registerVisitor(values);
                toast({
                  title: `Welcome, ${newUser.firstName}!`,
                  description: "Your account has been created successfully.",
                });
                router.push('/discover');
            } catch (error: any) {
                if (error.message.includes("email already exists")) {
                    form.setError("email", { type: "manual", message: error.message });
                } else {
                    toast({
                        variant: "destructive",
                        title: "Registration failed",
                        description: "An unexpected error occurred. Please try again.",
                    });
                }
            }
        });
    }

    const onInvalidSubmit = (errors: any) => {
        toast({
          variant: "destructive",
          title: "Please fix the errors highlighted on the form.",
        });
        const firstErrorField = Object.keys(errors)[0];
        if(firstErrorField) {
            try {
                const element = document.getElementsByName(firstErrorField)[0];
                element?.focus({ preventScroll: true });
                element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } catch (e) {
                console.warn('Could not focus on invalid field:', firstErrorField)
            }
        }
    };
    
    const heroImage = PlaceHolderImages.find(p => p.id === 'hero-background');
    const watchedPassword = form.watch("password");
    const watchedAgreeToTerms = form.watch("agreeToTerms");

    if (!isClient) {
        return null; // Render nothing on the server
    }

    if (user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-center">
                 <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle>You're already logged in</CardTitle>
                        <CardDescription>Welcome back, {user.firstName}!</CardDescription>
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
        <>
        <div className="min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-2">
            <div className="relative h-[40vh] lg:h-full">
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
                <div className="relative z-10 flex flex-col justify-end h-full p-8 md:p-12 text-white">
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
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Create an account</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TooltipProvider>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="outline" className="w-full" aria-disabled="true">
                                                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-69.2 69.2c-20.8-20.8-48.6-33.8-78.5-33.8-57.2 0-104.4 47.2-104.4 104.4s47.2 104.4 104.4 104.4c65.3 0 98.2-49.4 101.6-74.4H248v-89.8h239.1c1.3 12.2 2.3 24.4 2.3 36.8z"></path></svg>
                                                Sign up with Google
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Coming soon</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="outline" className="w-full" aria-disabled="true">
                                                 <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="facebook" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"></path></svg>
                                                 Sign up with Facebook
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Coming soon</TooltipContent>
                                    </Tooltip>
                                </div>
                            </TooltipProvider>
                            <div className="relative mb-4">
                                <Separator />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 bg-card text-muted-foreground text-xs">OR</div>
                            </div>
                            <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleCreateAccount, onInvalidSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                     <FormField control={form.control} name="firstName" render={({ field }) => (
                                        <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="Your first name" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                     <FormField control={form.control} name="lastName" render={({ field }) => (
                                        <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Your last name" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                                <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="password" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl><PasswordInput {...field} /></FormControl>
                                    <PasswordStrength password={watchedPassword} />
                                    <FormMessage />
                                </FormItem>
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
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>I agree to the <Link href="/legal-hub/terms-of-service" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/legal-hub/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.</FormLabel><FormMessage /></div></FormItem>
                                )} />
                                <FormField control={form.control} name="marketingOptIn" render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>I’d like occasional product updates and offers.</FormLabel></div></FormItem>
                                )} />
                                
                                <div className="pt-4 space-y-2">
                                    <Button type="submit" className="w-full" disabled={isPending || !watchedAgreeToTerms}>Create Account</Button>
                                     <div className="text-center text-sm">
                                        <span className="text-muted-foreground">Already have an account? </span>
                                        <Button variant="link" className="p-0" type="button" onClick={() => setIsAuthModalOpen(true)}>
                                            Sign in
                                        </Button>
                                     </div>
                                </div>
                            </form>
                            </Form>
                        </CardContent>
                         <CardFooter className="text-center">
                            <p className="text-xs text-muted-foreground">
                                Your name helps personalize your experience. You can change it in Settings. We protect your data under GDPR.
                            </p>
                        </CardFooter>
                    </Card>
                 </div>
            </div>
        </div>
        <AuthModal isOpen={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} onLoginSuccess={() => router.push('/discover')} />
        </>
    );
}
