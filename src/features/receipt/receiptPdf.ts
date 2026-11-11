import { jsPDF } from 'jspdf';
import { ReceiptData } from '../../types';

export function generateReceiptPdf(data: ReceiptData): { blob: Blob; url: string; fileName: string } {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5'
  });

  const pageWidth = 148;
  const margin = 12;
  let y = 14;

  // En-tête sobre et noble
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(margin, y, pageWidth - (margin * 2), 16, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(data.businessName.toUpperCase(), margin + 6, y + 10);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('REÇU DE RÈGLEMENT', pageWidth - margin - 6, y + 10, { align: 'right' });

  y += 24;

  // Métadonnées
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`Émetteur :`, margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.businessPhone}`, margin + 28, y);

  doc.setFont('helvetica', 'bold');
  doc.text(`N° Pièce :`, pageWidth - margin - 40, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.receiptNumber, pageWidth - margin, y, { align: 'right' });

  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.text(`Destinataire :`, margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.customerName || 'Client Particulier', margin + 28, y);

  doc.setFont('helvetica', 'bold');
  doc.text(`Date d'émission :`, pageWidth - margin - 40, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.date, pageWidth - margin, y, { align: 'right' });

  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.text(`Mode de paiement :`, margin, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9); // Ocre / Amber 700
  doc.text(data.paymentMode, margin + 28, y);

  y += 10;

  // Table header
  doc.setFillColor(245, 245, 244);
  doc.rect(margin, y, pageWidth - (margin * 2), 7, 'F');
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('DÉSIGNATION', margin + 3, y + 4.8);
  doc.text('QTÉ', margin + 68, y + 4.8, { align: 'center' });
  doc.text('P.U (FCFA)', margin + 92, y + 4.8, { align: 'right' });
  doc.text('TOTAL (FCFA)', pageWidth - margin - 3, y + 4.8, { align: 'right' });

  y += 8;

  // Lignes d'articles
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  let subtotal = 0;
  data.items.forEach((item, index) => {
    const itemTotal = item.quantity * item.unitPrice;
    subtotal += itemTotal;

    if (index % 2 === 1) {
      doc.setFillColor(250, 250, 249);
      doc.rect(margin, y - 1, pageWidth - (margin * 2), 6.5, 'F');
    }

    doc.text(item.description, margin + 3, y + 3.5);
    doc.text(item.quantity.toString(), margin + 68, y + 3.5, { align: 'center' });
    doc.text(item.unitPrice.toLocaleString('fr-FR'), margin + 92, y + 3.5, { align: 'right' });
    doc.text(itemTotal.toLocaleString('fr-FR'), pageWidth - margin - 3, y + 3.5, { align: 'right' });

    y += 6.5;
  });

  y += 4;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Total
  const finalTotal = Math.max(0, subtotal - (data.discount || 0));

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('MONTANT TOTAL ENCAISSÉ :', margin + 45, y);
  doc.setFontSize(11);
  doc.text(`${finalTotal.toLocaleString('fr-FR')} FCFA`, pageWidth - margin - 3, y, { align: 'right' });

  y += 10;

  // Notes
  if (data.notes) {
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text(`Remarque : ${data.notes}`, margin, y);
    y += 8;
  }

  // Footer Djanta Hub
  const footerY = 200;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('Émis via Djanta Hub • Outils de gestion & démarches au Togo', pageWidth / 2, footerY, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('djantahub.vercel.app • Pièce justificative conforme', pageWidth / 2, footerY + 4, { align: 'center' });

  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const fileName = `Recu_${data.receiptNumber.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

  return { blob: pdfBlob, url: pdfUrl, fileName };
}
