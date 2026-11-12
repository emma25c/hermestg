import {
  ApcClassMeta,
  ApcDisciplineMeta,
  ApcExam,
  ApcGenerationParams,
  ApcLessonRef
} from '../types/apc';
import { supabase } from './supabase';

export const GEMINI_API_KEY_STORAGE = 'djanta_gemini_api_key';
export const GEMINI_MODEL_STORAGE = 'djanta_gemini_model';
export const APC_EXAMS_HISTORY_STORAGE = 'djanta_apc_exams_history';
export const FREE_EXAMS_STORAGE_KEY = 'djanta_free_exams_used_count';

export const FREE_EXAMS_QUOTA = 2; // 2 épreuves gratuites offertes aux nouveaux utilisateurs avant monétisation

export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

export const AVAILABLE_MODELS = [
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Recommandé - Ultra rapide & Gratuit)', free: true },
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Stable & Gratuit)', free: true },
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Haute performance)', free: true },
  { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash (Expérimental / Futur)', free: true },
];

export const CLASSES_META: ApcClassMeta[] = [
  // Collège
  { id: '6e', label: '6ème (Collège)', level: 'college', cycle: 'Cycle d’orientation', defaultDuree: '1h 30min' },
  { id: '5e', label: '5ème (Collège)', level: 'college', cycle: 'Cycle central', defaultDuree: '1h 30min' },
  { id: '4e', label: '4ème (Collège)', level: 'college', cycle: 'Cycle central', defaultDuree: '2h 00min' },
  { id: '3e', label: '3ème (BEPC)', level: 'college', cycle: 'Examen du BEPC', defaultDuree: '2h 00min' },
  
  // Lycée
  { id: '2ndeL', label: 'Seconde L (Lycée Littéraire)', level: 'lycee', cycle: 'Second cycle', defaultDuree: '2h 00min' },
  { id: '2ndeS', label: 'Seconde S (Lycée Scientifique)', level: 'lycee', cycle: 'Second cycle', defaultDuree: '3h 00min' },
  { id: '1ereA', label: 'Première A (BAC 1 Littéraire)', level: 'lycee', cycle: 'BAC 1', defaultDuree: '3h 00min' },
  { id: '1ereC', label: 'Première C (BAC 1 Maths & Physiques)', level: 'lycee', cycle: 'BAC 1', defaultDuree: '3h 00min' },
  { id: '1ereD', label: 'Première D (BAC 1 SVT & Physiques)', level: 'lycee', cycle: 'BAC 1', defaultDuree: '3h 00min' },
  { id: 'tleA', label: 'Terminale A4 (BAC 2 Lettres & Philo)', level: 'lycee', cycle: 'BAC 2', defaultDuree: '4h 00min' },
  { id: 'tleC', label: 'Terminale C (BAC 2 Mathématiques)', level: 'lycee', cycle: 'BAC 2', defaultDuree: '4h 00min' },
  { id: 'tleD', label: 'Terminale D (BAC 2 SVT & Physiques)', level: 'lycee', cycle: 'BAC 2', defaultDuree: '4h 00min' },
];

export const DISCIPLINES_META: ApcDisciplineMeta[] = [
  { id: 'maths', label: 'Mathématiques', shortLabel: 'Maths', color: 'bg-blue-600', icon: '📐' },
  { id: 'pct', label: 'Physique-Chimie-Technologie', shortLabel: 'PCT', color: 'bg-emerald-600', icon: '⚡' },
  { id: 'svt', label: 'Sciences de la Vie et de la Terre', shortLabel: 'SVT', color: 'bg-teal-600', icon: '🌿' },
  { id: 'francais', label: 'Français (Littérature & Langue)', shortLabel: 'Français', color: 'bg-rose-600', icon: '📚' },
  { id: 'hg', label: 'Histoire - Géographie', shortLabel: 'Hist-Géo', color: 'bg-amber-600', icon: '🌍' },
  { id: 'philo', label: 'Philosophie', shortLabel: 'Philo', color: 'bg-indigo-600', icon: '💡' },
  { id: 'anglais', label: 'Anglais (English)', shortLabel: 'Anglais', color: 'bg-sky-600', icon: '🗣️' },
  { id: 'ecm', label: 'Éducation Civique et Morale', shortLabel: 'ECM', color: 'bg-violet-600', icon: '⚖️' },
  { id: 'allemand', label: 'Allemand (Deutsch)', shortLabel: 'Allemand', color: 'bg-yellow-600', icon: '🇩🇪' },
  { id: 'eps', label: 'Éducation Physique et Sportive', shortLabel: 'EPS', color: 'bg-orange-600', icon: '🏃' },
];

let curriculumCatalogCache: Record<string, Record<string, ApcLessonRef[]>> | null = null;

export async function loadCurriculumCatalog(): Promise<Record<string, Record<string, ApcLessonRef[]>>> {
  if (curriculumCatalogCache) return curriculumCatalogCache;
  try {
    const res = await fetch('/data/togo_curriculum.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    curriculumCatalogCache = data;
    return data;
  } catch (err) {
    console.warn('Impossible de charger togo_curriculum.json en local:', err);
    return {};
  }
}

export function getDefaultExamMeta(classeId: string, disciplineId: string): {
  duree: string;
  coefficient: number;
  session: string;
} {
  let duree = '2h 00min';
  let coefficient = 2;

  if (disciplineId === 'maths') {
    if (classeId === '3e') { duree = '2h 00min'; coefficient = 3; }
    else if (classeId === '2ndeS') { duree = '3h 00min'; coefficient = 4; }
    else if (classeId === '1ereC') { duree = '3h 00min'; coefficient = 5; }
    else if (classeId === '1ereD') { duree = '3h 00min'; coefficient = 4; }
    else if (classeId === 'tleC') { duree = '4h 00min'; coefficient = 6; }
    else if (classeId === 'tleD') { duree = '4h 00min'; coefficient = 4; }
    else if (classeId === 'tleA' || classeId === '1ereA' || classeId === '2ndeL') { duree = '2h 00min'; coefficient = 2; }
  } else if (disciplineId === 'pct') {
    if (classeId === '3e') { duree = '2h 00min'; coefficient = 2; }
    else if (classeId === '2ndeS') { duree = '2h 00min'; coefficient = 3; }
    else if (classeId === '1ereC') { duree = '3h 00min'; coefficient = 5; }
    else if (classeId === '1ereD') { duree = '3h 00min'; coefficient = 3; }
    else if (classeId === 'tleC') { duree = '4h 00min'; coefficient = 5; }
    else if (classeId === 'tleD') { duree = '3h 00min'; coefficient = 4; }
  } else if (disciplineId === 'svt') {
    if (classeId === '3e') { duree = '2h 00min'; coefficient = 2; }
    else if (classeId === '1ereD') { duree = '3h 00min'; coefficient = 4; }
    else if (classeId === 'tleD') { duree = '4h 00min'; coefficient = 5; }
    else if (classeId === 'tleC') { duree = '2h 00min'; coefficient = 2; }
  } else if (disciplineId === 'francais') {
    if (classeId === '3e') { duree = '2h 00min'; coefficient = 3; }
    else if (classeId === '1ereA' || classeId === 'tleA') { duree = '4h 00min'; coefficient = 5; }
    else if (classeId === 'tleC' || classeId === 'tleD') { duree = '3h 00min'; coefficient = 2; }
  } else if (disciplineId === 'philo') {
    if (classeId === 'tleA') { duree = '4h 00min'; coefficient = 5; }
    else if (classeId === 'tleC' || classeId === 'tleD') { duree = '3h 00min'; coefficient = 2; }
  } else if (disciplineId === 'hg') {
    if (classeId === 'tleA') { duree = '3h 00min'; coefficient = 3; }
    else { duree = '2h 00min'; coefficient = 2; }
  } else if (disciplineId === 'anglais') {
    if (classeId === 'tleA') { duree = '3h 00min'; coefficient = 3; }
    else { duree = '2h 00min'; coefficient = 2; }
  }

  return {
    duree,
    coefficient,
    session: 'Évaluation Sommative du 1er Trimestre'
  };
}

export function getStoredGeminiApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(GEMINI_API_KEY_STORAGE) || import.meta.env.VITE_GEMINI_API_KEY || '';
}

