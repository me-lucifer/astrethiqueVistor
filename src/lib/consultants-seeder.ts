

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
const zodiacSigns = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const countries = ["France", "USA", "Canada", "UK", "Australia", "Germany", "Spain"];

const cloneConsultant = (base: Consultant, id: string, name: string, price: number, lang: 'EN' | 'FR' | 'BOTH'): Consultant => {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    let languages: Consultant['languages'];
    switch(lang) {
        case 'EN': languages = ['EN']; break;
        case 'FR': languages = ['FR']; break;
        case 'BOTH': languages = ['EN', 'FR']; break;
    }

    return {
        ...base,
        id: slug,
        slug: slug,
        name: name,
        pricePerMin: price,
        languages: languages,
        cover: `https://picsum.photos/seed/${slug}/400/300`,
    };
}


const createConsultant = (index: number): Consultant => {
    const now = new Date();
    const consultantName = names[(index - 1) % names.length];
    
    const simpleAvailability = ['online', 'offline', 'busy', 'online', 'offline', 'online', 'offline', 'busy', 'online', 'offline', 'online', 'offline'][index % 12] as 'online' | 'busy' | 'offline';

    const reviews = [
        { author: 'Jane D.', rating: 5, dateISO: subDays(now, 5).toISOString(), text: 'An amazing and insightful reading!'},
        { author: 'John S.', rating: 4, dateISO: subDays(now, 10).toISOString(), text: 'Very helpful, provided a lot of clarity.'},
    ];
    if (index % 2 === 0) {
        reviews.push({ author: 'Emily R.', rating: 5, dateISO: subDays(now, 2).toISOString(), text: 'Truly gifted and compassionate. Highly recommend!'});
    }

    const specialties: Consultant['specialties'] = ["Love", "Work", "Health", "Money", "Life Path"];
    const languages = index % 3 === 0 
            ? ['EN', 'FR']
            : (index % 3 === 1 ? ['FR'] : ['EN']);


    return {
        id: consultantName.toLowerCase().replace(/\s+/g, '-'),
        slug: consultantName.toLowerCase().replace(/\s+/g, '-'),
        name: consultantName,
        rating: Math.round((4.2 + Math.random() * 0.8) * 10) / 10,
        pricePerMin: Math.round((1.5 + Math.random() * 8.5) * 2) / 2,
        priceWas: index % 4 === 0 ? Math.round((3 + Math.random() * 3) * 2) / 2 : undefined,
        promo24h: index % 5 === 0,
        languages: languages,
        availability: {
            online: simpleAvailability === 'online',
            slots: [],
        },
        specialties: specialties.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 1),
        types: readingTypes.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 1),
        specializesInSigns: zodiacSigns.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 1),
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
        bio: `<h4>What to expect in a session</h4>
<p>I combine <strong>Tarot</strong> and <strong>Astrology</strong> with practical coaching to give you clear, grounded next steps. My style is direct, compassionate, and solutions-oriented.</p>
<ul>
  <li><strong>Special focus:</strong> Love & Relationships, Career pivots, Decision timing.</li>
  <li><strong>Format:</strong> Chat, audio, or video—choose what’s comfortable.</li>
  <li><strong>Outcome:</strong> Actionable insight you can use right away.</li>
</ul>
<p>Clients describe my readings as “accurate, timely, and empowering.”</p>`,
        reviews: reviews,
        content: {
            articles: [{ id: 'a1', title: 'Article 1', tag: 'Love', level: 'Beginner', likes: 10 }],
            podcasts: [{ id: 'p1', title: 'Podcast 1', duration: 15 }],
            conferences: [{ id: 'k1', title: 'Conference 1', scheduleISO: addDays(now, 20).toISOString() }],
        },
        joinedAt: subDays(now, Math.floor(Math.random() * 365) + 30).toISOString(),
        yearsExperience: Math.floor(Math.random() * 15) + 1,
        country: countries[Math.floor(Math.random() * countries.length)],
    };
};

export const seedConsultants = () => {
  if (typeof window === 'undefined') return;

  const seededVersion = getSession('discover.seeded.version');
  const currentVersion = 'v9'; // Increment this version to force re-seeding

  if (seededVersion !== currentVersion) {
    const baseConsultants: Consultant[] = Array.from({ length: 12 }, (_, i) => createConsultant(i + 1));
    
    // Create clones
    const clonedConsultants = [
        cloneConsultant(baseConsultants[0], 'isabelle-leroy-clone', 'Isabelle Leroy', 3.50, 'FR'),
        cloneConsultant(baseConsultants[1], 'marcus-redfield-clone', 'Marcus Redfield', 5.00, 'EN'),
        cloneConsultant(baseConsultants[2], 'chloe-dubois-clone', 'Chloé Dubois', 2.75, 'BOTH'),
        cloneConsultant(baseConsultants[3], 'samuel-jones-clone', 'Samuel Jones', 7.25, 'EN'),
        cloneConsultant(baseConsultants[4], 'eva-green-clone', 'Eva Green', 1.99, 'FR'),
        cloneConsultant(baseConsultants[5], 'liam-chen-clone', 'Liam Chen', 6.50, 'EN'),
        cloneConsultant(baseConsultants[6], 'sofia-rodriguez-clone', 'Sofia Rodriguez', 4.00, 'BOTH'),
        cloneConsultant(baseConsultants[7], 'noah-patel-clone', 'Noah Patel', 8.00, 'EN'),
        cloneConsultant(baseConsultants[8], 'amelie-lacroix-clone', 'Amélie Lacroix', 3.00, 'FR'),
        cloneConsultant(baseConsultants[9], 'ethan-williams-clone', 'Ethan Williams', 5.50, 'EN'),
        cloneConsultant(baseConsultants[10], 'olivia-martin-clone', 'Olivia Martin', 2.25, 'BOTH'),
        cloneConsultant(baseConsultants[11], 'william-brown-clone', 'William Brown', 7.75, 'EN'),
    ];

    const consultants = [...baseConsultants, ...clonedConsultants];

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
