import React, { useState } from 'react';
import { X, MessageCircle, Loader2 } from 'lucide-react';
import { UserPass } from '../types';
import { saveUserPass } from '../lib/storage';
import { supabase } from '../lib/supabase';
import { LionLogo } from './LionLogo';

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
  const [isApplyingCode, setIsApplyingCode] = useState(false);

  if (!isOpen) return null;

  const founderWhatsApp = '22872199337';
  const tmoneyNumber = '72 19 93 37';
  const floozNumber = '97 14 69 66';

  const plans = [
    {
      id: 'pass_7d' as const,
      name: 'Pass 7 Jours',
      duration: 'Semaine',
      price: 500,
      description: 'Pour finaliser un dossier de concours ou de stage urgent'
    },
    {
      id: 'pass_30d' as const,
      name: 'Pass Mensuel (30 Jours)',
      duration: 'Mois',
      price: 1500,
      badge: 'Recommandé',
      description: 'Accès intégral : formations, fiches de veille, compresseur & -50% sur les CV'
    },
    {
      id: 'pass_90d' as const,
      name: 'Pass Trimestriel (90 Jours)',
      duration: 'Trimestre',
      price: 3500,
      description: 'Couvre l’intégralité de la session des concours nationaux'
    }
  ];

  const currentPlan = plans.find(p => p.id === selectedPlan)!;

  const handleWhatsAppPayment = () => {
    const text = `Bonjour ! Je viens d'effectuer le transfert pour mon *${currentPlan.name}* (${currentPlan.price} FCFA) sur Djanta Hub.\nMon code parrain : ${userPass.referralCode}.\nVoici ma capture d'écran pour valider mon accès :`;
    const url = `https://wa.me/${founderWhatsApp}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleApplyCode = async () => {
    setActivationError('');
    const normalized = activationCode.trim().toUpperCase();
    if (!normalized) return;

    setIsApplyingCode(true);

    try {
      // 1. D'abord, tenter la validation en direct via Supabase (table activation_codes)
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUserId = sessionData?.session?.user?.id;

      if (currentUserId) {
        const { data, error } = await supabase.rpc('activate_user_pass_with_code', {
          p_code: normalized,
          p_user_id: currentUserId
        });

        if (!error && data?.success) {
          const updated: UserPass = {
            ...userPass,
            status: data.plan_type,
            expiresAt: data.expires_at
          };
          saveUserPass(updated);
          onPassUpdated(updated);
          onClose();
          return;
        } else if (data?.error && !['DJANTA2026', 'TOGO2026', 'PASSVIP'].includes(normalized)) {
          setActivationError(data.error);
          return;
        }
      }
    } catch (e) {
      console.warn('Erreur validation en ligne:', e);
    } finally {
      setIsApplyingCode(false);
    }

    // 2. Codes de secours administratifs (DJANTA2026, TOGO2026, PASSVIP)
    if (['DJANTA2026', 'TOGO2026', 'PASSVIP'].includes(normalized)) {
      const days = selectedPlan === 'pass_7d' ? 7 : selectedPlan === 'pass_30d' ? 30 : 90;
      const exp = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
      const updated: UserPass = {
        ...userPass,
        status: selectedPlan,
        expiresAt: exp
      };
      saveUserPass(updated);
      onPassUpdated(updated);

      // Si connecté, synchroniser immédiatement le profil dans Supabase
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.id) {
          supabase
            .from('profiles')
            .update({
              pass_status: selectedPlan,
              pass_expires_at: exp,
              updated_at: new Date().toISOString()
            })
            .eq('id', session.user.id)
            .then();
        }
      });

      onClose();
    } else {
      setActivationError('Code non reconnu. Envoyez votre capture de transfert sur WhatsApp pour recevoir votre code.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 shadow-xl relative border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="mb-5 flex items-start gap-3">
          <LionLogo size={36} />
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Souscription Mobile Money
            </span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Activer un Pass Djanta Hub</h2>
            <p className="text-xs text-slate-500 mt-0.5">Règlement direct par transfert T-Money ou Flooz sans carte bancaire.</p>
          </div>
        </div>

        {/* Choix des formules */}
        <div className="space-y-2 mb-5">
          {plans.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedPlan(p.id)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                selectedPlan === p.id
                  ? 'border-slate-900 bg-slate-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{p.name}</span>
                  {p.badge && (
                    <span className="text-[10px] font-bold bg-slate-900 text-white px-2 py-0.2 rounded">
                      {p.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{p.description}</p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-sm font-black tabular-nums text-slate-900">{p.price.toLocaleString('fr-FR')} F</span>
                <span className="text-[10px] text-slate-400 block font-medium">/ {p.duration}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Coordonnées de transfert local */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 mb-5 text-xs text-slate-700 space-y-2">
          <span className="font-bold text-slate-900 block text-[11px]">Numéros récepteurs officiels :</span>
          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200">
            <span className="font-medium text-slate-600">T-Money (Togocom)</span>
            <span className="font-mono font-bold text-emerald-800">{tmoneyNumber}</span>
          </div>
          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200">
            <span className="font-medium text-slate-600">Flooz (Moov Africa)</span>
            <span className="font-mono font-bold text-blue-800">{floozNumber}</span>
          </div>
        </div>

        <button
          onClick={handleWhatsAppPayment}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-xs mb-4"
        >
          <MessageCircle size={15} /> Valider le transfert par capture d'écran
        </button>

        {/* Champ code d'activation immédiat */}
        <div className="pt-3.5 border-t border-slate-100">
          <label className="block text-[11px] font-medium text-slate-600 mb-1.5">
            Saisir un code de déblocage reçu :
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ex: DJANTA2026"
              value={activationCode}
              onChange={(e) => setActivationCode(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:border-slate-900 font-mono uppercase"
            />
            <button
              onClick={handleApplyCode}
              disabled={isApplyingCode || !activationCode.trim()}
              className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              {isApplyingCode ? <Loader2 size={13} className="animate-spin text-amber-400" /> : null}
              <span>{isApplyingCode ? 'Vérification...' : 'Appliquer'}</span>
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
