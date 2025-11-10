
export interface ContentItem {
  id: string;
  title: string;
  tags: string[];
  likes: number;
  cover: string;
}

export interface Podcast extends ContentItem {
  duration: string;
}

export interface Conference extends ContentItem {
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
    podcasts: Podcast[];
    conferences: Conference[];
  };
  reviews: Review[];
  favorite: boolean;
}
