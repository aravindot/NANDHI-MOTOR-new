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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
// Set limits high to support base64 images uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to local MongoDB successfully.');
    await seedDatabase();
  })
  .catch((err) => {
    console.error('MongoDB Connection Error:', err.message);
  });

// Auto-Seeding Database helper
async function seedDatabase() {
  try {
    // If there are vehicles with old 6-digit IDs, drop the collection and re-seed
    const oldIdExists = await Vehicle.findOne({ id: /VEH-\d{6}/ });
    if (oldIdExists) {
      console.log('Detected old 6-digit vehicle IDs. Clearing vehicles collection...');
      await Vehicle.deleteMany({});
    }

    const vehicleCount = await Vehicle.countDocuments();
    if (vehicleCount === 0) {
      console.log('Seeding initial 3-digit vehicle catalog...');
      const defaultVehicles = [
        {
          id: 'VEH-101',
          brand: 'Honda',
          model: 'Activa 6G',
          color: 'Blue',
          hsnCode: '87112029',
          image: ''
        },
        {
          id: 'VEH-102',
          brand: 'Honda',
          model: 'Shine 125',
          color: 'Black',
          hsnCode: '87112029',
          image: ''
        },
        {
          id: 'VEH-103',
          brand: 'Honda',
          model: 'SP 125',
          color: 'Red',
          hsnCode: '87112029',
          image: ''
        }
      ];
      await Vehicle.insertMany(defaultVehicles);
      console.log('Default vehicle catalog seeded successfully with 3-digit IDs!');
    }
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
}

// ==========================================
// 1. VEHICLE API ROUTES
// ==========================================

// Get all vehicles
app.get('/api/vehicles', async (req, res) => {
  try {
    const list = await Vehicle.find().sort({ _id: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a vehicle
app.post('/api/vehicles', async (req, res) => {
  try {
    const { brand, model, color, hsnCode, image } = req.body;
    const count = await Vehicle.countDocuments();
    const newVehicle = new Vehicle({
      id: `VEH-${101 + count}`,
      brand,
      model,
      color,
      hsnCode,
      image: image || ''
    });
    const saved = await newVehicle.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a vehicle
app.delete('/api/vehicles/:id', async (req, res) => {
  try {
    const result = await Vehicle.findOneAndDelete({ id: req.params.id });
    if (!result) return res.status(404).json({ error: 'Vehicle not found' });
    res.json({ message: 'Vehicle deleted successfully', data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. LEAD API ROUTES
// ==========================================

// Get all leads
app.get('/api/leads', async (req, res) => {
  try {
    const list = await Lead.find().sort({ _id: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a lead
app.post('/api/leads', async (req, res) => {
  try {
    const count = await Lead.countDocuments();
    const newLead = new Lead({
      ...req.body,
      id: `L-${1001 + count}`
    });
    const saved = await newLead.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a lead
app.delete('/api/leads/:id', async (req, res) => {
  try {
    const result = await Lead.findOneAndDelete({ id: req.params.id });
    if (!result) return res.status(404).json({ error: 'Lead not found' });
    res.json({ message: 'Lead deleted successfully', data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. CUSTOMER API ROUTES
// ==========================================

// Get all customers
app.get('/api/customers', async (req, res) => {
  try {
    const list = await Customer.find().sort({ _id: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a customer
app.post('/api/customers', async (req, res) => {
  try {
    const { name, mobile, email, aadhar, address, sourceType, source } = req.body;
    
    // Check if customer already exists by mobile
    const existing = await Customer.findOne({ mobile });
    if (existing) {
      return res.status(200).json(existing); // Return existing instead of throwing error
    }

    const count = await Customer.countDocuments();
    const newCustomer = new Customer({
      id: `C-${1001 + count}`,
      name,
      mobile,
      email: email || '',
      aadhar: aadhar || '',
      address: address || '',
      source: source || sourceType || 'Walk-In'
    });
    const saved = await newCustomer.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a customer
app.delete('/api/customers/:id', async (req, res) => {
  try {
    const result = await Customer.findOneAndDelete({ id: req.params.id });
    if (!result) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'Customer deleted successfully', data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. BOOKING API ROUTES
// ==========================================

// Get all bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const list = await Booking.find().sort({ _id: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a booking
app.post('/api/bookings', async (req, res) => {
  try {
    const count = await Booking.countDocuments();
    const newBooking = new Booking({
      ...req.body,
      id: `BK-${1001 + count}`
    });
    const saved = await newBooking.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a booking
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const result = await Booking.findOneAndDelete({ id: req.params.id });
    if (!result) return res.status(404).json({ error: 'Booking not found' });
    res.json({ message: 'Booking deleted successfully', data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. SPARE INVENTORY API ROUTES
// ==========================================

// Get all spares
app.get('/api/spares', async (req, res) => {
  try {
    const list = await Spare.find().sort({ _id: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a spare part
app.post('/api/spares', async (req, res) => {
  try {
    const count = await Spare.countDocuments();
    const newSpare = new Spare({
      ...req.body,
      id: `SPR-${101 + count}`
    });
    const saved = await newSpare.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a spare part
app.delete('/api/spares/:id', async (req, res) => {
  try {
    const result = await Spare.findOneAndDelete({ id: req.params.id });
    if (!result) return res.status(404).json({ error: 'Spare part not found' });
    res.json({ message: 'Spare part deleted successfully', data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. INVOICE API ROUTES
// ==========================================

// Get all invoices
app.get('/api/invoices', async (req, res) => {
  try {
    const list = await Invoice.find().sort({ _id: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add an invoice
app.post('/api/invoices', async (req, res) => {
  try {
    const newInvoice = new Invoice(req.body);
    const saved = await newInvoice.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete an invoice by invoiceNo
app.delete('/api/invoices/:invoiceNo', async (req, res) => {
  try {
    const result = await Invoice.findOneAndDelete({ invoiceNo: req.params.invoiceNo });
    if (!result) return res.status(404).json({ error: 'Invoice not found' });
    res.json({ message: 'Invoice deleted successfully', data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. QUOTATION API ROUTES
// ==========================================

// Get all quotations
app.get('/api/quotations', async (req, res) => {
  try {
    const list = await Quotation.find().sort({ _id: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a quotation
app.post('/api/quotations', async (req, res) => {
  try {
    const count = await Quotation.countDocuments();
    const newQuote = new Quotation({
      ...req.body,
      quoteId: `Q-${101 + count}`
    });
    const saved = await newQuote.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a quotation
app.delete('/api/quotations/:quoteId', async (req, res) => {
  try {
    const result = await Quotation.findOneAndDelete({ quoteId: req.params.quoteId });
    if (!result) return res.status(404).json({ error: 'Quotation not found' });
    res.json({ message: 'Quotation deleted successfully', data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
