
"use client";

import { setLocal } from "./local";
import { addDays, addMinutes, subMinutes, addHours } from "date-fns";

export interface Conference {
  id: string;
  slug: string;
  title: string;
  dateISO: string;
  durationMin: number;
  hostAlias: string;
  hostId: string;
  hostRating: number;
  language: ("EN" | "FR");
  tags: ("Love" | "Work" | "Health" | "Money" | "Life Path")[];
  type: "Workshop" | "Group Reading" | "Webinar" | "Q&A";
  price: number;
  isFree: boolean; // Derived from price
  excerpt: string;
  description: string; // Rich text/HTML for the about tab
  agenda: { time: string; topic: string }[];
  faqs: { question: string; answer: string }[];
  capacity: number;
  seatsLeft?: number; // Optional
  recordingAvailable: boolean;
  languages: string[];
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

const hosts = [
    { alias: "Aeliana Rose", id: "aeliana-rose" },
    { alias: "Kaelen Vance", id: "kaelen-vance" },
    { alias: "Seraphina Moon", id: "seraphina-moon" },
    { alias: "Orion Blackwood", id: "orion-blackwood" },
    { alias: "Elara Solstice", id: "elara-solstice" },
    { alias: "Lyra Meadow", id: "lyra-meadow" },
    { alias: "Caspian Sage", id: "caspian-sage" },
    { alias: "Marcus Redfield", id: "marcus-redfield-clone" },
    { alias: "Eva Green", id: "eva-green-clone" },
    { alias: "Fiona Glen", id: "fiona-glen" },
    { alias: "Chloé Dubois", id: "chloe-dubois-clone"},
    { alias: "Isabelle Leroy", id: "isabelle-leroy-clone"},
];

const tags: Conference['tags'] = ["Love", "Work", "Health", "Money", "Life Path"];
const types: Conference['type'][] = ["Workshop", "Group Reading", "Webinar", "Q&A"];


const createConference = (id: number): Conference => {
    const now = new Date();
    let date: Date;
    const price = 0; // All events are free
    const title = conferenceTitles[(id-1) % conferenceTitles.length];

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
    
    const capacity = Math.floor(Math.random() * 130) + 20; // 20-150
    const seatsLeft = id % 4 === 0 ? 0 : Math.floor(Math.random() * capacity);
    const host = hosts[(id-1) % hosts.length];
    const languages = (id % 3 === 0) ? ["FR"] : ["EN"];
    if (id % 5 === 0) languages.push(id % 3 === 0 ? 'EN' : 'FR');


    return {
        id: `${id}`,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + `-${id}`,
        title: title,
        dateISO: date.toISOString(),
        durationMin: [30, 45, 60, 90][id % 4],
        hostAlias: host.alias,
        hostId: host.id,
        hostRating: Math.round((4.0 + Math.random()) * 10) / 10,
        language: (id % 3 === 0) ? "FR" : "EN",
        languages: languages,
        tags: tags.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 1),
        type: types[id % types.length],
        price: 0,
        isFree: true,
        excerpt: excerpts[(id-1) % excerpts.length],
        description: `<h4>Overview</h4><p>${excerpts[(id-1) % excerpts.length]} This session is designed for both beginners and intermediate students of astrology, offering fresh perspectives and practical applications.</p><h4>What You'll Learn</h4><ul><li>Key principles of the topic at hand.</li><li>How to apply this knowledge to your own life for immediate insight.</li><li>Advanced techniques for deeper understanding.</li></ul><p>Join us for an enlightening experience that will empower you to take control of your destiny.</p>`,
        agenda: [
            { time: "0-5 min", topic: "Welcome & Introductions" },
            { time: "5-25 min", topic: "Core Concepts & Foundational Theory" },
            { time: "25-45 min", topic: "Practical Application & Chart Examples" },
            { time: "45-60 min", topic: "Live Q&A with the Host" }
        ],
        faqs: [
            { question: "What if I can't make it live?", answer: "A recording of the session will be available to all ticket holders for 30 days after the event, provided you've registered." },
            { question: "How do I join the session?", answer: "A unique link to join the virtual conference room will be sent to your email address 1 hour before the event begins. Please check your spam folder if you don't see it." },
            { question: "What is the cancellation policy?", answer: "You can receive a full refund up to 24 hours before the conference starts. Within 24 hours, tickets are non-refundable but can be transferred to a friend." }
        ],
        capacity: capacity,
        seatsLeft: seatsLeft,
        recordingAvailable: Math.random() > 0.5,
    }
};

export const seedConferences = () => {
  const conferences: Conference[] = Array.from({ length: 12 }, (_, i) => createConference(i + 1));
  setLocal("conferences", conferences);
  setLocal("waitlist", []);
};

    

    