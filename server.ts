import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

const DB_PATH = path.join(__dirname, 'data', 'db.json');

// Helper to read DB safely
function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const initial = {
        shop: {
          name: 'MM Digital Point',
          phone: '9477900842',
          address: 'Atghara',
          upiId: 'uid1@ybl',
        },
        categories: [
          { id: 'cat-xerox', name: 'Xerox & Print', bengaliName: 'জেরক্স ও প্রিন্ট' },
          { id: 'cat-form', name: 'Online Form Fillup', bengaliName: 'অনলাইন ফর্ম ফিলাপ' },
          { id: 'cat-photo', name: 'Passport Photo', bengaliName: 'পাসপোর্ট ছবি' },
          { id: 'cat-recharge', name: 'Recharge & Bill', bengaliName: 'রিচার্জ ও বিল' },
          { id: 'cat-card', name: 'Card & Lamination', bengaliName: 'স্মার্ট কার্ড ও লেমিনেশন' },
        ],
        services: [
          { id: 'srv-1', categoryId: 'cat-xerox', name: 'B&W Xerox (Single Side)', rate: 2, unit: 'page' },
          { id: 'srv-2', categoryId: 'cat-xerox', name: 'B&W Xerox (Both Sides)', rate: 3, unit: 'page' },
          { id: 'srv-3', categoryId: 'cat-xerox', name: 'Color Print / Xerox', rate: 10, unit: 'page' },
          { id: 'srv-4', categoryId: 'cat-form', name: 'Govt Job Form Fillup', rate: 100, unit: 'form' },
          { id: 'srv-5', categoryId: 'cat-form', name: 'Scholarship Apply (SVMCM)', rate: 80, unit: 'form' },
          { id: 'srv-6', categoryId: 'cat-form', name: 'PAN Card Apply / Correction', rate: 150, unit: 'form' },
          { id: 'srv-7', categoryId: 'cat-photo', name: 'Passport Photo (8 copies)', rate: 50, unit: 'set' },
          { id: 'srv-8', categoryId: 'cat-card', name: 'PVC Smart Card (Aadhaar/Voter)', rate: 50, unit: 'piece' },
          { id: 'srv-9', categoryId: 'cat-card', name: 'Lamination (A4)', rate: 20, unit: 'piece' },
        ],
        transactions: [],
      };
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
      fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB:', err);
    return { shop: {}, categories: [], services: [], transactions: [] };
  }
}

// Helper to write DB safely
function writeDB(data: any) {
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing DB:', err);
  }
}

// REST API Endpoints

// 1. Get entire DB
app.get('/api/data', (req, res) => {
  const db = readDB();
  res.json(db);
});

// 2. Add category
app.post('/api/categories', (req, res) => {
  const { name, bengaliName } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }
  const db = readDB();
  const newCat = {
    id: `cat-${Date.now()}`,
    name: name.trim(),
    bengaliName: bengaliName ? bengaliName.trim() : undefined,
  };
  db.categories.push(newCat);
  writeDB(db);
  res.status(201).json(newCat);
});

// 3. Delete category
app.delete('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.categories = db.categories.filter((c: any) => c.id !== id);
  // Also remove services belonging to this category
  db.services = db.services.filter((s: any) => s.categoryId !== id);
  writeDB(db);
  res.json({ success: true });
});

// 4. Add work / service with rate
app.post('/api/services', (req, res) => {
  const { categoryId, name, rate, unit } = req.body;
  if (!name || rate === undefined) {
    return res.status(400).json({ error: 'Name and rate are required' });
  }
  const db = readDB();
  const newService = {
    id: `srv-${Date.now()}`,
    categoryId: categoryId || (db.categories[0]?.id || 'cat-general'),
    name: name.trim(),
    rate: Number(rate) || 0,
    unit: unit || 'item',
  };
  db.services.push(newService);
  writeDB(db);
  res.status(201).json(newService);
});

// 5. Update work / rate
app.put('/api/services/:id', (req, res) => {
  const { id } = req.params;
  const { name, rate, unit, categoryId } = req.body;
  const db = readDB();
  const srv = db.services.find((s: any) => s.id === id);
  if (!srv) {
    return res.status(404).json({ error: 'Service not found' });
  }
  if (name !== undefined) srv.name = name.trim();
  if (rate !== undefined) srv.rate = Number(rate) || 0;
  if (unit !== undefined) srv.unit = unit;
  if (categoryId !== undefined) srv.categoryId = categoryId;
  writeDB(db);
  res.json(srv);
});

