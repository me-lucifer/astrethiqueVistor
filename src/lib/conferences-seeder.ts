
"use client";

import { setLocal } from "./local";
import { addDays, addMinutes, subMinutes } from "date-fns";

export interface Conference {
  id: string;
  title: string;
  dateISO: string;
  hostAlias: string;
  tags: ("Love" | "Work" | "Health" | "Money" | "Life Path")[];
  language: "EN" | "FR";
  isFree: boolean;
  excerpt: string;
  capacity: number;
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
    "Discover techniques to align with your true purpose and unlock your potential.",
    "Learn how Venus and Mars influence your relationships and how to foster deeper connections.",
    "Explore how planetary placements can guide you toward a fulfilling career path.",
    "A holistic look at how astrological cycles can support your physical and mental well-being.",
    "An introductory course on using astrology to understand and improve your financial situation.",
    "Learn to harness the energy of each day by understanding the planetary rulers of the hours.",
    "Your North Node represents your soul's purpose. This workshop helps you find and follow it.",
    "Dive deep into chart comparison techniques to understand relationship dynamics.",
    "Tap into the expansive energy of Jupiter to attract more prosperity and luck into your life.",
    "Your Saturn Return is a major life milestone. Learn how to navigate this transformative period.",
    "Explore the connection between the lunar cycle and your emotional landscape for greater self-awareness.",
    "An overview of how astrology can provide insights into health and constitutional predispositions."
];

const hosts = ["Aeliana", "Kael", "Seraphina", "Orion", "Elara", "Lyra", "Caspian"];
const tags: Conference['tags'] = ["Love", "Work", "Health", "Money", "Life Path"];


const createConference = (id: number): Conference => {
    const now = new Date();
    const isStartingSoon = id === 1;
    const isToday = id === 2;
    let date: Date;

    if (isStartingSoon) {
        date = addMinutes(now, 8); // Starts in 8 minutes
    } else if (isToday) {
        date = addMinutes(now, Math.floor(Math.random() * 8) + 2 * 60); // Today, in a few hours
    }
    else {
        date = addDays(now, Math.floor(Math.random() * 45) + 1); // Sometime in the next 45 days
    }


    return {
        id: `${id}`,
        title: conferenceTitles[id % conferenceTitles.length],
        dateISO: date.toISOString(),
        hostAlias: hosts[id % hosts.length],
        tags: tags.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 1),
        language: Math.random() > 0.5 ? "EN" : "FR",
        isFree: Math.random() > 0.4, // 60% are free
        excerpt: excerpts[id % excerpts.length],
        capacity: Math.floor(Math.random() * 50) + 10,
    }
};

export const seedConferences = () => {
  const conferences: Conference[] = Array.from({ length: 12 }, (_, i) => createConference(i));
  setLocal("conferences", conferences);
};
