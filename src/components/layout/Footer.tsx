import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin } from "lucide-react";

const footerLinks = {
  product: [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Resume Builder", href: "/resume" },
    { name: "Job Discovery", href: "/jobs" },
    { name: "Plans", href: "/plans" },
    { name: "Auto-Apply", href: "/jobs" },
  ],
  company: [
    { name: "About", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Press", href: "#" },
  ],
  legal: [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
    { name: "Cookie Policy", href: "/cookie-policy" },
    { name: "Acceptable Use Policy", href: "/acceptable-use-policy" },
    { name: "Return Policy", href: "/return-policy" },
  ],
};

export const Footer = () => {
  return (
    <footer className="border-t border-white/[0.06] bg-[#080c18] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-violet-600 shadow-md shadow-teal-500/20 group-hover:shadow-teal-500/40 transition-shadow">
                <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <polyline
                    points="2,15 6,9 10,12 15,5"
                    stroke="white" strokeWidth="2.2"
                    strokeLinecap="round" strokeLinejoin="round"
                    opacity="0.95"
                  />
                  <circle cx="15" cy="5" r="2.2" fill="white" />
                </svg>
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white">
                Career
                <span className="bg-gradient-to-r from-teal-400 to-violet-400 bg-clip-text text-transparent">
                  AI
                </span>
              </span>
            </Link>
            <p className="text-sm text-white/60 mb-4">
              AI-powered career intelligence platform. Optimize your employability and accelerate job discovery.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white">
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Product</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-white/50 hover:text-teal-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-white/50 hover:text-teal-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-white/50 hover:text-teal-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} CareerAI. All rights reserved.
          </p>
          <p className="text-sm text-white/40">
            Built with enterprise-grade security and privacy.
          </p>
        </div>
      </div>
    </footer>
  );
};
