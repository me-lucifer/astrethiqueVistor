
"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, PasswordInput } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import * as authLocal from "@/lib/authLocal";
import PasswordStrength from "./auth/password-strength";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onLoginSuccess?: () => void;
}

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const forgotPasswordEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const forgotPasswordOtpSchema = z.object({
  otp: z.string().length(6, "Please enter the 6-digit code."),
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
});

type SignInFormData = z.infer<typeof signInSchema>;
type ForgotPasswordEmailFormData = z.infer<typeof forgotPasswordEmailSchema>;
type ForgotPasswordOtpFormData = z.infer<typeof forgotPasswordOtpSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;


export function AuthModal({ isOpen, onOpenChange, onLoginSuccess }: AuthModalProps) {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [view, setView] = useState<'signIn' | 'forgotPassword_email' | 'forgotPassword_otp' | 'forgotPassword_reset'>('signIn');
  const [resetEmail, setResetEmail] = useState('');
  const [isPending, startTransition] = useTransition();

  const isDemoMode = searchParams.get('demo') === '1';

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const forgotPasswordEmailForm = useForm<ForgotPasswordEmailFormData>({
    resolver: zodResolver(forgotPasswordEmailSchema),
  });
  
  const forgotPasswordOtpForm = useForm<ForgotPasswordOtpFormData>({
    resolver: zodResolver(forgotPasswordOtpSchema),
  });

  const resetPasswordForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const handleSeedAndLogin = async () => {
      let user = authLocal.findUserByEmail("demo@local");
      if (!user) {
          user = await authLocal.registerVisitor({
              firstName: "Demo",
              lastName: "Visitor",
              email: "demo@local",
              password: "Demo1234",
              language: "EN",
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              marketingOptIn: false,
          });
          authLocal.updateUser({...user, emailVerified: true});
      }

      authLocal.createSession(user);
      toast({ title: `Welcome back, Demo!` });
      if (onLoginSuccess) onLoginSuccess();
      onOpenChange(false);
  }

  function handleSignIn(values: SignInFormData) {
    startTransition(async () => {
      try {
        const user = await authLocal.login(values.email, values.password);
        toast({ title: `Welcome back, ${user.firstName}!` });
        if (onLoginSuccess) onLoginSuccess();
        handleClose(false);
      } catch (error: any) {
        if (error.message.includes("email")) {
            signInForm.setError("email", { type: "manual", message: error.message });
        } else if (error.message.includes("password")) {
             signInForm.setError("password", { type: "manual", message: error.message });
        } else {
             toast({ variant: "destructive", title: "Sign in failed", description: error.message });
        }
      }
    });
  }
  
  const handleRequestOtp = (values: ForgotPasswordEmailFormData) => {
    const user = authLocal.findUserByEmail(values.email);
    if (!user) {
        forgotPasswordEmailForm.setError("email", { message: "No account found with this email." });
        return;
    }
    setResetEmail(values.email);
    setView('forgotPassword_otp');
  };

  const handleVerifyOtp = (values: ForgotPasswordOtpFormData) => {
    if (values.otp !== '123456') {
        forgotPasswordOtpForm.setError("otp", { message: "Invalid code. Please try again." });
        return;
    }
    setView('forgotPassword_reset');
  };

  const handleResetPassword = async (values: ResetPasswordFormData) => {
    const user = authLocal.findUserByEmail(resetEmail);
    if (!user) {
        toast({ variant: 'destructive', title: 'Something went wrong. Please try again.' });
        setView('signIn');
        return;
    }
    await authLocal.changePassword(user.id, null, values.newPassword, true);
    toast({ title: "Password updated successfully." });
    setView('signIn');
  };


  const handleClose = (open: boolean) => {
    if(!open) {
      setTimeout(() => {
        signInForm.reset();
        forgotPasswordEmailForm.reset();
        forgotPasswordOtpForm.reset();
        resetPasswordForm.reset();
        setView('signIn');
      }, 300);
    }
    onOpenChange(open);
  }

  const renderContent = () => {
    switch (view) {
        case 'forgotPassword_email':
            return (
                <>
                <DialogHeader>
                    <DialogTitle>Forgot Password</DialogTitle>
                    <DialogDescription>Enter your email to receive a reset code.</DialogDescription>
                </DialogHeader>
                <Form {...forgotPasswordEmailForm}>
                    <form onSubmit={forgotPasswordEmailForm.handleSubmit(handleRequestOtp)} className="space-y-4">
                        <FormField control={forgotPasswordEmailForm.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <DialogFooter className="pt-4 flex-col sm:flex-col sm:space-x-0 gap-2">
                           <Button type="submit" disabled={isPending}>Send Reset Code</Button>
                           <Button variant="ghost" onClick={() => setView('signIn')}>Back to Sign In</Button>
                        </DialogFooter>
                    </form>
                </Form>
                </>
            );
        case 'forgotPassword_otp':
             return (
                <>
                <DialogHeader>
                    <DialogTitle>Enter Code</DialogTitle>
                    <DialogDescription>A 6-digit code has been sent to {resetEmail}.</DialogDescription>
                </DialogHeader>
                <Alert><AlertDescription>For this demo, the code is: <strong className="text-foreground">123456</strong></AlertDescription></Alert>
                <Form {...forgotPasswordOtpForm}>
                    <form onSubmit={forgotPasswordOtpForm.handleSubmit(handleVerifyOtp)} className="space-y-4">
                        <FormField control={forgotPasswordOtpForm.control} name="otp" render={({ field }) => (
                            <FormItem><FormLabel>6-Digit Code</FormLabel><FormControl><Input placeholder="123456" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <DialogFooter className="pt-4 flex-col sm:flex-col sm:space-x-0 gap-2">
                           <Button type="submit" disabled={isPending}>Verify Code</Button>
                           <Button variant="ghost" onClick={() => setView('forgotPassword_email')}>Back</Button>
                        </DialogFooter>
                    </form>
                </Form>
                </>
            );
        case 'forgotPassword_reset':
            const newPassword = resetPasswordForm.watch('newPassword');
            return (
                <>
                <DialogHeader>
                    <DialogTitle>Set New Password</DialogTitle>
                    <DialogDescription>Choose a new, strong password.</DialogDescription>
                </DialogHeader>
                <Form {...resetPasswordForm}>
                    <form onSubmit={resetPasswordForm.handleSubmit(handleResetPassword)} className="space-y-4">
                        <FormField control={resetPasswordForm.control} name="newPassword" render={({ field }) => (
                            <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl><PasswordInput {...field} /></FormControl>
                                <PasswordStrength password={newPassword} />
                                <FormMessage />
                            </FormItem>
                        )} />
                        <DialogFooter className="pt-4">
                           <Button type="submit" className="w-full" disabled={isPending}>Save New Password</Button>
                        </DialogFooter>
                    </form>
                </Form>
                </>
            );
        case 'signIn':
        default:
            return (
                <>
                <DialogHeader>
                    <DialogTitle>Sign In</DialogTitle>
                    <DialogDescription>
                    Don't have an account?{' '}
                    <Button asChild variant="link" className="p-0 h-auto">
                        <Link href="/register">Create one</Link>
                    </Button>
                    </DialogDescription>
                </DialogHeader>
                <Form {...signInForm}>
                    <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                    <FormField control={signInForm.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={signInForm.control} name="password" render={({ field }) => (
                        <FormItem>
                            <div className="flex justify-between items-center">
                                <FormLabel>Password</FormLabel>
                                <Button type="button" variant="link" className="p-0 h-auto text-xs" onClick={() => setView('forgotPassword_email')}>Forgot password?</Button>
                            </div>
                            <FormControl><PasswordInput {...field} /></FormControl><FormMessage />
                        </FormItem>
                    )} />
                    <DialogFooter className="pt-4 flex-col sm:flex-col sm:space-x-0 gap-2">
                        <Button type="submit" className="w-full" disabled={isPending}>Sign In</Button>
                        {isDemoMode && <Button variant="secondary" className="w-full" onClick={handleSeedAndLogin}>Seed Demo User</Button>}
                    </DialogFooter>
                    </form>
                </Form>
                <p className="text-xs text-muted-foreground text-center">
                    Prototype: accounts are stored locally on your device. Don’t use a real password.
                </p>
                </>
            );
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
