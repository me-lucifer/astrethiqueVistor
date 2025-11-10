"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getSession, setSession } from '@/lib/session';

// Define the data model interfaces based on the provided structure
interface ContentItem {
  id: string;
  title: string;
  tags: string[];
  likes: number;
  cover: string;
}

interface Podcast extends ContentItem {
  duration: string;
}

interface Conference extends ContentItem {
  date: string;
  time: string;
}

interface Review {
  id: string;
  author: string;
  stars: number;
  date: string;
  text: string;
}

interface ConsultantProfile {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  badges: string[];
  rating: number;
  reviewsCount: number;
  languages: string[];
  pricePerMin: number;
  prevPricePerMin?: number;
  summary: string;
  specialties: string[];
  verifications: {
    adminApproved: boolean;
    kycVerified: boolean;
    lastReview: string;
  };
  nextSlots: string[];
  content: {
    articles: ContentItem[];
    podcasts: Podcast[];
    conferences: Conference[];
  };
  reviews: Review[];
  favorite: boolean;
}

const seedConsultantProfile = () => {
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
    favorite: false
  };
  setSession("consultantProfile", profile);
  return profile;
}

export default function Page() {
  const params = useParams();
  const { id } = params;
  const [consultant, setConsultant] = useState<ConsultantProfile | null>(null);

  useEffect(() => {
    let profile = getSession<ConsultantProfile>("consultantProfile");
    if (!profile) {
      profile = seedConsultantProfile();
    }
    
    // In a real app, you'd fetch the specific consultant by `id`
    // For this prototype, we'll just use the seeded profile if the id matches
    if (profile && profile.id === id) {
        setConsultant(profile);
    } else {
        // Handle case where profile for `id` doesn't exist.
        // For now, we can show the seeded one as a fallback for demo purposes.
        setConsultant(profile);
    }

  }, [id]);

  if (!consultant) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-4">{consultant.name}</h1>
      <p>Profile page for ID: {id}</p>
      <pre className="bg-muted p-4 rounded-lg mt-4 text-xs overflow-auto">
        {JSON.stringify(consultant, null, 2)}
      </pre>
    </div>
  );
}
