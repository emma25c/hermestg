import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles, BookOpen, Download, Copy, Check, Printer, Key,
  RefreshCw, Sliders, CheckCircle2, AlertCircle, Trash2, History,
  FileCheck, Shield, Eye, GraduationCap, Lock, Unlock,
  ExternalLink, ChevronDown, ChevronUp, Search, Plus
} from 'lucide-react';
import {
  ApcExam,
  ApcGenerationParams,
  ApcLessonRef
} from '../../types/apc';
import { UserPass } from '../../types';
import { isPassActive } from '../../lib/storage';
import {
  CLASSES_META,
  DISCIPLINES_META,
  AVAILABLE_MODELS,
  DEFAULT_GEMINI_MODEL,
  FREE_EXAMS_QUOTA,
  getFreeExamsUsedCount,
  loadCurriculumCatalog,
  getDefaultExamMeta,
  getStoredGeminiApiKey,
  saveStoredGeminiApiKey,
  getStoredGeminiModel,
  saveStoredGeminiModel,
  getSavedApcExams,
  deleteApcExamFromHistory,
  testGeminiApiKey,
  generateApcExamWithGemini,
  getOfflineSampleExam,
  manageAiKeysInPool
} from '../../lib/geminiApc';
import { generateApcExamPdf } from './ApcExamPdf';

interface ApcExamGeneratorProps {
  userPass?: UserPass;
  onOpenPassModal?: () => void;
}

