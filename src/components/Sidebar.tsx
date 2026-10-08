import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  ShoppingCart,
  Layers,
  Boxes,
  Cpu,
  Users,
  Truck,
  BarChart3,
  HardHat,
  X,
  FileText
} from 'lucide-react';

export type NavTab = 
  | 'dashboard'
  | 'production-orders'
  | 'orders'
  | 'products'
  | 'raw-materials'
  | 'capacities'
  | 'customers'
  | 'suppliers'
  | 'reports'
  | 'users';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
}) => {
  const navItems = [
    {
      group: 'Operação Principal',
      items: [
        { id: 'dashboard' as NavTab, label: 'Visão Geral (PCP)', icon: LayoutDashboard },
        { id: 'production-orders' as NavTab, label: 'Ordens de Produção', icon: ClipboardList },
        { id: 'orders' as NavTab, label: 'Pedidos de Venda', icon: ShoppingCart },
      ]
    },
    {
      group: 'Engenharia & Cadastros',
      items: [
        { id: 'products' as NavTab, label: 'Fichas Técnicas (BOM)', icon: Layers },
        { id: 'raw-materials' as NavTab, label: 'Matérias-Primas & Estoque', icon: Boxes },
        { id: 'capacities' as NavTab, label: 'Capacidade Produtiva', icon: Cpu },
      ]
    },
    {
      group: 'Relacionamento',
      items: [
        { id: 'customers' as NavTab, label: 'Clientes', icon: Users },
        { id: 'suppliers' as NavTab, label: 'Fornecedores', icon: Truck },
      ]
    },
    {
      group: 'Gestão & Controle',
      items: [
        { id: 'reports' as NavTab, label: 'Relatórios & Gargalos', icon: BarChart3 },
        { id: 'users' as NavTab, label: 'Equipe Técnica & Usuários', icon: HardHat },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="no-print fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        no-print fixed lg:static top-0 bottom-0 left-0 z-40
        w-64 bg-slate-900 text-slate-300 flex flex-col justify-between
        transition-transform duration-200 ease-in-out border-r border-slate-800
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header / Brand */}
        <div>
          <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white font-bold tracking-tight text-base">
                Módulo Industrial
              </span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navItems.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {group.group}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        onClose();
                      }}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left
                        ${isActive 
                          ? 'bg-emerald-600 text-white font-semibold shadow-xs' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/80'}
                      `}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center justify-between font-mono text-[10px]">
            <span>Persistência:</span>
            <span className="text-emerald-400 font-medium">Ativa (JSON/DB)</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Desenvolvido para Pequenas Empresas
          </div>
        </div>
      </aside>
    </>
  );
};
