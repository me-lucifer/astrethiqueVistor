

"use client";

import { setSession, getSession } from "./session";
import { Consultant } from "./consultants";
import { addDays, addHours, format, subDays, parseISO } from 'date-fns';

const names = [
    "Aeliana Rose", "Kaelen Vance", "Seraphina Moon", "Orion Blackwood", 
    "Elara Solstice", "Lyra Meadow", "Caspian Sage", "Astrid Belle",
    "Ronan Rivers", "Fiona Glen", "Julian Croft", "Maya Dane"
];

const readingTypes = ["Astrology","Tarot Reading","Numerology","Clairvoyance","Mediumship"];

const createConsultant = (index: number): Consultant => {
    const now = new Date();
    const consultantName = names[(index - 1) % names.length];
    
    const simpleAvailability = ['online', 'busy', 'offline', 'online'][index % 4] as 'online' | 'busy' | 'offline';

    const reviews = [
        { author: 'Jane D.', rating: 5, dateISO: subDays(now, 5).toISOString(), text: 'An amazing and insightful reading!'},
        { author: 'John S.', rating: 4, dateISO: subDays(now, 10).toISOString(), text: 'Very helpful, provided a lot of clarity.'},
    ];
    if (index % 2 === 0) {
        reviews.push({ author: 'Emily R.', rating: 5, dateISO: subDays(now, 2).toISOString(), text: 'Truly gifted and compassionate. Highly recommend!'});
    }

    const specialties: Consultant['specialties'] = ["Love", "Work", "Health", "Money", "Life Path"];

    return {
        id: consultantName.toLowerCase().replace(/\s+/g, '-'),
        slug: consultantName.toLowerCase().replace(/\s+/g, '-'),
        name: consultantName,
        rating: Math.round((4.2 + Math.random() * 0.8) * 10) / 10,
        pricePerMin: Math.round((1.5 + Math.random() * 3.5) * 2) / 2,
        priceWas: index % 4 === 0 ? Math.round((3 + Math.random() * 3) * 2) / 2 : undefined,
        promo24h: index % 5 === 0,
        languages: index % 2 === 0 
            ? [{ code: 'EN', level: 'native' }, { code: 'FR', level: 'fluent' }]
            : [{ code: 'EN', level: 'native' }],
        availability: {
            online: simpleAvailability === 'online',
            slots: [],
        },
        specialties: specialties.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 1),
        types: readingTypes.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 1),
        badges: ['New', 'Top Rated', 'Rising Star', 'Promo 24h'].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2)),
        contentCounts: {
            articles: Math.floor(Math.random() * 10),
            podcasts: Math.floor(Math.random() * 5),
            conferences: Math.floor(Math.random() * 3),
        },
        cover: `https://picsum.photos/seed/${consultantName.replace(' ','-')}/400/300`,
        kycVerified: Math.random() > 0.2,
        adminApproved: Math.random() > 0.1,
        lastReviewDate: subDays(now, Math.floor(Math.random() * 90)).toISOString(),
        bio: `This is a short bio for ${consultantName}. They are an expert in ${specialties.join(', ')} and have been practicing for over ${Math.floor(Math.random()*10)+2} years.`,
        reviews: reviews,
        content: {
            articles: [{ id: 'a1', title: 'Article 1', tag: 'Love', level: 'Beginner', likes: 10 }],
            podcasts: [{ id: 'p1', title: 'Podcast 1', duration: 15 }],
            conferences: [{ id: 'k1', title: 'Conference 1', scheduleISO: addDays(now, 20).toISOString() }],
        },
        joinedAt: subDays(now, Math.floor(Math.random() * 365) + 30).toISOString(),
    };
};

export const seedConsultants = () => {
  if (typeof window === 'undefined') return;

  const seededVersion = getSession('discover.seeded.version');
  const currentVersion = 'v3'; // Increment this version to force re-seeding

  if (seededVersion !== currentVersion) {
    const consultants: Consultant[] = Array.from({ length: 12 }, (_, i) => createConsultant(i + 1));
    
    setSession('discover.seed.v1', consultants);
    setSession('discover.favorites.v1', []);
    setSession('schedule.holds.v1', []);
    setSession('notify.me.v1', []);
    setSession('discover.filters.v1', {});
    setSession('discover.sort.v1', 'recommended');
    setSession('discover.types.v1', readingTypes);

    setSession('discover.seeded.version', currentVersion);
  }
};
