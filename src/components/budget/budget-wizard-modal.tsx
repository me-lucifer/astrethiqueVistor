
"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { AnimatePresence, motion } from "framer-motion";
import { getWallet, setWallet, type Wallet } from "@/lib/local";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight } from "lucide-react";

// --- Zod Schema ---
const aboutYouSchema = z.object({
  home: z.enum(["own", "rent"], { required_error: "Please select an option." }),
  income: z.coerce.number().min(0, "Income must be a positive number."),
  household: z.coerce.number().int().min(1, "Household must have at least 1 person.").max(10),
  hasOther: z.boolean(),
  otherIncome: z.coerce.number().optional(),
}).refine(data => !data.hasOther || (data.otherIncome !== undefined && data.otherIncome >= 0), {
  message: "Please enter the other income amount.",
  path: ["otherIncome"],
});

const wizardSchema = z.object({
  aboutYou: aboutYouSchema,
});

export type WizardFormData = z.infer<typeof wizardSchema>;

// --- Step Components ---

const Step1 = () => {
    const { control, watch } = useFormContext<WizardFormData>();
    return (
        <div className="space-y-4">
            <FormField control={control} name="aboutYou.home" render={({ field }) => (
                <FormItem><FormLabel>Where do you live?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4 pt-1"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="own" id="own" /></FormControl><Label htmlFor="own" className="font-normal">I own</Label></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="rent" id="rent" /></FormControl><Label htmlFor="rent" className="font-normal">I rent</Label></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={control} name="aboutYou.income" render={({ field }) => (
                <FormItem><FormLabel>Monthly net income (€)</FormLabel><FormControl><Input type="number" placeholder="e.g., 3000" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={control} name="aboutYou.household" render={({ field }) => (
                <FormItem><FormLabel>Household size (including you)</FormLabel><FormControl><Input type="number" min="1" max="10" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={control} name="aboutYou.hasOther" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Any other household income?</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
            )} />
            {watch("aboutYou.hasOther") && (
                <FormField control={control} name="aboutYou.otherIncome" render={({ field }) => (
                    <FormItem><FormLabel>Other income amount (€)</FormLabel><FormControl><Input type="number" placeholder="e.g., 1500" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            )}
        </div>
    );
}

const PlaceholderStep = ({ title }: { title: string }) => (
  <div className="text-center text-muted-foreground p-8">
    <p>Placeholder for: {title}</p>
  </div>
);

const steps = [
    { title: "About You", description: "Let's understand your financial landscape.", component: Step1, fields: ["aboutYou.home", "aboutYou.income", "aboutYou.household", "aboutYou.hasOther", "aboutYou.otherIncome"] },
    { title: "Essentials", description: "Account for your necessary monthly spending.", component: () => <PlaceholderStep title="Essentials" />, fields: [] },
    { title: "Suggestion", description: "Suggested budget for you", component: () => <PlaceholderStep title="Suggestion" />, fields: [] },
];


// --- Main Modal Component ---
interface BudgetWizardModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function BudgetWizardModal({ isOpen, onOpenChange }: BudgetWizardModalProps) {
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(0);

    const methods = useForm<WizardFormData>({
        resolver: zodResolver(wizardSchema),
        defaultValues: {
            aboutYou: { home: 'rent', income: 3000, household: 1, hasOther: false, otherIncome: 0 },
        },
        mode: "onChange",
    });

    useEffect(() => {
        if (isOpen) {
            setCurrentStep(0);
        }
    }, [isOpen]);

    const handleNext = async () => {
        const result = await methods.trigger(steps[currentStep].fields as any);
        if (result) {
            setCurrentStep(s => s + 1);
        } else {
             toast({ variant: "destructive", title: "Please fill out all required fields." });
        }
    };
    const handlePrev = () => setCurrentStep(s => s - 1);

    const handleSave = (data: WizardFormData) => {
        const wallet = getWallet();
        // This is incomplete logic for now. It will be expanded in later steps.
        const updatedWallet: Wallet = {
            ...wallet,
            wizardSeen: true,
            aboutYou: data.aboutYou,
        };
        setWallet(updatedWallet);

        toast({ title: "Budget Information Saved!" });
        onOpenChange(false);
    };

    const CurrentStepComponent = steps[currentStep].component;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(handleSave)}>
                        <DialogHeader>
                            <DialogTitle className="font-headline text-2xl">{"Let's personalize your budget"}</DialogTitle>
                             <div className="space-y-2 mb-4 pt-4">
                                <Progress value={((currentStep + 1) / steps.length) * 100} className="h-1" />
                                <p className="text-sm text-muted-foreground">Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}</p>
                            </div>
                            <DialogDescription>{steps[currentStep].description}</DialogDescription>
                        </DialogHeader>

                        <div className="py-6 min-h-[300px]">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <CurrentStepComponent />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        
                        <DialogFooter>
                            <div className="w-full flex justify-between items-center">
                                {currentStep > 0 ? (
                                    <Button type="button" variant="ghost" onClick={handlePrev}><ArrowLeft className="mr-2 h-4 w-4"/> Previous</Button>
                                ) : <div />}
                                {currentStep < steps.length - 1 ? (
                                    <Button type="button" onClick={handleNext}>Next <ArrowRight className="ml-2 h-4 w-4"/></Button>
                                ) : (
                                    <Button type="submit">Save budget</Button>
                                )}
                            </div>
                        </DialogFooter>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
}
