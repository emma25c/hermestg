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
  v_id UUID;
  v_label TEXT;
  v_api_key TEXT;
  v_base_url TEXT;
  v_model TEXT;
  v_provider TEXT;
BEGIN
  SELECT k.id, k.label, k.api_key, k.base_url, k.model, k.provider
  INTO v_id, v_label, v_api_key, v_base_url, v_model, v_provider
  FROM public.ai_keys k
  WHERE k.is_active = true
  ORDER BY k.usage_count ASC, k.last_used_at ASC NULLS FIRST
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF v_id IS NOT NULL THEN
    UPDATE public.ai_keys
    SET usage_count = usage_count + 1,
        last_used_at = timezone('utc'::text, now())
    WHERE public.ai_keys.id = v_id;

    RETURN QUERY
    SELECT v_id, v_label, v_api_key, v_base_url, v_model, v_provider;
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
-- 6. Table des Codes d'Activation VIP (Souscriptions Pass)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.activation_codes (
  code TEXT PRIMARY KEY,
  plan_type TEXT NOT NULL DEFAULT 'pass_30d' CHECK (plan_type IN ('pass_7d', 'pass_30d', 'pass_90d')),
  duration_days INTEGER NOT NULL DEFAULT 30,
  is_used BOOLEAN DEFAULT false NOT NULL,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture des codes par utilisateur connecté"
  ON public.activation_codes FOR SELECT
  USING (true);

-- Fonction pour valider et appliquer un code d'activation au profil d'un utilisateur
CREATE OR REPLACE FUNCTION public.activate_user_pass_with_code(p_code TEXT, p_user_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_code RECORD;
  v_new_expires_at TIMESTAMPTZ;
  v_current_expires_at TIMESTAMPTZ;
  v_base_time TIMESTAMPTZ := now();
BEGIN
  -- Vérifier si le code existe et n'est pas encore utilisé
  SELECT * INTO v_code
  FROM public.activation_codes
  WHERE UPPER(code) = UPPER(TRIM(p_code)) AND is_used = false;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Code invalide ou déjà utilisé.');
  END IF;

  -- Vérifier l'expiration actuelle du profil pour prolonger si déjà actif
  SELECT pass_expires_at INTO v_current_expires_at
  FROM public.profiles
  WHERE id = p_user_id;

  IF v_current_expires_at IS NOT NULL AND v_current_expires_at > now() THEN
    v_base_time := v_current_expires_at;
  END IF;

  v_new_expires_at := v_base_time + (v_code.duration_days || ' days')::INTERVAL;

  -- Mettre à jour le profil utilisateur
  UPDATE public.profiles
  SET pass_status = v_code.plan_type,
      pass_expires_at = v_new_expires_at,
      updated_at = now()
  WHERE id = p_user_id;

  -- Marquer le code comme consommé
  UPDATE public.activation_codes
  SET is_used = true,
      used_by = p_user_id,
      used_at = now()
  WHERE code = v_code.code;

  RETURN jsonb_build_object(
    'success', true,
    'plan_type', v_code.plan_type,
    'expires_at', v_new_expires_at,
    'duration_days', v_code.duration_days
  );
END;
$$;

-- Exemple pour créer un code d'activation VIP :
-- INSERT INTO public.activation_codes (code, plan_type, duration_days)
-- VALUES ('VIP-TOGO-2026', 'pass_30d', 30);