export const ApcExamGenerator: React.FC<ApcExamGeneratorProps> = ({
  userPass,
  onOpenPassModal
}) => {
  // --- États principaux ---
  const [selectedClasse, setSelectedClasse] = useState<string>('3e');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('maths');
  const [typeEpreuve, setTypeEpreuve] = useState<'complet' | 'situation_integration' | 'ressources'>('complet');
  
  // Paramètres du cartouche
  const [etablissement, setEtablissement] = useState<string>('Lycée Moderne de Tokoin');
  const [anneeScolaire, setAnneeScolaire] = useState<string>('2025 - 2026');
  const [session, setSession] = useState<string>('Évaluation Sommative du 1er Trimestre');
  const [duree, setDuree] = useState<string>('2h 00min');
  const [coefficient, setCoefficient] = useState<number>(3);
  const [instructionsSpeciales, setInstructionsSpeciales] = useState<string>('');

  // Curriculum & Leçons
  const [catalog, setCatalog] = useState<Record<string, Record<string, ApcLessonRef[]>>>({});
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  const [lessonSearch, setLessonSearch] = useState<string>('');
  const [isLoadingCatalog, setIsLoadingCatalog] = useState<boolean>(true);

  // Clé Gemini & Modèle
  const [apiKey, setApiKey] = useState<string>('');
  const [model, setModel] = useState<string>(DEFAULT_GEMINI_MODEL);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const [testKeyStatus, setTestKeyStatus] = useState<{ testing: boolean; message: string; success?: boolean } | null>(null);

  // Monétisation & Quota
  const [freeExamsCount, setFreeExamsCount] = useState<number>(0);
  const [isMonetizationModalOpen, setIsMonetizationModalOpen] = useState<boolean>(false);

  // Espace Fondateur / Gestion du Pool de Clés Supabase
  const [isFounderModalOpen, setIsFounderModalOpen] = useState<boolean>(false);
  const [founderPinInput, setFounderPinInput] = useState<string>('');
  const [isFounderUnlocked, setIsFounderUnlocked] = useState<boolean>(false);
  const [poolKeys, setPoolKeys] = useState<any[]>([]);
  const [isLoadingPool, setIsLoadingPool] = useState<boolean>(false);
  const [newKeyInput, setNewKeyInput] = useState<string>('');
  const [newKeyLabel, setNewKeyLabel] = useState<string>('');
  const [founderMessage, setFounderMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // Génération
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentExam, setCurrentExam] = useState<ApcExam | null>(null);

  // Visualisation & Onglets
  const [viewTab, setViewTab] = useState<'epreuve' | 'corrige'>('epreuve');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [savedExams, setSavedExams] = useState<ApcExam[]>([]);
  const [showConfigDetails, setShowConfigDetails] = useState<boolean>(true);

  const passActive = userPass ? isPassActive(userPass) : false;

  // Charger la clé et le modèle stockés au montage
  useEffect(() => {
    const storedKey = getStoredGeminiApiKey();
    if (storedKey) setApiKey(storedKey);
    const storedModel = getStoredGeminiModel();
    if (storedModel) setModel(storedModel);

    setSavedExams(getSavedApcExams());
    setFreeExamsCount(getFreeExamsUsedCount());

    // Charger le catalogue officiel togolais
    loadCurriculumCatalog()
      .then(cat => {
        setCatalog(cat);
        setIsLoadingCatalog(false);
      })
      .catch(() => {
        setIsLoadingCatalog(false);
      });

    // Mettre un exemple type par défaut au premier affichage si pas d'épreuve
    const demo = getOfflineSampleExam('3e', 'maths');
    setCurrentExam(demo);
  }, []);

  // Mettre à jour les métadonnées officielles lors du changement de classe ou discipline
  useEffect(() => {
    const defaults = getDefaultExamMeta(selectedClasse, selectedDiscipline);
    setDuree(defaults.duree);
    setCoefficient(defaults.coefficient);
    setSelectedLessons([]);
  }, [selectedClasse, selectedDiscipline]);

  // Liste des leçons disponibles pour la classe et la discipline sélectionnées
  const availableLessons = useMemo(() => {
    if (!catalog[selectedClasse] || !catalog[selectedClasse][selectedDiscipline]) {
      return [];
    }
    return catalog[selectedClasse][selectedDiscipline];
  }, [catalog, selectedClasse, selectedDiscipline]);

  // Filtrage des leçons selon la recherche
  const filteredLessons = useMemo(() => {
    if (!lessonSearch.trim()) return availableLessons;
    const q = lessonSearch.toLowerCase();
    return availableLessons.filter(l => l.t.toLowerCase().includes(q) || l.th.toLowerCase().includes(q));
  }, [availableLessons, lessonSearch]);

  const toggleLesson = (lessonTitle: string) => {
    setSelectedLessons(prev => {
      if (prev.includes(lessonTitle)) {
        return prev.filter(t => t !== lessonTitle);
      } else {
        return [...prev, lessonTitle];
      }
    });
  };

  // Tester la clé API
  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setTestKeyStatus({ testing: false, message: 'Veuillez saisir une clé API.', success: false });
      return;
    }
    setTestKeyStatus({ testing: true, message: 'Vérification de la clé auprès de Google AI...' });
    const res = await testGeminiApiKey(apiKey.trim(), model);
    setTestKeyStatus({ testing: false, message: res.message, success: res.success });
    if (res.success) {
      saveStoredGeminiApiKey(apiKey.trim());
      saveStoredGeminiModel(model);
    }
  };

  const handleSaveKey = () => {
    saveStoredGeminiApiKey(apiKey.trim());
    saveStoredGeminiModel(model);
    setIsKeyModalOpen(false);
  };

  // Gestion du pool de clés dans Supabase
  const loadPoolKeys = async (pin: string) => {
    setIsLoadingPool(true);
    setFounderMessage(null);
    const res = await manageAiKeysInPool({ action: 'list', pin });
    setIsLoadingPool(false);
    if (res.success) {
      setIsFounderUnlocked(true);
      setPoolKeys(res.keys || []);
    } else {
      setFounderMessage({ text: res.error || 'Code PIN incorrect.', isError: true });
    }
  };

  const handleAddKeyToPool = async () => {
    if (!newKeyInput.trim()) return;
    setIsLoadingPool(true);
    const res = await manageAiKeysInPool({
      action: 'add',
      pin: founderPinInput,
      key: newKeyInput.trim(),
      label: newKeyLabel.trim() || 'Clé Gemini Gratuite'
    });
    setIsLoadingPool(false);
    if (res.success) {
      setNewKeyInput('');
      setNewKeyLabel('');
      setFounderMessage({ text: 'Clé ajoutée au pool de rotation avec succès !' });
      loadPoolKeys(founderPinInput);
    } else {
      setFounderMessage({ text: res.error || 'Erreur lors de l’ajout.', isError: true });
    }
  };

  const handleTogglePoolKey = async (keyId: string) => {
    setIsLoadingPool(true);
    await manageAiKeysInPool({ action: 'toggle', pin: founderPinInput, id: keyId });
    setIsLoadingPool(false);
    loadPoolKeys(founderPinInput);
  };

  const handleDeletePoolKey = async (keyId: string) => {
    if (!confirm('Supprimer cette clé du pool ?')) return;
    setIsLoadingPool(true);
    await manageAiKeysInPool({ action: 'delete', pin: founderPinInput, id: keyId });
    setIsLoadingPool(false);
    loadPoolKeys(founderPinInput);
  };

  // Lancement de la génération IA avec Gemini
  const handleGenerateExam = async () => {
    setErrorMessage(null);

    // Contrôle préalable de monétisation
    const currentKey = apiKey.trim() || getStoredGeminiApiKey();
    if (!currentKey && !passActive && freeExamsCount >= FREE_EXAMS_QUOTA) {
      setIsMonetizationModalOpen(true);
      return;
    }

    setIsGenerating(true);
    setGenerationStep('1/3 : Analyse du référentiel APC officiel togolais...');

    const params: ApcGenerationParams = {
      classe: selectedClasse,
      discipline: selectedDiscipline,
      typeEpreuve,
      lecons: selectedLessons,
      instructionsSpeciales: instructionsSpeciales.trim() || undefined,
      etablissement: etablissement.trim() || 'Lycée de Tokoin',
      anneeScolaire: anneeScolaire.trim() || '2025 - 2026',
      session: session.trim() || 'Évaluation Sommative du 1er Trimestre',
      duree,
      coefficient,
      apiKey: currentKey || undefined,
      model
    };

    try {
      setTimeout(() => {
        setGenerationStep('2/3 : Rédaction de la situation d’intégration et des consignes indépendantes...');
      }, 2500);

      setTimeout(() => {
        setGenerationStep('3/3 : Élaboration de la grille critériée sur 8 points et du corrigé-type...');
      }, 5500);

      const exam = await generateApcExamWithGemini({
        ...params,
        hasActivePass: passActive
      });
      setCurrentExam(exam);
      setFreeExamsCount(getFreeExamsUsedCount());
      setSavedExams(getSavedApcExams());
      setViewTab('epreuve');
      setShowConfigDetails(false);
    } catch (err: any) {
      console.error('Erreur génération APC:', err);
      if (err.message && err.message.includes('MONETIZATION_LIMIT_REACHED')) {
        setIsMonetizationModalOpen(true);
      } else {
        setErrorMessage(err.message || 'Erreur lors de la communication avec l’IA Gemini.');
      }
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  // Charger une démo hors ligne
  const handleLoadDemo = () => {
    const demo = getOfflineSampleExam(selectedClasse, selectedDiscipline);
    setCurrentExam(demo);
    setViewTab('epreuve');
    setErrorMessage(null);
  };

  // Téléchargement PDF A4
  const handleDownloadPdf = () => {
    if (!currentExam) return;
    setIsExportingPdf(true);
    try {
      const { blob, fileName } = generateApcExamPdf(currentExam);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur export PDF:', err);
      alert('Erreur lors de la création du document PDF.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Copier le texte de l'épreuve pour Word ou WhatsApp
  const handleCopyText = () => {
    if (!currentExam) return;

    let fullText = `RÉPUBLIQUE TOGOLAISE\nTravail - Liberté - Patrie\n`;
    fullText += `${currentExam.etablissement} | Année scolaire : ${currentExam.anneeScolaire}\n`;
    fullText += `Session : ${currentExam.session}\n\n`;
    fullText += `========================================\n`;
    fullText += `ÉPREUVE DE : ${currentExam.disciplineLabel.toUpperCase()}\n`;
    fullText += `CLASSE : ${currentExam.classeLabel} | DURÉE : ${currentExam.duree} | COEFF : ${currentExam.coefficient}\n`;
    fullText += `========================================\n\n`;
    fullText += `${currentExam.titre.toUpperCase()}\n\n`;

    for (const exo of currentExam.exercices) {
      fullText += `----------------------------------------\n`;
      fullText += `${exo.titre.toUpperCase()} (${exo.points} pts)\n`;
      if (exo.intro) fullText += `${exo.intro}\n\n`;
      for (const q of exo.questions) {
        fullText += `${q.numero} ${q.enonce} [${q.points} pt(s)]\n`;
        if (q.choix) {
          for (const ch of q.choix) {
            fullText += `   • ${ch}\n`;
          }
        }
      }
      fullText += `\n`;
    }

    if (currentExam.situationIntegration) {
      const sit = currentExam.situationIntegration;
      fullText += `----------------------------------------\n`;
      fullText += `${sit.titre.toUpperCase()} (8 points)\n\n`;
      fullText += `Contexte :\n${sit.contexte}\n\n`;
      if (sit.donnees) fullText += `Données utiles : ${sit.donnees}\n\n`;
      fullText += `Consignes :\n`;
      for (const c of sit.consignes) {
        fullText += `• Consigne ${c.numero} [${c.bareme} pts] : ${c.enonce}\n`;
      }
      fullText += `\nGrille critériée officielle (8 pts) :\n`;
      for (const g of sit.grilleCorrection) {
        fullText += `- ${g.critere} (${g.bareme} pt) : ${g.indicateurs}\n`;
      }
      fullText += `\n`;
    }

    fullText += `\n========================================\n`;
    fullText += `CORRIGÉ-TYPE OFFICIEL ET GRILLE DE NOTATION\n`;
    fullText += `========================================\n\n`;

    for (const exC of currentExam.corrige.exerciceCorriges) {
      fullText += `[${exC.titre}]\n`;
      for (const rep of exC.reponses) {
        fullText += `${rep.item} : ${rep.reponse} (${rep.points} pt)\n`;
      }
      fullText += `\n`;
    }

    if (currentExam.corrige.situationCorrigee) {
      const sc = currentExam.corrige.situationCorrigee;
      fullText += `[Résolution de la situation d'évaluation]\n`;
      if (sc.consigne1Corrige) fullText += `Consigne 1 : ${sc.consigne1Corrige}\n\n`;
      if (sc.consigne2Corrige) fullText += `Consigne 2 : ${sc.consigne2Corrige}\n\n`;
      if (sc.baremeDetaille) fullText += `Barème : ${sc.baremeDetaille}\n\n`;
    }

    fullText += `Généré via Djanta Hub - APC Togo (IA Gemini Flash 0 FCFA)\n`;

    navigator.clipboard.writeText(fullText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    });
  };

  // Impression
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* BANNIÈRE SUPÉRIEURE D'ACCUEIL */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-700/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Sparkles size={13} className="text-amber-400" />
                APC Togo 🇹🇬
              </span>
              {apiKey.trim() ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Key size={12} />
                  Clé Personnelle Active (Illimité)
                </span>
              ) : passActive ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Shield size={12} />
                  Pass Actif (Illimité • Pool Djanta)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  🎁 Essai Gratuit : {Math.max(0, FREE_EXAMS_QUOTA - freeExamsCount)}/2 épreuves restantes
                </span>
              )}
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                Gemini Flash
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <GraduationCap className="text-amber-400" size={26} />
              Générateur d'Épreuves APC par IA
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Créez des sujets d’évaluation et de composition conformes aux normes togolaises :
              situations ancrées dans la vie réelle, 2 consignes indépendantes, grille critériée sur 8 points et corrigé officiel complet.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsKeyModalOpen(true)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${
                apiKey.trim()
                  ? 'bg-slate-800 text-emerald-400 border-emerald-500/40 hover:bg-slate-700'
                  : 'bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-400 shadow-sm animate-pulse'
              }`}
            >
              <Key size={14} />
              {apiKey.trim() ? 'Clé Personnelle' : 'Clé & Pool IA'}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsFounderModalOpen(true);
                setFounderMessage(null);
              }}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-amber-400 hover:text-amber-300 rounded-xl border border-slate-700 transition-colors"
              title="Espace Fondateur : Gestion du Pool de Clés Supabase"
            >
              <Lock size={16} />
            </button>

            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
              title="Historique des épreuves sauvegardées"
            >
              <History size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* BOÎTE DE MESSAGE D'ERREUR */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={18} />
          <div className="flex-1">
            <p className="font-semibold">Une erreur est survenue lors de la génération :</p>
            <p className="mt-0.5 text-rose-700">{errorMessage}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setIsKeyModalOpen(true)}
                className="underline font-semibold hover:text-rose-900 text-xs"
              >
                Vérifier ma clé Gemini
              </button>
              <span className="text-rose-400">•</span>
              <button
                type="button"
                onClick={handleLoadDemo}
                className="underline font-semibold hover:text-rose-900 text-xs"
              >
                Ouvrir un exemple type hors-ligne
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PANNEAU DE CONFIGURATION DU SUJET */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div 
          onClick={() => setShowConfigDetails(!showConfigDetails)}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none bg-slate-50/70 hover:bg-slate-100/70 border-b border-slate-200/70 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              <Sliders size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Paramètres de l'Épreuve
              </h3>
              <p className="text-xs text-slate-500">
                {CLASSES_META.find(c => c.id === selectedClasse)?.label} • {DISCIPLINES_META.find(d => d.id === selectedDiscipline)?.label} • {duree} • Coeff {coefficient}
              </p>
            </div>
          </div>
          <button 
            type="button" 
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            {showConfigDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {showConfigDetails && (
          <div className="p-4 sm:p-6 space-y-6">
            {/* 1. CHOIX DE LA CLASSE */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
                1. Niveau & Classe (Togo)
              </label>
              
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Collège</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CLASSES_META.filter(c => c.level === 'college').map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedClasse(c.id)}
                      className={`p-2.5 rounded-xl text-left border transition-all text-xs ${
                        selectedClasse === c.id
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm font-semibold'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold">{c.label.split(' ')[0]}</div>
                      <div className={`text-[10px] ${selectedClasse === c.id ? 'text-slate-300' : 'text-slate-500'}`}>
                        {c.cycle}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider pt-2">Lycée (Second Cycle & Baccalauréat)</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CLASSES_META.filter(c => c.level === 'lycee').map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedClasse(c.id)}
                      className={`p-2.5 rounded-xl text-left border transition-all text-xs ${
                        selectedClasse === c.id
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm font-semibold'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold truncate">{c.label.split(' (')[0]}</div>
                      <div className={`text-[10px] truncate ${selectedClasse === c.id ? 'text-slate-300' : 'text-slate-500'}`}>
                        {c.cycle}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. CHOIX DE LA DISCIPLINE */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
                2. Matière / Discipline
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {DISCIPLINES_META.map(d => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDiscipline(d.id)}
                    className={`p-2.5 rounded-xl text-left border transition-all flex items-center gap-2.5 ${
                      selectedDiscipline === d.id
                        ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base">{d.icon}</span>
                    <span className="text-xs truncate">{d.shortLabel}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. TYPE D'ÉPREUVE */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                3. Format de l'Épreuve
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setTypeEpreuve('complet')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    typeEpreuve === 'complet'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>Sujet Complet (Standard)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300">20 pts</span>
                  </div>
                  <div className={`text-[11px] mt-1 ${typeEpreuve === 'complet' ? 'text-slate-300' : 'text-slate-500'}`}>
                    Ressources (12 pts) + Situation d’intégration APC (8 pts).
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTypeEpreuve('situation_integration')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    typeEpreuve === 'situation_integration'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>Situation d’Intégration</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300">8 pts</span>
                  </div>
                  <div className={`text-[11px] mt-1 ${typeEpreuve === 'situation_integration' ? 'text-slate-300' : 'text-slate-500'}`}>
                    Contexte de vie, 2 consignes indépendantes et grille critériée.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTypeEpreuve('ressources')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    typeEpreuve === 'ressources'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>Évaluation des Ressources</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300">12 pts</span>
                  </div>
                  <div className={`text-[11px] mt-1 ${typeEpreuve === 'ressources' ? 'text-slate-300' : 'text-slate-500'}`}>
                    QCM, définitions, formules et exercices d'application directe.
                  </div>
                </button>
              </div>
            </div>

            {/* 4. SÉLECTION DES LEÇONS DU PROGRAMME TOGOLAIS */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <BookOpen size={14} className="text-slate-500" />
                  4. Leçons officielles au programme ({availableLessons.length} leçons recensées)
                </label>
                {selectedLessons.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedLessons([])}
                    className="text-[11px] text-rose-600 hover:underline font-medium"
                  >
                    Désélectionner tout ({selectedLessons.length})
                  </button>
                )}
              </div>

              {isLoadingCatalog ? (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <RefreshCw size={14} className="animate-spin" />
                  Chargement du référentiel togolais...
                </div>
              ) : availableLessons.length === 0 ? (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-800">
                  Programme général sélectionné. L'IA concevra une épreuve équilibrée selon les normes officielles du niveau.
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filtrer un chapitre ou une leçon (ex: Thalès, Oxydoréduction, Drépanocytose, Contraction)..."
                      value={lessonSearch}
                      onChange={(e) => setLessonSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-slate-900 bg-slate-50/50"
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 scrollbar-thin">
                    {filteredLessons.map(lesson => {
                      const isSelected = selectedLessons.includes(lesson.t);
                      return (
                        <div
                          key={lesson.id}
                          onClick={() => toggleLesson(lesson.t)}
                          className={`p-2 rounded-lg cursor-pointer text-xs transition-colors flex items-start gap-2 ${
                            isSelected
                              ? 'bg-slate-900 text-white font-medium'
                              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="mt-0.5 rounded text-amber-500 focus:ring-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold truncate">{lesson.t}</div>
                            {lesson.th && (
                              <div className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                                Thème : {lesson.th}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {selectedLessons.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedLessons.map(l => (
                        <span 
                          key={l}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-800 border border-slate-300"
                        >
                          <span className="truncate max-w-[200px]">{l}</span>
                          <button
                            type="button"
                            onClick={() => toggleLesson(l)}
                            className="text-slate-400 hover:text-slate-700 font-bold ml-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 5. CARTOUCHE D'EXAMEN OFFICIEL (Détails) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
              <div className="sm:col-span-2 md:col-span-1">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Établissement
                </label>
                <input
                  type="text"
                  value={etablissement}
                  onChange={(e) => setEtablissement(e.target.value)}
                  placeholder="Lycée de Tokoin"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Année scolaire
                </label>
                <input
                  type="text"
                  value={anneeScolaire}
                  onChange={(e) => setAnneeScolaire(e.target.value)}
                  placeholder="2025 - 2026"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Session d'évaluation
                </label>
                <input
                  type="text"
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  placeholder="Composition du 1er Trimestre"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Durée officielle
                </label>
                <input
                  type="text"
                  value={duree}
                  onChange={(e) => setDuree(e.target.value)}
                  placeholder="2h 00min"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Coefficient
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={coefficient}
                  onChange={(e) => setCoefficient(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Orientations particulières de l'enseignant (optionnel)
              </label>
              <input
                type="text"
                value={instructionsSpeciales}
                onChange={(e) => setInstructionsSpeciales(e.target.value)}
                placeholder="Ex: Insister sur les calculs d'acide-base et la sécurité en laboratoire, ou ancrer à Kpalimé..."
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900"
              />
            </div>

            {/* BOUTON D'ACTION PRINCIPALE */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleGenerateExam}
                disabled={isGenerating}
                className="w-full sm:flex-1 py-3 px-5 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={16} className="animate-spin text-amber-400" />
                    <span>Génération en cours...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} className="text-amber-400" />
                    <span>Générer l'Épreuve Officielle avec Gemini (0 FCFA)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleLoadDemo}
                disabled={isGenerating}
                className="w-full sm:w-auto py-3 px-4 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="Affiche un sujet d'examen type sans appel réseau"
              >
                Exemple type hors-ligne
              </button>
            </div>

            {/* BARRE DE PROGRESSION EN DIRECT */}
            {isGenerating && (
              <div className="p-3 bg-slate-900 text-slate-100 rounded-xl text-xs space-y-1.5 border border-slate-800 animate-pulse">
                <div className="flex items-center justify-between text-[11px] text-amber-400 font-mono">
                  <span>Modèle : {model}</span>
                  <span>Temps estimé : ~5-8 sec</span>
                </div>
                <div className="text-slate-300 font-medium">
                  {generationStep}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ZONE D'AFFICHAGE ET PRÉVISUALISATION DE L'ÉPREUVE */}
      {currentExam && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* BARRE D'OUTILS ET D'ACTIONS */}
          <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            {/* Onglets Épreuve / Corrigé */}
            <div className="flex items-center p-1 bg-slate-200/80 rounded-xl">
              <button
                type="button"
                onClick={() => setViewTab('epreuve')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewTab === 'epreuve'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileCheck size={14} className={viewTab === 'epreuve' ? 'text-amber-500' : ''} />
                Épreuve pour l'Élève
              </button>

              <button
                type="button"
                onClick={() => setViewTab('corrige')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewTab === 'corrige'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye size={14} className={viewTab === 'corrige' ? 'text-emerald-500' : ''} />
                Corrigé-Type & Barème Prof
              </button>
            </div>

            {/* Boutons d'exportation */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
                title="Télécharger le fichier PDF officiel A4 prêt pour l'impression"
              >
                <Download size={13} className="text-amber-400" />
                <span>{isExportingPdf ? 'Exportation...' : 'Télécharger PDF A4'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyText}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                  isCopied
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
                title="Copier le sujet complet pour coller dans Word ou WhatsApp"
              >
                {isCopied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                <span>{isCopied ? 'Copié !' : 'Copier'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="p-1.5 text-slate-600 hover:text-slate-950 rounded-lg hover:bg-slate-200 transition-colors hidden sm:block"
                title="Imprimer directement l'épreuve"
              >
                <Printer size={16} />
              </button>
            </div>
          </div>

          {/* CONTENU FEUILLE OFFICIELLE (SIMULATION PAPIER MINISTÈRE) */}
          <div className="p-5 sm:p-8 space-y-6 bg-white font-serif text-slate-900 print:p-0">
            {/* EN-TÊTE ACADÉMIQUE TOGOLAIS */}
            <div className="border-b-2 border-slate-900 pb-3 font-sans">
              <div className="flex justify-between items-start text-xs sm:text-sm">
                <div>
                  <div className="font-bold tracking-wide">RÉPUBLIQUE TOGOLAISE</div>
                  <div className="italic text-[11px] text-slate-600">Travail - Liberté - Patrie</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                    MINISTÈRE DES ENSEIGNEMENTS PRIMAIRE,<br />
                    SECONDAIRE ET TECHNIQUE<br />
                    <span className="italic">{currentExam.directionRegionale}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-slate-900 uppercase">{currentExam.etablissement}</div>
                  <div className="text-[11px] text-slate-600">Année scolaire : {currentExam.anneeScolaire}</div>
                  <div className="text-[11px] text-slate-600">Session : {currentExam.session}</div>
                  <div className="text-[10px] text-slate-400">Togo • Format Officiel APC</div>
                </div>
              </div>

              {/* CARTOUCHE D'EXAMEN ENCADRÉ */}
              <div className="mt-4 p-3 bg-slate-50 border-2 border-slate-900 rounded-lg">
                <div className="text-center sm:flex sm:justify-between sm:items-center">
                  <div className="text-sm sm:text-base font-black tracking-wide uppercase text-slate-950">
                    ÉPREUVE DE : {currentExam.disciplineLabel}
                  </div>
                  <div className="text-xs font-semibold text-slate-700 mt-1 sm:mt-0">
                    CLASSE : {currentExam.classeLabel}
                  </div>
                </div>
                <div className="flex justify-center sm:justify-start gap-4 text-xs font-medium text-slate-600 mt-1 border-t border-slate-200 pt-1">
                  <span>DURÉE : <strong>{currentExam.duree}</strong></span>
                  <span>•</span>
                  <span>COEFFICIENT : <strong>{currentExam.coefficient}</strong></span>
                  <span>•</span>
                  <span>TOTAL : <strong>{currentExam.totalPoints} POINTS</strong></span>
                </div>
              </div>

              <div className="text-center font-bold text-sm sm:text-base text-slate-900 mt-3 uppercase tracking-wider">
                {currentExam.titre}
              </div>
            </div>

            {/* VUE 1 : ÉPREUVE DE L'ÉLÈVE */}
            {viewTab === 'epreuve' && (
              <div className="space-y-6 leading-relaxed">
                {/* EXERCICES DE RESSOURCES */}
                {currentExam.exercices.map(exo => (
                  <div key={exo.numero} className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-300 pb-1">
                      <h4 className="font-sans font-bold text-sm sm:text-base text-slate-900 uppercase">
                        {exo.titre}
                      </h4>
                      <span className="font-sans text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {exo.points} pts
                      </span>
                    </div>

                    {exo.intro && (
                      <p className="text-xs sm:text-sm italic text-slate-600">
                        {exo.intro}
                      </p>
                    )}

                    <div className="space-y-3">
                      {exo.questions.map(q => (
                        <div key={q.numero} className="text-xs sm:text-sm">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-slate-900">
                              <span className="font-bold mr-1.5">{q.numero}</span>
                              {q.enonce}
                            </p>
                            <span className="font-sans text-[11px] text-slate-500 whitespace-nowrap italic">
                              ({q.points} pt{q.points > 1 ? 's' : ''})
                            </span>
                          </div>

                          {q.choix && q.choix.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2 pl-4 font-sans text-xs text-slate-700">
                              {q.choix.map((choice, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <span className="w-4 h-4 rounded-full border border-slate-400 flex items-center justify-center text-[10px] shrink-0">
                                    {String.fromCharCode(65 + idx)}
                                  </span>
                                  <span>{choice}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* SITUATION D'INTÉGRATION (APC) */}
                {currentExam.situationIntegration && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between border-b border-slate-300 pb-1">
                      <h4 className="font-sans font-bold text-sm sm:text-base text-slate-900 uppercase">
                        {currentExam.situationIntegration.titre}
                      </h4>
                      <span className="font-sans text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        8 points
                      </span>
                    </div>

                    {/* CONTEXTE NARRATIF */}
                    <div className="p-4 bg-slate-50/80 rounded-xl border-l-4 border-slate-900 text-xs sm:text-sm leading-relaxed text-slate-800">
                      <div className="font-sans font-bold text-xs uppercase tracking-wider text-slate-500 mb-1">
                        Contexte :
                      </div>
                      <p className="italic">
                        {currentExam.situationIntegration.contexte}
                      </p>
                    </div>

                    {currentExam.situationIntegration.donnees && (
                      <div className="text-xs sm:text-sm text-slate-700 font-sans">
                        <strong>Données utiles :</strong> {currentExam.situationIntegration.donnees}
                      </div>
                    )}

                    {/* CONSIGNES */}
                    <div className="space-y-2.5 pt-1">
                      <div className="font-sans font-bold text-xs uppercase tracking-wider text-slate-700">
                        Consignes de travail :
                      </div>
                      {currentExam.situationIntegration.consignes.map(c => (
                        <div key={c.numero} className="flex items-start justify-between gap-2 p-2.5 bg-amber-50/40 rounded-lg border border-amber-200/60 text-xs sm:text-sm">
                          <div>
                            <strong className="font-sans text-slate-900 mr-2">Consigne {c.numero} :</strong>
                            <span className="text-slate-800">{c.enonce}</span>
                          </div>
                          <span className="font-sans text-[11px] font-semibold text-slate-600 shrink-0">
                            [{c.bareme} pts]
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* GRILLE CRITÉRIÉE OFFICIELLE SUR 8 POINTS */}
                    {currentExam.situationIntegration.grilleCorrection && (
                      <div className="mt-4 pt-2 font-sans">
                        <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                          Grille critériée d’évaluation officielle (8 points) :
                        </div>
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-200">
                              <tr>
                                <th className="p-2.5">Critère APC</th>
                                <th className="p-2.5 w-20 text-center">Barème</th>
                                <th className="p-2.5">Indicateurs observables</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                              {currentExam.situationIntegration.grilleCorrection.map((g, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                  <td className="p-2.5 font-bold text-slate-900">{g.critere}</td>
                                  <td className="p-2.5 text-center font-semibold text-amber-600">{g.bareme} pt</td>
                                  <td className="p-2.5 text-[11px] text-slate-600">{g.indicateurs}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* VUE 2 : CORRIGÉ-TYPE ET BARÈME ENSEIGNANT */}
            {viewTab === 'corrige' && (
              <div className="space-y-6 leading-relaxed font-sans">
                <div className="p-3 bg-slate-900 text-white rounded-xl text-center font-bold text-xs sm:text-sm uppercase tracking-wide">
                  CORRIGÉ-TYPE OFFICIEL ET BARÈME DE NOTATION DÉTAILLÉ
                </div>

                {currentExam.corrige.exerciceCorriges.map(exC => (
                  <div key={exC.numero} className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1">
                      {exC.titre}
                    </h4>
                    <div className="space-y-2.5 text-xs sm:text-sm">
                      {exC.reponses.map((rep, idx) => (
                        <div key={idx} className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <strong className="text-slate-900 font-mono text-xs mr-2">{rep.item} :</strong>
                            <span className="text-slate-800">{rep.reponse}</span>
                          </div>
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                            {rep.points} pt{rep.points > 1 ? 's' : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {currentExam.corrige.situationCorrigee && (
                  <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-3">
                    <h4 className="font-bold text-sm text-slate-900 border-b border-amber-200 pb-1">
                      Résolution de la Situation d’Évaluation (8 points)
                    </h4>
                    
                    {currentExam.corrige.situationCorrigee.consigne1Corrige && (
                      <div className="text-xs sm:text-sm space-y-1">
                        <strong className="text-slate-900">Éléments de réponse - Consigne 1 :</strong>
                        <p className="text-slate-700 whitespace-pre-line bg-white p-2.5 rounded-lg border border-slate-200">
                          {currentExam.corrige.situationCorrigee.consigne1Corrige}
                        </p>
                      </div>
                    )}

                    {currentExam.corrige.situationCorrigee.consigne2Corrige && (
                      <div className="text-xs sm:text-sm space-y-1">
                        <strong className="text-slate-900">Éléments de réponse - Consigne 2 :</strong>
                        <p className="text-slate-700 whitespace-pre-line bg-white p-2.5 rounded-lg border border-slate-200">
                          {currentExam.corrige.situationCorrigee.consigne2Corrige}
                        </p>
                      </div>
                    )}

                    {currentExam.corrige.situationCorrigee.baremeDetaille && (
                      <div className="text-xs text-slate-600 bg-white/80 p-2.5 rounded-lg border border-slate-200">
                        <strong>Détail d'attribution des points APC :</strong> {currentExam.corrige.situationCorrigee.baremeDetaille}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL CONFIGURATION CLÉ GEMINI GRATUITE */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                  <Key size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">
                    Clé API Google Gemini (0 FCFA)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Gratuite et illimitée pour l'éducation au Togo
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsKeyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2 leading-relaxed bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/80">
              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Shield size={14} className="text-emerald-600" />
                Comment obtenir votre clé gratuite en 30 secondes :
              </div>
              <ol className="list-decimal pl-4 space-y-1 text-slate-700">
                <li>Rendez-vous sur Google AI Studio (accessible avec votre compte Google).</li>
                <li>Cliquez sur <strong>« Get API key »</strong> puis <strong>« Create API key »</strong>.</li>
                <li>Copiez la clé générée (commence par <code>AIzaSy...</code>) et collez-la ci-dessous.</li>
              </ol>
              <div className="pt-1">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:underline"
                >
                  Ouvrir Google AI Studio (Lien officiel)
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Votre clé API Google Gemini :
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:outline-hidden focus:border-slate-900 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Modèle Gemini sélectionné :
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:border-slate-900 bg-white"
                >
                  {AVAILABLE_MODELS.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Gemini Flash est ultra-rapide (réponse en ~5s) et inclus gratuitement sans frais bancaires.
                </p>
              </div>

              {testKeyStatus && (
                <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  testKeyStatus.testing
                    ? 'bg-slate-100 text-slate-700'
                    : testKeyStatus.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {testKeyStatus.testing && <RefreshCw size={14} className="animate-spin" />}
                  {testKeyStatus.success && <CheckCircle2 size={14} className="text-emerald-600" />}
                  {!testKeyStatus.testing && !testKeyStatus.success && <AlertCircle size={14} className="text-rose-600" />}
                  <span>{testKeyStatus.message}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsKeyModalOpen(false);
                  setIsFounderModalOpen(true);
                  setFounderMessage(null);
                }}
                className="text-[11px] text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1"
              >
                <Lock size={12} />
                Pool Fondateur (Supabase)
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestKey}
                  disabled={testKeyStatus?.testing}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  Tester la clé
                </button>

                <button
                  type="button"
                  onClick={handleSaveKey}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HISTORIQUE DES ÉPREUVES */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <History size={18} className="text-slate-700" />
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  Historique des Épreuves Générées
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {savedExams.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Aucune épreuve sauvegardée pour le moment.
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {savedExams.map(ex => (
                  <div
                    key={ex.id}
                    className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-between gap-2 text-xs transition-colors"
                  >
                    <div 
                      onClick={() => {
                        setCurrentExam(ex);
                        setIsHistoryOpen(false);
                      }}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-bold text-slate-900 truncate">
                        {ex.titre}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {ex.classeLabel} • {ex.disciplineLabel} • {new Date(ex.dateCreation).toLocaleDateString('fr-FR')}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        deleteApcExamFromHistory(ex.id);
                        setSavedExams(getSavedApcExams());
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Supprimer cette épreuve de l'historique"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MONÉTISATION : LIMITE D'ESSAI GRATUIT ATTEINTE */}
      {isMonetizationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-sm">
                <Sparkles size={24} />
              </div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900">
                Quota d’essai gratuit atteint (2/2)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Vous avez généré vos <strong>2 épreuves officielles gratuites</strong> offertes par Djanta Hub.
                Pour continuer à créer des épreuves et corrigés conformes aux normes togolaises en illimité :
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsMonetizationModalOpen(false);
                  if (onOpenPassModal) {
                    onOpenPassModal();
                  }
                }}
                className="w-full p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-between shadow-sm transition-all"
              >
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-amber-400" />
                  <span>Activer un Pass Djanta (dès 700 F)</span>
                </div>
                <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-extrabold">
                  Illimité
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMonetizationModalOpen(false);
                  setIsKeyModalOpen(true);
                }}
                className="w-full p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Key size={16} className="text-slate-500" />
                  <span>Utiliser ma propre clé Gemini (0 FCFA)</span>
                </div>
                <span className="text-[10px] text-slate-500">
                  Google AI
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMonetizationModalOpen(false);
                  handleLoadDemo();
                }}
                className="w-full p-2.5 text-center text-xs text-slate-500 hover:text-slate-800 transition-colors"
              >
                Voir un sujet d'exemple hors-ligne
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => setIsMonetizationModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ESPACE FONDATEUR : GESTION DU POOL DE CLÉS SUPABASE */}
      {isFounderModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
                  <Lock size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">
                    Espace Fondateur : Pool de Clés Supabase
                  </h3>
                  <p className="text-xs text-slate-500">
                    Rotation automatique des clés Gemini pour monétiser Djanta Hub
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsFounderModalOpen(false);
                  setIsFounderUnlocked(false);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {!isFounderUnlocked ? (
              /* ÉCRAN DE DÉVERROUILLAGE PIN */
              <div className="space-y-3 py-3">
                <p className="text-xs text-slate-600">
                  Cet espace est strictement réservé au fondateur de Djanta Hub pour approvisionner le pool de clés API.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Code PIN Fondateur (Défaut : 2280) :
                  </label>
                  <input
                    type="password"
                    maxLength={8}
                    placeholder="2280"
                    value={founderPinInput}
                    onChange={(e) => setFounderPinInput(e.target.value)}
                    className="w-full px-3 py-2 text-center text-sm font-mono tracking-widest border border-slate-300 rounded-xl focus:outline-hidden focus:border-slate-900 bg-slate-50"
                  />
                </div>

                {founderMessage && (
                  <div className={`p-2 rounded-lg text-xs ${founderMessage.isError ? 'text-rose-700 bg-rose-50' : 'text-emerald-700 bg-emerald-50'}`}>
                    {founderMessage.text}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => loadPoolKeys(founderPinInput)}
                  disabled={isLoadingPool || !founderPinInput.trim()}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoadingPool ? <RefreshCw size={14} className="animate-spin text-amber-400" /> : <Unlock size={14} />}
                  <span>Déverrouiller le Gestionnaire de Pool</span>
                </button>
              </div>
            ) : (
              /* GESTION DU POOL DE CLÉS */
              <div className="space-y-4">
                <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/80 text-xs text-slate-700 space-y-1">
                  <p className="font-semibold text-slate-900">
                    💡 Fonctionnement du Pool de Rotation Startup :
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    Ajoutez plusieurs clés Google AI Studio gratuites. Le système sélectionne automatiquement la clé la moins sollicitée (round-robin) pour servir les utilisateurs abonnés au Pass ou en essai gratuit.
                  </p>
                </div>

                {/* FORMULAIRE AJOUT DE CLÉ */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Plus size={14} className="text-amber-600" />
                    <span>Ajouter une clé Gemini au pool :</span>
                  </div>

                  <input
                    type="text"
                    placeholder="Libellé (ex: Compte Gmail 1, Compte Frère 2...)"
                    value={newKeyLabel}
                    onChange={(e) => setNewKeyLabel(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />

                  <input
                    type="password"
                    placeholder="Clé API (commence par AIzaSy...)"
                    value={newKeyInput}
                    onChange={(e) => setNewKeyInput(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white"
                  />

                  <button
                    type="button"
                    onClick={handleAddKeyToPool}
                    disabled={isLoadingPool || !newKeyInput.trim()}
                    className="w-full py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all disabled:opacity-50"
                  >
                    {isLoadingPool ? 'Ajout en cours...' : 'Ajouter au Pool de Rotation'}
                  </button>
                </div>

                {founderMessage && (
                  <div className={`p-2 rounded-lg text-xs ${founderMessage.isError ? 'text-rose-700 bg-rose-50' : 'text-emerald-700 bg-emerald-50'}`}>
                    {founderMessage.text}
                  </div>
                )}

                {/* LISTE DES CLÉS DANS LE POOL */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Clés enregistrées ({poolKeys.length})</span>
                    <button
                      type="button"
                      onClick={() => loadPoolKeys(founderPinInput)}
                      className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-[11px]"
                    >
                      <RefreshCw size={11} className={isLoadingPool ? 'animate-spin' : ''} />
                      Rafraîchir
                    </button>
                  </div>

                  {poolKeys.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400 italic">
                      Aucune clé dans le pool pour l'instant. Ajoutez une première clé Google AI Studio ci-dessus.
                    </div>
                  ) : (
                    <div className="max-h-52 overflow-y-auto space-y-2">
                      {poolKeys.map((k) => (
                        <div
                          key={k.id}
                          className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-900 truncate">
                              {k.label}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {k.key_preview} • Utilisée {k.usage_count} fois
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleTogglePoolKey(k.id)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                k.is_active
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {k.is_active ? 'Actif' : 'Inactif'}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeletePoolKey(k.id)}
                              className="p-1 text-slate-400 hover:text-rose-600"
                              title="Supprimer cette clé"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 text-right">
                  <button
                    type="button"
                    onClick={() => setIsFounderModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
