import React from "react";
import { Link } from "react-router-dom";
import { NavbarV2 as Navbar } from "@/components/landing2/NavbarV2";
import { FooterV2 } from "@/components/landing2/FooterV2";

const AcceptableUsePolicy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-16 max-w-4xl">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <header className="border-b pb-8">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Acceptable Use Policy</h1>
            <p className="mt-4 text-muted-foreground">Version: 1.0</p>
            <p className="text-muted-foreground">Effective Date: July 15, 2026</p>
            <p className="text-muted-foreground">Last Updated: July 15, 2026</p>
          </header>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">1. Purpose</h2>
            <p className="text-muted-foreground leading-relaxed">
              This Acceptable Use Policy ("Policy") establishes the rules governing the use of the Hizorex platform ("Platform"), including our website, mobile applications, APIs, AI-powered services, recruitment tools, and related products.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The purpose of this Policy is to protect candidates, employers, recruiters, business customers, partners, and Hizorex while maintaining a secure, professional, and trustworthy recruitment environment.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              By using Hizorex, you agree to comply with this Policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">2. Who This Policy Applies To</h2>
            <p className="text-muted-foreground leading-relaxed">This Policy applies to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Candidates</li>
              <li>Employers</li>
              <li>Recruiters</li>
              <li>Hiring Managers</li>
              <li>Business Customers</li>
              <li>Agencies</li>
              <li>Platform Visitors</li>
              <li>API Users</li>
              <li>Integration Partners</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">3. Permitted Use</h2>
            <p className="text-muted-foreground leading-relaxed">
              You may use Hizorex only for lawful employment, recruitment, career development, and business purposes, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Creating professional candidate profiles</li>
              <li>Searching and applying for jobs</li>
              <li>Posting legitimate employment opportunities</li>
              <li>Using AI-assisted resume and cover letter tools</li>
              <li>Communicating through approved platform features</li>
              <li>Managing recruitment workflows</li>
              <li>Accessing authorized analytics and reporting</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">4. Prohibited Activities</h2>
            <p className="text-muted-foreground leading-relaxed">
              Users must <strong className="text-foreground">not</strong> engage in any activity that is unlawful, harmful, deceptive, or interferes with the operation of the Platform. Examples include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Providing false or misleading information.</li>
              <li>Creating fake candidate or employer accounts.</li>
              <li>Impersonating another person or organization.</li>
              <li>Misrepresenting qualifications, experience, certifications, or employment history.</li>
              <li>Using another person's identity or credentials.</li>
              <li>Circumventing platform security or authentication mechanisms.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">5. Fraudulent Recruitment Activities</h2>
            <p className="text-muted-foreground leading-relaxed">The following activities are strictly prohibited:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Posting fake jobs.</li>
              <li>Posting jobs without authorization.</li>
              <li>Collecting candidate information for purposes unrelated to recruitment.</li>
              <li>Conducting fraudulent interviews.</li>
              <li>Requesting payments from candidates.</li>
              <li>Offering employment scams.</li>
              <li>Misusing candidate contact information.</li>
              <li>Misrepresenting compensation or benefits.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Hizorex reserves the right to immediately suspend accounts involved in fraudulent recruitment activities.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">6. AI Usage</h2>
            <p className="text-muted-foreground leading-relaxed">
              Hizorex provides AI-assisted services to support users. You agree that you will <strong className="text-foreground">not</strong>:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Submit unlawful content to AI services.</li>
              <li>Generate fraudulent resumes.</li>
              <li>Generate fake employment histories.</li>
              <li>Generate false references.</li>
              <li>Create misleading certifications.</li>
              <li>Use AI to impersonate another individual.</li>
              <li>Attempt to manipulate AI-generated candidate rankings.</li>
              <li>Reverse engineer or exploit AI systems.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Users remain responsible for reviewing all AI-generated content before submitting it to employers.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">7. Candidate Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed">Candidates agree to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Maintain accurate profiles.</li>
              <li>Upload only information they have the right to share.</li>
              <li>Respect employer confidentiality.</li>
              <li>Keep account credentials secure.</li>
              <li>Update resumes when information changes.</li>
              <li>Apply only for genuine employment opportunities.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">Candidates may not:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Apply using fake identities.</li>
              <li>Submit plagiarized resumes.</li>
              <li>Upload malicious files.</li>
              <li>Spam employers.</li>
              <li>Abuse messaging features.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">8. Employer Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed">Employers agree to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Post legitimate job opportunities.</li>
              <li>Provide accurate job descriptions.</li>
              <li>Comply with employment laws.</li>
              <li>Respect candidate privacy.</li>
              <li>Use candidate information solely for recruitment purposes.</li>
              <li>Maintain confidentiality of candidate data.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">Employers may not:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Sell candidate information.</li>
              <li>Contact candidates for unrelated marketing.</li>
              <li>Discriminate unlawfully.</li>
              <li>Harvest resumes for non-recruitment purposes.</li>
              <li>Share candidate information without authorization.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">9. Recruiter Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed">Recruiters must:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Represent clients accurately.</li>
              <li>Respect confidentiality agreements.</li>
              <li>Obtain authorization before posting positions.</li>
              <li>Maintain professional conduct.</li>
              <li>Protect candidate information.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">10. Platform Security</h2>
            <p className="text-muted-foreground leading-relaxed">Users must not:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Attempt unauthorized access.</li>
              <li>Circumvent authentication controls.</li>
              <li>Exploit software vulnerabilities.</li>
              <li>Upload malware, ransomware, spyware, or viruses.</li>
              <li>Conduct denial-of-service attacks.</li>
              <li>Interfere with platform availability.</li>
              <li>Test security without written authorization.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">11. Automated Access</h2>
            <p className="text-muted-foreground leading-relaxed">Unless expressly authorized by Hizorex, users may not:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Scrape platform data.</li>
              <li>Use bots to collect candidate information.</li>
              <li>Crawl the Platform.</li>
              <li>Copy job listings at scale.</li>
              <li>Download resumes in bulk.</li>
              <li>Use automated account creation tools.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Authorized API usage must comply with applicable API documentation and agreements.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">12. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">Users may not:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Copy Hizorex software.</li>
              <li>Copy AI models.</li>
              <li>Copy proprietary algorithms.</li>
              <li>Use Hizorex branding without permission.</li>
              <li>Remove copyright notices.</li>
              <li>Reproduce platform content without authorization.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">13. User Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              Users are responsible for all content they submit. You must not upload:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Copyright-infringing material.</li>
              <li>Confidential information you are not authorized to disclose.</li>
              <li>Offensive or abusive content.</li>
              <li>Malware or malicious code.</li>
              <li>Illegal material.</li>
              <li>Content promoting discrimination or hate.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">14. Communications</h2>
            <p className="text-muted-foreground leading-relaxed">Users agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Send spam.</li>
              <li>Send phishing messages.</li>
              <li>Harass other users.</li>
              <li>Send abusive communications.</li>
              <li>Conduct unsolicited marketing through the Platform.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">Professional communication is expected at all times.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">15. Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Users must respect the privacy rights of others.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Candidate data may only be used for legitimate recruitment purposes.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Unauthorized collection, disclosure, sale, or misuse of personal information is prohibited.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">16. Monitoring and Enforcement</h2>
            <p className="text-muted-foreground leading-relaxed">Hizorex may monitor Platform activity to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Maintain security.</li>
              <li>Prevent fraud.</li>
              <li>Detect abuse.</li>
              <li>Investigate complaints.</li>
              <li>Comply with legal obligations.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Monitoring is conducted in accordance with applicable privacy laws.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">17. Violations</h2>
            <p className="text-muted-foreground leading-relaxed">Violations of this Policy may result in:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Warning notices.</li>
              <li>Temporary suspension.</li>
              <li>Permanent account termination.</li>
              <li>Removal of content.</li>
              <li>Restriction of AI features.</li>
              <li>Reporting to law enforcement where required.</li>
              <li>Civil or legal action.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              The severity of enforcement will depend on the nature and seriousness of the violation.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">18. Reporting Violations</h2>
            <p className="text-muted-foreground leading-relaxed">
              Users may report suspected violations, fraudulent activity, or security concerns by contacting:
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Trust &amp; Safety Team<br />
              Hizorex<br />
              Email: <a href="mailto:hello@hizorex.com" className="text-accent hover:underline">hello@hizorex.com</a>
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Reports will be reviewed promptly and handled confidentially where appropriate.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">19. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Hizorex may update this Policy periodically.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Material changes will be communicated through the Platform or by other appropriate means. Continued use of the Platform after changes become effective constitutes acceptance of the revised Policy.
            </p>
          </section>

          <section className="space-y-4 border-t pt-8">
            <h2 className="text-2xl font-semibold text-foreground">20. Related Policies</h2>
            <p className="text-muted-foreground leading-relaxed">This Acceptable Use Policy should be read together with the following documents:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><Link to="/terms" className="text-accent hover:underline">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-accent hover:underline">Privacy Policy</Link></li>
              <li><Link to="/cookie-policy" className="text-accent hover:underline">Cookie Policy</Link></li>
              <li>AI Transparency Statement</li>
              <li>Responsible AI Policy</li>
              <li>Candidate Agreement</li>
              <li>Employer Agreement</li>
              <li>Community Guidelines</li>
              <li>Security Overview</li>
            </ul>
          </section>
        </div>
      </main>
      <FooterV2 />
    </div>
  );
};

export default AcceptableUsePolicy;
