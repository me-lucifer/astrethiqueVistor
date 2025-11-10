
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


// This is the same seeder function from the previous step,
// now used within the page component for self-containment.
const seedConsultantProfile = (): ConsultantProfile => {
  const profile: ConsultantProfile = {
    id: "elena-voyance",
    name: "Elena Voyance",
    avatar: "https://picsum.photos/seed/elena/160",
    isOnline: true,
    badges: ["Top Rated", "Promo 24h"],
    rating: 4.8,
    reviewsCount: 1207,
    languages: ["FR", "EN"],
    pricePerMin: 1.99,
    prevPricePerMin: 2.50,
    summary: "A compassionate and insightful clairvoyant with over 15 years of experience, dedicated to providing clarity and guidance on your life path.",
    specialties: ["Tarot Reader", "Clairvoyant", "Medium"],
    verifications: { adminApproved: true, kycVerified: true, lastReview: "July 28, 2024" },
    nextSlots: ["Today 14:00","Today 14:30","Today 15:00"],
    content: {
      articles: [
        { id:"a1", title:"Navigating the Houses of the Zodiac", tags:["Astrology","Beginner"], likes:128, cover:"https://picsum.photos/seed/house/480/320" },
        { id:"a2", title:"Understanding Your North Node", tags:["Astrology","Advanced"], likes:98, cover:"https://picsum.photos/seed/northnode/480/320" }
      ],
      podcasts: [
        { id:"p1", title:"Cosmic Currents: Retrogrades", duration:"28 min", tags:["Planets","Spirituality"], likes:58, cover:"https://picsum.photos/seed/podcast/480/320" }
      ],
      conferences: [
        { id:"c1", title:"The Future of Tarot: 2025", date:"Sep 5, 2025", time:"18:00", tags:["Tarot","Future"], cover:"https://picsum.photos/seed/conf/480/320" }
      ]
    },
    reviews: [
      { id:"r1", author:"Jessica M.", stars:5, date:"2024-07-30", text:"An incredibly enlightening session. Elena’s insights were spot on and gave me the clarity I was searching for. Highly recommended!" },
      { id:"r2", author:"David C.", stars:5, date:"2024-07-28", text:"She is the real deal. Her guidance was both profound and practical." },
      { id:"r3", author:"Sophie R.", stars:4, date:"2024-07-25", text:"Elena was kind and patient; her reading resonated with my situation." },
      { id:"r4", author:"Marc L.", stars:5, date:"2024-07-22", text:"I've had readings with others before, but Elena has a unique gift. Truly exceptional." },
      { id:"r5", author:"Isabelle G.", stars:5, date:"2024-07-20", text:"Her advice was not only accurate but also actionable. I feel much more confident about my path forward. Thank you, Elena!" }
    ],
    favorite: getSession<string[]>("consultantFavorites")?.includes("elena-voyance") || false
  };
  setSession("consultantProfile", profile);
  return profile;
}

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { toast } = useToast();
  const [consultant, setConsultant] = useState<ConsultantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    let profile = getSession<ConsultantProfile>("consultantProfile");
    
    if (!profile || profile.id !== id) {
      profile = seedConsultantProfile();
    }
    
    if (profile && profile.id === id) {
        setConsultant(profile);
    } else {
        setConsultant(profile);
    }
    setLoading(false);
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

    const mockConsultant: Consultant | null = useMemo(() => {
        if (!consultant) return null;
        return {
            id: consultant.id,
            slug: consultant.id,
            name: consultant.name,
            rating: consultant.rating,
            pricePerMin: consultant.pricePerMin,
            priceWas: consultant.prevPricePerMin,
            languages: consultant.languages.map(l => ({ code: l as any, level: 'fluent' })),
            availability: {
                online: consultant.isOnline,
                slots: Array.from({length: 12}, (_, i) => {
                    const now = new Date();
                    return new Date(now.getTime() + (i * 30 + (i > 5 ? 1440 : 120) ) * 60000).toISOString()
                })
            },
            specialties: consultant.specialties as any,
            types: [],
            specializesInSigns: [],
            badges: consultant.badges as any,
            contentCounts: { articles: 0, podcasts: 0, conferences: 0},
            cover: '',
            kycVerified: consultant.verifications.kycVerified,
            adminApproved: consultant.verifications.adminApproved,
            lastReviewDate: new Date().toISOString(),
            bio: '',
            reviews: [],
            content: {articles: [], podcasts: [], conferences: []},
            joinedAt: new Date().toISOString()
        }
    }, [consultant]);

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

  if (!consultant || !mockConsultant) {
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
            <ConsultantProfileHeader consultant={consultant} />
            <ConsultantAvailability consultant={mockConsultant} />
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
