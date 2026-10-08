import React from 'react';
import { 
  SystemStats, 
  ProductionOrder, 
  RawMaterial, 
  ProductionCapacity,
  User 
} from '../types/erp';
import { 
  ClipboardList, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  ArrowRight,
  PlusCircle,
  Printer
} from 'lucide-react';

interface DashboardViewProps {
  stats: SystemStats | null;
  productionOrders: ProductionOrder[];
  rawMaterials: RawMaterial[];
  capacities: ProductionCapacity[];
  currentUser: User | null;
  onNavigateTab: (tab: any) => void;
  onNewOP: () => void;
  onPrintOP: (op: ProductionOrder) => void;
  onAdvanceStage: (op: ProductionOrder) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  productionOrders,
  rawMaterials,
  capacities,
  currentUser,
  onNavigateTab,
  onNewOP,
  onPrintOP,
  onAdvanceStage,
}) => {
  const activeOrders = productionOrders.filter(
    (op) => op.status === 'Em Andamento' || op.status === 'Planejada'
  );

  const lowStockMaterials = rawMaterials.filter(
    (m) => m.stockQuantity <= m.minStockQuantity
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Technical Responsible Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Painel Executivo de Produção (PCP)
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Controle de Operações & Chão de Fábrica
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Responsável Técnico ativo: <strong className="text-slate-800">{currentUser?.name}</strong> {currentUser?.registrationNumber ? `(${currentUser.registrationNumber})` : ''} · {currentUser?.role}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNewOP}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Emitir Ordem de Produção</span>
          </button>
          <button
            onClick={() => onNavigateTab('reports')}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            Ver Relatórios
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">OPs em Andamento</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
            {stats?.inProgressOPs ?? 0}
          </div>
          <span className="text-[10px] text-slate-400">Ativas na fábrica</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">OPs Planejadas</span>
            <ClipboardList className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
            {stats?.plannedOPs ?? 0}
          </div>
          <span className="text-[10px] text-slate-400">Aguardando início</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">OPs Concluídas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
            {stats?.completedOPs ?? 0}
          </div>
          <span className="text-[10px] text-slate-400">Finalizadas com baixa</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Estoque Crítico</span>
            <AlertTriangle className={`w-4 h-4 ${(stats?.lowStockCount ?? 0) > 0 ? 'text-red-500' : 'text-slate-400'}`} />
          </div>
          <div className={`text-xl font-bold font-mono tabular-nums ${(stats?.lowStockCount ?? 0) > 0 ? 'text-red-600' : 'text-slate-900'}`}>
            {stats?.lowStockCount ?? 0}
          </div>
          <span className="text-[10px] text-slate-400">Abaixo do mínimo</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Fichas Técnicas</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
            {stats?.totalProducts ?? 0}
          </div>
          <span className="text-[10px] text-slate-400">Produtos cadastrados</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Horas Produzidas</span>
            <Cpu className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
            {stats?.totalHoursProduced ?? 0}h
          </div>
          <span className="text-[10px] text-slate-400">Tempo total registrado</span>
        </div>
      </div>

      {/* Main Grid: Active Production Orders & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Production Orders (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Ordens de Produção em Andamento & Planejadas
                </h2>
                <p className="text-xs text-slate-500">
                  Acompanhe as etapas de fabricação e liberação em tempo real
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('production-orders')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Ver todas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeOrders.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                Nenhuma ordem de produção em andamento ou planejada no momento.
              </div>
            ) : (
              <div className="space-y-3">
                {activeOrders.slice(0, 5).map((op) => {
                  const completedStages = op.stages.filter((s) => s.status === 'Concluída').length;
                  const totalStages = op.stages.length || 1;
                  const progressPct = Math.round((completedStages / totalStages) * 100);
                  const currentStage = op.stages.find((s) => s.status === 'Em Andamento') || op.stages.find((s) => s.status === 'Pendente');

                  return (
                    <div
                      key={op.id}
                      className="border border-slate-200 rounded-lg p-3.5 hover:border-slate-300 transition-colors bg-slate-50/50"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {op.opNumber}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm ${
                            op.status === 'Em Andamento' 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {op.status}
                          </span>
                          {op.orderNumber && (
                            <span className="text-[11px] text-slate-500 font-mono">
                              Ref: {op.orderNumber}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onPrintOP(op)}
                            className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-2 py-1 rounded hover:bg-slate-50"
                            title="Imprimir Folha de OP"
                          >
                            <Printer className="w-3 h-3 text-slate-500" />
                            <span>Imprimir</span>
                          </button>
                          <button
                            onClick={() => onAdvanceStage(op)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded hover:bg-emerald-100"
                          >
                            <span>Gerenciar Etapas</span>
                          </button>
                        </div>
                      </div>

                      <div className="text-xs font-semibold text-slate-800 mb-1">
                        {op.productName} <span className="font-mono text-slate-500 font-normal">({op.quantity} {op.unit})</span>
                      </div>

                      {op.customerName && (
                        <div className="text-[11px] text-slate-500 mb-2">
                          Cliente: {op.customerName}
                        </div>
                      )}

                      {/* Progress bar and current stage */}
                      <div className="space-y-1 mt-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-600">
                          <span>
                            Etapa: <strong className="text-slate-800">{currentStage?.name || 'Todas finalizadas'}</strong> {currentStage?.machineName ? `(${currentStage.machineName})` : ''}
                          </span>
                          <span className="font-mono tabular-nums font-semibold text-slate-700">
                            {completedStages}/{totalStages} ({progressPct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              op.status === 'Em Andamento' ? 'bg-amber-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Inventory Alerts & Machine Capacity */}
        <div className="space-y-6">
          {/* Inventory Alerts */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">
                  Estoque de Matérias-Primas
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('raw-materials')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Gerenciar
              </button>
            </div>

            {lowStockMaterials.length === 0 ? (
              <div className="text-center py-4 text-emerald-700 text-xs font-medium">
                Nenhum insumo abaixo do estoque mínimo. Estoque em nível seguro.
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded p-2">
                  Atenção: Os seguintes itens exigem reposição imediata para evitar paradas produtivas:
                </div>
                {lowStockMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-red-50/60 border border-red-200 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 font-mono text-[11px]">
                        {mat.code}
                      </div>
                      <div className="text-slate-700 text-xs truncate max-w-[170px]">
                        {mat.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Mínimo: {mat.minStockQuantity} {mat.unit}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-red-600 font-mono tabular-nums text-sm">
                        {mat.stockQuantity} {mat.unit}
                      </div>
                      <span className="text-[10px] text-red-700 font-semibold">
                        Repor
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Machine & Line Capacities */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Capacidade Instalada
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('capacities')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Ver Máquinas
              </button>
            </div>

            <div className="space-y-2">
              {capacities.slice(0, 4).map((cap) => (
                <div
                  key={cap.id}
                  className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-900">{cap.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {cap.hoursPerDay}h/dia · {cap.workingDaysPerWeek} dias/sem
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    cap.status === 'Operacional'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {cap.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
