const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  phone: String,
  email: String,
  type: { type: String, enum: ['restaurant', 'supermarket'], required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Business || mongoose.model('Business', businessSchema);
