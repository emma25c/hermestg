import React from 'react';
import { CheckCircle2, MessageCircle, Clock, ShieldCheck } from 'lucide-react';

interface ServicesHubProps {
  isPassActive: boolean;
}

export const ServicesHub: React.FC<ServicesHubProps> = ({ isPassActive }) => {
  const whatsappNumber = '+22890123456';

  const services = [
    {
      id: 'cv-pro',
      title: 'Mise en Page de CV & Format Anti-Rejet ATS',
      normalPrice: 1500,
      passPrice: 750,
      duration: 'Livré sous 4h à 12h',
      features: [
        'Mise en conformité aux standards des recrutements à Lomé et ONG',
        'Valorisation ciblée des stages et compétences universitaires',
        'Fichier PDF vectoriel garanti sous 400 Ko pour les formulaires en ligne',
        'Une séance de révision incluse sur simple message WhatsApp'
      ]
    },
    {
      id: 'audit-dossier',
      title: 'Audit & Assemblage de Dossier de Concours',
      normalPrice: 2000,
      passPrice: 1000,
      duration: 'Livré sous 24h ouvrées',
      features: [
        'Vérification de la validité et lisibilité de chaque acte d’état civil',
        'Fusion ordonnée en un seul PDF multipage respectant le plafond strict de 500 Ko',
        'Contrôle de la netteté des cachets officiels et signatures',
        'Recommandations sur les pièces complémentaires requises'
      ]
    },
    {
      id: 'lettre-motivation',
      title: 'Rédaction de Lettre de Motivation & Demande de Stage',
      normalPrice: 1000,
      passPrice: 500,
      duration: 'Livré sous 4h',
      features: [
        'Argumentaire contextualisé pour l’entreprise ou l’administration visée à Lomé',
        'Ton professionnel évitant les formules stéréotypées',
        'Fourniture du fichier Word modifiable et du PDF finalisé'
      ]
    }
  ];

  const handleOrderService = (serviceTitle: string, price: number) => {
    const text = `Bonjour ! Je souhaite commander la prestation : *${serviceTitle}* (${price} FCFA).\n${
      isPassActive ? 'J’ai un Pass HermesTG Actif (-50%).' : 'Je n’ai pas encore de Pass.'
    }\nMerci de m'indiquer la marche à suivre pour l'envoi de mes éléments.`;
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Prestations Administratives &amp; Candidatures</h2>
          <p className="text-xs text-slate-500 mt-0.5">Assistance humaine rapide pour fiabiliser vos dépôts • Réduction de 50 % réservée aux détenteurs de Pass.</p>
        </div>
      </div>

      <div className="space-y-4">
        {services.map((service) => {
          const finalPrice = isPassActive ? service.passPrice : service.normalPrice;

          return (
            <div
              key={service.id}
              className="p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{service.title}</h3>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-black tabular-nums text-slate-900 block">
                      {finalPrice.toLocaleString('fr-FR')} FCFA
                    </span>
                    {isPassActive ? (
                      <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-bold block mt-0.5">
                        Tarif Pass (-50 %)
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 line-through block mt-0.5">
                        {service.normalPrice.toLocaleString('fr-FR')} FCFA
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mb-3">
                  <Clock size={12} /> {service.duration}
                </div>

                <ul className="text-xs text-slate-600 space-y-1.5 mb-4">
                  {service.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-emerald-700 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => handleOrderService(service.title, finalPrice)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <MessageCircle size={15} /> Commander par échange direct WhatsApp
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
        <ShieldCheck size={16} className="text-emerald-700 shrink-0 mt-0.5" />
        <p><strong>Protection de vos documents personnels :</strong> Vos diplômes, attestations et pièces d'identité transmis pour mise en page sont définitivement détruits de nos supports sitôt la livraison validée.</p>
      </div>
    </div>
  );
};