export function saveStoredGeminiApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GEMINI_API_KEY_STORAGE, key.trim());
}

export function getStoredGeminiModel(): string {
  if (typeof window === 'undefined') return DEFAULT_GEMINI_MODEL;
  return localStorage.getItem(GEMINI_MODEL_STORAGE) || DEFAULT_GEMINI_MODEL;
}

export function saveStoredGeminiModel(model: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GEMINI_MODEL_STORAGE, model.trim());
}

/**
 * Récupère le nombre d'épreuves gratuites déjà générées par l'utilisateur sans pass.
 */
export function getFreeExamsUsedCount(): number {
  if (typeof window === 'undefined') return 0;
  const countStr = localStorage.getItem(FREE_EXAMS_STORAGE_KEY);
  return countStr ? parseInt(countStr, 10) || 0 : 0;
}

/**
 * Incrémente le compteur d'épreuves gratuites consommées.
 */
export function incrementFreeExamsCount(): number {
  if (typeof window === 'undefined') return 1;
  const current = getFreeExamsUsedCount();
  const next = current + 1;
  localStorage.setItem(FREE_EXAMS_STORAGE_KEY, next.toString());
  return next;
}

/**
 * Interroge Supabase pour obtenir une clé Gemini active par rotation (round-robin / moindre utilisation).
 */
export async function fetchRotatedGeminiKeyFromPool(): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('get_rotated_gemini_key');
    if (error) {
      console.warn('Erreur appel RPC get_rotated_gemini_key:', error);
      return null;
    }
    return data ? (data as string).trim() : null;
  } catch (err) {
    console.warn('Exception appel get_rotated_gemini_key:', err);
    return null;
  }
}

/**
 * Interface d'administration pour gérer le pool de clés API dans Supabase (protégée par code PIN fondateur).
 */
