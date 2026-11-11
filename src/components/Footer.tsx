import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 py-8 border-t border-slate-200/80 bg-white text-center text-xs text-slate-500">
      <div className="max-w-4xl mx-auto px-4 space-y-2">
        <p className="font-semibold text-slate-700">
          HermesTG • Conçu pour les élèves, étudiants et micro-entrepreneurs du Togo 🇹🇬
        </p>
        <p className="text-[11px] text-slate-400">
          Fonctionne en mode PWA locale sans consommer votre forfait internet • Données 100% privées
        </p>
        <div className="pt-2 text-[10px] text-slate-400">
          Lomé, Togo • Support WhatsApp : +228 90 00 00 00
        </div>
      </div>
    </footer>
  );
};
