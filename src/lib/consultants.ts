

export interface Consultant {
  id: string;
  slug: string;
  name: string;
  rating: number;
  pricePerMin: number;
  priceWas?: number;
  promo24h?: boolean;
  languages: {
    code: 'EN' | 'FR';
    level: 'basic' | 'fluent' | 'native';
  }[];
  availability: {
      online: boolean;
      slots: string[]; // array of ISO strings
  };
  specialties: ('Love' | 'Work' | 'Health' | 'Money' | 'Life Path')[];
  types: string[]; // Reading types like Astrology, Tarot, etc.
  specializesInSigns: string[]; // Zodiac signs
  badges: ('Top Rated' | 'Rising Star' | 'New' | 'Promo 24h')[];
  contentCounts: {
    articles: number;
    podcasts: number;
    conferences: number;
  };
  cover: string;
  kycVerified: boolean;
  adminApproved: boolean;
  lastReviewDate: string; // ISO 8601 string
  bio: string;
  reviews: {
    author: string;
    rating: number;
    dateISO: string;
    text: string;
  }[];
  content: {
    articles: { id: string; title: string; tag: string; level: string; likes: number }[];
    podcasts: { id: string; title: string; duration: number }[];
    conferences: { id: string; title: string; scheduleISO: string }[];
  };
  joinedAt: string; // ISO date string
}
