
CREATE TABLE public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_users TO authenticated;
GRANT ALL ON public.admin_users TO service_role;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
$$;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

CREATE POLICY "Admins view admin list" ON public.admin_users FOR SELECT TO authenticated USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  email text,
  name text,
  username text UNIQUE,
  total_xp integer NOT NULL DEFAULT 0,
  quests_completed integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id AND total_xp = 0 AND status = 'active');
CREATE POLICY "Admin profile update" ON public.profiles FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Admin profile delete" ON public.profiles FOR DELETE TO authenticated USING (public.is_admin());
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  primary_color text NOT NULL DEFAULT '#3b5bdb',
  secondary_color text NOT NULL DEFAULT '#a8e6cf',
  background_color text NOT NULL DEFAULT '#141519',
  card_color text NOT NULL DEFAULT '#f5f0e1',
  text_color text NOT NULL DEFAULT '#f7f3e8',
  accent_color text NOT NULL DEFAULT '#d4e84a',
  font text NOT NULL DEFAULT 'Bricolage Grotesque',
  border_radius integer NOT NULL DEFAULT 24,
  button_style text NOT NULL DEFAULT 'block',
  card_style text NOT NULL DEFAULT 'block',
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.themes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.themes TO authenticated;
GRANT ALL ON public.themes TO service_role;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Themes public read" ON public.themes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin themes write" ON public.themes FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER themes_touch BEFORE UPDATE ON public.themes FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text NOT NULL DEFAULT '01',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  instructions text NOT NULL DEFAULT '',
  target_website_url text,
  target_page_url text,
  image_url text,
  difficulty text NOT NULL DEFAULT 'Medium',
  xp_reward integer NOT NULL DEFAULT 500,
  start_at timestamptz NOT NULL DEFAULT now(),
  end_at timestamptz NOT NULL DEFAULT (now() + interval '3 days'),
  ai_allowed boolean NOT NULL DEFAULT true,
  ai_policy text NOT NULL DEFAULT '',
  submission_instructions text NOT NULL DEFAULT '',
  theme_id uuid REFERENCES public.themes(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.quests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quests TO authenticated;
GRANT ALL ON public.quests TO service_role;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public quests read" ON public.quests FOR SELECT TO anon, authenticated USING (status NOT IN ('draft','archived') OR public.is_admin());
CREATE POLICY "Admin quests write" ON public.quests FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER quests_touch BEFORE UPDATE ON public.quests FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT '✦',
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.rules TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rules TO authenticated;
GRANT ALL ON public.rules TO service_role;
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active rules read" ON public.rules FOR SELECT TO anon, authenticated USING (active OR public.is_admin());
CREATE POLICY "Admin rules write" ON public.rules FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER rules_touch BEFORE UPDATE ON public.rules FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id uuid NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  github_url text NOT NULL,
  live_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own submissions read" ON public.submissions FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Own submissions insert" ON public.submissions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Admin submissions update" ON public.submissions FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Admin submissions delete" ON public.submissions FOR DELETE TO authenticated USING (public.is_admin());
CREATE TRIGGER submissions_touch BEFORE UPDATE ON public.submissions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  members integer NOT NULL DEFAULT 1,
  xp integer NOT NULL DEFAULT 0,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.leaderboard TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leaderboard TO authenticated;
GRANT ALL ON public.leaderboard TO service_role;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leaderboard public read" ON public.leaderboard FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin leaderboard write" ON public.leaderboard FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER leaderboard_touch BEFORE UPDATE ON public.leaderboard FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.quest_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id uuid NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (quest_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.quest_participants TO authenticated;
GRANT ALL ON public.quest_participants TO service_role;
ALTER TABLE public.quest_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own participation read" ON public.quest_participants FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Own participation insert" ON public.quest_participants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin participation delete" ON public.quest_participants FOR DELETE TO authenticated USING (public.is_admin());

INSERT INTO public.admin_users (email) VALUES ('aasthas7660@gmail.com');

INSERT INTO public.themes (name, primary_color, secondary_color, background_color, card_color, text_color, accent_color, font, border_radius, button_style, card_style, is_active) VALUES
('Cyber Blue', '#3b5bdb', '#a8e6cf', '#141519', '#f5f0e1', '#f7f3e8', '#d4e84a', 'Bricolage Grotesque', 24, 'block', 'block', true),
('Mint Quest', '#12b886', '#ffd8a8', '#0f1f1a', '#f1faf5', '#eefaf4', '#ffe066', 'Space Grotesk', 18, 'block', 'block', false),
('Retro Orange', '#f76707', '#74c0fc', '#1c1410', '#fff4e6', '#fff4e6', '#ffd43b', 'Archivo Black', 12, 'block', 'flat', false);

INSERT INTO public.quests (number, title, description, instructions, target_website_url, target_page_url, difficulty, xp_reward, start_at, end_at, ai_allowed, ai_policy, submission_instructions, theme_id, status)
SELECT '01', 'UI Revamp Challenge',
 'Take an existing website. Reimagine its interface. Build your version — cleaner, bolder, and actually fun to use.',
 E'Redesign the homepage of the assigned target website.\nKeep the core content, rethink layout, hierarchy and visuals.\nMake it fully responsive — mobile matters.\nBonus XP for accessibility and thoughtful micro-interactions.',
 'https://example.com', 'https://example.com', 'Medium', 500, now(), now() + interval '3 days 7 hours', true,
 'AI tools are allowed. You''re responsible for the final result — understand and own every line you ship.',
 'Submit your GitHub repository and your live website link.', id, 'open'
FROM public.themes WHERE name = 'Cyber Blue';

INSERT INTO public.rules (title, display_order) VALUES
('Redesign the assigned page.', 1),
('Your submission must be your own work.', 2),
('AI tools may be used.', 3),
('Website must be publicly accessible.', 4),
('Submit GitHub + Live Website.', 5),
('Submission closes when the quest ends.', 6),
('Late submissions are not accepted.', 7),
('Incomplete submissions may be rejected.', 8);

INSERT INTO public.leaderboard (name, members, xp) VALUES
('Pixel Pirates', 3, 1000), ('Byte Bandits', 2, 850), ('Aastha S.', 1, 700), ('Grid Goblins', 4, 620), ('Neon Nomads', 2, 540);
