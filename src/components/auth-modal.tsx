
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onLoginSuccess?: () => void;
}

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignInFormData = z.infer<typeof signInSchema>;

export function AuthModal({ isOpen, onOpenChange, onLoginSuccess }: AuthModalProps) {
  const { toast } = useToast();
  const [view, setView] = useState('signIn'); // signIn, forgotPassword_email, forgotPassword_otp, forgotPassword_new
  const [resetEmail, setResetEmail] = useState('');
  const [isPending, startTransition] = React.useTransition();

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  async function handleSignIn(values: SignInFormData) {
    const user = authLocal.findUserByEmail(values.email);
    if (!user) {
        signInForm.setError("email", { type: "manual", message: "No account found with this email." });
        return;
    }
    
    const passwordMatches = (await authLocal.hashPassword(values.password)) === user.passwordHash;
    if (!passwordMatches) {
        signInForm.setError("password", { type: "manual", message: "Incorrect password." });
        return;
    }
    
    authLocal.createSession(user);
    toast({ title: `Welcome back, ${user.firstName}!` });
    if (onLoginSuccess) onLoginSuccess();
    handleClose(false);
  }

  const handleClose = (open: boolean) => {
    if(!open) {
      setTimeout(() => {
        signInForm.reset();
        setView('signIn');
        setResetEmail('');
      }, 300);
    }
    onOpenChange(open);
  }
  
  const handleForgotEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = signInForm.getValues('email') || (e.currentTarget as HTMLFormElement).email.value;
    if (!email) {
      toast({ variant: 'destructive', title: 'Please enter an email address.' });
      return;
    }
    if (authLocal.emailExists(email)) {
      setResetEmail(email);
      setView('forgotPassword_otp');
    } else {
      toast({ variant: 'destructive', title: 'No account found with that email.' });
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otp = (e.currentTarget as HTMLFormElement).otp.value;
    if (otp === '123456') {
      setView('forgotPassword_new');
    } else {
      toast({ variant: 'destructive', title: 'Invalid code. Please try again.' });
    }
  };

  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newPassword = (e.currentTarget as HTMLFormElement).newPassword.value;
    // Simple validation for demo
    if (newPassword.length < 8) {
        toast({ variant: 'destructive', title: 'Password must be at least 8 characters.'});
        return;
    }
    
    const user = authLocal.findUserByEmail(resetEmail);
    if (user) {
        const newPasswordHash = await authLocal.hashPassword(newPassword);
        authLocal.updateUser({ ...user, passwordHash: newPasswordHash });
        toast({ title: 'Password successfully reset.' });
        setView('signIn');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {view === 'signIn' && (
          <>
            <DialogHeader className="p-6 pb-2">
                <DialogTitle>Sign In</DialogTitle>
                <DialogDescription>
                    Don't have an account?{' '}
                    <Button asChild variant="link" className="p-0 h-auto">
                        <Link href="/register">Create one</Link>
                    </Button>
                </DialogDescription>
            </DialogHeader>
            <Form {...signInForm}>
                <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4 px-6 pb-4">
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
                    <DialogFooter className="pt-4">
                      <Button type="submit" className="w-full" disabled={signInForm.formState.isSubmitting}>Sign In</Button>
                    </DialogFooter>
                </form>
            </Form>
          </>
        )}
        
        {view === 'forgotPassword_email' && (
           <form onSubmit={handleForgotEmailSubmit}>
              <DialogHeader className="p-6 pb-2">
                <DialogTitle>Forgot Password</DialogTitle>
                <DialogDescription>Enter your email to receive a reset code.</DialogDescription>
              </DialogHeader>
              <div className="px-6 space-y-4">
                  <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" name="email" type="email" placeholder="you@example.com" required />
                  </div>
              </div>
              <DialogFooter className="p-6 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setView('signIn')}>Back to Sign In</Button>
                  <Button type="submit">Send Code</Button>
              </DialogFooter>
          </form>
        )}

        {view === 'forgotPassword_otp' && (
           <form onSubmit={handleOtpSubmit}>
              <DialogHeader className="p-6 pb-2">
                <DialogTitle>Enter Code</DialogTitle>
                <DialogDescription>A code has been sent to {resetEmail}.</DialogDescription>
              </DialogHeader>
              <div className="px-6 space-y-4">
                  <Alert>
                    <AlertDescription>For this demo, the code is: <strong>123456</strong></AlertDescription>
                  </Alert>
                  <div className="space-y-2">
                      <Label htmlFor="otp">Verification Code</Label>
                      <Input id="otp" name="otp" type="text" inputMode="numeric" maxLength={6} required />
                  </div>
              </div>
              <DialogFooter className="p-6 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setView('forgotPassword_email')}>Back</Button>
                  <Button type="submit">Verify</Button>
              </DialogFooter>
          </form>
        )}
        
        {view === 'forgotPassword_new' && (
           <form onSubmit={handleNewPasswordSubmit}>
              <DialogHeader className="p-6 pb-2">
                <DialogTitle>Set New Password</DialogTitle>
                <DialogDescription>Choose a new, strong password.</DialogDescription>
              </DialogHeader>
              <div className="px-6 space-y-4">
                  <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <PasswordInput id="newPassword" name="newPassword" required />
                  </div>
              </div>
              <DialogFooter className="p-6 pt-4">
                  <Button type="submit">Save New Password</Button>
              </DialogFooter>
          </form>
        )}
        
        <div className="p-4 bg-muted text-center">
            <p className="text-xs text-muted-foreground">
                Prototype: accounts are stored locally on your device. Don’t use a real password.
            </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
