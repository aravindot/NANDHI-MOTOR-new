import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import Models
import Vehicle from './models/Vehicle.js';
import Lead from './models/Lead.js';
import Customer from './models/Customer.js';
import Booking from './models/Booking.js';
import Spare from './models/Spare.js';
import Invoice from './models/Invoice.js';
import Quotation from './models/Quotation.js';
import JobSheet from './models/JobSheet.js';
import ServiceBill from './models/ServiceBill.js';
import Expense from './models/Expense.js';
import PurchaseInvoice from './models/PurchaseInvoice.js';
import WarrantyClaim from './models/WarrantyClaim.js';
import Executive from './models/Executive.js';
import CompanyProfile from './models/CompanyProfile.js';
import LoyaltyBalance from './models/LoyaltyBalance.js';
import Redemption from './models/Redemption.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB Atlas successfully.');
    await seedDatabase();
  })
  .catch((err) => {
    console.error('MongoDB Connection Error:', err.message);
  });

// Auto-Seeding Database helper
async function seedDatabase() {
  try {
    // 1. Seed Vehicles
    const vehicleCount = await Vehicle.countDocuments();
    if (vehicleCount === 0) {
      console.log('Seeding initial vehicle catalog...');
      await Vehicle.insertMany([
        { id: 'VEH-01', brand: 'Honda', model: 'Activa 6G', color: 'Matte Blue', hsnCode: '87112029', price: 82000 },
        { id: 'VEH-02', brand: 'Honda', model: 'Shine 125', color: 'Black', hsnCode: '87112029', price: 89000 },
        { id: 'VEH-03', brand: 'Honda', model: 'SP 125', color: 'Imperial Red', hsnCode: '87112029', price: 92000 }
      ]);
    }

    // 2. Seed Leads
    const leadCount = await Lead.countDocuments();
    if (leadCount === 0) {
      console.log('Seeding initial leads...');
      await Lead.insertMany([
        { id: 'L-01', name: 'Rajesh Kumar', mobile: '9842155670', vehicle: 'Honda Activa 6G', status: 'Hot', leadType: 'Hot', sourceType: 'Walk-In', executive: 'K. Balaji', createdOn: '14/08/2026' },
        { id: 'L-02', name: 'Priya Dharshini', mobile: '9443219800', vehicle: 'Honda Shine 125', status: 'Warm', leadType: 'Warm', sourceType: 'Digital / Web', executive: 'S. Karthik', createdOn: '13/08/2026' }
      ]);
    }

    // 3. Seed Customers
    const customerCount = await Customer.countDocuments();
    if (customerCount === 0) {
      console.log('Seeding initial customers...');
      await Customer.insertMany([
        { id: 'C-01', name: 'Rajesh Kumar', mobile: '9842155670', vehicleModel: 'Honda Activa 6G', source: 'Walk-In', address: '12, Gandhi Nagar, Namakkal' },
        { id: 'C-02', name: 'Priya Dharshini', mobile: '9443219800', vehicleModel: 'Honda Shine 125', source: 'Digital / Web', address: '45, Salem Main Road, Namakkal' }
      ]);
    }

    // 4. Seed Spares
    const spareCount = await Spare.countDocuments();
    if (spareCount === 0) {
      console.log('Seeding initial spares inventory...');
      await Spare.insertMany([
        { id: 'SP-01', name: 'Engine Oil 4T 10W30 (1L)', partNo: 'OIL-4T-10W30', category: 'Lubricants', stock: 48, minStock: 15, unitPrice: 380, location: 'Rack A-1' },
        { id: 'SP-02', name: 'Brake Shoe Set Activa 6G', partNo: 'BS-ACT-6G', category: 'Brakes', stock: 24, minStock: 10, unitPrice: 280, location: 'Rack B-2' },
        { id: 'SP-03', name: 'Spark Plug CPR8EA-9', partNo: 'SP-CPR8EA', category: 'Electricals', stock: 8, minStock: 12, unitPrice: 160, location: 'Rack C-1' }
      ]);
    }

    // 5. Seed Invoices
    const invoiceCount = await Invoice.countDocuments();
    if (invoiceCount === 0) {
      console.log('Seeding initial invoices...');
      await Invoice.insertMany([
        { invoiceNo: '01', customerName: 'Rajesh Kumar', customerPhone: '9842155670', customerAddress: '12, Gandhi Nagar, Namakkal', customerAadhar: '9821-4412-9901', customerGst: '33AAAAA0000A1Z5', vehicleModel: 'Honda Activa 6G', vehicleColor: 'Matte Blue', vinNumber: 'ME4JF911NK00892', engineNo: 'JF91E918231', batteryNumber: 'BAT-2026-NANDHI', chargerNumber: 'CHG-9921', controllerNumber: 'CTRL-8812', exShowroom: 82000, gstRate: 5, gstAmount: 4100, insurance: 6200, rto: 10400, subsidy: 0, discount: 0, totalBeforeRoundoff: 102700, grandTotal: 102700, paymentStatus: 'Fully Paid', invoiceDate: '14/08/2026' }
      ]);
    }

    // 6. Seed Quotations
    const quoteCount = await Quotation.countDocuments();
    if (quoteCount === 0) {
      console.log('Seeding initial quotations...');
      await Quotation.insertMany([
        { quoteId: 'QT-01', customerName: 'Rajesh Kumar', customerPhone: '9842155670', vehicleModel: 'Honda Activa 6G', vehicleColor: 'Matte Blue', exShowroom: 82000, rto: 10400, insurance: 6200, accessories: 1500, handling: 0, discount: 1000, total: 99100, createdOn: '14/08/2026' }
      ]);
    }

    // 7. Seed JobSheets
    const jobSheetCount = await JobSheet.countDocuments();
    if (jobSheetCount === 0) {
      console.log('Seeding initial job sheets...');
      await JobSheet.insertMany([
        { id: 'JS-01', customerName: 'Rajesh Kumar', customerPhone: '9842155670', vehicleNo: 'TN-37-BJ-5120', vehicleKm: '12400', complaints: '1. Odometer console flicker\n2. Front suspension noise\n3. General water wash', serviceType: 'Paid Service', status: 'In Progress', billingStatus: 'Unbilled', date: '14/08/2026' },
        { id: 'JS-02', customerName: 'Deepak Sharma', customerPhone: '9443219800', vehicleNo: 'TN-45-AS-9821', vehicleKm: '8200', complaints: '1. First free service checkup\n2. Battery voltage testing', serviceType: 'Free Service', status: 'Ready', billingStatus: 'Unbilled', date: '13/08/2026' }
      ]);
    }

    // 8. Seed ServiceBills
    const serviceBillCount = await ServiceBill.countDocuments();
    if (serviceBillCount === 0) {
      console.log('Seeding initial service bills...');
      await ServiceBill.insertMany([
        { id: 'SB-01', jobSheetId: 'JS-01', customerName: 'Sanjay Kumar', vehicleNo: 'TN-37-BJ-5120', serviceType: 'Paid Service', laborItems: [{ desc: 'General Labor', amount: 350 }], parts: [{ id: 'SP-01', name: 'Brake Shoe Set Activa 6G', price: 280, qty: 1 }], subtotal: 630, gst: 32, discount: 0, roundOff: -2, grandTotal: 660, date: '12/08/2026' }
      ]);
    }

    // 9. Seed Expenses
    const expenseCount = await Expense.countDocuments();
    if (expenseCount === 0) {
      console.log('Seeding initial expenses...');
      await Expense.insertMany([
        { id: 'EXP-01', category: 'Rent', amount: 15000, payee: 'Showroom Owner', date: '2026-08-01', paymentMode: 'Bank Transfer', notes: 'Monthly Showroom Rent' },
        { id: 'EXP-02', category: 'Electricity', amount: 3450, payee: 'TNEB Electricity Board', date: '2026-08-05', paymentMode: 'UPI', notes: 'Electricity bill for July' },
        { id: 'EXP-03', category: 'Snacks', amount: 450, payee: 'Sri Krishna Tea Stall', date: '2026-08-14', paymentMode: 'Cash', notes: 'Staff & customer refreshments' }
      ]);
    }

    // 10. Seed Purchases
    const purchaseCount = await PurchaseInvoice.countDocuments();
    if (purchaseCount === 0) {
      console.log('Seeding initial purchase invoices...');
      await PurchaseInvoice.insertMany([
        { id: 'PUR-01', purchaseType: 'Vehicle Purchases', supplierName: 'Honda Motorcycle & Scooter India', supplierGst: '33AABCH1234F1Z5', invoiceNo: 'HMSI-INV-9921', date: '2026-08-02', itemDetails: '5x Honda Activa 6G (Black)', qty: 5, unitPrice: 75000, gstRate: 5, gstAmount: 18750, totalAmount: 393750 },
        { id: 'PUR-02', purchaseType: 'Spare Purchases', supplierName: 'Anand Auto Spares Co', supplierGst: '33AABCA9876E1Z1', invoiceNo: 'AAS-8812', date: '2026-08-08', itemDetails: '20x Brake Shoe Set Activa 6G', qty: 20, unitPrice: 220, gstRate: 18, gstAmount: 792, totalAmount: 5192 }
      ]);
    }

    // 11. Seed Executives
    const execCount = await Executive.countDocuments();
    if (execCount === 0) {
      console.log('Seeding initial executives...');
      await Executive.insertMany([
        { id: 'EMP-01', name: 'K. Balaji', role: 'Senior Sales Executive', department: 'Sales', phone: '9842109876', email: 'balaji.sales@nandhimotors.com', joinDate: '2023-04-10', monthlySalesTarget: 12, salesAchieved: 10, servicesTarget: 0, servicesAchieved: 0, incentiveEarned: 15000, status: 'Active' },
        { id: 'EMP-02', name: 'S. Karthik', role: 'Sales Executive', department: 'Sales', phone: '9843211223', email: 'karthik.s@nandhimotors.com', joinDate: '2024-01-15', monthlySalesTarget: 10, salesAchieved: 8, servicesTarget: 0, servicesAchieved: 0, incentiveEarned: 9500, status: 'Active' }
      ]);
    }

    // 12. Seed Company Profile
    const profileCount = await CompanyProfile.countDocuments();
    if (profileCount === 0) {
      console.log('Seeding company profile...');
      await CompanyProfile.create({
        id: 'main_profile',
        name: 'NANDHI MOTORS',
        tagline: 'Authorized Two-Wheeler Sales, Genuine Spares & Service Dealership',
        address: 'SF No. 124/2, Trichy Main Road, Namakkal, Tamil Nadu - 637001',
        phone: '+91 98421 55670',
        altPhone: '+91 94432 19800',
        email: 'contact@nandhimotors.com',
        website: 'www.nandhimotors.com',
        gstin: '33AABCN1234F1Z9',
        state: 'Tamil Nadu (33)',
        pan: 'AABCN1234F',
        bankName: 'HDFC Bank',
        accountName: 'NANDHI MOTORS',
        accountNumber: '50200088991234',
        ifscCode: 'HDFC0001234',
        branch: 'Namakkal Main Branch'
      });
    }

    console.log('MongoDB Atlas seeding check complete.');
  } catch (error) {
    console.error('Error during database seeding:', error.message);
  }
}

