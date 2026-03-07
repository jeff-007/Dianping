export interface Category {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
}

export interface Merchant {
  id: string;
  _id?: string;
  name: string;
  address: string;
  phone: string;
  business_hours: string;
  category_id: string;
  category?: Category;
  latitude: number;
  longitude: number;
  avg_rating: number;
  price_range: number;
  images: string[];
  owner_id: string;
  verified: boolean;
}

export interface Review {
  id: string;
  user_id: string;
  merchant_id: string;
  rating: number;
  content: string;
  images: string[];
  created_at: string;
  user?: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  role: 'user' | 'merchant' | 'admin';
}
