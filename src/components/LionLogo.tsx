import React from 'react';

interface LionLogoProps {
  className?: string;
  size?: number;
}

/**
 * 🦁 Djanta — Le Lion Rugissant du Togo
 * Logo vectoriel géométrique moderne : crinière royale, mâchoire rugissante et regard d'aigle.
 */
export const LionLogo: React.FC<LionLogoProps> = ({ className = 'w-9 h-9', size = 36 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Djanta Hub - Lion Rugissant"
    >
      <defs>
        <linearGradient id="djantaGold" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        <linearGradient id="djantaMane" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
      </defs>

      {/* Fond blason stylisé hexagonal / rond */}
      <rect width="100" height="100" rx="24" fill="url(#djantaMane)" />

      {/* Crinière chisée et facettes du lion */}
      <path
        d="M22 28L34 18L44 26L38 36L22 28Z"
        fill="url(#djantaGold)"
        fillOpacity="0.85"
      />
      <path
        d="M18 42L32 38L30 52L16 48L18 42Z"
        fill="url(#djantaGold)"
        fillOpacity="0.7"
      />
      <path
        d="M20 58L34 56L30 70L22 66L20 58Z"
        fill="url(#djantaGold)"
        fillOpacity="0.6"
      />

      {/* Sommet du crâne et crinière haute */}
      <path
        d="M34 18L52 14L58 24L44 26L34 18Z"
        fill="url(#djantaGold)"
      />
      <path
        d="M52 14L70 20L66 32L58 24L52 14Z"
        fill="url(#djantaGold)"
        fillOpacity="0.9"
      />

      {/* Museau et front du lion */}
      <path
        d="M44 26L58 24L68 36L56 42L44 26Z"
        fill="url(#djantaGold)"
      />
      <path
        d="M68 36L82 40L76 50L64 46L68 36Z"
        fill="url(#djantaGold)"
      />

      {/* Œil perçant et arcade sourcilière */}
      <polygon points="56,33 63,35 59,38" fill="#0F172A" />
      <circle cx="58.5" cy="35.5" r="1.5" fill="#FEF3C7" />

      {/* Nez */}
      <polygon points="80,41 84,45 78,47" fill="#0F172A" />

      {/* Mâchoire supérieure rugissante (croc) */}
      <path
        d="M74 50L84 52L72 58L68 52L74 50Z"
        fill="url(#djantaGold)"
      />
      {/* Croc supérieur aiguisé */}
      <polygon points="76,51 78,56 74,54" fill="#FFFFFF" />

      {/* Gueule ouverte rugissante (intérieur sombre et puissant) */}
      <path
        d="M66 52L76 54L68 64L58 58L66 52Z"
        fill="#7F1D1D"
      />

      {/* Croc inférieur acéré */}
      <polygon points="70,61 72,56 68,59" fill="#FFFFFF" />

      {/* Mâchoire inférieure ouverte rugissante */}
      <path
        d="M68 64L76 66L66 74L56 70L68 64Z"
        fill="url(#djantaGold)"
      />

      {/* Menton et barbe royale */}
      <path
        d="M56 70L66 74L54 84L46 76L56 70Z"
        fill="url(#djantaGold)"
        fillOpacity="0.8"
      />

      {/* Touche lumière dorée sur la tempe */}
      <circle cx="70" cy="28" r="1.5" fill="#FEF3C7" />
    </svg>
  );
};
