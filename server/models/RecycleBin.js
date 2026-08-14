import mongoose from 'mongoose';

const recycleBinSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, required: true }, // 'Vehicle' | 'Lead' | 'Customer' | 'Booking'
  originalId: { type: String, required: true },
  name: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  deletedOn: { type: String, default: () => new Date().toLocaleString('en-IN') }
});

export default mongoose.model('RecycleBin', recycleBinSchema);
