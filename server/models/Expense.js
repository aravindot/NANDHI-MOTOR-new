import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  category: { type: String, default: '' },
  amount: { type: Number, default: 0 },
  payee: { type: String, default: '' },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  paymentMode: { type: String, default: 'Cash' },
  notes: { type: String, default: '' }
});

export default mongoose.model('Expense', expenseSchema);
