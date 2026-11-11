import React, { useState } from 'react';
import { FileDown, UploadCloud, CheckCircle2, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { compressDocumentToPdf, CompressResult } from './compressEngine';

export const DocumentCompressor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [enableAdminFilter, setEnableAdminFilter] = useState(true);
  const targetKb = 480;
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<CompressResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleCompress = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const res = await compressDocumentToPdf(file, {
        targetMaxKb: targetKb,
        enableAdminFilter,
        dpi: 150
      });
      setResult(res);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la compression');
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
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
          <ShieldCheck size={22} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Compresseur Garanti &lt; 500 Ko</h2>
          <p className="text-xs text-slate-500">Pour concours, bourses et dépôts administratifs au Togo • 0 data consommé</p>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-600 mb-2">
          Sélectionnez la photo de votre document (CNI, Acte, Diplôme, Attestation)
        </label>
        <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div className="flex flex-col items-center justify-center gap-2">
            <UploadCloud size={32} className="text-emerald-600" />
            {file ? (
              <div>
                <p className="text-sm font-bold text-slate-800">{file.name}</p>
                <p className="text-xs text-emerald-600 font-medium">Taille d'origine : {formatSize(file.size)}</p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-semibold text-slate-700">Touchez ici pour choisir une photo</p>
                <p className="text-[11px] text-slate-400">Prend en charge photos de smartphones lourdes (5 Mo - 15 Mo)</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-3.5 mb-4 border border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" /> Mode Scan Administratif (N&amp;B Net)
            </span>
            <p className="text-[11px] text-slate-500">Nettoie les ombres du smartphone et renforce la lisibilité du texte</p>
          </div>
          <input
            type="checkbox"
            checked={enableAdminFilter}
            onChange={(e) => setEnableAdminFilter(e.target.checked)}
            className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
          <span className="font-semibold text-slate-700">Taille cible maximale :</span>
          <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
            Strictement &le; {targetKb} Ko
          </span>
        </div>
      </div>

      <button
        type="button"
        disabled={!file || isProcessing}
        onClick={handleCompress}
        className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
          !file || isProcessing
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
            : 'bg-emerald-700 text-white hover:bg-emerald-800 active:scale-[0.99]'
        }`}
      >
        {isProcessing ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Compression en cours (boucle locale)...
          </>
        ) : (
          <>
            <FileDown size={18} /> Compresser et Exporter en PDF A4
          </>
        )}
      </button>

      {error && (
        <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-lg text-xs">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <span>Fichier compressé avec succès sous la limite !</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-lg border border-emerald-100">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Avant</span>
              <span className="font-semibold text-slate-700 line-through">
                {formatSize(result.originalSizeBytes)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Après (PDF Final)</span>
              <span className="font-black text-emerald-600 text-sm">
                {formatSize(result.compressedSizeBytes)}
              </span>
            </div>
          </div>

          <a
            href={result.pdfUrl}
            download={result.fileName}
            className="w-full bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-lg shadow text-center block text-xs hover:bg-emerald-700 transition-colors"
          >
            Télécharger le PDF A4 ({formatSize(result.compressedSizeBytes)})
          </a>
        </div>
      )}
    </div>
  );
};
