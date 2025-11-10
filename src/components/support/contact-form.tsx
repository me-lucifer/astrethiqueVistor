
"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock } from "lucide-react";

const ticketSchema = z.object({
  userType: z.enum(["visitor", "consultant"]),
  topic: z.string().min(1, "Please select a topic."),
  subject: z.string().min(5, "Subject must be at least 5 characters."),
  description: z.string().min(20, "Description must be at least 20 characters.").max(600, "Description cannot exceed 600 characters."),
  email: z.string().email("Please enter a valid email address."),
  displayName: z.string().optional(),
  referenceId: z.string().optional(),
  attachmentUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
  priority: z.enum(["normal", "urgent"]).default("normal"),
});

type TicketFormData = z.infer<typeof ticketSchema>;

const topicOptions = [
  "Bookings", "Billing", "Account/Login", "Technical issue", "Content/Comments", "Conferences", "Safety/Report"
];

export function SupportContactForm({ activeTab }: { activeTab: "visitor" | "consultant" }) {
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [ticketId, setTicketId] = useState("");

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      userType: activeTab,
      topic: "",
      subject: "",
      description: "",
      email: "",
      displayName: "",
      referenceId: "",
      attachmentUrl: "",
      priority: "normal",
    },
  });

  const generateTicketId = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `AST-${year}${month}-${randomDigits}`;
  };

  const onSubmit = (data: TicketFormData) => {
    console.log("Form submitted:", data);
    const newTicketId = generateTicketId();
    setTicketId(newTicketId);
    setIsSuccessModalOpen(true);
    form.reset();
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
            <li>Any relevant IDs (Booking, Conference, or Transaction).</li>
            <li>A screenshot of the issue, if applicable.</li>
          </ul>
        </div>
        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="userType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>I am a</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
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
                  name="referenceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Booking or Conference ID (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., BOOK-12345" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                 <FormField
                  control={form.control}
                  name="attachmentUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Attachment Link (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">Paste a link to a screenshot if needed.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
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

      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent>
            <DialogHeader>
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-success/10 mx-auto mb-4">
                    <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <DialogTitle className="text-center">Request Received!</DialogTitle>
                <DialogDescription className="text-center">
                    Thank you for contacting us. Our team will review your request and get back to you as soon as possible.
                </DialogDescription>
            </DialogHeader>
            <div className="text-center bg-muted/50 p-3 rounded-md">
                <p className="text-sm text-muted-foreground">Your ticket number is:</p>
                <p className="font-mono font-bold text-lg">{ticketId}</p>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button className="w-full">Close</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

