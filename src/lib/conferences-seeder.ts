
"use client";

import { setLocal } from "./local";
import { addDays } from "date-fns";

export interface Conference {
  id: string;
  title: string;
  dateISO: string;
  hostAlias: string;
  tags: ("Love" | "Work" | "Health" | "Money" | "Life Path")[];
  language: "EN" | "FR";
}

const conferenceTitles = [
    "Mastering Your Inner Self",
    "Astrology for Modern Love",
    "Career Paths in the Stars",
    "Wellness and the Zodiac",
    "Financial Astrology 101",
];

const hosts = ["Aeliana", "Kael", "Seraphina", "Orion", "Elara"];
const tags: Conference['tags'] = ["Love", "Work", "Health", "Money", "Life Path"];


const createConference = (id: number): Conference => {
    const now = new Date();
    return {
        id: `${id}`,
        title: conferenceTitles[id % conferenceTitles.length],
        dateISO: addDays(now, Math.floor(Math.random() * 30) + 1).toISOString(),
        hostAlias: hosts[id % hosts.length],
        tags: tags.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 1),
        language: Math.random() > 0.5 ? "EN" : "FR",
    }
};

export const seedConferences = () => {
  const conferences: Conference[] = Array.from({ length: 5 }, (_, i) => createConference(i + 1));
  setLocal("conferences", conferences);
};
