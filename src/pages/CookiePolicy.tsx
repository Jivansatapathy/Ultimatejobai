import React from "react";
import { Link } from "react-router-dom";
import { NavbarV2 as Navbar } from "@/components/landing2/NavbarV2";
import { FooterV2 } from "@/components/landing2/FooterV2";

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-16 max-w-4xl">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <header className="border-b pb-8">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Cookie Policy</h1>
            <p className="mt-4 text-muted-foreground">Version: 1.0</p>
            <p className="text-muted-foreground">Effective Date: July 15, 2026</p>
            <p className="text-muted-foreground">Last Updated: July 15, 2026</p>
          </header>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              This Cookie Policy explains how Hizorex ("Hizorex", "we", "our", or "us") uses cookies and similar technologies when you visit our website, mobile applications, and related services (collectively, the "Platform").
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This Cookie Policy should be read together with our{" "}
              <Link to="/privacy" className="text-accent hover:underline">Privacy Policy</Link>.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">2. What Are Cookies?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cookies are small text files placed on your computer, smartphone, or other device when you visit a website.
            </p>
            <p className="text-muted-foreground leading-relaxed">Cookies help websites:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Remember your preferences</li>
              <li>Keep you signed in</li>
              <li>Improve performance</li>
              <li>Understand website usage</li>
              <li>Enhance security</li>
              <li>Personalize your experience</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Cookies may be temporary (Session Cookies) or remain on your device for a defined period (Persistent Cookies).
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">3. Types of Cookies We Use</h2>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">A. Essential Cookies</h3>
              <p className="text-muted-foreground leading-relaxed">These cookies are necessary for the Platform to function properly. Examples include:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>User authentication</li>
                <li>Login sessions</li>
                <li>Security verification</li>
                <li>Fraud prevention</li>
                <li>Load balancing</li>
                <li>Account management</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">These cookies cannot be disabled because the Platform relies on them.</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">B. Functional Cookies</h3>
              <p className="text-muted-foreground leading-relaxed">These cookies remember your preferences. Examples include:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Preferred language</li>
                <li>Theme (light/dark mode)</li>
                <li>Dashboard preferences</li>
                <li>Saved searches</li>
                <li>Recently viewed jobs</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">C. Analytics Cookies</h3>
              <p className="text-muted-foreground leading-relaxed">These cookies help us understand how users interact with the Platform. Examples include:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Most visited pages</li>
                <li>Time spent on pages</li>
                <li>Device information</li>
                <li>Navigation paths</li>
                <li>Feature usage</li>
                <li>Error reporting</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">We use this information to improve our services.</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">D. Performance Cookies</h3>
              <p className="text-muted-foreground leading-relaxed">Performance cookies help us monitor:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Website speed</li>
                <li>Server performance</li>
                <li>API response times</li>
                <li>Platform reliability</li>
                <li>Application stability</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">E. Security Cookies</h3>
              <p className="text-muted-foreground leading-relaxed">Security cookies help:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Detect suspicious activity</li>
                <li>Prevent unauthorized access</li>
                <li>Protect user accounts</li>
                <li>Support Multi-Factor Authentication</li>
                <li>Maintain platform integrity</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">F. Marketing Cookies (Optional)</h3>
              <p className="text-muted-foreground leading-relaxed">If enabled, these cookies may be used to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Measure advertising performance</li>
                <li>Deliver relevant advertisements</li>
                <li>Track campaign effectiveness</li>
                <li>Remember marketing preferences</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">Marketing cookies are used only with your consent where required by law.</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">4. Third-Party Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Some third-party service providers may place cookies when you use Hizorex. Examples may include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Analytics providers</li>
              <li>Authentication providers</li>
              <li>Payment processors</li>
              <li>Customer support tools</li>
              <li>Video conferencing services</li>
              <li>Embedded content providers</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              These providers manage their own cookies in accordance with their respective privacy policies.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">5. How We Use Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">Cookies may be used to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Authenticate users</li>
              <li>Keep users logged in</li>
              <li>Remember preferences</li>
              <li>Improve website performance</li>
              <li>Detect fraud</li>
              <li>Secure user sessions</li>
              <li>Analyze platform usage</li>
              <li>Improve AI-assisted features</li>
              <li>Enhance user experience</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Cookies are <strong className="text-foreground">not</strong> used to sell your personal information.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">6. AI Services and Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">Some cookies support Hizorex AI features by:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Remembering user preferences</li>
              <li>Maintaining AI session continuity</li>
              <li>Saving AI-generated drafts</li>
              <li>Improving system performance</li>
              <li>Measuring feature usage</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              These cookies do not make hiring decisions or evaluate candidates independently.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">7. Managing Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">You can control cookies through:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Browser settings</li>
              <li>Cookie banner preferences</li>
              <li>Cookie Preferences page</li>
              <li>Device settings</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">Most browsers allow you to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>View cookies</li>
              <li>Delete cookies</li>
              <li>Block cookies</li>
              <li>Disable third-party cookies</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Please note that disabling certain cookies may affect Platform functionality.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">8. Cookie Categories</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 pr-4 text-foreground font-semibold">Cookie Type</th>
                    <th className="py-2 pr-4 text-foreground font-semibold">Required</th>
                    <th className="py-2 text-foreground font-semibold">Can Be Disabled</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b">
                    <td className="py-2 pr-4">Essential</td>
                    <td className="py-2 pr-4">Yes</td>
                    <td className="py-2">No</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">Functional</td>
                    <td className="py-2 pr-4">No</td>
                    <td className="py-2">Yes</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">Analytics</td>
                    <td className="py-2 pr-4">No</td>
                    <td className="py-2">Yes</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">Performance</td>
                    <td className="py-2 pr-4">No</td>
                    <td className="py-2">Yes</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Marketing</td>
                    <td className="py-2 pr-4">No</td>
                    <td className="py-2">Yes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">9. Cookie Retention</h2>
            <p className="text-muted-foreground leading-relaxed">Different cookies remain active for different periods. Examples:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Session cookies expire when your browser closes.</li>
              <li>Persistent cookies remain until they expire or are deleted.</li>
              <li>Authentication cookies are retained only as necessary for secure access.</li>
              <li>Preference cookies remain until updated or removed.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">10. Your Choices</h2>
            <p className="text-muted-foreground leading-relaxed">Depending on your location and applicable law, you may:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Accept all cookies.</li>
              <li>Reject non-essential cookies.</li>
              <li>Customize cookie preferences.</li>
              <li>Withdraw consent for optional cookies at any time.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              You can update your preferences through the Cookie Preferences page available on the Platform.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">11. International Users</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cookie practices may vary depending on applicable privacy laws.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Where required, Hizorex will obtain consent before placing non-essential cookies on your device.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">12. Changes to This Cookie Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Cookie Policy from time to time.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The "Last Updated" date at the top of this policy indicates the latest revision. Material changes will be communicated through the Platform where appropriate.
            </p>
          </section>

          <section className="space-y-4 border-t pt-8">
            <h2 className="text-2xl font-semibold text-foreground">13. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about this Cookie Policy or our use of cookies, please contact:
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Privacy Officer<br />
              Hizorex<br />
              Email: <a href="mailto:hello@hizorex.com" className="text-accent hover:underline">hello@hizorex.com</a>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">14. Related Policies</h2>
            <p className="text-muted-foreground leading-relaxed">This Cookie Policy should be read together with:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><Link to="/privacy" className="text-accent hover:underline">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-accent hover:underline">Terms of Service</Link></li>
              <li>AI Transparency Statement</li>
              <li>Data Retention Policy</li>
              <li>Data Deletion Policy</li>
              <li>Security Overview</li>
              <li>Cookie Preferences</li>
            </ul>
          </section>
        </div>
      </main>
      <FooterV2 />
    </div>
  );
};

export default CookiePolicy;