export async function manageAiKeysInPool(params: {
  action: 'list' | 'add' | 'toggle' | 'delete';
  pin: string;
  key?: string;
  label?: string;
  id?: string;
}): Promise<{ success: boolean; message?: string; error?: string; keys?: any[] }> {
  try {
    const { data, error } = await supabase.rpc('manage_ai_keys', {
      p_action: params.action,
      p_pin: params.pin.trim(),
      p_key: params.key ? params.key.trim() : null,
      p_label: params.label ? params.label.trim() : 'Clé Gemini Gratuite',
      p_id: params.id || null
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return data as { success: boolean; message?: string; error?: string; keys?: any[] };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erreur réseau.' };
  }
}

export function getSavedApcExams(): ApcExam[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(APC_EXAMS_HISTORY_STORAGE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveApcExamToHistory(exam: ApcExam): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getSavedApcExams();
    const filtered = history.filter(e => e.id !== exam.id);
    filtered.unshift(exam);
    // Garder les 30 dernières épreuves max
    const trimmed = filtered.slice(0, 30);
    localStorage.setItem(APC_EXAMS_HISTORY_STORAGE, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Erreur sauvegarde épreuve APC:', e);
  }
}

export function deleteApcExamFromHistory(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getSavedApcExams();
    const filtered = history.filter(e => e.id !== id);
    localStorage.setItem(APC_EXAMS_HISTORY_STORAGE, JSON.stringify(filtered));
  } catch {}
}

/**
 * Construit le system prompt pédagogique togolais strict pour chaque matière.
 */
function buildApcSystemPrompt(discipline: string, classe: string): string {
  let disciplineInstructions = '';

  switch (discipline) {
    case 'maths':
      disciplineInstructions = `
SPÉCIFICITÉS MATHÉMATIQUES APC TOGO :
- Exercice 1 (Évaluation des ressources, 6 points) : QCM avec 4 choix crédibles, Vrai ou Faux avec justification, et calculs directs (factorisation, équations, trigonométrie ou fonctions).
- Exercice 2 (Résolution de problèmes intermédiaires, 6 points) : Géométrie (Thalès, Pythagore, vecteurs, produit scalaire) ou Analyse (fonctions numériques, dérivées, suites) ou Statistiques/Probabilités selon le niveau.
- Exercice 3 (Situation d'intégration / Compétences, 8 points) : Situation de vie courante ancrée au Togo. Les données sont dans le récit. Pas de tableau vide de données.
- RÈGLE ABSOLUE ANTI-CLICHÉ : INTERDICTION FORMELLE des poncifs éculés : "Kpodji", "Koami", "40 membres", "trapèze AB=20m DC=70m", "4368 briques", "cotisation 43680 FCFA". Invente des situations fraîches, modernes et réalistes (ferme avicole à Tsevié, fabrication de tissu batik à Kpalimé, coopérative de maraîchage d'Aného, aménagement d'un espace informatique à Lomé).
      `;
      break;

    case 'pct':
      disciplineInstructions = `
SPÉCIFICITÉS PHYSIQUE-CHIMIE-TECHNOLOGIE (PCT) APC TOGO :
- Spécialisé EXCLUSIVEMENT en PCT : NE pose JAMAIS de questions de géométrie pure (Pythagore abstrait, angles, distances géométriques pures interdits).
- Exercice 1 (Évaluation des ressources, 8 points) : Définitions physiques/chimiques rigoureuses, formules officielles avec unités SI du système international, calcul direct ou application de lois (Newton, Ohm, énergies, acide-base, cinématique, optique).
- Exercice 2 (Technologie ou Analyse de montage, 4 points) : Schéma expérimental ou technique, identification des composants, rôle et sécurité.
- Exercice 3 (Situation d'intégration, 8 points) : Problème technique réel au Togo (groupe électrogène, panne sur une pompe à eau solaire, électrolyse, protection contre la corrosion, surconsommation électrique).
      `;
      break;

    case 'svt':
      disciplineInstructions = `
SPÉCIFICITÉS SVT APC TOGO :
- Spécialisé EXCLUSIVEMENT en SVT (pas de géométrie).
- Exercice 1 (Évaluation des ressources, 6 points) : 5 rubriques officielles APC :
  1. DÉFIS : Définitions directes des termes biologiques clés.
  2. CITER : Énumération d'organes, de structures, ou d'étapes.
  3. VRAI / FAUX : Propositions conceptuelles.
  4. RÉORGANISATION : Remise en ordre chronologique ou fonctionnelle.
  5. QCM : Questions à choix multiples avec distracteurs scientifiques crédibles.
- Exercice 2 (Exploitation de documents scientifiques, 6 points) : Analyse de données, de graphiques ou d'expériences en laboratoire.
- Exercice 3 (Situation-problème / Compétences, 8 points) : Enjeu de santé publique, environnement ou génétique au Togo (paludisme, drépanocytose, malnutrition infantile, assainissement de la lagune de Lomé, érosion côtière).
      `;
      break;

    case 'francais':
      disciplineInstructions = `
SPÉCIFICITÉS FRANÇAIS APC TOGO :
- Si Lycée (1ère / Terminale) : Deux options de sujets :
  * Sujet I (Contraction de texte) : Texte argumentatif de 400 à 600 mots sur un enjeu africain contemporain (jeunesse, éducation, numérique, culture). Questions de compréhension/vocabulaire (4 pts), résumé au quart de sa longueur (8 pts), discussion argumentée (8 pts).
  * Sujet II (Commentaire composé ou Dissertation littéraire) portant sur des auteurs togolais ou africains au programme (Moïse Inandjo, Kangni Alem, Senghor, Camara Laye, etc.).
- Si Collège (6e à 3e) : Texte de lecture suivi de questions de compréhension, vocabulaire, grammaire/conjugaison, et d'une situation d'intégration écrite (lettre personnelle, récit d'expérience, sensibilisation).
      `;
      break;

    case 'hg':
      disciplineInstructions = `
SPÉCIFICITÉS HISTOIRE - GÉOGRAPHIE APC TOGO :
- Partie A (8 points) : Situation d'évaluation avec document d'appui (extrait de traité, discours historique, tableau de données démographiques ou économiques sur le Togo/Afrique) + 2 consignes de production (note de synthèse, affiche de sensibilisation, discours).
- Partie B (12 points) : Sujet au choix entre deux questions (Dissertation historique ou Commentaire de document géographique).
      `;
      break;

    case 'philo':
      disciplineInstructions = `
SPÉCIFICITÉS PHILOSOPHIE APC TOGO (Lycée) :
- Sujet 1 : Dissertation philosophique portant sur les notions du programme togolais (La liberté, Le pouvoir de l'État, Autrui, La technique, La science, L'art, La morale).
- Sujet 2 : Explication ordonnée de texte philosophique (Kant, Rousseau, Platon, Descartes, Marcien Towa, Paulin Hountondji, etc.) avec question directrice, thèse, démarche argumentative et intérêt philosophique.
      `;
      break;

    case 'anglais':
      disciplineInstructions = `
SPÉCIFICITÉS ANGLAIS APC TOGO :
- Section 1 (Reading Comprehension, 8 points) : Texte de 10 à 15 lignes sur un thème adapté au niveau, suivi de True/False, Title choice, Questions ouvertes, Vocabulaire / Synonymes.
- Section 2 (Linguistic Competence, 6 points) : Exercices de grammaire, temps des verbes, prépositions, enrichissement lexical.
- Section 3 (Writing, 6 points) : Situation d'intégration écrite (Letter to a pen-friend, short article, guided dialogue) avec consigne précise et nombre minimal de lignes.
      `;
      break;

    case 'ecm':
      disciplineInstructions = `
SPÉCIFICITÉS ÉDUCATION CIVIQUE ET MORALE (ECM) TOGO :
- Thèmes togolais : Constitution de la République Togolaise, institutions républicaines, citoyenneté responsable, police et discipline des examens scolaires, décentralisation et rôle des mairies, civisme routier, préservation du bien public.
- Exercice 1 : Connaissances institutionnelles et juridiques (définitions, Vrai/Faux, QCM).
- Exercice 2 : Cas pratique / Résolution de litige en milieu scolaire ou communautaire.
- Exercice 3 : Situation d'intégration avec grille critériée.
      `;
      break;

    default:
      disciplineInstructions = `
Respecte rigoureusement les programmes officiels de la discipline au Togo, avec une alternance entre évaluation des ressources (questions de cours, définitions, applications directes) et évaluation des compétences (situation-problème de vie courante).
      `;
  }

  return `Tu es un Inspecteur Général de l'Éducation Nationale et professeur expert en Approche Par Compétences (APC) au Togo pour le niveau d'enseignement de la classe de ${classe}.
Tu conçois des épreuves de composition et d'examen officiel conformes aux dernières révisions pédagogiques du Ministère des Enseignements Primaire, Secondaire et Technique du Togo.

RÈGLES PÉDAGOGIQUES MAJEURES APC TOGO (NON NÉGOCIABLES) :
1. TASK OUTSIDE THE SITUATION :
   Le texte narratif de la situation d'évaluation/intégration ne doit JAMAIS contenir la consigne, ni de questions numérotées ("1)", "2)", "a)").
   La tâche doit figurer EXCLUSIVEMENT dans le champ des consignes.

2. INDÉPENDANCE STRICTE DES CONSIGNES :
   Dans une situation d'intégration comportant deux consignes, la consigne 2 doit impérativement pouvoir être résolue même si l'élève n'a pas réussi la consigne 1.

3. GRILLE CRITÉRIÉE OFFICIELLE SUR 8 POINTS :
   Toute situation d'intégration doit comporter sa grille critériée officielle répartie sur les 4 critères togolais :
   - Pertinence (C1) : Adéquation de la production avec la consigne et le contexte (1.5 pt pour matières scientifiques, 3.0 pts pour matières littéraires).
   - Correction (C2) : Utilisation correcte des concepts, formules et outils de la discipline (1.0 pt / 2.0 pts).
   - Cohérence (C3) : Enchaînement logique du raisonnement et argumentation structurée (1.0 pt / 2.0 pts).
   - Perfectionnement (CP) : Soin, qualité de la langue, présentation soignée et originalité (0.5 pt / 1.0 pt).

4. ANCRAGE RÉEL TOGOLAIS SANS CLICHÉS :
   Les situations doivent s'ancrer dans le quotidien réel togolais moderne (Lomé, Kpalimé, Kara, Sokodé, Dapaong, Aného, Atakpamé, port autonome de Lomé, marché de Cacaveli, agriculture du maïs et du cacao, coopératives artisanales, installation d'énergie solaire).
   ÉVITER STRICTEMENT les clichés des vieilles annales : "Kpodji", "Koami", "40 membres", "4368 briques", "trapèze 20m x 70m".

5. RÈGLES TECHNIQUES CRITIQUES FORMAT JSON (POUR ÉVITER TOUTE ERREUR DE SYNTAXE) :
   - DANS TOUT LE CONTENU TEXTUEL : N'utilise JAMAIS de guillemets doubles (") à l'intérieur de tes phrases, énoncés, options ou corrigés !
   - Pour citer un mot, un titre de livre, une expression, une consigne ou une formule, utilise EXCLUSIVEMENT des apostrophes simples (') ou des guillemets français (« et »). Exemple : 'x = 3' et JAMAIS "x = 3".
   - Ne mets JAMAIS de virgule après le dernier élément d'un tableau (]) ou après la dernière clé d'un objet (}).
   - Les retours à la ligne dans les textes doivent être échappés avec \\n.
   - Tu dois répondre UNIQUEMENT par un objet JSON valide, sans préambule, sans texte avant ou après, sans balises de code Markdown.

${disciplineInstructions}`;
}

/**
 * Prépare le prompt utilisateur détaillé avec le schéma JSON attendu.
 */
function buildApcUserPrompt(params: ApcGenerationParams): string {
  const classeInfo = CLASSES_META.find(c => c.id === params.classe);
  const disciplineInfo = DISCIPLINES_META.find(d => d.id === params.discipline);

  const classeLabel = classeInfo ? classeInfo.label : params.classe;
  const disciplineLabel = disciplineInfo ? disciplineInfo.label : params.discipline;

  const leconsText = params.lecons.length > 0
    ? `LEÇONS ET CHAPITRES DU PROGRAMME CIBLÉS :\n${params.lecons.map(l => `- ${l}`).join('\n')}`
    : `Sujet de synthèse générale couvrant l'ensemble du programme trimestriel officiel.`;

  return `Génère une épreuve officielle APC complète pour :
- Classe : ${classeLabel}
- Discipline : ${disciplineLabel}
- Établissement : ${params.etablissement || 'Lycée de Tokoin'}
- Année scolaire : ${params.anneeScolaire || '2025 - 2026'}
- Session / Évaluation : ${params.session || 'Évaluation Sommative du 1er Trimestre'}
- Durée officielle : ${params.duree}
- Coefficient : ${params.coefficient}
- Type d'épreuve demandé : ${params.typeEpreuve === 'complet' ? 'Sujet complet (Évaluation des ressources + Situation d\'intégration, 20 points)' : params.typeEpreuve === 'situation_integration' ? 'Situation d\'intégration APC uniquement (8 points)' : 'Évaluation des ressources uniquement (12 points)'}

${leconsText}

${params.instructionsSpeciales ? `INSTRUCTIONS PARTICULIÈRES DE L'ENSEIGNANT :\n${params.instructionsSpeciales}\n` : ''}

Tu dois respecter EXACTEMENT la structure JSON suivante :
{
  "titre": "Titre officiel de l'épreuve (ex: ÉVALUATION SOMMATIVE DU 1ER TRIMESTRE)",
  "classe": "${params.classe}",
  "classeLabel": "${classeLabel}",
  "discipline": "${params.discipline}",
  "disciplineLabel": "${disciplineLabel}",
  "etablissement": "${params.etablissement || 'Lycée de Tokoin'}",
  "directionRegionale": "DIRECTION RÉGIONALE DE L’ÉDUCATION (GRAND LOMÉ)",
  "anneeScolaire": "${params.anneeScolaire || '2025 - 2026'}",
  "session": "${params.session || 'Évaluation Sommative du 1er Trimestre'}",
  "duree": "${params.duree}",
  "coefficient": ${params.coefficient},
  "totalPoints": 20,
  "typeEpreuve": "${params.typeEpreuve}",
  "leconsCiblees": ${JSON.stringify(params.lecons)},
  "exercices": [
    {
      "numero": 1,
      "titre": "Exercice 1 : Évaluation des ressources (6 à 8 pts)",
      "points": 6,
      "intro": "Consigne introductive...",
      "questions": [
        {
          "numero": "1.1",
          "enonce": "Énoncé précis de la question...",
          "points": 1.5,
          "type": "qcm | vrai_faux | calcul | definition | texte",
          "choix": ["A. Choix 1", "B. Choix 2", "C. Choix 3", "D. Choix 4"]
        }
      ]
    },
    {
      "numero": 2,
      "titre": "Exercice 2 : Résolution de problèmes intermédiaires / Exploitation de documents (6 pts)",
      "points": 6,
      "intro": "Contexte de l'exercice...",
      "questions": [
        {
          "numero": "2.1",
          "enonce": "Énoncé...",
          "points": 2.0,
          "type": "calcul"
        }
      ]
    }
  ],
  "situationIntegration": {
    "titre": "Exercice 3 : Situation d'évaluation (Compétences - 8 points)",
    "contexte": "Récit narratif complet et détaillé décrivant la situation concrète au Togo. RÈGLE STRICTE : AUCUNE question ni consigne dans ce texte !",
    "donnees": "Données numériques ou documentaires intégrées au problème (tarifs en FCFA, grandeurs mesurées, etc.)",
    "consignes": [
      {
        "numero": 1,
        "enonce": "Première consigne d'action claire et autonome...",
        "bareme": 4
      },
      {
        "numero": 2,
        "enonce": "Deuxième consigne d'action indépendante de la première...",
        "bareme": 4
      }
    ],
    "grilleCorrection": [
      {
        "critere": "Pertinence (C1)",
        "bareme": 1.5,
        "indicateurs": "L'élève a correctement identifié le problème et mobilisé les démarches adaptées à la consigne."
      },
      {
        "critere": "Correction (C2)",
        "bareme": 1.0,
        "indicateurs": "Utilisation exacte des formules, des règles disciplinaires et des unités SI."
      },
      {
        "critere": "Cohérence (C3)",
        "bareme": 1.0,
        "indicateurs": "Raisonnement logique, démarches étape par étape sans contradiction."
      },
      {
        "critere": "Perfectionnement (CP)",
        "bareme": 0.5,
        "indicateurs": "Propreté de la copie, clarté de la rédaction et soin apporté aux résultats."
      }
    ]
  },
  "corrige": {
    "exerciceCorriges": [
      {
        "numero": 1,
        "titre": "Exercice 1 : Évaluation des ressources",
        "reponses": [
          {
            "item": "1.1",
            "reponse": "Réponse complète avec démarche et justification...",
            "points": 1.5
          }
        ]
      },
      {
        "numero": 2,
        "titre": "Exercice 2 : Résolution de problèmes",
        "reponses": [
          {
            "item": "2.1",
            "reponse": "Calcul détaillé et résultat...",
            "points": 2.0
          }
        ]
      }
    ],
    "situationCorrigee": {
      "consigne1Corrige": "Résolution modèle étape par étape pour la consigne 1...",
      "consigne2Corrige": "Résolution modèle étape par étape pour la consigne 2...",
      "baremeDetaille": "Détail de notation selon les 4 critères officiels : C1 = 1.5 pt, C2 = 1.0 pt, C3 = 1.0 pt, CP = 0.5 pt."
    }
  }
}

Renvoie UNIQUEMENT le JSON pur sans aucun texte introductif ni markdown autour.`;
}

/**
 * Nettoie, répare et analyse un texte JSON renvoyé par l'IA.
 * Répare de façon résiliente :
 * - Les guillemets internes non échappés dans les chaînes de texte
 * - Les virgules traînantes devant ] ou }
 * - Les sauts de ligne réels dans les chaînes
 * - Les légères troncatures de fin de document
 */
export function repairAndParseJson(raw: string): any {
  let text = raw.trim();

  // 1. Suppression des balises Markdown de code
  text = text.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    text = text.substring(firstBrace, lastBrace + 1);
  }

  // 2. Première tentative : parsing direct
  try {
    return JSON.parse(text);
  } catch (initialErr) {
    // Si échec direct, enclencher la machine de réparation
  }

  // 3. Suppression des virgules traînantes devant ] ou }
  text = text.replace(/,\s*([\]}])/g, '$1');

  try {
    return JSON.parse(text);
  } catch {}

  // 4. Normalisation des guillemets typographiques ou chevrons
  text = text.replace(/[\u201C\u201D\u00AB\u00BB]/g, "'");
  text = text.replace(/[\u2018\u2019]/g, "'");

  // 5. Remplacement des sauts de ligne et tabulations réels dans les chaînes
  text = text.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/gs, (match) => {
    return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
  });

  try {
    return JSON.parse(text);
  } catch {}

  // 6. Machine à états pour neutraliser les guillemets doubles non-échappés à l'intérieur des chaînes
  let out = '';
  let inStr = false;
  let esc = false;
  const stack: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (esc) {
      out += c;
      esc = false;
      continue;
    }

    if (c === '\\') {
      out += c;
      esc = true;
      continue;
    }

    if (c === '"') {
      if (!inStr) {
        inStr = true;
        out += c;
      } else {
        // Regarder en avant pour vérifier s'il s'agit bien d'un délimiteur de fin de chaîne
        let nextIndex = i + 1;
        while (
          nextIndex < text.length &&
          (text[nextIndex] === ' ' || text[nextIndex] === '\t' || text[nextIndex] === '\n' || text[nextIndex] === '\r')
        ) {
          nextIndex++;
        }
        const next = text[nextIndex];

        // S'il est suivi par :, ,, }, ] ou la fin du texte, c'est une fin de chaîne légitime
        if (next === ':' || next === ',' || next === '}' || next === ']' || nextIndex >= text.length) {
          inStr = false;
          out += c;
        } else {
          // Guillemet interne non échappé : on le convertit en apostrophe pour ne pas casser le JSON
          out += "'";
        }
      }
      continue;
    }

    if (!inStr) {
      if (c === '{' || c === '[') {
        stack.push(c);
      } else if (c === '}') {
        if (stack.length > 0 && stack[stack.length - 1] === '{') stack.pop();
      } else if (c === ']') {
        if (stack.length > 0 && stack[stack.length - 1] === '[') stack.pop();
      }
    }

    out += c;
  }

  if (inStr) {
    out += '"';
  }

  // Nettoyage des virgules résiduelles
  out = out.replace(/,\s*([\]}])/g, '$1');
  out = out.replace(/,\s*$/, '');

  // Fermeture des accolades/crochets non fermés si réponse tronquée
  while (stack.length > 0) {
    const open = stack.pop();
    if (open === '{') out += '}';
    if (open === '[') out += ']';
  }

  try {
    return JSON.parse(out);
  } catch (err: any) {
    console.error('Erreur parsing après réparation machine à états:', err);
    throw new Error(`Erreur d'analyse de la réponse IA (${err.message}). Veuillez relancer la génération.`);
  }
}

/**
 * Teste la validité d'une clé API Gemini en envoyant une requête minimale.
 */
export async function testGeminiApiKey(key: string, modelName = DEFAULT_GEMINI_MODEL): Promise<{ success: boolean; message: string }> {
  if (!key || !key.trim()) {
    return { success: false, message: 'Veuillez saisir votre clé API Google Gemini.' };
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key.trim()}`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Réponds par "OK" en un seul mot.' }] }],
        generationConfig: { maxOutputTokens: 10 }
      })
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      const errMsg = errJson?.error?.message || `Erreur HTTP ${res.status}`;
      return { success: false, message: errMsg };
    }

    return { success: true, message: 'Connexion à Gemini réussie ! La clé est active et 100% fonctionnelle.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Erreur réseau lors de la vérification de la clé.' };
  }
}

/**
 * Appelle l'API Gemini pour générer l'épreuve avec échelle de repli et rotation automatique des clés.
 */
export async function generateApcExamWithGemini(
  params: ApcGenerationParams & { hasActivePass?: boolean; userId?: string }
): Promise<ApcExam> {
  // 1. DÉTERMINATION DE LA CLÉ À UTILISER & MONÉTISATION
  const personalKey = params.apiKey || getStoredGeminiApiKey();
  let keyToUse = personalKey;
  let isUsingPool = false;

  if (personalKey) {
    // Si l'utilisateur ou l'enseignant fournit sa propre clé : usage illimité 100% autonome
    keyToUse = personalKey;
  } else {
    // Pas de clé personnelle : contrôle du modèle économique (Pass Djanta ou Quota d'essai gratuit)
    const hasActivePass = Boolean(params.hasActivePass);
    const usedCount = getFreeExamsUsedCount();

    if (!hasActivePass && usedCount >= FREE_EXAMS_QUOTA) {
      throw new Error(
        'MONETIZATION_LIMIT_REACHED: Vous avez atteint votre quota d’essai de 2 épreuves gratuites. Activez votre Pass Djanta (à partir de 700 FCFA) pour débloquer les épreuves illimitées avec le pool de clés haute vitesse de Djanta Hub, ou saisissez votre propre clé Gemini personnelle.'
      );
    }

    // Récupération d'une clé active depuis le pool de rotation Supabase
    const poolKey = await fetchRotatedGeminiKeyFromPool();
    if (poolKey) {
      keyToUse = poolKey;
      isUsingPool = true;
    } else {
      // Clé fallback d'environnement si configurée
      const envKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (envKey) {
        keyToUse = envKey;
      } else {
        throw new Error(
          'Aucune clé API disponible dans le pool. Veuillez renseigner votre clé gratuite Google AI Studio (0 FCFA) ou contacter le fondateur pour approvisionner le pool.'
        );
      }
    }
  }

  const modelsToTry = [
    params.model || getStoredGeminiModel() || DEFAULT_GEMINI_MODEL,
    'gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-2.0-flash'
  ];
  // Dédoublonnage
  const uniqueModels = Array.from(new Set(modelsToTry));

  const systemPrompt = buildApcSystemPrompt(params.discipline, params.classe);
  const userPrompt = buildApcUserPrompt(params);

  let lastError: Error | null = null;

  for (const model of uniqueModels) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${keyToUse.trim()}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: userPrompt }]
            }
          ],
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          generationConfig: {
            temperature: 0.1, // Déterminisme élevé pour supprimer les anomalies de syntaxe JSON
            maxOutputTokens: 8192,
            responseMimeType: 'application/json'
          }
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errMsg = errorData?.error?.message || `HTTP ${res.status}`;

        // En cas de saturation quota (429) ou problème de clé sur le pool, faire une rotation automatique !
        if (isUsingPool && (res.status === 429 || res.status === 403)) {
          console.warn(`Clé du pool saturée (${res.status}), rotation automatique vers une autre clé...`);
          const anotherKey = await fetchRotatedGeminiKeyFromPool();
          if (anotherKey && anotherKey !== keyToUse) {
            keyToUse = anotherKey;
            continue; // Réessayer immédiatement avec la nouvelle clé tournée
          }
        }

        // Si le modèle n'existe pas (404), on essaye le suivant dans l'échelle
        if (res.status === 404 || errMsg.toLowerCase().includes('not found')) {
          console.warn(`Modèle ${model} introuvable sur cette clé, passage au modèle suivant...`);
          continue;
        }
        throw new Error(`Erreur Gemini (${res.status}): ${errMsg}`);
      }

      const jsonResponse = await res.json();
      const rawText = jsonResponse?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error("L'IA Gemini a renvoyé une réponse vide.");
      }

      // Parsing avec moteur de réparation résilient
      const parsedData = repairAndParseJson(rawText);

      // Normalisation de l'épreuve
      const exam: ApcExam = {
        id: `apc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        titre: parsedData.titre || `Composition de ${params.discipline.toUpperCase()}`,
        classe: params.classe,
        classeLabel: CLASSES_META.find(c => c.id === params.classe)?.label || params.classe,
        discipline: params.discipline,
        disciplineLabel: DISCIPLINES_META.find(d => d.id === params.discipline)?.label || params.discipline,
        etablissement: params.etablissement || 'Lycée de Tokoin',
        directionRegionale: parsedData.directionRegionale || 'DIRECTION RÉGIONALE DE L’ÉDUCATION (GRAND LOMÉ)',
        anneeScolaire: params.anneeScolaire || '2025 - 2026',
        session: params.session || 'Évaluation Sommative du 1er Trimestre',
        duree: params.duree || parsedData.duree || '2h 00min',
        coefficient: params.coefficient || parsedData.coefficient || 2,
        dateCreation: new Date().toISOString(),
        typeEpreuve: params.typeEpreuve,
        leconsCiblees: params.lecons,
        totalPoints: parsedData.totalPoints || 20,
        exercices: parsedData.exercices || [],
        situationIntegration: parsedData.situationIntegration,
        corrige: parsedData.corrige || { exerciceCorriges: [] },
        rawJson: rawText
      };

      // Si c'est un utilisateur gratuit utilisant le pool, on incrémente son quota
      if (!personalKey && !params.hasActivePass) {
        incrementFreeExamsCount();
      }

      // Sauvegarde dans l'historique local
      saveApcExamToHistory(exam);

      return exam;
    } catch (err: any) {
      lastError = err;
      console.warn(`Tentative avec ${model} a échoué:`, err);
    }
  }

  throw lastError || new Error('Impossible de générer l’épreuve avec Gemini.');
}

