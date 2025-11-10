
"use client";

import { setSession, getSession } from "./session";
import { Consultant } from "./consultants";
import { addDays, addHours, format, subDays, parseISO } from 'date-fns';

const createConsultant = (index: number): Consultant => {
    const now = new Date();
    const isOnline = index % 3 === 0;
    const specialties: Consultant['specialties'] = ["Love", "Work", "Health", "Money", "Life Path"];
    const consultantName = `Consultant ${index}`;
    
    // Create a version of availability compatible with the card and list views.
    // The profile page will add more complex availability data.
    const simpleAvailability = ['online', 'busy', 'offline'][index % 3] as 'online' | 'busy' | 'offline';

    const reviews = [
        { author: 'Jane D.', rating: 5, dateISO: subDays(now, 5).toISOString(), text: 'An amazing and insightful reading!'},
        { author: 'John S.', rating: 4, dateISO: subDays(now, 10).toISOString(), text: 'Very helpful, provided a lot of clarity.'},
    ];
    if (index % 2 === 0) {
        reviews.push({ author: 'Emily R.', rating: 5, dateISO: subDays(now, 2).toISOString(), text: 'Truly gifted and compassionate. Highly recommend!'});
    }


    return {
        id: `c${index}`,
        slug: `consultant-${index}`,
        name: consultantName,
        rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
        pricePerMin: Math.round((1.5 + Math.random() * 3.5) * 2) / 2,
        priceWas: index % 4 === 0 ? Math.round((3 + Math.random() * 3) * 2) / 2 : undefined,
        promo24h: index % 5 === 0,
        languages: index % 2 === 0 
            ? [{ code: 'EN', level: 'native' }, { code: 'FR', level: 'fluent' }]
            : [{ code: 'EN', level: 'native' }],
        availability: { // This will be overwritten on the profile page for demo purposes
            online: simpleAvailability === 'online',
            slots: [], // Empty for list view, profile page will generate them.
        },
        specialties: specialties.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1),
        badges: ['New', 'Top Rated', 'Rising Star', 'Promo 24h'].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 1),
        contentCounts: {
            articles: Math.floor(Math.random() * 10),
            podcasts: Math.floor(Math.random() * 5),
            conferences: Math.floor(Math.random() * 3),
        },
        cover: `https://picsum.photos/seed/consultant${index}/400/300`,
        kycVerified: Math.random() > 0.2,
        adminApproved: Math.random() > 0.1,
        lastReviewDate: format(subDays(now, Math.floor(Math.random() * 90)), 'yyyy-MM-dd'),
        bio: `This is a short bio for ${consultantName}. They are an expert in ${specialties.join(', ')} and have been practicing for over ${Math.floor(Math.random()*10)+2} years.`,
        reviews: reviews,
        content: {
            articles: [{ id: 'a1', title: 'Article 1', tag: 'Love', level: 'Beginner', likes: 10 }],
            podcasts: [{ id: 'p1', title: 'Podcast 1', duration: 15 }],
            conferences: [{ id: 'k1', title: 'Conference 1', scheduleISO: addDays(now, 20).toISOString() }],
        },
        joinedAt: subDays(now, Math.floor(Math.random() * 365)).toISOString(),
    };
};

export const seedConsultants = () => {
  if (typeof window === 'undefined') return;

  const seeded = getSession('discover.seeded.v1');
  if (!seeded) {
    const consultants: Consultant[] = Array.from({ length: 12 }, (_, i) => createConsultant(i + 1));
    
    setSession('discover.seed.v1', consultants);
    setSession('discover.favorites.v1', []);
    setSession('schedule.holds.v1', []);
    setSession('notify.me.v1', []);
    setSession('discover.filters.v1', {});
    setSession('discover.sort.v1', 'recommended');

    setSession('discover.seeded.v1', true);
  }
};
