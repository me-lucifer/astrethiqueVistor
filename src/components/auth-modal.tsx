
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
import { CheckCircle, MailCheck, KeyRound, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";


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


type CreateAccountFormData = z.infer<typeof createAccountSchema>;
type SignInFormData = z.infer<typeof signInSchema>;
type VerificationFormData = z.infer<typeof verificationSchema>;
type ForgotPasswordEmailFormData = z.infer<typeof forgotPasswordEmailSchema>;
type ForgotPasswordResetFormData = z.infer<typeof forgotPasswordResetSchema>;

type AuthView = 'tabs' | 'verify' | 'forgot-password-email' | 'forgot-password-otp' | 'forgot-password-reset';

export function AuthModal({ isOpen, onOpenChange, onLoginSuccess }: AuthModalProps) {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [view, setView] = useState<AuthView>('tabs');
  const [activeTab, setActiveTab] = useState("create");
  const [tempUserEmail, setTempUserEmail] = useState<string | null>(null);
  const [defaultTimezone, setDefaultTimezone] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDefaultTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
  }, []);

  const createForm = useForm<CreateAccountFormData>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      fullName: "", email: "", password: "",
      language: language.toUpperCase() as "EN" | "FR",
      timezone: '', agreeToTerms: false, is18OrOlder: false, marketingOptIn: false,
    },
  });
  
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


  useEffect(() => {
    if (defaultTimezone) {
      createForm.setValue("timezone", defaultTimezone);
    }
  }, [defaultTimezone, createForm]);

  const watchedCreatePassword = useWatch({ control: createForm.control, name: "password" });
  const watchedResetPassword = useWatch({ control: forgotPasswordResetForm.control, name: "password" });
  const watchedAgreeToTerms = useWatch({ control: createForm.control, name: "agreeToTerms" });
  const watchedIs18OrOlder = useWatch({ control: createForm.control, name: "is18OrOlder" });

  async function handleCreateAccount(values: CreateAccountFormData) {
    if (storage.findUserByEmail(values.email)) {
      createForm.setError("email", { type: "manual", message: "An account with this email already exists." });
      return;
    }

    const passwordHash = await storage.hashPassword(values.password);
    const user: storage.User = {
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
    storage.saveUsers([...users, user]);
    
    const prefs = storage.getStorageItem<Record<string, storage.Preferences>>('ast_prefs') || {};
    prefs[user.id] = { language: values.language, timezone: values.timezone, marketingOptIn: values.marketingOptIn };
    storage.setStorageItem(KEYS.PREFERENCES, prefs);
    
    const favorites = storage.getStorageItem<Record<string, storage.Favorites>>(KEYS.FAVORITES) || {};
    favorites[user.id] = { consultants: [], content: [], conferences: [] };
    storage.setStorageItem(KEYS.FAVORITES, favorites);

    const wallets = storage.getStorageItem<Record<string, storage.Wallet>>(KEYS.WALLETS) || {};
    wallets[user.id] = { balance: 0, currency: '€' };
    storage.setStorageItem(KEYS.WALLETS, wallets);

    storage.trackMetric('registrations.visitor');
    setTempUserEmail(user.email);
    setView('verify');
  }

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
    storage.trackMetric('logins');
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
    const firstName = user.name.split(' ')[0];
    toast({ title: `Welcome, ${firstName}!` });

    onLoginSuccess();
    onOpenChange(false);
    setView('tabs');
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
    setView('tabs');
    setActiveTab('signin');
    signInForm.setValue('email', tempUserEmail);
    signInForm.setValue('password', '');
    setTempUserEmail(null);
  };

  const handleClose = (open: boolean) => {
    if(!open) {
      setTimeout(() => {
        setView('tabs');
        createForm.reset();
        signInForm.reset();
        verificationForm.reset();
        forgotPasswordEmailForm.reset();
        forgotPasswordResetForm.reset();
      }, 300);
    }
    onOpenChange(open);
  }
  
  const goBackToTabs = () => {
    setView('tabs');
    setTempUserEmail(null);
  }

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
                        <Button type="button" variant="ghost" onClick={goBackToTabs} className="w-full text-muted-foreground flex items-center gap-2">
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
                    <Button type="button" variant="ghost" onClick={goBackToTabs} className="w-full text-muted-foreground">Cancel</Button>
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
            <Button type="button" variant="ghost" onClick={goBackToTabs} className="w-full text-muted-foreground">Cancel</Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );


  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {view === 'tabs' && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <DialogHeader>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create">Create Account</TabsTrigger>
                <TabsTrigger value="signin">Sign In</TabsTrigger>
              </TabsList>
            </DialogHeader>
            
            <TabsContent value="create">
              <DialogTitle className="sr-only">Create Account</DialogTitle>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(handleCreateAccount)} className="space-y-4 max-h-[60vh] overflow-y-auto px-6 py-4">
                    <FormField control={createForm.control} name="fullName" render={({ field }) => (
                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Your full name" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={createForm.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={createForm.control} name="password" render={({ field }) => (
                    <FormItem><FormLabel>Password</FormLabel><FormControl><PasswordInput {...field} /></FormControl><PasswordStrength password={watchedCreatePassword} /><FormMessage /></FormItem>
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
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>I agree to the <Link href="/legal-hub/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Terms</Link> and <Link href="/legal-hub/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy</Link>.</FormLabel><FormMessage /></div></FormItem>
                  )} />
                  <FormField control={createForm.control} name="is18OrOlder" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>I confirm I am 18 years of age or older.</FormLabel><FormMessage /></div></FormItem>
                  )} />
                  <FormField control={createForm.control} name="marketingOptIn" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Send me tips and updates (optional).</FormLabel></div></FormItem>
                  )} />
                  
                  <DialogFooter className="pt-4 sticky bottom-0 bg-background/90 backdrop-blur-sm">
                    <Button type="submit" className="w-full" disabled={createForm.formState.isSubmitting || !watchedAgreeToTerms || !watchedIs18OrOlder}>Create Account</Button>
                  </DialogFooter>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="signin">
                <DialogTitle className="sr-only">Sign In</DialogTitle>
                <Form {...signInForm}>
                <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4 px-6 py-4">
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
            </TabsContent>
          </Tabs>
        )}

        {view === 'verify' && <VerificationView onVerify={handleVerify} />}
        {view === 'forgot-password-email' && <ForgotPasswordEmailView />}
        {view === 'forgot-password-otp' && <VerificationView onVerify={handleForgotPasswordOtp} />}
        {view === 'forgot-password-reset' && <ForgotPasswordResetView />}


        {view === 'tabs' && (
          <div className="p-4 bg-muted text-center">
              <p className="text-xs text-muted-foreground">
                  Prototype only — accounts are stored locally on your device (no server). Don’t use real passwords.
              </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

const KEYS = {
    USERS: 'ast_users',
    CURRENT_USER_ID: 'ast_currentUserId',
    PREFERENCES: 'ast_prefs',
    FAVORITES: 'ast_favorites',
    WALLETS: 'ast_wallets',
    COMMENTS: 'ast_comments',
    METRICS: 'ast_metrics',
};

      