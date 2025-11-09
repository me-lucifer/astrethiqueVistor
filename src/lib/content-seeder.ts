
import { setSession } from "./session";

export type ContentCategory = "Love" | "Work" | "Health" | "Money";
export type ContentType = "Article" | "Podcast";

export interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  author: string; // "Admin" or a consultant's nameAlias
  featured: boolean;
  publishedDate: string; // ISO String
  promotedUntil: string | null; // ISO String or null
  category: ContentCategory;
}

const titles = [
  "Unlocking Your Career Potential",
  "The Art of Mindful Relationships",
  "Financial Wellness for Beginners",
  "Navigating Life's Crossroads",
  "Healthy Habits for a Vibrant Life",
  "The Power of Positive Thinking in Work",
  "Building Stronger Bonds with Loved Ones",
  "Mastering Your Personal Finances",
  "Finding Your True North: A Guide to Life Path",
  "Podcast: The Future of Work-Life Balance",
  "Podcast: Love in the Digital Age",
  "Podcast: Holistic Health Hacks",
];

const categories: ContentCategory[] = ["Love", "Work", "Health", "Money"];
const authors = ["Admin", "Aeliana", "Kael", "Seraphina", "Orion"];

const createContentItem = (id: number): ContentItem => {
  const now = new Date();
  const publishedDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000); // within last 30 days
  const isPromoted = Math.random() > 0.7;
  const promotedUntil = isPromoted ? new Date(now.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString() : null; // promoted for up to 14 days

  return {
    id: `${id}`,
    title: titles[id % titles.length],
    type: titles[id % titles.length].includes("Podcast") ? "Podcast" : "Article",
    author: authors[Math.floor(Math.random() * authors.length)],
    featured: Math.random() > 0.3, // 70% chance of being featured
    publishedDate: publishedDate.toISOString(),
    promotedUntil,
    category: categories[Math.floor(Math.random() * categories.length)],
  };
};

export const seedContentItems = () => {
  const contentItems: ContentItem[] = Array.from({ length: 12 }, (_, i) => createContentItem(i + 1));
  setSession("contentItems", contentItems);
};

    