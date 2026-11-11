import React, { useState } from 'react';
import { BookOpen, Lock, CheckCircle, ChevronDown, ChevronUp, Clock, Compass } from 'lucide-react';
import { TipItem, CourseItem } from '../../types';

interface LearningHubProps {
  isPassActive: boolean;
  onOpenPassModal: () => void;
}

export const LearningHub: React.FC<LearningHubProps> = ({ isPassActive, onOpenPassModal }) => {
  const [activeTab, setActiveTab] = useState<'astuces' | 'formations'>('astuces');
  const [expandedTip, setExpandedTip] = useState<string | null>('tip-1');

  const tips: TipItem[] = [
    {
      id: 'tip-1',
      title: 'Passer les pièces de concours et bourses sous 500 Ko',
      category: 'concours',
      badge: 'Accès Libre',
      readTime: '3 min',
      summary: 'Comment photographier, cadrer et convertir vos pièces d’état civil sous la limite stricte de 500 Ko des portails togolais.',
      content: [
        'Placez le document à plat sur une table près d’une source de lumière naturelle. Évitez les flashs et l’ombre directe de votre corps.',
        'Ouvrez notre compresseur local et activez le mode "Scan Administratif". Le filtre blanchit automatiquement le papier et renforce le noir des signatures.',
        'L’algorithme calibre la page à 1240 × 1754 px (norme A4 standard 150 DPI) et garantit un fichier sous 470 Ko.',
        'Téléversez le PDF généré directement sur le portail du concours sans risquer de rejet technique.'
      ],
      isPremium: false
    },
    {
      id: 'tip-2',
      title: 'Diviser par 3 la consommation des forfaits Togocom & Moov',
      category: 'data',
      badge: 'Accès Libre',
      readTime: '4 min',
      summary: 'Les configurations dissimulées sous Android et WhatsApp pour préserver vos forfaits journaliers de 100 F ou 200 F.',
      content: [
        'WhatsApp : Paramètres > Utilisation données et stockage > Désactivez "Téléchargement automatique des médias" en données mobiles.',
        'Android : Paramètres > Réseau et Internet > Économiseur de données : activez l’option pour bloquer les applications en arrière-plan.',
        'TikTok Lite : Paramètres > Économiseur de données : basculez le flux vidéo en définition standard.',
        'HermesTG est conçu en PWA : mettez-le en favori sur votre écran d’accueil pour l’utiliser sans consommer le moindre mégaoctet.'
      ],
      isPremium: false
    },
    {
      id: 'tip-3',
      title: 'Payer et encaisser en ligne sans compte bancaire à Lomé',
      category: 'finance',
      badge: 'Accès Libre',
      readTime: '3 min',
      summary: 'Comment obtenir une carte Visa prépayée (UBA Africard) avec une simple pièce d’identité et la recharger via Flooz ou T-Money.',
      content: [
        'Présentez-vous dans une agence UBA (Avenue de la Libération, Hedzranawoé ou Déckon) avec une photocopie de votre CNI togolaise et 5 000 FCFA.',
        'La carte vous est remise sur-le-champ sans obligation d’ouvrir un compte bancaire ni justificatif de salaire.',
        'Rechargez la carte directement auprès des sous-distributeurs ou via les passerelles Mobile Money compatibles.',
        'Utilisez-la en toute sécurité pour vos achats en ligne sans risquer de découvert bancaire.'
      ],
      isPremium: false
    },
    {
      id: 'tip-4',
      title: 'Repérer en 30 secondes les fausses opportunités d’investissement',
      category: 'securite',
      badge: 'Pass Abonnés',
      readTime: '5 min',
      summary: 'La méthode d’audit rapide pour identifier les pyramides de Ponzi et faux groupes Telegram ciblant la jeunesse togolaise.',
      content: [
        'Toute promesse de rendement fixe supérieur à 2 % par mois est mathématiquement le signe d’un schéma d’escroquerie.',
        'Exigez le numéro d’immatriculation RCCM vérifiable auprès du Centre de Formalités des Entreprises (CFE Togo).',
        'Vérifiez la nature réelle de l’activité : si les revenus reposent uniquement sur l’entrée de nouveaux filleuls, abstenez-vous.',
        'Ne réalisez aucun virement vers un numéro T-Money personnel sans contrat ni reçu opposable.'
      ],
      isPremium: true
    },
    {
      id: 'tip-5',
      title: 'Formuler une candidature spontanée WhatsApp reçue à Lomé',
      category: 'concours',
      badge: 'Pass Abonnés',
      readTime: '4 min',
      summary: 'Le modèle de prise de contact direct pour solliciter un stage ou un emploi auprès d’un responsable d’entreprise au Togo.',
      content: [
        'Identifiez le dirigeant ou le responsable des ressources humaines par son nom et son titre exact.',
        'Rédigez un message d’approche de 5 lignes maximum : salutation formelle, qualification concrète et proposition de valeur immédiate.',
        'Joignez votre CV au format PDF sous 500 Ko avec un nommage rigoureux (ex : CV_Prenom_Nom_Poste.pdf).',
        'Sollicitez un échange téléphonique rapide de 5 minutes sur un créneau précis.'
      ],
      isPremium: true
    }
  ];

  const courses: CourseItem[] = [
    {
      id: 'course-1',
      title: 'Maîtriser les Outils d’IA sur Smartphone',
      category: 'Intelligence Artificielle',
      duration: '15 min de lecture pratique',
      description: 'Techniques pour formuler des instructions précises, rédiger des courriers impeccables et synthétiser des documents d’études lourds sans ordinateur.',
      modules: [
        'Principes de base du prompt appliqué aux démarches administratives',
        'Structuration de lettres de motivation et mémoires académiques',
        'Synthèse rapide de cours et création de fiches de révision'
      ],
      isPremium: false
    },
    {
      id: 'course-2',
      title: 'Vente Professionnelle sur WhatsApp à Lomé',
      category: 'Commerce & Freelance',
      duration: '20 min + trames prêtes à l’emploi',
      description: 'Comment transformer ses statuts WhatsApp en vitrine commerciale crédible, instaurer la confiance et formaliser ses ventes par reçu.',
      modules: [
        'Scénarisation des statuts WhatsApp sans surcharger ses contacts',
        'Gestion des relances commerciales avec courtoisie',
        'Émission systématique de reçus pour sécuriser les règlements T-Money'
      ],
      isPremium: true
    },
    {
      id: 'course-3',
      title: 'Lancer une Prestation de Micro-Services à 0 FCFA',
      category: 'Entrepreneuriat Étudiant',
      duration: '15 min d’application',
      description: 'Méthodologie pour proposer des prestations de mise en page, correction de documents et formalisation administrative depuis son téléphone.',
      modules: [
        'Sélection des 3 prestations les plus demandées sur le marché local',
        'Tarification équilibrée en FCFA sans dévaloriser son savoir-faire',
        'Acquisition des 10 premiers clients dans son cercle universitaire'
      ],
      isPremium: true
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Veille &amp; Compétences Locales</h2>
          <p className="text-xs text-slate-500 mt-0.5">Analyses de terrain vérifiées à Lomé et micro-formations d’action rapide.</p>
        </div>

        <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('astuces')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'astuces' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Compass size={14} /> Astuces ({tips.length})
          </button>
          <button
            onClick={() => setActiveTab('formations')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'formations' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <BookOpen size={14} /> Formations ({courses.length})
          </button>
        </div>
      </div>

      {activeTab === 'astuces' ? (
        <div className="space-y-3">
          {tips.map((tip) => {
            const isLocked = tip.isPremium && !isPassActive;
            const isExpanded = expandedTip === tip.id;

            return (
              <div
                key={tip.id}
                className={`rounded-xl border transition-all ${
                  isLocked ? 'bg-slate-50 border-slate-200/80' : 'bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div
                  onClick={() => {
                    if (isLocked) {
                      onOpenPassModal();
                    } else {
                      setExpandedTip(isExpanded ? null : tip.id);
                    }
                  }}
                  className="p-4 flex items-start justify-between cursor-pointer gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        tip.isPremium ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {tip.badge}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <Clock size={12} /> {tip.readTime}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{tip.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{tip.summary}</p>
                  </div>

                  <div className="shrink-0 pt-1 text-slate-400">
                    {isLocked ? (
                      <Lock size={16} className="text-amber-600" />
                    ) : isExpanded ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </div>
                </div>

                {isExpanded && !isLocked && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-700 space-y-2">
                    {tip.content.map((point, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle size={14} className="text-emerald-700 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{point}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => {
            const isLocked = course.isPremium && !isPassActive;

            return (
              <div
                key={course.id}
                className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {course.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{course.title}</h3>
                  </div>
                  {isLocked ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full shrink-0">
                      <Lock size={11} /> Pass Exclusif
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shrink-0">
                      Accès Libre
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 mb-3 leading-relaxed">{course.description}</p>

                <div className="bg-slate-50 p-3 rounded-xl mb-4 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Séquences pratiques :</span>
                  <ul className="text-xs text-slate-700 space-y-1.5">
                    {course.modules.map((m, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0"></span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {isLocked ? (
                  <button
                    onClick={onOpenPassModal}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Lock size={14} /> Débloquer avec le Pass (1 500 FCFA/mois)
                  </button>
                ) : (
                  <button className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs">
                    <BookOpen size={14} /> Consulter la fiche pratique ({course.duration})
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
