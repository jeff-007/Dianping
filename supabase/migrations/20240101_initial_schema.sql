-- Enable PostGIS extension for location search
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create user profile table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('user', 'merchant', 'admin')) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create merchants table
CREATE TABLE public.merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  business_hours TEXT,
  category_id UUID REFERENCES public.categories(id),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  avg_rating DECIMAL(3, 2) DEFAULT 0,
  price_range INTEGER CHECK (price_range BETWEEN 1 AND 4),
  images JSONB DEFAULT '[]'::jsonb,
  owner_id UUID REFERENCES auth.users(id),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  content TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, merchant_id)
);

-- Create favorites table
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, merchant_id)
);

-- Create indexes
CREATE INDEX idx_merchants_location ON public.merchants USING GIST (
  ST_MakePoint(longitude, latitude)
);
CREATE INDEX idx_merchants_category ON public.merchants(category_id);
CREATE INDEX idx_merchants_rating ON public.merchants(avg_rating DESC);
CREATE INDEX idx_reviews_merchant ON public.reviews(merchant_id, created_at DESC);
CREATE INDEX idx_reviews_user ON public.reviews(user_id, created_at DESC);

-- Insert initial categories
INSERT INTO public.categories (name, icon, sort_order) VALUES
('餐饮美食', 'utensils', 1),
('休闲娱乐', 'gamepad-2', 2),
('美容美发', 'scissors', 3),
('生活服务', 'wrench', 4),
('酒店住宿', 'bed', 5)
ON CONFLICT (name) DO NOTHING;

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Merchants are viewable by everyone" ON public.merchants FOR SELECT USING (true);
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);

-- Authenticated user policies
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Reviews policies
CREATE POLICY "Authenticated users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- Favorites policies
CREATE POLICY "Users can view own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (new.id, new.email, split_part(new.email, '@', 1));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
