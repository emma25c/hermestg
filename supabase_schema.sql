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

-- 5. Table des Clés IA & Base URL (Pool de rotation pour APC)
-- Permet d'ajouter des clés Google Gemini, Groq, OpenRouter, DeepSeek ou tout endpoint compatible OpenAI
CREATE TABLE IF NOT EXISTS public.ai_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL DEFAULT 'Clé IA',
  api_key TEXT NOT NULL,
  base_url TEXT DEFAULT 'https://generativelanguage.googleapis.com', -- Ou https://api.groq.com/openai/v1, https://openrouter.ai/api/v1, etc.
  model TEXT DEFAULT 'gemini-2.5-flash', -- Modèle à appeler (ex: gemini-2.5-flash, llama-3.3-70b-versatile, gpt-4o-mini, etc.)
  provider TEXT DEFAULT 'gemini' CHECK (provider IN ('gemini', 'openai', 'custom')),
  is_active BOOLEAN DEFAULT true NOT NULL,
  usage_count INTEGER DEFAULT 0 NOT NULL,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.ai_keys ENABLE ROW LEVEL SECURITY;

-- Lecture des clés actives pour la génération
CREATE POLICY "Lecture des clés actives"
  ON public.ai_keys FOR SELECT
  USING (is_active = true);

-- Mise à jour du compteur d'utilisation
CREATE POLICY "Mise à jour usage clés"
  ON public.ai_keys FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Fonction de rotation automatique (sélectionne la clé la moins utilisée et incrémente son compteur)
CREATE OR REPLACE FUNCTION public.get_rotated_ai_key()
RETURNS TABLE (
  id UUID,
  label TEXT,
  api_key TEXT,
  base_url TEXT,
  model TEXT,
  provider TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  selected_row public.ai_keys%ROWTYPE;
BEGIN
  SELECT * INTO selected_row
  FROM public.ai_keys
  WHERE is_active = true
  ORDER BY usage_count ASC, last_used_at ASC NULLS FIRST
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF FOUND THEN
    UPDATE public.ai_keys
    SET usage_count = usage_count + 1,
        last_used_at = timezone('utc'::text, now())
    WHERE id = selected_row.id;

    RETURN QUERY
    SELECT selected_row.id, selected_row.label, selected_row.api_key, selected_row.base_url, selected_row.model, selected_row.provider;
  END IF;
END;
$$;

-- Alias pour compatibilité ascendante
CREATE OR REPLACE FUNCTION public.get_rotated_gemini_key()
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  k TEXT;
BEGIN
  SELECT api_key INTO k
  FROM public.ai_keys
  WHERE is_active = true
  ORDER BY usage_count ASC, last_used_at ASC NULLS FIRST
  LIMIT 1;
  RETURN k;
END;
$$;

-- ========================================================
-- EXEMPLES D'AJOUT DE CLÉS DANS SUPABASE (SQL EDITOR) :
--
-- 1. Clé Google Gemini gratuite (Google AI Studio) :
-- INSERT INTO public.ai_keys (label, api_key, base_url, model, provider)
-- VALUES ('Gemini Compte 1', 'AIzaSy...', 'https://generativelanguage.googleapis.com', 'gemini-2.5-flash', 'gemini');
--
-- 2. Clé Groq (Ultra-rapide avec Llama 3.3) :
-- INSERT INTO public.ai_keys (label, api_key, base_url, model, provider)
-- VALUES ('Groq Llama', 'gsk_...', 'https://api.groq.com/openai/v1', 'llama-3.3-70b-versatile', 'openai');
--
-- 3. Clé OpenRouter ou DeepSeek :
-- INSERT INTO public.ai_keys (label, api_key, base_url, model, provider)
-- VALUES ('OpenRouter', 'sk-or-...', 'https://openrouter.ai/api/v1', 'deepseek/deepseek-chat', 'openai');
-- ========================================================

