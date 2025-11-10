
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSession, setSession } from '@/lib/session';
import { ConsultantProfile } from '@/lib/consultant-profile';
import { ConsultantProfileHeader } from '@/components/consultant-profile/consultant-profile-header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PlaceholderPage } from '@/components/placeholder-page';

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
      { id:"r3", author:"Sophie R.", stars:4, date:"2024-07-25", text:"Elena was kind and patient; her reading resonated with my situation." }
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
  const [consultant, setConsultant] = useState<ConsultantProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let profile = getSession<ConsultantProfile>("consultantProfile");
    
    // Seed if no profile exists or if the ID doesn't match the demo ID
    if (!profile || profile.id !== id) {
      profile = seedConsultantProfile();
    }
    
    if (profile && profile.id === id) {
        setConsultant(profile);
    } else {
        // Fallback for demo purposes if the ID is somehow wrong.
        setConsultant(profile);
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
        <div className="container py-8 space-y-8">
            <Skeleton className="h-10 w-48" />
            <div className="flex flex-col md:flex-row gap-8">
                <Skeleton className="h-32 w-32 rounded-full" />
                <div className="flex-1 space-y-4">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
            <Skeleton className="h-48 w-full" />
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
        <Button variant="ghost" onClick={() => router.push('/discover')} className="mb-6 rounded-full border border-transparent hover:border-accent hover:text-accent">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Discover
        </Button>
        <div className="space-y-8">
            <ConsultantProfileHeader consultant={consultant} />
            {/* The rest of the page components will go here */}
             <pre className="bg-muted p-4 rounded-lg mt-4 text-xs overflow-auto">
                {JSON.stringify(consultant, null, 2)}
            </pre>
        </div>
    </div>
  );
}
