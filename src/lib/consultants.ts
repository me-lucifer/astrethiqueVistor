
export interface Consultant {
  id: string;
  slug: string;
  nameAlias: string;
  photo: string;
  languages: ("EN" | "FR")[];
  specialties: ("Love" | "Work" | "Health" | "Money" | "Life Path")[];
  rating: number;
  sessionsCount: number;
  ratePerMin: number;
  originalRatePerMin: number | null;
  promo: boolean;
  badges: {
    topRated: boolean;
    promo24h: boolean;
  };
  online: boolean;
  bio: string;
  content?: {
    articles: number;
    podcasts: number;
    conferences: number;
  };
  joinedAt: string;
}
