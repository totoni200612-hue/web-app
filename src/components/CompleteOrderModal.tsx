import React, { useState } from 'react';
import { ProductionOrder, User } from '../types/erp';
import { X, CheckCircle, HardHat, AlertCircle } from 'lucide-react';

interface CompleteOrderModalProps {
  order: ProductionOrder | null;
  currentUser: User | null;
  onClose: () => void;
  onConfirmComplete: (
    opId: string,
    payload: {
      actualEndDate?: string;
      approvedQuantity?: number;
      scrapsQuantity?: number;
      completionNotes?: string;
      actualTotalMinutes?: number;
      deductRawMaterials?: boolean;
      creditFinishedStock?: boolean;
    }
  ) => Promise<void>;
}

export const CompleteOrderModal: React.FC<CompleteOrderModalProps> = ({
  order,
  currentUser,
  onClose,
  onConfirmComplete,
}) => {
  if (!order) return null;

  const [approvedQuantity, setApprovedQuantity] = useState(order.quantity);
  const [scrapsQuantity, setScrapsQuantity] = useState(0);
  const [actualMinutes, setActualMinutes] = useState(
    order.actualTotalMinutes || order.estimatedTotalMinutes || 60
  );
  const [completionNotes, setCompletionNotes] = useState(
    'Lote inspecionado e aprovado conforme especificações técnicas do desenho e tolerâncias dimensionais.'
  );
  const [deductRawMaterials, setDeductRawMaterials] = useState(true);
  const [creditFinishedStock, setCreditFinishedStock] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirmComplete(order.id, {
        actualEndDate: new Date().toISOString(),
        approvedQuantity: Number(approvedQuantity),
        scrapsQuantity: Number(scrapsQuantity),
        actualTotalMinutes: Number(actualMinutes),
        completionNotes,
        deductRawMaterials,
        creditFinishedStock,
      });
      onClose();
    } catch (err: any) {
      alert(`Erro ao dar baixa na ordem: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-300" />
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Baixa de Ordem de Produção
              </h2>
              <div className="text-xs text-emerald-200 font-mono">
                {order.opNumber} — {order.productName}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Technical Responsible Sign */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              <HardHat className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">
                {currentUser?.name || 'Responsável Técnico'}
              </div>
              <div className="text-[11px] text-slate-500">
                {currentUser?.role} {currentUser?.registrationNumber ? `· ${currentUser.registrationNumber}` : ''}
              </div>
              <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
                Assinará a baixa e liberação técnica deste lote
              </div>
            </div>
          </div>

          {/* Quantities */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Qtd. Aprovada ({order.unit})
              </label>
              <input
                type="number"
                min="0"
                required
                value={approvedQuantity}
                onChange={(e) => setApprovedQuantity(Number(e.target.value))}
                className="w-full text-sm font-mono px-3 py-2 border border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Refugos / Perdas ({order.unit})
              </label>
              <input
                type="number"
                min="0"
                value={scrapsQuantity}
                onChange={(e) => setScrapsQuantity(Number(e.target.value))}
                className="w-full text-sm font-mono px-3 py-2 border border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tempo Total Efetivo Gasto (minutos)
            </label>
            <input
              type="number"
              min="1"
              required
              value={actualMinutes}
              onChange={(e) => setActualMinutes(Number(e.target.value))}
              className="w-full text-sm font-mono px-3 py-2 border border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-hidden"
            />
            <span className="text-[11px] text-slate-500">
              Tempo previsto na Ficha Técnica: {order.estimatedTotalMinutes} min
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observações Técnicas de Liberação
            </label>
            <textarea
              rows={2}
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Stock adjustments checkboxes */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={deductRawMaterials}
                onChange={(e) => setDeductRawMaterials(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>
                <strong>Debitar matérias-primas</strong> automaticamente do estoque de insumos
              </span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={creditFinishedStock}
                onChange={(e) => setCreditFinishedStock(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>
                <strong>Creditar produto acabado</strong> (+{approvedQuantity} {order.unit}) no estoque de acabados
              </span>
            </label>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Processando Baixa...' : 'Confirmar e Finalizar Ordem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
