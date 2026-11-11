import React from 'react';
import { FileText, CheckCircle2, MessageCircle, Clock, Sparkles } from 'lucide-react';

interface ServicesHubProps {
  isPassActive: boolean;
}

export const ServicesHub: React.FC<ServicesHubProps> = ({ isPassActive }) => {
  const whatsappNumber = '+22890000000'; // À remplacer par le numéro du fondateur

  const services = [
    {
      id: 'cv-express',
      title: 'Rédaction & Mise en Page CV Canadien / Local',
      normalPrice: 1500,
      passPrice: 750,
      duration: 'Livré sous 2h à 12h',
      features: [
        'Mise en page professionnelle anti-rejet ATS',
        'Formulation percutante des compétences et expériences',
        'Export PDF A4 garanti < 500 Ko prêt pour les dépôts en ligne',
        '1 session de retouche gratuite incluse'
      ]
    },
    {
      id: 'verif-dossier',
      title: 'Audit & Assemblage de Dossier de Concours',
      normalPrice: 2000,
      passPrice: 1000,
      duration: 'Livré sous 24h',
      features: [
        'Vérification de la conformité de chaque pièce (CNI, Acte, Diplômes)',
        'Fusion en un seul PDF ordonné et léger',
        'Contrôle des marges et de la lisibilité des cachets',
        'Conseils personnalisés pour la lettre de motivation'
      ]
    },
    {
      id: 'lettre-motivation',
      title: 'Lettre de Motivation & Demande de Stage Ciblée',
      normalPrice: 1000,
      passPrice: 500,
      duration: 'Livré sous 4h',
      features: [
        'Adaptée aux entreprises et institutions de Lomé',
        'Ton professionnel et convaincant rédigé avec l’aide de l’IA',
        'Version Word modifiable + Version PDF propre'
      ]
    }
  ];

  const handleOrderService = (serviceTitle: string, price: number) => {
    const text = `Bonjour ! Je souhaite commander le service : *${serviceTitle}* (${price} FCFA). ${
      isPassActive ? 'J’ai un Pass HermesTG Actif.' : 'Je n’ai pas de Pass.'
    }`;
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
          <FileText size={22} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Micro-Services Pro & Accompagnement</h2>
          <p className="text-xs text-slate-500">Exécution soignée assistée par IA • -50% pour les détenteurs de Pass</p>
        </div>
      </div>

      <div className="space-y-4">
        {services.map((service) => {
          const finalPrice = isPassActive ? service.passPrice : service.normalPrice;

          return (
            <div
              key={service.id}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-bold text-slate-900">{service.title}</h3>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-emerald-700 block">
                      {finalPrice.toLocaleString('fr-FR')} FCFA
                    </span>
                    {isPassActive ? (
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                        Tarif Abonné (-50%)
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 line-through">
                        {service.normalPrice} FCFA
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mb-3">
                  <Clock size={13} /> {service.duration}
                </div>

                <ul className="text-xs text-slate-600 space-y-1.5 mb-4">
                  {service.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => handleOrderService(service.title, finalPrice)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <MessageCircle size={16} className="text-emerald-400" /> Commander via WhatsApp (+228)
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
        <Sparkles size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Garantie Qualité &amp; Confidentialité :</span> Vos documents personnels (diplômes, CNI) sont détruits immédiatement après livraison du travail pour protéger votre vie privée.
        </div>
      </div>
    </div>
  );
};
