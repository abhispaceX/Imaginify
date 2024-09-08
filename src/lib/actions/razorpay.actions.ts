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



export const createRazorpayOrder = async (transaction: CreateTransactionParams) => {
  try {
    const response = await fetch('/api/razorpay-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transaction),
    });

    if (!response.ok) {
      throw new Error('Failed to create Razorpay order');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

// Create Transaction function
export async function createTransaction(transaction: CreateTransactionParams) {
  try {
    await connectToDatabase();

    // Create a new transaction with buyerId
    const newTransaction = await Transaction.create({
      ...transaction, buyer: transaction.buyerId,
      status: "completed"
    });

    await updateCredits(transaction.buyerId, transaction.credits);

    return JSON.parse(JSON.stringify(newTransaction));
  } catch (error) {
    handleError(error);
  }
}