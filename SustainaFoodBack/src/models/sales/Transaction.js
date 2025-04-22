const transactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    amount: Number,
    status: {
      type: String,
      enum: ['success', 'failed', 'pending'],
    },
    gateway: {
      type: String,
      enum: ['stripe', 'paypal', 'manual'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    }
  });
  
  module.exports = mongoose.model("Transaction", transactionSchema);
  