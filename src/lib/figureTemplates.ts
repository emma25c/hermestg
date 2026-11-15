import { ApcFigure } from '../types/apc';

/**
 * Bibliothèque de gabarits paramétriques SVG officiels pour les épreuves scolaires
 * APC du Togo (Mathématiques, PCT, SVT).
 *
 * Tous les gabarits génèrent du SVG vectoriel haute définition (viewBox standardisé),
 * avec fond blanc, typographie sans-serif propre et contrastes adaptés à l'impression A4.
 */

export function sanitizeSvg(svg: string): string {
  if (!svg) return '';
  // Supprime d'éventuels scripts ou handlers pour la sécurité
  return svg
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\bon\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');
}

/**
 * 1. Gabarit Géométrie : Triangle ABC avec segment sécant [MN] (Thalès / Pythagore)
 */
export function buildTriangleSvg(params: Record<string, any> = {}): string {
  const labelA = params.labelA || 'A';
  const labelB = params.labelB || 'B';
  const labelC = params.labelC || 'C';
  const labelM = params.labelM || 'M';
  const labelN = params.labelN || 'N';
  const showTransversal = params.showTransversal !== false;
  const isRightAngle = params.isRightAngle !== false;
  const coteAB = params.coteAB || '40 m';
  const coteBC = params.coteBC || '30 m';
  const coteMN = params.coteMN || '';

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 240" width="100%" height="100%">
  <rect width="500" height="240" fill="#ffffff" />
  <!-- Triangle Principal ABC (rectangle en B par défaut) -->
  <polygon points="80,190 400,190 80,40" fill="none" stroke="#1e293b" stroke-width="2.5" stroke-linejoin="round" />
  
  ${isRightAngle ? `
  <!-- Codage angle droit en B -->
  <path d="M 80,172 L 98,172 L 98,190" fill="none" stroke="#0284c7" stroke-width="2" />
  ` : ''}

  ${showTransversal ? `
  <!-- Droite sécante (MN) parallèle à (BC) -->
  <line x1="80" y1="115" x2="240" y2="115" stroke="#0284c7" stroke-width="2" stroke-dasharray="4 3" />
  <circle cx="80" cy="115" r="3.5" fill="#0284c7" />
  <circle cx="240" cy="115" r="3.5" fill="#0284c7" />
  <text x="60" y="119" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#0284c7">${labelM}</text>
  <text x="248" y="112" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#0284c7">${labelN}</text>
  ${coteMN ? `<text x="145" y="108" font-family="Arial, sans-serif" font-size="11" fill="#0284c7" text-anchor="middle">${coteMN}</text>` : ''}
  ` : ''}

  <!-- Sommets -->
  <text x="70" y="35" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#0f172a">${labelA}</text>
  <text x="65" y="208" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#0f172a">${labelB}</text>
  <text x="408" y="200" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#0f172a">${labelC}</text>

  <!-- Cotes et mesures indicatives -->
  ${coteAB ? `<text x="40" y="120" font-family="Arial, sans-serif" font-size="12" fill="#475569" text-anchor="middle" transform="rotate(-90 40,120)">${coteAB}</text>` : ''}
  ${coteBC ? `<text x="240" y="212" font-family="Arial, sans-serif" font-size="12" fill="#475569" text-anchor="middle">${coteBC}</text>` : ''}
</svg>`.trim();
}

/**
 * 2. Gabarit PCT : Circuit électrique RLC série / dérivation
 */
export function buildCircuitSvg(params: Record<string, any> = {}): string {
  const genLabel = params.genLabel || 'E';
  const switchLabel = params.switchLabel || 'K';
  const resistorLabel = params.resistorLabel || 'R';
  const comp2Label = params.comp2Label || 'C'; // ou 'L, r'
  const currentLabel = params.currentLabel || 'i(t)';

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 220" width="100%" height="100%">
  <rect width="520" height="220" fill="#ffffff" />
  
  <!-- Cadre principal du circuit -->
  <!-- Ligne haut -->
  <line x1="80" y1="40" x2="200" y2="40" stroke="#1e293b" stroke-width="2" />
  <!-- Interrupteur K -->
  <circle cx="200" cy="40" r="3" fill="#1e293b" />
  <line x1="200" y1="40" x2="235" y2="25" stroke="#1e293b" stroke-width="2.5" />
  <circle cx="240" cy="40" r="3" fill="#1e293b" />
  <text x="215" y="18" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#0284c7">${switchLabel}</text>
  <line x1="240" y1="40" x2="310" y2="40" stroke="#1e293b" stroke-width="2" />
  
  <!-- Résistor R -->
  <rect x="310" y="28" width="80" height="24" fill="#f8fafc" stroke="#1e293b" stroke-width="2" />
  <text x="350" y="44" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="middle">${resistorLabel}</text>
  <line x1="390" y1="40" x2="450" y2="40" stroke="#1e293b" stroke-width="2" />

  <!-- Ligne droite avec Composant 2 (Condensateur ou Bobine) -->
  <line x1="450" y1="40" x2="450" y2="85" stroke="#1e293b" stroke-width="2" />
  
  <!-- Condensateur (deux barres parallèles) -->
  <line x1="435" y1="85" x2="465" y2="85" stroke="#1e293b" stroke-width="2.5" />
  <line x1="435" y1="95" x2="465" y2="95" stroke="#1e293b" stroke-width="2.5" />
  <text x="475" y="94" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#0284c7">${comp2Label}</text>
  
  <line x1="450" y1="95" x2="450" y2="170" stroke="#1e293b" stroke-width="2" />

  <!-- Ligne bas -->
  <line x1="450" y1="170" x2="80" y2="170" stroke="#1e293b" stroke-width="2" />

  <!-- Ligne gauche avec Générateur E -->
  <line x1="80" y1="170" x2="80" y2="120" stroke="#1e293b" stroke-width="2" />
  <circle cx="80" cy="105" r="16" fill="#f8fafc" stroke="#1e293b" stroke-width="2" />
  <text x="80" y="110" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="middle">${genLabel}</text>
  <!-- Bornes + et - -->
  <text x="68" y="85" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#dc2626">+</text>
  <text x="69" y="140" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#475569">-</text>
  <line x1="80" y1="90" x2="80" y2="40" stroke="#1e293b" stroke-width="2" />

  <!-- Flèche de courant i(t) -->
  <line x1="120" y1="30" x2="160" y2="30" stroke="#dc2626" stroke-width="1.8" />
  <polygon points="160,26 168,30 160,34" fill="#dc2626" />
  <text x="140" y="22" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#dc2626" text-anchor="middle">${currentLabel}</text>
</svg>`.trim();
}

