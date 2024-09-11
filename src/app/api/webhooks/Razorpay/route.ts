import { NextRequest, NextResponse } from 'next/server';
import { createTransaction } from '@/lib/actions/razorpay.actions';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  console.log('Webhook received');
  const signature = req.headers.get('x-razorpay-signature') as string;
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;

  const body = await req.text();
  console.log('Webhook body:', body);

  try {
    Razorpay.validateWebhookSignature(body, signature, secret);
    console.log('Webhook signature validated');

    const event = JSON.parse(body).event;
    console.log('Webhook event:', event);

    if (event === 'payment.captured') {
      const { id, amount, notes } = JSON.parse(body).payload.payment.entity;
      console.log('Payment captured:', { id, amount, notes });
      const credits = Number(notes.credits);
      if (isNaN(credits)) {
        throw new Error('Invalid credits value');
      }

      const transaction = {
        transactionId: id,  // Ensure transactionId is set
        paymentProvider: 'razorpay' as const,
        amount: amount / 100, // Convert paise to rupees
        plan: notes.plan,
        credits: credits,
        buyer: notes.buyerId,
        createdAt: new Date(),
      };
      console.log('Transaction object created:', transaction);

      const newTransaction = await createTransaction(transaction);
      console.log('Transaction created:', newTransaction);

      return NextResponse.json({ message: 'OK', transaction: newTransaction }, { status: 200 });
    }

    return NextResponse.json({ message: 'Webhook handled' }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }
}