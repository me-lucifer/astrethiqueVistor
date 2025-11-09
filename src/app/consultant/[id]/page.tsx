
"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Consultant } from '@/lib/consultants';
import consultantsData from '@/lib/consultants.json';
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
import { getLocal } from '@/lib/local';

export default function ConsultantProfilePage() {
  const params = useParams();
  const { id } = params;
  const { toast } = useToast();
  const [consultant, setConsultant] = useState<Consultant | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      // In a real app, you'd fetch this from an API. Here we use the imported JSON.
      // The `id` from URL params might be the slug, so we find by slug.
      const allConsultants: Consultant[] = consultantsData;
      const foundConsultant = allConsultants.find(c => c.id === id || c.slug === id);
      setConsultant(foundConsultant || null);
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

  if (!consultant) {
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
            <ConsultantProfileHeader consultant={consultant} />
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
