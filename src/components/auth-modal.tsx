
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
import * as storage from "@/lib/storage";
import PasswordStrength from "./auth/password-strength";

interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onLoginSuccess: () => void;
}

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

type SignInFormData = z.infer<typeof signInSchema>;


export function AuthModal({ isOpen, onOpenChange, onLoginSuccess }: AuthModalProps) {
  const { toast } = useToast();

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

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
    
    storage.createSession(user);
    toast({ title: `Welcome back, ${user.firstName}!` });
    onLoginSuccess();
    onOpenChange(false);
  }

  const handleClose = (open: boolean) => {
    if(!open) {
      setTimeout(() => {
        signInForm.reset();
      }, 300);
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
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
            <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4 px-6 pb-4">
                <FormField control={signInForm.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={signInForm.control} name="password" render={({ field }) => (
                <FormItem><FormLabel>Password</FormLabel><FormControl><PasswordInput {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="flex justify-between items-center">
                <FormField
                    control={signInForm.control}
                    name="rememberMe"
                    render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                        <Input type="checkbox" className="h-4 w-4" checked={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">Remember me</FormLabel>
                    </FormItem>
                    )}
                />
                <Button type="button" variant="link" className="p-0 h-auto text-sm" disabled>Forgot password?</Button>
                </div>
                <DialogFooter className="pt-4">
                <Button type="submit" className="w-full" disabled={signInForm.formState.isSubmitting}>Sign In</Button>
                </DialogFooter>
            </form>
        </Form>
        <div className="p-4 bg-muted text-center">
            <p className="text-xs text-muted-foreground">
                Prototype: accounts are stored locally on your device. Don’t use a real password.
            </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
