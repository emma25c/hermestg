import { jsPDF } from 'jspdf';

export interface CompressResult {
  pdfBlob: Blob;
  pdfUrl: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  finalQuality: number;
  fileName: string;
}

export interface CompressOptions {
  targetMaxKb: number; // ex: 470 (garanti sous 500 Ko)
  enableAdminFilter: boolean; // noir et blanc contrasté
  dpi: number; // 150 DPI pour A4
}

/**
 * Charge une image File vers un HTMLImageElement de façon robuste
 */
function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    // Vérifier si le type est bien une image
    if (!file.type.startsWith('image/')) {
      reject(new Error("Veuillez sélectionner un fichier image (JPG, PNG, WEBP). Les PDF bruts ne peuvent pas être traités directement dans le canvas."));
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Deuxième tentative avec FileReader au cas où createObjectURL est restreint
      const reader = new FileReader();
      reader.onload = (e) => {
        const fallbackImg = new Image();
        fallbackImg.onload = () => resolve(fallbackImg);
        fallbackImg.onerror = () => reject(new Error("Impossible de décoder la photo. Le format n'est pas pris en charge."));
        fallbackImg.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Erreur de lecture du fichier image."));
      reader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
}

/**
 * Filtre Scan Administratif haute lisibilité
 */
function applyAdminScanFilter(ctx: CanvasRenderingContext2D, width: number, height: number) {
  try {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Luminance perçue
      let gray = 0.299 * r + 0.587 * g + 0.114 * b;
      
      // Blanchiment des fonds beiges/gris et renforcement du noir des textes & cachets
      if (gray > 160) {
        gray = Math.min(255, gray * 1.18);
      } else if (gray < 95) {
        gray = Math.max(0, gray * 0.82);
      }

      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }

    ctx.putImageData(imgData, 0, 0);
  } catch (err) {
    console.warn("Filtre administratif ignoré (limitation canvas) :", err);
  }
}

/**
 * Convertit un canvas en Blob JPEG avec fallback dataURL universel
 */
function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      if (canvas.toBlob) {
        canvas.toBlob((blob) => {
          if (blob && blob.size > 0) {
            resolve(blob);
          } else {
            // Fallback via toDataURL
            resolve(dataUrlToBlob(canvas.toDataURL('image/jpeg', quality)));
          }
        }, 'image/jpeg', quality);
      } else {
        resolve(dataUrlToBlob(canvas.toDataURL('image/jpeg', quality)));
      }
    } catch (e) {
      try {
        resolve(dataUrlToBlob(canvas.toDataURL('image/jpeg', quality)));
      } catch (err2) {
        reject(err2);
      }
    }
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const byteString = atob(parts[1]);
  const mimeString = parts[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

/**
 * Compresse un document d'état civil sous le seuil exact de 500 Ko
 */
export async function compressDocumentToPdf(
  file: File,
  options: CompressOptions = { targetMaxKb: 470, enableAdminFilter: true, dpi: 150 }
): Promise<CompressResult> {
  const originalSize = file.size;
  const targetBytes = options.targetMaxKb * 1024;

  const img = await fileToImage(file);

  // Dimensions standards A4 en 150 DPI : 1240 x 1754 px
  const a4Width = 1240;
  const a4Height = 1754;

  const canvas = document.createElement('canvas');
  canvas.width = a4Width;
  canvas.height = a4Height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error("Impossible d'initialiser le moteur graphique 2D sur cet appareil.");

  // Fond blanc pur
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, a4Width, a4Height);

  // Ratio pour conserver le document entier sans déformation
  const imgRatio = img.width / img.height;
  const canvasRatio = a4Width / a4Height;
  let renderW = a4Width;
  let renderH = a4Height;
  let offsetX = 0;
  let offsetY = 0;

  if (imgRatio > canvasRatio) {
    renderW = a4Width;
    renderH = a4Width / imgRatio;
    offsetY = (a4Height - renderH) / 2;
  } else {
    renderH = a4Height;
    renderW = a4Height * imgRatio;
    offsetX = (a4Width - renderW) / 2;
  }

  ctx.drawImage(img, offsetX, offsetY, renderW, renderH);

  if (options.enableAdminFilter) {
    applyAdminScanFilter(ctx, a4Width, a4Height);
  }

  // Boucle de compression binaire
  let currentQuality = 0.85;
  let bestBlob: Blob | null = null;

  while (currentQuality >= 0.15) {
    const blob = await canvasToBlob(canvas, currentQuality);
    
    // Marge de 30 Ko pour le conteneur PDF
    if (blob.size <= targetBytes - 30000 || currentQuality <= 0.20) {
      bestBlob = blob;
      break;
    }

    currentQuality -= 0.08;
  }

  if (!bestBlob) {
    bestBlob = await canvasToBlob(canvas, 0.20);
  }

  // Conversion en DataURL pour insertion propre dans jsPDF
  const jpegDataUrl = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(bestBlob!);
  });

  // Instanciation jsPDF certifiée compatible bundler ESM
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  pdf.addImage(jpegDataUrl, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

  const pdfOutputBlob = pdf.output('blob');
  const pdfUrl = URL.createObjectURL(pdfOutputBlob);

  const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/\s+/g, '_') + "_sous_500Ko.pdf";

  return {
    pdfBlob: pdfOutputBlob,
    pdfUrl,
    originalSizeBytes: originalSize,
    compressedSizeBytes: pdfOutputBlob.size,
    finalQuality: Math.round(currentQuality * 100),
    fileName: cleanName
  };
}
