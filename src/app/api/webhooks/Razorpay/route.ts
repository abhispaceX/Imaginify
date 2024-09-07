import { NextRequest, NextResponse } from 'next/server';
import { createTransaction } from '@/lib/actions/razorpay.actions';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-razorpay-signature') as string;
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;

  const body = await req.text();

  try {
    Razorpay.validateWebhookSignature(body, signature, secret);

    const event = JSON.parse(body).event;

    if (event === 'payment.captured') {
      const { id, amount, notes } = JSON.parse(body).payload.payment.entity;

      const transaction = {
        razorpayId: id,
        amount: amount / 100, // Convert paise to rupees
        plan: notes.plan,
        credits: Number(notes.credits),
        buyerId: notes.buyerId,
        createdAt: new Date(),
      };

      const newTransaction = await createTransaction(transaction);

      return NextResponse.json({ message: 'OK', transaction: newTransaction }, { status: 200 });
    }

    return NextResponse.json({ message: 'Webhook handled' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }
}