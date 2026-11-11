import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DocumentCompressor } from './features/compressor/DocumentCompressor';
import { ReceiptGenerator } from './features/receipt/ReceiptGenerator';
import { FeeSimulator } from './features/simulator/FeeSimulator';
import { LearningHub } from './features/learning/LearningHub';
import { ServicesHub } from './features/services/ServicesHub';
import { AffiliateHub } from './features/affiliate/AffiliateHub';
import { PassModal } from './components/PassModal';
import { TabType, UserPass } from './types';
import { getStoredUserPass, isPassActive } from './lib/storage';
import { FileText, Receipt, Smartphone } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('outils');
  const [activeTool, setActiveTool] = useState<'compressor' | 'receipt' | 'simulator'>('compressor');
  const [userPass, setUserPass] = useState<UserPass>(getStoredUserPass());
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  useEffect(() => {
    setUserPass(getStoredUserPass());
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
            {/* Sélecteur d'outils à 3 volets */}
            <div className="grid grid-cols-3 gap-1.5 bg-slate-200/70 p-1 rounded-xl">
              <button
                onClick={() => setActiveTool('compressor')}
                className={`py-2 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 truncate ${
                  activeTool === 'compressor'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText size={14} className="shrink-0" />
                <span className="truncate">Compresseur &lt; 500 Ko</span>
              </button>

              <button
                onClick={() => setActiveTool('receipt')}
                className={`py-2 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 truncate ${
                  activeTool === 'receipt'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Receipt size={14} className="shrink-0" />
                <span className="truncate">Reçu WhatsApp Pro</span>
              </button>

              <button
                onClick={() => setActiveTool('simulator')}
                className={`py-2 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 truncate ${
                  activeTool === 'simulator'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone size={14} className="shrink-0" />
                <span className="truncate">Frais T-Money / Flooz</span>
              </button>
            </div>

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
