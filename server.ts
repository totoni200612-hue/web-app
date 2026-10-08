import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '10mb' }));

  // Request logger for API calls
  app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    next();
  });

  // Health
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // --- Auth & Users ---
  app.get('/api/auth/current-user', (req, res) => {
    res.json(db.getCurrentUser());
  });

  app.post('/api/auth/current-user', (req, res) => {
    try {
      const { userId } = req.body;
      const user = db.setCurrentUser(userId);
      res.json(user);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/users', (req, res) => {
    res.json(db.getUsers());
  });

  app.post('/api/users', (req, res) => {
    try {
      const user = db.saveUser(req.body);
      res.status(201).json(user);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/users/:id', (req, res) => {
    try {
      const user = db.saveUser({ ...req.body, id: req.params.id });
      res.json(user);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- Products (Ficha Técnica) ---
  app.get('/api/products', (req, res) => {
    res.json(db.getProducts());
  });

  app.get('/api/products/:id', (req, res) => {
    const p = db.getProductById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(p);
  });

  app.post('/api/products', (req, res) => {
    try {
      const p = db.saveProduct(req.body);
      res.status(201).json(p);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/products/:id', (req, res) => {
    try {
      const p = db.saveProduct({ ...req.body, id: req.params.id });
      res.json(p);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/products/:id', (req, res) => {
    const success = db.deleteProduct(req.params.id);
    res.json({ success });
  });

  // --- Raw Materials ---
  app.get('/api/raw-materials', (req, res) => {
    res.json(db.getRawMaterials());
  });

  app.post('/api/raw-materials', (req, res) => {
    try {
      const m = db.saveRawMaterial(req.body);
      res.status(201).json(m);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/raw-materials/:id', (req, res) => {
    try {
      const m = db.saveRawMaterial({ ...req.body, id: req.params.id });
      res.json(m);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/raw-materials/:id/adjust', (req, res) => {
    try {
      const { delta } = req.body;
      const m = db.adjustRawMaterialStock(req.params.id, Number(delta) || 0);
      res.json(m);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/raw-materials/:id', (req, res) => {
    const success = db.deleteRawMaterial(req.params.id);
    res.json({ success });
  });

  // --- Customers ---
  app.get('/api/customers', (req, res) => {
    res.json(db.getCustomers());
  });

  app.post('/api/customers', (req, res) => {
    try {
      const c = db.saveCustomer(req.body);
      res.status(201).json(c);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/customers/:id', (req, res) => {
    try {
      const c = db.saveCustomer({ ...req.body, id: req.params.id });
      res.json(c);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/customers/:id', (req, res) => {
    const success = db.deleteCustomer(req.params.id);
    res.json({ success });
  });

  // --- Suppliers ---
  app.get('/api/suppliers', (req, res) => {
    res.json(db.getSuppliers());
  });

  app.post('/api/suppliers', (req, res) => {
    try {
      const s = db.saveSupplier(req.body);
      res.status(201).json(s);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/suppliers/:id', (req, res) => {
    try {
      const s = db.saveSupplier({ ...req.body, id: req.params.id });
      res.json(s);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/suppliers/:id', (req, res) => {
    const success = db.deleteSupplier(req.params.id);
    res.json({ success });
  });

  // --- Capacities ---
  app.get('/api/capacities', (req, res) => {
    res.json(db.getCapacities());
  });

  app.post('/api/capacities', (req, res) => {
    try {
      const cap = db.saveCapacity(req.body);
      res.status(201).json(cap);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/capacities/:id', (req, res) => {
    try {
      const cap = db.saveCapacity({ ...req.body, id: req.params.id });
      res.json(cap);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/capacities/:id', (req, res) => {
    const success = db.deleteCapacity(req.params.id);
    res.json({ success });
  });

  // --- Orders ---
  app.get('/api/orders', (req, res) => {
    res.json(db.getOrders());
  });

  app.post('/api/orders', (req, res) => {
    try {
      const ord = db.saveOrder(req.body);
      res.status(201).json(ord);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/orders/:id', (req, res) => {
    try {
      const ord = db.saveOrder({ ...req.body, id: req.params.id });
      res.json(ord);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/orders/:id', (req, res) => {
    const success = db.deleteOrder(req.params.id);
    res.json({ success });
  });

  // --- Production Orders (OP) ---
  app.get('/api/production-orders', (req, res) => {
    res.json(db.getProductionOrders());
  });

  app.get('/api/production-orders/:id', (req, res) => {
    const op = db.getProductionOrderById(req.params.id);
    if (!op) return res.status(404).json({ error: 'Ordem de Produção não encontrada' });
    res.json(op);
  });

  app.post('/api/production-orders', (req, res) => {
    try {
      const op = db.saveProductionOrder(req.body);
      res.status(201).json(op);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/production-orders/:id', (req, res) => {
    try {
      const op = db.saveProductionOrder({ ...req.body, id: req.params.id });
      res.json(op);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/production-orders/:id/advance-stage', (req, res) => {
    try {
      const { stageId, ...updates } = req.body;
      const op = db.advanceStage(req.params.id, stageId, updates);
      res.json(op);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/production-orders/:id/complete', (req, res) => {
    try {
      const op = db.completeProductionOrder(req.params.id, req.body);
      res.json(op);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/production-orders/:id', (req, res) => {
    const success = db.deleteProductionOrder(req.params.id);
    res.json({ success });
  });

  // --- Overview & Reports ---
  app.get('/api/reports/overview', (req, res) => {
    res.json(db.getSystemStats());
  });

  // --- Database Backup / Restore / Reset ---
  app.get('/api/database/backup', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="erp_backup.json"');
    res.json(db.exportDatabase());
  });

  app.post('/api/database/restore', (req, res) => {
    try {
      db.importDatabase(req.body);
      res.json({ success: true, message: 'Dados restaurados com sucesso' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/database/reset-demo', (req, res) => {
    const resetData = db.resetToDemo();
    res.json({ success: true, message: 'Dados redefinidos para os padrões demonstrativos' });
  });

  // Development: Vite middlewares
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production build
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ERP GestorPCP server online on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
