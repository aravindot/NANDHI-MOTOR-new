import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true, unique: true },
  invoiceDate: { type: String, required: true },
  customerName: { type: String, required: true },
  customerAddress: { type: String },
  customerAadhar: { type: String },
  customerGst: { type: String },
  vehicleModel: { type: String, required: true },
  vehicleColor: { type: String, required: true },
  vinNumber: { type: String },
  batteryNumber: { type: String },
  chargerNumber: { type: String },
  controllerNumber: { type: String },
  warrantyDetails: { type: String },
  exShowroom: { type: Number, required: true },
  gstRate: { type: Number, default: 28 },
  gstAmount: { type: Number },
  insurance: { type: Number, default: 0 },
  rto: { type: Number, default: 0 },
  subsidy: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalBeforeRoundoff: { type: Number },
  grandTotal: { type: Number },
  roundoffAdjustment: { type: Number },
  paymentStatus: { type: String, default: 'Fully Paid' },
  createdOn: { type: String, default: () => new Date().toLocaleDateString('en-IN') }
});

// Convert Invoice to LedgerEntry format
invoiceSchema.methods.toLedgerEntry = function() {
  return {
    date: this.invoiceDate || this.createdOn,
    amount: this.grandTotal || 0,
    description: `Vehicle Sale: ${this.customerName} (${this.vehicleModel})`,
    account: 'Sales',
    referenceId: this.invoiceNo,
    type: 'Income',
    gstPaid: this.gstAmount || 0,
    sourceId: this._id,
    sourceModel: 'Invoice'
  };
};

export default mongoose.model('Invoice', invoiceSchema);
