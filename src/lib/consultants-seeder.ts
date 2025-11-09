
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
}

const names = ["Aeliana", "Elara", "Kael", "Seraphina", "Orion", "Lyra", "Caspian", "Thorne"];
const specialties: Consultant['specialties'] = ["Love", "Work", "Health", "Money", "Life Path"];

const createConsultant = (id: number): Consultant => ({
  id: `${id}`,
  nameAlias: names[id % names.length],
  languages: Math.random() > 0.3 ? ["EN", "FR"] : (Math.random() > 0.5 ? ["EN"] : ["FR"]),
  ratePerMin: parseFloat((Math.random() * (10 - 1) + 1).toFixed(2)),
  rating: parseFloat((Math.random() * (5 - 3.8) + 3.8).toFixed(1)),
  online: Math.random() > 0.4,
  specialties: specialties.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1),
  promo: Math.random() > 0.8,
});

export const seedConsultants = () => {
  const consultants: Consultant[] = Array.from({ length: 8 }, (_, i) => createConsultant(i + 1));
  setLocal("consultants", consultants);
};
