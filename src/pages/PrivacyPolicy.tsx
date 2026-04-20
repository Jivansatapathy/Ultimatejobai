import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-16 max-w-4xl">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <header className="border-b pb-8">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Privacy Policy</h1>
            <p className="mt-4 text-muted-foreground">Effective Date: April 20, 2026</p>
          </header>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              At UltimateJobAI, we value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our AI-driven career services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">2. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect information that you provide directly to us, such as when you create an account, upload your resume, or communicate with our AI mentor. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Personal identifiers (name, email address, contact information).</li>
              <li>Professional information (resume content, work history, skills, education).</li>
              <li>Account credentials and preference settings.</li>
              <li>Payment information (processed securely through our payment partners).</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your data allows us to provide a personalized experience and improve our services:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>To generate ATS-optimized resumes and provide career insights.</li>
              <li>To match you with relevant job opportunities.</li>
              <li>To facilitate interactions with our AI Mentor and Salary Negotiator.</li>
              <li>To process transactions and manage your subscription.</li>
              <li>To communicate system updates and promotional offers (which you can opt out of at any time).</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">4. Data Sharing and Disclosure</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell your personal information. We may share data in limited circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>With service providers who assist in our operations (e.g., hosting, analytics, payment processing).</li>
              <li>To comply with legal obligations or respond to valid legal requests.</li>
              <li>If necessary to protect the rights, property, or safety of UltimateJobAI or our users.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">5. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard security measures to protect your information from unauthorized access, alteration, or destruction. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">6. Your Privacy Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              Depending on your location, you may have rights to access, correct, or delete your personal data. You can manage most of your data through your account settings or by contacting our support team.
            </p>
          </section>

          <section className="space-y-4 border-t pt-8">
            <p className="text-sm text-muted-foreground italic">
              If you have any questions about this Privacy Policy, please contact us at support@ultimatejobai.com.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
