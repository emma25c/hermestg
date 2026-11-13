import { jsPDF } from 'jspdf';
import { ApcExam } from '../../types/apc';
import { formatApcExamForPdf, formatMathForPdf } from '../../lib/mathFormatter';

/**
 * Génère un document PDF A4 haute définition, officiel et rigoureusement calibré
 * pour les épreuves scolaires togolaises en Approche Par Compétences (APC).
 *
 * Garanties structurelles :
 * 1. Zéro débordement de page A4 : pagination dynamique ligne par ligne avec coupure de page automatique.
 * 2. Zéro débordement horizontal : tous les énoncés, titres et choix de QCM sont strictement tronçonnés à la largeur imprimable.
 * 3. Typographie mathématique officielle et sécurisée pour Helvetica :
 *    - Caractères Windows-1252 natifs (×, ÷, ², ³, ¹, ±, °, µ, •)
 *    - Translitérations académiques pour les symboles hors Windows-1252 (racine, <=, >=, !=, ^(4), u_n, etc.)
 *    évitant toute corruption visuelle dans les lecteurs PDF.
 */
export function generateApcExamPdf(rawExam: ApcExam): { blob: Blob; url: string; fileName: string } {
  // 1. Formatage mathématique préalable de toute l'épreuve sécurisé pour la police Helvetica (Windows-1252)
  const exam = formatApcExamForPdf(rawExam);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 16;
  const contentWidth = pageWidth - margin * 2; // 178 mm
  const maxY = pageHeight - 18; // 279 mm (laisse 11 mm avant le pied de page)
  const topY = 16;
  let y = 14;

  /**
   * Assure qu'un espace vertical minimal est disponible sur la page active,
   * sinon passe proprement à la page suivante.
   */
  const ensureSpace = (neededHeight: number): boolean => {
    if (y + neededHeight > maxY) {
      doc.addPage();
      y = topY;
      return true;
    }
    return false;
  };

  /**
   * Imprime un tableau de lignes de texte en gérant la pagination automatique
   * ligne par ligne pour interdire tout débordement en bas de page A4.
   */
  const printWrappedLines = (
    lines: string[],
    x: number,
    lineHeight = 4.2
  ): void => {
    for (const line of lines) {
      if (y + lineHeight > maxY) {
        doc.addPage();
        y = topY;
      }
      doc.text(line, x, y);
      y += lineHeight;
    }
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
  const etablissementName = (exam.etablissement || 'LYCÉE').toUpperCase();
  const etablissementLines = doc.splitTextToSize(etablissementName, 75);
  doc.text(etablissementLines, pageWidth - margin, y, { align: 'right' });
  
  const rightOffset = (etablissementLines.length - 1) * 3.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Année scolaire : ${exam.anneeScolaire || '2025 - 2026'}`, pageWidth - margin, y + 4 + rightOffset, { align: 'right' });
  doc.text(`Session : ${exam.session || 'Session Ordinaire'}`, pageWidth - margin, y + 8 + rightOffset, { align: 'right' });
  doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - margin, y + 12 + rightOffset, { align: 'right' });

  y += Math.max(20, 16 + rightOffset + 4);

  // Ligne de séparation fine
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);

  y += 5;

  // ==========================================
  // 2. CARTOUCHE D'EXAMEN ENCADRÉ DYNAMIQUE
  // ==========================================
  const discLine = `ÉPREUVE DE : ${(exam.disciplineLabel || 'DISCIPLINE').toUpperCase()}`;
  const detailsLine = `CLASSE : ${exam.classeLabel || ''}   |   DURÉE : ${exam.duree || ''}   |   COEFFICIENT : ${exam.coefficient || ''}`;
  
  doc.setFontSize(8);
  const isDetailsWide = doc.getTextWidth(detailsLine) > contentWidth - 10;
  const boxHeight = isDetailsWide ? 19 : 15;

  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(15, 23, 42); // slate-900
  doc.setLineWidth(0.8);
  doc.rect(margin, y, contentWidth, boxHeight, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text(discLine, margin + 5, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  if (isDetailsWide) {
    doc.text(`CLASSE : ${exam.classeLabel || ''}   |   DURÉE : ${exam.duree || ''}`, margin + 5, y + 10.5);
    doc.text(`COEFFICIENT : ${exam.coefficient || ''}   |   TOTAL : ${exam.totalPoints || 20} POINTS`, margin + 5, y + 15);
  } else {
    doc.text(detailsLine, margin + 5, y + 11);
  }

  y += boxHeight + 6;

  // Titre de l'épreuve centré et découpé sur mesure
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  const titreLines = doc.splitTextToSize((exam.titre || 'ÉPREUVE OFFICIELLE APC').toUpperCase(), contentWidth - 12);
  for (const line of titreLines) {
    ensureSpace(4.5);
    doc.text(line, pageWidth / 2, y, { align: 'center' });
    y += 4.5;
  }

  y += 4;

  // ==========================================
  // 3. EXERCICES (ÉVALUATION DES RESSOURCES)
  // ==========================================
  for (const exo of exam.exercices) {
    // Calcul de la taille du bandeau de titre d'exercice
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    const ptsBannerText = `(${exo.points} pt${exo.points > 1 ? 's' : ''})`;
    const ptsBannerWidth = doc.getTextWidth(ptsBannerText) + 4;
    const maxExoTitleWidth = contentWidth - ptsBannerWidth - 8;
    const exoTitleLines = doc.splitTextToSize(exo.titre.toUpperCase(), maxExoTitleWidth);
    const bannerHeight = Math.max(7, exoTitleLines.length * 4.2 + 2.5);

    ensureSpace(bannerHeight + 10);

    // Titre de l'exercice avec fond gris discret
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(margin, y, contentWidth, bannerHeight, 'F');
    doc.setTextColor(15, 23, 42);
    
    let curTitleY = y + 4.8;
    for (const tl of exoTitleLines) {
      doc.text(tl, margin + 3, curTitleY);
      curTitleY += 4.2;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(ptsBannerText, pageWidth - margin - 3, y + 4.8, { align: 'right' });

    y += bannerHeight + 3.5;

    // Introduction / consigne générale de l'exercice
    if (exo.intro) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      const introLines = doc.splitTextToSize(exo.intro, contentWidth);
      printWrappedLines(introLines, margin, 3.8);
      y += 2.5;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);

    // Questions de l'exercice
    for (const q of exo.questions) {
      const numStr = q.numero;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      const numWidth = doc.getTextWidth(numStr) + 2.5;

      const ptsText = `[${q.points} pt${q.points > 1 ? 's' : ''}]`;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      const ptsWidth = doc.getTextWidth(ptsText) + 2;

      // Calcul de la zone exacte réservée au texte de la question
      const enonceX = margin + Math.max(7, numWidth);
      const maxEnonceWidth = (pageWidth - margin - ptsWidth) - enonceX - 2;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      const textLines = doc.splitTextToSize(q.enonce, maxEnonceWidth);

      // S'assurer qu'au moins la première ligne peut être imprimée
      ensureSpace(textLines.length > 0 ? 5 : 4);

      for (let li = 0; li < textLines.length; li++) {
        if (y + 4.3 > maxY) {
          doc.addPage();
          y = topY;
        }

        if (li === 0) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(15, 23, 42);
          doc.text(numStr, margin, y);

          doc.setFont('helvetica', 'italic');
          doc.setFontSize(7.5);
          doc.setTextColor(100, 116, 139);
          doc.text(ptsText, pageWidth - margin, y, { align: 'right' });
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(textLines[li], enonceX, y);
        y += 4.3;
      }

      y += 1.5;

      // Choix pour QCM (découpe stricte anti-débordement)
      if (q.choix && q.choix.length > 0) {
        for (const ch of q.choix) {
          const bulletPrefix = '• ';
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(51, 65, 85);
          const bWidth = doc.getTextWidth(bulletPrefix) + 1;
          const choiceLines = doc.splitTextToSize(ch, contentWidth - 18 - bWidth);

          for (let cli = 0; cli < choiceLines.length; cli++) {
            if (y + 4.0 > maxY) {
              doc.addPage();
              y = topY;
            }
            if (cli === 0) {
              doc.text(bulletPrefix, margin + 12, y);
            }
            doc.text(choiceLines[cli], margin + 12 + bWidth, y);
            y += 4.0;
          }
        }
        y += 1.5;
      }
    }

    y += 3;
  }

  // ==========================================
  // 4. SITUATION D'INTÉGRATION (APC)
  // ==========================================
  if (exam.situationIntegration) {
    const sit = exam.situationIntegration;

    // Bandeau titre de la situation
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    const ptsSitText = '(8 points)';
    const ptsSitWidth = doc.getTextWidth(ptsSitText) + 4;
    const maxSitTitleWidth = contentWidth - ptsSitWidth - 8;
    const sitTitleLines = doc.splitTextToSize(sit.titre.toUpperCase(), maxSitTitleWidth);
    const sitBannerHeight = Math.max(7, sitTitleLines.length * 4.2 + 2.5);

    ensureSpace(sitBannerHeight + 15);

    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, sitBannerHeight, 'F');
    doc.setTextColor(15, 23, 42);
    
    let curSitY = y + 4.8;
    for (const st of sitTitleLines) {
      doc.text(st, margin + 3, curSitY);
      curSitY += 4.2;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(ptsSitText, pageWidth - margin - 3, y + 4.8, { align: 'right' });

    y += sitBannerHeight + 4;

    // Contexte narratif : affichage sécurisé anti-débordement
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    const contexteLines = doc.splitTextToSize(sit.contexte, contentWidth - 10);
    const neededContextHeight = contexteLines.length * 4.0 + 8;

    if (neededContextHeight <= (maxY - topY) * 0.85) {
      // Le contexte tient sur une page : on s'assure d'avoir la place pour le rectangle complet
      ensureSpace(neededContextHeight);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.4);
      doc.rect(margin, y, contentWidth, neededContextHeight, 'FD');
      
      let textPosY = y + 5;
      for (const line of contexteLines) {
        doc.text(line, margin + 5, textPosY);
        textPosY += 4.0;
      }
      y += neededContextHeight + 4;
    } else {
      // Contexte très long : impression continue avec barre latérale
      for (const line of contexteLines) {
        if (y + 4.0 > maxY) {
          doc.addPage();
          y = topY;
        }
        doc.setDrawColor(15, 23, 42);
        doc.setLineWidth(0.8);
        doc.line(margin + 2, y - 3, margin + 2, y + 1);
        doc.text(line, margin + 6, y);
        y += 4.0;
      }
      y += 4;
    }

    // Données clés
    if (sit.donnees) {
      ensureSpace(10);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      const donneesLabel = 'Données utiles : ';
      const dLabelWidth = doc.getTextWidth(donneesLabel);

      doc.setFont('helvetica', 'normal');
      const donneesLines = doc.splitTextToSize(sit.donnees, contentWidth - dLabelWidth - 4);
      
      for (let di = 0; di < donneesLines.length; di++) {
        if (y + 4.0 > maxY) {
          doc.addPage();
          y = topY;
        }
        if (di === 0) {
          doc.setFont('helvetica', 'bold');
          doc.text(donneesLabel, margin + 2, y);
          doc.setFont('helvetica', 'normal');
        }
        doc.text(donneesLines[di], margin + 2 + dLabelWidth, y);
        y += 4.0;
      }
      y += 3;
    }

    // Consignes indépendantes
    ensureSpace(12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Consignes pour l’élève :', margin, y);
    y += 5;

    for (const cons of sit.consignes) {
      const consPrefix = `Consigne ${cons.numero} :`;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      const cPrefWidth = doc.getTextWidth(consPrefix) + 3;

      const consBarText = `[${cons.bareme} pt${cons.bareme > 1 ? 's' : ''}]`;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      const cBarWidth = doc.getTextWidth(consBarText) + 2;

      const consX = margin + 3 + cPrefWidth;
      const maxConsWidth = (pageWidth - margin - cBarWidth) - consX - 2;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      const txtLines = doc.splitTextToSize(cons.enonce, maxConsWidth);

      ensureSpace(txtLines.length > 0 ? 5 : 4);

      for (let ci = 0; ci < txtLines.length; ci++) {
        if (y + 4.3 > maxY) {
          doc.addPage();
          y = topY;
        }
        if (ci === 0) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(15, 23, 42);
          doc.text(consPrefix, margin + 3, y);

          doc.setFont('helvetica', 'italic');
          doc.setFontSize(7.5);
          doc.setTextColor(100, 116, 139);
          doc.text(consBarText, pageWidth - margin, y, { align: 'right' });
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(txtLines[ci], consX, y);
        y += 4.3;
      }
      y += 2.5;
    }

    // Grille critériée officielle sur 8 points
    if (sit.grilleCorrection && sit.grilleCorrection.length > 0) {
      ensureSpace(20);
      y += 2;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('Grille critériée d’évaluation officielle (8 points) :', margin, y);
      y += 4.5;

      for (const g of sit.grilleCorrection) {
        const critLabel = `• ${g.critere} (${g.bareme} pt) :`;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        const cLabelWidth = doc.getTextWidth(critLabel) + 3;

        doc.setFont('helvetica', 'normal');
        const maxIndWidth = contentWidth - cLabelWidth - 8;
        const indLines = doc.splitTextToSize(g.indicateurs, maxIndWidth);
        const rowHeight = indLines.length * 3.6 + 2;

        ensureSpace(rowHeight);

        for (let gi = 0; gi < indLines.length; gi++) {
          if (y + 3.6 > maxY) {
            doc.addPage();
            y = topY;
          }
          if (gi === 0) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.5);
            doc.setTextColor(15, 23, 42);
            doc.text(critLabel, margin + 3, y);
          }
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(51, 65, 85);
          doc.text(indLines[gi], margin + 3 + cLabelWidth, y);
          y += 3.6;
        }
        y += 1.5;
      }
    }
  }

  // ==========================================
  // 5. NOUVELLE PAGE : CORRIGÉ-TYPE OFFICIEL
  // ==========================================
  doc.addPage();
  y = topY;

  // En-tête corrigé officiel
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('CORRIGÉ-TYPE OFFICIEL & GRILLE DE NOTATION', pageWidth / 2, y + 6.5, { align: 'center' });

  y += 15;

  doc.setTextColor(30, 41, 59);

  // Corrigé des exercices
  for (const exCorr of exam.corrige.exerciceCorriges) {
    ensureSpace(16);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    const exCorrTitleLines = doc.splitTextToSize(exCorr.titre.toUpperCase(), contentWidth - 4);
    for (const tl of exCorrTitleLines) {
      doc.text(tl, margin, y);
      y += 4.5;
    }
    y += 2;

    for (const r of exCorr.reponses) {
      ensureSpace(8);
      const itemLabel = `${r.item || ''} :`;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      const itemWidth = doc.getTextWidth(itemLabel) + 3;

      const rPtsText = `[${r.points || 1} pt${(r.points || 1) > 1 ? 's' : ''}]`;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      const rPtsWidth = doc.getTextWidth(rPtsText) + 2;

      const repX = margin + 3 + itemWidth;
      const maxRepWidth = (pageWidth - margin - rPtsWidth) - repX - 2;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const bodyLines = doc.splitTextToSize(r.reponse || '', maxRepWidth);

      for (let ri = 0; ri < bodyLines.length; ri++) {
        if (y + 4.0 > maxY) {
          doc.addPage();
          y = topY;
        }

        if (ri === 0) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(15, 23, 42);
          doc.text(itemLabel, margin + 3, y);

          doc.setFont('helvetica', 'italic');
          doc.setFontSize(7.5);
          doc.setTextColor(100, 116, 139);
          doc.text(rPtsText, pageWidth - margin, y, { align: 'right' });
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        doc.text(bodyLines[ri], repX, y);
        y += 4.0;
      }
      y += 2.2;
    }
    y += 3;
  }

  // Corrigé de la situation d'intégration
  if (exam.corrige.situationCorrigee) {
    const sitCorr = exam.corrige.situationCorrigee;
    ensureSpace(20);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('RÉSOLUTION DE LA SITUATION D\'ÉVALUATION (8 POINTS)', margin, y);
    y += 6;

    if (sitCorr.consigne1Corrige) {
      ensureSpace(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('Éléments de réponse - Consigne 1 :', margin + 3, y);
      y += 4.5;
      
      doc.setFont('helvetica', 'normal');
      const c1Lines = doc.splitTextToSize(sitCorr.consigne1Corrige, contentWidth - 8);
      printWrappedLines(c1Lines, margin + 6, 4.0);
      y += 3;
    }

    if (sitCorr.consigne2Corrige) {
      ensureSpace(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('Éléments de réponse - Consigne 2 :', margin + 3, y);
      y += 4.5;

      doc.setFont('helvetica', 'normal');
      const c2Lines = doc.splitTextToSize(sitCorr.consigne2Corrige, contentWidth - 8);
      printWrappedLines(c2Lines, margin + 6, 4.0);
      y += 3;
    }

    if (sitCorr.baremeDetaille) {
      ensureSpace(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('Barème d\'attribution des points APC :', margin + 3, y);
      y += 4.5;

      doc.setFont('helvetica', 'italic');
      const bLines = doc.splitTextToSize(sitCorr.baremeDetaille, contentWidth - 8);
      printWrappedLines(bLines, margin + 6, 4.0);
      y += 3;
    }
  }

  // ==========================================
  // 6. NUMÉROTATION DES PAGES ET PIED DE PAGE PROPRIÉTAIRE
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
      `Djanta Hub — Épreuve Officielle APC Togo (Conforme MEPS)`,
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
  const safeName = formatMathForPdf(exam.titre || '').toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const fileName = `epreuve_apc_${exam.classe}_${exam.discipline}_${safeName.slice(0, 30)}.pdf`;

  return { blob, url, fileName };
}
