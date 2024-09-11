import { Schema, model, models } from "mongoose";

const TransactionSchema = new Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  transactionId: {
    type: String,
    unique: true,
  },
  paymentProvider: {
    type: String,
    enum: ['razorpay'],  // Removed 'stripe'
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  plan: {
    type: String,
  },
  credits: {
    type: Number,
    required: true,
    validate: {
      validator: Number.isFinite,
      message: '{VALUE} is not a valid number for credits'
    }
  },
  buyer: {
    type: String,
    ref: "User",
  },
});

const Transaction = models?.Transaction || model("Transaction", TransactionSchema);

export default Transaction;