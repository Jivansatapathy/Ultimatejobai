import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const ReturnPolicy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-16 max-w-4xl">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <header className="border-b pb-8">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Return and Refund Policy</h1>
            <p className="mt-4 text-muted-foreground">Effective Date: April 20, 2026</p>
          </header>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">1. Subscription Plans</h2>
            <p className="text-muted-foreground leading-relaxed">
              UltimateJobAI operates on a subscription-based model. By subscribing to our Professional, Accelerator, or Executive plans, you gain immediate access to premium AI features, including resume building, AI mentorship, and interview practice.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">2. Refund Eligibility</h2>
            <p className="text-muted-foreground leading-relaxed">
              We offer a 7-day refund window for first-time subscribers. To be eligible for a refund, you must meet the following criteria:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>The refund request is made within 7 days of the initial purchase.</li>
              <li>You have not downloaded more than one optimized resume.</li>
              <li>You have not used the AI Interview practice feature more than once.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">3. Non-Refundable Items</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Renewal payments: Subscription renewals are not eligible for refunds. You may cancel your subscription at any time to prevent future charges.</li>
              <li>Partially used billing cycles: We do not provide pro-rated refunds for the remaining time in a billing cycle after cancellation.</li>
              <li>Custom services: Any custom career consulting or one-on-one sessions are non-refundable once the session has occurred.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">4. Cancellation Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              You can cancel your subscription at any time through your Account Settings. Upon cancellation, you will continue to have access to premium features until the end of your current billing period.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">5. How to Request a Refund</h2>
            <p className="text-muted-foreground leading-relaxed">
              To request a refund, please email our support team at payments@ultimatejobai.com with your account details and the reason for your request. Refunds will be processed within 5-10 business days to your original payment method.
            </p>
          </section>

          <section className="space-y-4 border-t pt-8">
            <p className="text-sm text-muted-foreground italic">
              UltimateJobAI reserves the right to deny refund requests if we detect patterns of abuse or violation of our Terms and Conditions.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReturnPolicy;
