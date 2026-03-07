-- Enable PostGIS extension for location support (if available, otherwise we use simple float)
-- Note: Standard Supabase usually has PostGIS enabled, but we will use decimal for latitude/longitude as per schema for simplicity if extension is not needed strictly for complex queries yet.
-- However, the architecture doc mentions PostGIS ST_MakePoint. Let's try to enable it, or fallback to simple indexing if strictly required.
-- For this setup, we'll stick to the provided schema in the doc.

-- Create extension if not exists (might require superuser, but usually enabled on Supabase)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Users Table (handled by Supabase Auth usually, but we have a public profiles table 'users' in the doc)
-- Note: The doc defines a 'users' table. In Supabase, it's best practice to link this to auth.users.
-- We will create the table as specified but ensure it works with auth.

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, -- Link to auth.users
    email VARCHAR(255), -- Can be synced from auth
    phone VARCHAR(20),
    password_hash VARCHAR(255), -- Note: Supabase Auth handles passwords. This field might be redundant if using Supabase Auth strictly, but we'll keep it to match schema or for custom auth flows if needed.
    name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'merchant', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initialize Categories
INSERT INTO public.categories (name, icon, sort_order) VALUES
('餐饮美食', 'restaurant', 1),
('购物', 'shopping', 2),
('娱乐休闲', 'entertainment', 3),
('生活服务', 'service', 4),
('酒店住宿', 'hotel', 5)
ON CONFLICT (name) DO NOTHING;

-- 3. Merchants Table
CREATE TABLE IF NOT EXISTS public.merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    business_hours TEXT,
    category_id UUID REFERENCES public.categories(id),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    avg_rating DECIMAL(3, 2) DEFAULT 0,
    price_range INTEGER CHECK (price_range BETWEEN 1 AND 4),
    images JSON DEFAULT '[]',
    owner_id UUID REFERENCES public.users(id),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merchants_category ON public.merchants(category_id);
CREATE INDEX IF NOT EXISTS idx_merchants_rating ON public.merchants(avg_rating DESC);
-- Spatial index
CREATE INDEX IF NOT EXISTS idx_merchants_location ON public.merchants USING GIST (
    ST_MakePoint(longitude, latitude)
);

-- 4. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    content TEXT,
    images JSON DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, merchant_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_merchant ON public.reviews(merchant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.reviews(user_id, created_at DESC);

-- 5. Favorites Table
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, merchant_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_merchant ON public.favorites(merchant_id);

-- 6. Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 7. Policies

-- Anonymous permissions
GRANT SELECT ON public.merchants TO anon;
GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT ON public.users TO anon; -- Allow reading basic user info (like name/avatar) for reviews

-- Authenticated permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.merchants TO authenticated;
GRANT ALL ON public.reviews TO authenticated;
GRANT ALL ON public.favorites TO authenticated;
GRANT ALL ON public.categories TO authenticated;

-- Specific Policies

-- Users: Users can read everyone (for reviews), but only update themselves
CREATE POLICY "Public profiles are viewable by everyone" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Reviews
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON public.reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON public.reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Favorites
CREATE POLICY "Users can view own favorites" ON public.favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON public.favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON public.favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Merchants
CREATE POLICY "Merchants are viewable by everyone" ON public.merchants
    FOR SELECT USING (true);

-- Categories
CREATE POLICY "Categories are viewable by everyone" ON public.categories
    FOR SELECT USING (true);

-- Function to handle new user signup (trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'name', 'User'), 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
