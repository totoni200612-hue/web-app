export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Responsável Técnico' | 'Gerente de PCP' | 'Supervisor de Produção' | 'Operador Líder';
  registrationNumber?: string; // CREA, CFT ou Registro Profissional
  active: boolean;
  avatarColor?: string;
}

export interface MaterialRequirement {
  rawMaterialId: string;
  rawMaterialName?: string;
  quantity: number; // Quantidade por unidade do produto
  unit?: string;
}

export interface ProductionStageTemplate {
  id: string;
  name: string;
  sequence: number;
  estimatedMinutes: number;
  machineId?: string;
  machineName?: string;
  description?: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  unit: string; // un, pç, m, kg, conjunto
  processTimeMinutes: number; // Tempo total padrão de ciclo
  category: string;
  costPrice: number;
  salePrice: number;
  stockQuantity: number;
  materials: MaterialRequirement[];
  stages: ProductionStageTemplate[];
  createdAt: string;
  updatedAt: string;
}

export interface RawMaterial {
  id: string;
  code: string;
  name: string;
  unit: string; // kg, m, m², litros, unidade, peça, g
  stockQuantity: number;
  minStockQuantity: number;
  costPerUnit: number;
  supplierId?: string;
  supplierName?: string;
  location?: string; // Almoxarifado / Prateleira
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  code?: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  taxId: string; // CNPJ / CPF
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  paymentTerms?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  code?: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  taxId: string;
  address: string;
  city: string;
  state: string;
  suppliedMaterials: string; // Produtos/matérias-primas fornecidas
  leadTimeDays?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionCapacity {
  id: string;
  code: string;
  name: string;
  type: 'Máquina' | 'Linha de Montagem' | 'Célula de Trabalho' | 'Bancada de Testes';
  status: 'Operacional' | 'Em Manutenção' | 'Parada';
  hoursPerDay: number; // Ex: 8h ou 16h (2 turnos)
  workingDaysPerWeek: number; // Ex: 5 ou 6
  hourlyRate?: number; // Custo hora da máquina (R$/h)
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string; // Ex: PED-2026-001
  customerId: string;
  customerName: string;
  items: OrderItem[];
  orderDate: string;
  deliveryDate: string;
  status: 'Pendente' | 'Em Produção' | 'Concluído' | 'Entregue' | 'Cancelado';
  totalAmount: number;
  notes?: string;
  productionOrderIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductionStageRun {
  id: string;
  name: string;
  sequence: number;
  machineId?: string;
  machineName?: string;
  estimatedMinutes: number;
  actualMinutes?: number;
  status: 'Pendente' | 'Em Andamento' | 'Concluída';
  startedAt?: string;
  completedAt?: string;
  operatorName?: string;
  notes?: string;
}

export interface MaterialUsage {
  rawMaterialId: string;
  rawMaterialCode: string;
  rawMaterialName: string;
  unit: string;
  requiredQuantity: number;
  actualUsedQuantity?: number;
}

export interface ProductionOrder {
  id: string;
  opNumber: string; // Ex: OP-2026-001
  orderId?: string;
  orderNumber?: string;
  customerId?: string;
  customerName?: string;
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unit: string;
  priority: 'Baixa' | 'Normal' | 'Alta' | 'Urgente';
  status: 'Planejada' | 'Em Andamento' | 'Concluída' | 'Cancelada';
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  technicalResponsible: {
    id: string;
    name: string;
    role: string;
    registrationNumber?: string;
  };
  stages: ProductionStageRun[];
  materials: MaterialUsage[];
  estimatedTotalMinutes: number;
  actualTotalMinutes?: number;
  scrapsQuantity?: number; // Refugos/perdas
  approvedQuantity?: number;
  completionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemStats {
  totalProducts: number;
  totalRawMaterials: number;
  lowStockCount: number;
  totalCustomers: number;
  totalSuppliers: number;
  totalCapacities: number;
  activeOrders: number;
  plannedOPs: number;
  inProgressOPs: number;
  completedOPs: number;
  totalHoursProduced: number;
}
