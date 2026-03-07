-- Update the trigger function to handle phone metadata and potential conflicts
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  phone_val TEXT;
  email_val TEXT;
  name_val TEXT;
BEGIN
  -- Try to get phone from metadata first
  phone_val := new.raw_user_meta_data->>'phone';
  
  -- If not in metadata, check if email looks like our fake phone email
  IF phone_val IS NULL AND new.email LIKE '%@phone.dianping.local' THEN
    phone_val := split_part(new.email, '@', 1);
  END IF;

  -- Determine real email (if it's not our fake one)
  IF new.email LIKE '%@phone.dianping.local' THEN
    email_val := NULL;
  ELSE
    email_val := new.email;
  END IF;

  -- Determine name
  name_val := COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));

  -- Insert or Update profile (handling potential conflicts if profile already exists)
  INSERT INTO public.profiles (id, email, phone, name)
  VALUES (new.id, email_val, phone_val, name_val)
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    name = EXCLUDED.name,
    updated_at = NOW();
    
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
