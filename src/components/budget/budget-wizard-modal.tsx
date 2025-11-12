
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
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { AnimatePresence, motion } from "framer-motion";
import { getWallet, setWallet, type Wallet } from "@/lib/local";
import { useToast } from "@/hooks/use-toast";
import { useBudgetCalculator, type AboutYou, type Essentials } from "./use-budget-calculator";
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

const essentialsSchema = z.object({
  rent: z.coerce.number().min(0),
  utilities: z.coerce.number().min(0),
  groceries: z.coerce.number().min(0),
  transport: z.coerce.number().min(0),
  debts: z.coerce.number().min(0),
  savingsPct: z.number().min(0).max(30),
});

const wizardSchema = z.object({
  aboutYou: aboutYouSchema,
  essentials: essentialsSchema,
  finalBudget: z.coerce.number().min(10, "Budget must be at least €10.").optional(),
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

const Step2 = () => {
    const { control } = useFormContext<WizardFormData>();
    return (
        <div className="space-y-4">
            <p className="font-medium text-sm">Monthly essentials (€)</p>
            <div className="grid grid-cols-2 gap-4">
                <FormField control={control} name="essentials.rent" render={({ field }) => (<FormItem><FormLabel>Rent/Mortgage</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                <FormField control={control} name="essentials.utilities" render={({ field }) => (<FormItem><FormLabel>Utilities</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                <FormField control={control} name="essentials.groceries" render={({ field }) => (<FormItem><FormLabel>Groceries</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                <FormField control={control} name="essentials.transport" render={({ field }) => (<FormItem><FormLabel>Transport</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
            </div>
             <FormField control={control} name="essentials.debts" render={({ field }) => (
                <FormItem><FormLabel>Debts & EMIs (€ per month)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
            )} />
            <FormField control={control} name="essentials.savingsPct" render={({ field }) => (
                <FormItem>
                    <div className="flex justify-between">
                        <FormLabel>Savings goal (% of income)</FormLabel>
                        <span className="text-primary font-bold">{field.value}%</span>
                    </div>
                    <FormControl>
                        <Slider min={0} max={30} step={1} value={[field.value]} onValueChange={(vals) => field.onChange(vals[0])} />
                    </FormControl>
                </FormItem>
            )} />
        </div>
    );
};

const Step3 = () => {
    const { control, watch, setValue } = useFormContext<WizardFormData>();
    const { aboutYou, essentials } = watch();
    const { suggestedBudget } = useBudgetCalculator(aboutYou, essentials);
    
    useEffect(() => {
        const finalBudgetValue = watch('finalBudget');
        if ((finalBudgetValue === undefined || finalBudgetValue === 0) && suggestedBudget > 0) {
            setValue('finalBudget', suggestedBudget);
        }
    }, [suggestedBudget, setValue, watch]);

    return (
        <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted text-center">
                <p className="text-sm text-muted-foreground">Suggested monthly budget</p>
                <p className="text-4xl font-bold">€{suggestedBudget}</p>
            </div>
             <FormField control={control} name="finalBudget" render={({ field }) => (
                <FormItem>
                    <FormLabel>Set your budget (€)</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 100" {...field} /></FormControl>
                    <p className="text-xs text-muted-foreground">You can adjust this anytime.</p>
                    <FormMessage />
                </FormItem>
            )} />
        </div>
    );
};

const steps = [
    { title: "About You", description: "Let's understand your financial landscape.", component: Step1, fields: ["aboutYou.home", "aboutYou.income", "aboutYou.household", "aboutYou.hasOther", "aboutYou.otherIncome"] },
    { title: "Essentials", description: "Account for your necessary monthly spending.", component: Step2, fields: ["essentials.rent", "essentials.utilities", "essentials.groceries", "essentials.transport", "essentials.debts", "essentials.savingsPct"] },
    { title: "Suggestion", description: "Review our suggestion and set your final budget.", component: Step3, fields: ["finalBudget"] },
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
            essentials: { rent: 1200, utilities: 150, groceries: 400, transport: 100, debts: 0, savingsPct: 10, },
            finalBudget: 0,
        },
        mode: "onChange",
    });

    useEffect(() => {
        if (isOpen) {
            const wallet = getWallet();
            methods.reset({
                aboutYou: wallet.aboutYou,
                essentials: wallet.essentials,
                finalBudget: wallet.budget,
            });
        }
    }, [isOpen, methods]);

    const handleNext = async () => {
        const result = await methods.trigger(steps[currentStep].fields as (keyof WizardFormData)[]);
        if (result) {
            setCurrentStep(s => s + 1);
        } else {
             toast({ variant: "destructive", title: "Please fill out all required fields." });
        }
    };
    const handlePrev = () => setCurrentStep(s => s - 1);

    const handleSave = (data: WizardFormData) => {
        // Save wallet settings
        const wallet = getWallet();
        const updatedWallet: Wallet = {
            ...wallet,
            budget: data.finalBudget!,
            budget_set: true, // Mark budget as set
            wizardSeen: true,
            aboutYou: data.aboutYou,
            essentials: data.essentials,
        };
        setWallet(updatedWallet);

        toast({ title: "Budget Saved!", description: `Your monthly budget is now €${data.finalBudget}.` });
        onOpenChange(false);
        setTimeout(() => setCurrentStep(0), 500); // Reset for next time
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
                                    <Button type="submit">Save Budget</Button>
                                )}
                            </div>
                        </DialogFooter>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
}


    
