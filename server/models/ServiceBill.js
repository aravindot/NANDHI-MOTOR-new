import mongoose from 'mongoose';

const serviceBillSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  jobSheetId: { type: String, default: '' },
  customerName: { type: String, default: '' },
  vehicleNo: { type: String, default: '' },
  serviceType: { type: String, default: 'Paid Service' },
  laborItems: { type: Array, default: [] },
  parts: { type: Array, default: [] },
  subtotal: { type: Number, default: 0 },
  gst: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  roundOff: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  date: { type: String, default: () => new Date().toLocaleDateString('en-IN') }
});

export default mongoose.model('ServiceBill', serviceBillSchema);
