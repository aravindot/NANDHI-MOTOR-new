import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String },
  aadhar: { type: String },
  address: { type: String },
  sourceType: { type: String, default: 'Walk-In' },
  executive: { type: String },
  vehicle: { type: String },
  color: { type: String },
  price: { type: Number },
  leadType: { type: String, default: 'Hot' },
  status: { type: String, default: 'Entered' },
  followupDate: { type: String },
  note: { type: String },
  createdOn: { type: String, default: () => new Date().toLocaleDateString('en-IN') }
});

export default mongoose.model('Lead', leadSchema);