/**
 * 3. Gabarit PCT : Mécanique du plan incliné avec forces (P, R, f, T)
 */
export function buildInclinedPlaneSvg(params: Record<string, any> = {}): string {
  const angle = params.angle || 'α = 30°';
  const masse = params.masse || 'm';

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 230" width="100%" height="100%">
  <rect width="500" height="230" fill="#ffffff" />
  
  <!-- Sol horizontal et Plan incliné -->
  <line x1="60" y1="180" x2="430" y2="180" stroke="#475569" stroke-width="2" stroke-dasharray="3 3" />
  <polygon points="60,180 380,180 380,60" fill="#f1f5f9" stroke="#1e293b" stroke-width="2.5" />
  
  <!-- Arc d'angle alpha -->
  <path d="M 120,180 A 60 60 0 0 0 115,160" fill="none" stroke="#0284c7" stroke-width="1.8" />
  <text x="135" y="172" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#0284c7">${angle}</text>

  <!-- Sol hachuré -->
  <line x1="60" y1="185" x2="380" y2="185" stroke="#94a3b8" stroke-width="1" />

  <!-- Solide S (bloc rectangulaire tourné le long du plan de 20.5 deg) -->
  <g transform="translate(220, 120) rotate(-20.5)">
    <rect x="-25" y="-30" width="50" height="30" fill="#e2e8f0" stroke="#0f172a" stroke-width="2" />
    <text x="0" y="-10" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#0f172a" text-anchor="middle">(S) ${masse}</text>
    
    <!-- Centre d'inertie G -->
    <circle cx="0" cy="-15" r="2.5" fill="#dc2626" />
    <text x="-12" y="-15" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#dc2626">G</text>

    <!-- Vecteur Réaction normale R -->
    <line x1="0" y1="-15" x2="0" y2="-65" stroke="#0284c7" stroke-width="2" />
    <polygon points="-4,-65 0,-73 4,-65" fill="#0284c7" />
    <text x="8" y="-62" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#0284c7">R</text>

    <!-- Vecteur Frottement f vers l'arrière -->
    <line x1="0" y1="0" x2="-40" y2="0" stroke="#e11d48" stroke-width="1.8" />
    <polygon points="-40,-3 -48,0 -40,3" fill="#e11d48" />
    <text x="-42" y="16" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#e11d48">f</text>
  </g>

  <!-- Vecteur Poids P vertical vers le bas depuis G (environ x=225, y=110) -->
  <line x1="225" y1="110" x2="225" y2="185" stroke="#16a34a" stroke-width="2.2" />
  <polygon points="221,185 225,193 229,185" fill="#16a34a" />
  <text x="233" y="160" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#16a34a">P</text>
</svg>`.trim();
}

/**
 * 4. Gabarit SVT : Pédigrée génétique (Arbre généalogique officiel APC)
 */
export function buildPedigreeSvg(params: Record<string, any> = {}): string {
  const maladie = params.maladie || 'Transmission de la drépanocytose';
  // États : 'sain', 'atteint', 'porteur'
  const i1 = params.i1 || 'sain'; // Père I-1 (carré)
  const i2 = params.i2 || 'porteur'; // Mère I-2 (rond)
  const ii1 = params.ii1 || 'porteur'; // Garçon II-1
  const ii2 = params.ii2 || 'atteint'; // Fille II-2
  const ii3 = params.ii3 || 'sain'; // Garçon II-3

  const getFill = (state: string) => {
    if (state === 'atteint') return '#0f172a'; // Tout noir
    if (state === 'porteur') return 'url(#stripes)'; // Hachuré / porteur
    return '#ffffff'; // Blanc sain
  };

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 240" width="100%" height="100%">
  <defs>
    <pattern id="stripes" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="0" y2="6" stroke="#475569" stroke-width="2.5" />
    </pattern>
  </defs>
  <rect width="500" height="240" fill="#ffffff" />

  <!-- Titre de l'arbre généalogique -->
  <text x="250" y="22" font-family="Arial, sans-serif" font-size="12" font-style="italic" fill="#334155" text-anchor="middle">${maladie}</text>

  <!-- Génération I -->
  <text x="35" y="65" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#0284c7">I</text>
  
  <!-- Individu I-1 (Homme : Carré) -->
  <rect x="160" y="45" width="30" height="30" fill="${getFill(i1)}" stroke="#1e293b" stroke-width="2" />
  <text x="175" y="90" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#334155" text-anchor="middle">1</text>
  
  <!-- Ligne de mariage I-1 et I-2 -->
  <line x1="190" y1="60" x2="290" y2="60" stroke="#1e293b" stroke-width="2" />
  
  <!-- Individu I-2 (Femme : Rond) -->
  <circle cx="305" cy="60" r="15" fill="${getFill(i2)}" stroke="#1e293b" stroke-width="2" />
  <text x="305" y="90" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#334155" text-anchor="middle">2</text>

  <!-- Descendance vers Génération II -->
  <line x1="240" y1="60" x2="240" y2="120" stroke="#1e293b" stroke-width="2" />
  <line x1="120" y1="120" x2="360" y2="120" stroke="#1e293b" stroke-width="2" />

  <!-- Génération II -->
  <text x="35" y="155" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#0284c7">II</text>

  <!-- Enfant II-1 (Homme : Carré) -->
  <line x1="120" y1="120" x2="120" y2="140" stroke="#1e293b" stroke-width="2" />
  <rect x="105" y="140" width="30" height="30" fill="${getFill(ii1)}" stroke="#1e293b" stroke-width="2" />
  <text x="120" y="185" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#334155" text-anchor="middle">1</text>

  <!-- Enfant II-2 (Femme : Rond) -->
  <line x1="240" y1="120" x2="240" y2="140" stroke="#1e293b" stroke-width="2" />
  <circle cx="240" cy="155" r="15" fill="${getFill(ii2)}" stroke="#1e293b" stroke-width="2" />
  <text x="240" y="185" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#334155" text-anchor="middle">2</text>

  <!-- Enfant II-3 (Homme : Carré) -->
  <line x1="360" y1="120" x2="360" y2="140" stroke="#1e293b" stroke-width="2" />
  <rect x="345" y="140" width="30" height="30" fill="${getFill(ii3)}" stroke="#1e293b" stroke-width="2" />
  <text x="360" y="185" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#334155" text-anchor="middle">3</text>

  <!-- Légende en bas -->
  <g transform="translate(90, 205)">
    <rect x="0" y="0" width="16" height="16" fill="#ffffff" stroke="#1e293b" stroke-width="1.5" />
    <text x="22" y="12" font-family="Arial, sans-serif" font-size="10" fill="#475569">Individu sain</text>

    <rect x="110" y="0" width="16" height="16" fill="url(#stripes)" stroke="#1e293b" stroke-width="1.5" />
    <text x="132" y="12" font-family="Arial, sans-serif" font-size="10" fill="#475569">Porteur sain (AS)</text>

    <rect x="240" y="0" width="16" height="16" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
    <text x="262" y="12" font-family="Arial, sans-serif" font-size="10" fill="#475569">Individu malade (SS)</text>
  </g>
</svg>`.trim();
}

