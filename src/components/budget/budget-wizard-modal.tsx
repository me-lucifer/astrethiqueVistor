
"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { AnimatePresence, motion } from "framer-motion";
import { getBudgetProfile, getWallet, setBudgetProfile, setWallet, type BudgetProfile, type Wallet } from "@/lib/local";
import { useToast } from "@/hooks/use-toast";
import { useBudgetCalculator, type BudgetWizardFormData } from "./use-budget-calculator";
import { ArrowLeft, ArrowRight } from "lucide-react";

// --- Zod Schemas for each step ---
const step1Schema = z.object({
  whereYouLive: z.enum(["own", "rent"], { required_error: "Please select an option." }),
  monthlyNetIncome: z.coerce.number().min(0, "Income must be a positive number."),
  householdSize: z.coerce.number().int().min(1, "Household must have at least 1 person.").max(10),
  otherHouseholdIncome: z.boolean(),
  otherHouseholdIncomeAmount: z.coerce.number().optional(),
}).refine(data => !data.otherHouseholdIncome || (data.otherHouseholdIncomeAmount !== undefined && data.otherHouseholdIncomeAmount >= 0), {
  message: "Please enter the other income amount.",
  path: ["otherHouseholdIncomeAmount"],
});

const step2Schema = z.object({
  essentialsRent: z.coerce.number().min(0),
  essentialsUtilities: z.coerce.number().min(0),
  essentialsGroceries: z.coerce.number().min(0),
  essentialsTransport: z.coerce.number().min(0),
  debts: z.coerce.number().min(0),
  savingsGoalPercent: z.number().min(0).max(30),
});

const step3Schema = z.object({
  finalBudget: z.coerce.number().min(5, "Budget must be at least €5."),
  enableBudgetLock: z.boolean(),
});

const wizardSchema = step1Schema.merge(step2Schema).merge(step3Schema);

// --- Step Components ---

