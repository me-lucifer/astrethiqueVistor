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
        // EN-only (3)
        case 1: 
            consultant = { ...consultant, languages: ["EN"], ratePerMin: 4.80, rating: 4.9, online: true, promo: true, specialties: ["Love", "Life Path"] }; // Online, Promo, high rating
            break;
        case 2:
            consultant = { ...consultant, languages: ["EN"], ratePerMin: 2.20, rating: 4.2, online: true, promo: false, specialties: ["Work", "Money"] };
            break;
        case 3:
            consultant = { ...consultant, languages: ["EN"], ratePerMin: 3.50, rating: 3.8, online: false, promo: false, specialties: ["Health"] };
            break;
        
        // FR-only (3)
        case 4: 
            consultant = { ...consultant, languages: ["FR"], ratePerMin: 4.50, rating: 4.8, online: true, promo: false, specialties: ["Love", "Health"] };
            break;
        case 5:
            consultant = { ...consultant, languages: ["FR"], ratePerMin: 2.10, rating: 4.0, online: false, promo: true, specialties: ["Work"] };
            break;
        case 6:
            consultant = { ...consultant, languages: ["FR"], ratePerMin: 3.90, rating: 3.5, online: false, promo: false, specialties: ["Money"] };
            break;

        // Bilingual (3)
        case 7:
            consultant = { ...consultant, languages: ["EN", "FR"], ratePerMin: 4.90, rating: 4.9, online: true, promo: true, specialties: ["Life Path", "Work"] }; // Online, promo, high price/rating
            break;
        case 8:
            consultant = { ...consultant, languages: ["EN", "FR"], ratePerMin: 2.50, rating: 4.5, online: false, promo: false, specialties: ["Love"] };
            break;
        case 9:
            consultant = { ...consultant, languages: ["EN", "FR"], ratePerMin: 3.00, rating: 4.1, online: true, promo: false, specialties: ["Health", "Money"] };
            break;

        // Remaining mix (3)
        case 10:
            consultant = { ...consultant, languages: ["EN"], ratePerMin: 2.80, rating: 3.2, online: false, promo: false, specialties: ["Love"] }; // Low rating
            break;
        case 11:
            consultant = { ...consultant, languages: ["FR"], ratePerMin: 4.70, rating: 4.6, online: true, promo: false, specialties: ["Work", "Life Path"] };
            break;
        case 12:
            consultant = { ...consultant, languages: ["EN", "FR"], ratePerMin: 2.40, rating: 4.3, online: false, promo: false, specialties: ["Money"] };
            break;

        default: // Should not happen with length 12
             consultant = {
                ...consultant,
                languages: Math.random() > 0.3 ? ["EN", "FR"] : (Math.random() > 0.5 ? ["EN"] : ["FR"]),
                ratePerMin: parseFloat((Math.random() * (4.9 - 2.1) + 2.1).toFixed(2)),
                rating: parseFloat((Math.random() * (4.9 - 3.2) + 3.2).toFixed(1)),
                online: Math.random() > 0.5,
                promo: Math.random() > 0.7,
            }
    }
    return consultant as Consultant;
};

export const seedConsultants = () => {
  const consultants: Consultant[] = Array.from({ length: 12 }, (_, i) => createConsultant(i + 1));
  setLocal("consultants", consultants);
};
