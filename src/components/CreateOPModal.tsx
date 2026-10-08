import React, { useState, useEffect } from 'react';
import { Product, Order, User, ProductionOrder } from '../types/erp';
import { X, PlusCircle, Layers, Calendar, Clock, AlertCircle } from 'lucide-react';

interface CreateOPModalProps {
  products: Product[];
  orders: Order[];
  currentUser: User | null;
  onClose: () => void;
  onSubmit: (opData: Partial<ProductionOrder>) => Promise<void>;
  initialOrderId?: string;
}

export const CreateOPModal: React.FC<CreateOPModalProps> = ({
  products,
  orders,
  currentUser,
  onClose,
  onSubmit,
  initialOrderId,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [selectedOrderId, setSelectedOrderId] = useState<string>(initialOrderId || '');
  const [quantity, setQuantity] = useState<number>(10);
  const [priority, setPriority] = useState<'Baixa' | 'Normal' | 'Alta' | 'Urgente'>('Normal');
  const [plannedStartDate, setPlannedStartDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [plannedEndDate, setPlannedEndDate] = useState<string>(
    new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If initialOrderId changed, preset values
  useEffect(() => {
    if (initialOrderId) {
      const order = orders.find((o) => o.id === initialOrderId);
      if (order && order.items.length > 0) {
        setSelectedOrderId(order.id);
        const firstItem = order.items[0];
        const prod = products.find((p) => p.id === firstItem.productId);
        if (prod) {
          setSelectedProductId(prod.id);
          setQuantity(firstItem.quantity);
        }
      }
    }
  }, [initialOrderId, orders, products]);

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  const estimatedMinutes = selectedProduct
    ? selectedProduct.processTimeMinutes * quantity
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        productId: selectedProduct.id,
        productCode: selectedProduct.code,
        productName: selectedProduct.name,
        quantity: Number(quantity),
        unit: selectedProduct.unit,
        priority,
        status: 'Planejada',
        plannedStartDate: new Date(plannedStartDate).toISOString(),
        plannedEndDate: new Date(plannedEndDate).toISOString(),
        orderId: selectedOrder?.id,
        orderNumber: selectedOrder?.orderNumber,
        customerId: selectedOrder?.customerId,
        customerName: selectedOrder?.customerName,
      });
      onClose();
    } catch (err: any) {
      alert(`Erro ao criar Ordem de Produção: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Emissão de Nova Ordem de Produção (OP)
              </h2>
              <div className="text-xs text-slate-300">
                Geração automática do roteiro de etapas e requisição de insumos
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Order linking (optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Vincular a Pedido de Venda (Opcional)
            </label>
            <select
              value={selectedOrderId}
              onChange={(e) => {
                const oId = e.target.value;
                setSelectedOrderId(oId);
                const ord = orders.find((o) => o.id === oId);
                if (ord && ord.items.length > 0) {
                  const item = ord.items[0];
                  setSelectedProductId(item.productId);
                  setQuantity(item.quantity);
                }
              }}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-hidden"
            >
              <option value="">Nenhum (Ordem Avulsa para Estoque)</option>
              {orders
                .filter((o) => o.status !== 'Concluído' && o.status !== 'Cancelado')
                .map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.orderNumber} — {o.customerName} (Entrega: {new Date(o.deliveryDate).toLocaleDateString('pt-BR')})
                  </option>
                ))}
            </select>
          </div>

          {/* Product selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Produto / Ficha Técnica *
              </label>
              <select
                required
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-hidden"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.code}] {p.name} ({p.processTimeMinutes} min/un)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantidade a Produzir *
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Priority & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prioridade
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="Baixa">Baixa</option>
                <option value="Normal">Normal</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data Prevista Início
              </label>
              <input
                type="date"
                required
                value={plannedStartDate}
                onChange={(e) => setPlannedStartDate(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data Prevista Término
              </label>
              <input
                type="date"
                required
                value={plannedEndDate}
                onChange={(e) => setPlannedEndDate(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Automatic BOM and Stages Preview */}
          {selectedProduct && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>Resumo da Ficha Técnica vinculada</span>
                </div>
                <div className="text-[11px] font-mono text-slate-600">
                  Tempo Estimado Total: <strong className="text-slate-900">{Math.round(estimatedMinutes / 60)}h ({estimatedMinutes} min)</strong>
                </div>
              </div>

              {/* Stages */}
              <div className="text-[11px] text-slate-600">
                <span className="font-semibold text-slate-700">Etapas do Processo:</span>{' '}
                {selectedProduct.stages.length > 0
                  ? selectedProduct.stages.map((s, idx) => `${idx + 1}. ${s.name}`).join(' → ')
                  : 'Nenhuma etapa cadastrada'}
              </div>

              {/* Materials */}
              <div className="text-[11px] text-slate-600">
                <span className="font-semibold text-slate-700">Consumo Previsto de Insumos:</span>{' '}
                {selectedProduct.materials.length > 0 ? (
                  <span className="font-mono">
                    {selectedProduct.materials
                      .map((m) => `${m.rawMaterialName}: ${(m.quantity * quantity).toFixed(1)} ${m.unit}`)
                      .join(' | ')}
                  </span>
                ) : (
                  'Nenhum insumo associado'
                )}
              </div>
            </div>
          )}

          {/* Technical Responsible Sign-off Notice */}
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-200">
            <span>
              Responsável Técnico emissor:{' '}
              <strong className="text-slate-800">{currentUser?.name}</strong> {currentUser?.registrationNumber ? `(${currentUser.registrationNumber})` : ''}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedProduct}
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Gerando Ordem...' : 'Emitir Ordem de Produção'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
