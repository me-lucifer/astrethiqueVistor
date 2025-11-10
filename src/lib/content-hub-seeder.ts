
"use client";

import { getSession, setSession, removeSession } from "./session";

export type ContentHubItem = {
  id: string;
  type: "article" | "podcast";
  title: string;
  excerpt: string;
  body: string;
  heroImage: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  language: "EN" | "FR";
  zodiac: ("Aries" | "Taurus" | "Gemini" | "Cancer" | "Leo" | "Virgo" | "Libra" | "Scorpio" | "Sagittarius" | "Capricorn" | "Aquarius" | "Pisces")[];
  tags: string[];
  publishedAt: string; // ISO string
  readMinutes: number | null;
  durationMinutes: number | null;
  views: number;
  likes: number;
  featured: boolean;
  promotedUntil?: string; // ISO string
  liked: boolean;
  bookmarked: boolean;
  deleted: boolean;
};


const authors = [
  { id: 'aeliana-rose', name: 'Aeliana Rose', avatar: 'https://i.pravatar.cc/40?u=aeliana-rose' },
  { id: 'kaelen-vance', name: 'Kaelen Vance', avatar: 'https://i.pravatar.cc/40?u=kaelen-vance' },
  { id: 'seraphina-moon', name: 'Seraphina Moon', avatar: 'https://i.pravatar.cc/40?u=seraphina-moon' },
  { id: 'orion-blackwood', name: 'Orion Blackwood', avatar: 'https://i.pravatar.cc/40?u=orion-blackwood' },
];

const allTags = ["Astrology", "Spirituality", "Tarot", "Numerology", "Beginner", "Advanced", "Life Path", "Love", "Work", "Health", "Money"];
const zodiacSigns : ContentHubItem['zodiac'] = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

const sampleTitles = [
    "Unlocking Your Career Potential with Tarot",
    "The Art of Mindful Relationships",
    "Financial Wellness for Pisces: An Astrological Guide",
    "Navigating Life's Crossroads with Numerology",
    "Healthy Habits for a Vibrant Life (For Cancers)",
    "The Power of Positive Thinking in Your Career",
    "Building Stronger Bonds: A Guide to Love and Tarot",
    "Mastering Your Personal Finances with the Stars",
    "Finding Your True North: A Clairvoyant's Guide to Aries",
    "Podcast: The Future of Work-Life Balance",
    "Podcast: Love in the Digital Age",
    "Podcast: Holistic Health Hacks for Spiritual Beings",
];

const createItem = (index: number): ContentHubItem => {
    const now = new Date();
    const isPodcast = sampleTitles[index % sampleTitles.length].toLowerCase().includes('podcast');
    const author = authors[index % authors.length];
    
    // Set a date in the last 12 months
    const publishedAt = new Date(now.getTime() - (index * 30 * 24 * 60 * 60 * 1000) - (Math.random() * 30 * 24 * 60 * 60 * 1000));
    
    let promotedUntil: string | undefined;
    if (index === 2 || index === 3) {
        promotedUntil = new Date(now.getTime() + (Math.floor(Math.random() * 7) + 1) * 24 * 60 * 60 * 1000).toISOString();
    }

    return {
        id: `ch-item-${index + 1}`,
        type: isPodcast ? "podcast" : "article",
        title: sampleTitles[index % sampleTitles.length].replace('Podcast: ', ''),
        excerpt: "A brief, engaging summary of the content goes here, designed to capture the reader's interest and encourage them to click.",
        body: "<p>This is placeholder content for the full article or podcast transcript. In a real application, this would be populated with rich text content, including headings, lists, and other formatting to create an engaging reading experience for the user.</p><blockquote>This is a pull-quote style for a blockquote, giving emphasis to a key point in the text.</blockquote><p>More content follows the quote to round out the article.</p>",
        heroImage: `https://picsum.photos/seed/ch${index + 1}/600/400`,
        tags: [...new Set(allTags.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 2))],
        language: index % 4 === 0 ? "FR" : "EN",
        zodiac: zodiacSigns.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2)),
        author,
        views: Math.floor(Math.random() * 7800) + 200,
        readMinutes: isPodcast ? null : Math.floor(Math.random() * 5) + 3, // 3-7 min read
        durationMinutes: isPodcast ? Math.floor(Math.random() * 21) + 10 : null, // 10-30 min podcast
        featured: index < 2,
        promotedUntil: promotedUntil,
        likes: Math.floor(Math.random() * 200),
        liked: false,
        bookmarked: false,
        publishedAt: publishedAt.toISOString(),
        deleted: index === 9, // Mark the 10th item as "deleted"
    };
};

export const seedContentHub = () => {
    if (typeof window === 'undefined') return;

    const existingItems = getSession<ContentHubItem[]>("ch_items");
    if (!existingItems || existingItems.length === 0) {
        const items = Array.from({ length: 10 }, (_, i) => createItem(i));
        setSession("ch_items", items);
    }
};
