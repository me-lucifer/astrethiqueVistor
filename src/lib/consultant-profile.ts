

export interface BaseContentItem {
  id: string;
  title: string;
  tags: string[];
  cover: string;
  type: 'Article' | 'Podcast' | 'Conference' | 'Video';
}
export interface ContentItem extends BaseContentItem {
  likes?: number;
  type: 'Article' | 'Podcast' | 'Video';
}

export interface Podcast extends ContentItem {
  duration: number;
}

export interface Conference extends BaseContentItem {
  date: string;
  time: string;
  dateISO: string;
  type: 'Conference';
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
  types: string[];
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
  yearsExperience: number;
  country: string;
}
