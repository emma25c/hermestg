import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DocumentCompressor } from './features/compressor/DocumentCompressor';
import { ReceiptGenerator } from './features/receipt/ReceiptGenerator';
import { FeeSimulator } from './features/simulator/FeeSimulator';
import { LearningHub } from './features/learning/LearningHub';
import { ServicesHub } from './features/services/ServicesHub';
import { AffiliateHub } from './features/affiliate/AffiliateHub';
import { UserProfile } from './features/profile/UserProfile';
import { PassModal } from './components/PassModal';
import { TabType, UserPass } from './types';
import { getStoredUserPass, isPassActive } from './lib/storage';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('outils');
  const [activeTool, setActiveTool] = useState<'compressor' | 'receipt' | 'simulator'>('compressor');
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
            Boîte à outils locale pour les élèves, étudiants et vendeurs de Lomé : compresser vos documents de concours sous 500 Ko, générer des reçus WhatsApp et calculer vos frais de retrait.
          </p>
        </div>

        {/* CONTENU SELON L'ONGLET SÉLECTIONNÉ */}
        {currentTab === 'outils' && (
          <div className="space-y-4">
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
