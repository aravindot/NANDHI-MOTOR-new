import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  color: { type: String, required: true },
  hsnCode: { type: String, required: true },
  image: { type: String }, // base64 representation
  createdOn: { type: String, default: () => new Date().toLocaleDateString('en-IN') }
});

export default mongoose.model('Vehicle', vehicleSchema);
