import React, { useState } from 'react';
import { ProductionCapacity } from '../types/erp';
import { 
  Cpu, 
  PlusCircle, 
  Search, 
  Trash2, 
  Edit2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  X 
} from 'lucide-react';

interface CapacitiesViewProps {
  capacities: ProductionCapacity[];
  onSaveCapacity: (capacity: Partial<ProductionCapacity>) => Promise<void>;
  onDeleteCapacity: (id: string) => Promise<void>;
}

export const CapacitiesView: React.FC<CapacitiesViewProps> = ({
  capacities,
  onSaveCapacity,
  onDeleteCapacity,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCapacity, setEditingCapacity] = useState<ProductionCapacity | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<ProductionCapacity['type']>('Máquina');
  const [status, setStatus] = useState<ProductionCapacity['status']>('Operacional');
  const [hoursPerDay, setHoursPerDay] = useState(16);
  const [workingDaysPerWeek, setWorkingDaysPerWeek] = useState(5);
  const [hourlyRate, setHourlyRate] = useState(150.0);
  const [notes, setNotes] = useState('');

  const openNewModal = () => {
    setEditingCapacity(null);
    setCode(`CAP-${String(capacities.length + 1).padStart(2, '0')}`);
    setName('');
    setType('Máquina');
    setStatus('Operacional');
    setHoursPerDay(16);
    setWorkingDaysPerWeek(5);
    setHourlyRate(140.0);
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (cap: ProductionCapacity) => {
    setEditingCapacity(cap);
    setCode(cap.code);
    setName(cap.name);
    setType(cap.type);
    setStatus(cap.status);
    setHoursPerDay(cap.hoursPerDay);
    setWorkingDaysPerWeek(cap.workingDaysPerWeek);
    setHourlyRate(cap.hourlyRate || 0);
    setNotes(cap.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveCapacity({
      id: editingCapacity?.id,
      code,
      name,
      type,
      status,
      hoursPerDay: Number(hoursPerDay),
      workingDaysPerWeek: Number(workingDaysPerWeek),
      hourlyRate: Number(hourlyRate),
      notes,
    });
    setIsModalOpen(false);
  };

  const filtered = capacities.filter((c) => {
    const s = searchTerm.toLowerCase();
    return c.name.toLowerCase().includes(s) || c.code.toLowerCase().includes(s);
  });

  const totalMonthlyHours = capacities
    .filter((c) => c.status === 'Operacional')
    .reduce((acc, c) => acc + c.hoursPerDay * c.workingDaysPerWeek * 4.33, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4 text-emerald-600" />
            <span>Engenharia & Chão de Fábrica</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Capacidade Produtiva & Postos de Trabalho
          </h1>
          <p className="text-xs text-slate-500">
            Máquinas, linhas de montagem, turnos e horas de operação disponíveis por período
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-emerald-400" />
          <span>Cadastrar Máquina / Linha</span>
        </button>
      </div>

      {/* Overview Metric Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Capacidade Total Instalada
          </span>
          <div className="text-2xl font-black font-mono mt-0.5">
            {Math.round(totalMonthlyHours).toLocaleString('pt-BR')} horas / mês
          </div>
          <p className="text-xs text-slate-300">
            Considerando postos operacionais em regime industrial padrão (4,33 semanas/mês).
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">Postos Ativos</div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {capacities.filter((c) => c.status === 'Operacional').length} de {capacities.length}
          </div>
        </div>
      </div>

      {/* Grid of machines/lines */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cap) => {
          const monthlyHours = Math.round(cap.hoursPerDay * cap.workingDaysPerWeek * 4.33);
          return (
            <div
              key={cap.id}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-800 rounded">
                    {cap.code}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      cap.status === 'Operacional'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {cap.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mb-1">{cap.name}</h3>
                <div className="text-[11px] text-slate-500 mb-3">{cap.type}</div>

                <div className="grid grid-cols-2 gap-2 text-xs p-2.5 bg-slate-50 rounded-lg border border-slate-100 mb-3">
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">Jornada Diária</div>
                    <div className="font-mono font-bold text-slate-800">{cap.hoursPerDay}h / dia</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">Capac. Mensal</div>
                    <div className="font-mono font-bold text-slate-800">{monthlyHours}h / mês</div>
                  </div>
                </div>

                {cap.notes && (
                  <p className="text-[11px] text-slate-500 italic line-clamp-2">
                    {cap.notes}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100">
                <span className="text-xs font-mono text-slate-700">
                  {cap.hourlyRate ? `R$ ${cap.hourlyRate.toFixed(2)}/h` : 'Custo não def.'}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(cap)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md"
                    title="Editar Capacidade"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Excluir a máquina/linha ${cap.name}?`)) {
                        onDeleteCapacity(cap.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: New / Edit Capacity */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-base font-bold">
                {editingCapacity ? `Editar: ${editingCapacity.name}` : 'Cadastrar Posto / Capacidade Produtiva'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Código *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome da Máquina / Linha *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Posto</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Máquina">Máquina</option>
                    <option value="Linha de Montagem">Linha de Montagem</option>
                    <option value="Célula de Trabalho">Célula de Trabalho</option>
                    <option value="Bancada de Testes">Bancada de Testes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Operacional</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Operacional">Operacional</option>
                    <option value="Em Manutenção">Em Manutenção</option>
                    <option value="Parada">Parada</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Horas / Dia</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={hoursPerDay}
                    onChange={(e) => setHoursPerDay(Number(e.target.value))}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dias / Semana</label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={workingDaysPerWeek}
                    onChange={(e) => setWorkingDaysPerWeek(Number(e.target.value))}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Custo Hora (R$)</label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Especificações Técnicas / Observações</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm"
                >
                  Salvar Capacidade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
