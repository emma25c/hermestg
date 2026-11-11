-- ========================================================
-- 🇹🇬 HermesTG - Schema Base de Données Supabase (0 FCFA)
-- À exécuter dans Supabase : Dashboard > SQL Editor > New Query
-- ========================================================

-- 1. Table des Profils Utilisateurs & Pass
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  referral_code TEXT UNIQUE NOT NULL,
  referred_by TEXT, -- Code parrain utilisé lors de l'inscription
  pass_status TEXT DEFAULT 'free' CHECK (pass_status IN ('free', 'pass_7d', 'pass_30d', 'pass_90d')),
  pass_expires_at TIMESTAMPTZ,
  affiliate_balance INTEGER DEFAULT 0, -- Solde cagnotte en FCFA
  referral_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Sécurité RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les utilisateurs peuvent voir leur propre profil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Table des Paiements et Demandes d'Activation Pass
CREATE TABLE IF NOT EXISTS public.pass_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('pass_7d', 'pass_30d', 'pass_90d')),
  amount_fcfa INTEGER NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('T-Money', 'Flooz')),
  sender_phone TEXT NOT NULL,
  transaction_ref TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.pass_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les utilisateurs peuvent créer des demandes de pass"
  ON public.pass_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent voir leurs demandes"
  ON public.pass_requests FOR SELECT
  USING (auth.uid() = user_id);

-- 3. Table des Commissions d'Affiliation (Ambassadeur Campus)
CREATE TABLE IF NOT EXISTS public.affiliate_commissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  commission_amount INTEGER NOT NULL, -- 500 F pour 1er mois, 250 F récurrent
  commission_type TEXT CHECK (commission_type IN ('first_pass', 'renewal')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les parrains peuvent voir leurs gains"
  ON public.affiliate_commissions FOR SELECT
  USING (auth.uid() = referrer_id);

-- 4. Table des Formations Vidéos (Gérable sans coder depuis Supabase)
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Formation Pratique' NOT NULL,
  duration TEXT DEFAULT '15 min' NOT NULL,
  description TEXT NOT NULL,
  video_url TEXT, -- Lien YouTube ou embed vidéo
  is_premium BOOLEAN DEFAULT false NOT NULL,
  order_index INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Tout le monde (visiteur et abonnés) peut lire la liste des formations
CREATE POLICY "Lecture publique des formations"
  ON public.courses FOR SELECT
  USING (true);

-- Données initiales d'exemple à l'insertion
INSERT INTO public.courses (title, category, duration, description, video_url, is_premium, order_index)
VALUES 
  (
    'Maîtriser les Outils d’IA sur Smartphone',
    'Intelligence Artificielle',
    '15 min',
    'Techniques pour formuler des instructions précises, rédiger des courriers impeccables et synthétiser des documents lourds sans ordinateur.',
    'https://www.youtube.com/watch?v=kCc8FmEb1nY',
    false,
    1
  ),
  (
    'Vente Professionnelle sur WhatsApp à Lomé',
    'Commerce & Freelance',
    '20 min',
    'Comment transformer ses statuts WhatsApp en vitrine commerciale crédible, instaurer la confiance et formaliser ses ventes par reçu.',
    'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
    true,
    2
  ),
  (
    'Lancer une Prestation de Micro-Services à 0 FCFA',
    'Entrepreneuriat Étudiant',
    '15 min',
    'Méthodologie pour proposer des prestations de mise en page, correction de documents et formalisation administrative depuis son téléphone.',
    'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    true,
    3
  )
ON CONFLICT DO NOTHING;