const Step1 = () => (
    <div className="space-y-4">
        <FormField control={useFormContext().control} name="whereYouLive" render={({ field }) => (
            <FormItem><FormLabel>Where do you live?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4 pt-1"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="own" id="own" /></FormControl><Label htmlFor="own" className="font-normal">I own</Label></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="rent" id="rent" /></FormControl><Label htmlFor="rent" className="font-normal">I rent</Label></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={useFormContext().control} name="monthlyNetIncome" render={({ field }) => (
            <FormItem><FormLabel>Monthly net income (€)</FormLabel><FormControl><Input type="number" placeholder="e.g., 3000" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={useFormContext().control} name="householdSize" render={({ field }) => (
            <FormItem><FormLabel>Household size (including you)</FormLabel><FormControl><Input type="number" min="1" max="10" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={useFormContext().control} name="otherHouseholdIncome" render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Any other household income?</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
        )} />
        {useFormContext().watch("otherHouseholdIncome") && (
            <FormField control={useFormContext().control} name="otherHouseholdIncomeAmount" render={({ field }) => (
                <FormItem><FormLabel>Other income amount (€)</FormLabel><FormControl><Input type="number" placeholder="e.g., 1500" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
        )}
    </div>
);

const Step2 = () => (
    <div className="space-y-4">
        <p className="font-medium text-sm">Monthly essentials (€)</p>
        <div className="grid grid-cols-2 gap-4">
            <FormField control={useFormContext().control} name="essentialsRent" render={({ field }) => (<FormItem><FormLabel>Rent/Mortgage</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
            <FormField control={useFormContext().control} name="essentialsUtilities" render={({ field }) => (<FormItem><FormLabel>Utilities</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
            <FormField control={useFormContext().control} name="essentialsGroceries" render={({ field }) => (<FormItem><FormLabel>Groceries</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
            <FormField control={useFormContext().control} name="essentialsTransport" render={({ field }) => (<FormItem><FormLabel>Transport</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
        </div>
         <FormField control={useFormContext().control} name="debts" render={({ field }) => (
            <FormItem><FormLabel>Debts & EMIs (€ per month)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
        )} />
        <FormField control={useFormContext().control} name="savingsGoalPercent" render={({ field }) => (
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

const Step3 = () => {
    const { control, watch } = useFormContext<BudgetWizardFormData>();
    const formData = watch();
    const { suggestedBudget } = useBudgetCalculator(formData);
    
    // Set initial value for finalBudget if not already set
    useEffect(() => {
        if (formData.finalBudget === undefined && suggestedBudget > 0) {
            control.setValue('finalBudget', suggestedBudget);
        }
    }, [suggestedBudget, formData.finalBudget, control]);

    return (
        <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted text-center">
                <p className="text-sm text-muted-foreground">Suggested monthly budget</p>
                <p className="text-4xl font-bold">€{suggestedBudget}</p>
            </div>
             <FormField control={control} name="finalBudget" render={({ field }) => (
                <FormItem><FormLabel>Set monthly budget (€)</FormLabel><FormControl><Input type="number" placeholder="e.g., 100" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={control} name="enableBudgetLock" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Enable Budget Lock</FormLabel><p className="text-xs text-muted-foreground">Automatically lock spending when budget is met.</p></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
            )} />
        </div>
    );
};

const steps = [
    { title: "About You", description: "Let's understand your financial landscape.", component: Step1, schema: step1Schema },
    { title: "Essentials", description: "Account for your necessary monthly spending.", component: Step2, schema: step2Schema },
    { title: "Your Budget", description: "Review our suggestion and set your final budget.", component: Step3, schema: step3Schema },
];


// --- Main Modal Component ---
interface BudgetWizardModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function BudgetWizardModal({ isOpen, onOpenChange }: BudgetWizardModalProps) {
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(0);

    const methods = useForm<BudgetWizardFormData>({
        resolver: zodResolver(wizardSchema),
        defaultValues: {
            whereYouLive: 'rent',
            monthlyNetIncome: 3000,
            householdSize: 1,
            otherHouseholdIncome: false,
            otherHouseholdIncomeAmount: 0,
            essentialsRent: 1200,
            essentialsUtilities: 150,
            essentialsGroceries: 400,
            essentialsTransport: 100,
            debts: 0,
            savingsGoalPercent: 10,
            finalBudget: undefined,
            enableBudgetLock: false
        },
        mode: "onChange",
    });

    useEffect(() => {
        if (isOpen) {
            const profile = getBudgetProfile();
            if (profile) {
                methods.reset(profile.answers);
            }
        }
    }, [isOpen, methods]);
    
    const handleNext = async () => {
        const result = await methods.trigger(Object.keys(steps[currentStep].schema.shape) as (keyof BudgetWizardFormData)[]);
        if (result) {
            setCurrentStep(s => s + 1);
        } else {
             toast({ variant: "destructive", title: "Please fill out all required fields." });
        }
    };
    const handlePrev = () => setCurrentStep(s => s - 1);

    const handleSave = (data: BudgetWizardFormData) => {
        const { suggestedBudget } = useBudgetCalculator(data);

        // Save wallet settings
        const wallet = getWallet();
        const updatedWallet: Wallet = {
            ...wallet,
            budget_cents: data.finalBudget * 100,
            budget_set: true,
            budget_lock: {
                ...wallet.budget_lock,
                enabled: data.enableBudgetLock,
            }
        };
        setWallet(updatedWallet);

        // Save budget profile answers
        const profile: BudgetProfile = {
            answers: data,
            suggested_cents: suggestedBudget * 100,
            last_updated: new Date().toISOString()
        };
        setBudgetProfile(profile);

        toast({ title: "Budget Saved!", description: `Your monthly budget is now €${data.finalBudget}.` });
        onOpenChange(false);
        setTimeout(() => setCurrentStep(0), 500); // Reset for next time
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(handleSave)}>
                        <DialogHeader>
                            <DialogTitle className="font-headline text-2xl">{steps[currentStep].title}</DialogTitle>
                            <DialogDescription>{steps[currentStep].description}</DialogDescription>
                            <Progress value={((currentStep + 1) / steps.length) * 100} className="mt-2 h-1" />
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
                                    {steps[currentStep].component({})}
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
