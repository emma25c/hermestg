import jsPDF from 'jspdf';
import { ReceiptData } from '../../types';

export function generateReceiptPdf(data: ReceiptData): { blob: Blob; url: string; fileName: string } {
  // Format reçu A5 ou ticket propre
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5'
  });

  const pageWidth = 148;
  const margin = 12;
  let y = 14;

  // En-tête / Badge vert Togo
  doc.setFillColor(0, 106, 78); // Vert Togo #006a4e
  doc.rect(margin, y, pageWidth - (margin * 2), 16, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(data.businessName.toUpperCase(), margin + 6, y + 10);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('REÇU DE PAIEMENT', pageWidth - margin - 6, y + 10, { align: 'right' });

  y += 24;

  // Métadonnées
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Contact Vendeur :`, margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.businessPhone}`, margin + 30, y);

  doc.setFont('helvetica', 'bold');
  doc.text(`N° Reçu :`, pageWidth - margin - 40, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.receiptNumber, pageWidth - margin, y, { align: 'right' });

  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.text(`Client :`, margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.customerName || 'Client Particulier', margin + 30, y);

  doc.setFont('helvetica', 'bold');
  doc.text(`Date :`, pageWidth - margin - 40, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.date, pageWidth - margin, y, { align: 'right' });

  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.text(`Règlement :`, margin, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(234, 88, 12); // Orange #ea580c
  doc.text(data.paymentMode, margin + 30, y);

  y += 10;

  // Table header
  doc.setFillColor(245, 247, 250);
  doc.rect(margin, y, pageWidth - (margin * 2), 7, 'F');
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('DÉSIGNATION', margin + 3, y + 4.8);
  doc.text('QTÉ', margin + 68, y + 4.8, { align: 'center' });
  doc.text('P.U (FCFA)', margin + 92, y + 4.8, { align: 'right' });
  doc.text('TOTAL (FCFA)', pageWidth - margin - 3, y + 4.8, { align: 'right' });

  y += 8;

  // Lignes d'articles
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);

  let subtotal = 0;
  data.items.forEach((item, index) => {
    const itemTotal = item.quantity * item.unitPrice;
    subtotal += itemTotal;

    if (index % 2 === 1) {
      doc.setFillColor(252, 252, 253);
      doc.rect(margin, y - 1, pageWidth - (margin * 2), 6.5, 'F');
    }

    doc.text(item.description, margin + 3, y + 3.5);
    doc.text(item.quantity.toString(), margin + 68, y + 3.5, { align: 'center' });
    doc.text(item.unitPrice.toLocaleString('fr-FR'), margin + 92, y + 3.5, { align: 'right' });
    doc.text(itemTotal.toLocaleString('fr-FR'), pageWidth - margin - 3, y + 3.5, { align: 'right' });

    y += 6.5;
  });

  y += 4;
  doc.setDrawColor(220, 225, 230);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Total
  const finalTotal = Math.max(0, subtotal - (data.discount || 0));

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 106, 78);
  doc.text('TOTAL RÉGLÉ :', margin + 60, y);
  doc.setFontSize(12);
  doc.text(`${finalTotal.toLocaleString('fr-FR')} FCFA`, pageWidth - margin - 3, y, { align: 'right' });

  y += 10;

  // Remarques éventuelles
  if (data.notes) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(110, 110, 110);
    doc.text(`Note : ${data.notes}`, margin, y);
    y += 8;
  }

  // Footer viral
  const footerY = 200;
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(120, 120, 120);
  doc.text('Généré gratuitement via HermesTG • La boîte à outils étudiante & pro au Togo', pageWidth / 2, footerY, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('www.hermestg.vercel.app • WhatsApp : +228 XX XX XX XX', pageWidth / 2, footerY + 4, { align: 'center' });

  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const fileName = `Recu_${data.receiptNumber.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

  return { blob: pdfBlob, url: pdfUrl, fileName };
}
