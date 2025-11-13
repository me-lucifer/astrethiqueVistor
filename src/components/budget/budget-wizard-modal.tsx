

"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider, useFormContext, FieldPath } from "react-hook-form";
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
import { getWallet, setLocal, type Wallet, WALLET_KEY } from "@/lib/local";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Wallet as WalletIcon } from "lucide-react";
import { Slider } from "../ui/slider";
import { useBudgetCalculator } from "./use-budget-calculator";
import { endOfMonth, format } from "date-fns";

// --- Zod Schema ---
const aboutYouSchema = z.object({
  home: z.enum(["own", "rent"], { required_error: "Please select an option." }),
  income: z.coerce.number().min(0, "Income must be a positive number."),
  household: z.coerce.number().int().min(1, "Household must have at least 1 person.").max(10),
  hasOther: z.boolean(),
  otherIncome: z.coerce.number().optional(),
}).refine(data => {
    if (data.hasOther) {
        return data.otherIncome !== undefined && data.otherIncome >= 0;
    }
    return true;
}, {
    message: "Please enter the other income amount.",
    path: ["otherIncome"],
});


const essentialsSchema = z.object({
    rentOrMortgage: z.coerce.number().min(0, "Cannot be negative."),
    utilities: z.coerce.number().min(0, "Cannot be negative."),
    groceries: z.coerce.number().min(0, "Cannot be negative."),
    transport: z.coerce.number().min(0, "Cannot be negative."),
    debts: z.coerce.number().min(0, "Cannot be negative."),
    savingsPct: z.coerce.number().min(0).max(30),
});

const finalStepSchema = z.object({
    finalAmount: z.coerce.number().min(0, "Budget must be a positive number."),
    lockWallet: z.boolean().default(true),
})

