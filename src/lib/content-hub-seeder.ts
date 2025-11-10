
"use client";

import { getSession, setSession, removeSession } from "./session";

export type Comment = {
  id: string;
  contentId: string;
  displayName: string;
  text: string;
  createdAt: string; // ISO
};

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
  tags: string[];
  publishedAt: string; // ISO string
  readMinutes: number | null;
  durationMinutes: number | null;
  views: number;
  likes: number;
  commentCount?: number;
  featured: boolean;
  promotedUntil?: string; // ISO string
  liked: boolean;
  bookmarked: boolean;
  deleted: boolean;
  youtubeUrl?: string;
};


const authors = [
  { id: 'aeliana-rose', name: 'Aeliana Rose', avatar: 'https://i.pravatar.cc/40?u=aeliana-rose' },
  { id: 'kaelen-vance', name: 'Kaelen Vance', avatar: 'https://i.pravatar.cc/40?u=kaelen-vance' },
  { id: 'seraphina-moon', name: 'Seraphina Moon', avatar: 'https://i.pravatar.cc/40?u=seraphina-moon' },
  { id: 'orion-blackwood', name: 'Orion Blackwood', avatar: 'https://i.pravatar.cc/40?u=orion-blackwood' },
];

const allTags = ["Astrology", "Spirituality", "Tarot", "Numerology", "Beginner", "Advanced", "Life Path", "Love", "Work", "Health", "Money"];
const zodiacSigns = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

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
    
    const publishedAt = new Date(now.getTime() - (index * 30 * 24 * 60 * 60 * 1000) - (Math.random() * 30 * 24 * 60 * 60 * 1000));
    
    let promotedUntil: string | undefined;
    if (index === 2 || index === 3) {
        promotedUntil = new Date(now.getTime() + (Math.floor(Math.random() * 7) + 1) * 24 * 60 * 60 * 1000).toISOString();
    }

    const itemTags = [...new Set(allTags.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 2))];
    const itemZodiac = zodiacSigns.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2));
    itemZodiac.forEach(z => {
        if (!itemTags.includes(z)) {
            itemTags.push(z);
        }
    });

    return {
        id: `ch-item-${index + 1}`,
        type: isPodcast ? "podcast" : "article",
        title: sampleTitles[index % sampleTitles.length].replace('Podcast: ', ''),
        excerpt: "A brief, engaging summary of the content goes here, designed to capture the reader's interest and encourage them to click.",
        body: "<p>This is placeholder content for the full article or podcast transcript. In a real application, this would be populated with rich text content, including headings, lists, and other formatting to create an engaging reading experience for the user.</p><blockquote>This is a pull-quote style for a blockquote, giving emphasis to a key point in the text.</blockquote><p>More content follows the quote to round out the article.</p>",
        heroImage: `https://picsum.photos/seed/ch${index + 1}/600/400`,
        tags: itemTags,
        language: index % 4 === 0 ? "FR" : "EN",
        author,
        views: Math.floor(Math.random() * 7800) + 200,
        readMinutes: isPodcast ? null : Math.floor(Math.random() * 5) + 3, // 3-7 min read
        durationMinutes: isPodcast ? Math.floor(Math.random() * 21) + 10 : null, // 10-30 min podcast
        featured: index < 2,
        promotedUntil: promotedUntil,
        likes: Math.floor(Math.random() * 200),
        commentCount: Math.random() > 0.3 ? Math.floor(Math.random() * 15) : 0,
        liked: false,
        bookmarked: false,
        publishedAt: publishedAt.toISOString(),
        deleted: index === 9,
        youtubeUrl: isPodcast ? 'https://www.youtube.com/embed/dQw4w9WgXcQ' : undefined,
    };
};

const createInitialComments = (items: ContentHubItem[]) => {
    const commentsByContentId: { [key: string]: Comment[] } = {};
    items.forEach(item => {
        if (item.deleted || !item.commentCount) return;
        commentsByContentId[item.id] = Array.from({ length: item.commentCount }).map((_, i) => ({
            id: `comment-${item.id}-${i + 1}`,
            contentId: item.id,
            displayName: i % 2 === 0 ? 'Alex Doe' : 'Jordan Smith',
            text: i % 2 === 0 ? 'This was incredibly insightful, thank you for sharing!' : 'I never thought about it that way before. This really changed my perspective.',
            createdAt: new Date(new Date(item.publishedAt).getTime() + (1000 * 60 * 60 * 24 * (i + 1))).toISOString(),
        }));
    });
    return commentsByContentId;
}


