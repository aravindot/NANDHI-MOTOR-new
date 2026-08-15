import mongoose from 'mongoose';

const purchaseInvoiceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  purchaseType: { type: String, default: 'Vehicle Purchases' },
  supplierName: { type: String, default: '' },
  supplierGst: { type: String, default: '' },
  invoiceNo: { type: String, default: '' },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  itemDetails: { type: String, default: '' },
  qty: { type: Number, default: 1 },
  unitPrice: { type: Number, default: 0 },
  gstRate: { type: Number, default: 5 },
  gstAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 }
});

export default mongoose.model('PurchaseInvoice', purchaseInvoiceSchema);
