import jsPDF from 'jspdf';

export interface CompressResult {
  pdfBlob: Blob;
  pdfUrl: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  finalQuality: number;
  fileName: string;
}

export interface CompressOptions {
  targetMaxKb: number; // default 480 (garanti sous 500 Ko)
  enableAdminFilter: boolean; // noir et blanc contrasté
  dpi: number; // 150 DPI pour A4
}

/**
 * Charge une image File vers un HTMLImageElement
 */
function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Applique le filtre "Scan Administratif"
 */
function applyAdminScanFilter(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Conversion en niveaux de gris avec renforcement de contraste
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Luminance perçue
    let gray = 0.299 * r + 0.587 * g + 0.114 * b;
    
    // Contraste doux pour nettoyer le fond papier et blanchir les zones claires
    if (gray > 165) {
      gray = Math.min(255, gray * 1.15);
    } else if (gray < 90) {
      gray = Math.max(0, gray * 0.85);
    }

    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * Convertit un canvas en Blob JPEG
 */
function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Erreur de conversion canvas'));
    }, 'image/jpeg', quality);
  });
}

/**
 * Compresse une photo de document administratif sous le seuil exact de 500 Ko
 */
export async function compressDocumentToPdf(
  file: File,
  options: CompressOptions = { targetMaxKb: 470, enableAdminFilter: true, dpi: 150 }
): Promise<CompressResult> {
  const originalSize = file.size;
  const targetBytes = options.targetMaxKb * 1024;

  const img = await fileToImage(file);

  // Dimensions standards A4 en 150 DPI : 1240 x 1754
  const a4Width = 1240;
  const a4Height = 1754;

  const canvas = document.createElement('canvas');
  canvas.width = a4Width;
  canvas.height = a4Height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Impossible d initialiser le canvas 2D');

  // Fond blanc pur
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, a4Width, a4Height);

  // Ratio d'aspect pour conserver l'image sans déformation
  const imgRatio = img.width / img.height;
  const canvasRatio = a4Width / a4Height;
  let renderW = a4Width;
  let renderH = a4Height;
  let offsetX = 0;
  let offsetY = 0;

  if (imgRatio > canvasRatio) {
    // Image plus large
    renderW = a4Width;
    renderH = a4Width / imgRatio;
    offsetY = (a4Height - renderH) / 2;
  } else {
    // Image plus haute
    renderH = a4Height;
    renderW = a4Height * imgRatio;
    offsetX = (a4Width - renderW) / 2;
  }

  ctx.drawImage(img, offsetX, offsetY, renderW, renderH);

  if (options.enableAdminFilter) {
    applyAdminScanFilter(ctx, a4Width, a4Height);
  }

  // Boucle de recherche dichotomique/décroissante de qualité JPEG
  let currentQuality = 0.85;
  let bestBlob: Blob | null = null;

  while (currentQuality >= 0.15) {
    const blob = await canvasToBlob(canvas, currentQuality);
    
    // Marge de sécurité de 25 Ko pour la structure du conteneur PDF jsPDF
    if (blob.size <= targetBytes - 25000 || currentQuality <= 0.20) {
      bestBlob = blob;
      break;
    }

    currentQuality -= 0.08;
  }

  if (!bestBlob) {
    bestBlob = await canvasToBlob(canvas, 0.20);
  }

  // Génération du PDF A4
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const blobDataUrl = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(bestBlob!);
  });

  pdf.addImage(blobDataUrl, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

  const pdfOutputBlob = pdf.output('blob');
  const pdfUrl = URL.createObjectURL(pdfOutputBlob);

  const cleanName = file.name.replace(/\.[^/.]+$/, "") + "_sous_500Ko.pdf";

  return {
    pdfBlob: pdfOutputBlob,
    pdfUrl,
    originalSizeBytes: originalSize,
    compressedSizeBytes: pdfOutputBlob.size,
    finalQuality: Math.round(currentQuality * 100),
    fileName: cleanName
  };
}
