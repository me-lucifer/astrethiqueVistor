"use client";

import React, { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, PasswordInput } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import * as storage from "@/lib/storage";
import PasswordStrength from "./auth/password-strength";
import { MailCheck, KeyRound, ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";


interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onLoginSuccess: () => void;
}

const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .refine((password) => /[a-zA-Z]/.test(password), { message: "Password must contain at least one letter" })
  .refine((password) => /[0-9]/.test(password), { message: "Password must contain at least one number" });

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const verificationSchema = z.object({
  code: z.string().length(6, "Code must be 6 digits"),
});

const forgotPasswordEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const forgotPasswordResetSchema = z.object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});


type SignInFormData = z.infer<typeof signInSchema>;
type VerificationFormData = z.infer<typeof verificationSchema>;
type ForgotPasswordEmailFormData = z.infer<typeof forgotPasswordEmailSchema>;
type ForgotPasswordResetFormData = z.infer<typeof forgotPasswordResetSchema>;

type AuthView = 'signin' | 'verify' | 'forgot-password-email' | 'forgot-password-otp' | 'forgot-password-reset';

export function AuthModal({ isOpen, onOpenChange, onLoginSuccess }: AuthModalProps) {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [view, setView] = useState<AuthView>('signin');
  const [tempUserEmail, setTempUserEmail] = useState<string | null>(null);

  const isDemoMode = searchParams.get('demo') === '1';

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const verificationForm = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: { code: "" },
  });
  
  const forgotPasswordEmailForm = useForm<ForgotPasswordEmailFormData>({
    resolver: zodResolver(forgotPasswordEmailSchema),
    defaultValues: { email: "" },
  });

  const forgotPasswordResetForm = useForm<ForgotPasswordResetFormData>({
    resolver: zodResolver(forgotPasswordResetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const watchedResetPassword = useWatch({ control: forgotPasswordResetForm.control, name: "password" });

  async function handleSignIn(values: SignInFormData) {
    const user = storage.findUserByEmail(values.email);
    if (!user) {
        signInForm.setError("email", { type: "manual", message: "No account found with this email." });
        return;
    }
    
    const passwordMatches = (await storage.hashPassword(values.password)) === user.passwordHash;
    if (!passwordMatches) {
        signInForm.setError("password", { type: "manual", message: "Incorrect password." });
        return;
    }

    if (!user.emailVerified) {
        setTempUserEmail(user.email);
        setView('verify');
        return;
    }
    
    storage.setCurrentUser(user.id);
    const firstName = user.name.split(' ')[0];
    toast({ title: `Welcome back, ${firstName}!` });
    onLoginSuccess();
    onOpenChange(false);
  }

  function handleVerify(values: VerificationFormData) {
    if (!tempUserEmail) return;

    if (values.code !== '123456') { // Demo code
        verificationForm.setError("code", { message: "Invalid verification code." });
        return;
    }

    const user = storage.findUserByEmail(tempUserEmail);
    if (!user) return;
    
    const updatedUsers = storage.getUsers().map(u => u.id === user.id ? { ...u, emailVerified: true } : u);
    storage.saveUsers(updatedUsers);

    storage.setCurrentUser(user.id);
    toast({ title: "Email verified." });

    onLoginSuccess();
    onOpenChange(false);
    setView('signin');
  }

  const handleForgotPasswordEmail = (values: ForgotPasswordEmailFormData) => {
    const user = storage.findUserByEmail(values.email);
    if (!user) {
        forgotPasswordEmailForm.setError("email", { message: "No account found with this email." });
        return;
    }
    setTempUserEmail(user.email);
    setView('forgot-password-otp');
  };

  const handleForgotPasswordOtp = (values: VerificationFormData) => {
    if (values.code !== '123456') {
        verificationForm.setError("code", { message: "Invalid verification code." });
        return;
    }
    setView('forgot-password-reset');
  };
  
  const handleForgotPasswordReset = async (values: ForgotPasswordResetFormData) => {
    if (!tempUserEmail) return;
    const user = storage.findUserByEmail(tempUserEmail);
    if (!user) return;
    
    const newPasswordHash = await storage.hashPassword(values.password);
    const updatedUsers = storage.getUsers().map(u => u.id === user.id ? { ...u, passwordHash: newPasswordHash } : u);
    storage.saveUsers(updatedUsers);

    toast({ title: "Password successfully reset!", description: "You can now sign in with your new password." });
    setView('signin');
    signInForm.setValue('email', tempUserEmail);
    signInForm.setValue('password', '');
    setTempUserEmail(null);
  };
  
  const handleSeedAndLogin = async () => {
    const demoEmail = "demo@local";
    let demoUser = storage.findUserByEmail(demoEmail);

    if (!demoUser) {
        const passwordHash = await storage.hashPassword("Demo1234");
        const newUser: storage.User = {
            id: storage.createId('usr_demo'),
            role: 'visitor',
            name: 'Demo Visitor',
            email: demoEmail,
            passwordHash,
            createdAt: new Date().toISOString(),
            emailVerified: true,
            kycStatus: "n/a",
        };

        const users = storage.getUsers();
        storage.saveUsers([...users, newUser]);

        const prefs = storage.getStorageItem<Record<string, storage.Preferences>>('ast_prefs') || {};
        prefs[newUser.id] = { language: 'EN', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/London', marketingOptIn: false };
        storage.setStorageItem('ast_prefs', prefs);

        const favorites = storage.getStorageItem<Record<string, storage.Favorites>>('ast_favorites') || {};
        favorites[newUser.id] = { consultants: [], content: [], conferences: [] };
        storage.setStorageItem('ast_favorites', favorites);
        
        const wallets = storage.getStorageItem<Record<string, storage.Wallet>>('ast_wallets') || {};
        wallets[newUser.id] = { balance: 100, currency: '€' }; // Give demo user some credit
        storage.setStorageItem('ast_wallets', wallets);
        
        demoUser = newUser;
        toast({ title: "Demo user created!" });
    }

    storage.setCurrentUser(demoUser.id);
    toast({ title: `Welcome, Demo Visitor!` });
    onLoginSuccess();
    onOpenChange(false);
  };

  const handleClose = (open: boolean) => {
    if(!open) {
      setTimeout(() => {
        setView('signin');
        signInForm.reset();
        verificationForm.reset();
        forgotPasswordEmailForm.reset();
        forgotPasswordResetForm.reset();
      }, 300);
    }
    onOpenChange(open);
  }
  
  const goBackToSignin = () => {
    setView('signin');
    setTempUserEmail(null);
  }

  const onInvalidSubmit = () => {
    toast({
        variant: "destructive",
        title: "Please fix the errors highlighted on the form.",
    });
  }

  const SignInView = () => (
    <>
      <DialogHeader className="p-6 pb-2">
        <DialogTitle>Sign In</DialogTitle>
        <DialogDescription>
            Don't have an account?{' '}
            <Button asChild variant="link" className="p-0">
                <Link href="/register">Create one</Link>
            </Button>
        </DialogDescription>
      </DialogHeader>
      <Form {...signInForm}>
        <form onSubmit={signInForm.handleSubmit(handleSignIn, onInvalidSubmit)} className="space-y-4 px-6 pb-4">
          <FormField control={signInForm.control} name="email" render={({ field }) => (
            <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
            <FormField control={signInForm.control} name="password" render={({ field }) => (
            <FormItem><FormLabel>Password</FormLabel><FormControl><PasswordInput {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <div className="text-right">
            <Button type="button" variant="link" className="p-0 h-auto text-sm" onClick={() => setView('forgot-password-email')}>Forgot password?</Button>
          </div>
          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full" disabled={signInForm.formState.isSubmitting}>Sign In</Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );

  const VerificationView = ({ onVerify }: { onVerify: (values: VerificationFormData) => void }) => {
    return (
        <>
            <DialogHeader className="p-6 pb-4">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mx-auto mb-4">
                    <MailCheck className="h-6 w-6 text-primary" />
                </div>
                <DialogTitle className="text-center">Check your email</DialogTitle>
                <DialogDescription className="text-center">
                    We sent a 6-digit verification code to <br/> <span className="font-semibold text-foreground">{tempUserEmail}</span>
                </DialogDescription>
            </DialogHeader>
            <Form {...verificationForm}>
                <form onSubmit={verificationForm.handleSubmit(onVerify)} className="space-y-4 px-6">
                    <FormField control={verificationForm.control} name="code" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="sr-only">Verification Code</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    className="text-center text-lg tracking-[0.5em]"
                                    maxLength={6}
                                    placeholder="------"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <div className="text-center text-sm text-muted-foreground pt-2">
                        For demo purposes, the code is: <strong className="text-foreground">123456</strong>
                    </div>

                     <DialogFooter className="pt-4 flex-col gap-2">
                        <Button type="submit" className="w-full" disabled={verificationForm.formState.isSubmitting}>Verify</Button>
                        <Button type="button" variant="ghost" onClick={goBackToSignin} className="w-full text-muted-foreground flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" /> Go back
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </>
    )
  };
  
  const ForgotPasswordEmailView = () => (
    <>
        <DialogHeader className="p-6 pb-4">
            <DialogTitle>Forgot Password</DialogTitle>
            <DialogDescription>Enter your email address and we'll send you a code to reset your password.</DialogDescription>
        </DialogHeader>
        <Form {...forgotPasswordEmailForm}>
            <form onSubmit={forgotPasswordEmailForm.handleSubmit(handleForgotPasswordEmail)} className="space-y-4 px-6">
                <FormField control={forgotPasswordEmailForm.control} name="email" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <DialogFooter className="pt-4 flex-col gap-2">
                    <Button type="submit" className="w-full" disabled={forgotPasswordEmailForm.formState.isSubmitting}>Send Code</Button>
                    <Button type="button" variant="ghost" onClick={goBackToSignin} className="w-full text-muted-foreground">Cancel</Button>
                </DialogFooter>
            </form>
        </Form>
    </>
  );

  const ForgotPasswordResetView = () => (
    <>
      <DialogHeader className="p-6 pb-4">
        <DialogTitle>Reset Your Password</DialogTitle>
        <DialogDescription>Enter a new password for {tempUserEmail}.</DialogDescription>
      </DialogHeader>
      <Form {...forgotPasswordResetForm}>
        <form onSubmit={forgotPasswordResetForm.handleSubmit(handleForgotPasswordReset)} className="space-y-4 px-6">
          <FormField control={forgotPasswordResetForm.control} name="password" render={({ field }) => (
            <FormItem><FormLabel>New Password</FormLabel><FormControl><PasswordInput {...field} /></FormControl><PasswordStrength password={watchedResetPassword} /><FormMessage /></FormItem>
          )} />
          <FormField control={forgotPasswordResetForm.control} name="confirmPassword" render={({ field }) => (
            <FormItem><FormLabel>Confirm New Password</FormLabel><FormControl><PasswordInput {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <DialogFooter className="pt-4 flex-col gap-2">
            <Button type="submit" className="w-full" disabled={forgotPasswordResetForm.formState.isSubmitting}>Set New Password</Button>
            <Button type="button" variant="ghost" onClick={goBackToSignin} className="w-full text-muted-foreground">Cancel</Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );


  const renderContent = () => {
    switch(view) {
        case 'signin':
            return <SignInView />;
        case 'verify':
            return <VerificationView onVerify={handleVerify} />;
        case 'forgot-password-email':
            return <ForgotPasswordEmailView />;
        case 'forgot-password-otp':
             return <VerificationView onVerify={handleForgotPasswordOtp} />;
        case 'forgot-password-reset':
            return <ForgotPasswordResetView />;
        default:
            return <SignInView />;
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {renderContent()}

        <div className="p-4 bg-muted text-center">
            <p className="text-xs text-muted-foreground">
                Prototype only — accounts are stored locally on your device. Don’t use real passwords.
            </p>
            {isDemoMode && (
              <Button variant="link" size="sm" className="text-xs" onClick={handleSeedAndLogin}>
                  Seed Demo User
              </Button>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
