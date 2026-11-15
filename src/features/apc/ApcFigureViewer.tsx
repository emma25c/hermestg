import React from 'react';
import { ApcFigure } from '../../types/apc';
import { resolveFigureSvg } from '../../lib/figureTemplates';
import { Image as ImageIcon } from 'lucide-react';

interface ApcFigureViewerProps {
  figure?: ApcFigure;
  className?: string;
}

export const ApcFigureViewer: React.FC<ApcFigureViewerProps> = ({ figure, className = '' }) => {
  if (!figure) return null;

  const svgContent = resolveFigureSvg(figure);
  if (!svgContent) return null;

  return (
    <div className={`my-3 p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs font-sans ${className}`}>
      {/* En-tête de la figure */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <ImageIcon size={14} className="text-sky-600" />
          <span>{figure.titre || 'Figure / Document d’appui'}</span>
        </div>
        {figure.template && figure.template !== 'custom' && (
          <span className="text-[10px] font-medium bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full">
            Schéma APC Togo
          </span>
        )}
      </div>

      {/* Conteneur SVG vectoriel réactif */}
      <div
        className="w-full max-w-md mx-auto flex items-center justify-center overflow-hidden rounded-lg bg-white p-2 min-h-[140px]"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />

      {/* Légende en bas */}
      {figure.legende && (
        <p className="mt-2 text-center text-[11px] italic text-slate-500 font-sans">
          {figure.legende}
        </p>
      )}
    </div>
  );
};
