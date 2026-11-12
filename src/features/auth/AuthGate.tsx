import React, { useState } from 'react';
import { LionLogo } from '../../components/LionLogo';
import { 
  Mail, Lock, User, Smartphone, MapPin, Eye, EyeOff, 
  Loader2, AlertCircle, CheckCircle2, ShieldCheck, Sparkles, 
  LogIn, UserPlus, Gift, MessageCircle
} from 'lucide-react';
import { 
  signInWithGoogle, 
  signInWithEmail, 
  signUpWithEmail, 
  upsertRemoteProfile, 
  fetchRemoteProfile 
} from '../../lib/auth';
import { isSupabaseConfigured } from '../../lib/supabase';
import { getStoredUserProfile, saveStoredUserProfile } from '../../lib/storage';

interface AuthGateProps {
  onAuthenticated?: (user: any) => void;
}

export const AuthGate: React.FC<AuthGateProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  
  // Champs formulaire
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [cityOrUniversity, setCityOrUniversity] = useState('Université de Lomé');
  const [customCity, setCustomCity] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showReferralInput, setShowReferralInput] = useState(false);

  // États de chargement et retours
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Suggestions rapides pour le Togo
  const quickLocations = [
    'Université de Lomé',
    'Agoè-Nyivé',
    'Adidogomé',
    'Bè / Lomé Centre',
    'Université de Kara',
    'Kpalimé',
    'Autre'
  ];

  // Traduction conviviale des erreurs d'authentification
  const translateAuthError = (err: any): string => {
    const raw = err?.message || String(err || '');
    if (raw.includes('Invalid login credentials')) {
      return 'Adresse e-mail ou mot de passe incorrect. Vérifiez vos identifiants.';
    }
    if (raw.includes('User already registered')) {
      return 'Un compte existe déjà avec cette adresse e-mail. Cliquez sur "Connexion".';
    }
    if (raw.includes('Password should be at least 6 characters')) {
      return 'Le mot de passe doit comporter au moins 6 caractères.';
    }
    if (raw.includes('Email not confirmed')) {
      return 'Veuillez confirmer votre adresse e-mail via le lien reçu avant de vous connecter.';
    }
    if (raw.includes('rate limit') || raw.includes('over_email_send_rate_limit')) {
      return 'Trop de tentatives en peu de temps. Veuillez patienter 1 minute avant de réessayer.';
    }
    if (raw.includes('Failed to fetch') || raw.includes('network')) {
      return 'Connexion réseau impossible. Vérifiez votre connexion internet.';
    }
    if (raw.includes("Supabase n'est pas")) {
      return "Le service d'authentification Supabase n'est pas encore configuré.";
    }
    return raw || "Une erreur est survenue lors de l'authentification.";
  };

  // Connexion Google en 1 clic
  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMessage(null);
    setGoogleLoading(true);

    try {
      if (!isSupabaseConfigured()) {
        throw new Error("Supabase n'est pas configuré.");
      }
      await signInWithGoogle();
      // Redirection automatique via OAuth vers le fournisseur Google
    } catch (err: any) {
      setError(translateAuthError(err));
      setGoogleLoading(false);
    }
  };

  // Soumission du formulaire Email (Connexion ou Inscription)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Veuillez renseigner votre e-mail et votre mot de passe.');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    const effectiveCity = cityOrUniversity === 'Autre' 
      ? (customCity.trim() || 'Lomé') 
      : cityOrUniversity;

    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!fullName.trim()) {
          setError('Veuillez renseigner votre nom complet.');
          setLoading(false);
          return;
        }

        const { user, session } = await signUpWithEmail(
          cleanEmail,
          password,
          fullName.trim(),
          phone.trim(),
          effectiveCity,
          referralCode.trim() || undefined
        );

        // Sauvegarder les données de profil en local immédiatement
        const currentProfile = getStoredUserProfile();
        const updatedProfile = {
          ...currentProfile,
          id: user?.id || currentProfile.id,
          email: cleanEmail,
          fullName: fullName.trim(),
          phone: phone.trim(),
          cityOrUniversity: effectiveCity,
          referredBy: referralCode.trim() || undefined,
        };
        saveStoredUserProfile(updatedProfile);

        if (session && user) {
          // Session immédiate
          try {
            await upsertRemoteProfile(user.id, updatedProfile);
          } catch {
            // tolérance hors-ligne
          }
          if (onAuthenticated) {
            onAuthenticated(user);
          }
        } else if (user) {
          // Si Supabase nécessite la confirmation par email
          setSuccessMessage(
            'Compte créé avec succès ! Un e-mail de confirmation vous a été envoyé. Veuillez cliquer sur le lien puis vous connecter.'
          );
          setMode('login');
        }
      } else {
        // Mode Connexion
        const { user } = await signInWithEmail(cleanEmail, password);
        if (user) {
          // Récupération du profil distant et synchronisation locale
          try {
            const remote = await fetchRemoteProfile(user.id);
            const currentProfile = getStoredUserProfile();
            const synced = {
              ...currentProfile,
              id: user.id,
              email: user.email || cleanEmail,
              fullName: remote?.fullName || user.user_metadata?.full_name || currentProfile.fullName,
              phone: remote?.phone || currentProfile.phone,
              cityOrUniversity: remote?.cityOrUniversity || currentProfile.cityOrUniversity,
              referralCode: remote?.referralCode || currentProfile.referralCode,
              passStatus: remote?.passStatus || currentProfile.passStatus,
              passExpiresAt: remote?.passExpiresAt || currentProfile.passExpiresAt,
              affiliateBalance: remote?.affiliateBalance ?? currentProfile.affiliateBalance,
              referralCount: remote?.referralCount ?? currentProfile.referralCount,
            };
            saveStoredUserProfile(synced);
          } catch {
            // Tolérance hors-ligne
          }

          if (onAuthenticated) {
            onAuthenticated(user);
          }
        }
      }
    } catch (err: any) {
      setError(translateAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-between py-6 px-4 sm:px-6 relative overflow-x-hidden selection:bg-amber-500 selection:text-slate-950">
      {/* Halo ambré stylisé en arrière-plan */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[520px] h-[340px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" 
        aria-hidden="true" 
      />

      {/* EN-TÊTE SUPÉRIEURE AVEC LOGO & TITRE */}
      <header className="w-full max-w-md mx-auto pt-2 pb-4 text-center relative z-10">
        <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl mb-3 backdrop-blur-md">
          <LionLogo size={46} className="w-11 h-11" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display">
          Djanta<span className="text-amber-500">Hub</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
          La force d’avancer • Boîte à outils locale pour élèves, enseignants et vendeurs au Togo 🇹🇬
        </p>
      </header>

      {/* CARTE D'AUTHENTIFICATION PRINCIPALE */}
      <main className="w-full max-w-md mx-auto relative z-10">
        <div className="bg-white text-slate-900 rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-100/90">
          
          {/* BASCULE DE MODE (CONNEXION / CRÉER UN COMPTE) */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-5 border border-slate-200/70">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/50'
              }`}
            >
              <LogIn size={15} className={mode === 'login' ? 'text-amber-400' : 'text-slate-400'} />
              <span>Connexion</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'signup'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/50'
              }`}
            >
              <UserPlus size={15} className={mode === 'signup' ? 'text-amber-400' : 'text-slate-400'} />
              <span>Créer un compte</span>
            </button>
          </div>

          {/* BANNIÈRE D'ERREUR */}
          {error && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{error}</div>
            </div>
          )}

          {/* BANNIÈRE DE SUCCÈS */}
          {successMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{successMessage}</div>
            </div>
          )}

          {/* BOUTON GOOGLE EN 1 CLIC */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-2xl text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-colors shadow-xs hover:border-slate-400 active:scale-[0.99] disabled:opacity-60"
            >
              {googleLoading ? (
                <Loader2 size={18} className="animate-spin text-amber-600" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>
                {googleLoading 
                  ? 'Connexion avec Google...' 
                  : 'Continuer avec Google (1 clic)'}
              </span>
            </button>

            {/* SÉPARATEUR ÉLÉGANT */}
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-slate-200"></div>
              <span className="px-3 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                ou avec votre email
              </span>
              <div className="flex-1 border-t border-slate-200"></div>
            </div>
          </div>

          {/* FORMULAIRE EMAIL */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* CHAMPS SUPPLÉMENTAIRES EN MODE CRÉATION DE COMPTE */}
            {mode === 'signup' && (
              <>
                {/* 1. Nom complet */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nom et Prénom(s) complets <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex: Emmanuel Lawson"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-slate-900 transition-colors font-medium bg-white"
                    />
                  </div>
                </div>

                {/* 2. Téléphone Togo */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Téléphone (Togo) <span className="text-slate-400 font-normal">(T-Money ou Flooz)</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-bold text-slate-500 select-none">
                      +228
                    </span>
                    <Smartphone size={14} className="absolute right-3.5 top-3 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="90 12 34 56"
                      className="w-full pl-14 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-slate-900 transition-colors font-medium bg-white"
                    />
                  </div>
                </div>

                {/* 3. Ville ou Campus (Sélection rapide + texte libre) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ville ou Campus au Togo
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {quickLocations.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setCityOrUniversity(loc)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors ${
                          cityOrUniversity === loc
                            ? 'bg-slate-900 text-white font-bold'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>

                  {cityOrUniversity === 'Autre' && (
                    <div className="relative mt-1.5">
                      <MapPin size={15} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={customCity}
                        onChange={(e) => setCustomCity(e.target.value)}
                        placeholder="Précisez votre quartier, ville ou établissement"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-slate-900 transition-colors font-medium bg-white"
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ADRESSE EMAIL (COMMUN) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Adresse E-mail <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-slate-900 transition-colors font-medium bg-white"
                />
              </div>
            </div>

            {/* MOT DE PASSE (COMMUN) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Mot de passe <span className="text-rose-500">*</span>
                </label>
                {mode === 'login' && (
                  <a
                    href="https://wa.me/22872199337?text=Bonjour%20Djanta%20Hub,%20j'ai%20oublié%20mon%20mot%20de%20passe"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-amber-600 hover:text-amber-700 font-semibold"
                  >
                    Besoin d'aide ?
                  </a>
                )}
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-slate-900 transition-colors font-medium bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-1"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {mode === 'signup' && (
                <p className="text-[10px] text-slate-400 mt-1">
                  6 caractères minimum.
                </p>
              )}
            </div>

            {/* CODE PARRAIN OPTIONNEL (EN INSCRIPTION) */}
            {mode === 'signup' && (
              <div>
                {!showReferralInput ? (
                  <button
                    type="button"
                    onClick={() => setShowReferralInput(true)}
                    className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1.5 transition-colors"
                  >
                    <Gift size={13} />
                    <span>Avez-vous un code parrain d'un ami togolais ?</span>
                  </button>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Code de parrainage (Optionnel)
                    </label>
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      placeholder="Ex: DJANTA4092"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-amber-300 focus:outline-hidden focus:border-amber-600 bg-amber-50/40 uppercase tracking-wider font-bold"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Offre 500 FCFA de prime d'ambassadeur à votre parrain.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* BOUTON D'ACTION PRINCIPAL */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-amber-400" />
                    <span>Traitement en cours...</span>
                  </>
                ) : mode === 'login' ? (
                  <>
                    <LogIn size={16} className="text-amber-400" />
                    <span>Se connecter à Djanta Hub</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} className="text-amber-400" />
                    <span>Créer mon compte Djanta Hub</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* RAPPEL SUPABASE CLOUD & PROTECTION DES DONNÉES */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Authentification Supabase Cloud</span>
            </div>
            <a
              href="https://wa.me/22872199337?text=Bonjour%20Djanta%20Hub,%20j'ai%20une%20question%20sur%20l'inscription"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1"
            >
              <MessageCircle size={13} className="text-emerald-600" />
              <span>Support Lomé</span>
            </a>
          </div>
        </div>

        {/* MENTION LÉGALE & ACCÈS DIRECT */}
        <div className="text-center mt-4">
          <p className="text-[11px] text-slate-400">
            En continuant, vous accédez à l'écosystème Djanta Hub Togo. Vos données restent strictement confidentielles.
          </p>
        </div>
      </main>

      {/* PIED DE PAGE */}
      <footer className="w-full max-w-md mx-auto text-center pt-4 pb-2 text-[11px] text-slate-500 relative z-10">
        <p>© {new Date().getFullYear()} Djanta Hub • Fait avec fierté à Lomé, Togo 🇹🇬</p>
      </footer>
    </div>
  );
};

export default AuthGate;
