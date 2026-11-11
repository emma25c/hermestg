import React, { useState } from 'react';
import { Plus, Trash2, Download, Receipt, Share2, Sparkles } from 'lucide-react';
import { ReceiptData, ReceiptItem } from '../../types';
import { generateReceiptPdf } from './receiptPdf';
import { saveReceiptDraft } from '../../lib/storage';

const PRESETS = [
  {
    name: 'Mode & Friperie',
    business: 'Lomé Chic Dressing',
    phone: '+228 91 24 35 46',
    items: [
      { id: '1', description: 'Robe de soirée col V en crêpe', quantity: 1, unitPrice: 12500 },
      { id: '2', description: 'Sandales à talons carrés pointure 39', quantity: 1, unitPrice: 8000 }
    ]
  },
  {
    name: 'Mèches & Cosmétique',
    business: 'Divine Beauty Lomé',
    phone: '+228 90 78 54 12',
    items: [
      { id: '1', description: 'Paquet mèches brésiliennes 16 pouces', quantity: 2, unitPrice: 18000 },
      { id: '2', description: 'Sérum brillance capillaire argan', quantity: 1, unitPrice: 4500 }
    ]
  },
  {
    name: 'High-Tech & Accessoires',
    business: 'Tech Dépanne Lomé',
    phone: '+228 99 45 67 89',
    items: [
      { id: '1', description: 'Écouteurs sans-fil Bluetooth Pro', quantity: 1, unitPrice: 7500 },
      { id: '2', description: 'Câble charge rapide Type-C 65W', quantity: 2, unitPrice: 2000 }
    ]
  }
];

