
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { getCurrentUser } from "@/lib/authLocal";
import { getLocal, setLocal } from "@/lib/local";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Check, CheckCircle, FileText, Image as ImageIcon, Link as LinkIcon, Languages as LanguagesIcon, Mic, Star, User, Video, Wallet } from "lucide-react";
import { PlaceholderPage } from "@/components/placeholder-page";
import { cn } from "@/lib/utils";

const onboardingSchema = z.object({
  displayName: z.string().min(2, "Display name is required."),
  headline: z.string().min(10, "Headline should be at least 10 characters.").max(80, "Headline cannot exceed 80 characters."),
  country: z.string().min(2, "Country is required."),
  city: z.string().min(2, "City is required."),
  languages: z.array(z.string()).min(1, "Please select at least one language."),
  specialties: z.array(z.string()).min(1, "Please select at least one specialty."),
  consultationTypes: z.array(z.string()).min(1, "Please select at least one type."),
  ratePerMin: z.coerce.number().min(0.5, "Rate must be at least €0.50.").max(20, "Rate cannot exceed €20."),
  availabilityNote: z.string().optional(),
  isOnlineNow: z.boolean().default(false),
  bio: z.string().min(100, "Bio must be at least 100 characters."),
  avatarUrl: z.string().optional(),
  conferenceLink: z.string().url("Please enter a valid URL.").or(z.literal("")),
  youtubeLink: z.string().url("Please enter a valid URL.").or(z.literal("")),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const specialtiesList = ["Love", "Work", "Health", "Money", "Life Path"];
const consultationTypesList = ["Astrology", "Tarot", "Numerology", "Clairvoyance", "Mediumship"];

const stepValidations = [
  ["displayName", "headline", "country", "city"],
  ["languages", "specialties"],
  ["consultationTypes"],
  ["ratePerMin"],
  ["bio"],
  ["avatarUrl", "conferenceLink", "youtubeLink"],
];


// Step Components
const Step1Basics = () => {
    const { control } = useForm<OnboardingFormData>();
    return (
        <div className="space-y-4">
            <FormField control={control} name="displayName" render={({ field }) => (
            <FormItem><FormLabel>Display Name</FormLabel><FormControl><Input placeholder="e.g., Mystic Marie" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={control} name="headline" render={({ field }) => (
            <FormItem><FormLabel>Profile Headline</FormLabel><FormControl><Input maxLength={80} placeholder="e.g., Clairvoyant Tarot Reader & Astrologer" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
            <FormField control={control} name="country" render={({ field }) => (
                <FormItem><FormLabel>Country</FormLabel><FormControl><Input placeholder="e.g., France" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={control} name="city" render={({ field }) => (
                <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="e.g., Paris" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            </div>
        </div>
    )
};

const Step2Expertise = () => {
    const { control } = useForm<OnboardingFormData>();
    return (
    <div className="space-y-6">
      <FormField control={control} name="languages" render={() => (
        <FormItem>
          <FormLabel>Languages</FormLabel>
            {["EN", "FR"].map((lang) => (
            <FormField key={lang} control={control} name="languages" render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value?.includes(lang)} onCheckedChange={(checked) => {
                const currentLanguages = field.value || [];
                return checked ? field.onChange([...currentLanguages, lang]) : field.onChange(currentLanguages.filter((value) => value !== lang));
              }} /></FormControl><FormLabel className="font-normal">{lang === 'EN' ? 'English' : 'Français'}</FormLabel></FormItem>
            )} />
          ))}
          <FormMessage />
        </FormItem>
      )} />
      <FormField control={control} name="specialties" render={() => (
        <FormItem>
          <FormLabel>Specialties</FormLabel>
          <div className="grid grid-cols-2 gap-2">
            {specialtiesList.map((item) => (
            <FormField key={item} control={control} name="specialties" render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value?.includes(item)} onCheckedChange={(checked) => {
                const currentSpecialties = field.value || [];
                return checked ? field.onChange([...currentSpecialties, item]) : field.onChange(currentSpecialties.filter((value) => value !== item));
              }} /></FormControl><FormLabel className="font-normal">{item}</FormLabel></FormItem>
            )} />
          ))}
          </div>
          <FormMessage />
        </FormItem>
      )} />
    </div>
);
}

const Step3Types = () => {
    const { control } = useForm<OnboardingFormData>();
    return (
      <FormField control={control} name="consultationTypes" render={() => (
        <FormItem>
          <FormLabel>Consultation Types</FormLabel>
          <p className="text-sm text-muted-foreground">What methods do you use in your practice?</p>
          <div className="flex flex-wrap gap-2 pt-2">
            {consultationTypesList.map((item) => (
            <FormField key={item} control={control} name="consultationTypes" render={({ field }) => (
               <FormItem>
                   <FormControl>
                       <Checkbox
                          checked={field.value?.includes(item)}
                          onCheckedChange={(checked) => {
                            const currentTypes = field.value || [];
                            const updated = checked ? [...currentTypes, item] : currentTypes.filter((value) => value !== item);
                            field.onChange(updated);
                          }}
                          className="sr-only"
                       />
                   </FormControl>
                   <FormLabel className={cn(
                       "flex items-center gap-2 cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted",
                       field.value?.includes(item) && "bg-secondary text-secondary-foreground border-secondary"
                   )}>
                       {item}
                   </FormLabel>
               </FormItem>
            )} />
          ))}
          </div>
          <FormMessage />
        </FormItem>
      )} />
    );
}

const Step4Rate = () => {
    const { control, watch } = useForm<OnboardingFormData>();
    const rate = watch("ratePerMin");
    return (
    <div className="space-y-6">
       <FormField control={control} name="ratePerMin" render={({ field }) => (
            <FormItem>
                <FormLabel>Per-minute rate (€)</FormLabel>
                <FormControl><Input type="number" step="0.01" min="0.50" max="20" placeholder="e.g., 2.50" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                <p className="text-xs text-muted-foreground">You will earn approximately 70% of this rate after fees. Current rate: €{rate?.toFixed(2)}/min.</p>
                <FormMessage />
            </FormItem>
        )} />
        <FormField control={control} name="availabilityNote" render={({ field }) => (
            <FormItem>
                <FormLabel>Availability Note (Optional)</FormLabel>
                <FormControl><Input placeholder="e.g., Evenings and weekends" {...field} /></FormControl>
                 <p className="text-xs text-muted-foreground">A short note about your general availability.</p>
            </FormItem>
        )} />
        <FormField control={control} name="isOnlineNow" render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                    <FormLabel>Set my status to "Online now"</FormLabel>
                    <p className="text-xs text-muted-foreground">Allow visitors to start sessions with you immediately.</p>
                </div>
                <FormControl><Switch checked={field.value} onCheckedChange={c => field.onChange(c)} /></FormControl>
            </FormItem>
        )} />
    </div>
);
}

const Step5Bio = () => {
    const {control} = useForm<OnboardingFormData>();
    return (
        <FormField control={control} name="bio" render={({ field }) => (
            <FormItem>
                <FormLabel>Your Bio</FormLabel>
                <FormControl><Textarea placeholder="Tell visitors about your practice, what they can expect from a session, and what makes your approach unique..." className="min-h-[250px]" {...field} /></FormControl>
                <p className="text-xs text-muted-foreground">Suggested sections: About me, What to expect, Format, Outcome.</p>
                <FormMessage />
            </FormItem>
        )} />
    )
};

const Step6Media = () => {
    const { control } = useForm<OnboardingFormData>();
    return (
        <div className="space-y-6">
            <FormField control={control} name="avatarUrl" render={({ field }) => (
                <FormItem>
                    <FormLabel>Avatar</FormLabel>
                    <div className="flex items-center gap-4">
                         <Avatar className="h-16 w-16">
                            <AvatarImage src={field.value} />
                            <AvatarFallback><User className="h-8 w-8" /></AvatarFallback>
                        </Avatar>
                        <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                    </div>
                     <p className="text-xs text-muted-foreground">For this demo, please provide an image URL. Image upload is not supported.</p>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField control={control} name="conferenceLink" render={({ field }) => (
                <FormItem>
                    <FormLabel>Default Conference Link (Optional)</FormLabel>
                    <FormControl><Input placeholder="https://zoom.us/j/..." {...field} /></FormControl>
                    <p className="text-xs text-muted-foreground">Your personal Zoom, Google Meet, etc. link for hosting conferences.</p>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField control={control} name="youtubeLink" render={({ field }) => (
                <FormItem>
                    <FormLabel>YouTube Channel (Optional)</FormLabel>
                    <FormControl><Input placeholder="https://youtube.com/channel/..." {...field} /></FormControl>
                     <p className="text-xs text-muted-foreground">Link to your YouTube channel for podcasts or videos.</p>
                    <FormMessage />
                </FormItem>
            )} />
        </div>
    );
};

const steps = [
    { title: "Basics", icon: User, fields: stepValidations[0] },
    { title: "Expertise", icon: Star, fields: stepValidations[1] },
    { title: "Consultation Types", icon: LanguagesIcon, fields: stepValidations[2] },
    { title: "Rate & Availability", icon: Wallet, fields: stepValidations[3] },
    { title: "Bio", icon: FileText, fields: stepValidations[4] },
    { title: "Links & Media", icon: LinkIcon, fields: stepValidations[5] },
];

export default function ConsultantOnboardingPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);

    const methods = useForm<OnboardingFormData>({
        resolver: zodResolver(onboardingSchema),
        defaultValues: () => getLocal("ast_consultant_onboarding_draft") || {
            displayName: "", headline: "", country: "", city: "",
            languages: [], specialties: [], consultationTypes: [],
            ratePerMin: 2.50, isOnlineNow: false, bio: "",
            conferenceLink: "", youtubeLink: ""
        },
        mode: "onChange"
    });
    const formData = methods.watch();

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser || currentUser.role !== 'consultant') {
            router.replace("/");
        } else {
            // Check if consultant profile is already active.
            const draft = getLocal("ast_consultant_onboarding_draft");
            if (draft && draft.published) {
                router.replace(`/discover/consultant/${currentUser.id}`);
                return;
            }
            setUser(currentUser);
        }
        setLoading(false);
    }, [router]);
    
    // Save draft to local storage on change
    useEffect(() => {
        const subscription = methods.watch((value) => {
            setLocal("ast_consultant_onboarding_draft", value);
        });
        return () => subscription.unsubscribe();
    }, [methods]);
    
    const handleNext = async () => {
        const fieldsToValidate = steps[currentStep].fields;
        const isValid = await methods.trigger(fieldsToValidate as any);
        if (isValid) {
            if (currentStep < steps.length) {
                setCurrentStep(s => s + 1);
            }
        } else {
             toast({
                variant: "destructive",
                title: "Please complete the current step.",
                description: "Check for any errors highlighted on the form.",
             });
        }
    };
    const handlePrev = () => setCurrentStep(s => s - 1);
    
    const handlePublish = () => {
        // Here you would save the final profile to your backend
        // For this demo, we'll log it and clear the draft
        console.log("Publishing profile:", formData);
        setLocal("ast_consultant_onboarding_draft", { ...formData, published: true });
        toast({ title: "Profile Published!", description: "Your consultant profile is now live."});
        router.push("/discover");
    }

    if (loading) {
        return <PlaceholderPage title="Loading Onboarding..." />;
    }

    const progress = (currentStep / steps.length) * 100;
    const CurrentStepComponent = [Step1Basics, Step2Expertise, Step3Types, Step4Rate, Step5Bio, Step6Media][currentStep];
    
    return (
        <div className="container max-w-3xl py-12">
            <FormProvider {...methods}>
                <AnimatePresence mode="wait">
                {currentStep <= steps.length ? (
                    <motion.div key={currentStep}>
                    {currentStep < steps.length && (
                        <Card>
                            <CardHeader>
                                <div className="space-y-2 mb-4">
                                    <Progress value={progress} className="h-2" />
                                    <p className="text-sm text-muted-foreground">Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}</p>
                                </div>
                                <CardTitle className="font-headline text-2xl">{steps[currentStep].title}</CardTitle>
                                <CardDescription>
                                    {
                                        [
                                            "Let's start with the basics. This information will be public on your profile.",
                                            "Tell visitors about your core skills and the languages you practice in.",
                                            "Select the methods you use. This helps clients find the right fit.",
                                            "Set your price and availability. You can change this at any time.",
                                            "Share your story. A detailed bio builds trust and attracts clients.",
                                            "Add your final touches to complete your professional profile.",
                                        ][currentStep]
                                    }
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...methods}>
                                    <form>
                                        <CurrentStepComponent />
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    )}

                    {currentStep === steps.length && (
                         <Card className="text-center">
                            <CardHeader>
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                                    <CheckCircle className="h-6 w-6 text-success" />
                                </div>
                                <CardTitle className="font-headline text-2xl mt-4">Profile Ready for Review</CardTitle>
                                <CardDescription>Your profile is complete. The final step is identity verification.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="rounded-lg border bg-muted/50 p-4">
                                    <p className="font-semibold">KYC / ID Verification: <span className="text-amber-500">Pending</span></p>
                                    <p className="text-sm text-muted-foreground mt-1">For this demo, this step is simulated. You can publish your profile now.</p>
                                </div>
                                <p className="text-sm text-muted-foreground">By publishing, you agree that your profile will be publicly visible on the platform.</p>
                            </CardContent>
                        </Card>
                    )}
                    
                     <div className="mt-6 flex justify-between items-center">
                        <Button variant="outline" onClick={handlePrev} disabled={currentStep === 0}>
                           <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                        </Button>
                        <div className="flex gap-2">
                             {currentStep < steps.length && (
                                <Button variant="ghost" onClick={() => toast({title: "Draft Saved!", description: "Your progress has been saved."})}>
                                    Save Draft
                                </Button>
                             )}
                            {currentStep < steps.length - 1 && (
                                <Button onClick={handleNext}>Next</Button>
                            )}
                            {currentStep === steps.length - 1 && (
                                 <Button onClick={handleNext}>Finish & Review</Button>
                            )}
                             {currentStep === steps.length && (
                                <>
                                    <Button variant="outline" asChild>
                                        <Link href="/discover">View My Profile (Preview)</Link>
                                    </Button>
                                    <Button onClick={handlePublish}>Publish Profile</Button>
                                </>
                            )}
                        </div>
                    </div>
                    </motion.div>
                 ) : null}
                </AnimatePresence>
            </FormProvider>
        </div>
    );
}
