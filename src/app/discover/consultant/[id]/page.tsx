
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSession, setSession } from '@/lib/session';
import { ConsultantProfile } from '@/lib/consultant-profile';
import { ConsultantProfileHeader } from '@/components/consultant-profile/consultant-profile-header';
import { ConsultantAvailability } from '@/components/consultant-profile/consultant-availability';
import { ConsultantContentTabs } from '@/components/consultant-profile/consultant-content-tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PlaceholderPage } from '@/components/placeholder-page';
import { Consultant } from '@/lib/consultants';
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
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ContentItem, seedContentItems } from '@/lib/content-seeder';
import { Conference, seedConferences } from '@/lib/conferences-seeder';
import { getLocal } from '@/lib/local';

export default function Page() {
  const params = useParams();
  const router = useRouter();
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
            const foundConsultant = allConsultants.find(c => c.slug === id);
            
            if (foundConsultant) {
                setConsultant(foundConsultant);
                const isFavorite = getSession<string[]>("consultantFavorites")?.includes(foundConsultant.id) || false;
                
                // Get seeded content
                seedContentItems();
                seedConferences();
                const allContent = getLocal<ContentItem[]>("contentItems") || [];
                const allConferences = getLocal<Conference[]>("conferences") || [];

                // Create profile object from consultant data
                const consultantProfile: ConsultantProfile = {
                    id: foundConsultant.id,
                    name: foundConsultant.name,
                    avatar: foundConsultant.cover, // Using cover as avatar for now
                    isOnline: foundConsultant.availability.online,
                    badges: foundConsultant.badges,
                    rating: foundConsultant.rating,
                    reviewsCount: foundConsultant.reviews.length,
                    languages: foundConsultant.languages.map(l => l.code),
                    pricePerMin: foundConsultant.pricePerMin,
                    prevPricePerMin: foundConsultant.priceWas,
                    summary: foundConsultant.bio.replace(/<[^>]*>?/gm, '').substring(0, 140),
                    specialties: foundConsultant.specialties,
                    types: foundConsultant.types,
                    verifications: {
                        adminApproved: foundConsultant.adminApproved,
                        kycVerified: foundConsultant.kycVerified,
                        lastReview: new Date(foundConsultant.lastReviewDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                    },
                    nextSlots: foundConsultant.availability.slots,
                    aboutHtml: foundConsultant.bio,
                    content: {
                        articles: allContent.filter(c => c.type === 'Article' && (c.author === foundConsultant.name.split(' ')[0] || c.author ==='Eva' || c.author === 'Marcus' )).slice(0,2),
                        podcasts: allContent.filter(c => c.type === 'Podcast' && (c.author === foundConsultant.name.split(' ')[0] || c.author ==='Eva' || c.author === 'Marcus' )).slice(0,1),
                        conferences: allConferences.filter(c => c.hostAlias === foundConsultant.name.split(' ')[0]).slice(0,1),
                    },
                    reviews: foundConsultant.reviews.map((r, i) => ({
                        id: `${foundConsultant.id}-review-${i}`,
                        author: r.author,
                        stars: r.rating,
                        date: r.dateISO,
                        text: r.text
                    })),
                    favorite: isFavorite,
                    yearsExperience: foundConsultant.yearsExperience,
                    country: foundConsultant.country,
                };
                setProfile(consultantProfile);
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
    const scheduleButton = document.getElementById('schedule-button');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      scheduleButton?.focus();
    }
  }

  if (loading) {
    return (
        <div className="container py-8 space-y-8">
            <Skeleton className="h-10 w-48" />
            <div className="flex flex-col md:flex-row gap-8">
                <Skeleton className="h-40 w-40 rounded-full" />
                <div className="flex-1 space-y-4">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-4 w-3/4" />
                     <Skeleton className="h-16 w-full" />
                </div>
            </div>
            <Skeleton className="h-48 w-full" />
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
        <Button variant="ghost" onClick={() => router.push('/discover')} className="mb-6 rounded-full border border-transparent hover:border-accent hover:text-accent">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Discover
        </Button>
        <div className="space-y-8">
            <ConsultantProfileHeader consultant={profile} />
            <ConsultantAvailability consultant={consultant} />
            <ConsultantContentTabs consultant={profile} />

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
