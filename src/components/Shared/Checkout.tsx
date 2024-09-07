// components/Shared/Checkout.tsx
"use client";

import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "../ui/button";
import { checkoutCredits } from "@/lib/actions/razorpay.actions";

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
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      toast({
        title: "Order placed!",
        description: "You will receive an email confirmation",
        duration: 5000,
        className: "success-toast",
      });
    }

    if (query.get("canceled")) {
      toast({
        title: "Order canceled!",
        description: "Continue to shop around and checkout when you're ready",
        duration: 5000,
        className: "error-toast",
      });
    }
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
    const transaction = {
      plan,
      amount,
      credits,
      buyerId,
    };
    await checkoutCredits(transaction);

    if (!res) {
      toast({
        title: "Failed to load Razorpay!",
        description: "Please check your internet connection and try again.",
        className: "error-toast",
      });
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount: amount * 100, // Amount in paise
      currency: "INR",
      name: "Imaginify",
      description: `Purchase ${credits} Credits`,
      handler: function (response: any) {
        toast({
          title: "Payment Successful!",
          description: "Your credits have been purchased successfully.",
          className: "success-toast",
        });
        window.location.href = "/profile";
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