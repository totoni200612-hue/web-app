import React from 'react';
import { User } from '../types/erp';
import { 
  HardHat, 
  UserCheck, 
  Printer, 
  Database, 
  RotateCcw, 
  PlusCircle,
  Menu
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  onOpenUserModal: () => void;
  onNewOrder: () => void;
  onNewOP: () => void;
  onToggleSidebar: () => void;
  onBackup: () => void;
  onResetDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenUserModal,
  onNewOrder,
  onNewOP,
  onToggleSidebar,
  onBackup,
  onResetDemo,
}) => {
  return (
    <header className="no-print h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 lg:hidden"
          title="Abrir Menu"
          aria-label="Abrir Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            PCP
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-slate-900 leading-none">
              GestorPCP
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Planejamento & Controle da Produção
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick action buttons */}
        <button
          onClick={onNewOP}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
        >
          <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Emitir OP</span>
        </button>

        <button
          onClick={onNewOrder}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors"
        >
          <span>Novo Pedido</span>
        </button>

        <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

        {/* Technical Responsible badge / button */}
        <button
          onClick={onOpenUserModal}
          className="flex items-center gap-2 p-1.5 pr-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all text-left"
          title="Clique para alternar o Responsável Técnico ou perfil"
        >
          <div className="w-7 h-7 rounded-md bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            <HardHat className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-800 leading-tight">
              {currentUser?.name || 'Responsável Técnico'}
            </div>
            <div className="text-[10px] text-emerald-700 font-medium leading-none">
              {currentUser?.registrationNumber ? currentUser.registrationNumber : currentUser?.role || 'Responsável Técnico'}
            </div>
          </div>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono">
            Trocar
          </span>
        </button>

        {/* Database backup shortcut */}
        <button
          onClick={onBackup}
          className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          title="Download de Backup do Banco de Dados"
        >
          <Database className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
