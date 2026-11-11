import React, { useState } from 'react';
import { Users, Copy, Check, Share2, Wallet, ArrowRight, ShieldCheck } from 'lucide-react';
import { UserPass } from '../../types';

interface AffiliateHubProps {
  userPass: UserPass;
}

export const AffiliateHub: React.FC<AffiliateHubProps> = ({ userPass }) => {
  const [copied, setCopied] = useState(false);

  const referralUrl = `https://hermestg.vercel.app?ref=${userPass.referralCode}`;
  const shareText = `Salut ! J'utilise HermesTG pour compresser mes documents sous 500 Ko gratuitement et créer des reçus PDF propres au Togo. Découvre la plateforme ici : ${referralUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const withdrawThreshold = 1000;
  const canWithdraw = userPass.affiliateBalance >= withdrawThreshold;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
          <Users size={22} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Programme Ambassadeur Campus</h2>
          <p className="text-xs text-slate-500">Gagnez 500 FCFA par ami parrainé + 250 FCFA chaque mois de renouvellement</p>
        </div>
      </div>

      {/* Carte Portefeuille Virtuel */}
      <div className="bg-gradient-to-br from-slate-900 to-purple-950 text-white rounded-2xl p-5 mb-5 shadow-md">
        <div className="flex items-center justify-between text-xs text-purple-200 mb-2">
          <span className="flex items-center gap-1.5 font-semibold">
            <Wallet size={15} /> Ma Cagnotte d'Affiliation
          </span>
          <span className="bg-purple-800/80 px-2.5 py-0.5 rounded-full font-bold">
            {userPass.referralCount} filleul(s)
          </span>
        </div>

        <div className="text-3xl font-black tracking-tight mb-2 text-white">
          {userPass.affiliateBalance.toLocaleString('fr-FR')} <span className="text-lg font-normal text-purple-300">FCFA</span>
        </div>

        {/* Jauge de retrait */}
        <div className="w-full bg-purple-900/60 rounded-full h-2 mb-2 overflow-hidden">
          <div
            className="bg-emerald-400 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(100, (userPass.affiliateBalance / withdrawThreshold) * 100)}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-purple-300">
          <span>Seuil de retrait : {withdrawThreshold} FCFA</span>
          <span>{canWithdraw ? 'Retrait disponible !' : `Encore ${withdrawThreshold - userPass.affiliateBalance} FCFA`}</span>
        </div>

        <div className="mt-4 pt-3 border-t border-purple-800/50 flex gap-2">
          <button
            disabled={!canWithdraw}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              canWithdraw
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow'
                : 'bg-purple-900/40 text-purple-400 cursor-not-allowed'
            }`}
          >
            Retirer via T-Money / Flooz
          </button>
          <button className="flex-1 py-2 bg-purple-800/50 hover:bg-purple-800 text-purple-100 rounded-lg text-xs font-bold transition-colors">
            Utiliser pour mon Pass
          </button>
        </div>
      </div>

      {/* Lien de parrainage */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 mb-4">
        <label className="block text-xs font-bold text-slate-700 mb-1.5">Votre lien d'invitation unique :</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={referralUrl}
            className="flex-1 bg-white border border-slate-200 px-3 py-2 text-xs rounded-lg text-slate-600 font-mono outline-none"
          />
          <button
            onClick={handleCopy}
            className="p-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-700 transition-colors shrink-0"
            title="Copier"
          >
            {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
          </button>
        </div>

        <button
          onClick={handleShareWhatsApp}
          className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <Share2 size={16} /> Partager sur WhatsApp (Groupes / Statuts)
        </button>
      </div>

      {/* Règles du programme */}
      <div className="space-y-2.5 text-xs text-slate-600">
        <h3 className="font-bold text-slate-800 text-sm">Comment fonctionne la rémunération ?</h3>
        <div className="flex items-start gap-2 bg-purple-50/50 p-2.5 rounded-lg border border-purple-100">
          <ArrowRight size={15} className="text-purple-600 shrink-0 mt-0.5" />
          <span><strong>500 FCFA nets</strong> dès que votre ami souscrit à son premier Pass Mensuel (1 500 FCFA).</span>
        </div>
        <div className="flex items-start gap-2 bg-purple-50/50 p-2.5 rounded-lg border border-purple-100">
          <ArrowRight size={15} className="text-purple-600 shrink-0 mt-0.5" />
          <span><strong>250 FCFA récurrents</strong> chaque mois tant qu'il continue de renouveler son Pass.</span>
        </div>
        <div className="flex items-start gap-2 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
          <ShieldCheck size={15} className="text-emerald-600 shrink-0 mt-0.5" />
          <span><strong>100% Transparent :</strong> Pas de système pyramidal. Vous gagnez uniquement sur les personnes que vous recommandez directement.</span>
        </div>
      </div>
    </div>
  );
};
