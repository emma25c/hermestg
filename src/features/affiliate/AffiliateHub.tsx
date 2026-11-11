import React, { useState } from 'react';
import { Copy, Check, Share2, Wallet, ArrowRight, ShieldCheck, Calculator } from 'lucide-react';
import { UserPass } from '../../types';

interface AffiliateHubProps {
  userPass: UserPass;
}

export const AffiliateHub: React.FC<AffiliateHubProps> = ({ userPass }) => {
  const [copied, setCopied] = useState(false);
  const [simulatedFriends, setSimulatedFriends] = useState(5);

  const referralUrl = `https://hermestg.vercel.app?ref=${userPass.referralCode}`;
  const shareText = `Je te recommande la plateforme HermesTG pour tes démarches au Togo (compresseur de concours garanti < 500 Ko, reçus de vente WhatsApp et simulateur de frais T-Money/Flooz) : ${referralUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const withdrawThreshold = 1000;
  const canWithdraw = userPass.affiliateBalance >= withdrawThreshold;

  // Calcul du simulateur
  const simFirstMonth = simulatedFriends * 500;
  const simRecurring = simulatedFriends * 250;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Programme Ambassadeur Campus</h2>
          <p className="text-xs text-slate-500 mt-0.5">Rémunération directe sur les recommandations d'abonnements au sein de votre réseau.</p>
        </div>
      </div>

      {/* Carte Portefeuille Virtuel épurée */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 mb-5 shadow-xs">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Wallet size={14} className="text-emerald-400" /> Solde Disponible
          </span>
          <span className="font-mono bg-slate-800 px-2.5 py-0.5 rounded text-[11px] text-slate-300">
            {userPass.referralCount} filleul(s) actif(s)
          </span>
        </div>

        <div className="text-3xl font-black tabular-nums tracking-tight mb-3 text-white">
          {userPass.affiliateBalance.toLocaleString('fr-FR')} <span className="text-sm font-normal text-slate-400">FCFA</span>
        </div>

        {/* Jauge de retrait */}
        <div className="w-full bg-slate-800 rounded-full h-1.5 mb-2 overflow-hidden">
          <div
            className="bg-emerald-500 h-1.5 rounded-full transition-all"
            style={{ width: `${Math.min(100, (userPass.affiliateBalance / withdrawThreshold) * 100)}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-4">
          <span>Seuil de virement T-Money / Flooz : 1 000 FCFA</span>
          <span className={canWithdraw ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
            {canWithdraw ? 'Seuil atteint' : `Solde requis : encore ${(withdrawThreshold - userPass.affiliateBalance).toLocaleString('fr-FR')} FCFA`}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-slate-800">
          <button
            disabled={!canWithdraw}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              canWithdraw
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            Demander le versement sur T-Money / Flooz
          </button>
          <button className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors">
            Déduire sur mon propre Pass
          </button>
        </div>
      </div>

      {/* Simulateur de gains */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 mb-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Calculator size={15} className="text-slate-500" /> Simulation de revenus d'ambassadeur
          </span>
          <span className="text-xs font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
            {simulatedFriends} filleuls
          </span>
        </div>

        <input
          type="range"
          min="1"
          max="30"
          value={simulatedFriends}
          onChange={(e) => setSimulatedFriends(parseInt(e.target.value) || 1)}
          className="w-full accent-slate-900 cursor-pointer mb-3"
        />

        <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded-lg border border-slate-200/80 tabular-nums">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Gain 1er Mois</span>
            <span className="text-base font-bold text-emerald-800">{simFirstMonth.toLocaleString('fr-FR')} FCFA</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">500 F par filleul souscrit</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Rente Mensuelle</span>
            <span className="text-base font-bold text-slate-900">{simRecurring.toLocaleString('fr-FR')} FCFA/mois</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">250 F à chaque renouvellement</span>
          </div>
        </div>
      </div>

      {/* Lien de parrainage */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 mb-5">
        <label className="block text-xs font-semibold text-slate-800 mb-1.5">Votre lien d'invitation personnalisé :</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={referralUrl}
            className="flex-1 bg-white border border-slate-300 px-3 py-2 text-xs rounded-lg text-slate-700 font-mono outline-none"
          />
          <button
            onClick={handleCopy}
            className="p-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-700 transition-colors shrink-0"
            title="Copier le lien"
          >
            {copied ? <Check size={16} className="text-emerald-700" /> : <Copy size={16} />}
          </button>
        </div>

        <button
          onClick={handleShareWhatsApp}
          className="mt-3 w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2.5 px-3 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
        >
          <Share2 size={15} /> Partager dans vos groupes d'études WhatsApp
        </button>
      </div>

      {/* Règles strictes de transparence */}
      <div className="space-y-2 text-xs text-slate-600">
        <h3 className="font-bold text-slate-900 text-xs">Principes d'attribution des commissions :</h3>
        <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <ArrowRight size={14} className="text-slate-400 shrink-0 mt-0.5" />
          <span><strong>500 FCFA nets</strong> crédités immédiatement dès que votre contact souscrit un Pass Mensuel de 1 500 FCFA.</span>
        </div>
        <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <ArrowRight size={14} className="text-slate-400 shrink-0 mt-0.5" />
          <span><strong>250 FCFA récurrents</strong> perçus chaque mois sans limite de temps tant que l'abonné conserve son Pass.</span>
        </div>
        <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <ShieldCheck size={14} className="text-emerald-700 shrink-0 mt-0.5" />
          <span><strong>Rémunération directe à 1 niveau :</strong> Aucun système pyramidal ni commission sur des tiers non recommandés par vos soins.</span>
        </div>
      </div>
    </div>
  );
};