const wizardSchema = z.object({
  aboutYou: aboutYouSchema,
  essentials: essentialsSchema,
  finalStep: finalStepSchema
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
    const { control, watch } = useFormContext<WizardFormData>();
    const savingsValue = watch('essentials.savingsPct');

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <FormField control={control} name="essentials.rentOrMortgage" render={({ field }) => (
                    <FormItem><FormLabel>Rent/Mortgage</FormLabel><FormControl><Input type="number" placeholder="e.g., 1200" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={control} name="essentials.utilities" render={({ field }) => (
                    <FormItem><FormLabel>Utilities</FormLabel><FormControl><Input type="number" placeholder="e.g., 150" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={control} name="essentials.groceries" render={({ field }) => (
                    <FormItem><FormLabel>Groceries</FormLabel><FormControl><Input type="number" placeholder="e.g., 400" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={control} name="essentials.transport" render={({ field }) => (
                    <FormItem><FormLabel>Transport</FormLabel><FormControl><Input type="number" placeholder="e.g., 100" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
            <FormField control={control} name="essentials.debts" render={({ field }) => (
                <FormItem><FormLabel>Debts & Loans</FormLabel><FormControl><Input type="number" placeholder="e.g., 200" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={control} name="essentials.savingsPct" render={({ field }) => (
                <FormItem>
                    <div className="flex justify-between items-center">
                        <FormLabel>Savings goal</FormLabel>
                        <span className="text-sm font-medium text-primary">{savingsValue}%</span>
                    </div>
                    <FormControl>
                        <Slider
                            defaultValue={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            max={30}
                            step={1}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />
        </div>
    );
};

const Step3 = () => {
    const { control, watch, setValue } = useFormContext<WizardFormData>();
    const aboutYouData = watch('aboutYou');
    const essentialsData = watch('essentials');
    const { suggestedBudget } = useBudgetCalculator(aboutYouData, essentialsData);

    useEffect(() => {
        setValue('finalStep.finalAmount', suggestedBudget, { shouldValidate: true });
    }, [suggestedBudget, setValue]);

    return (
        <div className="space-y-6">
            <div className="text-center">
                <p className="text-sm text-muted-foreground">Suggested monthly budget</p>
                <p className="text-4xl font-bold text-primary">€{suggestedBudget}</p>
            </div>

            <FormField
                control={control}
                name="finalStep.finalAmount"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Use a different amount (€)</FormLabel>
                        <FormControl>
                            <Input 
                                type="number" 
                                min="0" 
                                step="5"
                                {...field} 
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            
            <FormField
                control={control}
                name="finalStep.lockWallet"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <FormLabel>Enable Budget Lock after saving</FormLabel>
                        </div>
                        <FormControl>
                            <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                    </FormItem>
                )}
            />
        </div>
    );
};


const steps: { title: string; description: string; component: React.FC; fields: FieldPath<WizardFormData>[] }[] = [
    { title: "About You", description: "Let's understand your financial landscape.", component: Step1, fields: ["aboutYou.home", "aboutYou.income", "aboutYou.household", "aboutYou.hasOther", "aboutYou.otherIncome"] },
    { title: "Essentials", description: "Account for your necessary monthly spending.", component: Step2, fields: ["essentials.rentOrMortgage", "essentials.utilities", "essentials.groceries", "essentials.transport", "essentials.debts", "essentials.savingsPct"] },
    { title: "Suggested budget for you", description: "Based on your info, here's a suggested budget. You can adjust it.", component: Step3, fields: ["finalStep.finalAmount", "finalStep.lockWallet"] },
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
            aboutYou: { home: 'rent', income: 3000, household: 1, hasOther: false },
            essentials: { rentOrMortgage: 1200, utilities: 150, groceries: 400, transport: 100, debts: 0, savingsPct: 10 },
            finalStep: { finalAmount: 0, lockWallet: true }
        },
        mode: "onChange",
    });

    useEffect(() => {
        if (isOpen) {
            setCurrentStep(0);
            const wallet = getWallet();
            // Pre-fill form if data exists in wallet
            const defaultValues: WizardFormData = {
                aboutYou: wallet.aboutYou || { home: 'rent', income: 3000, household: 1, hasOther: false, otherIncome: 0 },
                essentials: {
                    rentOrMortgage: wallet.essentials?.rent || 1200,
                    utilities: wallet.essentials?.utilities || 150,
                    groceries: wallet.essentials?.groceries || 400,
                    transport: wallet.essentials?.transport || 100,
                    debts: wallet.essentials?.debts || 0,
                    savingsPct: wallet.essentials?.savingsPct || 10
                },
                finalStep: {
                    finalAmount: wallet.budget_cents > 0 ? wallet.budget_cents / 100 : 0,
                    lockWallet: wallet.budget_lock?.enabled || true,
                }
            };
            methods.reset(defaultValues);
        }
    }, [isOpen, methods]);

    const handleNext = async () => {
        const result = await methods.trigger(steps[currentStep].fields);
        if (result) {
            setCurrentStep(s => s + 1);
        } else {
             toast({ variant: "destructive", title: "Please fill out all required fields." });
        }
    };
    const handlePrev = () => setCurrentStep(s => s - 1);

    const handleSave = (data: WizardFormData) => {
        const wallet = getWallet();
        const updatedWallet: Wallet = {
            ...wallet,
            wizardSeen: true,
            budget_set: true,
            budget_cents: data.finalStep.finalAmount * 100,
            budget_lock: {
                ...wallet.budget_lock,
                enabled: data.finalStep.lockWallet,
                until: data.finalStep.lockWallet ? format(endOfMonth(new Date()), "yyyy-MM-dd'T'HH:mm:ssXXX") : null,
            },
            aboutYou: data.aboutYou,
            essentials: { // Map back to wallet structure
                rent: data.essentials.rentOrMortgage,
                utilities: data.essentials.utilities,
                groceries: data.essentials.groceries,
                transport: data.essentials.transport,
                debts: data.essentials.debts,
                savingsPct: data.essentials.savingsPct
            },
        };
        setLocal(WALLET_KEY, updatedWallet);

        let toastDescription = ``;
        if(data.finalStep.lockWallet) {
            toastDescription = "Your wallet is now locked for this budget period."
        }

        toast({ 
            title: `Budget set to €${data.finalStep.finalAmount}`,
            description: toastDescription,
        });
        onOpenChange(false);
    };

    const CurrentStepComponent = steps[currentStep].component;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                        <WalletIcon className="h-6 w-6 text-primary" />
                    </div>
                    <DialogTitle className="font-headline text-2xl text-center">{"Let's personalize your budget"}</DialogTitle>
                        <div className="space-y-2 mb-4 pt-4">
                        <Progress value={((currentStep + 1) / steps.length) * 100} className="h-1" />
                        <p className="text-sm text-muted-foreground text-center">Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}</p>
                    </div>
                    <DialogDescription className="text-center">{steps[currentStep].description}</DialogDescription>
                </DialogHeader>

                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(handleSave)}>
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
                                    <Button type="submit">Finish & Save</Button>
                                )}
                            </div>
                        </DialogFooter>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
}
