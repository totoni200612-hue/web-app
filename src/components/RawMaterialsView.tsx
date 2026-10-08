import React, { useState } from 'react';
import { RawMaterial, Supplier } from '../types/erp';
import { 
  Boxes, 
  PlusCircle, 
  Search, 
  Trash2, 
  Edit2, 
  AlertTriangle, 
  Plus, 
  Minus, 
  X,
  SlidersHorizontal
} from 'lucide-react';

interface RawMaterialsViewProps {
  materials: RawMaterial[];
  suppliers: Supplier[];
  onSaveMaterial: (material: Partial<RawMaterial>) => Promise<void>;
  onDeleteMaterial: (id: string) => Promise<void>;
  onAdjustStock: (id: string, delta: number) => Promise<void>;
}

export const RawMaterialsView: React.FC<RawMaterialsViewProps> = ({
  materials,
  suppliers,
  onSaveMaterial,
  onDeleteMaterial,
  onAdjustStock,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('kg');
  const [stockQuantity, setStockQuantity] = useState(100);
  const [minStockQuantity, setMinStockQuantity] = useState(20);
  const [costPerUnit, setCostPerUnit] = useState(15.0);
  const [supplierId, setSupplierId] = useState('');
  const [location, setLocation] = useState('Galpão A');

  // Quick adjust modal state
  const [adjustModalMat, setAdjustModalMat] = useState<RawMaterial | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(10);
  const [adjustType, setAdjustType] = useState<'add' | 'remove'>('add');

  const openNewModal = () => {
    setEditingMaterial(null);
    setCode(`MP-${String(materials.length + 101)}`);
    setName('');
    setUnit('kg');
    setStockQuantity(50);
    setMinStockQuantity(20);
    setCostPerUnit(25.0);
    setSupplierId(suppliers[0]?.id || '');
    setLocation('Almoxarifado Geral');
    setIsModalOpen(true);
  };

  const openEditModal = (mat: RawMaterial) => {
    setEditingMaterial(mat);
    setCode(mat.code);
    setName(mat.name);
    setUnit(mat.unit);
    setStockQuantity(mat.stockQuantity);
    setMinStockQuantity(mat.minStockQuantity);
    setCostPerUnit(mat.costPerUnit);
    setSupplierId(mat.supplierId || '');
    setLocation(mat.location || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === supplierId);
    await onSaveMaterial({
      id: editingMaterial?.id,
      code,
      name,
      unit,
      stockQuantity: Number(stockQuantity),
      minStockQuantity: Number(minStockQuantity),
      costPerUnit: Number(costPerUnit),
      supplierId,
      supplierName: sup?.name,
      location,
    });
    setIsModalOpen(false);
  };

  const handleConfirmAdjust = async () => {
    if (!adjustModalMat) return;
    const delta = adjustType === 'add' ? adjustAmount : -adjustAmount;
    await onAdjustStock(adjustModalMat.id, delta);
    setAdjustModalMat(null);
  };

  const filteredMaterials = materials.filter((m) => {
    const s = searchTerm.toLowerCase();
    return (
      m.name.toLowerCase().includes(s) ||
      m.code.toLowerCase().includes(s) ||
      (m.location && m.location.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <Boxes className="w-4 h-4 text-emerald-600" />
            <span>Almoxarifado & Suprimentos</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Matérias-Primas & Controle de Estoque
          </h1>
          <p className="text-xs text-slate-500">
            Cadastre os insumos, monitore o estoque mínimo e registre entradas/saídas
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-emerald-400" />
          <span>Cadastrar Matéria-Prima</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar matéria-prima por código, nome ou almoxarifado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Descrição da Matéria-Prima</th>
                <th className="py-3 px-4">Unidade</th>
                <th className="py-3 px-4 text-right">Estoque Atual</th>
                <th className="py-3 px-4 text-right">Estoque Mínimo</th>
                <th className="py-3 px-4 text-right">Custo Unitário</th>
                <th className="py-3 px-4">Status / Local</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMaterials.map((mat) => {
                const isLow = mat.stockQuantity <= mat.minStockQuantity;
                return (
                  <tr key={mat.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {mat.code}
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {mat.name}
                      {mat.supplierName && (
                        <div className="text-[10px] text-slate-400 font-normal">
                          Forn: {mat.supplierName}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {mat.unit}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                      <span className={isLow ? 'text-red-600' : 'text-slate-900'}>
                        {mat.stockQuantity}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-500 tabular-nums">
                      {mat.minStockQuantity}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                      R$ {mat.costPerUnit.toFixed(2)}
                    </td>

                    <td className="py-3 px-4">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Reposição Crítica</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">
                          {mat.location || 'Almoxarifado'}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        {/* Quick stock adjustment button */}
                        <button
                          onClick={() => {
                            setAdjustModalMat(mat);
                            setAdjustAmount(10);
                            setAdjustType('add');
                          }}
                          className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors border border-emerald-200"
                          title="Ajustar Saldo de Estoque"
                        >
                          Ajustar
                        </button>

                        <button
                          onClick={() => openEditModal(mat)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md"
                          title="Editar matéria-prima"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Excluir a matéria-prima ${mat.name}?`)) {
                              onDeleteMaterial(mat.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New / Edit Material */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-base font-bold">
                {editingMaterial ? `Editar: ${editingMaterial.name}` : 'Cadastrar Matéria-Prima'}
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição do Insumo *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unidade *</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="kg">kg (Quilograma)</option>
                    <option value="unidade">unidade</option>
                    <option value="m">m (Metro linear)</option>
                    <option value="m²">m² (Metro quadrado)</option>
                    <option value="litros">litros</option>
                    <option value="peça">peça</option>
                    <option value="g">g (Grama)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Estoque Atual</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Estoque Mínimo</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={minStockQuantity}
                    onChange={(e) => setMinStockQuantity(Number(e.target.value))}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Custo Unitário (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={costPerUnit}
                    onChange={(e) => setCostPerUnit(Number(e.target.value))}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Local / Almoxarifado</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fornecedor Principal</label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">Nenhum fornecedor vinculado</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
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
                  Salvar Matéria-Prima
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Adjust Modal */}
      {adjustModalMat && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">
                Ajuste Rápido de Estoque
              </h3>
              <button
                onClick={() => setAdjustModalMat(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <div className="text-xs font-bold text-slate-800">{adjustModalMat.name}</div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Saldo Atual: <strong>{adjustModalMat.stockQuantity} {adjustModalMat.unit}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('add')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 cursor-pointer ${
                    adjustType === 'add'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Entrada (+Saldo)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('remove')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 cursor-pointer ${
                    adjustType === 'remove'
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>Saída (-Saldo)</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantidade a {adjustType === 'add' ? 'adicionar' : 'baixar'} ({adjustModalMat.unit})
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Math.max(0.1, Number(e.target.value)))}
                  className="w-full text-sm font-mono px-3 py-2 border border-slate-300 rounded-lg focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => setAdjustModalMat(null)}
                  className="px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmAdjust}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded shadow-xs"
                >
                  Confirmar Ajuste
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
