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
