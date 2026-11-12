import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DocumentCompressor } from './features/compressor/DocumentCompressor';
import { ReceiptGenerator } from './features/receipt/ReceiptGenerator';
import { FeeSimulator } from './features/simulator/FeeSimulator';
import { ApcExamGenerator } from './features/apc/ApcExamGenerator';
import { LearningHub } from './features/learning/LearningHub';
import { ServicesHub } from './features/services/ServicesHub';
import { AffiliateHub } from './features/affiliate/AffiliateHub';
import { UserProfile } from './features/profile/UserProfile';
import { AuthGate } from './features/auth/AuthGate';
import { LionLogo } from './components/LionLogo';
import { PassModal } from './components/PassModal';
import { TabType, ActiveToolType, UserPass } from './types';
import { getStoredUserPass, isPassActive } from './lib/storage';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { signOutUser } from './lib/auth';
import { FileText, Receipt, Smartphone, GraduationCap } from 'lucide-react';

export const App: React.FC = () => {
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  const [currentTab, setCurrentTab] = useState<TabType>('outils');
  const [activeTool, setActiveTool] = useState<ActiveToolType>('apc_generator');
  const [userPass, setUserPass] = useState<UserPass>(getStoredUserPass());
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  // 1. Écoute de la session Supabase active et des changements d'état
  useEffect(() => {
    let isMounted = true;
    setUserPass(getStoredUserPass());

    if (!isSupabaseConfigured()) {
      setIsAuthChecking(false);
      return;
    }

    // Récupérer la session active sauvegardée
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      if (session?.user) {
        setSessionUser(session.user);
      } else {
        setSessionUser(null);
      }
      setIsAuthChecking(false);
    }).catch((err) => {
      console.error('Erreur vérification session:', err);
      if (isMounted) {
        setSessionUser(null);
        setIsAuthChecking(false);
      }
    });

    // Écouter dynamiquement les connexions, rafraîchissements et déconnexions
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      const user = session?.user ?? null;
      setSessionUser(user);
      setIsAuthChecking(false);

      if (event === 'SIGNED_OUT') {
        setSessionUser(null);
      }

      // Nettoyer l'URL si retour d'OAuth Google ou Magic Link
      const hash = window.location.hash;
      const search = window.location.search;
      if (hash.includes('access_token') || hash.includes('type=') || search.includes('code=')) {
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Déconnexion complète réinitialisant la session
  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    } finally {
      setSessionUser(null);
    }
  };

  const passActive = isPassActive(userPass);

  // ÉCRAN DE CHARGEMENT INITIAL (SPLASH SCREEN AVEC LION DJANTA ET SPINNER)
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 text-white select-none">
        <div className="flex flex-col items-center text-center space-y-5 max-w-sm animate-fadeIn">
          <div className="relative">
            <div className="absolute -inset-4 bg-amber-500/20 rounded-full blur-2xl animate-pulse" />
            <LionLogo size={76} className="w-20 h-20 relative z-10" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display">
              Djanta<span className="text-amber-500">Hub</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              La force d’avancer au Togo 🇹🇬
            </p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 shadow-xl">
            <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span>Vérification de la session...</span>
          </div>
        </div>
      </div>
    );
  }

  // PORTAIL D'AUTHENTIFICATION OBLIGATOIRE SI NON CONNECTÉ
  if (!sessionUser) {
    return (
      <AuthGate
        onAuthenticated={(user) => {
          setSessionUser(user);
        }}
      />
    );
  }

  // APPLICATION COMPLÈTE DISPONIBLE UNIQUEMENT POUR L'UTILISATEUR CONNECTÉ
  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-900 flex flex-col font-sans antialiased selection:bg-slate-900 selection:text-white">
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        userPass={userPass}
        onOpenPassModal={() => setIsPassModalOpen(true)}
        onSignOut={handleSignOut}
        sessionUser={sessionUser}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        {/* Titre et raison d'être Djanta Hub */}
        <div className="mb-6 pb-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Djanta Hub — La force d’avancer au Togo.
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Boîte à outils locale pour les élèves, enseignants et vendeurs de Lomé : générateur d'épreuves APC par IA, compression de documents de concours sous 500 Ko, reçus WhatsApp et calcul des frais de retrait.
          </p>
        </div>

        {/* CONTENU SELON L'ONGLET SÉLECTIONNÉ */}
        {currentTab === 'outils' && (
          <div className="space-y-6">
            {/* SÉLECTEUR RAPIDE D'OUTILS (SEGMENTED BAR) */}
            <div className="p-1.5 bg-slate-200/80 rounded-2xl flex flex-wrap gap-1 border border-slate-300/60 shadow-xs">
              <button
                type="button"
                onClick={() => setActiveTool('apc_generator')}
                className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTool === 'apc_generator'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/70'
                }`}
              >
                <GraduationCap size={15} className={activeTool === 'apc_generator' ? 'text-amber-400' : 'text-slate-500'} />
                <span>Épreuves APC (IA)</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-amber-500 text-slate-950">
                  Togo
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('compressor')}
                className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTool === 'compressor'
                    ? 'bg-slate-900 text-white shadow-sm font-bold'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/70'
                }`}
              >
                <FileText size={15} className={activeTool === 'compressor' ? 'text-amber-400' : 'text-slate-500'} />
                <span>Compresseur</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('receipt')}
                className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTool === 'receipt'
                    ? 'bg-slate-900 text-white shadow-sm font-bold'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/70'
                }`}
              >
                <Receipt size={15} className={activeTool === 'receipt' ? 'text-amber-400' : 'text-slate-500'} />
                <span>Reçus WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('simulator')}
                className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTool === 'simulator'
                    ? 'bg-slate-900 text-white shadow-sm font-bold'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/70'
                }`}
              >
                <Smartphone size={15} className={activeTool === 'simulator' ? 'text-amber-400' : 'text-slate-500'} />
                <span>Frais Mobiles</span>
              </button>
            </div>

            {activeTool === 'apc_generator' && (
              <ApcExamGenerator
                userPass={userPass}
                onOpenPassModal={() => setIsPassModalOpen(true)}
              />
            )}
            {activeTool === 'compressor' && <DocumentCompressor />}
            {activeTool === 'receipt' && <ReceiptGenerator />}
            {activeTool === 'simulator' && <FeeSimulator />}
          </div>
        )}

        {currentTab === 'formations' && (
          <LearningHub
            isPassActive={passActive}
            onOpenPassModal={() => setIsPassModalOpen(true)}
          />
        )}

        {currentTab === 'services' && (
          <ServicesHub isPassActive={passActive} />
        )}

        {currentTab === 'affiliation' && (
          <AffiliateHub userPass={userPass} />
        )}

        {currentTab === 'profil' && (
          <UserProfile
            userPass={userPass}
            onUpdatePass={(updated) => setUserPass(updated)}
            onOpenPassModal={() => setIsPassModalOpen(true)}
            onSignOut={handleSignOut}
          />
        )}
      </main>

      <Footer />

      <PassModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        userPass={userPass}
        onPassUpdated={(updated) => setUserPass(updated)}
      />
    </div>
  );
};

export default App;
