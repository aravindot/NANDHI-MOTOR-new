import mongoose from 'mongoose';

const ledgerEntrySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  account: { type: String, required: true },
  referenceId: { type: String, required: true },
  type: { type: String, enum: ['Income', 'Expense'], required: true },
  credit: { type: Number, default: 0 },
  debit: { type: Number, default: 0 },
  gstPaid: { type: Number, default: 0 },
  sourceId: { type: mongoose.Schema.Types.ObjectId, refPath: 'sourceModel' },
  sourceModel: { type: String }
});

export default mongoose.model('LedgerEntry', ledgerEntrySchema);
