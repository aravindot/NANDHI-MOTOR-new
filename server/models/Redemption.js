import mongoose from 'mongoose';

const redemptionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customerName: { type: String, default: '' },
  mobile: { type: String, default: '' },
  rewardTitle: { type: String, default: '' },
  rewardIcon: { type: String, default: '' },
  pointsRedeemed: { type: Number, default: 0 },
  voucherCode: { type: String, default: '' },
  redeemedOn: { type: String, default: () => new Date().toLocaleDateString('en-IN') },
  status: { type: String, default: 'Redeemed' }
});

export default mongoose.model('Redemption', redemptionSchema);
