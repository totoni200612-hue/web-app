import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  User,
  Product,
  RawMaterial,
  Customer,
  Supplier,
  ProductionCapacity,
  Order,
  ProductionOrder,
  SystemStats
} from '../src/types/erp';

interface DatabaseSchema {
  users: User[];
  currentUser: User;
  products: Product[];
  rawMaterials: RawMaterial[];
  customers: Customer[];
  suppliers: Supplier[];
  capacities: ProductionCapacity[];
  orders: Order[];
  productionOrders: ProductionOrder[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'erp_database.json');

function generateInitialData(): DatabaseSchema {
  const users: User[] = [
    {
      id: 'usr-1',
      name: 'Eng. Carlos Mendonça',
      email: 'carlos.mendonca@industriavanguarda.com.br',
      role: 'Responsável Técnico',
      registrationNumber: 'CREA-SP 5069871234/D',
      active: true,
      avatarColor: 'bg-emerald-600'
    },
    {
      id: 'usr-2',
      name: 'Marina Silva Santos',
      email: 'marina.pcp@industriavanguarda.com.br',
      role: 'Gerente de PCP',
      registrationNumber: 'CFT-SP 89412-B',
      active: true,
      avatarColor: 'bg-blue-600'
    },
    {
      id: 'usr-3',
      name: 'Roberto de Almeida',
      email: 'roberto.producao@industriavanguarda.com.br',
      role: 'Supervisor de Produção',
      active: true,
      avatarColor: 'bg-amber-600'
    },
    {
      id: 'usr-4',
      name: 'Lucas Ferreira',
      email: 'lucas.usinagem@industriavanguarda.com.br',
      role: 'Operador Líder',
      active: true,
      avatarColor: 'bg-purple-600'
    }
  ];

  const rawMaterials: RawMaterial[] = [
    {
      id: 'mp-1',
      code: 'MP-101',
      name: 'Barra Redonda Aço SAE 1045 Ø 50mm',
      unit: 'kg',
      stockQuantity: 420,
      minStockQuantity: 100,
      costPerUnit: 14.50,
      supplierId: 'forn-1',
      supplierName: 'Aços & Metais Bandeirantes Ltda',
      location: 'Galpão A - Prateleira 03',
      createdAt: '2026-10-01T08:00:00Z',
      updatedAt: '2026-10-01T08:00:00Z'
    },
    {
      id: 'mp-2',
      code: 'MP-102',
      name: 'Bloco de Alumínio Naval Liga 5052',
      unit: 'kg',
      stockQuantity: 165,
      minStockQuantity: 50,
      costPerUnit: 32.80,
      supplierId: 'forn-1',
      supplierName: 'Aços & Metais Bandeirantes Ltda',
      location: 'Galpão A - Prateleira 05',
      createdAt: '2026-10-01T08:00:00Z',
      updatedAt: '2026-10-01T08:00:00Z'
    },
    {
      id: 'mp-3',
      code: 'MP-103',
      name: 'Chapa Aço Inox 304 Espessura 2.0mm',
      unit: 'm²',
      stockQuantity: 28,
      minStockQuantity: 15,
      costPerUnit: 195.00,
      supplierId: 'forn-1',
      supplierName: 'Aços & Metais Bandeirantes Ltda',
      location: 'Galpão B - Prateleira 01',
      createdAt: '2026-10-01T08:00:00Z',
      updatedAt: '2026-10-01T08:00:00Z'
    },
    {
      id: 'mp-4',
      code: 'MP-104',
      name: 'Parafuso Sextavado M8 x 40mm Inox A2',
      unit: 'unidade',
      stockQuantity: 1150,
      minStockQuantity: 400,
      costPerUnit: 1.85,
      supplierId: 'forn-2',
      supplierName: 'Fixadores do Vale Ltda',
      location: 'Gaveteiro C-12',
      createdAt: '2026-10-01T08:00:00Z',
      updatedAt: '2026-10-01T08:00:00Z'
    },
    {
      id: 'mp-5',
      code: 'MP-105',
      name: 'Tinta Epóxi Eletrostática Cinza RAL 7035',
      unit: 'litros',
      stockQuantity: 38,
      minStockQuantity: 20,
      costPerUnit: 68.00,
      supplierId: 'forn-3',
      supplierName: 'Tintas Industriais Titan S.A.',
      location: 'Cabine de Pintura - Armário Químico',
      createdAt: '2026-10-01T08:00:00Z',
      updatedAt: '2026-10-01T08:00:00Z'
    },
    {
      id: 'mp-6',
      code: 'MP-106',
      name: 'Rolamento Blindado de Precisão 6204-2RS',
      unit: 'unidade',
      stockQuantity: 18,
      minStockQuantity: 25, // Estoque baixo para demonstrar alerta!
      costPerUnit: 42.50,
      supplierId: 'forn-2',
      supplierName: 'Fixadores do Vale Ltda',
      location: 'Gaveteiro C-04',
      createdAt: '2026-10-01T08:00:00Z',
      updatedAt: '2026-10-01T08:00:00Z'
    }
  ];

  const capacities: ProductionCapacity[] = [
    {
      id: 'cap-1',
      code: 'CNC-01',
      name: 'Torno CNC Romi Centur 30D',
      type: 'Máquina',
      status: 'Operacional',
      hoursPerDay: 16,
      workingDaysPerWeek: 5,
      hourlyRate: 140.00,
      notes: 'Capacidade máxima para usinagem de eixos e flanges até Ø 300mm.',
      createdAt: '2026-10-01T08:00:00Z',
      updatedAt: '2026-10-01T08:00:00Z'
    },
    {
      id: 'cap-2',
      code: 'USI-02',
      name: 'Centro de Usinagem Vertical Haas VF-2',
      type: 'Máquina',
      status: 'Operacional',
      hoursPerDay: 16,
      workingDaysPerWeek: 5,
      hourlyRate: 180.00,
      notes: '3 eixos com magazine de 24 ferramentas para peças prismáticas.',
      createdAt: '2026-10-01T08:00:00Z',
      updatedAt: '2026-10-01T08:00:00Z'
    },
    {
      id: 'cap-3',
      code: 'LAS-01',
      name: 'Corte a Laser Fibra Óptica 3kW',
      type: 'Máquina',
      status: 'Operacional',
      hoursPerDay: 8,
      workingDaysPerWeek: 5,
      hourlyRate: 210.00,
      notes: 'Mesa 1500x3000mm, corte em chapas até 16mm de aço carbono e 8mm inox.',
      createdAt: '2026-10-01T08:00:00Z',
      updatedAt: '2026-10-01T08:00:00Z'
    },
    {
      id: 'cap-4',
      code: 'DOB-01',
      name: 'Prensa Dobradeira Hidráulica CNC 120T',
      type: 'Máquina',
      status: 'Operacional',
      hoursPerDay: 8,
      workingDaysPerWeek: 5,
      hourlyRate: 110.00,
      notes: 'Comprimento útil de dobra 3100mm com compensação hidráulica.',
      createdAt: '2026-10-01T08:00:00Z',
      updatedAt: '2026-10-01T08:00:00Z'
    },
    {
      id: 'cap-5',
      code: 'PIN-01',
      name: 'Cabine de Pintura Eletrostática com Estufa',
      type: 'Linha de Montagem',
      status: 'Operacional',
      hoursPerDay: 8,
      workingDaysPerWeek: 5,
      hourlyRate: 95.00,
      notes: 'Estufa a gás para cura até 220°C.',
      createdAt: '2026-10-01T08:00:00Z',
      updatedAt: '2026-10-01T08:00:00Z'
    },
    {
      id: 'cap-6',
      code: 'BNC-01',
      name: 'Bancada de Montagem e Testes Hidráulicos',
      type: 'Bancada de Testes',
      status: 'Operacional',
      hoursPerDay: 8,
      workingDaysPerWeek: 5,
      hourlyRate: 85.00,
      notes: 'Unidade hidropneumática para teste de estanqueidade até 350 bar.',
      createdAt: '2026-10-01T08:00:00Z',
      updatedAt: '2026-10-01T08:00:00Z'
    }
  ];

  const products: Product[] = [
    {
      id: 'prod-1',
      code: 'PROD-001',
      name: 'Flange de Acoplamento Industrial Ø 180mm',
      description: 'Flange usinado em aço 1045 com 8 furos roscados e acabamento retificado para bombas centrífugas.',
      unit: 'peça',
      processTimeMinutes: 85,
      category: 'Usinagem Pesada',
      costPrice: 95.40,
      salePrice: 198.00,
      stockQuantity: 12,
      materials: [
        { rawMaterialId: 'mp-1', rawMaterialName: 'Barra Redonda Aço SAE 1045 Ø 50mm', quantity: 4.2, unit: 'kg' },
        { rawMaterialId: 'mp-4', rawMaterialName: 'Parafuso Sextavado M8 x 40mm Inox A2', quantity: 4, unit: 'unidade' }
      ],
      stages: [
        { id: 'stg-1', name: 'Corte de Tarugo', sequence: 1, estimatedMinutes: 10, machineId: 'cap-1', machineName: 'Torno CNC Romi Centur 30D' },
        { id: 'stg-2', name: 'Torneamento CNC', sequence: 2, estimatedMinutes: 40, machineId: 'cap-1', machineName: 'Torno CNC Romi Centur 30D' },
        { id: 'stg-3', name: 'Furação e Rosqueamento CNC', sequence: 3, estimatedMinutes: 20, machineId: 'cap-2', machineName: 'Centro de Usinagem Haas VF-2' },
        { id: 'stg-4', name: 'Controle Dimensional e Embalagem', sequence: 4, estimatedMinutes: 15, machineId: 'cap-6', machineName: 'Bancada de Montagem e Testes' }
      ],
      createdAt: '2026-10-01T08:00:00Z',
      updatedAt: '2026-10-01T08:00:00Z'
    },
    {
      id: 'prod-2',
      code: 'PROD-002',
      name: 'Válvula de Retenção Hidráulica 2" Alta Pressão',
      description: 'Corpo monobloco usinado em alumínio naval com assentamento cônico e vedação estanque.',
      unit: 'conjunto',
      processTimeMinutes: 135,
      category: 'Hidráulica',
      costPrice: 285.00,
      salePrice: 560.00,
      stockQuantity: 6,
      materials: [
        { rawMaterialId: 'mp-2', rawMaterialName: 'Bloco de Alumínio Naval Liga 5052', quantity: 5.5, unit: 'kg' },
        { rawMaterialId: 'mp-6', rawMaterialName: 'Rolamento Blindado de Precisão 6204-2RS', quantity: 1, unit: 'unidade' },
        { rawMaterialId: 'mp-4', rawMaterialName: 'Parafuso Sextavado M8 x 40mm Inox A2', quantity: 6, unit: 'unidade' }
      ],
      stages: [
        { id: 'stg-201', name: 'Desbaste e Esquadrejamento', sequence: 1, estimatedMinutes: 30, machineId: 'cap-2', machineName: 'Centro de Usinagem Haas VF-2' },
        { id: 'stg-202', name: 'Usinagem de Sedes e Roscas', sequence: 2, estimatedMinutes: 50, machineId: 'cap-2', machineName: 'Centro de Usinagem Haas VF-2' },
        { id: 'stg-203', name: 'Montagem e Teste Hidráulico 250bar', sequence: 3, estimatedMinutes: 40, machineId: 'cap-6', machineName: 'Bancada de Montagem e Testes' },
        { id: 'stg-204', name: 'Gravação a Laser e Lacração', sequence: 4, estimatedMinutes: 15, machineId: 'cap-6', machineName: 'Bancada de Montagem e Testes' }
      ],
      createdAt: '2026-10-01T08:00:00Z',
      updatedAt: '2026-10-01T08:00:00Z'
    },
    {
      id: 'prod-3',
      code: 'PROD-003',
      name: 'Suporte Estrutural Articulado para Painel Solar',
      description: 'Conjunto de fixação em chapa inox dobrada com pintura epóxi cinza para intempéries.',
      unit: 'peça',
      processTimeMinutes: 55,
      category: 'Caldeiraria Leve',
      costPrice: 112.00,
      salePrice: 225.00,
      stockQuantity: 24,
      materials: [
        { rawMaterialId: 'mp-3', rawMaterialName: 'Chapa Aço Inox 304 Espessura 2.0mm', quantity: 0.45, unit: 'm²' },
        { rawMaterialId: 'mp-4', rawMaterialName: 'Parafuso Sextavado M8 x 40mm Inox A2', quantity: 8, unit: 'unidade' },
        { rawMaterialId: 'mp-5', rawMaterialName: 'Tinta Epóxi Eletrostática Cinza RAL 7035', quantity: 0.25, unit: 'litros' }
      ],
      stages: [
        { id: 'stg-301', name: 'Corte a Laser CNC', sequence: 1, estimatedMinutes: 15, machineId: 'cap-3', machineName: 'Corte a Laser Fibra 3kW' },
        { id: 'stg-302', name: 'Dobra em Prensa CNC', sequence: 2, estimatedMinutes: 15, machineId: 'cap-4', machineName: 'Prensa Dobradeira CNC 120T' },
        { id: 'stg-303', name: 'Pintura Epóxi e Cura em Estufa', sequence: 3, estimatedMinutes: 15, machineId: 'cap-5', machineName: 'Cabine de Pintura Eletrostática' },
        { id: 'stg-304', name: 'Montagem de Articulações e Embalagem', sequence: 4, estimatedMinutes: 10, machineId: 'cap-6', machineName: 'Bancada de Montagem e Testes' }
      ],
      createdAt: '2026-10-01T08:00:00Z',
      updatedAt: '2026-10-01T08:00:00Z'
    }
  ];

  const customers: Customer[] = [
    {
      id: 'cli-1',
      code: 'CLI-01',
      name: 'AgroMáquinas do Brasil S.A.',
      contactPerson: 'Eduardo Guimarães',
      email: 'compras@agromaquinasonline.com.br',
      phone: '(19) 3456-7890',
      taxId: '98.765.432/0001-11',
      address: 'Rodovia Anhanguera, km 128 - Distrito Industrial',
      city: 'Americana',
      state: 'SP',
      zipCode: '13470-000',
      paymentTerms: '28 dias DDL',
      notes: 'Cliente prioritário da linha agrícola. Faturamento quinzenal.',
      createdAt: '2026-10-01T08:00:00Z',
      updatedAt: '2026-10-01T08:00:00Z'
    },
    {
      id: 'cli-2',
      code: 'CLI-02',
      name: 'TecnoSolar Soluções Energéticas Ltda',
      contactPerson: 'Beatriz Fonseca',
      email: 'engenharia@tecnosolar.ind.br',
      phone: '(11) 4589-1122',
      taxId: '12.345.678/0001-90',
      address: 'Av. das Indústrias, 840 - Galpão 4',
      city: 'Jundiaí',
      state: 'SP',
      zipCode: '13212-000',
      paymentTerms: '30/60 dias',
      notes: 'Contrato de fornecimento de suportes de fixação solar.',
      createdAt: '2026-10-01T08:00:00Z',
      updatedAt: '2026-10-01T08:00:00Z'
    },
    {
      id: 'cli-3',
      code: 'CLI-03',
      name: 'Indústrias Reunidas Paulistas de Bombas',
      contactPerson: 'Marcos Vinicius',
      email: 'suprimentos@reunidasbombas.com.br',
      phone: '(11) 3211-9988',
      taxId: '45.678.901/0001-22',
      address: 'Rua das Oficinas, 320',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '04205-001',
      paymentTerms: 'À vista com 3% desc.',
      notes: 'Consome flanges e válvulas de retenção regularmente.',
      createdAt: '2026-10-01T08:00:00Z',
      updatedAt: '2026-10-01T08:00:00Z'
    }
  ];

  const suppliers: Supplier[] = [
    {
      id: 'forn-1',
      code: 'FORN-01',
      name: 'Aços & Metais Bandeirantes Ltda',
      contactPerson: 'Valter Siqueira',
      email: 'vendas@metaisbandeirantes.com.br',
      phone: '(11) 2233-4455',
      taxId: '33.445.566/0001-77',
      address: 'Av. Marginal Direita do Tietê, 4500',
      city: 'São Paulo',
      state: 'SP',
      suppliedMaterials: 'Barras redondas 1045, Blocos Alumínio 5052, Chapas Inox 304',
      leadTimeDays: 4,
      notes: 'Certificado de matéria-prima vem junto com a NF-e.',
      createdAt: '2026-10-01T08:00:00Z',
      updatedAt: '2026-10-01T08:00:00Z'
    },
    {
      id: 'forn-2',
      code: 'FORN-02',
      name: 'Fixadores do Vale Ltda',
      contactPerson: 'Camila Rocha',
      email: 'comercial@fixadoresdovale.com.br',
      phone: '(12) 3944-1200',
      taxId: '77.889.900/0001-88',
      address: 'Rua dos Parafusos, 110',
      city: 'São José dos Campos',
      state: 'SP',
      suppliedMaterials: 'Parafusos sextavados inox, arruelas, porcas travantes, rolamentos',
      leadTimeDays: 2,
      notes: 'Entrega rápida e pedidos mínimos acessíveis.',
      createdAt: '2026-10-01T08:00:00Z',
      updatedAt: '2026-10-01T08:00:00Z'
    },
    {
      id: 'forn-3',
      code: 'FORN-03',
      name: 'Tintas Industriais Titan S.A.',
      contactPerson: 'Otávio Melo',
      email: 'contato@tintastitan.ind.br',
      phone: '(19) 3888-9900',
      taxId: '55.667.788/0001-99',
      address: 'Distrito Químico, Lote 12',
      city: 'Campinas',
      state: 'SP',
      suppliedMaterials: 'Tintas Epóxi em pó e líquidas, primers anti-corrosivos',
      leadTimeDays: 5,
      notes: 'Ficha técnica de segurança FISPQ disponível para todos os lotes.',
      createdAt: '2026-10-01T08:00:00Z',
      updatedAt: '2026-10-01T08:00:00Z'
    }
  ];

  const orders: Order[] = [
    {
      id: 'ped-1',
      orderNumber: 'PED-2026-001',
      customerId: 'cli-1',
      customerName: 'AgroMáquinas do Brasil S.A.',
      items: [
        {
          productId: 'prod-1',
          productCode: 'PROD-001',
          productName: 'Flange de Acoplamento Industrial Ø 180mm',
          quantity: 20,
          unitPrice: 198.00,
          total: 3960.00
        }
      ],
      orderDate: '2026-10-03',
      deliveryDate: '2026-10-16',
      status: 'Em Produção',
      totalAmount: 3960.00,
      notes: 'Urgência na remessa. Embalagem com filme VCI protetor anti-oxidação.',
      productionOrderIds: ['op-1'],
      createdAt: '2026-10-03T09:30:00Z',
      updatedAt: '2026-10-03T10:00:00Z'
    },
    {
      id: 'ped-2',
      orderNumber: 'PED-2026-002',
      customerId: 'cli-2',
      customerName: 'TecnoSolar Soluções Energéticas Ltda',
      items: [
        {
          productId: 'prod-3',
          productCode: 'PROD-003',
          productName: 'Suporte Estrutural Articulado para Painel Solar',
          quantity: 40,
          unitPrice: 225.00,
          total: 9000.00
        }
      ],
      orderDate: '2026-10-05',
      deliveryDate: '2026-10-22',
      status: 'Em Produção',
      totalAmount: 9000.00,
      notes: 'Lote 1 de 3 contratados. Pintura epóxi com espessura mínima de 80 micras.',
      productionOrderIds: ['op-2'],
      createdAt: '2026-10-05T14:15:00Z',
      updatedAt: '2026-10-05T14:30:00Z'
    },
    {
      id: 'ped-3',
      orderNumber: 'PED-2026-003',
      customerId: 'cli-3',
      customerName: 'Indústrias Reunidas Paulistas de Bombas',
      items: [
        {
          productId: 'prod-2',
          productCode: 'PROD-002',
          productName: 'Válvula de Retenção Hidráulica 2" Alta Pressão',
          quantity: 8,
          unitPrice: 560.00,
          total: 4480.00
        }
      ],
      orderDate: '2026-10-06',
      deliveryDate: '2026-10-25',
      status: 'Pendente',
      totalAmount: 4480.00,
      notes: 'Aguardando validação do almoxarifado de insumos.',
      productionOrderIds: [],
      createdAt: '2026-10-06T11:00:00Z',
      updatedAt: '2026-10-06T11:00:00Z'
    }
  ];

  const productionOrders: ProductionOrder[] = [
    {
      id: 'op-1',
      opNumber: 'OP-2026-001',
      orderId: 'ped-1',
      orderNumber: 'PED-2026-001',
      customerId: 'cli-1',
      customerName: 'AgroMáquinas do Brasil S.A.',
      productId: 'prod-1',
      productCode: 'PROD-001',
      productName: 'Flange de Acoplamento Industrial Ø 180mm',
      quantity: 20,
      unit: 'peça',
      priority: 'Alta',
      status: 'Em Andamento',
      plannedStartDate: '2026-10-04T08:00:00Z',
      plannedEndDate: '2026-10-14T17:00:00Z',
      actualStartDate: '2026-10-04T08:30:00Z',
      technicalResponsible: {
        id: 'usr-1',
        name: 'Eng. Carlos Mendonça',
        role: 'Responsável Técnico',
        registrationNumber: 'CREA-SP 5069871234/D'
      },
      stages: [
        {
          id: 'op1-stg-1',
          name: 'Corte de Tarugo',
          sequence: 1,
          machineId: 'cap-1',
          machineName: 'Torno CNC Romi Centur 30D',
          estimatedMinutes: 200, // 20 un * 10 min
          actualMinutes: 190,
          status: 'Concluída',
          startedAt: '2026-10-04T08:30:00Z',
          completedAt: '2026-10-04T12:00:00Z',
          operatorName: 'Lucas Ferreira',
          notes: 'Tarugos cortados com tolerância +1.5mm conforme especificado.'
        },
        {
          id: 'op1-stg-2',
          name: 'Torneamento CNC',
          sequence: 2,
          machineId: 'cap-1',
          machineName: 'Torno CNC Romi Centur 30D',
          estimatedMinutes: 800, // 20 un * 40 min
          actualMinutes: 520,
          status: 'Em Andamento',
          startedAt: '2026-10-05T08:00:00Z',
          operatorName: 'Lucas Ferreira',
          notes: '13 de 20 peças usinadas. Rugosidade Ra 1.6 confirmada no rugosímetro.'
        },
        {
          id: 'op1-stg-3',
          name: 'Furação e Rosqueamento CNC',
          sequence: 3,
          machineId: 'cap-2',
          machineName: 'Centro de Usinagem Haas VF-2',
          estimatedMinutes: 400,
          status: 'Pendente',
          notes: 'Programa Haas CNC #4420 preparado.'
        },
        {
          id: 'op1-stg-4',
          name: 'Controle Dimensional e Embalagem',
          sequence: 4,
          machineId: 'cap-6',
          machineName: 'Bancada de Montagem e Testes',
          estimatedMinutes: 300,
          status: 'Pendente',
          notes: 'Inspeção com paquímetro e micrômetro digital calibrados.'
        }
      ],
      materials: [
        {
          rawMaterialId: 'mp-1',
          rawMaterialCode: 'MP-101',
          rawMaterialName: 'Barra Redonda Aço SAE 1045 Ø 50mm',
          unit: 'kg',
          requiredQuantity: 84.0, // 20 * 4.2
          actualUsedQuantity: 84.0
        },
        {
          rawMaterialId: 'mp-4',
          rawMaterialCode: 'MP-104',
          rawMaterialName: 'Parafuso Sextavado M8 x 40mm Inox A2',
          unit: 'unidade',
          requiredQuantity: 80,
          actualUsedQuantity: 80
        }
      ],
      estimatedTotalMinutes: 1700,
      createdAt: '2026-10-03T10:00:00Z',
      updatedAt: '2026-10-05T08:00:00Z'
    },
    {
      id: 'op-2',
      opNumber: 'OP-2026-002',
      orderId: 'ped-2',
      orderNumber: 'PED-2026-002',
      customerId: 'cli-2',
      customerName: 'TecnoSolar Soluções Energéticas Ltda',
      productId: 'prod-3',
      productCode: 'PROD-003',
      productName: 'Suporte Estrutural Articulado para Painel Solar',
      quantity: 40,
      unit: 'peça',
      priority: 'Normal',
      status: 'Planejada',
      plannedStartDate: '2026-10-09T08:00:00Z',
      plannedEndDate: '2026-10-18T17:00:00Z',
      technicalResponsible: {
        id: 'usr-1',
        name: 'Eng. Carlos Mendonça',
        role: 'Responsável Técnico',
        registrationNumber: 'CREA-SP 5069871234/D'
      },
      stages: [
        {
          id: 'op2-stg-1',
          name: 'Corte a Laser CNC',
          sequence: 1,
          machineId: 'cap-3',
          machineName: 'Corte a Laser Fibra 3kW',
          estimatedMinutes: 600,
          status: 'Pendente'
        },
        {
          id: 'op2-stg-2',
          name: 'Dobra em Prensa CNC',
          sequence: 2,
          machineId: 'cap-4',
          machineName: 'Prensa Dobradeira CNC 120T',
          estimatedMinutes: 600,
          status: 'Pendente'
        },
        {
          id: 'op2-stg-3',
          name: 'Pintura Epóxi e Cura em Estufa',
          sequence: 3,
          machineId: 'cap-5',
          machineName: 'Cabine de Pintura Eletrostática',
          estimatedMinutes: 600,
          status: 'Pendente'
        },
        {
          id: 'op2-stg-4',
          name: 'Montagem de Articulações e Embalagem',
          sequence: 4,
          machineId: 'cap-6',
          machineName: 'Bancada de Montagem e Testes',
          estimatedMinutes: 400,
          status: 'Pendente'
        }
      ],
      materials: [
        {
          rawMaterialId: 'mp-3',
          rawMaterialCode: 'MP-103',
          rawMaterialName: 'Chapa Aço Inox 304 Espessura 2.0mm',
          unit: 'm²',
          requiredQuantity: 18.0
        },
        {
          rawMaterialId: 'mp-4',
          rawMaterialCode: 'MP-104',
          rawMaterialName: 'Parafuso Sextavado M8 x 40mm Inox A2',
          unit: 'unidade',
          requiredQuantity: 320
        },
        {
          rawMaterialId: 'mp-5',
          rawMaterialCode: 'MP-105',
          rawMaterialName: 'Tinta Epóxi Eletrostática Cinza RAL 7035',
          unit: 'litros',
          requiredQuantity: 10.0
        }
      ],
      estimatedTotalMinutes: 2200,
      createdAt: '2026-10-05T14:30:00Z',
      updatedAt: '2026-10-05T14:30:00Z'
    },
    {
      id: 'op-3',
      opNumber: 'OP-2026-003',
      productId: 'prod-2',
      productCode: 'PROD-002',
      productName: 'Válvula de Retenção Hidráulica 2" Alta Pressão',
      quantity: 5,
      unit: 'conjunto',
      priority: 'Normal',
      status: 'Concluída',
      plannedStartDate: '2026-09-25T08:00:00Z',
      plannedEndDate: '2026-10-02T17:00:00Z',
      actualStartDate: '2026-09-25T09:00:00Z',
      actualEndDate: '2026-10-02T15:45:00Z',
      technicalResponsible: {
        id: 'usr-1',
        name: 'Eng. Carlos Mendonça',
        role: 'Responsável Técnico',
        registrationNumber: 'CREA-SP 5069871234/D'
      },
      stages: [
        {
          id: 'op3-stg-1',
          name: 'Desbaste e Esquadrejamento',
          sequence: 1,
          machineId: 'cap-2',
          machineName: 'Centro de Usinagem Haas VF-2',
          estimatedMinutes: 150,
          actualMinutes: 145,
          status: 'Concluída',
          startedAt: '2026-09-25T09:00:00Z',
          completedAt: '2026-09-25T11:30:00Z',
          operatorName: 'Lucas Ferreira'
        },
        {
          id: 'op3-stg-2',
          name: 'Usinagem de Sedes e Roscas',
          sequence: 2,
          machineId: 'cap-2',
          machineName: 'Centro de Usinagem Haas VF-2',
          estimatedMinutes: 250,
          actualMinutes: 260,
          status: 'Concluída',
          startedAt: '2026-09-26T08:00:00Z',
          completedAt: '2026-09-26T12:30:00Z',
          operatorName: 'Lucas Ferreira'
        },
        {
          id: 'op3-stg-3',
          name: 'Montagem e Teste Hidráulico 250bar',
          sequence: 3,
          machineId: 'cap-6',
          machineName: 'Bancada de Montagem e Testes',
          estimatedMinutes: 200,
          actualMinutes: 190,
          status: 'Concluída',
          startedAt: '2026-09-29T10:00:00Z',
          completedAt: '2026-09-29T14:00:00Z',
          operatorName: 'Roberto de Almeida'
        },
        {
          id: 'op3-stg-4',
          name: 'Gravação a Laser e Lacração',
          sequence: 4,
          machineId: 'cap-6',
          machineName: 'Bancada de Montagem e Testes',
          estimatedMinutes: 75,
          actualMinutes: 70,
          status: 'Concluída',
          startedAt: '2026-10-02T14:00:00Z',
          completedAt: '2026-10-02T15:45:00Z',
          operatorName: 'Roberto de Almeida'
        }
      ],
      materials: [
        {
          rawMaterialId: 'mp-2',
          rawMaterialCode: 'MP-102',
          rawMaterialName: 'Bloco de Alumínio Naval Liga 5052',
          unit: 'kg',
          requiredQuantity: 27.5,
          actualUsedQuantity: 27.5
        },
        {
          rawMaterialId: 'mp-6',
          rawMaterialCode: 'MP-106',
          rawMaterialName: 'Rolamento Blindado de Precisão 6204-2RS',
          unit: 'unidade',
          requiredQuantity: 5,
          actualUsedQuantity: 5
        },
        {
          rawMaterialId: 'mp-4',
          rawMaterialCode: 'MP-104',
          rawMaterialName: 'Parafuso Sextavado M8 x 40mm Inox A2',
          unit: 'unidade',
          requiredQuantity: 30,
          actualUsedQuantity: 30
        }
      ],
      estimatedTotalMinutes: 675,
      actualTotalMinutes: 665,
      approvedQuantity: 5,
      scrapsQuantity: 0,
      completionNotes: 'Lote aprovado 100% no teste de estanqueidade a 250 bar. Baixa no estoque de insumos e entrada no almoxarifado de acabados efetuada.',
      createdAt: '2026-09-24T16:00:00Z',
      updatedAt: '2026-10-02T16:00:00Z'
    }
  ];

  return {
    users,
    currentUser: users[0],
    products,
    rawMaterials,
    customers,
    suppliers,
    capacities,
    orders,
    productionOrders
  };
}

class ErpDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDirectory();
    this.data = this.loadData();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.products && parsed.rawMaterials && parsed.orders && parsed.productionOrders) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error loading database file, reinitializing default data:', err);
    }
    const initial = generateInitialData();
    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave?: DatabaseSchema) {
    const data = dataToSave || this.data;
    try {
      this.ensureDataDirectory();
      const tmpFile = `${DB_FILE}.${Date.now()}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Error writing to database file:', err);
      // Fallback direct write
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    }
  }

  // --- Users & Current Responsible ---
  getUsers(): User[] {
    return this.data.users;
  }

  getCurrentUser(): User {
    return this.data.currentUser || this.data.users[0];
  }

  setCurrentUser(userId: string): User {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) throw new Error('Usuário não encontrado');
    this.data.currentUser = user;
    this.saveData();
    return user;
  }

  saveUser(user: Partial<User> & { id?: string }): User {
    const now = new Date().toISOString();
    if (user.id) {
      const index = this.data.users.findIndex(u => u.id === user.id);
      if (index >= 0) {
        this.data.users[index] = { ...this.data.users[index], ...user };
        if (this.data.currentUser?.id === user.id) {
          this.data.currentUser = this.data.users[index];
        }
        this.saveData();
        return this.data.users[index];
      }
    }
    const newUser: User = {
      id: `usr-${crypto.randomUUID().slice(0, 8)}`,
      name: user.name || 'Novo Usuário',
      email: user.email || '',
      role: user.role || 'Responsável Técnico',
      registrationNumber: user.registrationNumber || '',
      active: true,
      avatarColor: 'bg-emerald-700',
      ...user
    };
    this.data.users.push(newUser);
    this.saveData();
    return newUser;
  }

  // --- Products (Ficha Técnica) ---
  getProducts(): Product[] {
    return this.data.products;
  }

  getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  saveProduct(prod: Partial<Product> & { id?: string }): Product {
    const now = new Date().toISOString();
    if (prod.id) {
      const index = this.data.products.findIndex(p => p.id === prod.id);
      if (index >= 0) {
        this.data.products[index] = {
          ...this.data.products[index],
          ...prod,
          updatedAt: now
        };
        this.saveData();
        return this.data.products[index];
      }
    }
    const newProduct: Product = {
      id: `prod-${crypto.randomUUID().slice(0, 8)}`,
      code: prod.code || `PROD-${String(this.data.products.length + 1).padStart(3, '0')}`,
      name: prod.name || 'Novo Produto',
      description: prod.description || '',
      unit: prod.unit || 'peça',
      processTimeMinutes: Number(prod.processTimeMinutes) || 60,
      category: prod.category || 'Geral',
      costPrice: Number(prod.costPrice) || 0,
      salePrice: Number(prod.salePrice) || 0,
      stockQuantity: Number(prod.stockQuantity) || 0,
      materials: prod.materials || [],
      stages: prod.stages || [],
      createdAt: now,
      updatedAt: now
    };
    this.data.products.push(newProduct);
    this.saveData();
    return newProduct;
  }

  deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    if (this.data.products.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // --- Raw Materials (Matéria Prima) ---
  getRawMaterials(): RawMaterial[] {
    return this.data.rawMaterials;
  }

  saveRawMaterial(mat: Partial<RawMaterial> & { id?: string }): RawMaterial {
    const now = new Date().toISOString();
    if (mat.id) {
      const index = this.data.rawMaterials.findIndex(m => m.id === mat.id);
      if (index >= 0) {
        this.data.rawMaterials[index] = {
          ...this.data.rawMaterials[index],
          ...mat,
          updatedAt: now
        };
        this.saveData();
        return this.data.rawMaterials[index];
      }
    }
    const newMaterial: RawMaterial = {
      id: `mp-${crypto.randomUUID().slice(0, 8)}`,
      code: mat.code || `MP-${String(this.data.rawMaterials.length + 101)}`,
      name: mat.name || 'Nova Matéria Prima',
      unit: mat.unit || 'kg',
      stockQuantity: Number(mat.stockQuantity) || 0,
      minStockQuantity: Number(mat.minStockQuantity) || 10,
      costPerUnit: Number(mat.costPerUnit) || 0,
      supplierId: mat.supplierId,
      supplierName: mat.supplierName,
      location: mat.location || 'Almoxarifado Geral',
      createdAt: now,
      updatedAt: now
    };
    this.data.rawMaterials.push(newMaterial);
    this.saveData();
    return newMaterial;
  }

  adjustRawMaterialStock(id: string, delta: number): RawMaterial {
    const mat = this.data.rawMaterials.find(m => m.id === id);
    if (!mat) throw new Error('Matéria-prima não encontrada');
    mat.stockQuantity = Math.max(0, mat.stockQuantity + delta);
    mat.updatedAt = new Date().toISOString();
    this.saveData();
    return mat;
  }

  deleteRawMaterial(id: string): boolean {
    const initialLen = this.data.rawMaterials.length;
    this.data.rawMaterials = this.data.rawMaterials.filter(m => m.id !== id);
    if (this.data.rawMaterials.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // --- Customers (Clientes) ---
  getCustomers(): Customer[] {
    return this.data.customers;
  }

  saveCustomer(cust: Partial<Customer> & { id?: string }): Customer {
    const now = new Date().toISOString();
    if (cust.id) {
      const index = this.data.customers.findIndex(c => c.id === cust.id);
      if (index >= 0) {
        this.data.customers[index] = {
          ...this.data.customers[index],
          ...cust,
          updatedAt: now
        };
        this.saveData();
        return this.data.customers[index];
      }
    }
    const newCustomer: Customer = {
      id: `cli-${crypto.randomUUID().slice(0, 8)}`,
      code: cust.code || `CLI-${String(this.data.customers.length + 1).padStart(2, '0')}`,
      name: cust.name || 'Novo Cliente',
      contactPerson: cust.contactPerson || '',
      email: cust.email || '',
      phone: cust.phone || '',
      taxId: cust.taxId || '',
      address: cust.address || '',
      city: cust.city || '',
      state: cust.state || '',
      zipCode: cust.zipCode,
      paymentTerms: cust.paymentTerms || '30 dias',
      notes: cust.notes,
      createdAt: now,
      updatedAt: now
    };
    this.data.customers.push(newCustomer);
    this.saveData();
    return newCustomer;
  }

  deleteCustomer(id: string): boolean {
    const initialLen = this.data.customers.length;
    this.data.customers = this.data.customers.filter(c => c.id !== id);
    if (this.data.customers.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // --- Suppliers (Fornecedores) ---
  getSuppliers(): Supplier[] {
    return this.data.suppliers;
  }

  saveSupplier(sup: Partial<Supplier> & { id?: string }): Supplier {
    const now = new Date().toISOString();
    if (sup.id) {
      const index = this.data.suppliers.findIndex(s => s.id === sup.id);
      if (index >= 0) {
        this.data.suppliers[index] = {
          ...this.data.suppliers[index],
          ...sup,
          updatedAt: now
        };
        this.saveData();
        return this.data.suppliers[index];
      }
    }
    const newSupplier: Supplier = {
      id: `forn-${crypto.randomUUID().slice(0, 8)}`,
      code: sup.code || `FORN-${String(this.data.suppliers.length + 1).padStart(2, '0')}`,
      name: sup.name || 'Novo Fornecedor',
      contactPerson: sup.contactPerson || '',
      email: sup.email || '',
      phone: sup.phone || '',
      taxId: sup.taxId || '',
      address: sup.address || '',
      city: sup.city || '',
      state: sup.state || '',
      suppliedMaterials: sup.suppliedMaterials || '',
      leadTimeDays: Number(sup.leadTimeDays) || 3,
      notes: sup.notes,
      createdAt: now,
      updatedAt: now
    };
    this.data.suppliers.push(newSupplier);
    this.saveData();
    return newSupplier;
  }

  deleteSupplier(id: string): boolean {
    const initialLen = this.data.suppliers.length;
    this.data.suppliers = this.data.suppliers.filter(s => s.id !== id);
    if (this.data.suppliers.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // --- Production Capacities (Capacidade Produtiva) ---
  getCapacities(): ProductionCapacity[] {
    return this.data.capacities;
  }

  saveCapacity(cap: Partial<ProductionCapacity> & { id?: string }): ProductionCapacity {
    const now = new Date().toISOString();
    if (cap.id) {
      const index = this.data.capacities.findIndex(c => c.id === cap.id);
      if (index >= 0) {
        this.data.capacities[index] = {
          ...this.data.capacities[index],
          ...cap,
          updatedAt: now
        };
        this.saveData();
        return this.data.capacities[index];
      }
    }
    const newCapacity: ProductionCapacity = {
      id: `cap-${crypto.randomUUID().slice(0, 8)}`,
      code: cap.code || `CAP-${String(this.data.capacities.length + 1).padStart(2, '0')}`,
      name: cap.name || 'Nova Máquina/Linha',
      type: cap.type || 'Máquina',
      status: cap.status || 'Operacional',
      hoursPerDay: Number(cap.hoursPerDay) || 8,
      workingDaysPerWeek: Number(cap.workingDaysPerWeek) || 5,
      hourlyRate: Number(cap.hourlyRate) || 0,
      notes: cap.notes,
      createdAt: now,
      updatedAt: now
    };
    this.data.capacities.push(newCapacity);
    this.saveData();
    return newCapacity;
  }

  deleteCapacity(id: string): boolean {
    const initialLen = this.data.capacities.length;
    this.data.capacities = this.data.capacities.filter(c => c.id !== id);
    if (this.data.capacities.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // --- Orders (Pedidos de Venda) ---
  getOrders(): Order[] {
    return this.data.orders;
  }

  saveOrder(ord: Partial<Order> & { id?: string }): Order {
    const now = new Date().toISOString();
    if (ord.id) {
      const index = this.data.orders.findIndex(o => o.id === ord.id);
      if (index >= 0) {
        this.data.orders[index] = {
          ...this.data.orders[index],
          ...ord,
          updatedAt: now
        };
        this.saveData();
        return this.data.orders[index];
      }
    }
    const newOrder: Order = {
      id: `ped-${crypto.randomUUID().slice(0, 8)}`,
      orderNumber: ord.orderNumber || `PED-2026-${String(this.data.orders.length + 1).padStart(3, '0')}`,
      customerId: ord.customerId || '',
      customerName: ord.customerName || 'Cliente Balcão',
      items: ord.items || [],
      orderDate: ord.orderDate || new Date().toISOString().slice(0, 10),
      deliveryDate: ord.deliveryDate || new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10),
      status: ord.status || 'Pendente',
      totalAmount: ord.totalAmount || (ord.items ? ord.items.reduce((acc, i) => acc + (i.total || 0), 0) : 0),
      notes: ord.notes,
      productionOrderIds: [],
      createdAt: now,
      updatedAt: now
    };
    this.data.orders.push(newOrder);
    this.saveData();
    return newOrder;
  }

  deleteOrder(id: string): boolean {
    const initialLen = this.data.orders.length;
    this.data.orders = this.data.orders.filter(o => o.id !== id);
    if (this.data.orders.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // --- Production Orders (Ordens de Produção - OP) ---
  getProductionOrders(): ProductionOrder[] {
    return this.data.productionOrders;
  }

  getProductionOrderById(id: string): ProductionOrder | undefined {
    return this.data.productionOrders.find(op => op.id === id);
  }

  saveProductionOrder(opInput: Partial<ProductionOrder> & { id?: string }): ProductionOrder {
    const now = new Date().toISOString();
    const currentUser = this.getCurrentUser();

    if (opInput.id) {
      const index = this.data.productionOrders.findIndex(op => op.id === opInput.id);
      if (index >= 0) {
        this.data.productionOrders[index] = {
          ...this.data.productionOrders[index],
          ...opInput,
          updatedAt: now
        };
        this.saveData();
        return this.data.productionOrders[index];
      }
    }

    // New OP creation
    const product = this.data.products.find(p => p.id === opInput.productId);
    const quantity = Number(opInput.quantity) || 1;

    // Build stages from product or input
    const stages = (opInput.stages && opInput.stages.length > 0)
      ? opInput.stages
      : (product?.stages || []).map((s, idx) => ({
          id: `op-stg-${crypto.randomUUID().slice(0, 6)}`,
          name: s.name,
          sequence: s.sequence || idx + 1,
          machineId: s.machineId,
          machineName: s.machineName,
          estimatedMinutes: s.estimatedMinutes * quantity,
          status: 'Pendente' as const
        }));

    // Build materials from product or input
    const materials = (opInput.materials && opInput.materials.length > 0)
      ? opInput.materials
      : (product?.materials || []).map(m => {
          const raw = this.data.rawMaterials.find(r => r.id === m.rawMaterialId);
          return {
            rawMaterialId: m.rawMaterialId,
            rawMaterialCode: raw?.code || 'MP-XXX',
            rawMaterialName: raw?.name || m.rawMaterialName || 'Matéria Prima',
            unit: raw?.unit || m.unit || 'un',
            requiredQuantity: Number((m.quantity * quantity).toFixed(2)),
            actualUsedQuantity: 0
          };
        });

    const estimatedTotalMinutes = stages.reduce((acc, s) => acc + (s.estimatedMinutes || 0), 0)
      || (product ? product.processTimeMinutes * quantity : 60);

    const newOP: ProductionOrder = {
      id: `op-${crypto.randomUUID().slice(0, 8)}`,
      opNumber: opInput.opNumber || `OP-2026-${String(this.data.productionOrders.length + 1).padStart(3, '0')}`,
      orderId: opInput.orderId,
      orderNumber: opInput.orderNumber,
      customerId: opInput.customerId,
      customerName: opInput.customerName,
      productId: opInput.productId || (product?.id || ''),
      productCode: product?.code || opInput.productCode || 'PROD-000',
      productName: product?.name || opInput.productName || 'Produto',
      quantity,
      unit: product?.unit || opInput.unit || 'peça',
      priority: opInput.priority || 'Normal',
      status: opInput.status || 'Planejada',
      plannedStartDate: opInput.plannedStartDate || new Date().toISOString(),
      plannedEndDate: opInput.plannedEndDate || new Date(Date.now() + 7 * 86400000).toISOString(),
      actualStartDate: opInput.actualStartDate,
      actualEndDate: opInput.actualEndDate,
      technicalResponsible: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        registrationNumber: currentUser.registrationNumber
      },
      stages,
      materials,
      estimatedTotalMinutes,
      createdAt: now,
      updatedAt: now
    };

    this.data.productionOrders.push(newOP);

    // If linked to an order, update order status and link
    if (newOP.orderId) {
      const order = this.data.orders.find(o => o.id === newOP.orderId);
      if (order) {
        if (!order.productionOrderIds) order.productionOrderIds = [];
        if (!order.productionOrderIds.includes(newOP.id)) {
          order.productionOrderIds.push(newOP.id);
        }
        order.status = 'Em Produção';
        order.updatedAt = now;
      }
    }

    this.saveData();
    return newOP;
  }

  // Advance or update single stage of an OP
  advanceStage(
    opId: string,
    stageId: string,
    updates: {
      status: 'Pendente' | 'Em Andamento' | 'Concluída';
      actualMinutes?: number;
      operatorName?: string;
      notes?: string;
    }
  ): ProductionOrder {
    const op = this.data.productionOrders.find(o => o.id === opId);
    if (!op) throw new Error('Ordem de Produção não encontrada');

    const stage = op.stages.find(s => s.id === stageId);
    if (!stage) throw new Error('Etapa de produção não encontrada');

    const now = new Date().toISOString();
    stage.status = updates.status;
    if (updates.actualMinutes !== undefined) stage.actualMinutes = Number(updates.actualMinutes);
    if (updates.operatorName) stage.operatorName = updates.operatorName;
    if (updates.notes !== undefined) stage.notes = updates.notes;

    if (updates.status === 'Em Andamento' && !stage.startedAt) {
      stage.startedAt = now;
      if (op.status === 'Planejada') {
        op.status = 'Em Andamento';
        op.actualStartDate = now;
      }
    } else if (updates.status === 'Concluída') {
      if (!stage.startedAt) stage.startedAt = now;
      stage.completedAt = now;
      if (!stage.actualMinutes && stage.estimatedMinutes) {
        stage.actualMinutes = stage.estimatedMinutes;
      }
    }

    // Check if all stages completed
    const allCompleted = op.stages.every(s => s.status === 'Concluída');
    const hasAnyInProgress = op.stages.some(s => s.status === 'Em Andamento');

    if (allCompleted) {
      op.status = 'Concluída';
      if (!op.actualEndDate) op.actualEndDate = now;
    } else if (hasAnyInProgress) {
      op.status = 'Em Andamento';
      if (!op.actualStartDate) op.actualStartDate = now;
    }

    op.updatedAt = now;
    this.saveData();
    return op;
  }

  // Baixa de Ordem de Produção (Mark as completed, deduct raw material inventory, credit finished goods)
  completeProductionOrder(
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
  ): ProductionOrder {
    const op = this.data.productionOrders.find(o => o.id === opId);
    if (!op) throw new Error('Ordem de Produção não encontrada');

    const now = new Date().toISOString();
    const currentUser = this.getCurrentUser();

    op.status = 'Concluída';
    op.actualEndDate = payload.actualEndDate || now;
    if (!op.actualStartDate) op.actualStartDate = op.plannedStartDate;
    op.approvedQuantity = payload.approvedQuantity !== undefined ? payload.approvedQuantity : op.quantity;
    op.scrapsQuantity = payload.scrapsQuantity !== undefined ? payload.scrapsQuantity : 0;
    op.completionNotes = payload.completionNotes || 'Ordem baixada e finalizada pelo Responsável Técnico.';
    
    // Update technical responsible at completion time
    op.technicalResponsible = {
      id: currentUser.id,
      name: currentUser.name,
      role: currentUser.role,
      registrationNumber: currentUser.registrationNumber
    };

    // Calculate actual total minutes from stages or payload
    let totalRealMinutes = 0;
    op.stages.forEach(s => {
      s.status = 'Concluída';
      if (!s.completedAt) s.completedAt = now;
      if (!s.actualMinutes) s.actualMinutes = s.estimatedMinutes;
      totalRealMinutes += (s.actualMinutes || 0);
    });
    op.actualTotalMinutes = payload.actualTotalMinutes || totalRealMinutes || op.estimatedTotalMinutes;

    // Deduct raw materials if requested (default true)
    if (payload.deductRawMaterials !== false) {
      op.materials.forEach(matUsage => {
        const raw = this.data.rawMaterials.find(r => r.id === matUsage.rawMaterialId);
        if (raw) {
          const qtyToDeduct = matUsage.actualUsedQuantity || matUsage.requiredQuantity;
          raw.stockQuantity = Math.max(0, Number((raw.stockQuantity - qtyToDeduct).toFixed(2)));
          raw.updatedAt = now;
          matUsage.actualUsedQuantity = qtyToDeduct;
        }
      });
    }

    // Credit finished product stock if requested (default true)
    if (payload.creditFinishedStock !== false && op.productId) {
      const prod = this.data.products.find(p => p.id === op.productId);
      if (prod) {
        prod.stockQuantity += (op.approvedQuantity || op.quantity);
        prod.updatedAt = now;
      }
    }

    // If tied to order, check if all order's OPs are completed
    if (op.orderId) {
      const order = this.data.orders.find(o => o.id === op.orderId);
      if (order) {
        const relatedOPs = this.data.productionOrders.filter(o => o.orderId === order.id);
        const allOPsDone = relatedOPs.every(o => o.status === 'Concluída');
        if (allOPsDone) {
          order.status = 'Concluído';
          order.updatedAt = now;
        }
      }
    }

    op.updatedAt = now;
    this.saveData();
    return op;
  }

  deleteProductionOrder(id: string): boolean {
    const initialLen = this.data.productionOrders.length;
    this.data.productionOrders = this.data.productionOrders.filter(op => op.id !== id);
    if (this.data.productionOrders.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // --- Statistics & Overview Reports ---
  getSystemStats(): SystemStats {
    const products = this.data.products;
    const rawMaterials = this.data.rawMaterials;
    const lowStockCount = rawMaterials.filter(m => m.stockQuantity <= m.minStockQuantity).length;
    const activeOrders = this.data.orders.filter(o => o.status === 'Em Produção' || o.status === 'Pendente').length;
    const plannedOPs = this.data.productionOrders.filter(op => op.status === 'Planejada').length;
    const inProgressOPs = this.data.productionOrders.filter(op => op.status === 'Em Andamento').length;
    const completedOPs = this.data.productionOrders.filter(op => op.status === 'Concluída').length;

    const totalHoursProduced = this.data.productionOrders
      .filter(op => op.status === 'Concluída')
      .reduce((acc, op) => acc + ((op.actualTotalMinutes || op.estimatedTotalMinutes || 0) / 60), 0);

    return {
      totalProducts: products.length,
      totalRawMaterials: rawMaterials.length,
      lowStockCount,
      totalCustomers: this.data.customers.length,
      totalSuppliers: this.data.suppliers.length,
      totalCapacities: this.data.capacities.length,
      activeOrders,
      plannedOPs,
      inProgressOPs,
      completedOPs,
      totalHoursProduced: Number(totalHoursProduced.toFixed(1))
    };
  }

  // Backup & Restore
  exportDatabase(): DatabaseSchema {
    return this.data;
  }

  importDatabase(imported: Partial<DatabaseSchema>): boolean {
    if (!imported.products || !imported.rawMaterials) {
      throw new Error('Formato de backup inválido');
    }
    this.data = {
      users: imported.users || this.data.users,
      currentUser: imported.currentUser || this.data.currentUser,
      products: imported.products || [],
      rawMaterials: imported.rawMaterials || [],
      customers: imported.customers || [],
      suppliers: imported.suppliers || [],
      capacities: imported.capacities || [],
      orders: imported.orders || [],
      productionOrders: imported.productionOrders || []
    };
    this.saveData();
    return true;
  }

  resetToDemo(): DatabaseSchema {
    this.data = generateInitialData();
    this.saveData();
    return this.data;
  }
}

export const db = new ErpDatabase();
