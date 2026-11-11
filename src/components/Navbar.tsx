import React, { useState } from 'react';
import { TabType, UserPass } from '../types';
import { OfflineBadge } from './OfflineBadge';
import { LionLogo } from './LionLogo';
import { 
  Menu, X, FileText, Receipt, Smartphone, Compass, 
  BookOpen, Briefcase, Users, ShieldCheck, ChevronRight, MessageCircle 
} from 'lucide-react';
import { isPassActive } from '../lib/storage';

interface NavbarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  activeTool: 'compressor' | 'receipt' | 'simulator';
  onSelectTool: (tool: 'compressor' | 'receipt' | 'simulator') => void;
  userPass: UserPass;
  onOpenPassModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  activeTool,
  onSelectTool,
  userPass,
  onOpenPassModal
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const active = isPassActive(userPass);

  const handleNavigate = (tab: TabType, tool?: 'compressor' | 'receipt' | 'simulator') => {
    onSelectTab(tab);
    if (tool) {
      onSelectTool(tool);
    }
    setIsDrawerOpen(false);
  };

  return (
    <>
      {/* BARRE DE NAVIGATION SUPÉRIEURE */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          {/* Bouton Hamburger (Les 3 traits) + Logo Djanta */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 -ml-1 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center"
              aria-label="Ouvrir le menu de navigation"
            >
              <Menu size={22} className="stroke-[2.2]" />
            </button>

            <div 
              onClick={() => handleNavigate('outils')}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <LionLogo size={34} />
              <div>
                <span className="font-display font-extrabold text-base tracking-tight text-slate-900 block leading-tight">
                  Djanta<span className="text-amber-600">Hub</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium block leading-none">
                  L'outil des ambitieux au Togo
                </span>
              </div>
            </div>
          </div>

          {/* Statut & Bouton Pass */}
          <div className="flex items-center gap-2">
            <OfflineBadge />

            <button
              onClick={onOpenPassModal}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                active
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck size={14} className={active ? 'text-emerald-300' : 'text-amber-400'} />
              <span>{active ? 'Pass Actif' : 'Activer Pass'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* TIROIR LATÉRAL DE NAVIGATION (LE MENU HAMBURGER DES 3 TRAITS) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex animate-fadeIn">
          {/* Fond sombre cliquable pour fermer */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
          />

          {/* Panneau coulissant */}
          <aside className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between z-10 border-r border-slate-200">
            {/* Haut du menu : Logo + Fermeture */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LionLogo size={40} />
                <div>
                  <span className="font-display font-extrabold text-lg tracking-tight text-slate-900 block leading-tight">
                    Djanta<span className="text-amber-600">Hub</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium block">
                    La force d'avancer • Lomé 🇹🇬
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Fermer le menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Corps du menu : Toutes les rubriques claires */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* GROUPE 1 : OUTILS DU QUOTIDIEN */}
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 block mb-2">
                  Outils Pratiques (100% Hors-ligne)
                </span>
                <div className="space-y-1">
                  <button
                    onClick={() => handleNavigate('outils', 'compressor')}
                    className={`w-full p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      currentTab === 'outils' && activeTool === 'compressor'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText size={16} className={currentTab === 'outils' && activeTool === 'compressor' ? 'text-amber-400' : 'text-slate-400'} />
                      <span>Compresseur &lt; 500 Ko</span>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                      Concours
                    </span>
                  </button>

                  <button
                    onClick={() => handleNavigate('outils', 'receipt')}
                    className={`w-full p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      currentTab === 'outils' && activeTool === 'receipt'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Receipt size={16} className={currentTab === 'outils' && activeTool === 'receipt' ? 'text-amber-400' : 'text-slate-400'} />
                      <span>Reçus WhatsApp Pro</span>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                      Vendeurs
                    </span>
                  </button>

                  <button
                    onClick={() => handleNavigate('outils', 'simulator')}
                    className={`w-full p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      currentTab === 'outils' && activeTool === 'simulator'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Smartphone size={16} className={currentTab === 'outils' && activeTool === 'simulator' ? 'text-amber-400' : 'text-slate-400'} />
                      <span>Frais T-Money &amp; Flooz</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-300" />
                  </button>
                </div>
              </div>

              {/* GROUPE 2 : SAVOIR & COMPÉTENCES */}
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 block mb-2">
                  Conseils &amp; Formations
                </span>
                <div className="space-y-1">
                  <button
                    onClick={() => handleNavigate('formations')}
                    className={`w-full p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      currentTab === 'formations'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Compass size={16} className={currentTab === 'formations' ? 'text-amber-400' : 'text-slate-400'} />
                      <span>Astuces &amp; Démarches Togo</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-300" />
                  </button>

                  <button
                    onClick={() => handleNavigate('formations')}
                    className="w-full p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <BookOpen size={16} className="text-slate-400" />
                      <span>Formations Express 15 min</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">3 cours</span>
                  </button>
                </div>
              </div>

              {/* GROUPE 3 : SERVICES & AFFILIATION */}
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 block mb-2">
                  Opportunités &amp; Revenus
                </span>
                <div className="space-y-1">
                  <button
                    onClick={() => handleNavigate('services')}
                    className={`w-full p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      currentTab === 'services'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Briefcase size={16} className={currentTab === 'services' ? 'text-amber-400' : 'text-slate-400'} />
                      <span>Services Rédaction CV</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      -50% Pass
                    </span>
                  </button>

                  <button
                    onClick={() => handleNavigate('affiliation')}
                    className={`w-full p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      currentTab === 'affiliation'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Users size={16} className={currentTab === 'affiliation' ? 'text-amber-400' : 'text-slate-400'} />
                      <span>Ambassadeur Campus</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                      500 F / ami
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Pied du tiroir : État du Pass & Assistance */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Statut d'accès :</span>
                <span className={`font-bold ${active ? 'text-emerald-700' : 'text-slate-700'}`}>
                  {active ? 'Pass Actif' : 'Formule Gratuite'}
                </span>
              </div>

              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  onOpenPassModal();
                }}
                className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <ShieldCheck size={14} className="text-amber-400" />
                <span>{active ? 'Gérer mon abonnement' : 'Activer le Pass Réussite'}</span>
              </button>

              <a
                href="https://wa.me/22872199337?text=Bonjour%20Djanta%20Hub,%20j'ai%20une%20question"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 text-slate-600 hover:text-slate-900 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 hover:bg-slate-200/50"
              >
                <MessageCircle size={14} className="text-emerald-600" />
                <span>Contacter le support à Lomé</span>
              </a>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
