import { NextResponse, NextRequest } from 'next/server';
import Razorpay from 'razorpay';
import { connectToDatabase } from '@/lib/Database/mongoose';

export async function POST(req: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    console.log('Database connected successfully');

    const body = await req.json();
    console.log('Received body:', body);
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET as string,
    });

    const order = await razorpay.orders.create({
      amount: body.amount * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}