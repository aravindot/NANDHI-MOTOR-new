import mongoose from 'mongoose';

const executiveSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, default: '' },
  role: { type: String, default: 'Sales Executive' },
  department: { type: String, default: 'Sales' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  joinDate: { type: String, default: '' },
  monthlySalesTarget: { type: Number, default: 0 },
  salesAchieved: { type: Number, default: 0 },
  servicesTarget: { type: Number, default: 0 },
  servicesAchieved: { type: Number, default: 0 },
  incentiveEarned: { type: Number, default: 0 },
  status: { type: String, default: 'Active' }
});

export default mongoose.model('Executive', executiveSchema);
