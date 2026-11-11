import React, { useState } from 'react';
import { Smartphone, Check, AlertCircle, Copy, Share2 } from 'lucide-react';

interface FeeBracket {
  min: number;
  max: number;
  fee: number;
}

// Grille indicative des frais de retrait T-Money / Flooz au Togo
const WITHDRAWAL_FEES: FeeBracket[] = [
  { min: 100, max: 1000, fee: 50 },
  { min: 1001, max: 2500, fee: 125 },
  { min: 2501, max: 5000, fee: 200 },
  { min: 5001, max: 10000, fee: 350 },
  { min: 10001, max: 15000, fee: 500 },
  { min: 15001, max: 20000, fee: 650 },
  { min: 20001, max: 30000, fee: 850 },
  { min: 30001, max: 50000, fee: 1200 },
  { min: 50001, max: 100000, fee: 1800 },
  { min: 100001, max: 200000, fee: 2800 },
  { min: 200001, max: 500000, fee: 4500 },
];

function calculateWithdrawalFee(amount: number): number {
  if (amount < 100) return 0;
  const bracket = WITHDRAWAL_FEES.find(b => amount >= b.min && amount <= b.max);
  if (bracket) return bracket.fee;
  return Math.round(amount * 0.012); // ~1.2% au-delà
}

function calculateSendWithWithdrawal(targetNet: number): { totalToSend: number; fee: number } {
  // Trouver le montant brut tel que brut - frais(brut) >= targetNet
  let guess = targetNet + calculateWithdrawalFee(targetNet);
  let fee = calculateWithdrawalFee(guess);
  
  if (guess - fee < targetNet) {
    guess = targetNet + fee + 50;
    fee = calculateWithdrawalFee(guess);
  }

  return { totalToSend: guess, fee };
}

export const FeeSimulator: React.FC = () => {
  const [targetAmount, setTargetAmount] = useState<number>(10000);
  const [operator, setOperator] = useState<'tmoney' | 'flooz'>('tmoney');
  const [recipientNumber, setRecipientNumber] = useState('');
  const [copied, setCopied] = useState(false);

  const { totalToSend, fee } = calculateSendWithWithdrawal(targetAmount);

  // Syntaxe USSD Togo
  const ussdSyntax = operator === 'tmoney'
    ? `*145*2*${recipientNumber || 'NUMERO'}*${totalToSend}#`
    : `*155*1*1*${recipientNumber || 'NUMERO'}*${totalToSend}#`;

  const copyUssd = () => {
    navigator.clipboard.writeText(ussdSyntax);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = `Je viens de t'envoyer ${totalToSend.toLocaleString('fr-FR')} FCFA par ${operator === 'tmoney' ? 'T-Money' : 'Flooz'}. Les frais de retrait au kiosque (${fee.toLocaleString('fr-FR')} F) sont déjà inclus, tu retireras exactement ${targetAmount.toLocaleString('fr-FR')} FCFA nets.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Simulateur Frais de Retrait Togo</h2>
          <p className="text-xs text-slate-500 mt-0.5">Calcule le montant exact à envoyer pour que votre correspondant retire sa somme nette au kiosque.</p>
        </div>
        <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setOperator('tmoney')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              operator === 'tmoney' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            T-Money
          </button>
          <button
            onClick={() => setOperator('flooz')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              operator === 'flooz' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Flooz
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Somme nette que le destinataire doit retirer (FCFA)
          </label>
          <div className="relative">
            <input
              type="number"
              step="500"
              min="500"
              value={targetAmount || ''}
              onChange={(e) => setTargetAmount(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3.5 py-2.5 text-sm font-semibold tabular-nums border border-slate-300 rounded-xl focus:border-slate-900 focus:outline-none transition-colors"
              placeholder="Ex: 10000"
            />
            <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-slate-400">FCFA</span>
          </div>
          <div className="flex gap-1.5 mt-2">
            {[2000, 5000, 10000, 25000, 50000].map((quick) => (
              <button
                key={quick}
                onClick={() => setTargetAmount(quick)}
                className={`text-[11px] px-2 py-1 rounded-md border transition-all ${
                  targetAmount === quick
                    ? 'border-slate-900 bg-slate-900 text-white font-semibold'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {quick.toLocaleString('fr-FR')}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Numéro du destinataire (facultatif)
          </label>
          <div className="relative">
            <input
              type="tel"
              value={recipientNumber}
              onChange={(e) => setRecipientNumber(e.target.value.replace(/[^0-9+]/g, ''))}
              className="w-full px-3.5 py-2.5 text-sm font-semibold tabular-nums border border-slate-300 rounded-xl focus:border-slate-900 focus:outline-none transition-colors"
              placeholder="90 XX XX XX ou 99 XX XX XX"
            />
            <span className="absolute right-3 top-2.5 text-slate-400">
              <Smartphone size={16} />
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Pré-remplit le code de transfert direct sur votre téléphone.</p>
        </div>
      </div>

      {/* Résultat du calcul */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 mb-5 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-slate-800">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Montant Net Voulu</span>
            <span className="text-lg font-bold tabular-nums text-white">{targetAmount.toLocaleString('fr-FR')} FCFA</span>
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Frais Kiosque Prévus</span>
            <span className="text-lg font-bold tabular-nums text-amber-400">+{fee.toLocaleString('fr-FR')} FCFA</span>
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold block">Montant Exact à Envoyer</span>
            <span className="text-xl font-black tabular-nums text-emerald-400">{totalToSend.toLocaleString('fr-FR')} FCFA</span>
          </div>
        </div>

        {/* Code USSD */}
        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Code USSD direct ({operator.toUpperCase()}) :</span>
            <span className="font-mono text-xs text-amber-300 font-semibold tracking-wide truncate block">
              {ussdSyntax}
            </span>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={copyUssd}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? 'Copié' : 'Copier'}</span>
            </button>
            <button
              onClick={shareWhatsApp}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Share2 size={14} />
              <span>Aviser sur WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2.5 p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs text-slate-600">
        <AlertCircle size={15} className="text-slate-400 shrink-0 mt-0.5" />
        <p>Les grilles de retrait peuvent subir de légères révisions selon les décrets et arrêtés de l'ARCEP Togo. Le calcul intègre une marge de sécurité pour garantir la remise du montant net.</p>
      </div>
    </div>
  );
};
