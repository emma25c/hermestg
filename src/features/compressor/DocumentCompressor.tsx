import React, { useState } from 'react';
import { FileDown, UploadCloud, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { compressDocumentToPdf, CompressResult } from './compressEngine';

const PORTAL_PRESETS = [
  { name: 'Fonction Publique & ENA Togo', maxKb: 470, desc: 'Plafond strict de 500 Ko imposé par le portail du ministère' },
  { name: 'Bourses Nationales DBA Togo', maxKb: 470, desc: 'Direction des Bourses et Stages de Lomé' },
  { name: 'Campus France & Visas', maxKb: 950, desc: 'Dossier d’études sous 1 Mo' }
];

export const DocumentCompressor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [enableAdminFilter, setEnableAdminFilter] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState(PORTAL_PRESETS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<CompressResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setResult(null);
      setError(null);

      const reader = new FileReader();
      reader.onload = (ev) => setPreviewSrc(ev.target?.result as string);
      reader.readAsDataURL(selected);
    }
  };

  const handleCompress = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const res = await compressDocumentToPdf(file, {
        targetMaxKb: selectedPreset.maxKb,
        enableAdminFilter,
        dpi: 150
      });
      setResult(res);
      // Haptic feedback sur smartphone
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([20, 50, 20]);
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la compression du fichier.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(2) + ' Mo';
    }
    return (bytes / 1024).toFixed(1) + ' Ko';
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Compresseur Garanti Démarches Togo</h2>
          <p className="text-xs text-slate-500 mt-0.5">Réduit vos photos de diplômes, CNI et actes d'état civil sans flouter les cachets ni les textes.</p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400">Guichets :</span>
          {PORTAL_PRESETS.map((pr) => (
            <button
              key={pr.name}
              onClick={() => setSelectedPreset(pr)}
              className={`px-2.5 py-1 text-[11px] rounded-lg border transition-all ${
                selectedPreset.name === pr.name
                  ? 'border-emerald-700 bg-emerald-50 text-emerald-800 font-semibold'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
            >
              {pr.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Colonne upload & réglages (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <UploadCloud size={30} className="text-slate-400" />
              {file ? (
                <div>
                  <p className="text-xs font-bold text-slate-900 truncate max-w-xs">{file.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Poids capturé : <span className="font-semibold tabular-nums text-slate-800">{formatSize(file.size)}</span></p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-slate-800">Prenez ou choisissez la photo du document</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Compatible photos lourdes 50 MP (Infinix, Tecno, Redmi, Samsung)</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-900 block">Filtre Scan Noir &amp; Blanc contrasté</span>
                <span className="text-[11px] text-slate-500">Blanchit le fond papier et renforce les écritures pour éliminer les ombres de la pièce</span>
              </div>
              <input
                type="checkbox"
                checked={enableAdminFilter}
                onChange={(e) => setEnableAdminFilter(e.target.checked)}
                className="w-4 h-4 text-emerald-700 rounded focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="pt-2 border-t border-slate-200 text-xs flex items-center justify-between">
              <span className="text-slate-600">Norme ciblée :</span>
              <span className="font-bold text-emerald-800 tabular-nums bg-emerald-100/70 px-2 py-0.5 rounded text-[11px]">
                Garanti &le; {selectedPreset.maxKb} Ko
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={!file || isProcessing}
            onClick={handleCompress}
            className={`w-full py-3 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
              !file || isProcessing
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.99] shadow-xs'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Analyse des pixels et boucle de compression...
              </>
            ) : (
              <>
                <FileDown size={15} /> Compresser et Calibrer en PDF A4
              </>
            )}
          </button>

          {error && (
            <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs border border-red-200">
              {error}
            </div>
          )}

          {result && (
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <CheckCircle2 size={16} className="text-emerald-700" />
                <span>Norme validée ! Le document pèse moins de {selectedPreset.maxKb} Ko.</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-lg border border-emerald-200/80 tabular-nums">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Taille Photo Initiale</span>
                  <span className="font-semibold text-slate-500 line-through">{formatSize(result.originalSizeBytes)}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Taille Finale PDF A4</span>
                  <span className="font-bold text-emerald-700">{formatSize(result.compressedSizeBytes)}</span>
                </div>
              </div>

              <a
                href={result.pdfUrl}
                download={result.fileName}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-4 rounded-lg text-xs text-center block transition-colors shadow-xs"
              >
                Télécharger le PDF A4 ({formatSize(result.compressedSizeBytes)})
              </a>
            </div>
          )}
        </div>

        {/* Colonne prévisualisation du document (5 cols) */}
        <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Feuille A4 calibrée</span>
              <span>150 DPI</span>
            </div>

            <div className="mt-3 aspect-[1/1.414] bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex items-center justify-center relative">
              {previewSrc ? (
                <img
                  src={previewSrc}
                  alt="Aperçu du document"
                  className={`w-full h-full object-contain p-2 transition-all ${
                    enableAdminFilter ? 'grayscale contrast-125' : ''
                  }`}
                />
              ) : (
                <div className="text-center p-6 text-slate-300">
                  <ShieldCheck size={36} className="mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-medium">L'aperçu de votre document apparaîtra ici avec le filtre administratif appliqué.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
            <ShieldCheck size={14} className="text-emerald-600 shrink-0 mt-0.5" />
            <p>Le traitement s'effectue directement sur votre appareil sans téléversement sur serveur.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
