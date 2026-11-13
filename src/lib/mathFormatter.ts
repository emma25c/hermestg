import { ApcExam, ApcExercice, ApcSituationIntegration, ApcCorrige } from '../types/apc';

/**
 * Mappe des exposants Unicode pour la conversion typographique propre (x^2 -> x², 10^-3 -> 10⁻³).
 */
const SUPERSCRIPT_MAP: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', 'n': 'ⁿ', 'x': 'ˣ', 't': 'ᵗ'
};

const REV_SUPERSCRIPT_MAP: Record<string, string> = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
  '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
  '⁺': '+', '⁻': '-', 'ⁿ': 'n', 'ˣ': 'x', 'ᵗ': 't'
};

/**
 * Mappe des indices Unicode pour les suites et grandeurs (u_n -> uₙ, v_0 -> v₀, u_{n+1} -> uₙ₊₁).
 */
const SUBSCRIPT_MAP: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  'n': 'ₙ', 'i': 'ᵢ', 'j': 'ⱼ', '+': '₊', '-': '₋'
};

const REV_SUBSCRIPT_MAP: Record<string, string> = {
  '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
  '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
  'ₙ': 'n', 'ᵢ': 'i', 'ⱼ': 'j', '₊': '+', '₋': '-'
};

/**
 * Nettoie et formate les notations mathématiques brutes ou informatiques (ASCII/LaTeX)
 * en typographie académique officielle francophone (Togo / UEMOA) pour l'affichage Web et presse-papier :
 * - `*` mathématique -> `×` (sans toucher aux mots français en italique *mot*)
 * - `sqrt(...)` ou `\sqrt{...}` -> `√(...)`
 * - `[*, sqrt, /]` -> `[×, √, ÷]`
 * - `x^2`, `10^-3` -> `x²`, `10⁻³`
 * - `u_{n+1}`, `u_n`, `v_0` -> `uₙ₊₁`, `uₙ`, `v₀`
 * - `<=>`, `<=`, `>=`, `!=` -> `⇔`, `≤`, `≥`, `≠` (ordre composite strict)
 * - `\times`, `\div`, `\pm`, `\pi`, etc. -> symboles Unicode correspondants
 */
