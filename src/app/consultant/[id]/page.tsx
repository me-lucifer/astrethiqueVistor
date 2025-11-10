
"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Consultant } from '@/lib/consultants';
import { getSession } from '@/lib/session';
import { PlaceholderPage } from '@/components/placeholder-page';
import { Skeleton } from '@/components/ui/skeleton';
import { ConsultantProfileHeader } from '@/components/consultant-profile/consultant-profile-header';
import { ConsultantAvailability } from '@/components/consultant-profile/consultant-availability';
import { ConsultantContentTabs } from '@/components/consultant-profile/consultant-content-tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { ArrowUp } from 'lucide-react';
import { ConsultantProfile } from '@/lib/consultant-profile';

export default function ConsultantProfilePage() {
  const params = useParams();
  const { id } = params;
  const { toast } = useToast();
  const [consultant, setConsultant] = useState<Consultant | null>(null);
  const [profile, setProfile] = useState<ConsultantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      const allConsultants = getSession<Consultant[]>('discover.seed.v1');
      if (allConsultants) {
        const foundConsultant = allConsultants.find(c => c.id === id || c.slug === id);
        if(foundConsultant) {
            const now = new Date();
            foundConsultant.availability = {
                online: foundConsultant.availability.online,
                slots: Array.from({length: 12}, (_, i) => {
                    return new Date(now.getTime() + (i * 30 + (i > 5 ? 1440 : 120) ) * 60000).toISOString()
                })
            };
            setConsultant(foundConsultant);

            // Also find the profile for header
             const sessionProfile = getSession<ConsultantProfile>('consultantProfile');
             if(sessionProfile && (sessionProfile.id === id || sessionProfile.id === foundConsultant.slug)) {
                 setProfile(sessionProfile);
             }
        }
      }
      setLoading(false);
    }
  }, [id]);

  const handleReport = () => {
    setIsReportModalOpen(false);
    toast({
      title: "Report received",
      description: "Thanks, we'll review this profile.",
    });
  }

  const scrollToAvailability = () => {
    const element = document.getElementById('availability-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  if (loading) {
    return (
        <div className="container py-8 space-y-8">
            <div className="flex flex-col md:flex-row gap-8">
                <Skeleton className="h-32 w-32 rounded-full" />
                <div className="flex-1 space-y-4">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!consultant || !profile) {
    return (
        <PlaceholderPage
            title="Consultant Not Found"
            description="We couldn't find a consultant with that ID."
        />
    );
  }

  return (
    <div className="container py-8">
        <div className="space-y-8">
            <ConsultantProfileHeader consultant={profile} />
            <ConsultantAvailability consultant={consultant} />
            <ConsultantContentTabs consultant={consultant} />

            <div className="border-t pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                <Button variant="link" onClick={scrollToAvailability} className="text-muted-foreground">
                    <ArrowUp className="mr-2 h-4 w-4" />
                    See availability
                </Button>
                <Button variant="link" onClick={() => setIsReportModalOpen(true)} className="text-muted-foreground">
                    Report profile
                </Button>
            </div>
        </div>

        <AlertDialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Report Profile</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to report this profile for review? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button variant="destructive" onClick={handleReport}>Yes, Report</Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