/**
 * 5. Gabarit Maths / PCT : Repère cartésien orthonormé (O, i, j) avec courbe/points
 */
export function buildCartesianGridSvg(params: Record<string, any> = {}): string {
  const xLabel = params.xLabel || 'x';
  const yLabel = params.yLabel || 'y = f(x)';
  const curveType = params.curveType || 'parabola'; // 'line', 'parabola', 'sine'

  let curvePath = '';
  if (curveType === 'line') {
    curvePath = 'M 60,180 L 440,50';
  } else if (curveType === 'sine') {
    curvePath = 'M 60,120 Q 155,30 250,120 T 440,120';
  } else {
    // Parabole
    curvePath = 'M 90,50 Q 250,210 410,50';
  }

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 240" width="100%" height="100%">
  <rect width="500" height="240" fill="#ffffff" />

  <!-- Quadrillage fin -->
  <g stroke="#e2e8f0" stroke-width="1">
    ${Array.from({ length: 9 }).map((_, i) => `<line x1="${50 + i * 45}" y1="20" x2="${50 + i * 45}" y2="220" />`).join('')}
    ${Array.from({ length: 5 }).map((_, i) => `<line x1="50" y1="${20 + i * 45}" x2="410" y2="${20 + i * 45}" />`).join('')}
  </g>

  <!-- Axe des abscisses (Ox) -->
  <line x1="40" y1="120" x2="440" y2="120" stroke="#1e293b" stroke-width="2" />
  <polygon points="440,116 448,120 440,124" fill="#1e293b" />
  <text x="442" y="140" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#1e293b">${xLabel}</text>

  <!-- Axe des ordonnées (Oy) -->
  <line x1="230" y1="230" x2="230" y2="15" stroke="#1e293b" stroke-width="2" />
  <polygon points="226,15 230,7 234,15" fill="#1e293b" />
  <text x="240" y="20" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#1e293b">${yLabel}</text>

  <!-- Origine O et vecteurs i, j -->
  <text x="215" y="136" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#64748b">O</text>
  <line x1="230" y1="120" x2="275" y2="120" stroke="#0284c7" stroke-width="2.5" />
  <polygon points="275,117 282,120 275,123" fill="#0284c7" />
  <text x="250" y="112" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#0284c7">i</text>

  <line x1="230" y1="120" x2="230" y2="75" stroke="#0284c7" stroke-width="2.5" />
  <polygon points="227,75 230,68 233,75" fill="#0284c7" />
  <text x="218" y="95" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#0284c7">j</text>

  <!-- Courbe représentative -->
  <path d="${curvePath}" fill="none" stroke="#dc2626" stroke-width="2.2" stroke-linecap="round" />
  <text x="390" y="42" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#dc2626">(C)</text>
</svg>`.trim();
}

/**
 * 6. Gabarit PCT Chimie : Dispositif de titrage / dosage acido-basique
 */
export function buildTitrationSvg(params: Record<string, any> = {}): string {
  const titrant = params.titrant || 'Solution titrante (ex: NaOH)';
  const titre = params.titre || 'Solution titrée (ex: HCl + BBT)';

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 250" width="100%" height="100%">
  <rect width="500" height="250" fill="#ffffff" />

  <!-- Potence / Support vertical -->
  <rect x="80" y="225" width="120" height="10" fill="#475569" rx="2" />
  <line x1="120" y1="225" x2="120" y2="20" stroke="#475569" stroke-width="5" />
  
  <!-- Pinces de fixation -->
  <line x1="120" y1="50" x2="200" y2="50" stroke="#64748b" stroke-width="3" />
  <rect x="195" y="45" width="12" height="10" fill="#334155" />

  <!-- Burette graduée -->
  <rect x="200" y="30" width="16" height="120" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.8" />
  ${Array.from({ length: 8 }).map((_, i) => `<line x1="200" y1="${45 + i * 12}" x2="206" y2="${45 + i * 12}" stroke="#0284c7" stroke-width="1" />`).join('')}
  
  <!-- Robinet burette -->
  <polygon points="208,150 204,165 212,165" fill="#0284c7" />
  <circle cx="208" cy="158" r="4" fill="#dc2626" />
  <line x1="208" y1="165" x2="208" y2="175" stroke="#0284c7" stroke-width="2" />

  <!-- Bécher avec solution titrée -->
  <path d="M 180,180 L 185,225 Q 185,230 190,230 L 226,230 Q 231,230 231,225 L 236,180" fill="#fef08a" stroke="#0f172a" stroke-width="2" />
  <!-- Niveau de liquide -->
  <line x1="184" y1="195" x2="232" y2="195" stroke="#ca8a04" stroke-width="1.5" />
  
  <!-- Barreau aimanté dans le bécher -->
  <rect x="202" y="222" width="12" height="5" rx="2" fill="#475569" />

  <!-- Agitateur magnétique sous le bécher -->
  <rect x="165" y="230" width="86" height="12" fill="#cbd5e1" stroke="#475569" stroke-width="1.5" rx="2" />
  <text x="208" y="239" font-family="Arial, sans-serif" font-size="8" fill="#475569" text-anchor="middle">Agitateur</text>

  <!-- Flèches et Légendes -->
  <line x1="220" y1="65" x2="290" y2="65" stroke="#0284c7" stroke-width="1.2" stroke-dasharray="2 2" />
  <text x="295" y="69" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#0284c7">Burette graduée</text>
  <text x="295" y="85" font-family="Arial, sans-serif" font-size="11" fill="#475569">${titrant}</text>

  <line x1="240" y1="205" x2="290" y2="205" stroke="#0f172a" stroke-width="1.2" stroke-dasharray="2 2" />
  <text x="295" y="209" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#0f172a">Bécher</text>
  <text x="295" y="223" font-family="Arial, sans-serif" font-size="11" fill="#475569">${titre}</text>
</svg>`.trim();
}

