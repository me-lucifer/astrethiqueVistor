
"use client";

import { getSession, setSession, removeSession } from "./session";

export type ContentHubItem = {
    id: string;
    type: "article" | "podcast";
    title: string;
    excerpt: string;
    body: string;
    imageUrl: string;
    topics: ("Love" | "Work" | "Health" | "Money" | "Life Path")[];
    language: "EN" | "FR";
    author: {
        id: string;
        name: string;
        avatarUrl: string;
    };
    readMinutes?: number;
    durationMinutes?: number;
    featured: boolean;
    promoted: boolean;
    promotionDaysRemaining: number;
    likes: number;
    liked: boolean;
    bookmarked: boolean;
    datePublished: string;
    deleted: boolean;
};

const authors = [
  { id: 'aeliana-rose', name: 'Aeliana Rose', avatarUrl: 'https://i.pravatar.cc/40?u=aeliana-rose' },
  { id: 'kaelen-vance', name: 'Kaelen Vance', avatarUrl: 'https://i.pravatar.cc/40?u=kaelen-vance' },
  { id: 'seraphina-moon', name: 'Seraphina Moon', avatarUrl: 'https://i.pravatar.cc/40?u=seraphina-moon' },
  { id: 'orion-blackwood', name: 'Orion Blackwood', avatarUrl: 'https://i.pravatar.cc/40?u=orion-blackwood' },
];

const topics: ContentHubItem['topics'] = ["Love", "Work", "Health", "Money", "Life Path"];

const sampleTitles = [
    "Unlocking Your Career Potential with Tarot",
    "The Art of Mindful Relationships",
    "Financial Wellness for Beginners: An Astrological Guide",
    "Navigating Life's Crossroads with Numerology",
    "Healthy Habits for a Vibrant Life",
    "The Power of Positive Thinking in Your Career",
    "Building Stronger Bonds: A Guide to Love",
    "Mastering Your Personal Finances with the Stars",
    "Finding Your True North: A Clairvoyant's Guide",
    "Podcast: The Future of Work-Life Balance",
    "Podcast: Love in the Digital Age",
    "Podcast: Holistic Health Hacks",
    "Decoding Your Dreams: A Practical Guide",
    "The Beginner's Guide to Crystal Healing",
    "Podcast: Manifesting Your Dream Job",
    "How to Read Your Birth Chart for Beginners"
];

const createItem = (index: number): ContentHubItem => {
    const now = new Date();
    const isPodcast = sampleTitles[index].toLowerCase().includes('podcast');
    const author = authors[index % authors.length];
    
    return {
        id: `ch-item-${index + 1}`,
        type: isPodcast ? "podcast" : "article",
        title: sampleTitles[index].replace('Podcast: ', ''),
        excerpt: "A brief, engaging summary of the content goes here, designed to capture the reader's interest and encourage them to click.",
        body: "<p>This is placeholder content for the full article or podcast transcript. In a real application, this would be populated with rich text content.</p>",
        imageUrl: `https://picsum.photos/seed/ch${index + 1}/600/400`,
        topics: [topics[index % topics.length], topics[(index + 2) % topics.length]],
        language: index % 4 === 0 ? "FR" : "EN",
        author,
        readMinutes: isPodcast ? undefined : Math.floor(Math.random() * 5) + 3, // 3-7 min read
        durationMinutes: isPodcast ? Math.floor(Math.random() * 21) + 10 : undefined, // 10-30 min podcast
        featured: index < 2,
        promoted: index === 2 || index === 3,
        promotionDaysRemaining: index === 2 ? 5 : (index === 3 ? 2 : 0),
        likes: Math.floor(Math.random() * 200),
        liked: false,
        bookmarked: false,
        datePublished: new Date(now.getTime() - (index * 2 * 24 * 60 * 60 * 1000)).toISOString(), // Staggered dates
        deleted: index === 15, // Mark the last item as "deleted"
    };
};

export const seedContentHub = () => {
    if (typeof window === 'undefined') return;

    const existingItems = getSession<ContentHubItem[]>("ch_items");
    if (!existingItems || existingItems.length === 0) {
        const items = Array.from({ length: 16 }, (_, i) => createItem(i));
        setSession("ch_items", items);
    }
};
