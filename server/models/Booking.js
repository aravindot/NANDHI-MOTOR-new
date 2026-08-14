import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  mobile: { type: String, required: true },
  vehicleModel: { type: String, required: true },
  vehicleColor: { type: String, required: true },
  bookingDate: { type: String, required: true },
  deliveryDate: { type: String },
  bookingAmount: { type: Number, required: true },
  paymentMode: { type: String, default: 'Cash' },
  notes: { type: String },
  createdOn: { type: String, default: () => new Date().toLocaleDateString('en-IN') }
});

export default mongoose.model('Booking', bookingSchema);
