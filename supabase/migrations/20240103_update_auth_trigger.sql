-- Update the trigger function to handle phone metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  phone_val TEXT;
BEGIN
  -- Try to get phone from metadata first
  phone_val := new.raw_user_meta_data->>'phone';
  
  -- If not in metadata, check if email looks like our fake phone email
  IF phone_val IS NULL AND new.email LIKE '%@phone.dianping.local' THEN
    phone_val := split_part(new.email, '@', 1);
  END IF;

  INSERT INTO public.profiles (id, email, phone, name)
  VALUES (
    new.id, 
    CASE 
      WHEN new.email LIKE '%@phone.dianping.local' THEN NULL -- Don't store fake email in profile
      ELSE new.email 
    END,
    phone_val,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
