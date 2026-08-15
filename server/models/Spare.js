import mongoose from 'mongoose';

const spareSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  partNo: { type: String, default: '' },
  category: { type: String, default: 'General' },
  stock: { type: Number, default: 0 },
  quantity: { type: Number, default: 0 },
  minStock: { type: Number, default: 5 },
  unitPrice: { type: Number, default: 0 },
  dealerPrice: { type: Number, default: 0 },
  gstRate: { type: Number, default: 18 },
  priceWithGst: { type: Number, default: 0 },
  mrp: { type: Number, default: 0 },
  location: { type: String, default: 'Rack A-1' },
  createdOn: { type: String, default: () => new Date().toLocaleDateString('en-IN') }
});

export default mongoose.model('Spare', spareSchema);