/**
 * Fournit des épreuves types pré-générées pour le mode hors-ligne / démonstration (0 FCFA et sans clé).
 */
export function getOfflineSampleExam(classe = '3e', discipline = 'maths'): ApcExam {
  if (classe === '3e' && discipline === 'maths') {
    return {
      id: 'demo-3e-maths',
      titre: 'ÉVALUATION SOMMATIVE DU 1ER TRIMESTRE - MATHÉMATIQUES',
      classe: '3e',
      classeLabel: '3ème (Collège - BEPC)',
      discipline: 'maths',
      disciplineLabel: 'Mathématiques',
      etablissement: 'Lycée Moderne de Tokoin',
      directionRegionale: 'DIRECTION RÉGIONALE DE L’ÉDUCATION (DRE GRAND LOMÉ)',
      anneeScolaire: '2025 - 2026',
      session: 'Composition du 1er Trimestre',
      duree: '2h 00min',
      coefficient: 3,
      dateCreation: new Date().toISOString(),
      typeEpreuve: 'complet',
      leconsCiblees: ['Propriété de Thalès', 'Calcul littéral et fractions rationnelles'],
      totalPoints: 20,
      exercices: [
        {
          numero: 1,
          titre: 'Exercice 1 : Évaluation des ressources (6 points)',
          points: 6,
          intro: 'Cet exercice évalue la maîtrise des définitions, propriétés et calculs algébriques fondamentaux.',
          questions: [
            {
              numero: '1.1',
              enonce: 'Parmi les expressions suivantes, choisis la forme factorisée correcte de A(x) = (2x - 3)² - 25 :',
              points: 1.5,
              type: 'qcm',
              choix: [
                'A. (2x + 2)(2x - 8)',
                'B. (2x - 8)(2x + 2)',
                'C. 4(x + 1)(x - 4)',
                'D. (2x - 28)(2x + 22)'
              ]
            },
            {
              numero: '1.2',
              enonce: 'Réponds par VRAI ou FAUX en justifiant brièvement : "Si dans un triangle ABC, les points M ∈ [AB] et N ∈ [AC] vérifient AM/AB = AN/AC, alors les droites (MN) et (BC) sont obligatoirement parallèles."',
              points: 1.5,
              type: 'vrai_faux'
            },
            {
              numero: '1.3',
              enonce: 'On donne l\'expression B = (3√2 - 2)(3√2 + 2). Calcule B et montre qu\'il s\'agit d\'un nombre entier naturel.',
              points: 1.5,
              type: 'calcul'
            },
            {
              numero: '1.4',
              enonce: 'Détermine la condition d\'existence puis simplifie la fraction rationnelle F(x) = (x² - 9) / (2x + 6).',
              points: 1.5,
              type: 'calcul'
            }
          ]
        },
        {
          numero: 2,
          titre: 'Exercice 2 : Résolution de problèmes intermédiaires (6 points)',
          points: 6,
          intro: 'Configuration géométrique du plan.',
          questions: [
            {
              numero: '2.1',
              enonce: 'Soit un triangle ABC tel que AB = 7,5 cm, AC = 6 cm et BC = 9 cm. Le point E est situé sur le segment [AB] tel que AE = 2,5 cm. La droite parallèle à (BC) passant par E coupe le segment [AC] au point F. Calcule la longueur exacte AF.',
              points: 2.0,
              type: 'calcul'
            },
            {
              numero: '2.2',
              enonce: 'Calcule la longueur du segment EF.',
              points: 2.0,
              type: 'calcul'
            },
            {
              numero: '2.3',
              enonce: 'Sur la demi-droite [BA), on place le point P tel que AP = 5 cm. Sur la demi-droite [CA), on place le point Q tel que AQ = 4 cm. Démontre que les droites (PQ) et (BC) sont strictement parallèles.',
              points: 2.0,
              type: 'calcul'
            }
          ]
        }
      ],
      situationIntegration: {
        titre: 'Exercice 3 : Situation d\'évaluation (Compétences - 8 points)',
        contexte: 'L\'association des jeunes maraîchers de Baguida (Lomé) a obtenu une parcelle triangulaire pour installer un système d\'arrosage goutte-à-goutte et cultiver des légumes biologiques. Le géomètre local a modélisé le terrain par un triangle ABC rectangle en B, où AB = 40 m et BC = 30 m. Une canalisation principale d\'eau doit être posée le long du segment [AC]. L\'entrepreneur en charge des travaux souhaite subdiviser la parcelle en deux zones d\'irrigation distinctes au moyen d\'un tuyau secondaire [MN] parallèle au côté [BC], avec M situé sur [AB] à 16 mètres du point A, et N situé sur [AC]. Pour des raisons de pression hydraulique, la pompe doit être calibrée en fonction exacte des longueurs des deux canalisations, et le devis doit être validé par le trésorier de l\'association avant le début des travaux.',
        donnees: 'Coût du mètre linéaire de tuyau haute pression : 3 500 FCFA. Forfait d\'installation par le technicien : 45 000 FCFA. Remise accordée par la quincaillerie si l\'achat dépasse 150 000 FCFA : 8%.',
        consignes: [
          {
            numero: 1,
            enonce: 'Détermine la longueur totale de tuyauterie nécessaire pour équiper à la fois la canalisation principale [AC] et la canalisation secondaire [MN].',
            bareme: 4
          },
          {
            numero: 2,
            enonce: 'Calcule le montant net total que l\'association devra débourser pour l\'achat des tuyaux et la main-d\'œuvre du technicien.',
            bareme: 4
          }
        ],
        grilleCorrection: [
          {
            critere: 'Pertinence (C1)',
            bareme: 1.5,
            indicateurs: 'L\'élève utilise le théorème de Pythagore pour [AC], la propriété de Thalès pour [MN], et effectue les calculs budgétaires avec la remise commerciale.'
          },
          {
            critere: 'Correction (C2)',
            bareme: 1.0,
            indicateurs: 'Calculs de longueurs exacts (AC = 50 m, MN = 12 m). Calcul correct du prix d\'achat avec application juste de la remise.'
          },
          {
            critere: 'Cohérence (C3)',
            bareme: 1.0,
            indicateurs: 'Enchaînement rigoureux : calcul de AC -> calcul de MN -> somme des longueurs -> calcul financier avec remise -> total final.'
          },
          {
            critere: 'Perfectionnement (CP)',
            bareme: 0.5,
            indicateurs: 'Présentation soignée, unités (mètres et FCFA) indiquées systématiquement, clarté des phrases de conclusion.'
          }
        ]
      },
      corrige: {
        exerciceCorriges: [
          {
            numero: 1,
            titre: 'Exercice 1 : Évaluation des ressources',
            reponses: [
              {
                item: '1.1',
                reponse: 'A(x) = (2x - 3)² - 5² = [(2x - 3) - 5][(2x - 3) + 5] = (2x - 8)(2x + 2) = 4(x - 4)(x + 1). Choix C (ou B).',
                points: 1.5
              },
              {
                item: '1.2',
                reponse: 'FAUX. Pour que les droites soient parallèles, il faut en plus que les points soient alignés dans le même ordre (réciproque de Thalès).',
                points: 1.5
              },
              {
                item: '1.3',
                reponse: 'B = (3√2)² - 2² = (9 × 2) - 4 = 18 - 4 = 14. 14 est bien un entier naturel.',
                points: 1.5
              },
              {
                item: '1.4',
                reponse: 'Condition d\'existence : 2x + 6 ≠ 0 <=> 2x ≠ -6 <=> x ≠ -3. Simplification : F(x) = (x - 3)(x + 3) / [2(x + 3)] = (x - 3)/2.',
                points: 1.5
              }
            ]
          },
          {
            numero: 2,
            titre: 'Exercice 2 : Résolution de problèmes',
            reponses: [
              {
                item: '2.1',
                reponse: 'Dans le triangle ABC, E ∈ [AB], F ∈ [AC] et (EF) // (BC). D\'après la propriété de Thalès : AE/AB = AF/AC = EF/BC. Donc AF = (AE × AC) / AB = (2,5 × 6) / 7,5 = 15 / 7,5 = 2 cm.',
                points: 2.0
              },
              {
                item: '2.2',
                reponse: 'EF = (AE × BC) / AB = (2,5 × 9) / 7,5 = 22,5 / 7,5 = 3 cm.',
                points: 2.0
              },
              {
                item: '2.3',
                reponse: 'D\'une part, AP/AB = 5 / 7,5 = 2/3. D\'autre part, AQ/AC = 4 / 6 = 2/3. Donc AP/AB = AQ/AC. De plus, les points P, A, B et Q, A, C sont alignés dans le même ordre. D\'après la réciproque de la propriété de Thalès, (PQ) // (BC).',
                points: 2.0
              }
            ]
          }
        ],
        situationCorrigee: {
          consigne1Corrige: '1. Dans le triangle ABC rectangle en B, d\'après le théorème de Pythagore : AC² = AB² + BC² = 40² + 30² = 1600 + 900 = 2500, d\'où AC = √2500 = 50 m.\n2. Comme M ∈ [AB], N ∈ [AC] et (MN) // (BC), d\'après le théorème de Thalès : AM/AB = MN/BC => MN = (AM × BC) / AB = (16 × 30) / 40 = 480 / 40 = 12 m.\n3. Longueur totale de tuyauterie nécessaire = AC + MN = 50 m + 12 m = 62 m.',
          consigne2Corrige: '1. Coût brut des tuyaux : 62 m × 3 500 FCFA/m = 217 000 FCFA.\n2. Comme 217 000 FCFA > 150 000 FCFA, la coopérative bénéficie de la remise de 8%.\nMontant de la remise = 217 000 × 0,08 = 17 360 FCFA.\nCoût net des tuyaux après remise = 217 000 - 17 360 = 199 640 FCFA.\n3. Coût total à débourser = Coût net des tuyaux + Forfait technicien = 199 640 + 45 000 = 244 640 FCFA.',
          baremeDetaille: 'Notation officielle sur 8 points :\n- Consigne 1 (4 pts) : C1 = 1.5, C2 = 1.0, C3 = 1.0, CP = 0.5\n- Consigne 2 (4 pts) : C1 = 1.5, C2 = 1.0, C3 = 1.0, CP = 0.5'
        }
      }
    };
  }

  // Épreuve par défaut Terminale D SVT
  return {
    id: 'demo-tled-svt',
    titre: 'ÉVALUATION SOMMATIVE DU 1ER TRIMESTRE - SVT',
    classe: 'tleD',
    classeLabel: 'Terminale D (BAC 2 SVT & Physiques)',
    discipline: 'svt',
    disciplineLabel: 'Sciences de la Vie et de la Terre',
    etablissement: 'Lycée de Tokoin',
    directionRegionale: 'DIRECTION RÉGIONALE DE L’ÉDUCATION (DRE GRAND LOMÉ)',
    anneeScolaire: '2025 - 2026',
    session: 'Baccalauréat Blanc Régional',
    duree: '4h 00min',
    coefficient: 5,
    dateCreation: new Date().toISOString(),
    typeEpreuve: 'complet',
    leconsCiblees: ['Génétique humaine et anomalies chromosomiques', 'Immunologie et défenses de l’organisme'],
    totalPoints: 20,
    exercices: [
      {
        numero: 1,
        titre: 'Exercice 1 : Évaluation des ressources (6 points)',
        points: 6,
        intro: '5 rubriques officielles d’évaluation des ressources en SVT.',
        questions: [
          {
            numero: '1.1',
            enonce: 'DÉFIS : Définis avec précision les termes suivants : a) Allèle récessif ; b) Séropositivité.',
            points: 1.5,
            type: 'definition'
          },
          {
            numero: '1.2',
            enonce: 'CITER : Cite trois barrières naturelles mécaniques et chimiques protégeant l’organisme humain contre les infections.',
            points: 1.0,
            type: 'texte'
          },
          {
            numero: '1.3',
            enonce: 'VRAI / FAUX : a) Un sujet de groupe sanguin O possède à la fois les agglutinogènes A et B sur ses hématies. b) Les lymphocytes T4 jouent le rôle de chef d\'orchestre de la réponse immunitaire adaptative.',
            points: 1.5,
            type: 'vrai_faux'
          },
          {
            numero: '1.4',
            enonce: 'QCM : La drépanocytose est une maladie génétique due à une mutation ponctuelle : A. Par délétion ; B. Par substitution remplaçant l\'acide glutamique par la valine ; C. Liée au chromosome X ; D. Dominante chez l\'hétérozygote.',
            points: 1.0,
            type: 'qcm',
            choix: ['A', 'B', 'C', 'D']
          },
          {
            numero: '1.5',
            enonce: 'RÉORGANISATION : Remets dans l’ordre chronologique de la phagocytose les phases suivantes : Digestion, Adhésion, Ingestion, Rejet des déchets.',
            points: 1.0,
            type: 'texte'
          }
        ]
      },
      {
        numero: 2,
        titre: 'Exercice 2 : Exploitation de documents scientifiques (6 points)',
        points: 6,
        intro: 'Analyse d\'un protocole expérimental d\'électrophorèse de l\'hémoglobine.',
        questions: [
          {
            numero: '2.1',
            enonce: 'Interprète les bandes de migration de l\'hémoglobine chez un couple dont l\'un est de génotype AS et l\'autre AA.',
            points: 3.0,
            type: 'developpement'
          },
          {
            numero: '2.2',
            enonce: 'Détermine la probabilité pour ce couple d’avoir un enfant atteint du syndrome drépanocytaire majeur (SS). Justifie à l\'aide d\'un échiquier de croisement.',
            points: 3.0,
            type: 'calcul'
          }
        ]
      }
    ],
    situationIntegration: {
      titre: 'Exercice 3 : Situation d\'intégration (Compétences - 8 points)',
      contexte: 'Dans le canton d\'Amoutiévé à Lomé, un comité de santé communautaire constate que plusieurs couples de jeunes mariés découvrent tardivement le statut drépanocytaire de leurs nouveau-nés après des crises douloureuses récurrentes. Certains membres de la communauté attribuent encore ces manifestations à des malédictions mystiques, entraînant des retards de prise en charge au CHU Sylvanus Olympio. Le médecin-chef du centre médico-social sollicite les élèves de Terminale scientifique pour concevoir des supports de sensibilisation clairs et scientifiquement irréfutables.',
      donnees: 'Fréquence du trait drépanocytaire au Togo : environ 16% de porteurs sains AS. Test de diagnostic fiable : électrophorèse de l\'hémoglobine à pH alcalin.',
      consignes: [
        {
          numero: 1,
          enonce: 'Rédige une note explicative vulgarisée montrant l\'origine purement génétique de la drépanocytose et démontant les croyances mystiques.',
          bareme: 4
        },
        {
          numero: 2,
          enonce: 'Propose un plan d\'action préventif recommandant le dépistage prénuptial systématique avec arguments médicaux et sociaux à l\'appui.',
          bareme: 4
        }
      ],
      grilleCorrection: [
        {
          critere: 'Pertinence (C1)',
          bareme: 1.5,
          indicateurs: 'Transmission autosomique récessive correctement expliquée ; importance vitale du bilan prénuptial mise en avant.'
        },
        {
          critere: 'Correction (C2)',
          bareme: 1.0,
          indicateurs: 'Vocabulaire génétique exact (allèle HbS, génotypes AA, AS, SS, électrophorèse).'
        },
        {
          critere: 'Cohérence (C3)',
          bareme: 1.0,
          indicateurs: 'Démarche argumentative fluide : du niveau moléculaire au niveau clinique et social.'
        },
        {
          critere: 'Perfectionnement (CP)',
          bareme: 0.5,
          indicateurs: 'Style empathique et clair, adapté au grand public de Lomé sans jargon excessif.'
        }
      ]
    },
    corrige: {
      exerciceCorriges: [
        {
          numero: 1,
          titre: 'Exercice 1 : Évaluation des ressources',
          reponses: [
            {
              item: '1.1',
              reponse: 'a) Allèle récessif : allèle dont le caractère ne s\'exprime au niveau du phénotype qu\'à l\'état homozygote.\nb) Séropositivité : présence dans le sérum sanguin d\'anticorps spécifiques dirigés contre un antigène donné.',
              points: 1.5
            },
            {
              item: '1.2',
              reponse: '1. La peau intacte (mécanique) ; 2. Le mucus nasal et sécrétions lacrymales avec lysozyme (chimique) ; 3. L\'acidité du suc gastrique (chimique).',
              points: 1.0
            },
            {
              item: '1.3',
              reponse: 'a) FAUX : le groupe O ne possède aucun agglutinogène sur ses hématies mais possède des anticorps anti-A et anti-B dans son sérum.\nb) VRAI : les LT4 activent les LB et les LT8 par sécrétion d\'interleukines.',
              points: 1.5
            },
            {
              item: '1.4',
              reponse: 'Réponse B : Substitution de l\'adénine par la thymine au niveau du codon 6 de la chaîne bêta, remplaçant l\'acide glutamique par la valine.',
              points: 1.0
            },
            {
              item: '1.5',
              reponse: 'Ordre chronologique : 1. Adhésion -> 2. Ingestion -> 3. Digestion -> 4. Rejet des déchets.',
              points: 1.0
            }
          ]
        },
        {
          numero: 2,
          titre: 'Exercice 2 : Exploitation de documents',
          reponses: [
            {
              item: '2.1',
              reponse: 'L\'électrophorèse sépare les hémoglobines selon leur charge électrique. L\'individu AA présente une seule bande rapide (HbA). L\'individu AS présente deux bandes (HbA et HbS).',
              points: 3.0
            },
            {
              item: '2.2',
              reponse: 'Croisement AS × AA : Gamètes parent AS = 50% A, 50% S. Gamètes parent AA = 100% A. Échiquier de croisement : 50% génotype AA (sain) et 50% génotype AS (porteur sain). Probabilité d\'avoir un enfant malade SS = 0%. Justification complète.',
              points: 3.0
            }
          ]
        }
      ],
      situationCorrigee: {
        consigne1Corrige: 'Explication génétique vulgarisée : la drépanocytose n\'est ni contagieuse ni surnaturelle. Elle résulte d\'une anomalie héritée des deux parents biologiques lorsqu\'ils transmettent chacun l\'allèle S. Les globules rouges se déforment en faucilles, bloquant les vaisseaux sanguins.',
        consigne2Corrige: 'Plan d\'action préventif : 1. Sensibilisation dans les églises, mosquées et mairies de Lomé ; 2. Réalisation systématique de l\'électrophorèse avant les fiançailles ; 3. Conseil génétique pour éviter les unions à risque (AS × AS, AS × SS).',
        baremeDetaille: 'Grille d\'évaluation : C1 = 1.5 pt, C2 = 1.0 pt, C3 = 1.0 pt, CP = 0.5 pt par consigne.'
      }
    }
  };
}
