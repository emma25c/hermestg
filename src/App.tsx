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
import { PassModal } from './components/PassModal';
import { TabType, ActiveToolType, UserPass } from './types';
import { getStoredUserPass, isPassActive } from './lib/storage';
import { FileText, Receipt, Smartphone, GraduationCap } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('outils');
  const [activeTool, setActiveTool] = useState<ActiveToolType>('apc_generator');
  const [userPass, setUserPass] = useState<UserPass>(getStoredUserPass());
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  useEffect(() => {
    setUserPass(getStoredUserPass());

    // Si redirection après connexion OAuth Supabase (Google) ou confirmation email
    const hash = window.location.hash;
    const search = window.location.search;
    if (hash.includes('access_token') || hash.includes('type=') || search.includes('code=')) {
      setCurrentTab('profil');
    }
  }, []);

  const passActive = isPassActive(userPass);

  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-900 flex flex-col font-sans antialiased selection:bg-slate-900 selection:text-white">
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        userPass={userPass}
        onOpenPassModal={() => setIsPassModalOpen(true)}
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
