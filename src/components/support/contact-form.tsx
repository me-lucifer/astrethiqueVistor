
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { ticketSchema, type TicketFormData } from "@/lib/support";
import { useToast } from "@/hooks/use-toast";

const topicOptions = [
  "Bookings", "Billing", "Account/Login", "Technical issue", "Content/Comments", "Conferences", "Safety/Report"
];

interface SupportContactFormProps {
  activeTab: "visitor" | "consultant";
}

export function SupportContactForm({ activeTab }: SupportContactFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const { toast } = useToast();

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      userType: activeTab,
      topic: "",
      subject: "",
      description: "",
      email: "",
      displayName: "",
      priority: "normal",
    },
  });

  useEffect(() => {
    form.setValue("userType", activeTab);
  }, [activeTab, form]);

  const onValidSubmit = (data: TicketFormData) => {
    const adminEmail = "support@astrethique.com";
    const mailtoSubject = `[AST Support] ${data.topic} — ${data.subject}`;
    const mailtoBody = `
Role: ${data.userType}
Topic: ${data.topic}
Priority: ${data.priority}
Email: ${data.email}
Display name: ${data.displayName || '—'}

Description:
${data.description}
    `;

    const mailtoLink = `mailto:${adminEmail}?subject=${encodeURIComponent(mailtoSubject)}&body=${encodeURIComponent(mailtoBody)}`;

    window.location.href = mailtoLink;
    
    setSubmittedEmail(data.email);
    setIsSuccess(true);
    form.reset({
      ...form.getValues(),
      subject: '',
      description: ''
    });

    const formElement = document.getElementById('contact-support');
    formElement?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const onInvalidSubmit = (errors: any) => {
    toast({
      variant: "destructive",
      title: "Please fix the highlighted fields.",
    });
    const firstErrorField = Object.keys(errors)[0];
    if(firstErrorField) {
      try {
        const element = document.getElementsByName(firstErrorField)[0];
        element?.focus({ preventScroll: true });
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (e) {
        console.warn('Could not focus on invalid field:', firstErrorField)
      }
    }
  };
  
  const descriptionValue = form.watch("description");


  return (
    <>
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div className="prose prose-invert text-foreground/80">
          <h4>Response Times</h4>
          <p>Our support team is available during standard business hours. We aim to respond to all inquiries as quickly as possible.</p>
          <ul>
            <li><strong>Normal Priority:</strong> Typically within 24-48 business hours.</li>
            <li><strong>Urgent Priority:</strong> Typically within 4-8 business hours. Please reserve "Urgent" for critical issues like payment problems or inability to access a live session.</li>
          </ul>
          <h4>What to Include</h4>
          <p>To help us resolve your issue faster, please provide as much detail as possible, including:</p>
          <ul>
            <li>The name of the consultant or conference involved.</li>
            <li>The date and time the issue occurred.</li>
            <li>A screenshot of the issue, if applicable.</li>
          </ul>
        </div>
        <Card>
          <CardContent className="p-6">
            {isSuccess && (
                 <Alert aria-live="polite" className="mb-6 border-success text-success [&>svg]:text-success">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Thanks!</AlertTitle>
                    <AlertDescription>
                        We’ve prepared an email with your request. Please press ‘Send’ in your mail app. We’ll reply to you at {submittedEmail}.
                    </AlertDescription>
                </Alert>
            )}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onValidSubmit, onInvalidSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="userType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>I am a</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex gap-4"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="visitor" id="visitor" />
                            </FormControl>
                            <FormLabel htmlFor="visitor" className="font-normal">Visitor</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="consultant" id="consultant" />
                            </FormControl>
                            <FormLabel htmlFor="consultant" className="font-normal">Consultant</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a topic" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {topicOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Issue with my last session" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Please describe your issue in detail..." {...field} />
                      </FormControl>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <FormMessage />
                        <span className="ml-auto">{descriptionValue?.length || 0}/600</span>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Email</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Your display name" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                 <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex gap-4"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="normal" id="normal" />
                            </FormControl>
                            <FormLabel htmlFor="normal" className="font-normal">Normal</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="urgent" id="urgent" />
                            </FormControl>
                            <FormLabel htmlFor="urgent" className="font-normal">Urgent</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => form.reset()}>Clear</Button>
                    <Button type="submit">Submit Request</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
