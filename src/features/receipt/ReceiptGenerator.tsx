import React, { useState } from 'react';
import { Plus, Trash2, Download, Receipt, CheckCircle } from 'lucide-react';
import { ReceiptData, ReceiptItem } from '../../types';
import { generateReceiptPdf } from './receiptPdf';
import { saveReceiptDraft } from '../../lib/storage';

export const ReceiptGenerator: React.FC = () => {
  const [businessName, setBusinessName] = useState('Boutique Lomé Express');
  const [businessPhone, setBusinessPhone] = useState('+228 90 00 00 00');
  const [customerName, setCustomerName] = useState('');
  const [paymentMode, setPaymentMode] = useState<ReceiptData['paymentMode']>('T-Money');
  const [receiptNumber] = useState(`HTG-${Math.floor(10000 + Math.random() * 90000)}`);
  const [notes, setNotes] = useState('Marchandise vendue en bon état.');
  const [items, setItems] = useState<ReceiptItem[]>([
    { id: '1', description: 'Prestation / Vente article 1', quantity: 1, unitPrice: 2500 }
  ]);
  const [isGenerated, setIsGenerated] = useState(false);
  const [pdfDownloadUrl, setPdfDownloadUrl] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState('');

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 1000 }
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
      customerName: customerName || 'Client Particulier',
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

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
          <Receipt size={22} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Générateur Express de Reçu PDF</h2>
          <p className="text-xs text-slate-500">Idéal vendeurs WhatsApp & commerçants de Lomé • 100% Hors-ligne</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Nom de votre commerce ou activité</label>
          <input
            type="text"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Ex: Lomé Fashion, Service Frappe..."
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Votre Numéro de Contact (T-Money/Flooz)</label>
          <input
            type="text"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={businessPhone}
            onChange={(e) => setBusinessPhone(e.target.value)}
            placeholder="+228 90 XX XX XX"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Nom du Client</label>
          <input
            type="text"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Ex: Koffi Mensah"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Moyen de Règlement</label>
          <select
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
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

      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-600 mb-2">Articles & Prestations</label>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-xs font-bold text-slate-400 w-4">{index + 1}.</span>
              <input
                type="text"
                placeholder="Désignation de l'article"
                className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded focus:ring-1 focus:ring-orange-500 outline-none"
                value={item.description}
                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
              />
              <input
                type="number"
                placeholder="Qté"
                min="1"
                className="w-14 px-2 py-1.5 text-xs bg-white border border-slate-200 rounded text-center focus:ring-1 focus:ring-orange-500 outline-none"
                value={item.quantity}
                onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
              />
              <input
                type="number"
                placeholder="Prix (F)"
                step="100"
                className="w-24 px-2 py-1.5 text-xs bg-white border border-slate-200 rounded text-right focus:ring-1 focus:ring-orange-500 outline-none font-medium"
                value={item.unitPrice}
                onChange={(e) => updateItem(item.id, 'unitPrice', parseInt(e.target.value) || 0)}
              />
              <span className="text-xs font-bold text-slate-700 w-20 text-right">
                {(item.quantity * item.unitPrice).toLocaleString('fr-FR')} F
              </span>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addItem}
          className="mt-2 text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-orange-50 transition-colors"
        >
          <Plus size={15} /> Ajouter un article
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-600 mb-1">Mention ou note de bas de page</label>
        <input
          type="text"
          className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-1 focus:ring-orange-500"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between p-3.5 bg-orange-50 rounded-xl border border-orange-100 mb-5">
        <span className="text-sm font-semibold text-slate-700">Total à payer :</span>
        <span className="text-xl font-black text-orange-600 tracking-tight">
          {totalAmount.toLocaleString('fr-FR')} FCFA
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleGeneratePdf}
          className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm"
        >
          <Receipt size={18} /> Générer le Reçu PDF Net
        </button>

        {isGenerated && pdfDownloadUrl && (
          <a
            href={pdfDownloadUrl}
            download={pdfFileName}
            className="bg-emerald-600 text-white font-semibold py-3 px-5 rounded-xl shadow-md hover:bg-emerald-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Download size={18} /> Télécharger ({pdfFileName})
          </a>
        )}
      </div>

      {isGenerated && (
        <div className="mt-3 p-2.5 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center gap-2 text-xs text-emerald-800">
          <CheckCircle size={15} className="text-emerald-600 shrink-0" />
          <span>Reçu généré avec succès en local ! Vous pouvez l'envoyer directement sur WhatsApp.</span>
        </div>
      )}
    </div>
  );
};
