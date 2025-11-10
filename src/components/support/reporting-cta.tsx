
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const reportSchema = z.object({
    url: z.string().url("Please enter a valid URL."),
    reason: z.string().min(1, "Please select a reason."),
    details: z.string().min(10, "Please provide at least 10 characters.").max(500),
    email: z.string().email("Please enter a valid email address.").optional().or(z.literal('')),
});

type ReportFormData = z.infer<typeof reportSchema>;

interface ReportModalProps {
    type: 'content' | 'consultant';
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

const ReportModal = ({ type, isOpen, onOpenChange }: ReportModalProps) => {
    const { toast } = useToast();
    const form = useForm<ReportFormData>({
        resolver: zodResolver(reportSchema),
        defaultValues: { url: "", reason: "", details: "", email: "" },
    });
    
    const reasonOptions = type === 'content'
        ? ["Spam or Misleading", "Inappropriate Content", "Copyright Infringement", "Other"]
        : ["Unprofessional Behavior", "Inappropriate Conduct", "Misleading Profile", "Scam or Fraud", "Other"];

    const onSubmit = (data: ReportFormData) => {
        const adminEmail = "support@astrethique.com";
        const mailtoSubject = `[AST Report] ${type === 'content' ? 'Content' : 'Consultant'}`;
        const mailtoBody = `
URL: ${data.url}
Reason: ${data.reason}
Details: ${data.details}
Reporting Email: ${data.email || 'Anonymous'}
        `;

        const mailtoLink = `mailto:${adminEmail}?subject=${encodeURIComponent(mailtoSubject)}&body=${encodeURIComponent(mailtoBody)}`;
        window.location.href = mailtoLink;

        toast({ title: "Report submitted", description: "Thank you, we've prepared an email for you to send." });
        onOpenChange(false);
        form.reset();
    };
    
    const onInvalid = () => {
        toast({
            variant: "destructive",
            title: "Please fix the form errors before submitting.",
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Report {type === 'content' ? 'Content' : 'a Consultant'}</DialogTitle>
                    <DialogDescription>Your report is anonymous unless you provide your email. Please provide as much detail as possible.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-4">
                        <FormField control={form.control} name="url" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{type === 'content' ? 'Content URL' : 'Consultant Profile URL'}</FormLabel>
                                <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="reason" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Reason</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a reason" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {reasonOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="details" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Details</FormLabel>
                                <FormControl><Textarea placeholder="Provide specific details about your report..." {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Your Email (optional)</FormLabel>
                                <FormControl><Input placeholder="For follow-up from our team" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                            <Button type="submit">Submit Report</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}


export function ReportingCta() {
    const [isContentModalOpen, setIsContentModalOpen] = useState(false);
    const [isConsultantModalOpen, setIsConsultantModalOpen] = useState(false);
    
    return (
        <div className="mt-16 py-8 border-t border-b">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                <h3 className="font-headline text-lg font-semibold">Need to report content or a consultant?</h3>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsContentModalOpen(true)}>Report Content</Button>
                    <Button variant="outline" onClick={() => setIsConsultantModalOpen(true)}>Report Consultant</Button>
                </div>
            </div>

            <ReportModal 
                type="content"
                isOpen={isContentModalOpen}
                onOpenChange={setIsContentModalOpen}
            />
             <ReportModal 
                type="consultant"
                isOpen={isConsultantModalOpen}
                onOpenChange={setIsConsultantModalOpen}
            />
        </div>
    );
}
