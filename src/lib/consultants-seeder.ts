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
  content: {
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

const createConsultant = (id: number): Consultant => {
    let consultant: Partial<Consultant> = {
        id: `${id}`,
        nameAlias: names[id % names.length],
        specialties: specialties.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1),
        location: locations[id % locations.length],
        sessionsCount: Math.floor(Math.random() * 500) + 20,
        shortBlurb: blurbs[id % blurbs.length],
        newest: id > 9, // Mark last 3 as "newest"
        content: {
            articles: Math.floor(Math.random() * 5),
            podcasts: Math.floor(Math.random() * 3),
            conferences: Math.floor(Math.random() * 2),
        }
    }

    // Specific overrides for demo purposes
    switch(id) {
        // EN-only (3)
        case 1: 
            consultant = { ...consultant, languages: ["EN"], ratePerMin: 4.80, rating: 4.9, online: true, promo: true, specialties: ["Love", "Life Path"], sessionsCount: 480 };
            break;
        case 2:
            consultant = { ...consultant, languages: ["EN"], ratePerMin: 2.20, rating: 4.2, online: true, promo: false, specialties: ["Work", "Money"], sessionsCount: 150 };
            break;
        case 3:
            consultant = { ...consultant, languages: ["EN"], ratePerMin: 3.80, rating: 3.8, online: false, promo: false, specialties: ["Health"], sessionsCount: 88 };
            break;
        
        // FR-only (3)
        case 4: 
            consultant = { ...consultant, languages: ["FR"], ratePerMin: 4.50, rating: 4.8, online: true, promo: false, specialties: ["Love", "Health"], sessionsCount: 320 };
            break;
        case 5:
            consultant = { ...consultant, languages: ["FR"], ratePerMin: 2.10, rating: 4.0, online: false, promo: true, specialties: ["Work"], sessionsCount: 210 };
            break;
        case 6:
            consultant = { ...consultant, languages: ["FR"], ratePerMin: 3.90, rating: 3.5, online: false, promo: false, specialties: ["Money"], sessionsCount: 55 };
            break;

        // Bilingual (3)
        case 7:
            consultant = { ...consultant, languages: ["EN", "FR"], ratePerMin: 11.90, rating: 4.9, online: true, promo: true, specialties: ["Life Path", "Work"], sessionsCount: 600 }; 
            break;
        case 8:
            consultant = { ...consultant, languages: ["EN", "FR"], ratePerMin: 2.50, rating: 4.5, online: false, promo: false, specialties: ["Love"], sessionsCount: 250 };
            break;
        case 9:
            consultant = { ...consultant, languages: ["EN", "FR"], ratePerMin: 3.00, rating: 4.1, online: true, promo: false, specialties: ["Health", "Money"], sessionsCount: 180 };
            break;

        // Remaining mix (3) - these are "newest"
        case 10:
            consultant = { ...consultant, languages: ["EN"], ratePerMin: 2.80, rating: 3.2, online: false, promo: false, specialties: ["Love"], sessionsCount: 25 }; 
            break;
        case 11:
            consultant = { ...consultant, languages: ["FR"], ratePerMin: 4.70, rating: 4.6, online: true, promo: false, specialties: ["Work", "Life Path"], sessionsCount: 15 };
            break;
        case 12:
            consultant = { ...consultant, languages: ["EN", "FR"], ratePerMin: 2.40, rating: 4.3, online: false, promo: false, specialties: ["Money"], sessionsCount: 5 };
            break;
    }
    return consultant as Consultant;
};

export const seedConsultants = () => {
  const consultants: Consultant[] = Array.from({ length: 12 }, (_, i) => createConsultant(i + 1));
  setLocal("consultants", consultants);
};

    