
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

interface ChangeEmailModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    currentUser: authLocal.User;
    onSuccess: (newEmail: string) => void;
}

const changeEmailSchema = z.object({
  newEmail: z.string().email("Please enter a valid email address."),
  currentPassword: z.string().min(1, "Please enter your current password."),
});

type ChangeEmailFormData = z.infer<typeof changeEmailSchema>;

export function ChangeEmailModal({ isOpen, onOpenChange, currentUser, onSuccess }: ChangeEmailModalProps) {
  const { toast } = useToast();
  const form = useForm<ChangeEmailFormData>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { newEmail: '', currentPassword: '' },
    mode: 'onChange'
  });
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  }

  const handleSubmit = async (data: ChangeEmailFormData) => {
    // 1. Verify current password
    try {
      await authLocal.login(currentUser.email, data.currentPassword);
    } catch (error) {
      form.setError("currentPassword", { message: "Your current password does not match." });
      return;
    }
    
    // 2. Check if new email is already in use
    if (authLocal.emailExists(data.newEmail)) {
        form.setError("newEmail", { message: "This email address is already in use." });
        return;
    }

    // 3. For this demo, we'll simulate sending a link and call the success handler.
    // In a real app, you would generate a token, send an email, and handle verification on a separate page.
    
    toast({
        title: "Verification Email Sent",
        description: `A confirmation link has been sent to ${data.newEmail}.`
    });
    
    onSuccess(data.newEmail);
  };
  
  const { formState } = form;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Email</DialogTitle>
          <DialogDescription>
            A verification link will be sent to your new email address to confirm the change.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                 <FormField control={form.control} name="newEmail" render={({ field }) => (
                    <FormItem>
                        <FormLabel>New Email</FormLabel>
                        <FormControl><Input placeholder="new.email@example.com" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="currentPassword" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl><PasswordInput placeholder="Enter your current password" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                 <DialogFooter className="pt-4">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={formState.isSubmitting}>Send Verification Link</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
