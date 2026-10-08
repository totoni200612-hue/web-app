import React, { useState } from 'react';
import { Product, RawMaterial, ProductionCapacity, MaterialRequirement, ProductionStageTemplate } from '../types/erp';
import { 
  Layers, 
  PlusCircle, 
  Search, 
  Trash2, 
  Edit2, 
  Clock, 
  Boxes, 
  Cpu, 
  X,
  Plus
} from 'lucide-react';

interface ProductsViewProps {
  products: Product[];
  rawMaterials: RawMaterial[];
  capacities: ProductionCapacity[];
  onSaveProduct: (product: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  rawMaterials,
  capacities,
  onSaveProduct,
  onDeleteProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('peça');
  const [category, setCategory] = useState('Usinagem');
  const [costPrice, setCostPrice] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [stockQuantity, setStockQuantity] = useState(0);
  const [materials, setMaterials] = useState<MaterialRequirement[]>([]);
  const [stages, setStages] = useState<ProductionStageTemplate[]>([]);

  // Material builder row
  const [selectedMatId, setSelectedMatId] = useState(rawMaterials[0]?.id || '');
  const [matQty, setMatQty] = useState(1);

  // Stage builder row
  const [stageName, setStageName] = useState('');
  const [stageMinutes, setStageMinutes] = useState(30);
  const [stageMachineId, setStageMachineId] = useState(capacities[0]?.id || '');

  const openNewModal = () => {
    setEditingProduct(null);
    setCode(`PROD-${String(products.length + 1).padStart(3, '0')}`);
    setName('');
    setDescription('');
    setUnit('peça');
    setCategory('Manufatura Geral');
    setCostPrice(50);
    setSalePrice(120);
    setStockQuantity(0);
    setMaterials([]);
    setStages([]);
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setCode(prod.code);
    setName(prod.name);
    setDescription(prod.description);
    setUnit(prod.unit);
    setCategory(prod.category);
    setCostPrice(prod.costPrice);
    setSalePrice(prod.salePrice);
    setStockQuantity(prod.stockQuantity);
    setMaterials(prod.materials || []);
    setStages(prod.stages || []);
    setIsModalOpen(true);
  };

  const handleAddMaterial = () => {
    const raw = rawMaterials.find((m) => m.id === selectedMatId);
    if (!raw) return;
    setMaterials([
      ...materials,
      {
        rawMaterialId: raw.id,
        rawMaterialName: raw.name,
        quantity: matQty,
        unit: raw.unit,
      },
    ]);
  };

  const handleRemoveMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleAddStage = () => {
    if (!stageName.trim()) return;
    const mach = capacities.find((c) => c.id === stageMachineId);
    setStages([
      ...stages,
      {
        id: `stg-${Date.now()}`,
        name: stageName,
        sequence: stages.length + 1,
        estimatedMinutes: Number(stageMinutes),
        machineId: mach?.id,
        machineName: mach?.name,
      },
    ]);
    setStageName('');
  };

  const handleRemoveStage = (index: number) => {
    setStages(stages.filter((_, i) => i !== index));
  };

  const totalProcessMinutes = stages.reduce((acc, s) => acc + s.estimatedMinutes, 0) || 60;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveProduct({
      id: editingProduct?.id,
      code,
      name,
      description,
      unit,
      category,
      costPrice: Number(costPrice),
      salePrice: Number(salePrice),
      stockQuantity: Number(stockQuantity),
      processTimeMinutes: totalProcessMinutes,
      materials,
      stages,
    });
    setIsModalOpen(false);
  };

