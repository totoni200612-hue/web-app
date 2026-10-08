import React from 'react';
import { ProductionOrder, User } from '../types/erp';
import { Printer, X, CheckSquare, HardHat, QrCode } from 'lucide-react';

interface PrintOrderModalProps {
  order: ProductionOrder | null;
  currentUser: User | null;
  onClose: () => void;
}

export const PrintOrderModal: React.FC<PrintOrderModalProps> = ({
  order,
  currentUser,
  onClose,
}) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const responsible = order.technicalResponsible?.name 
    ? order.technicalResponsible 
    : {
        name: currentUser?.name || 'Responsável Técnico',
        role: currentUser?.role || 'Responsável Técnico',
        registrationNumber: currentUser?.registrationNumber || 'CREA-SP / CFT'
      };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[96vh] flex flex-col overflow-hidden print:max-h-none print:shadow-none print:rounded-none">
        {/* Modal Controls (Hidden in Print) */}
        <div className="no-print px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold">
              Visualização de Impressão — Folha de Ordem de Produção
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Gerar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet (Standard A4 layout) */}
        <div className="p-8 sm:p-10 overflow-y-auto flex-1 font-sans text-slate-900 bg-white print:p-4 print:overflow-visible text-xs">
          
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xl font-black tracking-tight text-slate-900 uppercase">
                  Indústria Metal Mecânica Vanguarda Ltda
                </div>
                <div className="text-[11px] text-slate-600">
                  CNPJ: 12.345.678/0001-90 · Inscrição Estadual: 112.345.678.900
                </div>
                <div className="text-[11px] text-slate-600">
                  Sistema Integrado de PCP & Manufatura · Norma ISO 9001 / SGQ
                </div>
              </div>

              <div className="text-right border-l-2 border-slate-200 pl-4">
                <div className="text-xs uppercase font-bold text-slate-500">
                  Documento de Fábrica
                </div>
                <div className="text-2xl font-black font-mono tracking-tight text-slate-900">
                  {order.opNumber}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Emissão: {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
          </div>

          {/* General Order Info Grid */}
          <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 print:bg-white print:border-slate-400">
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-500">Produto a Fabricar</div>
              <div className="text-sm font-bold text-slate-900">{order.productName}</div>
              <div className="font-mono text-[11px] text-slate-600">Cód: {order.productCode}</div>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase text-slate-500">Quantidade do Lote</div>
              <div className="text-base font-extrabold font-mono tabular-nums text-slate-900">
                {order.quantity} {order.unit}
              </div>
              <div className="text-[10px] text-slate-500 font-semibold">
                Prioridade: {order.priority}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase text-slate-500">Pedido Vinculado / Cliente</div>
              <div className="font-bold text-slate-900 text-xs">
                {order.orderNumber || 'Ordem Avulsa / Estoque'}
              </div>
              <div className="text-[11px] text-slate-600 truncate">
                {order.customerName || 'Almoxarifado Interno'}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase text-slate-500">Prazos de Execução</div>
              <div className="text-[11px] text-slate-800">
                Início: <strong>{order.plannedStartDate ? new Date(order.plannedStartDate).toLocaleDateString('pt-BR') : '-'}</strong>
              </div>
              <div className="text-[11px] text-slate-800">
                Entrega: <strong>{order.plannedEndDate ? new Date(order.plannedEndDate).toLocaleDateString('pt-BR') : '-'}</strong>
              </div>
            </div>
          </div>

          {/* Section 1: Raw Materials / Almoxarifado */}
          <div className="mb-6">
            <div className="flex items-center justify-between bg-slate-900 text-white px-3 py-1.5 rounded-t font-bold text-xs uppercase tracking-wide">
              <span>1. Requisição & Separação de Matéria-Prima (Almoxarifado)</span>
              <span className="text-[10px] font-normal text-slate-300">Conferir antes de liberar para o chão de fábrica</span>
            </div>
            <table className="w-full border-collapse border border-slate-300 text-left text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                  <th className="py-2 px-3 font-semibold border-r border-slate-300">Código</th>
                  <th className="py-2 px-3 font-semibold border-r border-slate-300">Descrição do Insumo / Especificação</th>
                  <th className="py-2 px-3 font-semibold text-right border-r border-slate-300">Qtd. Requerida</th>
                  <th className="py-2 px-3 font-semibold text-center border-r border-slate-300">Qtd. Separada</th>
                  <th className="py-2 px-3 font-semibold text-center">Visto Almoxarife</th>
                </tr>
              </thead>
              <tbody>
                {order.materials.map((mat, idx) => (
                  <tr key={idx} className="border-b border-slate-200">
                    <td className="py-2 px-3 font-mono font-bold border-r border-slate-200">{mat.rawMaterialCode}</td>
                    <td className="py-2 px-3 border-r border-slate-200">{mat.rawMaterialName}</td>
                    <td className="py-2 px-3 font-mono tabular-nums text-right border-r border-slate-200">
                      <strong>{mat.requiredQuantity}</strong> {mat.unit}
                    </td>
                    <td className="py-2 px-3 text-center border-r border-slate-200">
                      <span className="inline-block w-20 border-b border-slate-400"></span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="inline-block w-16 border-b border-slate-400"></span>
                    </td>
                  </tr>
                ))}
                {order.materials.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-3 px-3 text-center text-slate-500 italic">
                      Nenhum insumo específico cadastrado para esta ordem.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Section 2: Production Stages / Roteiro de Fabricação */}
          <div className="mb-6">
            <div className="flex items-center justify-between bg-slate-900 text-white px-3 py-1.5 rounded-t font-bold text-xs uppercase tracking-wide">
              <span>2. Roteiro Sequencial de Fabricação & Chão de Fábrica</span>
              <span className="text-[10px] font-normal text-slate-300">Preencher obrigatoriamente a cada passagem de posto</span>
            </div>
            <table className="w-full border-collapse border border-slate-300 text-left text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                  <th className="py-2 px-2 text-center font-semibold border-r border-slate-300 w-10">Etapa</th>
                  <th className="py-2 px-3 font-semibold border-r border-slate-300">Operação / Máquina ou Posto</th>
                  <th className="py-2 px-2 text-center font-semibold border-r border-slate-300">Tempo Prev.</th>
                  <th className="py-2 px-2 text-center font-semibold border-r border-slate-300">Início Real</th>
                  <th className="py-2 px-2 text-center font-semibold border-r border-slate-300">Fim Real</th>
                  <th className="py-2 px-3 font-semibold border-r border-slate-300">Operador</th>
                  <th className="py-2 px-2 text-center font-semibold border-r border-slate-300">Aprovadas</th>
                  <th className="py-2 px-2 text-center font-semibold border-r border-slate-300">Refugo</th>
                  <th className="py-2 px-3 text-center font-semibold">Visto / Assinatura</th>
                </tr>
              </thead>
              <tbody>
                {order.stages.map((stg, idx) => (
                  <tr key={idx} className="border-b border-slate-200">
                    <td className="py-2.5 px-2 font-mono text-center font-bold border-r border-slate-200">
                      {stg.sequence || idx + 1}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200">
                      <div className="font-bold text-slate-900">{stg.name}</div>
                      <div className="text-[10px] text-slate-500">{stg.machineName || 'Posto Manual'}</div>
                    </td>
                    <td className="py-2.5 px-2 font-mono text-center tabular-nums border-r border-slate-200">
                      {stg.estimatedMinutes}m
                    </td>
                    <td className="py-2.5 px-2 font-mono text-center border-r border-slate-200">
                      {stg.startedAt ? new Date(stg.startedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '___:___'}
                    </td>
                    <td className="py-2.5 px-2 font-mono text-center border-r border-slate-200">
                      {stg.completedAt ? new Date(stg.completedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '___:___'}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200">
                      {stg.operatorName || '________________'}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono border-r border-slate-200">
                      {stg.status === 'Concluída' ? order.approvedQuantity || order.quantity : '____'}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono border-r border-slate-200">
                      {stg.status === 'Concluída' ? (order.scrapsQuantity ?? 0) : '____'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-block w-16 border-b border-slate-400"></span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 3: Technical Responsibility Sign-Off */}
          <div className="border border-slate-300 rounded-lg p-4 bg-slate-50/50 print:bg-white print:border-slate-400 print-break-inside-avoid">
            <div className="flex items-center gap-2 mb-3 text-slate-900 font-bold text-xs uppercase">
              <HardHat className="w-4 h-4 text-emerald-700" />
              <span>3. Liberação Técnica, Inspeção de Qualidade & Baixa de Produção</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end mt-4">
              <div>
                <div className="text-[11px] text-slate-700 space-y-1">
                  <div>
                    Status da Ordem: <strong className="font-mono">{order.status.toUpperCase()}</strong>
                  </div>
                  <div>
                    Quantidade Final Aprovada: <strong className="font-mono">{order.approvedQuantity ?? order.quantity} {order.unit}</strong> (Refugos: {order.scrapsQuantity ?? 0})
                  </div>
                  <div>
                    Observações Técnicas: {order.completionNotes || 'Nenhuma observação informada.'}
                  </div>
                </div>
              </div>

              <div className="text-center pt-6">
                <div className="inline-block w-64 border-b border-slate-800 pb-1"></div>
                <div className="font-bold text-slate-900 text-xs mt-1">
                  {responsible.name}
                </div>
                <div className="text-[11px] text-slate-600">
                  {responsible.role} · {responsible.registrationNumber}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Responsável Técnico Legal pelo Processo de Fabricação
                </div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-6 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>GestorPCP · Documento Oficial de Produção · ID: {order.id}</span>
            <span>Folha 1 de 1 · Gerado em: {new Date().toLocaleString('pt-BR')}</span>
          </div>

        </div>
      </div>
    </div>
  );
};
