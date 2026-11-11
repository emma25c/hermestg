import React from 'react';
import { TabType, UserPass } from '../types';
import { OfflineBadge } from './OfflineBadge';
import { Wrench, BookOpen, Briefcase, Users, ShieldCheck } from 'lucide-react';
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
    { id: 'formations' as TabType, label: 'Veille & Conseils', icon: BookOpen },
    { id: 'services' as TabType, label: 'Services CV', icon: Briefcase },
    { id: 'affiliation' as TabType, label: 'Ambassadeur', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-4xl mx-auto px-4 pt-3 pb-2">
        {/* Ligne haute */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm tracking-tight">
              HT
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-slate-900">HermesTG</span>
              <span className="text-[11px] text-slate-400 block -mt-0.5 font-normal">Boîte à outils locale • Togo</span>
            </div>
          </div>

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
              <ShieldCheck size={14} />
              <span>{active ? 'Pass Actif' : 'Activer le Pass'}</span>
            </button>
          </div>
        </div>

        {/* Ligne des onglets */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isSelected = currentTab === t.id;

            return (
              <button
                key={t.id}
                onClick={() => onSelectTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'bg-slate-900 text-white font-semibold'
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
