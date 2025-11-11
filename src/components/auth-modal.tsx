
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input, PasswordInput } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import * as storage from "@/lib/storage";
import PasswordStrength from "./auth/password-strength";

interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onLoginSuccess: () => void;
}

const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .refine((password) => /[a-zA-Z]/.test(password), { message: "Password must contain at least one letter" })
  .refine((password) => /[0-9]/.test(password), { message: "Password must contain at least one number" });

const createAccountSchema = z.object({
  role: z.enum(["visitor", "consultant"]),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  language: z.enum(["EN", "FR"]),
  timezone: z.string(),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms and privacy policy" }),
  }),
  is18OrOlder: z.literal(true, {
    errorMap: () => ({ message: "You must be 18 or older to register" }),
  }),
  marketingOptIn: z.boolean(),
});

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type CreateAccountFormData = z.infer<typeof createAccountSchema>;
type SignInFormData = z.infer<typeof signInSchema>;


export function AuthModal({ isOpen, onOpenChange, onLoginSuccess }: AuthModalProps) {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [role, setRole] = useState<'visitor' | 'consultant'>('visitor');
  const [defaultTimezone, setDefaultTimezone] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDefaultTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
  }, []);

  const createForm = useForm<CreateAccountFormData>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      role,
      fullName: "",
      email: "",
      password: "",
      language: language.toUpperCase() as "EN" | "FR",
      timezone: defaultTimezone,
      agreeToTerms: false,
      is18OrOlder: false,
      marketingOptIn: false,
    },
  });
  
   useEffect(() => {
    createForm.setValue("timezone", defaultTimezone);
  }, [defaultTimezone, createForm]);

  useEffect(() => {
    createForm.setValue("role", role);
  }, [role, createForm]);

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });
  
  const watchedPassword = useWatch({
    control: createForm.control,
    name: "password"
  });

  async function handleCreateAccount(values: CreateAccountFormData) {
    if (storage.findUserByEmail(values.email)) {
      createForm.setError("email", { type: "manual", message: "An account with this email already exists." });
      return;
    }

    const passwordHash = await storage.hashPassword(values.password);
    const userId = storage.createId('user');
    
    const newUser: storage.User = {
      id: userId,
      role: values.role,
      name: values.fullName,
      email: values.email,
      passwordHash,
      createdAt: new Date().toISOString(),
      emailVerified: false,
      kycStatus: values.role === "consultant" ? "pending" : "n/a",
    };
    
    const users = storage.getUsers();
    storage.saveUsers([...users, newUser]);

    // Create default records
    const prefs = storage.getStorageItem<Record<string, storage.Preferences>>('ast_prefs') || {};
    prefs[userId] = { language: values.language, timezone: values.timezone, marketingOptIn: values.marketingOptIn };
    storage.setStorageItem('ast_prefs', prefs);
    
    const wallets = storage.getStorageItem<Record<string, storage.Wallet>>('ast_wallets') || {};
    wallets[userId] = { balance: 0, currency: '€' };
    storage.setStorageItem('ast_wallets', wallets);

    const favorites = storage.getStorageItem<Record<string, storage.Favorites>>('ast_favorites') || {};
    favorites[userId] = { consultants: [], content: [], conferences: [] };
    storage.setStorageItem('ast_favorites', favorites);
    
    storage.setCurrentUser(userId);

    toast({ title: "Account created!", description: "You are now logged in." });
    onLoginSuccess();
    onOpenChange(false);
  }

  async function handleSignIn(values: SignInFormData) {
    const user = storage.findUserByEmail(values.email);
    if (!user) {
        signInForm.setError("email", { type: "manual", message: "No account found with this email." });
        return;
    }
    
    const passwordHash = await storage.hashPassword(values.password);
    if (user.passwordHash !== passwordHash) {
        signInForm.setError("password", { type: "manual", message: "Incorrect password." });
        return;
    }
    
    storage.setCurrentUser(user.id);
    toast({ title: `Welcome back, ${user.name}!` });
    onLoginSuccess();
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <Tabs defaultValue="create" className="w-full">
          <DialogHeader>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create Account</TabsTrigger>
              <TabsTrigger value="signin">Sign In</TabsTrigger>
            </TabsList>
          </DialogHeader>
          
          <TabsContent value="create">
            <DialogTitle className="sr-only">Create Account</DialogTitle>
            <div className="p-1 rounded-md bg-muted mb-4 grid grid-cols-2 text-center">
              <Button variant={role === 'visitor' ? 'background' : 'ghost'} onClick={() => setRole('visitor')} size="sm">Visitor</Button>
              <Button variant={role === 'consultant' ? 'background' : 'ghost'} onClick={() => setRole('consultant')} size="sm">Consultant</Button>
            </div>

            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(handleCreateAccount)} className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
                 <FormField control={createForm.control} name="fullName" render={({ field }) => (
                  <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Your full name" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={createForm.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={createForm.control} name="password" render={({ field }) => (
                  <FormItem><FormLabel>Password</FormLabel><FormControl><PasswordInput {...field} /></FormControl><PasswordStrength password={watchedPassword} /><FormMessage /></FormItem>
                )} />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={createForm.control} name="language" render={({ field }) => (
                    <FormItem><FormLabel>Language</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="EN">English</SelectItem><SelectItem value="FR">Français</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                  )} />
                  <FormField control={createForm.control} name="timezone" render={({ field }) => (
                    <FormItem><FormLabel>Timezone</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value={defaultTimezone}>{defaultTimezone}</SelectItem><SelectItem value="Europe/London">Europe/London</SelectItem><SelectItem value="America/New_York">America/New_York</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                  )} />
                </div>

                <FormField control={createForm.control} name="agreeToTerms" render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>I agree to the <Link href="/legal-hub/terms-of-service" target="_blank" className="text-primary hover:underline">Terms</Link> and <Link href="/legal-hub/privacy-policy" target="_blank" className="text-primary hover:underline">Privacy Policy</Link>.</FormLabel><FormMessage /></div></FormItem>
                )} />
                <FormField control={createForm.control} name="is18OrOlder" render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>I confirm I am 18 years of age or older.</FormLabel><FormMessage /></div></FormItem>
                )} />
                <FormField control={createForm.control} name="marketingOptIn" render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Send me tips and updates (optional).</FormLabel></div></FormItem>
                )} />

                <DialogFooter className="pt-4 sticky bottom-0 bg-background/90 backdrop-blur-sm">
                  <Button type="submit" className="w-full" disabled={createForm.formState.isSubmitting}>Create Account</Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="signin">
             <DialogTitle className="sr-only">Sign In</DialogTitle>
             <Form {...signInForm}>
              <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                <FormField control={signInForm.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={signInForm.control} name="password" render={({ field }) => (
                  <FormItem><FormLabel>Password</FormLabel><FormControl><PasswordInput {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full" disabled={signInForm.formState.isSubmitting}>Sign In</Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