// 6. Delete work
app.delete('/api/services/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.services = db.services.filter((s: any) => s.id !== id);
  writeDB(db);
  res.json({ success: true });
});

// 7. Add customer work transaction
app.post('/api/transactions', (req, res) => {
  const {
    customerName,
    customerPhone,
    items,
    categoryName,
    serviceName,
    quantity,
    rate,
    totalAmount,
    paidAmount,
    dueAmount,
    paymentMode,
    notes,
    status,
  } = req.body;

  const db = readDB();
  const now = new Date();
  const countToday = db.transactions.filter((t: any) => {
    return new Date(t.date).toDateString() === now.toDateString();
  }).length;

  const tokenNumber = `T-${100 + countToday + 1}`;
  const receiptNumber = `CC-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(db.transactions.length + 1).padStart(3, '0')}`;

  const validItems = Array.isArray(items) && items.length > 0 ? items : [];
  const primaryService = validItems.length === 1 
    ? validItems[0].serviceName 
    : validItems.length > 1 
      ? validItems.map((it: any) => `${it.serviceName} (×${it.quantity})`).join(', ')
      : (serviceName || 'General Work');

  const primaryCategory = validItems.length === 1
    ? (validItems[0].categoryName || 'General')
    : validItems.length > 1
      ? 'Multi-Item (বিবিধ)'
      : (categoryName || 'General');

  const calcTotal = validItems.length > 0
    ? validItems.reduce((acc: number, it: any) => acc + (Number(it.amount) || (Number(it.quantity) * Number(it.rate)) || 0), 0)
    : (Number(totalAmount) || 0);

  const calcQty = validItems.length > 0
    ? validItems.reduce((acc: number, it: any) => acc + (Number(it.quantity) || 1), 0)
    : (Number(quantity) || 1);

  const finalTotal = totalAmount !== undefined ? Number(totalAmount) : calcTotal;
  const finalPaid = Number(paidAmount) || 0;
  const finalDue = dueAmount !== undefined ? Number(dueAmount) : Math.max(0, finalTotal - finalPaid);

  const newTx = {
    id: `tx-${Date.now()}`,
    receiptNumber,
    tokenNumber,
    date: now.toISOString(),
    customerName: customerName ? customerName.trim() : 'Walk-in Customer',
    customerPhone: customerPhone ? customerPhone.trim() : 'N/A',
    items: validItems.length > 0 ? validItems : undefined,
    categoryName: primaryCategory,
    serviceName: primaryService,
    quantity: calcQty,
    rate: validItems.length === 1 ? Number(validItems[0].rate) : (Number(rate) || 0),
    totalAmount: finalTotal,
    paidAmount: finalPaid,
    dueAmount: finalDue,
    paymentMode: paymentMode || 'cash',
    status: status || (finalDue > 0 ? 'due' : 'completed'),
    notes: notes || '',
  };

  db.transactions.unshift(newTx);
  writeDB(db);
  res.status(201).json(newTx);
});

// 8. Update transaction (collect due, change status)
app.put('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  const { paidAmount, dueAmount, status, notes } = req.body;
  const db = readDB();
  const tx = db.transactions.find((t: any) => t.id === id);
  if (!tx) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  if (paidAmount !== undefined) tx.paidAmount = Number(paidAmount);
  if (dueAmount !== undefined) tx.dueAmount = Number(dueAmount);
  if (status !== undefined) tx.status = status;
  if (notes !== undefined) tx.notes = notes;
  writeDB(db);
  res.json(tx);
});

// 9. Delete transaction
app.delete('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.transactions = db.transactions.filter((t: any) => t.id !== id);
  writeDB(db);
  res.json({ success: true });
});

// 10. Update shop info
app.put('/api/shop', (req, res) => {
  const { name, phone, address, upiId } = req.body;
  const db = readDB();
  db.shop = {
    name: name !== undefined ? name : db.shop.name,
    phone: phone !== undefined ? phone : db.shop.phone,
    address: address !== undefined ? address : db.shop.address,
    upiId: upiId !== undefined ? upiId : db.shop.upiId,
  };
  writeDB(db);
  res.json(db.shop);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cyber Cafe Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
