

export interface BaseContentItem {
  id: string;
  title: string;
  tags: string[];
  cover: string;
}
export interface ContentItem extends BaseContentItem {
  likes?: number;
}

export interface Podcast extends BaseContentItem {
  duration: string;
}

export interface Conference extends BaseContentItem {
  date: string;
  time: string;
}

export interface Review {
  id: string;
  author: string;
  stars: number;
  date: string;
  text: string;
}

export interface ConsultantProfile {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  badges: string[];
  rating: number;
  reviewsCount: number;
  languages: string[];
  pricePerMin: number;
  prevPricePerMin?: number;
  summary: string;
  specialties: string[];
  verifications: {
    adminApproved: boolean;
    kycVerified: boolean;
    lastReview: string;
  };
  nextSlots: string[];
  content: {
    articles: ContentItem[];
    podcasts: (ContentItem & { duration: number })[];
    conferences: (BaseContentItem & { dateISO: string })[];
  };
  reviews: Review[];
  favorite: boolean;
}
