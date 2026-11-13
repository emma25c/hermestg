import React, { useState, useEffect } from 'react';
import { 
  User, Smartphone, MapPin, Gift, Check, ShieldCheck, 
  LogOut, LogIn, Mail, Lock, AlertCircle, Copy, Share2, 
  UserPlus, RefreshCw
} from 'lucide-react';
import { UserProfileData, UserPass } from '../../types';
import { getStoredUserProfile, saveStoredUserProfile } from '../../lib/storage';
import { 
  signInWithGoogle, 
  signInWithEmail, 
  signUpWithEmail, 
  signOutUser, 
  fetchRemoteProfile, 
  upsertRemoteProfile 
} from '../../lib/auth';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface UserProfileProps {
  userPass: UserPass;
  onUpdatePass: (pass: UserPass) => void;
  onOpenPassModal: () => void;
  onSignOut?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  userPass,
  onUpdatePass,
  onOpenPassModal,
  onSignOut
}) => {
  const [profile, setProfile] = useState<UserProfileData>(getStoredUserProfile());
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Synchronisation si le pass global change (ex: via modal)
  useEffect(() => {
    setProfile(prev => ({
      ...prev,
      passStatus: userPass.status,
      passExpiresAt: userPass.expiresAt,
      referralCode: userPass.referralCode || prev.referralCode,
      affiliateBalance: userPass.affiliateBalance,
      referralCount: userPass.referralCount
    }));
  }, [userPass]);

  // Authentification Supabase
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'view' | 'email_login' | 'email_signup'>('view');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Suggestions rapides de campus / quartiers togolais
  const quickLocations = [
    'Université de Lomé',
    'Agoè-Nyivé',
    'Adidogomé',
    'Bè / Lomé Centre',
    'Université de Kara',
    'Kpalimé'
  ];

  // Écoute de la session Supabase
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    // Récupérer la session active
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      setSessionUser(user);
      if (user) {
        syncWithRemoteProfile(user.id, user.email, user.user_metadata);
      }
    });

    // Écouter les changements d'authentification (ex: redirection Google)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setSessionUser(user);
      if (user) {
        syncWithRemoteProfile(user.id, user.email, user.user_metadata);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Synchronisation avec Supabase
  const syncWithRemoteProfile = async (userId: string, userEmail?: string, metadata?: any) => {
    try {
      const remote = await fetchRemoteProfile(userId);
      setProfile((prev) => {
        const merged: UserProfileData = {
          ...prev,
          id: userId,
          email: userEmail || prev.email,
          fullName: remote?.fullName || metadata?.full_name || metadata?.name || prev.fullName,
          phone: remote?.phone || prev.phone,
          cityOrUniversity: remote?.cityOrUniversity || prev.cityOrUniversity,
          referralCode: remote?.referralCode || prev.referralCode,
          passStatus: remote?.passStatus || prev.passStatus,
          passExpiresAt: remote?.passExpiresAt || prev.passExpiresAt,
          affiliateBalance: remote?.affiliateBalance ?? prev.affiliateBalance,
          referralCount: remote?.referralCount ?? prev.referralCount,
          avatarUrl: metadata?.avatar_url || prev.avatarUrl
        };
        saveStoredUserProfile(merged);
        onUpdatePass({
          status: merged.passStatus,
          expiresAt: merged.passExpiresAt,
          referralCode: merged.referralCode,
          affiliateBalance: merged.affiliateBalance,
          referralCount: merged.referralCount
        });
        return merged;
      });
    } catch {
      // Échec silencieux si hors-ligne
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setAuthError(null);

    try {
      // 1. Sauvegarde locale (garantie hors-ligne 0 perte)
      saveStoredUserProfile(profile);
      onUpdatePass({
        status: profile.passStatus,
        expiresAt: profile.passExpiresAt,
        referralCode: profile.referralCode,
        affiliateBalance: profile.affiliateBalance,
        referralCount: profile.referralCount
      });

      // 2. Si connecté à Supabase, synchronisation distante
      if (sessionUser?.id) {
        await upsertRemoteProfile(sessionUser.id, profile);
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      setAuthError(err.message || 'Erreur lors de la synchronisation.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setAuthError(err.message || 'Impossible de lancer la connexion Google.');
      setAuthLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setAuthLoading(true);
    setAuthError(null);

    try {
      if (authMode === 'email_login') {
        const { user } = await signInWithEmail(email, password);
        if (user) {
          await syncWithRemoteProfile(user.id, user.email, user.user_metadata);
          setAuthMode('view');
        }
      } else if (authMode === 'email_signup') {
        const { user } = await signUpWithEmail(
          email, 
          password, 
          profile.fullName, 
          profile.phone, 
          profile.cityOrUniversity,
          profile.referredBy
        );
        if (user) {
          await syncWithRemoteProfile(user.id, user.email, user.user_metadata);
          setAuthMode('view');
        }
      }
    } catch (err: any) {
      setAuthError(err.message || "Une erreur est survenue lors de l'authentification.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    setAuthLoading(true);
    try {
      await signOutUser();
      setSessionUser(null);
      if (onSignOut) {
        onSignOut();
      }
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(profile.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const isPassActive = profile.passStatus !== 'free' && profile.passExpiresAt && new Date(profile.passExpiresAt).getTime() > Date.now();

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. CARTE PROFIL & STATUT CLOUD */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            {profile.avatarUrl ? (
              <img 
                src={profile.avatarUrl} 
                alt="Avatar" 
                className="w-14 h-14 rounded-2xl border-2 border-slate-200 object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg font-display tracking-tight shadow-xs">
                {profile.fullName ? profile.fullName.slice(0, 2).toUpperCase() : 'DJ'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  {profile.fullName || 'Utilisateur Djanta'}
                </h2>
                {sessionUser && (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check size={10} className="stroke-[3]" /> Connecté
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {sessionUser?.email || profile.email || 'Compte actif'}
              </p>
            </div>
          </div>

          {/* Statut du Pass */}
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2">
            <button
              onClick={onOpenPassModal}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isPassActive 
                  ? 'bg-emerald-700 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ShieldCheck size={14} className={isPassActive ? 'text-emerald-300' : 'text-slate-500'} />
              <span>{isPassActive ? 'Pass Réussite Actif' : 'Formule Gratuite'}</span>
            </button>
          </div>
        </div>

        {/* 2. AUTHENTIFICATION : GOOGLE (GRATUIT) & EMAIL */}
        {!sessionUser ? (
          <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="mb-4">
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 block mb-1">
                Synchronisation Cloud &amp; Sauvegarde
              </span>
              <p className="text-xs text-slate-600">
                Connectez-vous pour retrouver vos cours, vos reçus et vos gains d'ambassadeur sur votre téléphone ou votre PC.
              </p>
            </div>

            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-rose-600" />
                <span>{authError}</span>
              </div>
            )}

            {authMode === 'view' && (
              <div className="space-y-3">
                {/* Bouton Connexion Google Officiel */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={authLoading}
                  className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-colors shadow-xs"
                >
                  {/* Google SVG Logo */}
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                  <span>{authLoading ? 'Connexion en cours...' : 'Continuer avec Google (1 clic • 100% Gratuit)'}</span>
                </button>

                <div className="flex items-center my-3">
                  <div className="flex-1 border-t border-slate-200"></div>
                  <span className="px-3 text-[11px] text-slate-400 font-medium">OU</span>
                  <div className="flex-1 border-t border-slate-200"></div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('email_login'); setAuthError(null); }}
                    className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Mail size={14} />
                    <span>Connexion Email</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('email_signup'); setAuthError(null); }}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <UserPlus size={14} className="text-amber-600" />
                    <span>Créer un compte</span>
                  </button>
                </div>
              </div>
            )}

            {/* Formulaire Email Connexion ou Inscription */}
            {(authMode === 'email_login' || authMode === 'email_signup') && (
              <form onSubmit={handleEmailAuth} className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-800">
                    {authMode === 'email_login' ? 'Connexion avec Email' : 'Créer votre compte gratuit'}
                  </span>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('view'); setAuthError(null); }}
                    className="text-xs text-slate-500 hover:text-slate-800 underline"
                  >
                    Retour
                  </button>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Adresse E-mail</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nom@exemple.com"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Mot de passe</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-slate-900"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    {authLoading ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <LogIn size={14} />
                    )}
                    <span>{authMode === 'email_login' ? 'Se connecter' : 'Confirmer mon inscription'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthMode(authMode === 'email_login' ? 'email_signup' : 'email_login')}
                    className="py-2.5 px-3 text-xs text-slate-600 hover:text-slate-900 font-medium"
                  >
                    {authMode === 'email_login' ? 'Pas de compte ? Créer' : 'Déjà inscrit ? Connexion'}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Connecté ({sessionUser?.email || profile.email})</span>
            </div>
            <button
              onClick={handleSignOut}
              disabled={authLoading}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 py-1 px-2.5 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <LogOut size={13} />
              <span>Se déconnecter</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. FORMULAIRE PRINCIPAL DES INFORMATIONS UTILISATEUR */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <User size={18} className="text-slate-700" />
              <span>Vos Informations Personnelles</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Coordonnées pour vos reçus et votre profil.
            </p>
          </div>

          {isSaved && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 animate-fadeIn">
              <Check size={14} className="stroke-[3]" /> Enregistré !
            </span>
          )}
        </div>

        {/* Champ 1 : Nom Complet */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Nom et Prénom(s) complets
          </label>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              required
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              placeholder="Ex: Emmanuel Lawson"
              className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-slate-900 transition-colors font-medium"
            />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Ce nom apparaîtra sur vos reçus et certificats de formation.
          </span>
        </div>

        {/* Champ 2 : Téléphone Mobile Money */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-800">
              Numéro Mobile Money (T-Money ou Flooz)
            </label>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => setProfile({ ...profile, phoneProvider: 'T-Money' })}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                  profile.phoneProvider === 'T-Money'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                T-Money
              </button>
              <button
                type="button"
                onClick={() => setProfile({ ...profile, phoneProvider: 'Flooz' })}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                  profile.phoneProvider === 'Flooz'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Flooz
              </button>
            </div>
          </div>

          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-xs font-mono font-bold text-slate-500 flex items-center gap-1 select-none">
              <Smartphone size={14} className="text-slate-400" /> +228
            </span>
            <input
              type="tel"
              required
              value={profile.phone.replace('+228', '').trim()}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/\D/g, '');
                setProfile({ ...profile, phone: cleaned ? `+228 ${cleaned}` : '' });
              }}
              placeholder="70 XX XX XX ou 90 XX XX XX"
              className="w-full pl-20 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-slate-900 font-mono tracking-wide"
            />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Nécessaire pour le versement automatique de vos gains d'affiliation (500 F / ami).
          </span>
        </div>

        {/* Champ 3 : Ville / Quartier ou Campus */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Campus universitaire ou Quartier de résidence
          </label>
          <div className="relative mb-2">
            <MapPin size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={profile.cityOrUniversity}
              onChange={(e) => setProfile({ ...profile, cityOrUniversity: e.target.value })}
              placeholder="Ex: Université de Lomé, Agoè, Adidogomé..."
              className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-slate-900"
            />
          </div>

          {/* Puces de suggestion rapide */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-medium mr-1">Suggestions :</span>
            {quickLocations.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setProfile({ ...profile, cityOrUniversity: loc })}
                className={`text-[10px] font-medium px-2 py-0.5 rounded-md border transition-colors ${
                  profile.cityOrUniversity === loc
                    ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Champ 4 : Code Parrain (Optionnel) */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Code Parrain reçu d'un ami (Optionnel)
          </label>
          <div className="relative">
            <Gift size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={profile.referredBy || ''}
              onChange={(e) => setProfile({ ...profile, referredBy: e.target.value.toUpperCase() })}
              placeholder="Ex: DJANTA8291"
              className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-slate-900 font-mono uppercase"
            />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Si un ami vous a invité, entrez son code pour lui faire gagner sa prime de recommandation.
          </span>
        </div>

        {/* Bouton de Sauvegarde */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : isSaved ? (
              <Check size={16} className="stroke-[3] text-emerald-400" />
            ) : (
              <Check size={16} />
            )}
            <span>
              {isSaving ? 'Enregistrement en cours...' : isSaved ? 'Informations Enregistrées !' : 'Enregistrer mes informations'}
            </span>
          </button>
        </div>
      </form>

      {/* 4. VOTRE CODE PERSONNEL & GAINS D'AFFILIATION */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
              Votre Identifiant d'Ambassadeur
            </span>
            <h4 className="text-sm font-bold text-white">
              Gagnez 500 FCFA pour chaque ami parrainé
            </h4>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-1 rounded-lg">
            {profile.affiliateBalance.toLocaleString('fr-FR')} FCFA
          </span>
        </div>

        <div>
          <span className="text-xs text-slate-400 block mb-1.5">Votre code personnel unique :</span>
          <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-xl border border-slate-700">
            <span className="font-mono font-black text-base text-amber-400 tracking-wider pl-2 flex-1">
              {profile.referralCode}
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="py-1.5 px-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copiedCode ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copiedCode ? 'Copié !' : 'Copier'}</span>
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Salut ! Utilise Djanta Hub pour tes documents de concours < 500 Ko et reçus WhatsApp. Mon code parrain : ${profile.referralCode} https://djantahub.vercel.app`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Share2 size={13} />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
