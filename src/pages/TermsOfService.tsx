import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-16 max-w-4xl">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <header className="border-b pb-8">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Terms and Conditions</h1>
            <p className="mt-4 text-muted-foreground">Last Updated: April 20, 2026</p>
          </header>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using UltimateJobAI, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              UltimateJobAI provides an AI-powered platform for resume optimization, job matching, and career coaching. We reserve the right to modify, suspend, or discontinue any part of the service at any time without prior notice.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">3. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed">
              To use certain features, you must create an account. You are responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Maintaining the confidentiality of your account credentials.</li>
              <li>All activities that occur under your account.</li>
              <li>Providing accurate and complete information.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">4. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The platform, including its software, AI models, design, and branding, is the property of UltimateJobAI. You are granted a limited, non-exclusive license to use the services for personal, non-commercial career development purposes.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">5. Prohibited Conduct</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Use the service for any illegal or unauthorized purpose.</li>
              <li>Attempt to reverse-engineer or extract the source code of our AI models.</li>
              <li>Engage in any activity that interferes with or disrupts the service.</li>
              <li>Upload malicious code or content that violates the rights of others.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">6. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              UltimateJobAI provides the service "as is" without any warranties. We are not liable for any direct, indirect, incidental, or consequential damages arising from your use of the platform or any employment outcomes resulting from our AI suggestions.
            </p>
          </section>

          <section className="space-y-4 border-t pt-8">
            <p className="text-sm text-muted-foreground italic">
              These terms are governed by the laws of the jurisdiction in which UltimateJobAI operates.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
