
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getLocal, setLocal } from "@/lib/local";
import { Sparkles, Send, Info } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  sunSign: z.string().min(1, "This field is required"),
  birthDate: z.string().optional(),
  birthTime: z.string().optional(),
  birthPlace: z.string().optional(),
  consent: z.boolean().default(false),
});

type HoroscopeFormData = z.infer<typeof formSchema>;

export function DailyHoroscopeModal({
  isOpen,
  onOpenChange,
  onSuccessSubmit,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccessSubmit: () => void;
}) {
  const [view, setView] = useState<'form' | 'result'>('form');
  const { toast } = useToast();

  const form = useForm<HoroscopeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: () => {
      // Prefill from session storage on mount
      if (typeof window !== 'undefined') {
        const savedData = getLocal<HoroscopeFormData>('horoscopeForm');
        return {
          email: savedData?.email || "",
          sunSign: savedData?.sunSign || "",
          birthDate: savedData?.birthDate || "",
          birthTime: savedData?.birthTime || "",
          birthPlace: savedData?.birthPlace || "",
          consent: savedData?.consent || false,
        };
      }
      return { email: "", sunSign: "", birthDate: "", birthTime: "", birthPlace: "", consent: false };
    },
  });

  function onSubmit(values: HoroscopeFormData) {
    // Save form data for pre-filling
    setLocal('horoscopeForm', values);

    // Save lead if not registered
    if (sessionStorage.getItem("userRegistered") !== 'true') {
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
    }
    
    // Simulate removing lead if they "register"
    if (sessionStorage.getItem("userRegistered") === 'true') {
        const leads = getLocal<any[]>("leads") || [];
        const updatedLeads = leads.filter(lead => lead.email !== values.email);
        setLocal("leads", updatedLeads);
    }
    
    // Show toast for subscription
    if (values.consent) {
        toast({
            title: "Subscribed",
            description: "You can unsubscribe from any email.",
        });
    }

    // Show the result view and call the parent submit handler
    setView('result');
    onSuccessSubmit();
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      // Reset to form view after a short delay to allow closing animation
      setTimeout(() => setView('form'), 300);
    }
    onOpenChange(open);
  }

  const FormView = () => (
    <>
      <DialogHeader className="p-6 pb-0">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mx-auto mb-4">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <DialogTitle className="text-center">Your Free Daily Horoscope</DialogTitle>
        <DialogDescription className="text-center">Enter your details to see today’s reading and occasional tips.</DialogDescription>
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
                <FormLabel className="flex items-center gap-1">
                  Sun Sign
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 cursor-help text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Not sure? Choose your birth sign.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </FormLabel>
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
            <FormField control={form.control} name="birthDate" render={({ field }) => (
              <FormItem>
                <FormLabel>Birth Date (optional)</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="birthTime" render={({ field }) => (
              <FormItem>
                <FormLabel>Birth Time (optional)</FormLabel>
                <FormControl><Input type="time" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <FormField control={form.control} name="birthPlace" render={({ field }) => (
            <FormItem>
              <FormLabel>Birth Place (optional)</FormLabel>
              <FormControl><Input placeholder="e.g. Paris, France" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="consent" render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-muted/30">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Email me a daily horoscope. Unsubscribe anytime.</FormLabel>
              </div>
            </FormItem>
          )} />
          <div className="space-y-2 mt-4">
            <Button type="submit" size="lg" className="w-full">
              See Today’s Horoscope
              <Send className="ml-2 h-4 w-4" />
            </Button>
            <DialogClose asChild>
                <Button type="button" variant="link" className="w-full text-muted-foreground">No thanks</Button>
            </DialogClose>
          </div>
          <p className="text-xs text-muted-foreground text-center pt-2">
            By continuing you agree to our{' '}
            <Link href="/terms" className="underline hover:text-primary">Terms</Link> and{' '}
            <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
          </p>
        </form>
      </Form>
    </>
  );

  const ResultView = () => (
    <div className="p-6">
        <Card className="bg-background/50 border-primary/20 shadow-none">
            <CardHeader>
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mx-auto mb-4">
                    <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-center">Your Horoscope for Today</CardTitle>
                <CardDescription className="text-center">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-foreground/80">
                <p>Today is a day for bold moves and new beginnings. The stars are aligned in your favor, encouraging you to step out of your comfort zone and pursue a long-held ambition. Trust your intuition.</p>
                <p>In matters of the heart, communication is key. Be open and honest with your loved ones to deepen your connections. A surprising conversation could lead to a breakthrough.</p>
            </CardContent>
        </Card>
        <Separator className="my-6" />
        <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">This is a general reading. For a deeper analysis tailored to your unique birth chart, book a session with an expert.</p>
            <Button disabled size="lg">
                Personalized Horoscope (Paid)
            </Button>
        </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {view === 'form' ? <FormView /> : <ResultView />}
      </DialogContent>
    </Dialog>
  );
}
