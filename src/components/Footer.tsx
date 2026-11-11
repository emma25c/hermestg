import React from 'react';
import { LionLogo } from './LionLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 py-8 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
      <div className="max-w-4xl mx-auto px-4 space-y-2">
        <div className="flex items-center justify-center gap-2">
          <LionLogo size={24} />
          <span className="font-bold text-slate-800 text-sm">Djanta Hub</span>
        </div>
        <p className="font-medium text-slate-700">
          La plateforme d'outils et de démarches conçue pour la jeunesse battante du Togo 🇹🇬
        </p>
        <p className="text-[11px] text-slate-400">
          Moteur client PWA : vos documents et photos d'identité sont traités en local sur votre appareil sans téléversement serveur.
        </p>
        <div className="pt-2 text-[10px] text-slate-400">
          Lomé, Togo • Support direct WhatsApp : +228 90 12 34 56
        </div>
      </div>
    </footer>
  );
};