export const seedContentHub = () => {
    if (typeof window === 'undefined') return;

    const existingItems = getSession<ContentHubItem[]>("ch_items");
    if (!existingItems || existingItems.length < 14) { // check if new podcasts are added
        const items = Array.from({ length: 10 }, (_, i) => createItem(i));

        const now = new Date();
        
        const newPodcasts: ContentHubItem[] = [
            {
                id: 'ch-item-11',
                type: 'podcast',
                title: 'Cosmic Currents: The Power of Retrogrades',
                excerpt: "Explore the misunderstood power of planetary retrogrades and how to harness their energy for reflection and realignment.",
                body: "<p>In this episode, we demystify planetary retrogrades, often feared but rarely understood. Learn why these periods are powerful opportunities for review, revision, and deep personal growth. We'll cover Mercury, Venus, and Mars retrogrades, offering practical tips to navigate each cycle with confidence.</p>",
                heroImage: `https://picsum.photos/seed/ch11/600/400`,
                author: authors[0],
                language: 'EN',
                tags: ["Astrology", "Planets", "Spirituality", "Pisces"],
                publishedAt: new Date(now.getTime() - 2 * 30 * 24 * 60 * 60 * 1000).toISOString(),
                readMinutes: null,
                durationMinutes: 28,
                views: 3200,
                likes: 180,
                commentCount: 5,
                featured: false,
                liked: false,
                bookmarked: false,
                deleted: false,
                youtubeUrl: "https://www.youtube.com/watch?v=9xwazD5SyVg",
            },
            {
                id: 'ch-item-12',
                type: 'podcast',
                title: 'Spirit Guides & Signs',
                excerpt: "Learn to recognize and interpret the signs from your spirit guides in your daily life. A practical guide to spiritual connection.",
                body: "<p>Are your spirit guides trying to send you a message? This episode explores the common signs, symbols, and synchronicities that our spiritual support team uses to communicate with us. From angel numbers to animal messengers, we'll help you tune in and understand the guidance that's all around you.</p>",
                heroImage: `https://picsum.photos/seed/ch12/600/400`,
                author: authors[1],
                language: 'FR',
                tags: ["Tarot", "Astrology"],
                publishedAt: new Date(now.getTime() - 3 * 30 * 24 * 60 * 60 * 1000).toISOString(),
                readMinutes: null,
                durationMinutes: 18,
                views: 2100,
                likes: 150,
                commentCount: 8,
                featured: false,
                liked: false,
                bookmarked: false,
                deleted: false,
                youtubeUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
            },
            {
                id: 'ch-item-13',
                type: 'podcast',
                title: 'Astrology 101: Houses Explained',
                excerpt: "A beginner-friendly breakdown of the 12 houses in astrology and what they represent in your birth chart and your life.",
                body: "<p>The 12 houses of the zodiac form the architecture of your life's experiences. In this essential 'Astrology 101' episode, we break down each house, from the 1st house of Self to the 12th house of the Unconscious. Understand how the planets in these houses shape your personality, career, relationships, and spiritual path.</p>",
                heroImage: `https://picsum.photos/seed/ch13/600/400`,
                author: authors[2],
                language: 'EN',
                tags: ["Astrology", "Beginner", "Houses"],
                publishedAt: new Date(now.getTime() - 5 * 30 * 24 * 60 * 60 * 1000).toISOString(),
                readMinutes: null,
                durationMinutes: 36,
                views: 5400,
                likes: 320,
                commentCount: 12,
                featured: true,
                liked: false,
                bookmarked: false,
                deleted: false,
                youtubeUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
            },
            {
                id: 'ch-item-14',
                type: 'podcast',
                title: 'Lunar Nodes Deep Dive',
                excerpt: "Go beyond the basics and discover the karmic lessons of the North and South Nodes in your birth chart.",
                body: "<p>This advanced session explores the profound meaning of the lunar nodes. The South Node reveals your past life karma and ingrained patterns, while the North Node points toward your soul's ultimate destiny and growth potential. Learn how to work with your nodal axis to break free from old habits and align with your true purpose.</p>",
                heroImage: `https://picsum.photos/seed/ch14/600/400`,
                author: authors[3],
                language: 'FR',
                tags: ["Astrology", "Nodes", "Advanced", "Cancer"],
                publishedAt: new Date(now.getTime() - 7 * 30 * 24 * 60 * 60 * 1000).toISOString(),
                readMinutes: null,
                durationMinutes: 24,
                views: 1800,
                likes: 95,
                commentCount: 3,
                featured: false,
                liked: false,
                bookmarked: false,
                deleted: false,
                youtubeUrl: "https://www.youtube.com/watch?v=oHg5SJYRHA0",
            },
        ];

        const allItems = [...items, ...newPodcasts];

        const initialComments = createInitialComments(allItems);
        setSession("ch_items", allItems);
        setSession("commentsByContentId", initialComments);
        setSession("ch_seeded_v3", true);
    }
};
