import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import {
  User,
  Product,
  RawMaterial,
  Customer,
  Supplier,
  ProductionCapacity,
  Order,
  ProductionOrder,
  SystemStats,
} from './types/erp';

import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ProductionOrdersView } from './components/ProductionOrdersView';
import { OrdersView } from './components/OrdersView';
import { ProductsView } from './components/ProductsView';
import { RawMaterialsView } from './components/RawMaterialsView';
import { CapacitiesView } from './components/CapacitiesView';
import { CustomersView } from './components/CustomersView';
import { SuppliersView } from './components/SuppliersView';
import { ReportsView } from './components/ReportsView';
import { UsersView } from './components/UsersView';
import { PrintOrderModal } from './components/PrintOrderModal';
import { CreateOPModal } from './components/CreateOPModal';
import { AdvanceStageModal } from './components/AdvanceStageModal';
import { CompleteOrderModal } from './components/CompleteOrderModal';
import { UserSwitcherModal } from './components/UserSwitcherModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Entities state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [capacities, setCapacities] = useState<ProductionCapacity[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);

  // Modals state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedPrintOP, setSelectedPrintOP] = useState<ProductionOrder | null>(null);

  const [isCreateOPModalOpen, setIsCreateOPModalOpen] = useState(false);
  const [presetOrderIdForOP, setPresetOrderIdForOP] = useState<string | undefined>(undefined);

  const [isAdvanceStageModalOpen, setIsAdvanceStageModalOpen] = useState(false);
  const [selectedOPForStages, setSelectedOPForStages] = useState<ProductionOrder | null>(null);

  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedOPForComplete, setSelectedOPForComplete] = useState<ProductionOrder | null>(null);

  const [isUserSwitcherOpen, setIsUserSwitcherOpen] = useState(false);

  // Toast / feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Load all data
  const loadData = useCallback(async () => {
    try {
      const [
        currUserRes,
        usersRes,
        prodRes,
        matRes,
        custRes,
        supRes,
        capRes,
        ordRes,
        opRes,
        statsRes,
      ] = await Promise.all([
        api.getCurrentUser(),
        api.getUsers(),
        api.getProducts(),
        api.getRawMaterials(),
        api.getCustomers(),
        api.getSuppliers(),
        api.getCapacities(),
        api.getOrders(),
        api.getProductionOrders(),
        api.getStats(),
      ]);

      setCurrentUser(currUserRes);
      setUsers(usersRes);
      setProducts(prodRes);
      setRawMaterials(matRes);
      setCustomers(custRes);
      setSuppliers(supRes);
      setCapacities(capRes);
      setOrders(ordRes);
      setProductionOrders(opRes);
      setStats(statsRes);
    } catch (err: any) {
      console.error('Erro ao carregar dados do ERP:', err);
      showToast(`Erro de conexão: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auth / Technical responsible switch
  const handleSelectUser = async (userId: string) => {
    try {
      const updated = await api.switchUser(userId);
      setCurrentUser(updated);
      showToast(`Responsável Técnico ativo alterado para ${updated.name}`);
    } catch (err: any) {
      showToast(`Erro ao alternar usuário: ${err.message}`);
    }
  };

  const handleSaveUser = async (userData: Partial<User>) => {
    try {
      const saved = await api.saveUser(userData);
      await loadData();
      showToast(`Responsável técnico ${saved.name} salvo com sucesso!`);
    } catch (err: any) {
      showToast(`Erro: ${err.message}`);
    }
  };

  // Production Orders handlers
  const handleCreateOP = async (opData: Partial<ProductionOrder>) => {
    try {
      const newOP = await api.saveProductionOrder(opData);
      await loadData();
      showToast(`Ordem de Produção ${newOP.opNumber} emitida com sucesso!`);
    } catch (err: any) {
      showToast(`Erro ao emitir OP: ${err.message}`);
      throw err;
    }
  };

  const handleUpdateStage = async (
    opId: string,
    stageId: string,
    updates: {
      status: 'Pendente' | 'Em Andamento' | 'Concluída';
      actualMinutes?: number;
      operatorName?: string;
      notes?: string;
    }
  ) => {
    try {
      const updatedOP = await api.advanceStage(opId, stageId, updates);
      await loadData();
      setSelectedOPForStages(updatedOP);
      showToast(`Etapa da ${updatedOP.opNumber} atualizada!`);
    } catch (err: any) {
      showToast(`Erro: ${err.message}`);
      throw err;
    }
  };

  const handleConfirmCompleteOP = async (
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
  ) => {
    try {
      const completed = await api.completeProductionOrder(opId, payload);
      await loadData();
      showToast(`Baixa da OP ${completed.opNumber} realizada com sucesso!`);
    } catch (err: any) {
      showToast(`Erro: ${err.message}`);
      throw err;
    }
  };

  const handleDeleteOP = async (id: string) => {
    try {
      await api.deleteProductionOrder(id);
      await loadData();
      showToast('Ordem de Produção excluída com sucesso.');
    } catch (err: any) {
      showToast(`Erro ao excluir: ${err.message}`);
    }
  };

  // Products handler
  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      await api.saveProduct(productData);
      await loadData();
      showToast('Ficha técnica salva com sucesso!');
    } catch (err: any) {
      showToast(`Erro: ${err.message}`);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await api.deleteProduct(id);
      await loadData();
      showToast('Ficha técnica excluída com sucesso.');
    } catch (err: any) {
      showToast(`Erro: ${err.message}`);
    }
  };

  // Raw materials handler
  const handleSaveMaterial = async (matData: Partial<RawMaterial>) => {
    try {
      await api.saveRawMaterial(matData);
      await loadData();
      showToast('Matéria-prima cadastrada/atualizada com sucesso!');
    } catch (err: any) {
      showToast(`Erro: ${err.message}`);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    try {
      await api.deleteRawMaterial(id);
      await loadData();
      showToast('Matéria-prima excluída.');
    } catch (err: any) {
      showToast(`Erro: ${err.message}`);
    }
  };

  const handleAdjustStock = async (id: string, delta: number) => {
    try {
      const updated = await api.adjustStock(id, delta);
      await loadData();
      showToast(`Estoque ajustado! Novo saldo de ${updated.name}: ${updated.stockQuantity} ${updated.unit}`);
    } catch (err: any) {
      showToast(`Erro ao ajustar estoque: ${err.message}`);
    }
  };

  // Capacities handler
  const handleSaveCapacity = async (capData: Partial<ProductionCapacity>) => {
    try {
      await api.saveCapacity(capData);
      await loadData();
      showToast('Posto de capacidade salvo com sucesso!');
    } catch (err: any) {
      showToast(`Erro: ${err.message}`);
    }
  };

  const handleDeleteCapacity = async (id: string) => {
    try {
      await api.deleteCapacity(id);
      await loadData();
      showToast('Capacidade excluída.');
    } catch (err: any) {
      showToast(`Erro: ${err.message}`);
    }
  };

  // Customers handler
  const handleSaveCustomer = async (custData: Partial<Customer>) => {
    try {
      await api.saveCustomer(custData);
      await loadData();
      showToast('Cliente salvo com sucesso!');
    } catch (err: any) {
      showToast(`Erro: ${err.message}`);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      await api.deleteCustomer(id);
      await loadData();
      showToast('Cliente excluído.');
    } catch (err: any) {
      showToast(`Erro: ${err.message}`);
    }
  };

  // Suppliers handler
  const handleSaveSupplier = async (supData: Partial<Supplier>) => {
    try {
      await api.saveSupplier(supData);
      await loadData();
      showToast('Fornecedor salvo com sucesso!');
    } catch (err: any) {
      showToast(`Erro: ${err.message}`);
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    try {
      await api.deleteSupplier(id);
      await loadData();
      showToast('Fornecedor excluído.');
    } catch (err: any) {
      showToast(`Erro: ${err.message}`);
    }
  };

  // Orders handler
  const handleSaveOrder = async (orderData: Partial<Order>) => {
    try {
      await api.saveOrder(orderData);
      await loadData();
      showToast('Pedido de venda salvo com sucesso!');
    } catch (err: any) {
      showToast(`Erro: ${err.message}`);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      await api.deleteOrder(id);
      await loadData();
      showToast('Pedido excluído.');
    } catch (err: any) {
      showToast(`Erro: ${err.message}`);
    }
  };

  // Reset demo
  const handleResetDemo = async () => {
    if (confirm('Deseja recarregar a base de dados padrão demonstrativa? Todas as alterações manuais serão resetadas.')) {
      try {
        await api.resetToDemo();
        await loadData();
        showToast('Dados demonstrativos restaurados com sucesso!');
      } catch (err: any) {
        showToast(`Erro: ${err.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="font-bold text-sm tracking-wide">Iniciando GestorPCP Industrial...</div>
          <div className="text-xs text-slate-400">Carregando persistência de dados e engenharia de processos</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="no-print fixed bottom-4 right-4 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onOpenUserModal={() => setIsUserSwitcherOpen(true)}
        onNewOrder={() => setCurrentTab('orders')}
        onNewOP={() => {
          setPresetOrderIdForOP(undefined);
          setIsCreateOPModalOpen(true);
        }}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onBackup={() => api.backupDatabase()}
        onResetDemo={handleResetDemo}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardView
                stats={stats}
                productionOrders={productionOrders}
                rawMaterials={rawMaterials}
                capacities={capacities}
                currentUser={currentUser}
                onNavigateTab={(tab) => setCurrentTab(tab)}
                onNewOP={() => {
                  setPresetOrderIdForOP(undefined);
                  setIsCreateOPModalOpen(true);
                }}
                onPrintOP={(op) => {
                  setSelectedPrintOP(op);
                  setIsPrintModalOpen(true);
                }}
                onAdvanceStage={(op) => {
                  setSelectedOPForStages(op);
                  setIsAdvanceStageModalOpen(true);
                }}
              />
            )}

            {currentTab === 'production-orders' && (
              <ProductionOrdersView
                orders={productionOrders}
                products={products}
                salesOrders={orders}
                currentUser={currentUser}
                onNewOP={() => {
                  setPresetOrderIdForOP(undefined);
                  setIsCreateOPModalOpen(true);
                }}
                onPrintOP={(op) => {
                  setSelectedPrintOP(op);
                  setIsPrintModalOpen(true);
                }}
                onAdvanceStage={(op) => {
                  setSelectedOPForStages(op);
                  setIsAdvanceStageModalOpen(true);
                }}
                onCompleteOP={(op) => {
                  setSelectedOPForComplete(op);
                  setIsCompleteModalOpen(true);
                }}
                onDeleteOP={handleDeleteOP}
              />
            )}

            {currentTab === 'orders' && (
              <OrdersView
                orders={orders}
                customers={customers}
                products={products}
                onSaveOrder={handleSaveOrder}
                onDeleteOrder={handleDeleteOrder}
                onGenerateOP={(orderId) => {
                  setPresetOrderIdForOP(orderId);
                  setIsCreateOPModalOpen(true);
                }}
              />
            )}

            {currentTab === 'products' && (
              <ProductsView
                products={products}
                rawMaterials={rawMaterials}
                capacities={capacities}
                onSaveProduct={handleSaveProduct}
                onDeleteProduct={handleDeleteProduct}
              />
            )}

            {currentTab === 'raw-materials' && (
              <RawMaterialsView
                materials={rawMaterials}
                suppliers={suppliers}
                onSaveMaterial={handleSaveMaterial}
                onDeleteMaterial={handleDeleteMaterial}
                onAdjustStock={handleAdjustStock}
              />
            )}

            {currentTab === 'capacities' && (
              <CapacitiesView
                capacities={capacities}
                onSaveCapacity={handleSaveCapacity}
                onDeleteCapacity={handleDeleteCapacity}
              />
            )}

            {currentTab === 'customers' && (
              <CustomersView
                customers={customers}
                onSaveCustomer={handleSaveCustomer}
                onDeleteCustomer={handleDeleteCustomer}
              />
            )}

            {currentTab === 'suppliers' && (
              <SuppliersView
                suppliers={suppliers}
                onSaveSupplier={handleSaveSupplier}
                onDeleteSupplier={handleDeleteSupplier}
              />
            )}

            {currentTab === 'reports' && (
              <ReportsView
                productionOrders={productionOrders}
                products={products}
                capacities={capacities}
                currentUser={currentUser}
              />
            )}

            {currentTab === 'users' && (
              <UsersView
                users={users}
                currentUser={currentUser}
                onSaveUser={handleSaveUser}
                onSelectUser={handleSelectUser}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      {/* 1. Print Order Modal */}
      {isPrintModalOpen && (
        <PrintOrderModal
          order={selectedPrintOP}
          currentUser={currentUser}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}

      {/* 2. Create OP Modal */}
      {isCreateOPModalOpen && (
        <CreateOPModal
          products={products}
          orders={orders}
          currentUser={currentUser}
          initialOrderId={presetOrderIdForOP}
          onClose={() => setIsCreateOPModalOpen(false)}
          onSubmit={handleCreateOP}
        />
      )}

      {/* 3. Advance Stage Modal */}
      {isAdvanceStageModalOpen && (
        <AdvanceStageModal
          order={selectedOPForStages}
          onClose={() => setIsAdvanceStageModalOpen(false)}
          onUpdateStage={handleUpdateStage}
          onOpenCompleteModal={(op) => {
            setSelectedOPForComplete(op);
            setIsCompleteModalOpen(true);
          }}
        />
      )}

      {/* 4. Complete / Baixa Order Modal */}
      {isCompleteModalOpen && (
        <CompleteOrderModal
          order={selectedOPForComplete}
          currentUser={currentUser}
          onClose={() => setIsCompleteModalOpen(false)}
          onConfirmComplete={handleConfirmCompleteOP}
        />
      )}

      {/* 5. User Switcher Modal */}
      {isUserSwitcherOpen && (
        <UserSwitcherModal
          isOpen={isUserSwitcherOpen}
          currentUser={currentUser}
          users={users}
          onSelectUser={handleSelectUser}
          onClose={() => setIsUserSwitcherOpen(false)}
          onOpenCreateUser={() => {
            setCurrentTab('users');
          }}
        />
      )}
    </div>
  );
}
