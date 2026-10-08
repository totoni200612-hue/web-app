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
} from '../types/erp';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    let msg = `Erro ${res.status}: ${res.statusText}`;
    try {
      const data = await res.json();
      if (data.error) msg = data.error;
    } catch {}
    throw new Error(msg);
  }

  return res.json();
}

export const api = {
  // Auth & Users
  getCurrentUser: () => request<User>('/api/auth/current-user'),
  switchUser: (userId: string) =>
    request<User>('/api/auth/current-user', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),
  getUsers: () => request<User[]>('/api/users'),
  saveUser: (user: Partial<User>) =>
    request<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(user),
    }),

  // Products
  getProducts: () => request<Product[]>('/api/products'),
  getProduct: (id: string) => request<Product>(`/api/products/${id}`),
  saveProduct: (product: Partial<Product>) =>
    request<Product>(product.id ? `/api/products/${product.id}` : '/api/products', {
      method: product.id ? 'PUT' : 'POST',
      body: JSON.stringify(product),
    }),
  deleteProduct: (id: string) =>
    request<{ success: boolean }>(`/api/products/${id}`, { method: 'DELETE' }),

  // Raw Materials
  getRawMaterials: () => request<RawMaterial[]>('/api/raw-materials'),
  saveRawMaterial: (material: Partial<RawMaterial>) =>
    request<RawMaterial>(material.id ? `/api/raw-materials/${material.id}` : '/api/raw-materials', {
      method: material.id ? 'PUT' : 'POST',
      body: JSON.stringify(material),
    }),
  adjustStock: (id: string, delta: number) =>
    request<RawMaterial>(`/api/raw-materials/${id}/adjust`, {
      method: 'POST',
      body: JSON.stringify({ delta }),
    }),
  deleteRawMaterial: (id: string) =>
    request<{ success: boolean }>(`/api/raw-materials/${id}`, { method: 'DELETE' }),

  // Customers
  getCustomers: () => request<Customer[]>('/api/customers'),
  saveCustomer: (customer: Partial<Customer>) =>
    request<Customer>(customer.id ? `/api/customers/${customer.id}` : '/api/customers', {
      method: customer.id ? 'PUT' : 'POST',
      body: JSON.stringify(customer),
    }),
  deleteCustomer: (id: string) =>
    request<{ success: boolean }>(`/api/customers/${id}`, { method: 'DELETE' }),

  // Suppliers
  getSuppliers: () => request<Supplier[]>('/api/suppliers'),
  saveSupplier: (supplier: Partial<Supplier>) =>
    request<Supplier>(supplier.id ? `/api/suppliers/${supplier.id}` : '/api/suppliers', {
      method: supplier.id ? 'PUT' : 'POST',
      body: JSON.stringify(supplier),
    }),
  deleteSupplier: (id: string) =>
    request<{ success: boolean }>(`/api/suppliers/${id}`, { method: 'DELETE' }),

  // Capacities
  getCapacities: () => request<ProductionCapacity[]>('/api/capacities'),
  saveCapacity: (cap: Partial<ProductionCapacity>) =>
    request<ProductionCapacity>(cap.id ? `/api/capacities/${cap.id}` : '/api/capacities', {
      method: cap.id ? 'PUT' : 'POST',
      body: JSON.stringify(cap),
    }),
  deleteCapacity: (id: string) =>
    request<{ success: boolean }>(`/api/capacities/${id}`, { method: 'DELETE' }),

  // Orders
  getOrders: () => request<Order[]>('/api/orders'),
  saveOrder: (order: Partial<Order>) =>
    request<Order>(order.id ? `/api/orders/${order.id}` : '/api/orders', {
      method: order.id ? 'PUT' : 'POST',
      body: JSON.stringify(order),
    }),
  deleteOrder: (id: string) =>
    request<{ success: boolean }>(`/api/orders/${id}`, { method: 'DELETE' }),

  // Production Orders (OP)
  getProductionOrders: () => request<ProductionOrder[]>('/api/production-orders'),
  getProductionOrder: (id: string) => request<ProductionOrder>(`/api/production-orders/${id}`),
  saveProductionOrder: (op: Partial<ProductionOrder>) =>
    request<ProductionOrder>(op.id ? `/api/production-orders/${op.id}` : '/api/production-orders', {
      method: op.id ? 'PUT' : 'POST',
      body: JSON.stringify(op),
    }),
  advanceStage: (
    opId: string,
    stageId: string,
    updates: {
      status: 'Pendente' | 'Em Andamento' | 'Concluída';
      actualMinutes?: number;
      operatorName?: string;
      notes?: string;
    }
  ) =>
    request<ProductionOrder>(`/api/production-orders/${opId}/advance-stage`, {
      method: 'POST',
      body: JSON.stringify({ stageId, ...updates }),
    }),
  completeProductionOrder: (
    opId: string,
    payload: {
      approvedQuantity?: number;
      scrapsQuantity?: number;
      completionNotes?: string;
      actualTotalMinutes?: number;
      deductRawMaterials?: boolean;
      creditFinishedStock?: boolean;
    }
  ) =>
    request<ProductionOrder>(`/api/production-orders/${opId}/complete`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  deleteProductionOrder: (id: string) =>
    request<{ success: boolean }>(`/api/production-orders/${id}`, { method: 'DELETE' }),

  // Overview Stats
  getStats: () => request<SystemStats>('/api/reports/overview'),

  // Backup & Reset
  backupDatabase: () => {
    window.location.href = '/api/database/backup';
  },
  restoreDatabase: (data: any) =>
    request<{ success: boolean; message: string }>('/api/database/restore', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  resetToDemo: () =>
    request<{ success: boolean; message: string }>('/api/database/reset-demo', {
      method: 'POST',
    }),
};
