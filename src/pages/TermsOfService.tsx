import React from "react";
import { Link } from "react-router-dom";
import { NavbarV2 as Navbar } from "@/components/landing2/NavbarV2";
import { FooterV2 } from "@/components/landing2/FooterV2";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-16 max-w-4xl">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <header className="border-b pb-8">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Terms of Service</h1>
            <p className="mt-4 text-muted-foreground">Version: 1.0</p>
            <p className="text-muted-foreground">Effective Date: July 15, 2026</p>
            <p className="text-muted-foreground">Last Updated: July 15, 2026</p>
          </header>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to Hizorex ("Hizorex", "we", "our", or "us").
            </p>
            <p className="text-muted-foreground leading-relaxed">
              These Terms of Service ("Terms") govern your access to and use of the Hizorex website, mobile applications, APIs, AI-powered career services, recruitment platform, and related services (collectively, the "Platform").
            </p>
            <p className="text-muted-foreground leading-relaxed">
              By creating an account, accessing, or using the Platform, you agree to be bound by these Terms. If you do not agree, you must not use the Platform.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">2. Eligibility</h2>
            <p className="text-muted-foreground leading-relaxed">To use Hizorex, you must:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Be at least the age of majority in your jurisdiction.</li>
              <li>Have the legal capacity to enter into a binding agreement.</li>
              <li>Provide accurate and truthful registration information.</li>
              <li>Not be prohibited by law from using our services.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">3. Hizorex Services</h2>
            <p className="text-muted-foreground leading-relaxed">Hizorex provides AI-assisted recruitment and career services, including:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Executive and professional job search</li>
              <li>AI resume creation and optimization</li>
              <li>AI cover letter generation</li>
              <li>AI job matching</li>
              <li>Executive profile management</li>
              <li>Employer job posting</li>
              <li>Candidate sourcing</li>
              <li>Recruitment workflow management</li>
              <li>Career insights and recommendations</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              We may modify, improve, suspend, or discontinue features at our discretion.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">4. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed">You are responsible for:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Maintaining the confidentiality of your login credentials.</li>
              <li>All activity occurring under your account.</li>
              <li>Promptly notifying Hizorex of any unauthorized access.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Share your account credentials.</li>
              <li>Impersonate another individual or organization.</li>
              <li>Create multiple accounts to circumvent platform rules.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">5. Candidate Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed">Candidates agree to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Provide accurate information.</li>
              <li>Maintain current resumes and profiles.</li>
              <li>Submit truthful employment histories.</li>
              <li>Review AI-generated content before using it.</li>
              <li>Use the Platform lawfully.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Candidates remain solely responsible for the accuracy of resumes, cover letters, and application materials, including content generated with AI assistance.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">6. Employer Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed">Employers agree to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Post legitimate employment opportunities.</li>
              <li>Comply with applicable employment and anti-discrimination laws.</li>
              <li>Use candidate information only for recruitment purposes.</li>
              <li>Protect candidate confidentiality.</li>
              <li>Not misuse candidate data or engage in unauthorized solicitation.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">7. AI Services</h2>
            <p className="text-muted-foreground leading-relaxed">Hizorex uses Artificial Intelligence to assist with:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Resume generation</li>
              <li>Resume enhancement</li>
              <li>Cover letter creation</li>
              <li>Candidate recommendations</li>
              <li>Job recommendations</li>
              <li>Career insights</li>
              <li>Candidate matching</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              AI-generated content is provided as an assistive tool and may contain inaccuracies. Users are responsible for reviewing and validating AI-generated outputs before relying on them.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              AI recommendations do not constitute hiring decisions, employment guarantees, legal advice, or professional career advice.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">8. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Submit false or misleading information.</li>
              <li>Create fraudulent accounts.</li>
              <li>Upload malicious software or harmful code.</li>
              <li>Attempt unauthorized access to the Platform.</li>
              <li>Scrape or harvest data without authorization.</li>
              <li>Infringe intellectual property rights.</li>
              <li>Harass, threaten, or abuse other users.</li>
              <li>Use the Platform for unlawful purposes.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Violation of these Terms may result in suspension or termination of your account. See our{" "}
              <Link to="/acceptable-use-policy" className="text-accent hover:underline">Acceptable Use Policy</Link> for further detail.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">9. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">Hizorex and its licensors retain ownership of:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Software</li>
              <li>Platform design</li>
              <li>Branding</li>
              <li>Logos</li>
              <li>Documentation</li>
              <li>AI models developed by Hizorex</li>
              <li>Original website content</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Users retain ownership of the content they upload, subject to the licenses granted in these Terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">10. User Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              By uploading resumes, job postings, or other content, you grant Hizorex a limited, non-exclusive license to host, process, display, and use such content solely for providing and improving the Platform.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              You represent that you have the necessary rights to submit the content.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">11. Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your use of the Platform is subject to the Hizorex{" "}
              <Link to="/privacy" className="text-accent hover:underline">Privacy Policy</Link>.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The Privacy Policy explains how personal information is collected, used, shared, retained, and protected.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">12. Fees and Payments</h2>
            <p className="text-muted-foreground leading-relaxed">Certain services may require payment. Where applicable:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Prices will be displayed before purchase.</li>
              <li>Taxes may apply.</li>
              <li>Subscription terms will be disclosed.</li>
              <li>
                Billing is governed by the Subscription &amp; Billing Policy and{" "}
                <Link to="/return-policy" className="text-accent hover:underline">Refund &amp; Cancellation Policy</Link>.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">13. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Platform may integrate with third-party services, including cloud providers, payment processors, AI providers, and professional networking platforms.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Hizorex is not responsible for the content, availability, or practices of third-party services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">14. Availability</h2>
            <p className="text-muted-foreground leading-relaxed">
              While we strive for high availability, we do not guarantee uninterrupted access to the Platform.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Maintenance, updates, technical issues, or events beyond our control may affect service availability.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">15. Account Suspension and Termination</h2>
            <p className="text-muted-foreground leading-relaxed">Hizorex may suspend or terminate accounts that:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Violate these Terms.</li>
              <li>Engage in fraudulent or unlawful activity.</li>
              <li>Threaten the security or integrity of the Platform.</li>
              <li>Misuse AI services.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Users may close their accounts at any time through the account settings or by contacting support.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">16. Disclaimers</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Platform is provided on an "as is" and "as available" basis.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              To the maximum extent permitted by law, Hizorex disclaims warranties relating to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Continuous availability</li>
              <li>Accuracy of AI-generated content</li>
              <li>Employment outcomes</li>
              <li>Job availability</li>
              <li>Candidate suitability</li>
              <li>Employer hiring decisions</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Nothing in these Terms limits any rights that cannot be excluded under applicable law.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">17. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the fullest extent permitted by applicable law, Hizorex will not be liable for indirect, incidental, consequential, special, or punitive damages arising from or relating to the use of the Platform.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Where liability cannot be excluded, it will be limited to the maximum extent permitted by law.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">18. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify and hold harmless Hizorex, its affiliates, officers, directors, employees, and contractors from claims, damages, liabilities, and expenses arising from:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Your use of the Platform.</li>
              <li>Your violation of these Terms.</li>
              <li>Your infringement of third-party rights.</li>
              <li>Content you submit.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">19. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms are governed by the laws applicable in the jurisdiction identified in your customer agreement or, if none is specified, the jurisdiction where Hizorex is established, without regard to conflict of law principles.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">20. Changes to These Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              Hizorex may revise these Terms from time to time.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Material changes will be communicated through the Platform or other appropriate channels. Continued use of the Platform after updated Terms become effective constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section className="space-y-4 border-t pt-8">
            <h2 className="text-2xl font-semibold text-foreground">21. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions regarding these Terms, please contact:
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Legal Department<br />
              Hizorex<br />
              Email: <a href="mailto:hello@hizorex.com" className="text-accent hover:underline">hello@hizorex.com</a>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">22. Related Policies</h2>
            <p className="text-muted-foreground leading-relaxed">These Terms should be read together with the following documents:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><Link to="/privacy" className="text-accent hover:underline">Privacy Policy</Link></li>
              <li><Link to="/cookie-policy" className="text-accent hover:underline">Cookie Policy</Link></li>
              <li><Link to="/acceptable-use-policy" className="text-accent hover:underline">Acceptable Use Policy</Link></li>
              <li>AI Transparency Statement</li>
              <li>Responsible AI Policy</li>
              <li>Candidate Agreement</li>
              <li>Employer Agreement</li>
              <li>Data Retention Policy</li>
              <li>Data Deletion Policy</li>
              <li>Subscription &amp; Billing Policy</li>
              <li><Link to="/return-policy" className="text-accent hover:underline">Refund &amp; Cancellation Policy</Link></li>
              <li>Accessibility Statement</li>
              <li>Security Overview</li>
            </ul>
          </section>
        </div>
      </main>
      <FooterV2 />
    </div>
  );
};

export default TermsOfService;
