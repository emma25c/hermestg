import React, { useState } from 'react';
import { BookOpen, Lock, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
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
      title: 'Dépôt Concours & Bourses sous 500 Ko',
      category: 'concours',
      badge: 'Gratuit',
      readTime: '3 min',
      summary: 'Comment scanner, recadrer et garantir vos pièces jointes sous 500 Ko sur smartphone sans aller au cybercafé.',
      content: [
        '1. Prenez une photo à la lumière naturelle (près d’une fenêtre), évitez les reflets d’ampoules.',
        '2. Utilisez l’onglet "Outils" de notre plateforme et activez le mode "Scan Administratif".',
        '3. Le moteur local réduit le fichier à 470 Ko en A4 standard.',
        '4. Téléchargez le PDF généré et téléversez-le directement sur le portail du concours.'
      ],
      isPremium: false
    },
    {
      id: 'tip-2',
      title: 'Diviser par 3 sa consommation de Data Togocom / Moov',
      category: 'data',
      badge: 'Gratuit',
      readTime: '4 min',
      summary: 'Les réglages cachés Android et WhatsApp pour économiser 60 % de son forfait journalier de 100 F ou 200 F.',
      content: [
        '1. Dans WhatsApp > Utilisation données et stockage > Désactivez le téléchargement automatique des vidéos en données mobiles.',
        '2. Dans Paramètres Android > Réseau > Économiseur de données : activez-le pour bloquer l’arrière-plan.',
        '3. Sur TikTok Lite > Paramètres > Économiseur de données : cochez la case basse résolution.',
        '4. Privilégiez notre PWA qui est mise en cache locale et consomme 0 Ko une fois ouverte.'
      ],
      isPremium: false
    },
    {
      id: 'tip-3',
      title: 'Payer en ligne sans compte bancaire au Togo',
      category: 'finance',
      badge: 'Gratuit',
      readTime: '3 min',
      summary: 'Comment acquérir et recharger une carte Visa prépayée (UBA Africard) avec T-Money/Flooz sans tracasserie.',
      content: [
        '1. Rendez-vous dans une agence UBA avec une simple photocopie de CNI et 5 000 FCFA.',
        '2. Vous recevez immédiatement une carte Visa prépayée internationale sans ouverture de compte bancaire.',
        '3. Vous pouvez la recharger via Flooz ou des points de recharge agréés.',
        '4. Idéal pour payer des cours en ligne, des outils ou des abonnements sans carte de crédit classique.'
      ],
      isPremium: false
    },
    {
      id: 'tip-4',
      title: 'Détecter les fausses plateformes d’investissement en 30s',
      category: 'securite',
      badge: 'Pass Exclusif',
      readTime: '5 min',
      summary: 'La checklist imparable pour repérer les arnaques pyramidales (Ponzi) qui ciblent les jeunes à Lomé.',
      content: [
        '1. Règle d’or : Si on vous promet plus de 5% de gain par jour ou par semaine garanti, c’est 100% une arnaque.',
        '2. Vérifiez si l’entreprise a un Registre de Commerce (RCCM) vérifiable au CFE Togo.',
        '3. Exigez de savoir d’où provient la valeur créée, et pas simplement le recrutement de nouveaux membres.',
        '4. Ne versez jamais de l’argent sur un numéro T-Money personnel sans reçu ou contrat clair.'
      ],
      isPremium: true
    },
    {
      id: 'tip-5',
      title: 'Candidature spontanée WhatsApp à Lomé qui obtient une réponse',
      category: 'concours',
      badge: 'Pass Exclusif',
      readTime: '4 min',
      summary: 'La structure exacte d’un message WhatsApp professionnel pour contacter un recruteur ou chef d’entreprise local.',
      content: [
        '1. Salutation polie avec le nom exact de la personne ou de la société.',
        '2. Proposition de valeur immédiate : ce que vous pouvez faire concrètement pour résoudre un problème de son entreprise.',
        '3. Pièce jointe d’un CV d’une seule page, parfaitement cadré et pesant moins de 500 Ko.',
        '4. Appel à l’action simple : proposer un court appel téléphonique de 5 minutes.'
      ],
      isPremium: true
    }
  ];

  const courses: CourseItem[] = [
    {
      id: 'course-1',
      title: 'Maîtriser les Outils IA sur Smartphone',
      category: 'Intelligence Artificielle',
      duration: '15 min de lecture + fiches',
      description: 'Apprenez à formuler des requêtes puissantes pour rédiger des courriers impeccables, préparer des devoirs et automatiser des mini-tâches rentables.',
      modules: ['Comprendre les prompts mobiles', 'Générer des lettres de motivation togolaises', 'Résumer des documents PDF d’études'],
      isPremium: false
    },
    {
      id: 'course-2',
      title: 'Vente WhatsApp Pro à Lomé',
      category: 'Business & Freelance',
      duration: '20 min + modèles prêts',
      description: 'Structurez votre statut WhatsApp, apprenez à relancer des clients sans être lourd, et émettez des reçus propres pour instaurer une confiance totale.',
      modules: ['Le secret des statuts WhatsApp qui convertissent', 'Création de catalogue express', 'Sécurisation des paiements T-Money'],
      isPremium: true
    },
    {
      id: 'course-3',
      title: 'Lancer un Micro-Service Freelance avec 0 FCFA',
      category: 'Entrepreneuriat Étudiant',
      duration: '15 min d’action',
      description: 'Comment proposer des services de mise en page de CV, compression de dossiers et relecture depuis sa chambre d’étudiant.',
      modules: ['Identifier les 3 services les plus demandés', 'Fixer ses tarifs en FCFA sans brader', 'Trouver ses 10 premiers clients dans sa fac'],
      isPremium: true
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <BookOpen size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Centre d'Apprentissage & Astuces</h2>
            <p className="text-xs text-slate-500">Contenus concrets, mis à jour chaque semaine pour le Togo</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('astuces')}
          className={`flex-1 py-2 rounded-lg transition-all ${
            activeTab === 'astuces' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          💡 Astuces Vérifiées ({tips.length})
        </button>
        <button
          onClick={() => setActiveTab('formations')}
          className={`flex-1 py-2 rounded-lg transition-all ${
            activeTab === 'formations' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          🎓 Formations 15 min ({courses.length})
        </button>
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
                  isLocked ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200 hover:border-slate-300'
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
                  className="p-3.5 flex items-start justify-between cursor-pointer"
                >
                  <div className="flex-1 pr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        tip.isPremium ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {tip.badge}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">⏱️ {tip.readTime}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 leading-snug">{tip.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{tip.summary}</p>
                  </div>

                  <div className="shrink-0 pt-1 text-slate-400">
                    {isLocked ? (
                      <Lock size={18} className="text-amber-500" />
                    ) : isExpanded ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </div>
                </div>

                {isExpanded && !isLocked && (
                  <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-100 bg-emerald-50/20 text-xs text-slate-700 space-y-2">
                    {tip.content.map((point, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle size={14} className="text-emerald-600 shrink-0 mt-0.5" />
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
        <div className="space-y-3">
          {courses.map((course) => {
            const isLocked = course.isPremium && !isPassActive;

            return (
              <div
                key={course.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                      {course.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{course.title}</h3>
                  </div>
                  {isLocked ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                      <Lock size={12} /> Pass Requis
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Accès Libre
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 mb-3">{course.description}</p>

                <div className="bg-slate-50 p-2.5 rounded-lg mb-3">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">Modules inclus :</span>
                  <ul className="text-xs text-slate-700 space-y-1">
                    {course.modules.map((m, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>

                {isLocked ? (
                  <button
                    onClick={onOpenPassModal}
                    className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Lock size={14} /> Débloquer avec le Pass (1 000 FCFA)
                  </button>
                ) : (
                  <button className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 transition-colors">
                    <BookOpen size={14} /> Commencer la Formation
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
