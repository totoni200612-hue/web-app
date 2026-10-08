import React, { useState } from 'react';
import { ProductionOrder, Product, Order, User } from '../types/erp';
import { 
  ClipboardList, 
  Search, 
  PlusCircle, 
  Printer, 
  Play, 
  CheckCircle2, 
  Trash2, 
  Calendar,
  Layers,
  Clock,
  Filter
} from 'lucide-react';

interface ProductionOrdersViewProps {
  orders: ProductionOrder[];
  products: Product[];
  salesOrders: Order[];
  currentUser: User | null;
  onNewOP: () => void;
  onPrintOP: (op: ProductionOrder) => void;
  onAdvanceStage: (op: ProductionOrder) => void;
  onCompleteOP: (op: ProductionOrder) => void;
  onDeleteOP: (id: string) => Promise<void>;
}

export const ProductionOrdersView: React.FC<ProductionOrdersViewProps> = ({
  orders,
  products,
  salesOrders,
  currentUser,
  onNewOP,
  onPrintOP,
  onAdvanceStage,
  onCompleteOP,
  onDeleteOP,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredOrders = orders.filter((op) => {
    const matchesStatus =
      statusFilter === 'all' || op.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch =
      op.opNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (op.customerName && op.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (op.orderNumber && op.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleDelete = async (id: string, opNumber: string) => {
    if (confirm(`Tem certeza que deseja excluir a ordem de produção ${opNumber}?`)) {
      await onDeleteOP(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <ClipboardList className="w-4 h-4 text-emerald-600" />
            <span>Gestão de Chão de Fábrica</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Ordens de Produção (OP)
          </h1>
          <p className="text-xs text-slate-500">
            Emita, acompanhe as etapas e realize a baixa com dedução de estoque e registro de tempo
          </p>
        </div>

        <button
          onClick={onNewOP}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-emerald-400" />
          <span>Emitir Nova OP</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por OP, produto ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-hidden"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'Todas' },
            { id: 'Planejada', label: 'Planejadas' },
            { id: 'Em Andamento', label: 'Em Andamento' },
            { id: 'Concluída', label: 'Concluídas' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Production Orders Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">Ordem / Ref.</th>
                <th className="py-3 px-4">Produto & Lote</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Progresso das Etapas</th>
                <th className="py-3 px-4">Prazo Previsto</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    Nenhuma ordem de produção encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((op) => {
                  const completedStages = op.stages.filter((s) => s.status === 'Concluída').length;
                  const totalStages = op.stages.length || 1;
                  const progressPct = Math.round((completedStages / totalStages) * 100);

                  return (
                    <tr key={op.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900 text-xs">
                          {op.opNumber}
                        </div>
                        {op.orderNumber ? (
                          <div className="text-[11px] text-slate-500 font-mono">
                            Ped: {op.orderNumber}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400">Avulsa</div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 text-xs">
                          {op.productName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {op.quantity} {op.unit} · Cód: {op.productCode}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        {op.customerName || <span className="text-slate-400">Estoque Interno</span>}
                      </td>

                      <td className="py-3 px-4 min-w-[180px]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-600 font-mono">
                            <span>{completedStages}/{totalStages} etapas</span>
                            <span>{progressPct}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                op.status === 'Concluída'
                                  ? 'bg-emerald-600'
                                  : op.status === 'Em Andamento'
                                  ? 'bg-amber-500'
                                  : 'bg-blue-500'
                              }`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {op.plannedEndDate ? new Date(op.plannedEndDate).toLocaleDateString('pt-BR') : '-'}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-semibold ${
                            op.status === 'Concluída'
                              ? 'bg-emerald-100 text-emerald-800'
                              : op.status === 'Em Andamento'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {op.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Print sheet */}
                          <button
                            onClick={() => onPrintOP(op)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                            title="Imprimir Folha de OP"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Manage Stages */}
                          <button
                            onClick={() => onAdvanceStage(op)}
                            className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                            title="Acompanhar etapas"
                          >
                            Etapas
                          </button>

                          {/* Final Baixa */}
                          {op.status !== 'Concluída' && (
                            <button
                              onClick={() => onCompleteOP(op)}
                              className="px-2 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-xs"
                              title="Dar baixa de produção"
                            >
                              Baixa
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(op.id, op.opNumber)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Excluir OP"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
