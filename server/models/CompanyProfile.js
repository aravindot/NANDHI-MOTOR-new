import mongoose from 'mongoose';

const companyProfileSchema = new mongoose.Schema({
  id: { type: String, default: 'main_profile', unique: true },
  name: { type: String, default: 'NANDHI MOTORS' },
  tagline: { type: String, default: '' },
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  altPhone: { type: String, default: '' },
  email: { type: String, default: '' },
  website: { type: String, default: '' },
  gstin: { type: String, default: '' },
  state: { type: String, default: '' },
  pan: { type: String, default: '' },
  bankName: { type: String, default: '' },
  accountName: { type: String, default: '' },
  accountNumber: { type: String, default: '' },
  ifscCode: { type: String, default: '' },
  branch: { type: String, default: '' },
  upiId: { type: String, default: '' },
  upiQrImage: { type: String, default: '' },
  logoUrl: { type: String, default: '' },
  quotationTerms: { type: String, default: '' },
  invoiceTerms: { type: String, default: '' }
}, { strict: false });

export default mongoose.model('CompanyProfile', companyProfileSchema);
