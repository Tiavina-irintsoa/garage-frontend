import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable, { UserOptions } from 'jspdf-autotable';
import { RepairDetail } from './repair.service';

interface AutoTableOutput extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

type Color = [number, number, number];

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  // Définition des couleurs
  private readonly BLUE_COLOR: Color = [0, 122, 204]; // RGB pour #007ACC

  constructor() {}

  private formatMontant(montant: number): string {
    return (
      new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(montant) + ' MGA'
    );
  }

  generateRepairPdf(repair: RepairDetail): void {
    const doc = new jsPDF() as AutoTableOutput;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 25; // Augmentation de la marge pour éviter les débordements

    // Configuration des polices
    doc.setFont('times', 'normal');

    // Logo et nom de l'entreprise (à remplacer par votre logo)
    doc.setFontSize(24);
    doc.setFont('times', 'bold');
    doc.setTextColor(
      this.BLUE_COLOR[0],
      this.BLUE_COLOR[1],
      this.BLUE_COLOR[2]
    );
    doc.text('Mon GARAGE', margin, 20);

    doc.setTextColor(0, 0, 0); // Retour au noir
    doc.setFontSize(14);
    doc.setFont('times', 'normal');
    doc.text('Service de réparation automobile', margin, 30);

    // Ligne de séparation
    doc.setDrawColor(
      this.BLUE_COLOR[0],
      this.BLUE_COLOR[1],
      this.BLUE_COLOR[2]
    );
    doc.setLineWidth(0.5);
    doc.line(margin, 35, pageWidth - margin, 35);

    // Bloc destinataire (gauche)
    doc.setFontSize(12);
    doc.text('Destinataire:', margin, 50);
    doc.setFont('times', 'bold');
    doc.text(`${repair.client.nom} ${repair.client.prenom}`, margin, 60);
    doc.setFont('times', 'normal');
    doc.text(`Email: ${repair.client.email}`, margin, 70);

    // Bloc informations facture (droite)
    doc.setFont('times', 'bold');
    doc.setTextColor(
      this.BLUE_COLOR[0],
      this.BLUE_COLOR[1],
      this.BLUE_COLOR[2]
    );
    doc.text('FACTURE', pageWidth - margin, 50, { align: 'right' });
    doc.setTextColor(0, 0, 0); // Retour au noir
    doc.setFont('times', 'normal');
    doc.text(
      `N° ${repair.reference_paiement || repair.id}`,
      pageWidth - margin,
      60,
      { align: 'right' }
    );
    doc.text(
      `Date: ${new Date().toLocaleDateString('fr-FR')}`,
      pageWidth - margin,
      70,
      { align: 'right' }
    );

    // Informations véhicule
    doc.setFont('times', 'bold');
    doc.text('Véhicule concerné:', margin, 90);
    doc.setFont('times', 'normal');
    doc.text(
      `${repair.vehicule.marque.libelle} ${repair.vehicule.modele.libelle}`,
      margin,
      100
    );
    doc.text(
      `Immatriculation: ${repair.vehicule.immatriculation}`,
      margin,
      110
    );

    // Coefficients appliqués
    doc.setFontSize(10);
    doc.setFont('times', 'italic');
    doc.text(
      `Coefficient type: ${repair.estimation.details.coefficient_type} | Facteur état: ${repair.estimation.details.facteur_etat}`,
      margin,
      125
    );

    // Tableau des services
    const servicesTableData = repair.services.map((service) => {
      const coutFinal =
        service.cout_base *
        repair.estimation.details.coefficient_type *
        repair.estimation.details.facteur_etat;
      return [
        service.titre,
        `${service.temps_base}h`,
        this.formatMontant(service.cout_base),
        this.formatMontant(coutFinal),
      ];
    });

    autoTable(doc, {
      startY: 135,
      margin: { left: margin, right: margin },
      head: [['Désignation', 'Temps', 'Prix unitaire', 'Total']],
      body: servicesTableData,
      styles: {
        font: 'times',
        fontSize: 9,
        cellPadding: 2,
      },
      headStyles: {
        font: 'times',
        fontStyle: 'bold',
        fontSize: 10,
        fillColor: this.BLUE_COLOR as [number, number, number],
        textColor: 255, // Blanc pour le texte des en-têtes
      },
      columnStyles: {
        0: { cellWidth: 65 },
        1: { cellWidth: 15, halign: 'center' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' },
      },
    } as unknown as UserOptions);

    // Tableau des pièces
    const piecesTableData = (repair.pieces_facture || []).map((piece) => [
      piece.nom || piece.reference || 'N/A',
      piece.quantite.toString(),
      this.formatMontant(piece.prix),
      this.formatMontant(piece.prix * piece.quantite),
    ]);

    if (piecesTableData.length > 0) {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        margin: { left: margin, right: margin },
        head: [['Pièce', 'Quantité', 'Prix unitaire', 'Total']],
        body: piecesTableData,
        styles: {
          font: 'times',
          fontSize: 9,
          cellPadding: 2,
        },
        headStyles: {
          font: 'times',
          fontStyle: 'bold',
          fontSize: 10,
          fillColor: this.BLUE_COLOR as [number, number, number],
          textColor: 255,
        },
        columnStyles: {
          0: { cellWidth: 65 },
          1: { cellWidth: 15, halign: 'center' },
          2: { cellWidth: 35, halign: 'right' },
          3: { cellWidth: 35, halign: 'right' },
        },
      } as unknown as UserOptions);
    }

    // Bloc totaux
    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.setFont('times', 'normal');

    // Alignement à droite pour les totaux
    const rightMargin = pageWidth - margin;
    const leftAlign = rightMargin - 70; // Réduit l'espace pour éviter le débordement

    doc.text('Total services:', leftAlign, finalY);
    doc.text(
      this.formatMontant(repair.estimation.cout_estime),
      rightMargin,
      finalY,
      { align: 'right' }
    );

    doc.text('Total pièces:', leftAlign, finalY + 10);
    doc.text(
      this.formatMontant(repair.montant_pieces || 0),
      rightMargin,
      finalY + 10,
      { align: 'right' }
    );

    // Ligne de séparation pour le total
    doc.setDrawColor(
      this.BLUE_COLOR[0],
      this.BLUE_COLOR[1],
      this.BLUE_COLOR[2]
    );
    doc.setLineWidth(0.2);
    doc.line(leftAlign, finalY + 15, rightMargin, finalY + 15);

    // Total TTC en gras et en bleu
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(
      this.BLUE_COLOR[0],
      this.BLUE_COLOR[1],
      this.BLUE_COLOR[2]
    );
    doc.text('Total TTC:', leftAlign, finalY + 25);
    doc.text(
      this.formatMontant(repair.montant_total || 0),
      rightMargin,
      finalY + 25,
      { align: 'right' }
    );

    // Ouvrir le PDF dans un nouvel onglet
    doc.output('dataurlnewwindow');
  }
}
