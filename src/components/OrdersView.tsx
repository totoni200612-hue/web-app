import React, { useState } from 'react';
import { Order, Customer, Product, OrderItem } from '../types/erp';
import { 
  ShoppingCart, 
  PlusCircle, 
  Search, 
  Trash2, 
  Calendar, 
  User, 
  FilePlus, 
  X,
  Edit2
} from 'lucide-react';

interface OrdersViewProps {
  orders: Order[];
  customers: Customer[];
  products: Product[];
  onSaveOrder: (order: Partial<Order>) => Promise<void>;
  onDeleteOrder: (id: string) => Promise<void>;
  onGenerateOP: (orderId: string) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  customers,
  products,
  onSaveOrder,
  onDeleteOrder,
  onGenerateOP,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Form states
  const [customerId, setCustomerId] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [orderStatus, setOrderStatus] = useState<Order['status']>('Pendente');
  const [items, setItems] = useState<OrderItem[]>([]);

  // Item row input
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemUnitPrice, setItemUnitPrice] = useState(products[0]?.salePrice || 0);

  const openNewModal = () => {
    setEditingOrder(null);
    setCustomerId(customers[0]?.id || '');
    setDeliveryDate(new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10));
    setNotes('');
    setOrderStatus('Pendente');
    const firstProd = products[0];
    if (firstProd) {
      setItems([
        {
          productId: firstProd.id,
          productCode: firstProd.code,
          productName: firstProd.name,
          quantity: 10,
          unitPrice: firstProd.salePrice,
          total: 10 * firstProd.salePrice,
        },
      ]);
    } else {
      setItems([]);
    }
    setIsModalOpen(true);
  };

  const openEditModal = (order: Order) => {
    setEditingOrder(order);
    setCustomerId(order.customerId);
    setDeliveryDate(order.deliveryDate);
    setNotes(order.notes || '');
    setOrderStatus(order.status);
    setItems(order.items || []);
    setIsModalOpen(true);
  };

  const handleAddItem = () => {
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;
    const newItem: OrderItem = {
      productId: prod.id,
      productCode: prod.code,
      productName: prod.name,
      quantity: itemQuantity,
      unitPrice: itemUnitPrice,
      total: itemQuantity * itemUnitPrice,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find((c) => c.id === customerId);
    const totalAmount = items.reduce((acc, item) => acc + item.total, 0);

    await onSaveOrder({
      id: editingOrder?.id,
      orderNumber: editingOrder?.orderNumber,
      customerId,
      customerName: customer?.name || 'Cliente Geral',
      deliveryDate,
      notes,
      status: orderStatus,
      items,
      totalAmount,
    });

    setIsModalOpen(false);
  };

  const filteredOrders = orders.filter((o) => {
    const s = searchTerm.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(s) ||
      o.customerName.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <ShoppingCart className="w-4 h-4 text-emerald-600" />
            <span>Comercial & Faturamento</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Pedidos de Venda
          </h1>
          <p className="text-xs text-slate-500">
            Cadastre os pedidos de clientes e gere Ordens de Produção vinculadas em 1 clique
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-emerald-400" />
          <span>Novo Pedido</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por número do pedido ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">Nº Pedido</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Itens & Quantidades</th>
                <th className="py-3 px-4">Data Entrega</th>
                <th className="py-3 px-4 text-right">Valor Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    Nenhum pedido de venda registrado.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {ord.orderNumber}
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {ord.customerName}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <div className="space-y-0.5">
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="text-[11px]">
                            {item.quantity}x {item.productName}
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                      {new Date(ord.deliveryDate).toLocaleDateString('pt-BR')}
                    </td>

                    <td className="py-3 px-4 font-mono tabular-nums text-right font-bold text-slate-900">
                      R$ {ord.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-semibold ${
                          ord.status === 'Concluído'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'Em Produção'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {ord.status !== 'Concluído' && (
                          <button
                            onClick={() => onGenerateOP(ord.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-xs"
                            title="Gerar Ordem de Produção para este pedido"
                          >
                            <FilePlus className="w-3.5 h-3.5" />
                            <span>Gerar OP</span>
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(ord)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md"
                          title="Editar pedido"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Excluir o pedido ${ord.orderNumber}?`)) {
                              onDeleteOrder(ord.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                          title="Excluir pedido"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New / Edit Order */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-base font-bold">
                {editingOrder ? `Editar Pedido: ${editingOrder.orderNumber}` : 'Novo Pedido de Venda'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cliente *
                  </label>
                  <select
                    required
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-hidden"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.taxId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data Prometida de Entrega *
                  </label>
                  <input
                    type="date"
                    required
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status do Pedido
                </label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-hidden"
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Em Produção">Em Produção</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>

              {/* Item selection row */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3">
                <span className="text-xs font-bold text-slate-800">Adicionar Produtos ao Pedido</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Produto</label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => {
                        const pid = e.target.value;
                        setSelectedProductId(pid);
                        const p = products.find((pr) => pr.id === pid);
                        if (p) setItemUnitPrice(p.salePrice);
                      }}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Qtd</label>
                    <input
                      type="number"
                      min="1"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(Math.max(1, Number(e.target.value)))}
                      className="w-full text-xs font-mono px-2 py-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="w-full py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
                    >
                      + Incluir
                    </button>
                  </div>
                </div>

                {/* Items list */}
                <div className="border border-slate-200 rounded bg-white overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="py-1.5 px-3">Item</th>
                        <th className="py-1.5 px-2 text-center">Qtd</th>
                        <th className="py-1.5 px-2 text-right">Unitário</th>
                        <th className="py-1.5 px-2 text-right">Subtotal</th>
                        <th className="py-1.5 px-2 text-center"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-100">
                          <td className="py-1.5 px-3 font-semibold text-slate-800">{item.productName}</td>
                          <td className="py-1.5 px-2 font-mono text-center">{item.quantity}</td>
                          <td className="py-1.5 px-2 font-mono text-right">R$ {item.unitPrice.toFixed(2)}</td>
                          <td className="py-1.5 px-2 font-mono text-right font-bold">R$ {item.total.toFixed(2)}</td>
                          <td className="py-1.5 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {items.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-3 text-center text-slate-400 italic">
                            Nenhum item adicionado ao pedido.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="text-right text-xs font-mono font-bold text-slate-900">
                  Total do Pedido: R${' '}
                  {items
                    .reduce((acc, i) => acc + i.total, 0)
                    .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações de Faturamento e Entrega
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-hidden"
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
                  disabled={items.length === 0}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm disabled:opacity-50"
                >
                  Salvar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
