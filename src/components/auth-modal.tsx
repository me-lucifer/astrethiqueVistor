
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
import { CheckCircle, MailCheck, Rocket } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onLoginSuccess: () => void;
}

type View = 'auth' | 'verify' | 'success';

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
  timezone: z.string().min(1, "Please select your timezone"),
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

const verifySchema = z.object({
  code: z.string().length(6, "Code must be 6 digits"),
});

type CreateAccountFormData = z.infer<typeof createAccountSchema>;
type SignInFormData = z.infer<typeof signInSchema>;
type VerifyFormData = z.infer<typeof verifySchema>;

export function AuthModal({ isOpen, onOpenChange, onLoginSuccess }: AuthModalProps) {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [view, setView] = useState<View>('auth');
  const [role, setRole] = useState<'visitor' | 'consultant'>('visitor');
  const [defaultTimezone, setDefaultTimezone] = useState('');
  const [verifyingUser, setVerifyingUser] = useState<storage.User | null>(null);

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
      timezone: '',
      agreeToTerms: false,
      is18OrOlder: false,
      marketingOptIn: false,
    },
  });
  
  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const verifyForm = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: "" }
  });
  
  useEffect(() => {
    if (defaultTimezone) {
      createForm.setValue("timezone", defaultTimezone);
    }
  }, [defaultTimezone, createForm]);

  useEffect(() => {
    createForm.setValue("role", role);
  }, [role, createForm]);

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
    
    setVerifyingUser(newUser);

    // Don't save to storage yet, wait for email verification
    setView('verify');
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
    handleCloseModal(false);
  }

  function handleVerify(values: VerifyFormData) {
    const DEMO_CODE = "123456";
    if (values.code !== DEMO_CODE) {
        verifyForm.setError("code", { type: "manual", message: "Incorrect code." });
        return;
    }
    
    if (!verifyingUser) {
        toast({ variant: 'destructive', title: 'Something went wrong. Please try again.' });
        setView('auth');
        return;
    }

    const verifiedUser = { ...verifyingUser, emailVerified: true };
    
    // Now save the user to storage
    const users = storage.getUsers();
    storage.saveUsers([...users, verifiedUser]);

    const prefs = storage.getStorageItem<Record<string, storage.Preferences>>('ast_prefs') || {};
    prefs[verifiedUser.id] = { language: language.toUpperCase() as "EN" | "FR", timezone: createForm.getValues('timezone'), marketingOptIn: createForm.getValues('marketingOptIn') };
    storage.setStorageItem('ast_prefs', prefs);
    
    const wallets = storage.getStorageItem<Record<string, storage.Wallet>>('ast_wallets') || {};
    wallets[verifiedUser.id] = { balance: 0, currency: '€' };
    storage.setStorageItem('ast_wallets', wallets);

    const favorites = storage.getStorageItem<Record<string, storage.Favorites>>('ast_favorites') || {};
    favorites[verifiedUser.id] = { consultants: [], content: [], conferences: [] };
    storage.setStorageItem('ast_favorites', favorites);
    
    storage.setCurrentUser(verifiedUser.id);

    setView('success');
  }
  
  const handleCloseModal = (open: boolean) => {
    if (!open) {
      setTimeout(() => {
        setView('auth');
        setVerifyingUser(null);
        createForm.reset();
        signInForm.reset();
        verifyForm.reset();
      }, 300);
    }
    onOpenChange(open);
  }
  
  const handleStartOnboarding = () => {
    // For now, this just logs and closes. In future, it will navigate.
    console.log("Navigating to consultant onboarding...");
    toast({title: "Redirecting to consultant onboarding..."});
    handleCloseModal(false);
    onLoginSuccess();
  }
  
  const handleFinishVisitor = () => {
    handleCloseModal(false);
    onLoginSuccess();
  }


  const renderAuthView = () => (
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
                  <FormItem><FormLabel>Timezone</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value={defaultTimezone}>{defaultTimezone.replace(/_/g, " ")}</SelectItem><SelectItem value="Europe/London">Europe/London</SelectItem><SelectItem value="America/New_York">America/New_York</SelectItem></SelectContent></Select><FormMessage /></FormItem>
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
  );

  const renderVerifyView = () => (
    <>
      <DialogHeader className="text-center">
        <DialogTitle>Verify your email</DialogTitle>
        <DialogDescription>
          We've sent a code to {verifyingUser?.email}.
          <span className="mt-2 block text-xs text-muted-foreground">For this demo, your code is: 123456</span>
        </DialogDescription>
      </DialogHeader>
      <Form {...verifyForm}>
        <form onSubmit={verifyForm.handleSubmit(handleVerify)} className="space-y-4">
           <FormField control={verifyForm.control} name="code" render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Verification Code</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="123456" 
                    {...field} 
                    className="text-center text-lg tracking-[0.5em]"
                    maxLength={6}
                   />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="submit" className="w-full" disabled={verifyForm.formState.isSubmitting}>Verify</Button>
            </DialogFooter>
        </form>
      </Form>
    </>
  );

  const renderSuccessView = () => {
    const isConsultant = verifyingUser?.role === 'consultant';
    return (
      <div className="text-center p-4">
        <div className="flex justify-center mb-4">
          {isConsultant ? (
            <Rocket className="w-12 h-12 text-primary" />
          ) : (
            <CheckCircle className="w-12 h-12 text-success" />
          )}
        </div>
        <DialogHeader>
          <DialogTitle>
            {isConsultant ? "Let's finish your profile" : "Account ready!"}
          </DialogTitle>
          <DialogDescription>
            {isConsultant 
              ? "Your account is verified. The next step is to complete your consultant profile to start offering sessions." 
              : "Your account is verified and ready to use."
            }
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6">
          {isConsultant ? (
            <Button onClick={handleStartOnboarding} className="w-full">Start onboarding</Button>
          ) : (
            <Button onClick={handleFinishVisitor} className="w-full">Get Started</Button>
          )}
        </DialogFooter>
      </div>
    );
  };


  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="sm:max-w-md p-6">
        {view === 'auth' && renderAuthView()}
        {view === 'verify' && renderVerifyView()}
        {view === 'success' && renderSuccessView()}
      </DialogContent>
    </Dialog>
  );
}
