import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DocumentCompressor } from './features/compressor/DocumentCompressor';
import { ReceiptGenerator } from './features/receipt/ReceiptGenerator';
import { LearningHub } from './features/learning/LearningHub';
import { ServicesHub } from './features/services/ServicesHub';
import { AffiliateHub } from './features/affiliate/AffiliateHub';
import { PassModal } from './components/PassModal';
import { TabType, UserPass } from './types';
import { getStoredUserPass, isPassActive } from './lib/storage';
import { FileText, Receipt, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('outils');
  const [activeTool, setActiveTool] = useState<'compressor' | 'receipt'>('compressor');
  const [userPass, setUserPass] = useState<UserPass>(getStoredUserPass());
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  useEffect(() => {
    setUserPass(getStoredUserPass());
  }, []);

  const passActive = isPassActive(userPass);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        userPass={userPass}
        onOpenPassModal={() => setIsPassModalOpen(true)}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        {/* Bannière d'introduction rapide */}
        <section className="mb-6 bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-5 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 bg-emerald-700/80 text-emerald-100 text-[11px] font-bold px-3 py-1 rounded-full mb-2">
              <Sparkles size={12} className="text-amber-400" /> Plateforme Optimisée Réseau Togocom / Moov
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-1">
              Gagnez du temps et économisez votre argent.
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl leading-relaxed">
              Compressez vos pièces de concours strictement sous 500 Ko, générez des reçus WhatsApp propres en 30 secondes et apprenez des compétences rentables.
            </p>
          </div>
          <div className="absolute right-[-20px] bottom-[-20px] w-36 h-36 bg-emerald-600/30 rounded-full blur-2xl"></div>
        </section>

        {/* CONTENU SELON L'ONGLET SÉLECTIONNÉ */}
        {currentTab === 'outils' && (
          <div className="space-y-4">
            {/* Sous-sélecteur d'outils express */}
            <div className="grid grid-cols-2 gap-2 bg-slate-200/80 p-1.5 rounded-2xl">
              <button
                onClick={() => setActiveTool('compressor')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTool === 'compressor'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText size={15} /> Compresseur &lt; 500 Ko
              </button>
              <button
                onClick={() => setActiveTool('receipt')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTool === 'receipt'
                    ? 'bg-white text-orange-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Receipt size={15} /> Reçu WhatsApp Pro
              </button>
            </div>

            {activeTool === 'compressor' ? (
              <DocumentCompressor />
            ) : (
              <ReceiptGenerator />
            )}
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
