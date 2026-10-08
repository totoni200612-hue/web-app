import React, { useState } from 'react';
import { User } from '../types/erp';
import { HardHat, Check, UserPlus, X } from 'lucide-react';

interface UserSwitcherModalProps {
  isOpen: boolean;
  currentUser: User | null;
  users: User[];
  onSelectUser: (userId: string) => Promise<void>;
  onClose: () => void;
  onOpenCreateUser: () => void;
}

export const UserSwitcherModal: React.FC<UserSwitcherModalProps> = ({
  isOpen,
  currentUser,
  users,
  onSelectUser,
  onClose,
  onOpenCreateUser,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardHat className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              Identificação do Responsável Técnico
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600">
            Selecione o usuário autenticado que assinará as Ordens de Produção, laudos de liberação e relatórios da fábrica:
          </p>

          <div className="space-y-2">
            {users.map((u) => {
              const isSelected = currentUser?.id === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => {
                    onSelectUser(u.id);
                    onClose();
                  }}
                  className={`w-full p-3 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/70 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{u.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {u.role} {u.registrationNumber ? `· ${u.registrationNumber}` : ''}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{u.email}</div>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="p-1 rounded-full bg-emerald-600 text-white">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={() => {
                onClose();
                onOpenCreateUser();
              }}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Cadastrar Novo Técnico</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Concluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