/**
 * Moteur Hybride : Résout et retourne le SVG final
 * 1. Si figure.svgContent est fourni et valide, l'assainit et l'utilise (Option A - IA).
 * 2. Si figure.template est fourni, compile le gabarit officiel paramétré (Option B - Gabarits).
 * 3. En cas d'échec ou d'absence, génère une boîte technique minimale informative.
 */
export function resolveFigureSvg(figure?: ApcFigure): string {
  if (!figure) return '';

  // 1. Option A prioritaire si du SVG valide est fourni par l'IA
  if (figure.svgContent && figure.svgContent.trim().includes('<svg')) {
    return sanitizeSvg(figure.svgContent.trim());
  }

  // 2. Option B : Gabarit paramétrique
  const params = figure.params || {};
  switch (figure.template) {
    case 'geometry_triangle':
      return buildTriangleSvg(params);
    case 'circuit_rlc':
      return buildCircuitSvg(params);
    case 'mechanics_inclined_plane':
      return buildInclinedPlaneSvg(params);
    case 'genetics_pedigree':
      return buildPedigreeSvg(params);
    case 'cartesian_grid':
      return buildCartesianGridSvg(params);
    case 'chemistry_titration':
      return buildTitrationSvg(params);
    default:
      // Si svgContent brut sans balise <svg>, l'envelopper
      if (figure.svgContent && figure.svgContent.trim().length > 10) {
        return sanitizeSvg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200" width="100%" height="100%">
  <rect width="500" height="200" fill="#ffffff" />
  ${figure.svgContent}
</svg>`.trim());
      }
      return '';
  }
}
