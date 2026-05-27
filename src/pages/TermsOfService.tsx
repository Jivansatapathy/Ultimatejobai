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
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Terms &amp; Conditions</h1>
            <p className="mt-4 text-muted-foreground">Last Updated: April 20, 2026</p>
          </header>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using Hozorex, you agree to comply with these Terms &amp; Conditions. If you do not agree, you must discontinue use of the platform immediately.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">2. Eligibility</h2>
            <p className="text-muted-foreground leading-relaxed">You must:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Be at least 18 years old</li>
              <li>Provide accurate information</li>
              <li>Use the platform lawfully</li>
              <li>Maintain account confidentiality</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">3. Account Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed">Users are responsible for:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Protecting login credentials</li>
              <li>Maintaining accurate profile information</li>
              <li>All activities under their account</li>
              <li>Ensuring uploaded content is lawful and authentic</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">4. Subscription &amp; Billing</h2>
            <p className="text-muted-foreground leading-relaxed">Certain features require paid subscriptions.</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Prices may change without prior notice</li>
              <li>Subscription fees are billed periodically</li>
              <li>Failure of payment may suspend premium access</li>
              <li>Refunds are subject to platform refund policies</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">5. Permitted Use</h2>
            <p className="text-muted-foreground leading-relaxed">Users may use the platform to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Build resumes</li>
              <li>Practice interviews</li>
              <li>Search and apply for jobs</li>
              <li>Receive AI-generated career insights</li>
              <li>Use automated application tools</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">6. Restricted Activities</h2>
            <p className="text-muted-foreground leading-relaxed">Users may not:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Create fake profiles</li>
              <li>Share accounts with others</li>
              <li>Reverse engineer platform systems</li>
              <li>Use bots or scraping tools</li>
              <li>Spread spam or malicious content</li>
              <li>Attempt to bypass security systems</li>
              <li>Upload copyrighted content without permission</li>
              <li>Use the platform for illegal recruitment or scams</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">7. AI Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed">AI-generated content may contain inaccuracies. Hozorex:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Does not guarantee employment</li>
              <li>Does not guarantee interview success</li>
              <li>Is not responsible for employer decisions</li>
              <li>Recommends users review all AI-generated content before use</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">8. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              All platform materials including logos, branding, software, UI/UX, AI systems, and website content remain the property of Hozorex.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">9. User Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              Users retain ownership of uploaded resumes and documents but grant Hozorex permission to process and display such content for service functionality.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">10. Job Applications</h2>
            <p className="text-muted-foreground leading-relaxed">Users are fully responsible for:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Accuracy of applications</li>
              <li>Information submitted to employers</li>
              <li>Communications with recruiters</li>
              <li>Uploaded resume content</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">11. Employer Conduct</h2>
            <p className="text-muted-foreground leading-relaxed">Employers using the platform must:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Post genuine opportunities</li>
              <li>Avoid discrimination</li>
              <li>Protect candidate information</li>
              <li>Follow employment laws</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">12. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">Hozorex shall not be liable for:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Loss of employment opportunities</li>
              <li>Platform downtime</li>
              <li>AI inaccuracies</li>
              <li>Third-party service failures</li>
              <li>Unauthorized account access</li>
              <li>Financial losses arising from platform use</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">13. Suspension &amp; Termination</h2>
            <p className="text-muted-foreground leading-relaxed">We reserve the right to suspend or terminate accounts that:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Violate platform rules</li>
              <li>Abuse services</li>
              <li>Engage in fraud or suspicious activity</li>
              <li>Harm platform security or reputation</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">14. Third-Party Links</h2>
            <p className="text-muted-foreground leading-relaxed">
              External websites linked through the platform operate independently and Hozorex is not responsible for their content or practices.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">15. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              Users agree to indemnify and hold Hozorex harmless from claims, damages, losses, or legal disputes arising from misuse of the platform.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">16. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by the laws of India. Any disputes shall fall under the jurisdiction of Indian courts.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">17. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may modify these Terms at any time. Continued use of the platform after updates constitutes acceptance of revised Terms.
            </p>
          </section>

          <section className="space-y-4 border-t pt-8">
            <h2 className="text-2xl font-semibold text-foreground">18. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              Hozorex<br />
              Email: <a href="mailto:contact@hozorex.com" className="text-accent hover:underline">contact@hozorex.com</a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
