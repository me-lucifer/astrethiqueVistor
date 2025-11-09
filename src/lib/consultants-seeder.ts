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
    }

    // Specific overrides for demo purposes
    switch(id) {
        case 1: // Online, Promo, high rating
            consultant = { ...consultant, languages: ["EN", "FR"], ratePerMin: 3.50, rating: 4.9, online: true, promo: true };
            break;
        case 2: // FR only
            consultant = { ...consultant, languages: ["FR"], ratePerMin: 2.75, rating: 4.6, online: true, promo: false };
            break;
        case 3: // High price
            consultant = { ...consultant, languages: ["EN"], ratePerMin: 9.50, rating: 4.8, online: false, promo: false };
            break;
        case 4: // Lower rating
             consultant = { ...consultant, languages: ["EN"], ratePerMin: 1.50, rating: 3.9, online: true, promo: false };
            break;
        case 5: // high rating, offline, promo
             consultant = { ...consultant, languages: ["EN", "FR"], ratePerMin: 5.20, rating: 4.9, online: false, promo: true };
             break;
        default: // Randomize the rest
             consultant = {
                ...consultant,
                languages: Math.random() > 0.3 ? ["EN", "FR"] : (Math.random() > 0.5 ? ["EN"] : ["FR"]),
                ratePerMin: parseFloat((Math.random() * (8 - 2) + 2).toFixed(2)),
                rating: parseFloat((Math.random() * (5 - 3.8) + 3.8).toFixed(1)),
                online: Math.random() > 0.4,
                promo: Math.random() > 0.8,
            }
    }
    return consultant as Consultant;
};

export const seedConsultants = () => {
  const consultants: Consultant[] = Array.from({ length: 12 }, (_, i) => createConsultant(i + 1));
  setLocal("consultants", consultants);
};
