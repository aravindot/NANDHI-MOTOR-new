import mongoose from 'mongoose';

const quotationSchema = new mongoose.Schema({
  quoteId: { type: String, required: true, unique: true },
  customerName: { type: String },
  customerPhone: { type: String },
  vehicleModel: { type: String, required: true },
  vehicleColor: { type: String, required: true },
  exShowroom: { type: Number, required: true },
  rto: { type: Number, default: 0 },
  insurance: { type: Number, default: 0 },
  accessories: { type: Number, default: 0 },
  handling: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  createdOn: { type: String, default: () => new Date().toLocaleDateString('en-IN') }
});

export default mongoose.model('Quotation', quotationSchema);
