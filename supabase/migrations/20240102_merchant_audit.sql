-- Add audit status and verification fields to merchants
ALTER TABLE public.merchants 
ADD COLUMN IF NOT EXISTS audit_status VARCHAR(20) DEFAULT 'pending' CHECK (audit_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS license_image TEXT,
ADD COLUMN IF NOT EXISTS identity_card_image TEXT,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Update profiles to ensure role is present (already in initial schema, but good to double check/enforce)
-- No change needed if initial schema was correct.

-- Create storage bucket for merchant documents
INSERT INTO storage.buckets (id, name, public) VALUES ('merchant-docs', 'merchant-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Policy for merchant documents: Only owner can upload and view, admins can view all
-- Note: Assuming we have an 'admin' role logic or just owner for now.
CREATE POLICY "Merchants can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'merchant-docs' AND auth.uid() = owner );

CREATE POLICY "Merchants can view own documents"
ON storage.objects FOR SELECT
USING ( bucket_id = 'merchant-docs' AND auth.uid() = owner );

-- Update RLS for merchants table to allow creating pending merchants
CREATE POLICY "Authenticated users can create merchant profile"
ON public.merchants FOR INSERT
WITH CHECK ( auth.uid() = owner_id );

CREATE POLICY "Owners can view own merchant profile"
ON public.merchants FOR SELECT
USING ( auth.uid() = owner_id );

-- Allow merchants to update their own profile if not approved yet or generic update
CREATE POLICY "Owners can update own merchant profile"
ON public.merchants FOR UPDATE
USING ( auth.uid() = owner_id );
