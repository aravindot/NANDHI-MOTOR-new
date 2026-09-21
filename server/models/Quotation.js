import mongoose from 'mongoose';

const quotationSchema = new mongoose.Schema({
  quoteId: { type: String, required: true, unique: true },
  customerName: { type: String, default: '' },
  customerPhone: { type: String, default: '' },
  customerAddress: { type: String, default: '' },
  customerEmail: { type: String, default: '' },
  customerAadhar: { type: String, default: '' },
  customerGst: { type: String, default: '' },
  executive: { type: String, default: '' },
  vehicleModel: { type: String, default: '' },
  vehicleColor: { type: String, default: '' },
  exShowroom: { type: Number, default: 0 },
  gstRate: { type: Number, default: 5 },
  gstAmount: { type: Number, default: 0 },
  rto: { type: Number, default: 0 },
  insurance: { type: Number, default: 0 },
  accessories: { type: Number, default: 0 },
  handling: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  createdOn: { type: String, default: () => new Date().toLocaleDateString('en-IN') }
});

export default mongoose.model('Quotation', quotationSchema);
