import React from "react";
import { NavbarV2 as Navbar } from "@/components/landing2/NavbarV2";
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
              Hizorex is an AI-powered career and recruitment platform that helps users build resumes, prepare for interviews, discover jobs, manage applications, and improve career growth using artificial intelligence tools. By using the platform, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">2. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">We may collect the following information:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Full name, email address, phone number, profile photo</li>
              <li>Resume/CV details, skills, education, certifications, and employment history</li>
              <li>Login credentials and account activity</li>
              <li>Interview recordings, AI-generated transcripts, feedback, and performance reports</li>
              <li>Browser information, IP address, device information, cookies, and analytics data</li>
              <li>Payment and billing details through third-party providers</li>
              <li>Job preferences, saved jobs, applications, and recruiter interactions</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">3. How We Use Your Data</h2>
            <p className="text-muted-foreground leading-relaxed">Your information may be used to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Create and manage your account</li>
              <li>Generate AI-powered interview questions and resume suggestions</li>
              <li>Improve job recommendations and career insights</li>
              <li>Process subscriptions and payments</li>
              <li>Provide customer support and technical assistance</li>
              <li>Improve platform performance and security</li>
              <li>Detect suspicious, abusive, or fraudulent activities</li>
              <li>Send updates, notifications, newsletters, and promotional messages</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">4. AI &amp; Automated Processing</h2>
            <p className="text-muted-foreground leading-relaxed">
              Hizorex uses AI systems to analyze resumes, generate interview simulations, create recommendations, and provide automated feedback. AI-generated outputs are intended for guidance purposes only and may not always be fully accurate.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">5. Audio, Camera &amp; Microphone Access</h2>
            <p className="text-muted-foreground leading-relaxed">Some interview features may require microphone and camera access.</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Audio may be processed temporarily for transcription purposes</li>
              <li>Camera access may be used for interview monitoring or face detection</li>
              <li>We do not sell biometric or facial recognition data</li>
              <li>Users may disable permissions through browser settings</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">6. Cookies &amp; Tracking Technologies</h2>
            <p className="text-muted-foreground leading-relaxed">We use cookies, local storage, and analytics tools to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Maintain secure login sessions</li>
              <li>Remember user preferences</li>
              <li>Improve performance and user experience</li>
              <li>Monitor traffic and feature usage</li>
              <li>Prevent unauthorized access</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">7. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">We may integrate with:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Payment gateways</li>
              <li>Cloud hosting providers</li>
              <li>AI service providers</li>
              <li>Analytics platforms</li>
              <li>Recruitment and job listing partners</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">Third-party services operate under their own privacy policies.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">8. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">We retain user data only as long as necessary for:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Legal obligations</li>
              <li>Service improvement</li>
              <li>Security and fraud prevention</li>
              <li>Business operations</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">Users may request account deletion at any time.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">9. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">We implement multiple security practices including:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>SSL/TLS encryption</li>
              <li>Password hashing</li>
              <li>Secure cloud infrastructure</li>
              <li>Restricted database access</li>
              <li>Regular monitoring and security updates</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">However, no online service can guarantee complete security.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">10. User Rights</h2>
            <p className="text-muted-foreground leading-relaxed">Users may:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Access personal information</li>
              <li>Correct inaccurate information</li>
              <li>Delete their account and data</li>
              <li>Export certain information</li>
              <li>Withdraw consent for marketing communications</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">11. Prohibited Activities</h2>
            <p className="text-muted-foreground leading-relaxed">Users must not:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Use fake identities or false resumes</li>
              <li>Upload malware, harmful code, or illegal content</li>
              <li>Attempt unauthorized access to systems</li>
              <li>Abuse interview systems or AI tools</li>
              <li>Scrape or copy platform content</li>
              <li>Harass or threaten other users</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">12. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Hizorex is intended only for users aged 18 years or older. We do not knowingly collect information from minors.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">13. International Users</h2>
            <p className="text-muted-foreground leading-relaxed">
              Users accessing the platform from outside India are responsible for complying with local laws related to data protection and internet usage.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">14. Policy Updates</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify this Privacy Policy at any time. Updated versions will be published on the platform with revised effective dates.
            </p>
          </section>

          <section className="space-y-4 border-t pt-8">
            <h2 className="text-2xl font-semibold text-foreground">15. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              Hizorex<br />
              Email: <a href="mailto:privacy@Hizorex.com" className="text-accent hover:underline">privacy@Hizorex.com</a><br />
              Support: <a href="mailto:support@Hizorex.com" className="text-accent hover:underline">support@Hizorex.com</a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
