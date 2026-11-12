import { jsPDF } from 'jspdf';
import { ApcExam } from '../../types/apc';

export function generateApcExamPdf(exam: ApcExam): { blob: Blob; url: string; fileName: string } {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = 14;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 18) {
      doc.addPage();
      y = 16;
      return true;
    }
    return false;
  };

  // ==========================================
  // 1. EN-TÊTE ACADÉMIQUE OFFICIEL DU TOGO
  // ==========================================
  doc.setTextColor(30, 41, 59); // Slate 800

  // Colonne Gauche : Ministère
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('RÉPUBLIQUE TOGOLAISE', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Travail - Liberté - Patrie', margin, y + 4);
  doc.text('MINISTÈRE DES ENSEIGNEMENTS PRIMAIRE,', margin, y + 8);
  doc.text('SECONDAIRE ET TECHNIQUE', margin, y + 11.5);
  doc.setFont('helvetica', 'italic');
  doc.text(exam.directionRegionale || 'DRE GRAND LOMÉ', margin, y + 15);

  // Colonne Droite : Établissement & Année
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(exam.etablissement.toUpperCase(), pageWidth - margin, y, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Année scolaire : ${exam.anneeScolaire}`, pageWidth - margin, y + 4, { align: 'right' });
  doc.text(`Session : ${exam.session}`, pageWidth - margin, y + 8, { align: 'right' });
  doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - margin, y + 12, { align: 'right' });

  y += 20;

  // Ligne de séparation fine
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);

  y += 5;

  // ==========================================
  // 2. CARTOUCHE D'EXAMEN ENCADRÉ
  // ==========================================
  const boxHeight = 15;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(15, 23, 42); // slate-900
  doc.setLineWidth(0.8);
  doc.rect(margin, y, contentWidth, boxHeight, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`ÉPREUVE DE : ${exam.disciplineLabel.toUpperCase()}`, margin + 5, y + 6);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  const detailsLine = `CLASSE : ${exam.classeLabel}   |   DURÉE : ${exam.duree}   |   COEFFICIENT : ${exam.coefficient}`;
  doc.text(detailsLine, margin + 5, y + 11.5);

  y += boxHeight + 8;

  // Titre de l'épreuve
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59);
  doc.text(exam.titre.toUpperCase(), pageWidth / 2, y, { align: 'center' });

  y += 8;

  // ==========================================
  // 3. EXERCICES (ÉVALUATION DES RESSOURCES)
  // ==========================================
  for (const exo of exam.exercices) {
    checkPageBreak(25);

    // Titre de l'exercice avec fond gris discret
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(exo.titre.toUpperCase(), margin + 3, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`(${exo.points} pts)`, pageWidth - margin - 3, y + 5, { align: 'right' });

    y += 10;

    if (exo.intro) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      const introLines = doc.splitTextToSize(exo.intro, contentWidth);
      checkPageBreak(introLines.length * 4);
      doc.text(introLines, margin, y);
      y += introLines.length * 4 + 2;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);

    for (const q of exo.questions) {
      const qPrefix = `${q.numero} `;
      const enonceLines = doc.splitTextToSize(`${qPrefix}${q.enonce}`, contentWidth - 16);
      checkPageBreak(enonceLines.length * 4.5 + 4);

      doc.setFont('helvetica', 'bold');
      doc.text(q.numero, margin, y);
      doc.setFont('helvetica', 'normal');

      // Énoncé sans le numéro
      const textLines = doc.splitTextToSize(q.enonce, contentWidth - 24);
      doc.text(textLines, margin + 8, y);

      // Points à droite
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`[${q.points} pt${q.points > 1 ? 's' : ''}]`, pageWidth - margin, y, { align: 'right' });
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);

      y += textLines.length * 4.5 + 2;

      // Choix pour QCM
      if (q.choix && q.choix.length > 0) {
        for (const ch of q.choix) {
          checkPageBreak(5);
          doc.setFontSize(8);
          doc.text(`• ${ch}`, margin + 12, y);
          y += 4.2;
        }
        y += 1.5;
      }
    }

    y += 4;
  }

  // ==========================================
  // 4. SITUATION D'INTÉGRATION (APC)
  // ==========================================
  if (exam.situationIntegration) {
    const sit = exam.situationIntegration;
    checkPageBreak(40);

    // Titre de la situation
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(sit.titre.toUpperCase(), margin + 3, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('(8 points)', pageWidth - margin - 3, y + 5, { align: 'right' });

    y += 11;

    // Contexte narratif dans un encadré léger
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    const contexteLines = doc.splitTextToSize(sit.contexte, contentWidth - 8);
    const contexteHeight = contexteLines.length * 4 + 6;

    checkPageBreak(contexteHeight + 10);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.rect(margin, y, contentWidth, contexteHeight, 'FD');
    doc.text(contexteLines, margin + 4, y + 5);

    y += contexteHeight + 4;

    // Données clés
    if (sit.donnees) {
      checkPageBreak(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('Données utiles :', margin, y);
      doc.setFont('helvetica', 'normal');
      const donneesLines = doc.splitTextToSize(sit.donnees, contentWidth - 25);
      doc.text(donneesLines, margin + 25, y);
      y += donneesLines.length * 4 + 4;
    }

    // Consignes indépendantes
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Consignes pour l’élève :', margin, y);
    y += 5;

    for (const cons of sit.consignes) {
      const cLines = doc.splitTextToSize(`Consigne ${cons.numero} : ${cons.enonce}`, contentWidth - 20);
      checkPageBreak(cLines.length * 4.5 + 4);

      doc.setFont('helvetica', 'bold');
      doc.text(`Consigne ${cons.numero} :`, margin + 3, y);
      doc.setFont('helvetica', 'normal');
      const txtLines = doc.splitTextToSize(cons.enonce, contentWidth - 28);
      doc.text(txtLines, margin + 25, y);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`[${cons.bareme} pts]`, pageWidth - margin, y, { align: 'right' });
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);

      y += txtLines.length * 4.5 + 3;
    }

    // Grille critériée officielle sur 8 points
    if (sit.grilleCorrection && sit.grilleCorrection.length > 0) {
      checkPageBreak(30);
      y += 2;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('Grille critériée d’évaluation officielle (8 points) :', margin, y);
      y += 4;

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);

      for (const g of sit.grilleCorrection) {
        checkPageBreak(7);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`• ${g.critere} (${g.bareme} pt) :`, margin + 3, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        const indLines = doc.splitTextToSize(g.indicateurs, contentWidth - 55);
        doc.text(indLines, margin + 48, y);
        y += indLines.length * 3.5 + 2;
      }
    }
  }

  // ==========================================
  // 5. NOUVELLE PAGE : CORRIGÉ-TYPE OFFICIEL
  // ==========================================
  doc.addPage();
  y = 16;

  // En-tête corrigé
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('CORRIGÉ-TYPE OFFICIEL & GRILLE DE NOTATION', pageWidth / 2, y + 6.5, { align: 'center' });

  y += 16;

  doc.setTextColor(30, 41, 59);

  // Corrigé des exercices
  for (const exCorr of exam.corrige.exerciceCorriges) {
    checkPageBreak(18);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(exCorr.titre.toUpperCase(), margin, y);
    y += 5;

    for (const r of exCorr.reponses) {
      const repLines = doc.splitTextToSize(`${r.item} : ${r.reponse}`, contentWidth - 16);
      checkPageBreak(repLines.length * 4 + 4);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(r.item, margin + 3, y);

      doc.setFont('helvetica', 'normal');
      const bodyLines = doc.splitTextToSize(r.reponse, contentWidth - 28);
      doc.text(bodyLines, margin + 14, y);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`[${r.points} pt${r.points > 1 ? 's' : ''}]`, pageWidth - margin, y, { align: 'right' });
      doc.setTextColor(30, 41, 59);

      y += bodyLines.length * 4 + 3;
    }
    y += 3;
  }

  // Corrigé de la situation d'intégration
  if (exam.corrige.situationCorrigee) {
    const sitCorr = exam.corrige.situationCorrigee;
    checkPageBreak(25);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('RÉSOLUTION DE LA SITUATION D\'ÉVALUATION (8 POINTS)', margin, y);
    y += 6;

    if (sitCorr.consigne1Corrige) {
      checkPageBreak(15);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('Éléments de réponse - Consigne 1 :', margin + 3, y);
      y += 4;
      doc.setFont('helvetica', 'normal');
      const c1Lines = doc.splitTextToSize(sitCorr.consigne1Corrige, contentWidth - 6);
      doc.text(c1Lines, margin + 6, y);
      y += c1Lines.length * 4 + 4;
    }

    if (sitCorr.consigne2Corrige) {
      checkPageBreak(15);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('Éléments de réponse - Consigne 2 :', margin + 3, y);
      y += 4;
      doc.setFont('helvetica', 'normal');
      const c2Lines = doc.splitTextToSize(sitCorr.consigne2Corrige, contentWidth - 6);
      doc.text(c2Lines, margin + 6, y);
      y += c2Lines.length * 4 + 4;
    }

    if (sitCorr.baremeDetaille) {
      checkPageBreak(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('Barème d\'attribution des points APC :', margin + 3, y);
      y += 4;
      doc.setFont('helvetica', 'italic');
      const bLines = doc.splitTextToSize(sitCorr.baremeDetaille, contentWidth - 6);
      doc.text(bLines, margin + 6, y);
      y += bLines.length * 4 + 4;
    }
  }

  // ==========================================
  // 6. NUMÉROTATION DES PAGES ET PIED DE PAGE
  // ==========================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184); // slate-400

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.text(
      `Djanta Hub — Générateur d'Épreuves APC Togo (IA Gemini Flash)`,
      margin,
      pageHeight - 8
    );
    doc.text(
      `Page ${i} sur ${totalPages}`,
      pageWidth - margin,
      pageHeight - 8,
      { align: 'right' }
    );
  }

  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const safeName = exam.titre.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const fileName = `epreuve_apc_${exam.classe}_${exam.discipline}_${safeName.slice(0, 30)}.pdf`;

  return { blob, url, fileName };
}
