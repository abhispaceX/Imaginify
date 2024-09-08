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
  console.log('Entering createTransaction with:', transaction);
  try {
    await connectToDatabase();
    console.log('Database connected');

    const newTransaction = await Transaction.create({
      ...transaction,
      buyer: transaction.buyerId,
      status: "completed"
    });
    console.log('New transaction created:', newTransaction);

    console.log('Calling updateCredits with:', transaction.buyerId, transaction.credits);
    const updatedUser = await updateCredits(transaction.buyerId, transaction.credits);
    console.log('updateCredits result:', updatedUser);

    return JSON.parse(JSON.stringify(newTransaction));
  } catch (error) {
    console.error('Error in createTransaction:', error);
    handleError(error);
  }
}