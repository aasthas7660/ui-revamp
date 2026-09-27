CREATE OR REPLACE FUNCTION public.sync_my_profile(_name text, _avatar text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not signed in'; END IF;
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (auth.uid(), auth.jwt() ->> 'email', _name, _avatar)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url);
END $$;
REVOKE ALL ON FUNCTION public.sync_my_profile(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sync_my_profile(text, text) TO authenticated;