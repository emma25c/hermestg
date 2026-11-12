export type ActiveToolType = 'compressor' | 'receipt' | 'simulator' | 'apc_generator';

export interface ApcLessonRef {
  id: string;
  t: string; // Titre
  th: string; // Thème / Chapitre
}

export interface ApcClassMeta {
  id: string;
  label: string;
  level: 'college' | 'lycee';
  cycle: string;
  defaultDuree: string;
}

export interface ApcDisciplineMeta {
  id: string;
  label: string;
  shortLabel: string;
  color: string;
  icon: string;
}

export interface ApcExerciceQuestion {
  numero: string;
  enonce: string;
  points: number;
  type?: 'qcm' | 'vrai_faux' | 'calcul' | 'definition' | 'developpement' | 'texte';
  choix?: string[];
}

export interface ApcExercice {
  numero: number;
  titre: string;
  points: number;
  intro?: string;
  questions: ApcExerciceQuestion[];
}

export interface ApcGrilleItem {
  critere: string; // Pertinence (C1), Correction (C2), Cohérence (C3), Perfectionnement (CP)
  bareme: number;
  indicateurs: string;
}

export interface ApcSituationIntegration {
  titre: string;
  contexte: string; // Récit contextualisé sans question
  donnees?: string;
  consignes: {
    numero: number;
    enonce: string;
    bareme: number;
  }[];
  grilleCorrection: ApcGrilleItem[];
}

export interface ApcCorrigeExercice {
  numero: number;
  titre: string;
  reponses: {
    item: string;
    reponse: string;
    points: number;
  }[];
}

export interface ApcCorrige {
  exerciceCorriges: ApcCorrigeExercice[];
  situationCorrigee?: {
    consigne1Corrige: string;
    consigne2Corrige?: string;
    baremeDetaille: string;
  };
}

export interface ApcExam {
  id: string;
  titre: string;
  classe: string;
  classeLabel: string;
  discipline: string;
  disciplineLabel: string;
  etablissement: string;
  directionRegionale: string;
  anneeScolaire: string;
  session: string;
  duree: string;
  coefficient: number;
  dateCreation: string;
  typeEpreuve: 'complet' | 'situation_integration' | 'ressources';
  leconsCiblees: string[];
  totalPoints: number;
  
  exercices: ApcExercice[];
  situationIntegration?: ApcSituationIntegration;
  corrige: ApcCorrige;
  rawJson?: string;
}

export interface ApcGenerationParams {
  classe: string;
  discipline: string;
  typeEpreuve: 'complet' | 'situation_integration' | 'ressources';
  lecons: string[];
  instructionsSpeciales?: string;
  etablissement: string;
  anneeScolaire: string;
  session: string;
  duree: string;
  coefficient: number;
  apiKey?: string;
  model?: string;
}
