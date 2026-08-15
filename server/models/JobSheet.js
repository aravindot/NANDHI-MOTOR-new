import mongoose from 'mongoose';

const jobSheetSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customerName: { type: String, default: '' },
  customerPhone: { type: String, default: '' },
  vehicleNo: { type: String, default: '' },
  vehicleKm: { type: String, default: '' },
  complaints: { type: String, default: '' },
  serviceType: { type: String, default: 'Paid Service' },
  status: { type: String, default: 'In Progress' },
  billingStatus: { type: String, default: 'Unbilled' },
  date: { type: String, default: () => new Date().toLocaleDateString('en-IN') }
});

export default mongoose.model('JobSheet', jobSheetSchema);