// ==========================================
// 1. VEHICLE API ROUTES
// ==========================================
app.get('/api/vehicles', async (req, res) => {
  try {
    const list = await Vehicle.find().sort({ _id: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vehicles', async (req, res) => {
  try {
    const id = req.body.id || `VEH-${Date.now().toString().slice(-4)}`;
    const data = { ...req.body, id };
    const saved = await Vehicle.findOneAndUpdate({ id }, { $set: data }, { upsert: true, new: true, setDefaultsOnInsert: true });
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/vehicles/:id', async (req, res) => {
  try {
    const result = await Vehicle.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Deleted', data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. LEAD API ROUTES
// ==========================================
app.get('/api/leads', async (req, res) => {
  try {
    const list = await Lead.find().sort({ _id: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/leads', async (req, res) => {
  try {
    const id = req.body.id || `L-${Date.now().toString().slice(-4)}`;
    const data = { ...req.body, id };
    const saved = await Lead.findOneAndUpdate({ id }, { $set: data }, { upsert: true, new: true, setDefaultsOnInsert: true });
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/leads/:id', async (req, res) => {
  try {
    const result = await Lead.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Deleted', data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. CUSTOMER API ROUTES
// ==========================================
app.get('/api/customers', async (req, res) => {
  try {
    const list = await Customer.find().sort({ _id: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const id = req.body.id || `C-${Date.now().toString().slice(-4)}`;
    const data = { ...req.body, id };
    const saved = await Customer.findOneAndUpdate(
      { mobile: req.body.mobile },
      { $set: data },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    const result = await Customer.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Deleted', data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. BOOKING API ROUTES
// ==========================================
app.get('/api/bookings', async (req, res) => {
  try {
    const list = await Booking.find().sort({ _id: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const id = req.body.id || `BK-${Date.now().toString().slice(-4)}`;
    const data = { ...req.body, id };
    const saved = await Booking.findOneAndUpdate({ id }, { $set: data }, { upsert: true, new: true, setDefaultsOnInsert: true });
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const result = await Booking.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Deleted', data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. SPARE INVENTORY API ROUTES
// ==========================================
app.get('/api/spares', async (req, res) => {
  try {
    const list = await Spare.find().sort({ _id: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/spares', async (req, res) => {
  try {
    const id = req.body.id || `SPR-${Date.now().toString().slice(-4)}`;
    const data = { ...req.body, id };
    const saved = await Spare.findOneAndUpdate({ id }, { $set: data }, { upsert: true, new: true, setDefaultsOnInsert: true });
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/spares/:id', async (req, res) => {
  try {
    const result = await Spare.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Deleted', data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. INVOICE API ROUTES
// ==========================================
app.get('/api/invoices', async (req, res) => {
  try {
    const list = await Invoice.find().sort({ _id: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/invoices', async (req, res) => {
  try {
    const invoiceNo = req.body.invoiceNo || `INV-${Date.now().toString().slice(-4)}`;
    const data = { ...req.body, invoiceNo };
    const saved = await Invoice.findOneAndUpdate({ invoiceNo }, { $set: data }, { upsert: true, new: true, setDefaultsOnInsert: true });
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/invoices/:invoiceNo', async (req, res) => {
  try {
    const result = await Invoice.findOneAndDelete({ invoiceNo: req.params.invoiceNo });
    res.json({ message: 'Deleted', data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. QUOTATION API ROUTES
// ==========================================
app.get('/api/quotations', async (req, res) => {
  try {
    const list = await Quotation.find().sort({ _id: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/quotations', async (req, res) => {
  try {
    const quoteId = req.body.quoteId || `QT-${Date.now().toString().slice(-4)}`;
    const data = { ...req.body, quoteId };
    const saved = await Quotation.findOneAndUpdate({ quoteId }, { $set: data }, { upsert: true, new: true, setDefaultsOnInsert: true });
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/quotations/:quoteId', async (req, res) => {
  try {
    const result = await Quotation.findOneAndDelete({ quoteId: req.params.quoteId });
    res.json({ message: 'Deleted', data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 8. JOBSHEETS API ROUTES
// ==========================================
app.get('/api/jobsheets', async (req, res) => {
  try {
    const list = await JobSheet.find().sort({ _id: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/jobsheets', async (req, res) => {
  try {
    const id = req.body.id || `JS-${Date.now().toString().slice(-4)}`;
    const data = { ...req.body, id };
    const saved = await JobSheet.findOneAndUpdate({ id }, { $set: data }, { upsert: true, new: true, setDefaultsOnInsert: true });
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/jobsheets/:id', async (req, res) => {
  try {
    const result = await JobSheet.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Deleted', data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 9. SERVICE BILLS API ROUTES
// ==========================================
app.get('/api/service-bills', async (req, res) => {
  try {
    const list = await ServiceBill.find().sort({ _id: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/service-bills', async (req, res) => {
  try {
    const id = req.body.id || `SB-${Date.now().toString().slice(-4)}`;
    const data = { ...req.body, id };
    const saved = await ServiceBill.findOneAndUpdate({ id }, { $set: data }, { upsert: true, new: true, setDefaultsOnInsert: true });
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/service-bills/:id', async (req, res) => {
  try {
    const result = await ServiceBill.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Deleted', data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 10. DAILY EXPENSES API ROUTES
// ==========================================
app.get('/api/expenses', async (req, res) => {
  try {
    const list = await Expense.find().sort({ _id: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const id = req.body.id || `EXP-${Date.now().toString().slice(-4)}`;
    const data = { ...req.body, id };
    const saved = await Expense.findOneAndUpdate({ id }, { $set: data }, { upsert: true, new: true, setDefaultsOnInsert: true });
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const result = await Expense.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Deleted', data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 11. PURCHASE INVOICES API ROUTES
// ==========================================
app.get('/api/purchases', async (req, res) => {
  try {
    const list = await PurchaseInvoice.find().sort({ _id: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/purchases', async (req, res) => {
  try {
    const id = req.body.id || `PUR-${Date.now().toString().slice(-4)}`;
    const data = { ...req.body, id };
    const saved = await PurchaseInvoice.findOneAndUpdate({ id }, { $set: data }, { upsert: true, new: true, setDefaultsOnInsert: true });
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/purchases/:id', async (req, res) => {
  try {
    const result = await PurchaseInvoice.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Deleted', data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 12. WARRANTY CLAIMS API ROUTES
// ==========================================
app.get('/api/warranties', async (req, res) => {
  try {
    const list = await WarrantyClaim.find().sort({ _id: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/warranties', async (req, res) => {
  try {
    const id = req.body.id || `WC-${Date.now().toString().slice(-4)}`;
    const data = { ...req.body, id };
    const saved = await WarrantyClaim.findOneAndUpdate({ id }, { $set: data }, { upsert: true, new: true, setDefaultsOnInsert: true });
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/warranties/:id', async (req, res) => {
  try {
    const result = await WarrantyClaim.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Deleted', data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 13. EXECUTIVES API ROUTES
// ==========================================
app.get('/api/executives', async (req, res) => {
  try {
    const list = await Executive.find().sort({ _id: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/executives', async (req, res) => {
  try {
    const id = req.body.id || `EMP-${Date.now().toString().slice(-4)}`;
    const data = { ...req.body, id };
    const saved = await Executive.findOneAndUpdate({ id }, { $set: data }, { upsert: true, new: true, setDefaultsOnInsert: true });
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/executives/:id', async (req, res) => {
  try {
    const result = await Executive.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Deleted', data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 14. COMPANY PROFILE API ROUTES
// ==========================================
app.get('/api/company-profile', async (req, res) => {
  try {
    const profile = await CompanyProfile.findOne({ id: 'main_profile' });
    res.json(profile || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/company-profile', async (req, res) => {
  try {
    const data = { ...req.body, id: 'main_profile' };
    const saved = await CompanyProfile.findOneAndUpdate({ id: 'main_profile' }, { $set: data }, { upsert: true, new: true, setDefaultsOnInsert: true });
    res.status(200).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 15. LOYALTY & REDEMPTIONS API ROUTES
// ==========================================
app.get('/api/loyalty-balances', async (req, res) => {
  try {
    const list = await LoyaltyBalance.find().sort({ _id: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/loyalty-balances', async (req, res) => {
  try {
    const id = req.body.id || `C-${Date.now().toString().slice(-4)}`;
    const data = { ...req.body, id };
    const saved = await LoyaltyBalance.findOneAndUpdate({ id }, { $set: data }, { upsert: true, new: true, setDefaultsOnInsert: true });
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/redemptions', async (req, res) => {
  try {
    const list = await Redemption.find().sort({ _id: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/redemptions', async (req, res) => {
  try {
    const id = req.body.id || `RED-${Date.now().toString().slice(-4)}`;
    const data = { ...req.body, id };
    const saved = await Redemption.findOneAndUpdate({ id }, { $set: data }, { upsert: true, new: true, setDefaultsOnInsert: true });
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