export const ReceiptGenerator: React.FC = () => {
  const [businessName, setBusinessName] = useState('Boutique Élégance Lomé');
  const [businessPhone, setBusinessPhone] = useState('+228 72 19 93 37');
  const [customerName, setCustomerName] = useState('Akofa Mensah');
  const [paymentMode, setPaymentMode] = useState<ReceiptData['paymentMode']>('T-Money');
  const [receiptNumber] = useState(`REC-${new Date().getFullYear().toString().slice(-2)}${Math.floor(1000 + Math.random() * 9000)}`);
  const [notes, setNotes] = useState('Paiement reçu avec remerciements. Les articles soldés ne sont ni repris ni échangés.');
  const [items, setItems] = useState<ReceiptItem[]>([
    { id: '1', description: 'Ensemble tailleur 2 pièces coton stretch', quantity: 1, unitPrice: 16500 },
    { id: '2', description: 'Foulard mousseline assorti', quantity: 1, unitPrice: 3500 }
  ]);
  const [isGenerated, setIsGenerated] = useState(false);
  const [pdfDownloadUrl, setPdfDownloadUrl] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState('');

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setBusinessName(preset.business);
    setBusinessPhone(preset.phone);
    setItems(preset.items);
    setIsGenerated(false);
  };

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 2500 }
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof ReceiptItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  const handleGeneratePdf = () => {
    const data: ReceiptData = {
      businessName,
      businessPhone,
      customerName: customerName || 'Client au comptoir',
      receiptNumber,
      date: new Date().toLocaleDateString('fr-FR'),
      paymentMode,
      items,
      discount: 0,
      notes
    };

    saveReceiptDraft(data);
    const { url, fileName } = generateReceiptPdf(data);
    setPdfDownloadUrl(url);
    setPdfFileName(fileName);
    setIsGenerated(true);
  };

  const shareReceiptSummary = () => {
    const itemLines = items.map(it => `• ${it.description} (x${it.quantity}) : ${(it.quantity * it.unitPrice).toLocaleString('fr-FR')} F`).join('\n');
    const message = `*REÇU DE PAIEMENT — ${businessName.toUpperCase()}*\nN° ${receiptNumber} du ${new Date().toLocaleDateString('fr-FR')}\nClient : ${customerName || 'Client'}\nRèglement : ${paymentMode}\n\n*Articles :*\n${itemLines}\n\n*TOTAL : ${totalAmount.toLocaleString('fr-FR')} FCFA*\n\n${notes}\n\n_Reçu certifié émis avec Djanta Hub_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Générateur de Reçus &amp; Factures Client</h2>
          <p className="text-xs text-slate-500 mt-0.5">Produisez des pièces comptables propres directement sur votre téléphone pour vos clients WhatsApp.</p>
        </div>

        {/* Boutons de pré-remplissage rapide */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400">Modèles :</span>
          {PRESETS.map((pr) => (
            <button
              key={pr.name}
              onClick={() => applyPreset(pr)}
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
            >
              {pr.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* FORMULAIRE (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nom commercial ou enseigne
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg focus:border-slate-900 focus:outline-none transition-colors"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Ex: Lomé Fashion, Épicerie Kpalimé..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Numéro vendeur (T-Money/Flooz)
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 text-xs font-semibold tabular-nums border border-slate-300 rounded-lg focus:border-slate-900 focus:outline-none transition-colors"
                value={businessPhone}
                onChange={(e) => setBusinessPhone(e.target.value)}
                placeholder="+228 90 XX XX XX"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nom du client
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg focus:border-slate-900 focus:outline-none transition-colors"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ex: M. Edoh, Mme Agbodjan..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Mode de règlement
              </label>
              <select
                className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg focus:border-slate-900 focus:outline-none bg-white transition-colors"
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as any)}
              >
                <option value="T-Money">T-Money (Togocom)</option>
                <option value="Flooz">Flooz (Moov Africa)</option>
                <option value="Espèces">Espèces (Mains propres)</option>
                <option value="Virement">Virement bancaire</option>
              </select>
            </div>
          </div>

          {/* Table des articles */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800">Détail des articles</label>
              <button
                type="button"
                onClick={addItem}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
              >
                <Plus size={14} /> Ajouter une ligne
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-400 w-4 text-center">{index + 1}</span>
                  <input
                    type="text"
                    placeholder="Désignation de l'article"
                    className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:border-slate-900 outline-none"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  />
                  <input
                    type="number"
                    min="1"
                    className="w-12 px-1.5 py-1.5 text-xs text-center tabular-nums bg-white border border-slate-200 rounded-md focus:border-slate-900 outline-none"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                  />
                  <input
                    type="number"
                    step="500"
                    className="w-20 px-2 py-1.5 text-xs text-right tabular-nums bg-white border border-slate-200 rounded-md focus:border-slate-900 outline-none font-medium"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(item.id, 'unitPrice', parseInt(e.target.value) || 0)}
                  />
                  <span className="text-xs font-bold text-slate-900 w-16 text-right tabular-nums">
                    {(item.quantity * item.unitPrice).toLocaleString('fr-FR')} F
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Conditions de vente ou note
            </label>
            <input
              type="text"
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-600 focus:border-slate-900 focus:outline-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={handleGeneratePdf}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-xs"
            >
              <Receipt size={16} /> Générer le Reçu PDF
            </button>
            <button
              type="button"
              onClick={shareReceiptSummary}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-xs"
            >
              <Share2 size={16} /> Partager Texte WhatsApp
            </button>
          </div>

          {isGenerated && pdfDownloadUrl && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-emerald-900 truncate">
                {pdfFileName}
              </span>
              <a
                href={pdfDownloadUrl}
                download={pdfFileName}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
              >
                <Download size={14} /> Télécharger
              </a>
            </div>
          )}
        </div>

        {/* APERÇU TACTILE DU REÇU (5 cols) */}
        <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Aperçu direct</span>
              <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                {receiptNumber}
              </span>
            </div>

            <div className="bg-white rounded-xl p-4 mt-3 border border-slate-200 shadow-xs space-y-3 font-sans text-xs">
              <div className="border-b border-slate-100 pb-2">
                <span className="font-black text-sm text-slate-900 block">{businessName || 'Nom de la Boutique'}</span>
                <span className="text-[11px] text-slate-500">{businessPhone}</span>
              </div>

              <div className="grid grid-cols-2 text-[11px] text-slate-600 gap-1 pb-2 border-b border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">Client :</span>
                  <span className="font-semibold text-slate-800">{customerName || 'Client'}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">Paiement :</span>
                  <span className="font-bold text-emerald-700">{paymentMode}</span>
                </div>
              </div>

              <div className="space-y-1.5 py-1 text-[11px]">
                {items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-start text-slate-700">
                    <span className="truncate pr-2">{it.description || 'Article'} (x{it.quantity})</span>
                    <span className="font-medium tabular-nums shrink-0">{(it.quantity * it.unitPrice).toLocaleString('fr-FR')} F</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t-2 border-dashed border-slate-200 flex justify-between items-center text-sm font-black text-slate-900">
                <span>TOTAL RÉGLÉ</span>
                <span className="text-emerald-700 tabular-nums text-base">{totalAmount.toLocaleString('fr-FR')} FCFA</span>
              </div>

              <div className="pt-2 text-[9px] text-center text-slate-400 border-t border-slate-100">
                Reçu certifié • Conforme pour déclaration ou justification client
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-600 shrink-0" />
            <span>Aucune connexion requise. Le document est compilé directement par le moteur JavaScript de votre smartphone.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
