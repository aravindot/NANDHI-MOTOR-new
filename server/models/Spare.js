import mongoose from 'mongoose';

const spareSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  dealerPrice: { type: Number, required: true },
  gstRate: { type: Number, default: 18 }, // e.g. 18%
  priceWithGst: { type: Number, required: true },
  mrp: { type: Number, required: true },
  createdOn: { type: String, default: () => new Date().toLocaleDateString('en-IN') }
});

export default mongoose.model('Spare', spareSchema);
