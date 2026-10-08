import React, { useState } from 'react';
import { User } from '../types/erp';
import { HardHat, PlusCircle, Search, Edit2, CheckCircle, X } from 'lucide-react';

interface UsersViewProps {
  users: User[];
  currentUser: User | null;
  onSaveUser: (user: Partial<User>) => Promise<void>;
  onSelectUser: (userId: string) => Promise<void>;
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  currentUser,
  onSaveUser,
  onSelectUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<User['role']>('Responsável Técnico');
  const [registrationNumber, setRegistrationNumber] = useState('');

  const openNewModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setRole('Responsável Técnico');
    setRegistrationNumber('CREA-SP ');
    setIsModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setRegistrationNumber(u.registrationNumber || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveUser({
      id: editingUser?.id,
      name,
      email,
      role,
      registrationNumber,
    });
    setIsModalOpen(false);
  };

  const filtered = users.filter((u) => {
    const s = searchTerm.toLowerCase();
    return u.name.toLowerCase().includes(s) || (u.registrationNumber && u.registrationNumber.toLowerCase().includes(s));
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <HardHat className="w-4 h-4 text-emerald-600" />
            <span>Equipe Técnica & Responsabilidade</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Responsáveis Técnicos & Usuários do PCP
          </h1>
          <p className="text-xs text-slate-500">
            Gerencie os engenheiros, supervisores e operadores responsáveis pelos documentos de fabricação
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-emerald-400" />
          <span>Cadastrar Responsável</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((u) => {
          const isActive = currentUser?.id === u.id;
          return (
            <div
              key={u.id}
              className={`rounded-xl p-5 border transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-emerald-50/40 border-emerald-400 ring-1 ring-emerald-400 shadow-xs'
                  : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm">
                    {u.name.slice(0, 2).toUpperCase()}
                  </div>
                  {isActive && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      Ativo na Sessão
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-sm mb-0.5">{u.name}</h3>
                <div className="text-xs text-emerald-700 font-semibold mb-2">{u.role}</div>

                <div className="space-y-1 text-xs text-slate-600 p-2.5 bg-slate-50 rounded-lg border border-slate-100 mb-4 font-mono">
                  <div>
                    Reg: <strong>{u.registrationNumber || 'Sem CREA/CFT'}</strong>
                  </div>
                  <div className="text-[11px] truncate">{u.email}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {!isActive ? (
                  <button
                    onClick={() => onSelectUser(u.id)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    Ativar como Responsável
                  </button>
                ) : (
                  <span className="text-xs text-slate-500 font-medium">Assinando Documentos</span>
                )}

                <button
                  onClick={() => openEditModal(u)}
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md"
                  title="Editar Dados Técnicos"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-base font-bold">
                {editingUser ? `Editar: ${editingUser.name}` : 'Cadastrar Responsável Técnico'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Eng. Carlos Mendonça"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail Profissional *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cargo / Função *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="Responsável Técnico">Responsável Técnico</option>
                  <option value="Gerente de PCP">Gerente de PCP</option>
                  <option value="Supervisor de Produção">Supervisor de Produção</option>
                  <option value="Operador Líder">Operador Líder</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registro Profissional (CREA / CFT / CRQ)
                </label>
                <input
                  type="text"
                  placeholder="Ex: CREA-SP 5069871234/D"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg"
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
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
