import React, { useState } from 'react';
import { ProductionOrder, Product, ProductionCapacity, User } from '../types/erp';
import { 
  BarChart3, 
  Printer, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  HardHat, 
  Cpu, 
  Layers 
} from 'lucide-react';

interface ReportsViewProps {
  productionOrders: ProductionOrder[];
  products: Product[];
  capacities: ProductionCapacity[];
  currentUser: User | null;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  productionOrders,
  products,
  capacities,
  currentUser,
}) => {
  const [dateFilterStart, setDateFilterStart] = useState<string>('');
  const [dateFilterEnd, setDateFilterEnd] = useState<string>('');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter orders
  const filtered = productionOrders.filter((op) => {
    if (productFilter !== 'all' && op.productId !== productFilter) return false;
    if (statusFilter !== 'all' && op.status !== statusFilter) return false;
    if (dateFilterStart && new Date(op.plannedStartDate) < new Date(dateFilterStart)) return false;
    if (dateFilterEnd && new Date(op.plannedStartDate) > new Date(dateFilterEnd + 'T23:59:59')) return false;
    return true;
  });

  // Calculate Aggregates
  const totalOPs = filtered.length;
  const completedOPs = filtered.filter((op) => op.status === 'Concluída');
  const inProgressOPs = filtered.filter((op) => op.status === 'Em Andamento');
  const plannedOPs = filtered.filter((op) => op.status === 'Planejada');

  const totalEstimatedMinutes = filtered.reduce((acc, op) => acc + (op.estimatedTotalMinutes || 0), 0);
  const totalActualMinutes = completedOPs.reduce((acc, op) => acc + (op.actualTotalMinutes || op.estimatedTotalMinutes || 0), 0);

  // Time tracking analysis per product
  const productPerformance = products.map((prod) => {
    const prodOPs = completedOPs.filter((op) => op.productId === prod.id);
    const totalProducedUnits = prodOPs.reduce((acc, op) => acc + (op.approvedQuantity || op.quantity), 0);
    const totalProdEstimatedMin = prodOPs.reduce((acc, op) => acc + op.estimatedTotalMinutes, 0);
    const totalProdActualMin = prodOPs.reduce((acc, op) => acc + (op.actualTotalMinutes || op.estimatedTotalMinutes), 0);
    const avgRealCycleTime = totalProducedUnits > 0 ? Math.round(totalProdActualMin / totalProducedUnits) : prod.processTimeMinutes;
    const variancePct = totalProdEstimatedMin > 0
      ? Math.round(((totalProdActualMin - totalProdEstimatedMin) / totalProdEstimatedMin) * 100)
      : 0;

    return {
      product: prod,
      countOPs: prodOPs.length,
      unitsProduced: totalProducedUnits,
      standardCycleTime: prod.processTimeMinutes,
      avgRealCycleTime,
      variancePct,
    };
  });

  // Machine usage tracking
  const machineWorkload = capacities.map((cap) => {
    let allocatedMinutes = 0;
    filtered.forEach((op) => {
      op.stages.forEach((stg) => {
        if (stg.machineId === cap.id || stg.machineName === cap.name) {
          allocatedMinutes += stg.actualMinutes || stg.estimatedMinutes || 0;
        }
      });
    });

    const monthlyAvailableMin = cap.hoursPerDay * cap.workingDaysPerWeek * 4.33 * 60;
    const loadPct = monthlyAvailableMin > 0 ? Math.min(100, Math.round((allocatedMinutes / monthlyAvailableMin) * 100)) : 0;

    return {
      capacity: cap,
      allocatedHours: Number((allocatedMinutes / 60).toFixed(1)),
      monthlyCapacityHours: Math.round(monthlyAvailableMin / 60),
      loadPct,
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>Relatórios & Rastreabilidade</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Acompanhamento de Produção & Gargalos
          </h1>
          <p className="text-xs text-slate-500">
            Rastreamento de tempo planejado vs realizado, ocupação de capacidade e eficiência
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir Relatório</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="no-print bg-white border border-slate-200 rounded-lg p-3.5 grid grid-cols-1 sm:grid-cols-4 gap-3 shadow-xs text-xs">
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
            Filtrar por Produto
          </label>
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
          >
            <option value="all">Todos os Produtos</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
            Status da Ordem
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
          >
            <option value="all">Todos os Status</option>
            <option value="Planejada">Planejada</option>
            <option value="Em Andamento">Em Andamento</option>
            <option value="Concluída">Concluída</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
            Data Inicial
          </label>
          <input
            type="date"
            value={dateFilterStart}
            onChange={(e) => setDateFilterStart(e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
            Data Final
          </label>
          <input
            type="date"
            value={dateFilterEnd}
            onChange={(e) => setDateFilterEnd(e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
          />
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Total de OPs no Filtro</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">{totalOPs}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {completedOPs.length} concluídas · {inProgressOPs.length} em andamento
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Taxa de Conclusão</div>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
            {totalOPs > 0 ? Math.round((completedOPs.length / totalOPs) * 100) : 0}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Ordens finalizadas com baixa</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Tempo Total Previsto</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            {(totalEstimatedMinutes / 60).toFixed(1)}h
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{totalEstimatedMinutes} minutos calculados</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Tempo Real Executado</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            {(totalActualMinutes / 60).toFixed(1)}h
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Nas ordens concluídas</div>
        </div>
      </div>

      {/* Product Cycle Time Tracking: Standard vs Real */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Rastreamento de Tempo de Ciclo por Produto (Padrão vs Real)
            </h2>
            <p className="text-xs text-slate-500">
              Comparação entre a estimativa da Ficha Técnica e o tempo real apontado pelos operadores
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-4">Código / Produto</th>
                <th className="py-2.5 px-4 text-center">Unidades Concluídas</th>
                <th className="py-2.5 px-4 text-right">Tempo Padrão (Ficha)</th>
                <th className="py-2.5 px-4 text-right">Tempo Real Médio</th>
                <th className="py-2.5 px-4 text-right">Variação (%)</th>
                <th className="py-2.5 px-4">Desempenho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productPerformance.map((item) => {
                const isOver = item.variancePct > 5;
                const isUnder = item.variancePct < -5;

                return (
                  <tr key={item.product.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <span className="font-mono text-xs font-bold mr-2 text-slate-600">
                        {item.product.code}
                      </span>
                      {item.product.name}
                    </td>

                    <td className="py-3 px-4 text-center font-mono tabular-nums">
                      {item.unitsProduced} {item.product.unit} ({item.countOPs} OPs)
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                      {item.standardCycleTime} min/un
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                      {item.avgRealCycleTime} min/un
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      <span
                        className={`font-semibold ${
                          isOver ? 'text-red-600' : isUnder ? 'text-emerald-600' : 'text-slate-600'
                        }`}
                      >
                        {item.variancePct > 0 ? `+${item.variancePct}%` : `${item.variancePct}%`}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {isOver ? (
                        <span className="text-[10px] font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                          Lento (+{item.variancePct}%)
                        </span>
                      ) : isUnder ? (
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          Mais Rápido
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          Dentro do Padrão
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Machine & Post Bottleneck Analysis */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="pb-3 border-b border-slate-200 mb-4">
          <h2 className="text-sm font-bold text-slate-900">
            Análise de Ocupação & Identificação de Gargalos nas Máquinas
          </h2>
          <p className="text-xs text-slate-500">
            Horas demandadas pelas OPs do período versus capacidade disponível do posto
          </p>
        </div>

        <div className="space-y-4">
          {machineWorkload.map((m) => (
            <div key={m.capacity.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900">{m.capacity.code}</span>
                  <span className="font-semibold text-slate-800">{m.capacity.name}</span>
                  <span className="text-[11px] text-slate-500">({m.capacity.type})</span>
                </div>
                <div className="font-mono text-slate-700 text-xs">
                  <strong>{m.allocatedHours}h</strong> demandadas / {m.monthlyCapacityHours}h disp. ({m.loadPct}%)
                </div>
              </div>

              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    m.loadPct > 85 ? 'bg-red-500' : m.loadPct > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.max(2, m.loadPct)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Responsible Official Sign-off on Report */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            <HardHat className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">
              Relatório de Produção Autenticado Tecnicamente
            </div>
            <div className="text-xs text-slate-600">
              Responsável Técnico: <strong>{currentUser?.name}</strong> · {currentUser?.role}
              {currentUser?.registrationNumber ? ` (${currentUser.registrationNumber})` : ''}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Data de Emissão: {new Date().toLocaleString('pt-BR')}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="inline-block w-48 border-b border-slate-400 pb-1"></div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">
            Visto / Assinatura do Responsável
          </div>
        </div>
      </div>
    </div>
  );
};
