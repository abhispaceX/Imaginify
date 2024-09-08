// components/Shared/Checkout.tsx
"use client";

import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "../ui/button";
import { createRazorpayOrder, createTransaction } from "@/lib/actions/razorpay.actions";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout = ({
  plan,
  amount,
  credits,
  buyerId,
}: {
  plan: string;
  amount: number;
  credits: number;
  buyerId: string;
}) => {
  const { toast } = useToast();

  useEffect(() => {
    // ... (keep existing useEffect code)
  }, []);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const onCheckout = async () => {
    const res = await loadRazorpayScript();

    if (!res) {
      toast({
        title: "Failed to load Razorpay!",
        description: "Please check your internet connection and try again.",
        className: "error-toast",
      });
      return;
    }

    try {
      const transaction = {
        plan,
        amount,
        credits,
        buyerId,
        createdAt: new Date(),
      };

      // Use the existing createRazorpayOrder function
      const orderData = await createRazorpayOrder(transaction);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Imaginify",
        description: `Purchase ${credits} Credits`,
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            // Create transaction and update credits
            await createTransaction({
              ...transaction,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            } as CreateTransactionParams);

            toast({
              title: "Payment Successful!",
              description: "Your credits have been purchased successfully.",
              className: "success-toast",
            });
            window.location.href = "/profile";
          } catch (error) {
            console.error("Error creating transaction:", error);
            toast({
              title: "Error",
              description: "There was an error updating your credits. Please contact support.",
              className: "error-toast",
            });
          }
        },
        prefill: {
          name: "John Doe",
          email: "john.doe@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      toast({
        title: "Error",
        description: "There was an error creating your order. Please try again.",
        className: "error-toast",
      });
    }
  };

  return (
    <section>
      <Button
        onClick={onCheckout}
        role="link"
        className="w-full rounded-full bg-purple-gradient bg-cover"
      >
        Buy Credit
      </Button>
    </section>
  );
};

export default Checkout;