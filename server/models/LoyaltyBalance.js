import mongoose from 'mongoose';

const loyaltyBalanceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, default: '' },
  mobile: { type: String, default: '' },
  totalPoints: { type: Number, default: 0 },
  redeemedPoints: { type: Number, default: 0 },
  availablePoints: { type: Number, default: 0 }
});

export default mongoose.model('LoyaltyBalance', loyaltyBalanceSchema);
