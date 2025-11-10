
import { setLocal } from "./local";

export type ContentCategory = "Love" | "Work" | "Health" | "Money";
export type ContentType = "Article" | "Podcast" | "Video";
export type Tag = "Love" | "Work" | "Health" | "Money" | "Astrology" | "Tarot" | "Numerology" | "Clairvoyance";

export interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  author: string; // "Admin" or a consultant's nameAlias
  featured: boolean;
  publishedDate: string; // ISO String
  language: "EN" | "FR";
  tags: Tag[];
  duration: number; // in minutes
  cover: string;
}

const titles = [
  "Unlocking Your Career Potential with Tarot",
  "The Art of Mindful Relationships",
  "Financial Wellness for Beginners: An Astrological Guide",
  "Video: Navigating Life's Crossroads with Numerology",
  "Healthy Habits for a Vibrant Life",
  "The Power of Positive Thinking in Work",
  "Building Stronger Bonds with Loved Ones",
  "Mastering Your Personal Finances with Astrology",
  "Finding Your True North: A Guide to Clairvoyance",
  "Podcast: The Future of Work-Life Balance",
  "Podcast: Love in the Digital Age & Tarot",
  "Video: Holistic Health Hacks with Astrology",
];

const tags: Tag[] = ["Love", "Work", "Health", "Money", "Astrology", "Tarot", "Numerology", "Clairvoyance"];
const authors = ["Admin", "Aeliana", "Kael", "Seraphina", "Orion"];
const types: ContentType[] = ["Article", "Podcast", "Video"];

const createContentItem = (id: number): ContentItem => {
  const now = new Date();
  const publishedDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000); // within last 30 days
  
  const title = titles[id % titles.length];
  let type: ContentType;
  if (title.includes("Podcast")) type = "Podcast";
  else if (title.includes("Video")) type = "Video";
  else type = "Article";

  return {
    id: `${id}`,
    title: title.replace("Video: ", "").replace("Podcast: ", ""),
    type: type,
    author: authors[Math.floor(Math.random() * authors.length)],
    featured: id < 2, // Mark first two as featured
    publishedDate: publishedDate.toISOString(),
    language: (id % 4 === 0) ? "FR" : "EN",
    tags: tags.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 1),
    duration: Math.floor(Math.random() * 25) + 5, // 5 to 30 minutes
    cover: `https://picsum.photos/seed/content-${id}/480/320`,
  };
};

export const seedContentItems = () => {
  const contentItems: ContentItem[] = Array.from({ length: 12 }, (_, i) => createContentItem(i));
  setLocal("contentItems", contentItems);
};
