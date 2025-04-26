const mongoose = require('mongoose');

const paymentIntentSchema = new mongoose.Schema({
  stripePaymentId: {
    type: String,
    required: true,
    unique: true
  },
  clientSecret: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['created', 'processing', 'succeeded', 'cancelled', 'failed'],
    default: 'created'
  },
  orderIdentifier: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '24h' // Automatically remove after 24 hours
  }
});

module.exports = mongoose.model('PaymentIntent', paymentIntentSchema);