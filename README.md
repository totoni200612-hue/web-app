# GestorPCP — ERP de Produção e Gestão Empresarial

Aplicação web full-stack de gestão empresarial com características de **ERP básico e PCP (Planejamento e Controle da Produção)**, voltada para pequenas empresas industriais, marcenarias, serralherias, usinagens e oficinas de manufatura.

---

## 🚀 Como Executar o Projeto

### Requisitos:
- **Node.js**: versão 18+ (recomendado 20 ou 22)
- **NPM**: versão 9+

### Instalação das Dependências:
```bash
npm install
```

### Execução em Modo de Desenvolvimento:
```bash
npm run dev
```
O servidor Express + Vite estará disponível em `http://localhost:3000`.

### Build e Execução em Produção:
```bash
npm run build
npm start
```

---

## 🛠️ Arquitetura Técnica

- **Backend**: Node.js com Express e TypeScript (`server.ts`), com roteamento RESTful para todos os módulos do ERP.
- **Frontend**: React 19, TypeScript e Tailwind CSS com design industrial e tipografia tabular (`tabular-nums`).
- **Persistência**: Armazenamento permanente em banco de dados JSON no servidor (`data/erp_database.json`) com escritas atômicas seguras, sem limites de registros, com endpoint de backup/download e restore.
- **Impressão**: Suporte nativo a `@media print` para gerar folhas de Ordem de Produção (A4) e relatórios formatados para PDF ou papel.

---

## 🗄️ Estrutura do Banco de Dados

O banco de dados é persistido em disco no arquivo `data/erp_database.json` com os seguintes esquemas:

### 1. `products` (Ficha Técnica / BOM)
- `id`: Identificador único (UUID)
- `code`: Código do item (ex: `PROD-001`)
- `name`: Nome do produto acabado
- `description`: Descrição técnica e especificações
- `unit`: Unidade de medida (`peça`, `conjunto`, etc.)
- `processTimeMinutes`: Tempo total padrão de ciclo (minutos)
- `category`: Categoria fabril (ex: Usinagem, Caldeiraria, Montagem)
- `costPrice`: Custo estimado unitário (R$)
- `salePrice`: Preço de venda (R$)
- `stockQuantity`: Saldo em estoque de produto acabado
- `materials`: Lista de insumos necessários (BOM) `[{ rawMaterialId, rawMaterialName, quantity, unit }]`
- `stages`: Roteiro sequencial de operações `[{ id, name, sequence, estimatedMinutes, machineId, machineName }]`

### 2. `rawMaterials` (Matérias-Primas e Insumos)
- `id`: Identificador único
- `code`: Código do insumo (ex: `MP-101`)
- `name`: Descrição da matéria-prima
- `unit`: Unidade (`kg`, `m`, `m²`, `litros`, `unidade`, `g`)
- `stockQuantity`: Saldo atual em estoque
- `minStockQuantity`: Ponto de pedido / estoque de segurança
- `costPerUnit`: Custo de aquisição unitário
- `supplierId`: Chave do fornecedor homologado
- `location`: Endereço no almoxarifado (prateleira/galpão)

### 3. `customers` (Clientes)
- `id`, `code`, `name`: Razão social e código
- `contactPerson`, `email`, `phone`: Dados de contato
- `taxId`: CNPJ ou CPF
- `address`, `city`, `state`: Endereço físico e de entrega
- `paymentTerms`: Condições de faturamento (ex: 28 dias DDL)

### 4. `suppliers` (Fornecedores)
- `id`, `code`, `name`: Razão social
- `contactPerson`, `email`, `phone`: Contatos
- `taxId`: CNPJ
- `address`, `city`, `state`: Localização
- `suppliedMaterials`: Relação de insumos fornecidos
- `leadTimeDays`: Prazo médio de entrega em dias

### 5. `capacities` (Capacidade Produtiva)
- `id`, `code`, `name`: Nome da máquina ou posto (ex: `Torno CNC Romi 30D`)
- `type`: `Máquina`, `Linha de Montagem`, `Célula de Trabalho`, `Bancada de Testes`
- `status`: `Operacional`, `Em Manutenção`, `Parada`
- `hoursPerDay`: Horas de trabalho diárias (turnos)
- `workingDaysPerWeek`: Dias úteis por semana
- `hourlyRate`: Taxa horária da máquina (R$/h)

### 6. `orders` (Pedidos de Venda)
- `id`, `orderNumber`: Número do pedido (ex: `PED-2026-001`)
- `customerId`, `customerName`: Cliente comprador
- `items`: Lista de itens `[{ productId, productCode, productName, quantity, unitPrice, total }]`
- `orderDate`, `deliveryDate`: Datas contratuais
- `status`: `Pendente`, `Em Produção`, `Concluído`, `Cancelado`
- `totalAmount`: Valor total faturado

### 7. `productionOrders` (Ordens de Produção - OP)
- `id`, `opNumber`: Número da OP (ex: `OP-2026-001`)
- `orderId`, `orderNumber`: Pedido de venda vinculado ou avulso
- `productId`, `productCode`, `productName`, `quantity`, `unit`: Produto
- `priority`: `Baixa`, `Normal`, `Alta`, `Urgente`
- `status`: `Planejada`, `Em Andamento`, `Concluída`, `Cancelada`
- `plannedStartDate`, `plannedEndDate`: Cronograma planejado
- `actualStartDate`, `actualEndDate`: Execução real
- `technicalResponsible`: `{ id, name, role, registrationNumber }`
- `stages`: Status em tempo real de cada etapa `[{ id, name, sequence, machineName, estimatedMinutes, actualMinutes, status, startedAt, completedAt, operatorName, notes }]`
- `materials`: Insumos requisitados `[{ rawMaterialId, requiredQuantity, actualUsedQuantity, unit }]`
- `approvedQuantity`: Quantidade aprovada pelo controle de qualidade
- `scrapsQuantity`: Refugos/perdas do lote
- `completionNotes`: Parecer técnico de liberação

### 8. `users` (Equipe & Responsável Técnico)
- `id`, `name`, `email`, `role`: Perfil do operador/engenheiro
- `registrationNumber`: Registro profissional legal (CREA, CFT, CRQ)
- `active`: Indicador de usuário ativo na sessão

---

## 📄 Funcionalidades de Destaque

1. **Emissão e Baixa de Ordens de Produção (OP)**:
   - Cálculo automático dos tempos de produção e insumos com base na Ficha Técnica.
   - Baixa com dedução automática do estoque de insumos e crédito de produto acabado.
2. **Folha de OP para Chão de Fábrica (Pronta para Impressão)**:
   - Formato A4 profissional com código de rastreio, requisição de almoxarifado, checklist de operações com vistos de operadores e termo de assinatura do Responsável Técnico legal.
3. **Identificação do Responsável Técnico**:
   - O usuário ativo é exibido no topo do sistema, em todas as ordens de produção emitidas, nos termos de baixa e nos relatórios de auditoria.
4. **Relatórios Gerenciais**:
   - Rastreamento de tempo de ciclo por produto (tempo previsto na Ficha Técnica vs tempo real apontado).
   - Análise de gargalos e taxa de ocupação das máquinas.
