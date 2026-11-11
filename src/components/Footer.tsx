import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 py-8 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
      <div className="max-w-4xl mx-auto px-4 space-y-1.5">
        <p className="font-medium text-slate-800">
          HermesTG • Conçu pour les élèves, étudiants et micro-entrepreneurs au Togo
        </p>
        <p className="text-[11px] text-slate-400">
          Moteur client PWA : les documents sont traités en local sur votre appareil sans téléversement serveur.
        </p>
        <div className="pt-2 text-[10px] text-slate-400">
          Lomé, Togo • Support direct : +228 90 12 34 56
        </div>
      </div>
    </footer>
  );
};