  const filteredProducts = products.filter((p) => {
    const s = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(s) ||
      p.code.toLowerCase().includes(s) ||
      p.category.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Engenharia de Processos</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Ficha Técnica de Produtos (BOM)
          </h1>
          <p className="text-xs text-slate-500">
            Cadastre os tempos padrão de processo, insumos e roteiros de operações
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-emerald-400" />
          <span>Nova Ficha Técnica</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por código, nome ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Products Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-800 rounded">
                  {p.code}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {p.category}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm mb-1 leading-snug">
                {p.name}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                {p.description || 'Sem descrição cadastrada.'}
              </p>

              {/* Technical details badge */}
              <div className="grid grid-cols-2 gap-2 text-xs p-2.5 bg-slate-50 rounded-lg border border-slate-100 mb-3">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Tempo de Ciclo</div>
                  <div className="font-mono font-bold text-slate-800 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{p.processTimeMinutes} min</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Estoque Acabado</div>
                  <div className="font-mono font-bold text-emerald-700">
                    {p.stockQuantity} {p.unit}
                  </div>
                </div>
              </div>

              {/* Stages Summary */}
              <div className="text-[11px] text-slate-600 mb-2">
                <strong className="text-slate-800">Etapas ({p.stages.length}):</strong>{' '}
                {p.stages.length > 0
                  ? p.stages.map((s) => s.name).join(' → ')
                  : 'Nenhuma cadastrada'}
              </div>

              {/* BOM Materials Summary */}
              <div className="text-[11px] text-slate-600">
                <strong className="text-slate-800">Insumos ({p.materials.length}):</strong>{' '}
                {p.materials.length > 0
                  ? p.materials.map((m) => `${m.rawMaterialName} (${m.quantity} ${m.unit})`).join(', ')
                  : 'Nenhum insumo vinculado'}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100">
              <span className="text-xs font-mono font-bold text-slate-900">
                R$ {p.salePrice.toFixed(2)}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(p)}
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md"
                  title="Editar Ficha Técnica"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Excluir a ficha técnica de ${p.name}?`)) {
                      onDeleteProduct(p.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                  title="Excluir Ficha Técnica"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal New / Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-base font-bold">
                {editingProduct ? `Editar Ficha Técnica: ${editingProduct.code}` : 'Nova Ficha Técnica de Produto'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Produto *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição Técnica</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unidade</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Categoria</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Preço de Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={salePrice}
                    onChange={(e) => setSalePrice(Number(e.target.value))}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Estoque Inicial</label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* BOM Materials Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Composição de Matérias-Primas (BOM por unidade)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <select
                      value={selectedMatId}
                      onChange={(e) => setSelectedMatId(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                    >
                      {rawMaterials.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Qtd/un"
                      value={matQty}
                      onChange={(e) => setMatQty(Number(e.target.value))}
                      className="w-full text-xs font-mono px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={handleAddMaterial}
                      className="w-full py-1.5 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800"
                    >
                      + Adicionar Insumo
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  {materials.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded text-xs"
                    >
                      <span>
                        {m.rawMaterialName}: <strong>{m.quantity} {m.unit}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMaterial(idx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {materials.length === 0 && (
                    <div className="text-[11px] text-slate-400 italic">
                      Nenhuma matéria-prima associada à ficha técnica.
                    </div>
                  )}
                </div>
              </div>

              {/* Process Stages Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Etapas do Processo & Máquinas (Roteiro de Fabricação)
                  </span>
                  <span className="text-xs font-mono text-slate-600">
                    Tempo total de processo: <strong>{totalProcessMinutes} min</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Nome da etapa (ex: Torneamento CNC)"
                      value={stageName}
                      onChange={(e) => setStageName(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <select
                      value={stageMachineId}
                      onChange={(e) => setStageMachineId(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                    >
                      {capacities.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={stageMinutes}
                      onChange={(e) => setStageMinutes(Number(e.target.value))}
                      className="w-16 text-xs font-mono px-2 py-1.5 border border-slate-300 rounded bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddStage}
                      className="flex-1 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800"
                    >
                      + Etapa
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  {stages.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 font-mono text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-900">{s.name}</span>
                        {s.machineName && (
                          <span className="text-slate-500 text-[11px]">({s.machineName})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-700">{s.estimatedMinutes} min</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveStage(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {stages.length === 0 && (
                    <div className="text-[11px] text-slate-400 italic">
                      Nenhuma etapa adicionada ao roteiro.
                    </div>
                  )}
                </div>
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
                  Salvar Ficha Técnica
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
