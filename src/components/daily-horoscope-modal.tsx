
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getLocal, setLocal } from "@/lib/local";
import { Sparkles, Send } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  sunSign: z.string().min(1, "This field is required"),
  birthDate: z.string().optional(),
  birthTime: z.string().optional(),
  birthPlace: z.string().optional(),
  consent: z.boolean().default(false),
});


export function DailyHoroscopeModal({
  isOpen,
  onOpenChange,
  onSuccessSubmit,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccessSubmit: () => void;
}) {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      sunSign: "",
      birthDate: "",
      birthTime: "",
      birthPlace: "",
      consent: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const leads = getLocal<any[]>("leads") || [];
    const existingLead = leads.find(lead => lead.email === values.email);
    if (!existingLead) {
        leads.push({
            email: values.email,
            source: 'daily-horoscope',
            createdAt: new Date().toISOString(),
            lang: 'EN',
        });
        setLocal("leads", leads);
    }
    
    // Simulate removing lead if they "register"
    if (sessionStorage.getItem("userRegistered") === 'true') {
        const updatedLeads = leads.filter(lead => lead.email !== values.email);
        setLocal("leads", updatedLeads);
    }
    
    onSuccessSubmit();
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mx-auto mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-center">Your Free Daily Horoscope</DialogTitle>
            <DialogDescription className="text-center">A little cosmic guidance to start your day. Fill in your details below.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4 px-6">
            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="sunSign"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Sun Sign</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Select your sun sign" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {signs.map(sign => <SelectItem key={sign} value={sign}>{sign}</SelectItem>)}
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Birth Date (optional)</FormLabel>
                    <FormControl>
                        <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="birthTime"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Birth Time (optional)</FormLabel>
                    <FormControl>
                        <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
                control={form.control}
                name="birthPlace"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Birth Place (optional)</FormLabel>
                    <FormControl>
                    <Input placeholder="e.g. Paris, France" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="consent"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                    <FormControl>
                        <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                        <FormLabel>
                        Email me my reading & useful tips. You can unsubscribe anytime.
                        </FormLabel>
                    </div>
                    </FormItem>
                )}
                />
             <p className="text-xs text-muted-foreground text-center">
                We store this locally in this demo. In production, your consent governs how we email you.
              </p>

            <Button type="submit" size="lg" className="mt-4">
                See Today’s Horoscope
                <Send className="ml-2 h-4 w-4" />
            </Button>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
