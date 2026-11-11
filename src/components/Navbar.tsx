import React from 'react';
import { TabType, UserPass } from '../types';
import { OfflineBadge } from './OfflineBadge';
import { Wrench, BookOpen, Briefcase, Users, Crown } from 'lucide-react';
import { isPassActive } from '../lib/storage';

interface NavbarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  userPass: UserPass;
  onOpenPassModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  userPass,
  onOpenPassModal
}) => {
  const active = isPassActive(userPass);

  const tabs = [
    { id: 'outils' as TabType, label: 'Outils', icon: Wrench },
    { id: 'formations' as TabType, label: 'Astuces & Formations', icon: BookOpen },
    { id: 'services' as TabType, label: 'Services CV', icon: Briefcase },
    { id: 'affiliation' as TabType, label: 'Ambassadeur', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 pt-3 pb-2">
        {/* Ligne du haut : Logo, Statut Hors-ligne & Pass */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-black text-sm shadow-sm">
              H
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base tracking-tight text-slate-900">Hermes<span className="text-emerald-700">TG</span></span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium block leading-none">Boîte à Outils 100% Togo</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <OfflineBadge />

            <button
              onClick={onOpenPassModal}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                active
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-95'
              }`}
            >
              <Crown size={14} />
              <span>{active ? 'Pass Actif' : 'Activer Pass'}</span>
            </button>
          </div>
        </div>

        {/* Ligne des onglets */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isSelected = currentTab === t.id;

            return (
              <button
                key={t.id}
                onClick={() => onSelectTab(t.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon size={14} className={isSelected ? 'text-emerald-400' : 'text-slate-400'} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
