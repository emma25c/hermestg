import React, { useState, useEffect } from 'react';
import { BookOpen, Lock, CheckCircle, ChevronDown, ChevronUp, Clock, Compass, Play, X, Video } from 'lucide-react';
import { TipItem, CourseItem } from '../../types';
import { fetchCourses, getYouTubeEmbedUrl, getYouTubeThumbnailUrl, FALLBACK_COURSES } from '../../lib/courses';

interface LearningHubProps {
  isPassActive: boolean;
  onOpenPassModal: () => void;
}

export const LearningHub: React.FC<LearningHubProps> = ({ isPassActive, onOpenPassModal }) => {
  const [activeTab, setActiveTab] = useState<'astuces' | 'formations'>('astuces');
  const [expandedTip, setExpandedTip] = useState<string | null>('tip-1');
  const [courses, setCourses] = useState<CourseItem[]>(FALLBACK_COURSES);
  const [selectedVideoCourse, setSelectedVideoCourse] = useState<CourseItem | null>(null);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

  // Chargement dynamique depuis Supabase (avec fallback hors-ligne automatique)
  useEffect(() => {
    let isMounted = true;
    setIsLoadingCourses(true);
    fetchCourses()
      .then((loaded) => {
        if (isMounted && loaded && loaded.length > 0) {
          setCourses(loaded);
        }
      })
      .catch(() => {
        // En cas d'absence de réseau, FALLBACK_COURSES est déjà affiché
      })
      .finally(() => {
        if (isMounted) setIsLoadingCourses(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

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
        'Djanta Hub est conçu en PWA : mettez-le en favori sur votre écran d’accueil pour l’utiliser sans consommer le moindre mégaoctet.'
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
      title: 'Sécuriser son compte WhatsApp contre les piratages fréquents à Lomé',
      category: 'securite',
      badge: 'Pass Recommandé',
      readTime: '2 min',
      summary: 'Activer le verrouillage par code PIN à 6 chiffres pour stopper net les tentatives d’usurpation d’identité.',
      content: [
        'WhatsApp : Réglages > Compte > Vérification en deux étapes > Activer.',
        'Choisissez un code confidentiel à 6 chiffres impossible à deviner (évitez 000000 ou votre date de naissance).',
        'Renseignez une adresse email de récupération valide pour ne jamais perdre l’accès.',
        'Règle d’or : ne communiquez JAMAIS par SMS ou appel le code à 6 chiffres reçu par SMS, même si l’interlocuteur prétend être un proche.'
      ],
      isPremium: true
    },
    {
      id: 'tip-5',
      title: 'Contacter directement un recruteur ou chef d’entreprise togolais',
      category: 'concours',
      badge: 'Pass Recommandé',
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

  const handleOpenCourse = (course: CourseItem) => {
    if (course.isPremium && !isPassActive) {
      onOpenPassModal();
      return;
    }

    if (course.videoUrl) {
      setSelectedVideoCourse(course);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Veille &amp; Compétences Locales</h2>
          <p className="text-xs text-slate-500 mt-0.5">Analyses de terrain vérifiées à Lomé et micro-formations vidéos d’action rapide.</p>
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
          {isLoadingCourses && (
            <div className="text-center py-2 text-xs text-slate-400 animate-pulse">
              Synchronisation des dernières vidéos de formation...
            </div>
          )}

          {courses.map((course) => {
            const isLocked = course.isPremium && !isPassActive;
            const thumbnailUrl = getYouTubeThumbnailUrl(course.videoUrl);

            return (
              <div
                key={course.id}
                className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
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

                  {/* Aperçu vidéo avec vignette YouTube */}
                  {course.videoUrl && thumbnailUrl && (
                    <div
                      onClick={() => handleOpenCourse(course)}
                      className="relative rounded-xl overflow-hidden aspect-video max-h-48 bg-slate-900 mb-3 cursor-pointer group border border-slate-200"
                    >
                      <img
                        src={thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover opacity-85 group-hover:opacity-95 group-hover:scale-102 transition-all duration-300"
                        loading="lazy"
                      />
                      
                      {/* Badge durée */}
                      <span className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Clock size={11} /> {course.duration}
                      </span>

                      {/* Bouton lecture central ou Cadenas si verrouillé */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/10 transition-colors">
                        {isLocked ? (
                          <div className="bg-amber-500/90 text-white p-3 rounded-full shadow-lg backdrop-blur-xs">
                            <Lock size={22} />
                          </div>
                        ) : (
                          <div className="bg-white/95 text-slate-900 p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                            <Play size={22} className="fill-slate-900 translate-x-0.5" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {course.modules && course.modules.length > 0 && (
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
                  )}
                </div>

                {isLocked ? (
                  <button
                    onClick={onOpenPassModal}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Lock size={14} /> Débloquer la vidéo avec le Pass (1 500 F/mois)
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenCourse(course)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center gap-2 transition-colors shadow-xs"
                  >
                    <Play size={14} className="fill-white" /> Regarder la vidéo ({course.duration})
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* LECTEUR VIDÉO INTÉGRÉ SANS DISTRACTION NI PUB */}
      {selectedVideoCourse && selectedVideoCourse.videoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          {/* Fond sombre */}
          <div
            onClick={() => setSelectedVideoCourse(null)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
          />

          {/* Fenêtre modale du lecteur */}
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-10 border border-slate-200 overflow-hidden flex flex-col">
            {/* Header du lecteur */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 min-w-0 pr-3">
                <Video size={16} className="text-emerald-600 shrink-0" />
                <span className="text-xs font-bold text-slate-900 truncate">
                  {selectedVideoCourse.title}
                </span>
              </div>
              <button
                onClick={() => setSelectedVideoCourse(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors shrink-0"
                aria-label="Fermer la vidéo"
              >
                <X size={18} />
              </button>
            </div>

            {/* Lecteur iframe YouTube Privacy-Enhanced */}
            <div className="relative w-full aspect-video bg-black">
              {getYouTubeEmbedUrl(selectedVideoCourse.videoUrl) ? (
                <iframe
                  src={getYouTubeEmbedUrl(selectedVideoCourse.videoUrl)!}
                  title={selectedVideoCourse.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs p-6 text-center">
                  <p>Lien vidéo non disponible ou format non supporté.</p>
                </div>
              )}
            </div>

            {/* Description sous la vidéo */}
            <div className="p-4 bg-white text-xs text-slate-600 space-y-1.5 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span className="font-semibold text-slate-800">{selectedVideoCourse.category}</span>
                <span>Durée : {selectedVideoCourse.duration}</span>
              </div>
              <p className="leading-relaxed">{selectedVideoCourse.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
