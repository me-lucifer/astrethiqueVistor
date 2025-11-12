
"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import QRCode from "qrcode.react";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import * as authLocal from "@/lib/authLocal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, Download } from "lucide-react";

interface TwoFactorModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

const otpSchema = z.object({
  code: z.string().length(6, "Please enter the 6-digit code."),
});

const recoverySchema = z.object({
  savedCodes: z.literal(true, {
    errorMap: () => ({ message: "You must save your recovery codes to continue." }),
  }),
});

const Step1Setup = ({ onVerify }: { onVerify: () => void }) => {
    const form = useForm({
        resolver: zodResolver(otpSchema),
        defaultValues: { code: '' },
    });

    const onSubmit = (data: z.infer<typeof otpSchema>) => {
        // In a real app, you'd verify the OTP against a service like TOTP
        // For this demo, any 6-digit code is accepted
        if (data.code === '123456') { // Demo validation
            onVerify();
        } else {
            form.setError("code", { message: "Invalid code. Please try again." });
        }
    }

    const otpAuthUrl = "otpauth://totp/Astrethique:demo@user.com?secret=JBSWY3DPEHPK3PXP&issuer=Astrethique";
    const manualCode = "JBSWY3DPEHPK3PXP";

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Scan this QR code with your authenticator app (e.g., Google Authenticator, Authy).
                </p>
                <div className="p-4 bg-white rounded-lg inline-block mx-auto">
                    <QRCode value={otpAuthUrl} size={160} />
                </div>
                 <p className="text-sm text-muted-foreground">
                    Or, enter this code manually: <strong className="font-mono text-foreground">{manualCode}</strong>
                </p>
                <FormField control={form.control} name="code" render={({ field }) => (
                    <FormItem>
                        <FormLabel>6-Digit Verification Code</FormLabel>
                        <FormControl><Input placeholder="123456" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <DialogFooter>
                    <Button type="submit">Verify</Button>
                </DialogFooter>
            </form>
        </Form>
    );
};

const Step2Recovery = ({ onComplete }: { onComplete: () => void }) => {
    const form = useForm({
        resolver: zodResolver(recoverySchema),
        defaultValues: { savedCodes: false },
    });

    const recoveryCodes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
    );
    
    const { toast } = useToast();

    const handleCopy = () => {
        navigator.clipboard.writeText(recoveryCodes.join("\n"));
        toast({ title: "Codes copied to clipboard." });
    };

    const handleDownload = () => {
        const blob = new Blob([recoveryCodes.join("\n")], { type: "text/plain;charset=utf-8" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "astrethique-recovery-codes.txt";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    };

    return (
        <Form {...form}>
             <form onSubmit={form.handleSubmit(onComplete)} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Save these codes somewhere safe. They can be used to log in if you lose access to your authenticator app. Each code can only be used once.
                </p>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 p-4 rounded-lg border font-mono text-sm">
                    {recoveryCodes.map(code => <div key={code}>{code}</div>)}
                </div>
                 <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={handleCopy}><Copy className="mr-2 h-4 w-4"/>Copy codes</Button>
                    <Button type="button" variant="outline" size="sm" onClick={handleDownload}><Download className="mr-2 h-4 w-4"/>Download</Button>
                </div>
                <FormField control={form.control} name="savedCodes" render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-4">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <FormLabel className="font-normal text-foreground">I have saved my recovery codes</FormLabel>
                        <FormMessage />
                    </FormItem>
                )} />
                <DialogFooter>
                    <Button type="submit" disabled={!form.formState.isValid}>Done</Button>
                </DialogFooter>
             </form>
        </Form>
    );
};


export function TwoFactorModal({ isOpen, onOpenChange, onSuccess }: TwoFactorModalProps) {
    const [step, setStep] = useState(1);
    const { toast } = useToast();

    const handleVerifySuccess = () => setStep(2);
    
    const handleComplete = () => {
        const user = authLocal.getCurrentUser();
        if (user) {
            authLocal.updateUser(user.id, { twoFactorEnabled: true });
        }
        toast({ title: "Two-Factor Authentication Enabled" });
        onSuccess();
    };

    const handleClose = (open: boolean) => {
        if (!open) {
            setTimeout(() => setStep(1), 300); // Reset on close
        }
        onOpenChange(open);
    };
    
    const titles = ["Enable Two-Factor Authentication", "Save Your Recovery Codes"];

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{titles[step - 1]}</DialogTitle>
                </DialogHeader>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {step === 1 && <Step1Setup onVerify={handleVerifySuccess} />}
                        {step === 2 && <Step2Recovery onComplete={handleComplete} />}
                    </motion.div>
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
