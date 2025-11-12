
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import * as authLocal from '@/lib/authLocal';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input, PasswordInput } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import PasswordStrength from '../auth/password-strength';
import { useTransition } from 'react';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    currentUser: authLocal.User;
    onSuccess: () => void;
}

const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .refine((password) => /[a-zA-Z]/.test(password), { message: "Password must contain at least one letter" })
  .refine((password) => /[0-9]/.test(password), { message: "Password must contain at least one number" });

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Please enter your current password."),
  newPassword: passwordSchema,
  confirmNewPassword: z.string()
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "New passwords do not match.",
  path: ["confirmNewPassword"],
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export function ChangePasswordModal({ isOpen, onOpenChange, currentUser, onSuccess }: ChangePasswordModalProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' },
    mode: 'onChange'
  });
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  }

  const handleSubmit = (data: ChangePasswordFormData) => {
    startTransition(async () => {
        try {
            await authLocal.changePassword(currentUser.id, data.currentPassword, data.newPassword);
            onSuccess();
        } catch (error: any) {
            form.setError("currentPassword", { message: "Your current password does not match." });
        }
    });
  };
  
  const { formState, watch } = form;
  const newPasswordValue = watch("newPassword");

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Choose a new, strong password for your account.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField control={form.control} name="currentPassword" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl><PasswordInput placeholder="Enter your current password" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="newPassword" render={({ field }) => (
                    <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl><PasswordInput {...field} /></FormControl>
                        <PasswordStrength password={newPasswordValue} />
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="confirmNewPassword" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl><PasswordInput {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                 <DialogFooter className="pt-4">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isPending || !formState.isValid}>Update Password</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
