// pages/api/razorpay-webhook.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { createTransaction } from '@/lib/actions/razorpay.actions';
import Razorpay from 'razorpay';

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  const signature = req.headers['x-razorpay-signature'] as string;
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;

  const body = JSON.stringify(req.body);

  try {
    Razorpay.validateWebhookSignature(body, signature, secret);

    const event = req.body.event;

    if (event === 'payment.captured') {
      const { id, amount, notes } = req.body.payload.payment.entity;

      const transaction = {
        razorpayId: id,
        amount: amount / 100, // Convert paise to rupees
        plan: notes.plan,
        credits: Number(notes.credits),
        buyerId: notes.buyerId,
        createdAt: new Date(),
      };

      const newTransaction = await createTransaction(transaction);

      return res.status(200).json({ message: 'OK', transaction: newTransaction });
    }

    res.status(200).send('Webhook handled');
  } catch (error) {
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }
}