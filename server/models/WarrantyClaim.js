import mongoose from 'mongoose';

const warrantyClaimSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customerName: { type: String, default: '' },
  customerMobile: { type: String, default: '' },
  vehicleModel: { type: String, default: '' },
  vehicleRegNo: { type: String, default: '' },
  chassisNo: { type: String, default: '' },
  engineNo: { type: String, default: '' },
  dateOfSale: { type: String, default: '' },
  odometerKm: { type: String, default: '' },
  defectivePart: { type: String, default: '' },
  partCode: { type: String, default: '' },
  defectCategory: { type: String, default: 'General' },
  issueDescription: { type: String, default: '' },
  claimAmount: { type: Number, default: 0 },
  oemRefNo: { type: String, default: '' },
  status: { type: String, default: 'Pending' },
  submissionDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  settlementDate: { type: String, default: '' },
  notes: { type: String, default: '' }
});

export default mongoose.model('WarrantyClaim', warrantyClaimSchema);
