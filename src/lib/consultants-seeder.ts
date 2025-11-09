import { setLocal } from "./local";

export interface Consultant {
  id: string;
  nameAlias: string;
  languages: ("EN" | "FR")[];
  ratePerMin: number;
  rating: number;
  online: boolean;
  specialties: ("Love" | "Work" | "Health" | "Money" | "Life Path")[];
  promo: boolean;
  location: string;
  sessionsCount: number;
  shortBlurb: string;
  newest: boolean;
  adminApproved: boolean;
  kycVerified: boolean;
  lastReviewDate: string;
  bio: string;
  content?: {
    articles: number;
    podcasts: number;
    conferences: number;
  };
}

const names = ["Aeliana", "Elara", "Kael", "Seraphina", "Orion", "Lyra", "Caspian", "Thorne", "Astrid", "Rylan", "Mira", "Jax"];
const specialties: Consultant['specialties'] = ["Love", "Work", "Health", "Money", "Life Path"];
const locations = ["FR", "IN", "US", "UK", "CA", "DE"];
const blurbs = [
    "Guiding you to clarity with kindness and insight.",
    "Deep listener for matters of the heart and soul.",
    "Strategic advice for your career and financial path.",
    "Helping you find balance and wellness in daily life.",
    "Unlocking your hidden potential and life's purpose.",
]
const bios = [
    "<p>With over a decade of experience in spiritual guidance, Aeliana specializes in matters of the heart and personal growth. Her compassionate approach combines traditional tarot with modern coaching techniques to help you navigate life's challenges.</p><p>She believes everyone has the power to create their own destiny and is passionate about empowering her clients to find their own inner wisdom.</p>",
    "<p>Kael is a certified astrologer and numerologist with a focus on career and financial planning. He uses planetary alignments and life path numbers to provide strategic advice that helps clients achieve their professional and monetary goals.</p><p>His sessions are practical, insightful, and geared towards tangible results.</p>",
];

const createConsultant = (id: number): Consultant => {
    const baseConsultant = {
        id: `${id}`,
        nameAlias: names[id % names.length],
        specialties: specialties.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1),
        location: locations[id % locations.length],
        sessionsCount: Math.floor(Math.random() * 500) + 20,
        shortBlurb: blurbs[id % blurbs.length],
        bio: bios[id % bios.length],
        newest: id > 9,
        adminApproved: true,
        kycVerified: id % 2 === 0,
        lastReviewDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        content: {
            articles: Math.floor(Math.random() * 5),
            podcasts: Math.floor(Math.random() * 3),
            conferences: Math.floor(Math.random() * 2),
        },
        // Default values that will be overridden
        languages: [] as ("EN" | "FR")[],
        ratePerMin: 0,
        rating: 0,
        online: false,
        promo: false,
    };

    let specificOverrides: Partial<Consultant> = {};

    // Specific overrides for demo purposes
    switch(id) {
        // EN-only (3)
        case 1: 
            specificOverrides = { languages: ["EN"], ratePerMin: 4.80, rating: 4.9, online: true, promo: true, specialties: ["Love", "Life Path"], sessionsCount: 480 };
            break;
        case 2:
            specificOverrides = { languages: ["EN"], ratePerMin: 2.20, rating: 4.2, online: true, promo: false, specialties: ["Work", "Money"], sessionsCount: 150 };
            break;
        case 3:
            specificOverrides = { languages: ["EN"], ratePerMin: 3.80, rating: 3.8, online: false, promo: false, specialties: ["Health"], sessionsCount: 88 };
            break;
        
        // FR-only (3)
        case 4: 
            specificOverrides = { languages: ["FR"], ratePerMin: 4.50, rating: 4.8, online: true, promo: false, specialties: ["Love", "Health"], sessionsCount: 320 };
            break;
        case 5:
            specificOverrides = { languages: ["FR"], ratePerMin: 2.10, rating: 4.0, online: false, promo: true, specialties: ["Work"], sessionsCount: 210 };
            break;
        case 6:
            specificOverrides = { languages: ["FR"], ratePerMin: 3.90, rating: 3.5, online: false, promo: false, specialties: ["Money"], sessionsCount: 55 };
            break;

        // Bilingual (3)
        case 7:
            specificOverrides = { languages: ["EN", "FR"], ratePerMin: 4.90, rating: 4.9, online: true, promo: true, specialties: ["Life Path", "Work"], sessionsCount: 600 }; 
            break;
        case 8:
            specificOverrides = { languages: ["EN", "FR"], ratePerMin: 2.50, rating: 4.5, online: false, promo: false, specialties: ["Love"], sessionsCount: 250 };
            break;
        case 9:
            specificOverrides = { languages: ["EN", "FR"], ratePerMin: 3.00, rating: 4.1, online: true, promo: false, specialties: ["Health", "Money"], sessionsCount: 180 };
            break;

        // Remaining mix (3) - these are "newest"
        case 10:
            specificOverrides = { languages: ["EN"], ratePerMin: 2.80, rating: 3.2, online: false, promo: false, specialties: ["Love"], sessionsCount: 25 }; 
            break;
        case 11:
            specificOverrides = { languages: ["FR"], ratePerMin: 4.70, rating: 4.6, online: true, promo: false, specialties: ["Work", "Life Path"], sessionsCount: 15 };
            break;
        case 12:
            specificOverrides = { languages: ["EN", "FR"], ratePerMin: 11.90, rating: 4.3, online: false, promo: false, specialties: ["Money"], sessionsCount: 5 };
            break;
    }
    return { ...baseConsultant, ...specificOverrides };
};

export const seedConsultants = () => {
  const consultants: Consultant[] = Array.from({ length: 12 }, (_, i) => createConsultant(i + 1));
  setLocal("consultants", consultants);
};
