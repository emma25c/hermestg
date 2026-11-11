import React, { useState } from 'react';
import { X, Zap, MessageCircle } from 'lucide-react';
import { UserPass } from '../types';
import { saveUserPass } from '../lib/storage';

interface PassModalProps {
  isOpen: boolean;
  onClose: () => void;
  userPass: UserPass;
  onPassUpdated: (updated: UserPass) => void;
}

export const PassModal: React.FC<PassModalProps> = ({
  isOpen,
  onClose,
  userPass,
  onPassUpdated
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'pass_7d' | 'pass_30d' | 'pass_90d'>('pass_30d');
  const [activationCode, setActivationCode] = useState('');
  const [activationError, setActivationError] = useState('');

  if (!isOpen) return null;

  const founderWhatsApp = '+22890000000'; // À remplacer par le numéro réel du fondateur
  const tmoneyNumber = '90 00 00 00';
  const floozNumber = '99 00 00 00';

  const plans = [
    {
      id: 'pass_7d' as const,
      name: 'Pass Découverte',
      duration: '7 Jours',
      price: 500,
      description: 'Idéal pour déposer un concours urgent cette semaine'
    },
    {
      id: 'pass_30d' as const,
      name: 'Pass Mensuel (Recommandé)',
      duration: '30 Jours',
      price: 1500,
      badge: 'Le + Populaire',
      description: 'Accès illimité aux formations IA, compresseur multi-pages & -50% sur les CV'
    },
    {
      id: 'pass_90d' as const,
      name: 'Pass Trimestriel',
      duration: '90 Jours',
      price: 3500,
      description: 'Économisez 1 000 FCFA pour toute la période des concours'
    }
  ];

  const currentPlan = plans.find(p => p.id === selectedPlan)!;

  const handleWhatsAppPayment = () => {
    const text = `Bonjour ! Je viens d'effectuer un transfert pour le *${currentPlan.name}* (${currentPlan.price} FCFA) sur HermesTG. Voici ma capture d'écran pour valider mon accès (Mon code parrain : ${userPass.referralCode}).`;
    const url = `https://wa.me/${founderWhatsApp}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleApplyCode = () => {
    // Démo de code d'activation (ex: TOGO2026 ou PASSVIP)
    const normalized = activationCode.trim().toUpperCase();
    if (normalized === 'TOGO2026' || normalized === 'PASSVIP') {
      const days = selectedPlan === 'pass_7d' ? 7 : selectedPlan === 'pass_30d' ? 30 : 90;
      const exp = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
      const updated: UserPass = {
        ...userPass,
        status: selectedPlan,
        expiresAt: exp
      };
      saveUserPass(updated);
      onPassUpdated(updated);
      onClose();
    } else {
      setActivationError('Code invalide. Envoyez votre capture de transfert sur WhatsApp pour recevoir votre code.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full w-fit mb-3">
          <Zap size={14} className="fill-amber-600" />
          <span>Activation Instantanée par Mobile Money</span>
        </div>

        <h2 className="text-xl font-black text-slate-900 tracking-tight">Débloquer le Pass Réussite Togo</h2>
        <p className="text-xs text-slate-500 mb-5">Sans carte bancaire • Payez par T-Money ou Flooz</p>

        {/* Choix de la formule */}
        <div className="space-y-2.5 mb-5">
          {plans.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedPlan(p.id)}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                selectedPlan === p.id
                  ? 'border-emerald-600 bg-emerald-50/30'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{p.name}</span>
                  {p.badge && (
                    <span className="text-[10px] font-black bg-orange-500 text-white px-2 py-0.5 rounded-full">
                      {p.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-base font-black text-emerald-800">{p.price.toLocaleString('fr-FR')} F</span>
                <span className="text-[10px] text-slate-400 block font-semibold">{p.duration}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions de transfert local */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-5 text-xs text-slate-700 space-y-2">
          <span className="font-bold text-slate-900 block mb-1">Comment régler au Togo :</span>
          <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-100">
            <span className="font-semibold text-slate-700">T-Money (Togocom) :</span>
            <span className="font-black font-mono text-emerald-700">{tmoneyNumber}</span>
          </div>
          <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-100">
            <span className="font-semibold text-slate-700">Flooz (Moov Africa) :</span>
            <span className="font-black font-mono text-blue-700">{floozNumber}</span>
          </div>
        </div>

        {/* Bouton de confirmation WhatsApp */}
        <button
          onClick={handleWhatsAppPayment}
          className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] mb-4"
        >
          <MessageCircle size={18} /> Valider mon paiement sur WhatsApp (+228)
        </button>

        {/* Champ code d'activation immédiat */}
        <div className="pt-4 border-t border-slate-100">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
            Vous avez déjà reçu votre code de déblocage ?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ex: TOGO2026"
              value={activationCode}
              onChange={(e) => setActivationCode(e.target.value)}
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 font-mono uppercase"
            />
            <button
              onClick={handleApplyCode}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Activer
            </button>
          </div>
          {activationError && (
            <p className="text-[11px] text-red-600 mt-1.5">{activationError}</p>
          )}
        </div>
      </div>
    </div>
  );
};
