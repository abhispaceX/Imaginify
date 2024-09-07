// actions/razorpay.actions.ts

import { redirect } from 'next/navigation';
import Razorpay from 'razorpay';
import { handleError } from '../utils';
import { connectToDatabase } from '../Database/mongoose';
import Transaction from '../Database/models/transaction.model';
import { updateCredits } from './user.actions';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function checkoutCredits(transaction: CheckoutTransactionParams) {
  const amount = Number(transaction.amount) * 100; // Convert to the smallest currency unit

  try {
    const options = {
      amount: amount, // Amount in paise
      currency: 'INR',
      receipt: `receipt_${transaction.buyerId}_${Date.now()}`,
      payment_capture: 1, // Automatically capture the payment
      notes: {
        plan: transaction.plan,
        credits: transaction.credits.toString(),
        buyerId: transaction.buyerId,
      },
    };

    const order = await razorpay.orders.create(options);
   

    // Redirect to Razorpay checkout page
    redirect(`/razorpay-checkout?order_id=${order.id}`);
  } catch (error) {
    handleError(error);
  }
}

// Create Transaction function
export async function createTransaction(transaction: CreateTransactionParams) {
  try {
    await connectToDatabase();

    // Create a new transaction with buyerId
    const newTransaction = await Transaction.create({
      ...transaction, buyer: transaction.buyerId
    });

    await updateCredits(transaction.buyerId, transaction.credits);

    return JSON.parse(JSON.stringify(newTransaction));
  } catch (error) {
    handleError(error);
  }
}