export function formatMathSymbols(str: string): string {
  if (!str || typeof str !== 'string') return str || '';

  let s = str;

  // 1. Détection et nettoyage spécifique des artefacts d'opérateurs [*, sqrt, /]
  s = s.replace(/\[\s*\*\s*,\s*sqrt\s*,\s*\/\s*\]/gi, '[×, √, ÷]');
  s = s.replace(/\[\s*\*\s*,\s*\/\s*\]/g, '[×, ÷]');
  s = s.replace(/\(\s*\*\s*,\s*sqrt\s*,\s*\/\s*\)/gi, '(×, √, ÷)');

  // 2. Commandes LaTeX avec antislash obligatoire (évite les collisions avec mots français comme "le", "in", etc.)
  s = s.replace(/\\times\b/g, '×');
  s = s.replace(/\\div\b/g, '÷');
  s = s.replace(/\\cdot\b/g, '·');
  s = s.replace(/\\pm\b/g, '±');
  s = s.replace(/\\leq?\b/g, '≤');
  s = s.replace(/\\geq?\b/g, '≥');
  s = s.replace(/\\neq?\b/g, '≠');
  s = s.replace(/\\approx\b/g, '≈');
  s = s.replace(/\\infty\b/g, '∞');
  s = s.replace(/\\pi\b/g, 'π');
  s = s.replace(/\\Delta\b/g, 'Δ');
  s = s.replace(/\\alpha\b/g, 'α');
  s = s.replace(/\\beta\b/g, 'β');
  s = s.replace(/\\gamma\b/g, 'γ');
  s = s.replace(/\\theta\b/g, 'θ');
  s = s.replace(/\\lambda\b/g, 'λ');
  s = s.replace(/\\mu\b/g, 'μ');
  s = s.replace(/\\omega\b/g, 'ω');
  s = s.replace(/\\Omega\b/g, 'Ω');
  s = s.replace(/\\in\b/g, '∈');
  s = s.replace(/\\notin\b/g, '∉');
  s = s.replace(/\\subset\b/g, '⊂');
  s = s.replace(/\\cup\b/g, '∪');
  s = s.replace(/\\cap\b/g, '∩');
  s = s.replace(/\\emptyset\b/g, '∅');
  s = s.replace(/\\degree\b/g, '°');
  s = s.replace(/\^\\circ\b/g, '°');
  s = s.replace(/\^\{\\circ\}/g, '°');

  // Fractions LaTeX avec support d'accolades imbriquées
  s = s.replace(/\\frac\{((?:[^{}]|\{[^{}]*\})+)\}\{((?:[^{}]|\{[^{}]*\})+)\}/g, '($1)/($2)');

  // Racines LaTeX
  s = s.replace(/\\sqrt\{([^{}]+)\}/g, '√($1)');
  s = s.replace(/\\sqrt\s*([0-9a-zA-Z]+)/g, '√$1');

  // Vecteurs LaTeX
  s = s.replace(/\\vec\{([^{}]+)\}/g, 'vect($1)');

  // 3. Notations informatiques courantes pour les racines carrées
  s = s.replace(/\bsqrt\s*\(([^()]+)\)/gi, '√($1)');
  s = s.replace(/\bsqrt\s*\{([^{}]+)\}/gi, '√($1)');
  s = s.replace(/\bsqrt\s+([0-9]+)\b/gi, '√$1');

  // 4. Inégalités et relations informatiques : ordre composite strict (<=> avant <=, etc.)
  s = s.replace(/<=>/g, '⇔');
  s = s.replace(/=>/g, '⇒');
  s = s.replace(/->/g, '→');
  s = s.replace(/<=/g, '≤');
  s = s.replace(/>=/g, '≥');
  s = s.replace(/!=/g, '≠');
  s = s.replace(/\+\/-/g, '±');

  // 5. Exposants et puissances : accolades couplées obligatoires
  s = s.replace(/\^\{([0-9n+\-xt]+)\}/g, (_match, exp) =>
    exp.split('').map((c: string) => SUPERSCRIPT_MAP[c] || c).join('')
  );
  s = s.replace(/\^([+\-]?[0-9n+\-xt]+)/g, (_match, exp) =>
    exp.split('').map((c: string) => SUPERSCRIPT_MAP[c] || c).join('')
  );

  // 6. Indices avec accolades couplées (u_{n+1} -> uₙ₊₁, v_0 -> v₀)
  s = s.replace(/([a-zA-Z])_\{([0-9nij+\-]+)\}/g, (_match, letter, sub) =>
    letter + sub.split('').map((c: string) => SUBSCRIPT_MAP[c] || c).join('')
  );
  s = s.replace(/([a-zA-Z])_([0-9nij])/g, (_match, letter, sub) =>
    letter + (SUBSCRIPT_MAP[sub] || sub)
  );

  // 7. Multiplication * : remplacement par le symbole typographique officiel `×`
  // S'applique uniquement entre chiffres, parenthèses ou variables isolées.
  // Ne touche JAMAIS aux mots en italique markdown (*mot*) ni au gras (**mot**).
  s = s.replace(/(?<=[\d²³¹⁰-⁹\)\]])\s*\*\s*(?=[\d\(\[√a-zA-Z])/g, ' × ');
  s = s.replace(/(?<=\b[a-zA-Z])\s*\*\s*(?=[\d\(\[√])/g, ' × ');
  s = s.replace(/(?<=\b[a-zA-Z])\s*\*\s*(?=[a-zA-Z]\b)/g, ' × ');

  // 8. Divisions numériques évidentes avec espaces : ex: '120 / 2 = 60' -> '120 ÷ 2 = 60'
  s = s.replace(/(\b\d+(?:,\d+)?)\s*\/\s*(\d+(?:,\d+)?)\s*=/g, '$1 ÷ $2 =');

  return s;
}

/**
 * Prépare une chaîne de caractères pour l'export PDF jsPDF sous police standard Helvetica.
 * Conserve les caractères 100% compatibles Windows-1252 (×, ÷, ², ³, ¹, ±, °, µ, •, «, »)
 * et translitère de manière académique et lisible les glyphes hors Windows-1252
 * afin d'éviter toute corruption visuelle ("d, "e, ", ™, etc.) dans les lecteurs PDF.
 */
export function formatMathForPdf(str: string): string {
  if (!str || typeof str !== 'string') return str || '';

  // 1. Appliquer le formatage typographique riche
  let s = formatMathSymbols(str);

  // 2. Translitérations sécurisées pour jsPDF Helvetica (Windows-1252)

  // Artefacts de liste
  s = s.replace(/\[\s*×\s*,\s*√\s*,\s*÷\s*\]/g, '[×, racine, ÷]');

  // Racines carrées : Helvetica ne possédant pas le glyphe √, on écrit lisiblement racine(...)
  s = s.replace(/√\(([^()]+)\)/g, 'racine($1)');
  s = s.replace(/√([0-9a-zA-Z]+)/g, 'racine($1)');
  s = s.replace(/√/g, 'racine');

  // Inégalités et relations : formes conventionnelles universelles
  s = s.replace(/≤/g, '<=');
  s = s.replace(/≥/g, '>=');
  s = s.replace(/≠/g, '!=');
  s = s.replace(/⇔/g, '<=>');
  s = s.replace(/⇒/g, '=>');
  s = s.replace(/→/g, '->');
  s = s.replace(/≈/g, '~=');

  // Exposants : ² et ³ et ¹ sont supportés nativement par Windows-1252 / Helvetica.
  // Tout autre exposant (4 à 9, négatif, lettre) est translitéré en ^(...)
  s = s.replace(/([⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿˣᵗ]+)/g, (match: string) => {
    if (match === '²' || match === '³' || match === '¹') return match;
    const inner = match.split('').map((c: string) => REV_SUPERSCRIPT_MAP[c] || c).join('');
    return '^(' + inner + ')';
  });

  // Indices : uₙ -> u_n, uₙ₊₁ -> u_(n+1), v₀ -> v_0
  s = s.replace(/([a-zA-Z])([₀₁₂₃₄₅₆₇₈₉ₙᵢⱼ₊₋]+)/g, (_m: string, letter: string, group: string) => {
    const inner = group.split('').map((c: string) => REV_SUBSCRIPT_MAP[c] || c).join('');
    return `${letter}_${inner.length > 1 ? '(' + inner + ')' : inner}`;
  });

  // Lettres grecques et symboles hors Windows-1252
  s = s.replace(/π/g, 'pi');
  s = s.replace(/Δ/g, 'Delta');
  s = s.replace(/α/g, 'alpha');
  s = s.replace(/β/g, 'beta');
  s = s.replace(/γ/g, 'gamma');
  s = s.replace(/θ/g, 'theta');
  s = s.replace(/λ/g, 'lambda');
  s = s.replace(/Ω/g, 'Omega');
  s = s.replace(/ω/g, 'omega');
  s = s.replace(/∈/g, ' in ');
  s = s.replace(/∉/g, ' not in ');
  s = s.replace(/⊂/g, ' inclus dans ');
  s = s.replace(/∪/g, ' union ');
  s = s.replace(/∩/g, ' inter ');
  s = s.replace(/∞/g, 'infini');

  return s;
}

/**
 * Applique le formatage mathématique typographique riche à l'ensemble d'une épreuve APC
 * pour le Web, le localStorage et le presse-papier.
 */
export function formatApcExamMath(exam: ApcExam): ApcExam {
  return transformExam(exam, formatMathSymbols);
}

/**
 * Applique le formatage mathématique sécurisé pour la génération PDF jsPDF.
 */
export function formatApcExamForPdf(exam: ApcExam): ApcExam {
  return transformExam(exam, formatMathForPdf);
}

function transformExam(exam: ApcExam, formatter: (s: string) => string): ApcExam {
  if (!exam) return exam;

  const formattedExercices: ApcExercice[] = (exam.exercices || []).map(exo => ({
    ...exo,
    titre: formatter(exo.titre || ''),
    intro: exo.intro ? formatter(exo.intro) : undefined,
    questions: (exo.questions || []).map(q => ({
      ...q,
      enonce: formatter(q.enonce || ''),
      choix: q.choix ? q.choix.map(ch => formatter(ch || '')) : undefined
    }))
  }));

  let formattedSituation: ApcSituationIntegration | undefined = undefined;
  if (exam.situationIntegration) {
    const sit = exam.situationIntegration;
    formattedSituation = {
      ...sit,
      titre: formatter(sit.titre || ''),
      contexte: formatter(sit.contexte || ''),
      donnees: sit.donnees ? formatter(sit.donnees) : undefined,
      consignes: (sit.consignes || []).map(c => ({
        ...c,
        enonce: formatter(c.enonce || '')
      })),
      grilleCorrection: (sit.grilleCorrection || []).map(g => ({
        ...g,
        critere: formatter(g.critere || ''),
        indicateurs: formatter(g.indicateurs || '')
      }))
    };
  }

  let formattedCorrige: ApcCorrige = {
    exerciceCorriges: []
  };

  if (exam.corrige) {
    formattedCorrige = {
      exerciceCorriges: (exam.corrige.exerciceCorriges || []).map(exC => ({
        ...exC,
        titre: formatter(exC.titre || ''),
        reponses: (exC.reponses || []).map(r => ({
          ...r,
          item: formatter(r.item || ''),
          reponse: formatter(r.reponse || '')
        }))
      })),
      situationCorrigee: exam.corrige.situationCorrigee ? {
        consigne1Corrige: formatter(exam.corrige.situationCorrigee.consigne1Corrige || ''),
        consigne2Corrige: exam.corrige.situationCorrigee.consigne2Corrige
          ? formatter(exam.corrige.situationCorrigee.consigne2Corrige)
          : undefined,
        baremeDetaille: formatter(exam.corrige.situationCorrigee.baremeDetaille || '')
      } : undefined
    };
  }

  return {
    ...exam,
    titre: formatter(exam.titre || ''),
    exercices: formattedExercices,
    situationIntegration: formattedSituation,
    corrige: formattedCorrige
  };
}
