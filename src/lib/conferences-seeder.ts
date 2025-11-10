
"use client";

import { setLocal } from "./local";
import { addDays, addMinutes, subMinutes, addHours } from "date-fns";

export interface Conference {
  id: string;
  title: string;
  dateISO: string;
  hostAlias: string;
  hostRating: number;
  tags: ("Love" | "Work" | "Health" | "Money" | "Life Path")[];
  type: "Workshop" | "Group Reading" | "Webinar" | "Q&A";
  language: "EN" | "FR";
  price: number;
  isFree: boolean; // Derived from price
  excerpt: string;
  capacity: number;
  seatsAvailable: boolean;
  recordingAvailable: boolean;
}

const conferenceTitles = [
    "Mastering Your Inner Self",
    "Astrology for Modern Love",
    "Career Paths in the Stars",
    "Wellness and the Zodiac",
    "Financial Astrology 101",
    "The Planetary Hours: A Practical Guide",
    "Understanding Your North Node",
    "Love & Compatibility: A Synastry Workshop",
    "Manifesting Abundance with Jupiter",
    "Navigating Saturn Returns",
    "The Moon's Phases & Your Emotions",
    "Introduction to Medical Astrology"
];

const excerpts = [
    "Discover techniques to align with your true purpose and unlock your potential in this deep-dive session.",
    "Learn how Venus and Mars influence your relationships and how to foster deeper, more meaningful connections.",
    "Explore how planetary placements can guide you toward a fulfilling and successful career path.",
    "A holistic look at how astrological cycles can support your physical and mental well-being every day.",
    "An introductory course on using astrology to understand and improve your personal financial situation.",
    "Learn to harness the energy of each day by understanding the planetary rulers of the hours.",
    "Your North Node represents your soul's purpose. This workshop helps you find and follow it.",
    "Dive deep into chart comparison techniques to understand the dynamics of your relationships.",
    "Tap into the expansive energy of Jupiter to attract more prosperity and luck into your life.",
    "Your Saturn Return is a major life milestone. Learn how to navigate this transformative period with grace.",
    "Explore the connection between the lunar cycle and your emotional landscape for greater self-awareness.",
    "An overview of how astrology can provide powerful insights into health and constitutional predispositions."
];

const hosts = ["Aeliana", "Kael", "Seraphina", "Orion", "Elara", "Lyra", "Caspian", "Marcus", "Eva"];
const tags: Conference['tags'] = ["Love", "Work", "Health", "Money", "Life Path"];
const types: Conference['type'][] = ["Workshop", "Group Reading", "Webinar", "Q&A"];


const createConference = (id: number): Conference => {
    const now = new Date();
    let date: Date;
    const price = id % 3 === 0 ? 0 : Math.floor(Math.random() * 80) + 20;

    switch(id) {
        case 1: // Starting in 5 minutes
            date = addMinutes(now, 5);
            break;
        case 2: // Today
            date = addHours(now, 3);
            break;
        case 3: // This week
            date = addDays(now, 3);
            break;
        case 4: // This week
            date = addDays(now, 5);
            break;
        case 5: // This month
            date = addDays(now, 12);
            break;
        case 6: // This month
            date = addDays(now, 20);
            break;
        default:
             date = addDays(now, Math.floor(Math.random() * 28) + 1);
    }

    return {
        id: `${id}`,
        title: conferenceTitles[(id-1) % conferenceTitles.length],
        dateISO: date.toISOString(),
        hostAlias: hosts[(id-1) % hosts.length],
        hostRating: Math.round((4.0 + Math.random()) * 10) / 10,
        tags: tags.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 1),
        type: types[id % types.length],
        language: (id % 3 === 0) ? "FR" : "EN",
        price,
        isFree: price === 0,
        excerpt: excerpts[(id-1) % excerpts.length],
        capacity: Math.floor(Math.random() * 50) + 10,
        seatsAvailable: Math.random() > 0.3,
        recordingAvailable: Math.random() > 0.5,
    }
};

export const seedConferences = () => {
  const conferences: Conference[] = Array.from({ length: 12 }, (_, i) => createConference(i + 1));
  setLocal("conferences", conferences);
};
