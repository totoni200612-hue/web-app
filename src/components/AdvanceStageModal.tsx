import React, { useState } from 'react';
import { ProductionOrder, ProductionStageRun } from '../types/erp';
import { X, Play, CheckCircle2, Clock, Check } from 'lucide-react';

interface AdvanceStageModalProps {
  order: ProductionOrder | null;
  onClose: () => void;
  onUpdateStage: (
    opId: string,
    stageId: string,
    updates: {
      status: 'Pendente' | 'Em Andamento' | 'Concluída';
      actualMinutes?: number;
      operatorName?: string;
      notes?: string;
    }
  ) => Promise<void>;
  onOpenCompleteModal: (order: ProductionOrder) => void;
}

export const AdvanceStageModal: React.FC<AdvanceStageModalProps> = ({
  order,
  onClose,
  onUpdateStage,
  onOpenCompleteModal,
}) => {
  if (!order) return null;

  const [loadingStageId, setLoadingStageId] = useState<string | null>(null);
  const [operatorInputs, setOperatorInputs] = useState<Record<string, string>>({});
  const [minutesInputs, setMinutesInputs] = useState<Record<string, string>>({});
  const [notesInputs, setNotesInputs] = useState<Record<string, string>>({});

  const handleStart = async (stage: ProductionStageRun) => {
    setLoadingStageId(stage.id);
    try {
      await onUpdateStage(order.id, stage.id, {
        status: 'Em Andamento',
        operatorName: operatorInputs[stage.id] || stage.operatorName || 'Operador Responsável',
        notes: notesInputs[stage.id] || stage.notes || '',
      });
    } finally {
      setLoadingStageId(null);
    }
  };

  const handleFinish = async (stage: ProductionStageRun) => {
    setLoadingStageId(stage.id);
    try {
      const minutes = minutesInputs[stage.id]
        ? parseInt(minutesInputs[stage.id], 10)
        : stage.actualMinutes || stage.estimatedMinutes;

      await onUpdateStage(order.id, stage.id, {
        status: 'Concluída',
        actualMinutes: minutes,
        operatorName: operatorInputs[stage.id] || stage.operatorName || 'Operador Responsável',
        notes: notesInputs[stage.id] || stage.notes || '',
      });
    } finally {
      setLoadingStageId(null);
    }
  };

  const allStagesCompleted = order.stages.every((s) => s.status === 'Concluída');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="text-xs text-emerald-400 font-mono font-bold">
              {order.opNumber}
            </div>
            <h2 className="text-base font-bold text-white">
              Acompanhamento de Etapas de Fabricação
            </h2>
            <div className="text-xs text-slate-300">
              Produto: {order.productName} ({order.quantity} {order.unit})
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 p-3 rounded-lg">
            Avance o status de cada etapa produtiva em tempo real. Ao concluir a última operação, você poderá efetuar a <strong>Baixa Técnica da Ordem</strong> com baixa de estoque.
          </div>

          <div className="space-y-3">
            {order.stages.map((stage, idx) => {
              const isLoading = loadingStageId === stage.id;
              return (
                <div
                  key={stage.id}
                  className={`border rounded-lg p-4 transition-all ${
                    stage.status === 'Concluída'
                      ? 'bg-emerald-50/40 border-emerald-300'
                      : stage.status === 'Em Andamento'
                      ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-300'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 font-mono font-bold text-xs flex items-center justify-center">
                        {stage.sequence || idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-slate-900 text-sm">
                          {stage.name}
                        </span>
                        {stage.machineName && (
                          <span className="text-xs text-slate-500 ml-2">
                            ({stage.machineName})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-sm ${
                          stage.status === 'Concluída'
                            ? 'bg-emerald-100 text-emerald-800'
                            : stage.status === 'Em Andamento'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {stage.status}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                        Prev: {stage.estimatedMinutes} min
                      </span>
                    </div>
                  </div>

                  {/* Operational Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                        Nome do Operador / Técnico
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Lucas Ferreira"
                        defaultValue={stage.operatorName || ''}
                        disabled={stage.status === 'Concluída'}
                        onChange={(e) =>
                          setOperatorInputs({ ...operatorInputs, [stage.id]: e.target.value })
                        }
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded focus:border-emerald-500 focus:outline-hidden disabled:bg-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                        Tempo Real Gasto (minutos)
                      </label>
                      <input
                        type="number"
                        placeholder={String(stage.estimatedMinutes)}
                        defaultValue={stage.actualMinutes || stage.estimatedMinutes || ''}
                        disabled={stage.status === 'Concluída'}
                        onChange={(e) =>
                          setMinutesInputs({ ...minutesInputs, [stage.id]: e.target.value })
                        }
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded focus:border-emerald-500 focus:outline-hidden disabled:bg-slate-100 font-mono"
                      />
                    </div>
                  </div>

                  {/* Actions for this stage */}
                  <div className="flex items-center justify-end gap-2 mt-3 pt-2">
                    {stage.status === 'Pendente' && (
                      <button
                        onClick={() => handleStart(stage)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-semibold cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Iniciar Etapa</span>
                      </button>
                    )}

                    {stage.status === 'Em Andamento' && (
                      <button
                        onClick={() => handleFinish(stage)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Finalizar Etapa</span>
                      </button>
                    )}

                    {stage.status === 'Concluída' && (
                      <div className="flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Etapa Finalizada</span>
                        {stage.actualMinutes && (
                          <span className="text-slate-500 font-mono ml-1">
                            ({stage.actualMinutes} min)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {allStagesCompleted ? (
              <span className="text-emerald-700 font-bold">
                ✓ Todas as etapas foram finalizadas com sucesso!
              </span>
            ) : (
              <span>Etapas em sequência para garantia da rastreabilidade.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg"
            >
              Fechar
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenCompleteModal(order);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm"
            >
              Dar Baixa na Ordem (Finalizar)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
