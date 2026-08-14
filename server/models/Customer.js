import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  email: { type: String },
  aadhar: { type: String },
  address: { type: String },
  source: { type: String, default: 'Walk-In' },
  registeredOn: { type: String, default: () => new Date().toLocaleDateString('en-IN') }
});

export default mongoose.model('Customer', customerSchema);
